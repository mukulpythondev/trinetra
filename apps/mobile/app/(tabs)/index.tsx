// app/(tabs)/index.tsx
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../(auth)/AuthContext';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const quickActions = [
    { title: 'Book Darshan', icon: 'book-online', route: '/booking', color: '#FF6B35' },
    { title: 'Queue Status', icon: 'people', route: '/queue', color: '#4CAF50' },
    { title: 'My Bookings', icon: 'event', route: '/darshan', color: '#2196F3' },
    { title: 'Donate', icon: 'volunteer-activism', route: '/donate', color: '#9C27B0' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Welcome Section */}
      <View style={styles.welcomeCard}>
        <Text style={styles.greeting}>🙏 Namaste</Text>
        <Text style={styles.userName}>{user?.name || 'Devotee'}</Text>
        <Text style={styles.welcomeText}>Welcome to Temple Darshan</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.actionCard, { borderLeftColor: action.color }]}
              onPress={() => router.push(action.route as any)}
            >
              <MaterialIcons name={action.icon as any} size={32} color={action.color} />
              <Text style={styles.actionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Temple Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Temple Locations</Text>
        
        {/* Active Temple */}
        <TouchableOpacity style={styles.templeCard}>
          <MaterialIcons name="temple-hindu" size={24} color="#FF6B35" />
          <View style={styles.templeInfo}>
            <Text style={styles.templeName}>Kedarnath</Text>
            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.activeText}>Active</Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#FF6B35" />
        </TouchableOpacity>

        {/* Coming Soon Banner */}
        <View style={styles.comingSoonBanner}>
          <MaterialIcons name="schedule" size={20} color="#666" />
          <Text style={styles.comingSoonText}>
            More temples coming soon! Stay tuned for Somnath, Dwarka, Ambaji, and Pavagadh.
          </Text>
        </View>
      </View>

      {/* Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Features</Text>
        <View style={styles.featureCard}>
          <FontAwesome5 name="clock" size={20} color="#FF6B35" />
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Real-time Queue Updates</Text>
            <Text style={styles.featureDesc}>Check current wait times</Text>
          </View>
        </View>
        <View style={styles.featureCard}>
          <FontAwesome5 name="mobile-alt" size={20} color="#FF6B35" />
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Digital Booking</Text>
            <Text style={styles.featureDesc}>Skip the line with e-tickets</Text>
          </View>
        </View>
        <View style={styles.featureCard}>
          <FontAwesome5 name="bell" size={20} color="#FF6B35" />
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>SOS Alerts</Text>
            <Text style={styles.featureDesc}>Emergency assistance available</Text>
          </View>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  welcomeCard: {
    backgroundColor: '#FF6B35',
    padding: 24,
    margin: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  greeting: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionTitle: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  templeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  templeName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  templeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  activeText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  comingSoonBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  comingSoonText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    lineHeight: 20,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  featureContent: {
    flex: 1,
    marginLeft: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
    color: '#666',
  },
});