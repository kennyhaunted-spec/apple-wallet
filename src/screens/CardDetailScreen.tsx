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
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useWalletStore } from '@/store/useWalletStore';
import { formatCurrency, formatDate } from '@/utils/formatters';
import CardPattern from '@/components/cards/CardPattern';

type RootStackParamList = {
  CardDetail: { cardId: string };
  SendMoney: { cardId: string };
  ManageTransactions: { cardId: string };
};

type CardDetailRouteProp = RouteProp<RootStackParamList, 'CardDetail'>;
type CardDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CardDetail'>;

const CardDetailScreen: React.FC = () => {
  const navigation = useNavigation<CardDetailNavigationProp>();
  const route = useRoute<CardDetailRouteProp>();
  const { cardId } = route.params;

  const card = useWalletStore((state) => state.getCardById(cardId));
  const transactions = useWalletStore((state) => state.getCardTransactions(cardId));
  const updateCardBalance = useWalletStore((state) => state.updateCardBalance);
  const addTransaction = useWalletStore((state) => state.addTransaction);
  const lockCard = useWalletStore((state) => state.lockCard);
  const unlockCard = useWalletStore((state) => state.unlockCard);
  const freezeCard = useWalletStore((state) => state.freezeCard);
  const unfreezeCard = useWalletStore((state) => state.unfreezeCard);

  const [showAddMoney, setShowAddMoney] = useState(false);
  const [addAmount, setAddAmount] = useState('');

  if (!card) return null;

  const handleAddMoney = () => {
    const amount = parseFloat(addAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    updateCardBalance(cardId, amount);
    addTransaction({
      cardId,
      type: 'income',
      amount,
      currency: card.currency,
      description: 'Added to Balance',
      merchantName: card.name,
      category: 'income',
      status: 'completed',
      isRecurring: false,
    });

    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setShowAddMoney(false);
    setAddAmount('');
  };

  const handleSendRequest = () => {
    navigation.navigate('SendMoney', { cardId });
  };

  const handleLockToggle = () => {
    if (card.isLocked) {
      unlockCard(cardId);
    } else {
      lockCard(cardId);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleFreezeToggle = () => {
    if (card.isFrozen) {
      unfreezeCard(cardId);
    } else {
      freezeCard(cardId);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleManageTransactions = () => {
    navigation.navigate('ManageTransactions', { cardId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.doneButton}>Done</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleManageTransactions}>
            <Text style={styles.moreButton}>•••</Text>
          </TouchableOpacity>
        </View>

        {/* Card Preview */}
        <View style={styles.cardPreview}>
          <LinearGradient
            colors={card.cardDesign.gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <CardPattern
              pattern={card.cardDesign.pattern}
              color={card.cardDesign.patternColor}
              cardWidth={320}
              cardHeight={200}
            />
            <View style={styles.cardContent}>
              <View style={styles.cardTop}>
                <Text style={[styles.cardName, { color: card.cardDesign.textColor }]}>
                  {card.type === 'cash' ? '🍎' : ''} {card.displayName}
                </Text>
                <Text style={[styles.cardBalance, { color: card.cardDesign.textColor }]}>
                  {formatCurrency(card.balance, card.currency)}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Balance Section */}
        <View style={styles.balanceSection}>
          <View>
            <Text style={styles.balanceLabel}>Balance</Text>
            <Text style={styles.balanceAmount}>
              {formatCurrency(card.balance, card.currency)}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={handleSendRequest}
          >
            <Text style={styles.sendButtonText}>Send or Request</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowAddMoney(true)}
          >
            <Text style={styles.actionIcon}>➕</Text>
            <Text style={styles.actionText}>Add Money</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleLockToggle}
          >
            <Text style={styles.actionIcon}>{card.isLocked ? '🔓' : '🔒'}</Text>
            <Text style={styles.actionText}>{card.isLocked ? 'Unlock' : 'Lock'}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleFreezeToggle}
          >
            <Text style={styles.actionIcon}>{card.isFrozen ? '❄️' : '🧊'}</Text>
            <Text style={styles.actionText}>{card.isFrozen ? 'Unfreeze' : 'Freeze'}</Text>
          </TouchableOpacity>
        </View>

        {/* Add Money Modal */}
        {showAddMoney && (
          <View style={styles.addMoneyContainer}>
            <TextInput
              style={styles.amountInput}
              placeholder="$0.00"
              placeholderTextColor="#8E8E93"
              keyboardType="decimal-pad"
              value={addAmount}
              onChangeText={setAddAmount}
              autoFocus
            />
            <View style={styles.addMoneyButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowAddMoney(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleAddMoney}
              >
                <Text style={styles.confirmButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Transactions */}
        <View style={styles.transactionsSection}>
          <View style={styles.transactionsHeader}>
            <Text style={styles.transactionsTitle}>Transactions</Text>
            <TouchableOpacity onPress={handleManageTransactions}>
              <Text style={styles.searchIcon}>🔍</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.transactionsList}>
            {transactions.slice(0, 5).map((transaction) => (
              <TouchableOpacity 
                key={transaction.id} 
                style={styles.transactionItem}
                onLongPress={handleManageTransactions}
              >
                <View style={styles.transactionLeft}>
                  <View style={styles.transactionIcon}>
                    <Text style={styles.transactionIconText}>
                      {transaction.merchantIcon || '💳'}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.transactionName}>{transaction.merchantName}</Text>
                    <Text style={styles.transactionDesc}>{transaction.description}</Text>
                    <Text style={styles.transactionDate}>{formatDate(transaction.date)}</Text>
                  </View>
                </View>
                <Text style={[
                  styles.transactionAmount,
                  transaction.type === 'income' || transaction.type === 'refund' 
                    ? styles.incomeAmount 
                    : styles.expenseAmount
                ]}>
                  {transaction.type === 'income' || transaction.type === 'refund' ? '+' : '-'}
                  {formatCurrency(transaction.amount, transaction.currency)}
                </Text>
              </TouchableOpacity>
            ))}

            {transactions.length === 0 && (
              <Text style={styles.noTransactions}>No transactions yet</Text>
            )}
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
  },
  doneButton: {
    color: '#0A84FF',
    fontSize: 17,
    fontWeight: '400',
  },
  moreButton: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  cardPreview: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  card: {
    width: 320,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  cardContent: {
    flex: 1,
    padding: 20,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardName: {
    fontSize: 20,
    fontWeight: '700',
  },
  cardBalance: {
    fontSize: 18,
    fontWeight: '600',
  },
  balanceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  balanceLabel: {
    color: '#8E8E93',
    fontSize: 15,
    marginBottom: 4,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  sendButton: {
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  actionText: {
    color: '#0A84FF',
    fontSize: 13,
    fontWeight: '500',
  },
  addMoneyContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '300',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  addMoneyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  cancelButtonText: {
    color: '#0A84FF',
    fontSize: 17,
  },
  confirmButton: {
    backgroundColor: '#0A84FF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  transactionsSection: {
    paddingHorizontal: 20,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionsTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  searchIcon: {
    fontSize: 20,
  },
  transactionsList: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    overflow: 'hidden',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#2C2C2E',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionIconText: {
    fontSize: 20,
  },
  transactionName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  transactionDesc: {
    color: '#8E8E93',
    fontSize: 13,
    marginTop: 2,
  },
  transactionDate: {
    color: '#8E8E93',
    fontSize: 13,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  incomeAmount: {
    color: '#34C759',
  },
  expenseAmount: {
    color: '#FFFFFF',
  },
  noTransactions: {
    color: '#8E8E93',
    textAlign: 'center',
    padding: 20,
  },
});

export default CardDetailScreen;
