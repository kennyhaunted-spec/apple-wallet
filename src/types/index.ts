export interface Card {
  id: string;
  type: 'credit' | 'debit' | 'prepaid' | 'cash' | 'loyalty' | 'transit' | 'account';
  name: string;
  displayName: string;
  bankName: string;
  cardNumber: string;
  lastFour: string;
  expiryDate: string;
  cvv: string;
  holderName: string;
  balance: number;
  currency: string;
  cardNetwork: 'visa' | 'mastercard' | 'amex' | 'discover' | 'jcb' | 'unionpay' | 'mir' | 'other';
  cardDesign: CardDesign;
  isDefault: boolean;
  isLocked: boolean;
  isFrozen: boolean;
  spendingLimit?: number;
  monthlySpent?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CardDesign {
  backgroundColor: string;
  gradientColors: string[];
  pattern: 'dots' | 'waves' | 'lines' | 'circles' | 'none' | 'custom';
  patternColor: string;
  textColor: string;
  logoUrl?: string;
  customImage?: string;
}

export interface Transaction {
  id: string;
  cardId: string;
  type: 'income' | 'expense' | 'transfer' | 'refund' | 'fee' | 'interest';
  amount: number;
  currency: string;
  description: string;
  merchantName: string;
  merchantIcon?: string;
  category: TransactionCategory;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  date: string;
  location?: string;
  isRecurring: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  notes?: string;
  receiptImage?: string;
}

export type TransactionCategory = 
  | 'food'
  | 'transport'
  | 'shopping'
  | 'entertainment'
  | 'health'
  | 'education'
  | 'travel'
  | 'bills'
  | 'transfer'
  | 'income'
  | 'other';

export interface WalletSettings {
  displayCurrency: string;
  currencyRates: Record<string, number>;
  motionReactiveColors: boolean;
  tapToCashEnabled: boolean;
  appearance: 'system' | 'light' | 'dark';
  useFaceId: boolean;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  hapticEnabled: boolean;
}

export interface Contact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
  recentAmounts: number[];
}

export interface ScheduledPayment {
  id: string;
  cardId: string;
  name: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextDate: string;
  isActive: boolean;
  merchantName: string;
}

export interface Budget {
  id: string;
  category: TransactionCategory;
  limit: number;
  spent: number;
  period: 'weekly' | 'monthly';
  alertThreshold: number;
}
