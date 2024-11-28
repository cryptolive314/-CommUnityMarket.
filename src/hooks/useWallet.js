import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import EthereumProvider from '@walletconnect/ethereum-provider';
import BlockchainService from '../services/BlockchainService';

export function useWallet() {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [provider, setProvider] = useState(null);
  const [wcProvider, setWcProvider] = useState(null);
  const [error, setError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const SUPPORTED_CHAIN_IDS = [parseInt(process.env.REACT_APP_NETWORK_ID || '19')];
  const projectId = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID;

  const resetWallet = useCallback(() => {
    setAccount(null);
    setChainId(null);
    setProvider(null);
    setWcProvider(null);
    setError(null);
  }, []);

  const validateNetwork = useCallback(async (provider) => {
    const network = await provider.getNetwork();
    if (!SUPPORTED_CHAIN_IDS.includes(network.chainId)) {
      throw new Error(`Please connect to ${process.env.REACT_APP_NETWORK_NAME}`);
    }
    return network.chainId;
  }, [SUPPORTED_CHAIN_IDS]);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Rate limiting
      if (global.localStorage?.getItem('lastConnectionAttempt')) {
        const lastAttempt = parseInt(global.localStorage.getItem('lastConnectionAttempt'));
        if (Date.now() - lastAttempt < 60000) {
          throw new Error('Please wait before attempting to connect again');
        }
      }
      global.localStorage?.setItem('lastConnectionAttempt', Date.now().toString());

      // Initialize WalletConnect provider
      const wcProvider = await EthereumProvider.init({
        projectId,
        chains: SUPPORTED_CHAIN_IDS,
        showQrModal: true,
        methods: ['eth_sendTransaction', 'personal_sign'],
        events: ['chainChanged', 'accountsChanged'],
      });

      // Connect and get accounts
      await wcProvider.connect();
      const accounts = await wcProvider.enable();
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const address = accounts[0];
      if (!ethers.utils.isAddress(address)) {
        throw new Error('Invalid address detected');
      }

      // Initialize ethers provider
      const provider = new ethers.providers.Web3Provider(wcProvider);
      const chainId = await validateNetwork(provider);

      // Verify ownership with signature
      const signer = provider.getSigner();
      const message = `CommUnity Market Authentication\nNonce: ${Date.now()}`;
      const signature = await signer.signMessage(message);
      const recoveredAddress = ethers.utils.verifyMessage(message, signature);
      
      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        throw new Error('Signature verification failed');
      }

      setWcProvider(wcProvider);
      setProvider(provider);
      setAccount(address);
      setChainId(chainId);

      // Initialize BlockchainService with the new provider
      BlockchainService.initialize(wcProvider, address, chainId);
      
      return { provider, address, chainId };
    } catch (error) {
      console.error('Connection error:', error);
      setError(error.message);
      resetWallet();
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [validateNetwork, resetWallet, projectId, SUPPORTED_CHAIN_IDS]);

  const disconnect = useCallback(async () => {
    try {
      if (wcProvider) {
        await wcProvider.disconnect();
      }
    } catch (error) {
      console.error('Disconnect error:', error);
    } finally {
      resetWallet();
    }
  }, [wcProvider, resetWallet]);

  useEffect(() => {
    if (wcProvider) {
      wcProvider.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          resetWallet();
        } else if (account !== accounts[0]) {
          connect();
        }
      });

      wcProvider.on('chainChanged', () => {
        // Reconnect to validate the new chain
        connect();
      });

      wcProvider.on('disconnect', () => {
        resetWallet();
      });

      return () => {
        wcProvider.removeListener('accountsChanged');
        wcProvider.removeListener('chainChanged');
        wcProvider.removeListener('disconnect');
      };
    }
  }, [wcProvider, account, connect, resetWallet]);

  return {
    connect,
    disconnect,
    account,
    chainId,
    provider,
    error,
    isConnecting,
    isConnected: !!account
  };
}
