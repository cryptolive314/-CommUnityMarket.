import { ethers } from 'ethers';
import escrowAbi from '../contracts/Escrow.json';

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.escrowContract = null;
    this.account = null;
    this.chainId = null;
    this.ESCROW_ADDRESS = process.env.REACT_APP_ESCROW_CONTRACT;
    this.REQUIRED_CONFIRMATIONS = parseInt(process.env.REACT_APP_MIN_CONFIRMATION_BLOCKS || '3');
    this.TRANSACTION_TIMEOUT = parseInt(process.env.REACT_APP_TRANSACTION_TIMEOUT || '30000');
    this.RPC_URL = process.env.REACT_APP_RPC_URL;
  }

  initialize(provider, account, chainId) {
    if (provider) {
      this.provider = new ethers.providers.Web3Provider(provider);
      this.signer = this.provider.getSigner();
      this.account = account;
      this.chainId = chainId;
      this.escrowContract = new ethers.Contract(
        this.ESCROW_ADDRESS,
        escrowAbi,
        this.signer
      );
    } else {
      // Fallback to RPC provider for read-only operations
      this.provider = new ethers.providers.JsonRpcProvider(this.RPC_URL);
      this.escrowContract = new ethers.Contract(
        this.ESCROW_ADDRESS,
        escrowAbi,
        this.provider
      );
    }
  }

  async getMarketStats() {
    try {
      if (!this.escrowContract) {
        throw new Error('Contract not initialized');
      }

      // Get total proposals
      const totalProposals = await this.escrowContract.getTotalProposals();
      
      // Get active proposals
      const activeProposals = await this.escrowContract.getActiveProposals();
      
      // Get total users
      const totalUsers = await this.escrowContract.getTotalUsers();

      return {
        totalProposals: totalProposals.toNumber(),
        activeProposals: activeProposals.toNumber(),
        totalUsers: totalUsers.toNumber()
      };
    } catch (error) {
      console.error('Error fetching market stats:', error);
      return {
        totalProposals: 0,
        activeProposals: 0,
        totalUsers: 0
      };
    }
  }

  async approve() {
    try {
      if (!this.escrowContract || !this.signer) {
        throw new Error('Contract not initialized or wallet not connected');
      }

      // Estimate gas
      const gasEstimate = await this.escrowContract.estimateGas.approve();
      
      // Execute transaction
      const tx = await this.escrowContract.approve({
        gasLimit: Math.ceil(gasEstimate.toNumber() * 1.2) // Add 20% buffer
      });

      // Wait for confirmations with timeout
      const receipt = await Promise.race([
        tx.wait(this.REQUIRED_CONFIRMATIONS),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Transaction timeout')), this.TRANSACTION_TIMEOUT)
        )
      ]);

      if (!receipt.status) {
        throw new Error('Transaction failed');
      }

      return receipt;
    } catch (error) {
      console.error('Approval error:', error);
      throw error;
    }
  }

  async release() {
    try {
      if (!this.escrowContract || !this.signer) {
        throw new Error('Contract not initialized or wallet not connected');
      }

      const gasEstimate = await this.escrowContract.estimateGas.release();
      
      const tx = await this.escrowContract.release({
        gasLimit: Math.ceil(gasEstimate.toNumber() * 1.2)
      });

      const receipt = await Promise.race([
        tx.wait(this.REQUIRED_CONFIRMATIONS),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Transaction timeout')), this.TRANSACTION_TIMEOUT)
        )
      ]);

      if (!receipt.status) {
        throw new Error('Transaction failed');
      }

      return receipt;
    } catch (error) {
      console.error('Release error:', error);
      throw error;
    }
  }

  async refund() {
    try {
      if (!this.escrowContract || !this.signer) {
        throw new Error('Contract not initialized or wallet not connected');
      }

      const gasEstimate = await this.escrowContract.estimateGas.refund();
      
      const tx = await this.escrowContract.refund({
        gasLimit: Math.ceil(gasEstimate.toNumber() * 1.2)
      });

      const receipt = await Promise.race([
        tx.wait(this.REQUIRED_CONFIRMATIONS),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Transaction timeout')), this.TRANSACTION_TIMEOUT)
        )
      ]);

      if (!receipt.status) {
        throw new Error('Transaction failed');
      }

      return receipt;
    } catch (error) {
      console.error('Refund error:', error);
      throw error;
    }
  }

  async getContractState() {
    try {
      if (!this.escrowContract) {
        throw new Error('Contract not initialized');
      }

      const [amount, expiry, isReleased, arbiter, payee, payer] = await Promise.all([
        this.escrowContract.amount(),
        this.escrowContract.expiry(),
        this.escrowContract.isReleased(),
        this.escrowContract.arbiter(),
        this.escrowContract.payee(),
        this.escrowContract.payer()
      ]);

      return {
        amount: ethers.utils.formatEther(amount),
        expiry: expiry.toNumber(),
        isReleased,
        arbiter,
        payee,
        payer
      };
    } catch (error) {
      console.error('Error fetching contract state:', error);
      throw error;
    }
  }

  async validateNetwork() {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const network = await this.provider.getNetwork();
    const expectedNetworkId = parseInt(process.env.REACT_APP_NETWORK_ID);

    if (network.chainId !== expectedNetworkId) {
      throw new Error(`Please connect to ${process.env.REACT_APP_NETWORK_NAME}`);
    }

    return true;
  }
}

export default new BlockchainService();
