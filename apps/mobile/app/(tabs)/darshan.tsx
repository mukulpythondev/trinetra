import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react-native';

import { WebView } from 'react-native-webview';

export default function VirtualDarshanScreen() {
 
  const [selectedTemple, setSelectedTemple] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

 

  const livestreamUrl = 'https://www.youtube.com/embed/live_stream?channel=UCxR2bPli6AEr0BVIgER-paQ&autoplay=0';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Virtual Darshan</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.label}>Select Temple</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
            {/* {temples.map((temple) => (
              <TouchableOpacity
                key={temple.id}
                style={[
                  styles.chip,
                  selectedTemple === temple.id && styles.chipSelected,
                ]}
                onPress={() => setSelectedTemple(temple.id)}>
                <Text
                  style={[
                    styles.chipText,
                    selectedTemple === temple.id && styles.chipTextSelected,
                  ]}>
                  {temple.name}
                </Text>
              </TouchableOpacity>
            ))} */}
          </ScrollView>
        </View>

        <View style={styles.videoContainer}>
          <View style={styles.videoPlaceholder}>
            <Play size={64} color="#FF6B35" />
            <Text style={styles.videoPlaceholderText}>Live Stream</Text>
            <Text style={styles.videoPlaceholderSubtext}>
              Experience darshan from anywhere
            </Text>
          </View>

          <View style={styles.videoControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? (
                <Pause size={24} color="#fff" />
              ) : (
                <Play size={24} color="#fff" />
              )}
            </TouchableOpacity>

            <View style={styles.timeDisplay}>
              <Text style={styles.timeText}>LIVE</Text>
            </View>

            <View style={styles.rightControls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => setIsMuted(!isMuted)}>
                {isMuted ? (
                  <VolumeX size={20} color="#fff" />
                ) : (
                  <Volume2 size={20} color="#fff" />
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.controlButton}>
                <Maximize size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>About Virtual Darshan</Text>
          <Text style={styles.infoText}>
            Experience the divine presence from the comfort of your home. Our live streaming
            service brings you real-time darshan with high-quality video and audio.
          </Text>
        </View>

        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>Features</Text>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Play size={20} color="#FF6B35" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Live Streaming</Text>
              <Text style={styles.featureText}>
                Watch live darshan ceremonies in real-time
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Volume2 size={20} color="#FF6B35" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>High Quality Audio</Text>
              <Text style={styles.featureText}>
                Listen to mantras and prayers with crystal clear sound
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Maximize size={20} color="#FF6B35" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Full Screen Mode</Text>
              <Text style={styles.featureText}>
                Immerse yourself in the divine experience
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.scheduleCard}>
          <Text style={styles.scheduleTitle}>Live Stream Schedule</Text>

          <View style={styles.scheduleItem}>
            <Text style={styles.scheduleTime}>06:00 AM - 07:30 AM</Text>
            <Text style={styles.scheduleEvent}>Morning Aarti</Text>
          </View>

          <View style={styles.scheduleItem}>
            <Text style={styles.scheduleTime}>12:00 PM - 01:00 PM</Text>
            <Text style={styles.scheduleEvent}>Afternoon Darshan</Text>
          </View>

          <View style={styles.scheduleItem}>
            <Text style={styles.scheduleTime}>06:00 PM - 08:00 PM</Text>
            <Text style={styles.scheduleEvent}>Evening Aarti</Text>
          </View>
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
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
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
  videoContainer: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  videoPlaceholder: {
    width: '100%',
    height: 220,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  videoPlaceholderText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  videoPlaceholderSubtext: {
    fontSize: 14,
    color: '#999',
  },
  videoControls: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  controlButton: {
    padding: 8,
  },
  timeDisplay: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 12,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  rightControls: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 4,
  },
  infoCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  featuresCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff9f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  scheduleCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  scheduleTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
  },
  scheduleEvent: {
    fontSize: 14,
    color: '#666',
  },
});
