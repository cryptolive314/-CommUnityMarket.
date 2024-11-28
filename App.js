import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useWallet } from './src/hooks/useWallet';
import BlockchainService from './src/services/BlockchainService';

export default function App() {
  const { connect, disconnect, account, chainId, error } = useWallet();

  useEffect(() => {
    // Initialize blockchain service with wallet connection
    if (account && chainId) {
      BlockchainService.initialize(account, chainId);
    }
  }, [account, chainId]);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f5f5f5',
          },
          headerTintColor: '#000',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'CommUnityMarket',
            headerRight: () => (
              <WalletButton
                onConnect={connect}
                onDisconnect={disconnect}
                account={account}
                error={error}
              />
            ),
          }}
        />
        <Stack.Screen
          name="proposal"
          options={{
            title: 'Proposal Details',
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            title: 'User Profile',
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}

const WalletButton = ({ onConnect, onDisconnect, account, error }) => {
  if (error) {
    return (
      <TouchableOpacity
        style={[styles.button, styles.errorButton]}
        onPress={onConnect}
      >
        <Text style={styles.buttonText}>Retry Connection</Text>
      </TouchableOpacity>
    );
  }

  if (account) {
    return (
      <TouchableOpacity style={styles.button} onPress={onDisconnect}>
        <Text style={styles.buttonText}>
          {account.slice(0, 6)}...{account.slice(-4)}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.button} onPress={onConnect}>
      <Text style={styles.buttonText}>Connect Wallet</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  errorButton: {
    backgroundColor: '#d32f2f',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});
