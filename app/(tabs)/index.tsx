import { StyleSheet } from 'react-native';
import { Text, View } from '../../components/Themed';
import { useWallet } from '../../src/hooks/useWallet';
import { useEffect, useState } from 'react';
import BlockchainService from '../../src/services/BlockchainService';

export default function HomeScreen() {
  const { account, chainId } = useWallet();
  const [marketData, setMarketData] = useState({
    totalProposals: 0,
    activeProposals: 0,
    totalUsers: 0
  });

  useEffect(() => {
    async function fetchMarketData() {
      if (account && chainId) {
        try {
          const data = await BlockchainService.getMarketStats();
          setMarketData(data);
        } catch (error) {
          console.error('Error fetching market data:', error);
        }
      }
    }

    fetchMarketData();
  }, [account, chainId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to CommUnityMarket</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{marketData.totalProposals}</Text>
          <Text style={styles.statLabel}>Total Proposals</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{marketData.activeProposals}</Text>
          <Text style={styles.statLabel}>Active Proposals</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{marketData.totalUsers}</Text>
          <Text style={styles.statLabel}>Community Members</Text>
        </View>
      </View>

      {!account && (
        <View style={styles.connectPrompt}>
          <Text style={styles.promptText}>
            Connect your wallet to participate in the community
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
  },
  statBox: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 100,
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
  },
  connectPrompt: {
    backgroundColor: '#e3f2fd',
    padding: 20,
    borderRadius: 10,
    marginTop: 30,
    width: '100%',
  },
  promptText: {
    textAlign: 'center',
    color: '#1976d2',
    fontSize: 16,
  },
});
