import { format, formatDistanceToNow, parseISO } from 'date-fns';

export const formatDate = (date: string | Date, pattern = 'dd MMM yyyy'): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern);
};

export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd MMM yyyy, HH:mm');
};

export const formatRelativeTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
};

export const formatCurrency = (amount: number, symbol = '$'): string => {
  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatStudentId = (id: string): string => id.toUpperCase();

