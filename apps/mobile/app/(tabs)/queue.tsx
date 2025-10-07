import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Clock, Users, AlertCircle, RefreshCw } from 'lucide-react-native';
import axios from 'axios';

export default function QueueScreen() {
  const [selectedTemple, setSelectedTemple] = useState<string>('kedarnath'); 
  const [loading, setLoading] = useState(false);
  const [queueData, setQueueData] = useState<any[]>([]);

  const temples = [
    { id: 'kedarnath', name: 'Kedarnath' },
  ];

  const BACKEND_URL = 'http://172.20.45.229:5000'; // updated API path

  const fetchQueue = async (templeId: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/queue/temple/${templeId}`);
      if (res.data.success) {
        setQueueData(res.data.slots || []);
      }
    } catch (err) {
      console.error('Fetch queue error:', err);
      setQueueData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue(selectedTemple);
  }, [selectedTemple]);

  const handleRefresh = () => {
    fetchQueue(selectedTemple);
  };

  const getStatusColor = (slot: any) => {
    if (slot.booked_count >= slot.max_capacity) return '#f59e0b'; // full
    return '#16a34a'; // open
  };

  const getStatusText = (slot: any) => {
    if (slot.booked_count >= slot.max_capacity) return 'FULL';
    return 'OPEN';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Queue Status</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <RefreshCw size={20} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.label}>Select Temple</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
            {temples.map((temple) => (
              <TouchableOpacity
                key={temple.id}
                style={[styles.chip, selectedTemple === temple.id && styles.chipSelected]}
                onPress={() => setSelectedTemple(temple.id)}
              >
                <Text style={[styles.chipText, selectedTemple === temple.id && styles.chipTextSelected]}>
                  {temple.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B35" />
          </View>
        )}

        {!loading && queueData.length === 0 && (
          <View style={styles.emptyState}>
            <AlertCircle size={48} color="#ccc" />
            <Text style={styles.emptyText}>No queue data available</Text>
            <Text style={styles.emptySubtext}>Please check back later</Text>
          </View>
        )}

        {!loading && queueData.length > 0 && (
          <View style={styles.section}>
            {queueData.map((slot: any) => (
              <View key={slot._id} style={styles.queueCard}>
                <View style={styles.queueHeader}>
                  <Text style={styles.gateName}>
                    {slot.templeId} - {slot.start_time} to {slot.end_time}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(slot) }]}>
                    <Text style={styles.statusText}>{getStatusText(slot)}</Text>
                  </View>
                </View>

                <View style={styles.queueStats}>
                  <View style={styles.statItem}>
                    <Clock size={24} color="#FF6B35" />
                    <View style={styles.statContent}>
                      <Text style={styles.statValue}>{slot.booked_count}/{slot.max_capacity}</Text>
                      <Text style={styles.statLabel}>Booked</Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.lastUpdated}>
                  Last updated: {new Date(slot.updatedAt).toLocaleTimeString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.infoBox}>
          <AlertCircle size={20} color="#0284c7" />
          <Text style={styles.infoText}>
            Queue status updates every 30 seconds. Tap refresh icon for immediate update.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  refreshButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#eee',
  },
  chipSelected: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  chipTextSelected: {
    color: '#fff',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyState: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  queueCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  queueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  gateName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  queueStats: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statContent: {
    gap: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  infoBox: {
    backgroundColor: '#e0f2fe',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#0c4a6e',
    lineHeight: 20,
  },
});
