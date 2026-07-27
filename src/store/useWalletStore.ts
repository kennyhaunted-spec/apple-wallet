import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, Transaction, WalletSettings, Contact, ScheduledPayment, Budget } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface WalletState {
  cards: Card[];
  transactions: Transaction[];
  settings: WalletSettings;
  contacts: Contact[];
  scheduledPayments: ScheduledPayment[];
  budgets: Budget[];
  selectedCardId: string | null;

  // Card actions
  addCard: (card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCard: (id: string, updates: Partial<Card>) => void;
  deleteCard: (id: string) => void;
  setDefaultCard: (id: string) => void;
  lockCard: (id: string) => void;
  unlockCard: (id: string) => void;
  freezeCard: (id: string) => void;
  unfreezeCard: (id: string) => void;
  updateCardBalance: (id: string, amount: number) => void;

  // Transaction actions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getCardTransactions: (cardId: string) => Transaction[];

  // Settings actions
  updateSettings: (settings: Partial<WalletSettings>) => void;

  // Contact actions
  addContact: (contact: Omit<Contact, 'id'>) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;

  // Scheduled payment actions
  addScheduledPayment: (payment: Omit<ScheduledPayment, 'id'>) => void;
  updateScheduledPayment: (id: string, updates: Partial<ScheduledPayment>) => void;
  deleteScheduledPayment: (id: string) => void;

  // Budget actions
  addBudget: (budget: Omit<Budget, 'id' | 'spent'>) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;

  // Selection
  setSelectedCard: (id: string | null) => void;

  // Computed
  getTotalBalance: () => number;
  getCardById: (id: string) => Card | undefined;
}

const defaultSettings: WalletSettings = {
  displayCurrency: 'USD',
  currencyRates: {
    'USD': 1,
    'EUR': 0.92,
    'GBP': 0.79,
    'JPY': 150.5,
    'CNY': 7.2,
    'RUB': 92.5,
    'KZT': 500,
  },
  motionReactiveColors: true,
  tapToCashEnabled: true,
  appearance: 'system',
  useFaceId: true,
  notificationsEnabled: true,
  soundEnabled: true,
  hapticEnabled: true,
};

const defaultCards: Card[] = [
  {
    id: 'apple-cash',
    type: 'cash',
    name: 'Apple Cash',
    displayName: 'Apple Cash',
    bankName: 'Apple',
    cardNumber: '**** **** **** 0000',
    lastFour: '0000',
    expiryDate: '12/30',
    cvv: '***',
    holderName: 'Your Name',
    balance: 5100.00,
    currency: 'USD',
    cardNetwork: 'visa',
    cardDesign: {
      backgroundColor: '#1C1C1E',
      gradientColors: ['#1C1C1E', '#2C2C2E'],
      pattern: 'dots',
      patternColor: 'rgba(255,255,255,0.1)',
      textColor: '#FFFFFF',
    },
    isDefault: true,
    isLocked: false,
    isFrozen: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'apple-account',
    type: 'account',
    name: 'Apple Account',
    displayName: 'Apple Account',
    bankName: 'Apple',
    cardNumber: '**** **** **** 1111',
    lastFour: '1111',
    expiryDate: '12/30',
    cvv: '***',
    holderName: 'Your Name',
    balance: 0.00,
    currency: 'USD',
    cardNetwork: 'other',
    cardDesign: {
      backgroundColor: '#FFFFFF',
      gradientColors: ['#FFFFFF', '#F5F5F7'],
      pattern: 'none',
      patternColor: 'transparent',
      textColor: '#000000',
    },
    isDefault: false,
    isLocked: false,
    isFrozen: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const defaultTransactions: Transaction[] = [
  {
    id: uuidv4(),
    cardId: 'apple-cash',
    type: 'income',
    amount: 2500.00,
    currency: 'USD',
    description: 'Tap to Cash Received',
    merchantName: 'iPhone',
    merchantIcon: '💚',
    category: 'income',
    status: 'completed',
    date: new Date(2026, 3, 6).toISOString(),
    isRecurring: false,
  },
  {
    id: uuidv4(),
    cardId: 'apple-cash',
    type: 'income',
    amount: 25.00,
    currency: 'USD',
    description: 'Tap to Cash Received',
    merchantName: 'iPhone',
    merchantIcon: '💚',
    category: 'income',
    status: 'completed',
    date: new Date(2026, 3, 3).toISOString(),
    isRecurring: false,
  },
  {
    id: uuidv4(),
    cardId: 'apple-cash',
    type: 'income',
    amount: 25.00,
    currency: 'USD',
    description: 'Tap to Cash Received',
    merchantName: 'iPhone',
    merchantIcon: '💚',
    category: 'income',
    status: 'completed',
    date: new Date(2026, 3, 2).toISOString(),
    isRecurring: false,
  },
  {
    id: uuidv4(),
    cardId: 'apple-cash',
    type: 'income',
    amount: 2550.00,
    currency: 'USD',
    description: 'Added to Balance',
    merchantName: 'Octopus Card',
    merchantIcon: '🐙',
    category: 'transfer',
    status: 'completed',
    date: new Date(2026, 3, 2).toISOString(),
    isRecurring: false,
  },
];

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      cards: defaultCards,
      transactions: defaultTransactions,
      settings: defaultSettings,
      contacts: [],
      scheduledPayments: [],
      budgets: [],
      selectedCardId: null,

      addCard: (card) => {
        const newCard: Card = {
          ...card,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ cards: [...state.cards, newCard] }));
      },

      updateCard: (id, updates) => {
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === id ? { ...card, ...updates, updatedAt: new Date().toISOString() } : card
          ),
        }));
      },

      deleteCard: (id) => {
        set((state) => ({
          cards: state.cards.filter((card) => card.id !== id),
          transactions: state.transactions.filter((t) => t.cardId !== id),
        }));
      },

      setDefaultCard: (id) => {
        set((state) => ({
          cards: state.cards.map((card) => ({
            ...card,
            isDefault: card.id === id,
          })),
        }));
      },

      lockCard: (id) => {
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === id ? { ...card, isLocked: true } : card
          ),
        }));
      },

      unlockCard: (id) => {
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === id ? { ...card, isLocked: false } : card
          ),
        }));
      },

      freezeCard: (id) => {
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === id ? { ...card, isFrozen: true } : card
          ),
        }));
      },

      unfreezeCard: (id) => {
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === id ? { ...card, isFrozen: false } : card
          ),
        }));
      },

      updateCardBalance: (id, amount) => {
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === id
              ? { ...card, balance: card.balance + amount, updatedAt: new Date().toISOString() }
              : card
          ),
        }));
      },

      addTransaction: (transaction) => {
        const newTransaction: Transaction = {
          ...transaction,
          id: uuidv4(),
          date: new Date().toISOString(),
        };
        set((state) => ({ transactions: [newTransaction, ...state.transactions] }));

        // Update card balance
        const card = get().cards.find((c) => c.id === transaction.cardId);
        if (card) {
          const multiplier = transaction.type === 'income' || transaction.type === 'refund' ? 1 : -1;
          get().updateCardBalance(transaction.cardId, transaction.amount * multiplier);
        }
      },

      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },

      getCardTransactions: (cardId) => {
        return get().transactions.filter((t) => t.cardId === cardId);
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      addContact: (contact) => {
        const newContact: Contact = { ...contact, id: uuidv4() };
        set((state) => ({ contacts: [...state.contacts, newContact] }));
      },

      updateContact: (id, updates) => {
        set((state) => ({
          contacts: state.contacts.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }));
      },

      deleteContact: (id) => {
        set((state) => ({
          contacts: state.contacts.filter((c) => c.id !== id),
        }));
      },

      addScheduledPayment: (payment) => {
        const newPayment: ScheduledPayment = { ...payment, id: uuidv4() };
        set((state) => ({ scheduledPayments: [...state.scheduledPayments, newPayment] }));
      },

      updateScheduledPayment: (id, updates) => {
        set((state) => ({
          scheduledPayments: state.scheduledPayments.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },

      deleteScheduledPayment: (id) => {
        set((state) => ({
          scheduledPayments: state.scheduledPayments.filter((p) => p.id !== id),
        }));
      },

      addBudget: (budget) => {
        const newBudget: Budget = { ...budget, id: uuidv4(), spent: 0 };
        set((state) => ({ budgets: [...state.budgets, newBudget] }));
      },

      updateBudget: (id, updates) => {
        set((state) => ({
          budgets: state.budgets.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        }));
      },

      deleteBudget: (id) => {
        set((state) => ({
          budgets: state.budgets.filter((b) => b.id !== id),
        }));
      },

      setSelectedCard: (id) => {
        set({ selectedCardId: id });
      },

      getTotalBalance: () => {
        return get().cards.reduce((sum, card) => sum + card.balance, 0);
      },

      getCardById: (id) => {
        return get().cards.find((card) => card.id === id);
      },
    }),
    {
      name: 'wallet-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
