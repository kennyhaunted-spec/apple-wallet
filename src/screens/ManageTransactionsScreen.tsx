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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useWalletStore } from '@/store/useWalletStore';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Transaction } from '@/types';

type RootStackParamList = {
  CardDetail: { cardId: string };
  ManageTransactions: { cardId: string };
};

type ManageTransactionsRouteProp = RouteProp<RootStackParamList, 'ManageTransactions'>;
type ManageTransactionsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ManageTransactions'>;

const ManageTransactionsScreen: React.FC = () => {
  const navigation = useNavigation<ManageTransactionsNavigationProp>();
  const route = useRoute<ManageTransactionsRouteProp>();
  const { cardId } = route.params;

  const transactions = useWalletStore((state) => state.getCardTransactions(cardId));
  const updateTransaction = useWalletStore((state) => state.updateTransaction);
  const deleteTransaction = useWalletStore((state) => state.deleteTransaction);
  const addTransaction = useWalletStore((state) => state.addTransaction);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [newAmount, setNewAmount] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newType, setNewType] = useState<'income' | 'expense'>('income');

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditAmount(transaction.amount.toString());
    setEditDescription(transaction.description);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;

    updateTransaction(editingId, {
      amount: parseFloat(editAmount) || 0,
      description: editDescription,
    });

    setEditingId(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deleteTransaction(id);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
        },
      ]
    );
  };

  const handleAddTransaction = () => {
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    addTransaction({
      cardId,
      type: newType,
      amount,
      currency: 'USD',
      description: newDescription || 'Custom Transaction',
      merchantName: 'Custom',
      category: 'other',
      status: 'completed',
      isRecurring: false,
    });

    setShowAddTransaction(false);
    setNewAmount('');
    setNewDescription('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.doneButton}>Done</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowAddTransaction(true)}>
          <Text style={styles.addButton}>Add Transaction</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.editButton}>Edit</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Manage Transactions</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionHeader}>Custom</Text>

        <View style={styles.transactionsList}>
          {transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              {editingId === transaction.id ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.editInput}
                    value={editAmount}
                    onChangeText={setEditAmount}
                    keyboardType="decimal-pad"
                    autoFocus
                  />
                  <TextInput
                    style={styles.editInput}
                    value={editDescription}
                    onChangeText={setEditDescription}
                  />
                  <TouchableOpacity onPress={handleSaveEdit}>
                    <Text style={styles.saveButton}>Save</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View style={styles.transactionLeft}>
                    <View style={styles.iconContainer}>
                      <Text style={styles.icon}>{transaction.merchantIcon || '💳'}</Text>
                    </View>
                    <View>
                      <Text style={styles.merchantName}>{transaction.merchantName}</Text>
                      <Text style={styles.description}>{transaction.description}</Text>
                      <Text style={styles.date}>{formatDate(transaction.date)}</Text>
                    </View>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text style={[
                      styles.amount,
                      transaction.type === 'income' ? styles.income : styles.expense
                    ]}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </Text>
                    <View style={styles.actions}>
                      <TouchableOpacity onPress={() => handleEdit(transaction)}>
                        <Text style={styles.editAction}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(transaction.id)}>
                        <Text style={styles.deleteAction}>🗑</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}
            </View>
          ))}
        </View>

        {/* Add Transaction Modal */}
        {showAddTransaction && (
          <View style={styles.addModal}>
            <Text style={styles.modalTitle}>Add Transaction</Text>
            <View style={styles.typeToggle}>
              <TouchableOpacity
                style={[styles.typeButton, newType === 'income' && styles.typeButtonActive]}
                onPress={() => setNewType('income')}
              >
                <Text style={styles.typeButtonText}>Income</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, newType === 'expense' && styles.typeButtonActive]}
                onPress={() => setNewType('expense')}
              >
                <Text style={styles.typeButtonText}>Expense</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="Amount"
              placeholderTextColor="#8E8E93"
              keyboardType="decimal-pad"
              value={newAmount}
              onChangeText={setNewAmount}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Description"
              placeholderTextColor="#8E8E93"
              value={newDescription}
              onChangeText={setNewDescription}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setShowAddTransaction(false)}>
                <Text style={styles.cancelModal}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddTransaction}>
                <Text style={styles.addModalButton}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
  doneButton: {
    color: '#0A84FF',
    fontSize: 17,
  },
  addButton: {
    color: '#0A84FF',
    fontSize: 17,
    fontWeight: '600',
  },
  editButton: {
    color: '#0A84FF',
    fontSize: 17,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  transactionsList: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    marginHorizontal: 20,
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
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  merchantName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    color: '#8E8E93',
    fontSize: 13,
    marginTop: 2,
  },
  date: {
    color: '#8E8E93',
    fontSize: 13,
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  income: {
    color: '#34C759',
  },
  expense: {
    color: '#FFFFFF',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 12,
  },
  editAction: {
    color: '#0A84FF',
    fontSize: 13,
  },
  deleteAction: {
    fontSize: 13,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  editInput: {
    backgroundColor: '#2C2C2E',
    color: '#FFFFFF',
    padding: 8,
    borderRadius: 8,
    flex: 1,
  },
  saveButton: {
    color: '#34C759',
    fontSize: 15,
    fontWeight: '600',
  },
  addModal: {
    margin: 20,
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  typeToggle: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    marginHorizontal: 4,
    borderRadius: 8,
  },
  typeButtonActive: {
    backgroundColor: '#0A84FF',
  },
  typeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalInput: {
    backgroundColor: '#2C2C2E',
    color: '#FFFFFF',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 17,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelModal: {
    color: '#FF453A',
    fontSize: 17,
  },
  addModalButton: {
    color: '#34C759',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default ManageTransactionsScreen;
