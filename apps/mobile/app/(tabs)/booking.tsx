import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, ScrollView } from 'react-native';
import axios from 'axios';

export default function Booking() {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookedSlot, setBookedSlot] = useState<string | null>(null);

  const API_URL = 'http://172.20.45.229:5000/api/queue'; // Use your backend IP

  // Fetch available slots for Kedarnath temple
  const fetchSlots = async () => {
    try {
      const res = await axios.get(`${API_URL}/temple/kedarnath`);
      setSlots(res.data.slots);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Book slot
const handleBooking = async (slotId: string) => {
  try {
    const res = await axios.post(`http://172.20.45.229:5000/api/queue/${slotId}/add`);
    Alert.alert('Success', res.data.message || 'Booking confirmed');
    setBookedSlot(slotId);
    fetchSlots(); // refresh slots
  } catch (err: any) {
    Alert.alert('Error', err.response?.data?.message || 'Booking failed');
  }
};

// Cancel booking
const handleCancel = async (slotId: string) => {
  try {
    const res = await axios.post(`http://172.20.45.229:5000/api/queue/${slotId}/remove`);
    Alert.alert('Cancelled', res.data.message || 'Booking cancelled');
    setBookedSlot(null);
    fetchSlots(); // refresh slots
  } catch (err: any) {
    Alert.alert('Error', err.response?.data?.message || 'Cancel failed');
  }
};


  useEffect(() => {
    fetchSlots();
  }, []);

  if (loading) return <Text>Loading slots...</Text>;

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>
        Kedarnath Slots
      </Text>

      {slots.length === 0 && <Text>No slots available</Text>}

      {slots.map((slot) => (
        <View
          key={slot._id}
          style={{ marginBottom: 15, padding: 15, borderWidth: 1, borderRadius: 10 }}
        >
          <Text>Time: {slot.slotTime}</Text>
          <Text>Capacity: {slot.max_capacity}</Text>
          <Text>Booked: {slot.booked_count}</Text>

          {bookedSlot === slot.id ? (
            <Button title="Cancel Booking" color="red" onPress={() => handleCancel(slot.slotId)} />
          ) : (
            <Button
              title="Book Slot"
              onPress={() => handleBooking(slot.slotId)}
              disabled={bookedSlot !== null} // prevent multiple bookings
            />
          )}
        </View>
      ))}
    </ScrollView>
  );
}
