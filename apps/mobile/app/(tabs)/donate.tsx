import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Heart, CreditCard, Smartphone, Building2, CircleCheck as CheckCircle } from 'lucide-react-native';


const PRESET_AMOUNTS = [100, 250, 500, 1000, 2500, 5000];

export default function DonateScreen() {
  const [selectedTemple, setSelectedTemple] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donationSuccess, setDonationSuccess] = useState(false);

  

 

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Make a Donation</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {donationSuccess && (
          <View style={styles.successBanner}>
            <CheckCircle size={24} color="#fff" />
            <Text style={styles.successText}>Thank you for your donation!</Text>
          </View>
        )}

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

        <View style={styles.section}>
          <Text style={styles.label}>Select Amount</Text>
          <View style={styles.amountGrid}>
            {PRESET_AMOUNTS.map((presetAmount) => (
              <TouchableOpacity
                key={presetAmount}
                style={[
                  styles.amountCard,
                  amount === presetAmount.toString() && styles.amountCardSelected,
                ]}
                onPress={() => {
                  setAmount(presetAmount.toString());
                  setCustomAmount('');
                }}>
                <Text
                  style={[
                    styles.amountText,
                    amount === presetAmount.toString() && styles.amountTextSelected,
                  ]}>
                  ₹{presetAmount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.customAmountContainer}>
            <Text style={styles.customAmountLabel}>Or enter custom amount</Text>
            <View style={styles.customAmountInput}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.customAmountText}
                value={customAmount}
                onChangeText={(text) => {
                  setCustomAmount(text);
                  setAmount('');
                }}
                keyboardType="number-pad"
                placeholder="0"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Payment Method</Text>
          <View style={styles.paymentMethodsContainer}>
            <TouchableOpacity
              style={[
                styles.paymentMethod,
                paymentMethod === 'upi' && styles.paymentMethodSelected,
              ]}
              onPress={() => setPaymentMethod('upi')}>
              <Smartphone
                size={24}
                color={paymentMethod === 'upi' ? '#fff' : '#FF6B35'}
              />
              <Text
                style={[
                  styles.paymentMethodText,
                  paymentMethod === 'upi' && styles.paymentMethodTextSelected,
                ]}>
                UPI
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentMethod,
                paymentMethod === 'card' && styles.paymentMethodSelected,
              ]}
              onPress={() => setPaymentMethod('card')}>
              <CreditCard
                size={24}
                color={paymentMethod === 'card' ? '#fff' : '#FF6B35'}
              />
              <Text
                style={[
                  styles.paymentMethodText,
                  paymentMethod === 'card' && styles.paymentMethodTextSelected,
                ]}>
                Card
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentMethod,
                paymentMethod === 'netbanking' && styles.paymentMethodSelected,
              ]}
              onPress={() => setPaymentMethod('netbanking')}>
              <Building2
                size={24}
                color={paymentMethod === 'netbanking' ? '#fff' : '#FF6B35'}
              />
              <Text
                style={[
                  styles.paymentMethodText,
                  paymentMethod === 'netbanking' && styles.paymentMethodTextSelected,
                ]}>
                Banking
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Your Details</Text>
          <TextInput
            style={styles.input}
            value={donorName}
            onChangeText={setDonorName}
            placeholder="Full Name"
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            value={donorEmail}
            onChangeText={setDonorEmail}
            placeholder="Email (optional)"
            placeholderTextColor="#999"
            keyboardType="email-address"
          />
        </View>

        <TouchableOpacity style={styles.donateButton}>
          <Heart size={20} color="#fff" />
          <Text style={styles.donateButtonText}>
            Donate ₹{amount || customAmount || '0'}
          </Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Your donation is secure and will be directly credited to the temple. You will
            receive a confirmation email after the transaction.
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
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  scrollView: {
    flex: 1,
  },
  successBanner: {
    backgroundColor: '#16a34a',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  successText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amountCard: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '31%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#eee',
  },
  amountCardSelected: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  amountText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  amountTextSelected: {
    color: '#fff',
  },
  customAmountContainer: {
    marginTop: 20,
  },
  customAmountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  customAmountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#eee',
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginRight: 8,
  },
  customAmountText: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  paymentMethodsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentMethod: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#eee',
  },
  paymentMethodSelected: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  paymentMethodText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  paymentMethodTextSelected: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  donateButton: {
    backgroundColor: '#FF6B35',
    margin: 16,
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  donateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  infoBox: {
    backgroundColor: '#e0f2fe',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#0c4a6e',
    lineHeight: 20,
  },
});
