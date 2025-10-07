import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react-native';
import axios from 'axios';
import { BarChart } from 'react-native-chart-kit';

export default function PredictionScreen() {
  const [selectedTemple, setSelectedTemple] = useState<string>('kedarnath'); 
  const [loadingNextDay, setLoadingNextDay] = useState<boolean>(true);
  const [nextDayPrediction, setNextDayPrediction] = useState<number | null>(null);
  const [crowdLevel, setCrowdLevel] = useState<string | null>(null);
  const [confidenceInterval, setConfidenceInterval] = useState<{ lower: number; upper: number } | null>(null);
  const [hourlyData, setHourlyData] = useState<number[]>([]);

  const BACKEND_URL = 'http://172.20.45.229:5000'; // replace with your backend IP
  const templeId = 'kedarnath';

  const payload = {
    month: 6,
    day_of_week: 5,
    week_of_year: 24,
    yatra_season: 1,
    temperature_avg: 25,
    humidity: 65,
    rainfall: 0,
    weather_condition: "Clear",
    temple_open_status: "Open",
    road_condition: "Good",
    is_weekend: 1,
    is_holiday: 0,
    is_festival: 0,
    school_vacation: 1,
    google_trends_score: 75,
    hotel_occupancy_rate: 80,
    bus_bookings: 150,
    days_to_next_festival: 10
  };

  const fetchNextDayPrediction = async () => {
    try {
      setLoadingNextDay(true);
      const res = await axios.post(`${BACKEND_URL}/api/prediction/next-day/${templeId}`, payload);

      // Extract main values
      setNextDayPrediction(res.data.predicted_visitors ?? 0);
      setCrowdLevel(res.data.crowd_level ?? 'N/A');
      setConfidenceInterval(res.data.confidence_interval ?? null);

      // For demonstration, generate hourly distribution based on predicted_visitors
      const total = res.data.predicted_visitors ?? 0;
      const hours = Array.from({ length: 24 }, (_, i) =>
        Math.round(total * Math.sin((i + 1) / 24 * Math.PI) + Math.random() * 50)
      );
      setHourlyData(hours);
    } catch (err) {
      console.error('Next day prediction error:', err);
      setNextDayPrediction(null);
      setCrowdLevel(null);
      setConfidenceInterval(null);
      setHourlyData([]);
    } finally {
      setLoadingNextDay(false);
    }
  };

  useEffect(() => {
    fetchNextDayPrediction();
  }, [selectedTemple]);

  // Static real-time crowd
  const staticRealtimePrediction = 1039;

  const screenWidth = Dimensions.get('window').width - 40; // padding

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Crowd Predictions</Text>
        </View>

        {/* Next Day Prediction */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={24} color="#FF6B35" />
            <Text style={styles.sectionTitle}>Next Day Prediction</Text>
          </View>

          {loadingNextDay ? (
            <ActivityIndicator size="large" color="#FF6B35" />
          ) : (
            <>
              <View style={styles.predictionCard}>
                <Text style={styles.predictionValue}>
                  {nextDayPrediction !== null ? `${nextDayPrediction} people` : 'N/A'}
                </Text>
                {crowdLevel && <Text style={styles.predictionLabel}>Level: {crowdLevel}</Text>}
                {confidenceInterval && (
                  <Text style={styles.predictionLabel}>
                    Confidence: {confidenceInterval.lower} - {confidenceInterval.upper}
                  </Text>
                )}
                <Text style={styles.predictionLabel}>Expected visitors tomorrow</Text>
              </View>

              {/* Hourly Crowd Bar Chart */}
              {hourlyData.length > 0 && (
                <BarChart
                  data={{
                    labels: Array.from({ length: 24 }, (_, i) => `${i}`),
                    datasets: [{ data: hourlyData }],
                  }}
                  width={screenWidth}
                  height={220}
                  yAxisLabel=""
                  chartConfig={{
                    backgroundGradientFrom: "#fff",
                    backgroundGradientTo: "#fff",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(255,107,53, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0,0,0, ${opacity})`,
                  }}
                  verticalLabelRotation={-45}
                  fromZero
                  style={{ marginTop: 16, borderRadius: 12 }}
                />
              )}
            </>
          )}
        </View>

        {/* Static Real-time Prediction */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Current Crowd</Text>
          </View>

          <View style={styles.predictionCard}>
            <Text style={styles.predictionValue}>{staticRealtimePrediction} people</Text>
            <Text style={styles.predictionLabel}>Current crowd in temple</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollView: { flex: 1 },
  header: { padding: 24, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 28, fontWeight: '700', color: '#1a1a1a' },
  section: { padding: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  predictionCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  predictionValue: { fontSize: 32, fontWeight: '700', color: '#FF6B35', marginBottom: 8 },
  predictionLabel: { fontSize: 16, color: '#666' },
});
