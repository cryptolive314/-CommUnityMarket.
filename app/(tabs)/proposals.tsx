import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, View } from '../../components/Themed';
import { useWallet } from '../../src/hooks/useWallet';
import { useEffect, useState } from 'react';
import BlockchainService from '../../src/services/BlockchainService';

interface Proposal {
  id: string;
  title: string;
  status: string;
  amount: string;
  expiry: number;
}

export default function ProposalsScreen() {
  const { account, chainId } = useWallet();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProposals() {
      if (account && chainId) {
        try {
          const contractState = await BlockchainService.getContractState();
          // For now, we'll create a mock proposal using the contract state
          const mockProposal = {
            id: '1',
            title: 'Current Escrow',
            status: contractState.isReleased ? 'Completed' : 'Active',
            amount: contractState.amount,
            expiry: contractState.expiry
          };
          setProposals([mockProposal]);
        } catch (error) {
          console.error('Error fetching proposals:', error);
        } finally {
          setLoading(false);
        }
      }
    }

    fetchProposals();
  }, [account, chainId]);

  if (!account) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Connect Wallet</Text>
        <Text style={styles.description}>
          Please connect your wallet to view proposals
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading proposals...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Active Proposals</Text>
      {proposals.map((proposal) => (
        <TouchableOpacity
          key={proposal.id}
          style={styles.proposalCard}
          onPress={() => {/* Navigate to proposal details */}}
        >
          <Text style={styles.proposalTitle}>{proposal.title}</Text>
          <View style={styles.proposalDetails}>
            <Text>Amount: {proposal.amount} SGB</Text>
            <Text>Status: {proposal.status}</Text>
            <Text>Expires: {new Date(proposal.expiry * 1000).toLocaleDateString()}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  proposalCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  proposalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  proposalDetails: {
    gap: 5,
  },
});
