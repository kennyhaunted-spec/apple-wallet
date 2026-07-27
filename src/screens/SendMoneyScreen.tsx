import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useWalletStore } from '@/store/useWalletStore';
import { formatCurrency } from '@/utils/formatters';

type RootStackParamList = {
  CardDetail: { cardId: string };
  SendMoney: { cardId: string };
};

type SendMoneyRouteProp = RouteProp<RootStackParamList, 'SendMoney'>;
type SendMoneyNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SendMoney'>;

const SendMoneyScreen: React.FC = () => {
  const navigation = useNavigation<SendMoneyNavigationProp>();
  const route = useRoute<SendMoneyRouteProp>();
  const { cardId } = route.params;

  const card = useWalletStore((state) => state.getCardById(cardId));
  const updateCardBalance = useWalletStore((state) => state.updateCardBalance);
  const addTransaction = useWalletStore((state) => state.addTransaction);

  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [note, setNote] = useState('');
  const [isRequest, setIsRequest] = useState(false);

  if (!card) return null;

  const handleSend = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!isRequest && numAmount > card.balance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    if (!recipient.trim()) {
      Alert.alert('Error', 'Please enter recipient name');
      return;
    }

    const multiplier = isRequest ? 1 : -1;
    updateCardBalance(cardId, numAmount * multiplier);

    addTransaction({
      cardId,
      type: isRequest ? 'income' : 'expense',
      amount: numAmount,
      currency: card.currency,
      description: note || (isRequest ? 'Tap to Cash Request' : 'Tap to Cash Sent'),
      merchantName: recipient,
      category: 'transfer',
      status: 'completed',
      isRecurring: false,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{isRequest ? 'Request' : 'Send'}</Text>
          <TouchableOpacity onPress={handleSend}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>

        {/* Amount Input */}
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0"
            placeholderTextColor="#8E8E93"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            autoFocus
          />
        </View>

        <Text style={styles.balanceText}>
          Current Balance: {formatCurrency(card.balance, card.currency)}
        </Text>

        {/* Toggle Send/Request */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, !isRequest && styles.toggleButtonActive]}
            onPress={() => setIsRequest(false)}
          >
            <Text style={[styles.toggleText, !isRequest && styles.toggleTextActive]}>
              Send
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, isRequest && styles.toggleButtonActive]}
            onPress={() => setIsRequest(true)}
          >
            <Text style={[styles.toggleText, isRequest && styles.toggleTextActive]}>
              Request
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recipient */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>To</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter name or phone number"
            placeholderTextColor="#8E8E93"
            value={recipient}
            onChangeText={setRecipient}
          />
        </View>

        {/* Note */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Note</Text>
          <TextInput
            style={styles.input}
            placeholder="What's it for?"
            placeholderTextColor="#8E8E93"
            value={note}
            onChangeText={setNote}
          />
        </View>

        {/* Apple Pay Style Confirmation */}
        <View style={styles.confirmContainer}>
          <View style={styles.applePayHeader}>
            <Text style={styles.applePayText}>🍎 Pay</Text>
          </View>
          <View style={styles.paymentMethod}>
            <Text style={styles.paymentMethodText}>{card.displayName}</Text>
            <Text style={styles.paymentMethodDetail}>•••• {card.lastFour}</Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>{isRequest ? 'Request' : 'Pay'}</Text>
            <Text style={styles.amountValue}>
              {amount ? formatCurrency(parseFloat(amount) || 0, card.currency) : '$0.00'}
            </Text>
          </View>
          <TouchableOpacity style={styles.confirmButton} onPress={handleSend}>
            <Text style={styles.confirmButtonText}>
              {isRequest ? 'Request' : 'Confirm with Side Button'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  cancelButton: {
    color: '#0A84FF',
    fontSize: 17,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  sendButtonText: {
    color: '#0A84FF',
    fontSize: 17,
    fontWeight: '600',
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  currencySymbol: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '300',
    marginRight: 4,
  },
  amountInput: {
    color: '#FFFFFF',
    fontSize: 64,
    fontWeight: '300',
    minWidth: 150,
    textAlign: 'center',
  },
  balanceText: {
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 15,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
    marginHorizontal: 20,
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#636366',
  },
  toggleText: {
    color: '#8E8E93',
    fontSize: 15,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  inputContainer: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  inputLabel: {
    color: '#8E8E93',
    fontSize: 13,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1C1C1E',
    color: '#FFFFFF',
    fontSize: 17,
    padding: 14,
    borderRadius: 10,
  },
  confirmContainer: {
    marginHorizontal: 20,
    marginTop: 30,
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    overflow: 'hidden',
  },
  applePayHeader: {
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#2C2C2E',
  },
  applePayText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#2C2C2E',
  },
  paymentMethodText: {
    color: '#FFFFFF',
    fontSize: 17,
  },
  paymentMethodDetail: {
    color: '#8E8E93',
    fontSize: 17,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  amountLabel: {
    color: '#8E8E93',
    fontSize: 17,
  },
  amountValue: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#0A84FF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default SendMoneyScreen;
