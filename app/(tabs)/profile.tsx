import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '../../components/Themed';
import { useWallet } from '../../src/hooks/useWallet';
import { useEffect, useState } from 'react';
import BlockchainService from '../../src/services/BlockchainService';

interface UserStats {
  totalTransactions: number;
  activeEscrows: number;
  completedEscrows: number;
}

interface WalletContextType {
  account: string | null;
  chainId: number | null;
  disconnect: () => void;
}

export default function ProfileScreen() {
  const { account, chainId, disconnect } = useWallet() as WalletContextType;
  const [userStats, setUserStats] = useState<UserStats>({
    totalTransactions: 0,
    activeEscrows: 0,
    completedEscrows: 0
  });

  useEffect(() => {
    async function fetchUserStats() {
      if (account && chainId) {
        try {
          const contractState = await BlockchainService.getContractState();
          // For now, we'll use mock data
          setUserStats({
            totalTransactions: 1,
            activeEscrows: contractState.isReleased ? 0 : 1,
            completedEscrows: contractState.isReleased ? 1 : 0
          });
        } catch (error) {
          console.error('Error fetching user stats:', error);
        }
      }
    }

    fetchUserStats();
  }, [account, chainId]);

  if (!account) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Connect Wallet</Text>
        <Text style={styles.description}>
          Please connect your wallet to view your profile
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.address}>
          {account.slice(0, 6)}...{account.slice(-4)}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{userStats.totalTransactions}</Text>
          <Text style={styles.statLabel}>Total Transactions</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{userStats.activeEscrows}</Text>
          <Text style={styles.statLabel}>Active Escrows</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{userStats.completedEscrows}</Text>
          <Text style={styles.statLabel}>Completed Escrows</Text>
        </View>
      </View>

      <View style={styles.networkInfo}>
        <Text style={styles.networkLabel}>Network</Text>
        <Text style={styles.networkValue}>{process.env.REACT_APP_NETWORK_NAME}</Text>
      </View>

      <TouchableOpacity style={styles.disconnectButton} onPress={disconnect}>
        <Text style={styles.disconnectText}>Disconnect Wallet</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  address: {
    fontSize: 16,
    color: '#1976d2',
    fontFamily: 'SpaceMono-Regular',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  networkInfo: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  networkLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  networkValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  disconnectButton: {
    backgroundColor: '#d32f2f',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  disconnectText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
