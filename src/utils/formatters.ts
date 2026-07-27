import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatCardNumber = (number: string): string => {
  const cleaned = number.replace(/\D/g, '');
  if (cleaned.length === 15) {
    // Amex format: **** ****** *****
    return cleaned.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
  }
  // Standard format: **** **** **** ****
  return cleaned.replace(/(\d{4})(?=.)/g, '$1 ').trim();
};

export const maskCardNumber = (number: string): string => {
  const cleaned = number.replace(/\D/g, '');
  const lastFour = cleaned.slice(-4);
  return `•••• •••• •••• ${lastFour}`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'M/d/yy');
};

export const formatDateFull = (dateString: string): string => {
  return format(new Date(dateString), 'MMMM d, yyyy');
};

export const formatTime = (dateString: string): string => {
  return format(new Date(dateString), 'h:mm a');
};

export const formatRelativeTime = (dateString: string): string => {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
};

export const getCardNetworkLogo = (network: string): string => {
  const logos: Record<string, string> = {
    visa: 'VISA',
    mastercard: 'Mastercard',
    amex: 'AMERICAN EXPRESS',
    discover: 'DISCOVER',
    jcb: 'JCB',
    unionpay: 'UnionPay',
    mir: 'MIR',
  };
  return logos[network] || network.toUpperCase();
};

export const getCardTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    credit: '#007AFF',
    debit: '#34C759',
    prepaid: '#FF9500',
    cash: '#AF52DE',
    loyalty: '#FF2D55',
    transit: '#5856D6',
    account: '#5AC8FA',
  };
  return colors[type] || '#8E8E93';
};

export const generateCardGradient = (baseColor: string): string[] => {
  // Generate a complementary gradient from base color
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const darken = (c: number) => Math.max(0, c - 40);
  const lighten = (c: number) => Math.min(255, c + 20);

  const toHex = (c: number) => c.toString(16).padStart(2, '0');

  const color1 = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  const color2 = `#${toHex(darken(r))}${toHex(darken(g))}${toHex(darken(b))}`;

  return [color1, color2];
};
