import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useWalletStore } from '@/store/useWalletStore';
import { cardPresets, CardPreset } from '@/utils/cardPresets';
import { Card } from '@/types';

type RootStackParamList = {
  Home: undefined;
  AddCard: undefined;
};

type AddCardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddCard'>;

const AddCardScreen: React.FC = () => {
  const navigation = useNavigation<AddCardNavigationProp>();
  const addCard = useWalletStore((state) => state.addCard);

  const [selectedPreset, setSelectedPreset] = useState<CardPreset | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [holderName, setHolderName] = useState('');
  const [balance, setBalance] = useState('');
  const [customBankName, setCustomBankName] = useState('');
  const [customCardName, setCustomCardName] = useState('');

  const handlePresetSelect = (preset: CardPreset) => {
    setSelectedPreset(preset);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAddCard = () => {
    if (!selectedPreset && !customCardName) {
      Alert.alert('Error', 'Please select a card type or enter custom details');
      return;
    }

    const preset = selectedPreset || cardPresets[cardPresets.length - 1];

    const newCard: Omit<Card, 'id' | 'createdAt' | 'updatedAt'> = {
      type: 'credit',
      name: customCardName || preset.name,
      displayName: customCardName || preset.name,
      bankName: customBankName || preset.bankName,
      cardNumber: cardNumber || '**** **** **** 0000',
      lastFour: cardNumber.slice(-4) || '0000',
      expiryDate: expiryDate || '12/30',
      cvv: cvv || '***',
      holderName: holderName || 'YOUR NAME',
      balance: parseFloat(balance) || 0,
      currency: preset.defaultCurrency || 'USD',
      cardNetwork: preset.cardNetwork,
      cardDesign: preset.design,
      isDefault: false,
      isLocked: false,
      isFrozen: false,
    };

    addCard(newCard);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Card</Text>
        <TouchableOpacity onPress={handleAddCard}>
          <Text style={styles.addButton}>Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Card Presets */}
        <Text style={styles.sectionTitle}>Card Type</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.presetsContainer}
        >
          {cardPresets.map((preset) => (
            <TouchableOpacity
              key={preset.name}
              style={[
                styles.presetCard,
                selectedPreset?.name === preset.name && styles.presetCardSelected,
                { backgroundColor: preset.design.backgroundColor },
              ]}
              onPress={() => handlePresetSelect(preset)}
            >
              <Text style={[styles.presetName, { color: preset.design.textColor }]}>
                {preset.name}
              </Text>
              <Text style={[styles.presetBank, { color: preset.design.textColor, opacity: 0.7 }]}>
                {preset.bankName}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Custom Details */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Card Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Card Number</Text>
            <TextInput
              style={styles.input}
              placeholder="0000 0000 0000 0000"
              placeholderTextColor="#8E8E93"
              keyboardType="number-pad"
              value={cardNumber}
              onChangeText={setCardNumber}
              maxLength={19}
            />
          </View>

          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.inputLabel}>Expiry Date</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/YY"
                placeholderTextColor="#8E8E93"
                keyboardType="number-pad"
                value={expiryDate}
                onChangeText={setExpiryDate}
                maxLength={5}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>CVV</Text>
              <TextInput
                style={styles.input}
                placeholder="123"
                placeholderTextColor="#8E8E93"
                keyboardType="number-pad"
                value={cvv}
                onChangeText={setCvv}
                maxLength={4}
                secureTextEntry
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Card Holder Name</Text>
            <TextInput
              style={styles.input}
              placeholder="YOUR NAME"
              placeholderTextColor="#8E8E93"
              autoCapitalize="characters"
              value={holderName}
              onChangeText={setHolderName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Initial Balance</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#8E8E93"
              keyboardType="decimal-pad"
              value={balance}
              onChangeText={setBalance}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Custom Card Name (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="My Card"
              placeholderTextColor="#8E8E93"
              value={customCardName}
              onChangeText={setCustomCardName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Custom Bank Name (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Bank Name"
              placeholderTextColor="#8E8E93"
              value={customBankName}
              onChangeText={setCustomBankName}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
  addButton: {
    color: '#0A84FF',
    fontSize: 17,
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  presetsContainer: {
    paddingHorizontal: 20,
  },
  presetCard: {
    width: 140,
    height: 90,
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    justifyContent: 'space-between',
  },
  presetCardSelected: {
    borderWidth: 2,
    borderColor: '#0A84FF',
  },
  presetName: {
    fontSize: 14,
    fontWeight: '700',
  },
  presetBank: {
    fontSize: 12,
  },
  formSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  inputGroup: {
    marginBottom: 16,
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
  rowInputs: {
    flexDirection: 'row',
  },
});

export default AddCardScreen;
