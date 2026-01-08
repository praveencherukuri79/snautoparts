import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// Extend dayjs with relative time plugin
dayjs.extend(relativeTime);

/**
 * Format currency value
 * @param amount - The amount to format
 * @param currency - Currency code (default: USD)
 * @param locale - Locale for formatting (default: en-US)
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format number with thousand separators
 * @param num - The number to format
 * @param locale - Locale for formatting (default: en-US)
 */
export const formatNumber = (
  num: number,
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale).format(num);
};

/**
 * Format percentage
 * @param value - The value to format (0-100 or 0-1)
 * @param decimals - Number of decimal places (default: 0)
 * @param isDecimal - Whether the value is already a decimal (0-1)
 */
export const formatPercent = (
  value: number,
  decimals: number = 0,
  isDecimal: boolean = false
): string => {
  const percentage = isDecimal ? value * 100 : value;
  return `${percentage.toFixed(decimals)}%`;
};

/**
 * Format date with dayjs
 * @param date - Date string or Date object
 * @param format - Date format string (default: MMM D, YYYY)
 */
export const formatDate = (
  date: string | Date | null | undefined,
  format: string = 'MMM D, YYYY'
): string => {
  if (!date) return '-';
  return dayjs(date).format(format);
};

/**
 * Format date and time
 * @param date - Date string or Date object
 * @param format - Date format string (default: MMM D, YYYY h:mm A)
 */
export const formatDateTime = (
  date: string | Date | null | undefined,
  format: string = 'MMM D, YYYY h:mm A'
): string => {
  if (!date) return '-';
  return dayjs(date).format(format);
};

/**
 * Format relative time (e.g., "2 hours ago")
 * @param date - Date string or Date object
 */
export const formatRelativeTime = (
  date: string | Date | null | undefined
): string => {
  if (!date) return '-';
  return dayjs(date).fromNow();
};

/**
 * Format time only
 * @param date - Date string or Date object
 * @param format - Time format string (default: h:mm A)
 */
export const formatTime = (
  date: string | Date | null | undefined,
  format: string = 'h:mm A'
): string => {
  if (!date) return '-';
  return dayjs(date).format(format);
};

/**
 * Format phone number
 * @param phone - Phone number string
 */
export const formatPhone = (phone: string | null | undefined): string => {
  if (!phone) return '-';
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
};

/**
 * Format SKU (uppercase, trimmed)
 * @param sku - SKU string
 */
export const formatSku = (sku: string | null | undefined): string => {
  if (!sku) return '-';
  return sku.toUpperCase().trim();
};

/**
 * Format file size
 * @param bytes - Size in bytes
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format order number with padding
 * @param num - Order number
 * @param prefix - Prefix (default: SN)
 * @param padding - Zero padding length (default: 6)
 */
export const formatOrderNumber = (
  num: number | string,
  prefix: string = 'SN',
  padding: number = 6
): string => {
  const numStr = String(num).padStart(padding, '0');
  return `${prefix}-${numStr}`;
};

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length (default: 50)
 */
export const truncate = (
  text: string | null | undefined,
  maxLength: number = 50
): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/**
 * Capitalize first letter
 * @param str - String to capitalize
 */
export const capitalize = (str: string | null | undefined): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Title case (capitalize each word)
 * @param str - String to title case
 */
export const titleCase = (str: string | null | undefined): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Get initials from name
 * @param name - Full name
 * @param maxChars - Maximum characters (default: 2)
 */
export const getInitials = (
  name: string | null | undefined,
  maxChars: number = 2
): string => {
  if (!name) return '';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, maxChars);
};

/**
 * Format address as single line
 * @param address - Address object
 */
export const formatAddressLine = (address: {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
} | null | undefined): string => {
  if (!address) return '-';
  const parts = [
    address.street1,
    address.street2,
    address.city,
    `${address.state} ${address.postalCode}`,
    address.country,
  ].filter(Boolean);
  return parts.join(', ');
};

/**
 * Format stock status for display
 * @param status - Stock status
 */
export const formatStockStatus = (
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | null | undefined
): { label: string; color: 'success' | 'warning' | 'error' } => {
  switch (status) {
    case 'in_stock':
      return { label: 'In Stock', color: 'success' };
    case 'low_stock':
      return { label: 'Low Stock', color: 'warning' };
    case 'out_of_stock':
      return { label: 'Out of Stock', color: 'error' };
    default:
      return { label: 'Unknown', color: 'warning' };
  }
};

/**
 * Format order status for display
 * @param status - Order status
 */
export const formatOrderStatus = (
  status: string | null | undefined
): { label: string; color: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' } => {
  switch (status) {
    case 'pending':
      return { label: 'Pending', color: 'warning' };
    case 'confirmed':
      return { label: 'Confirmed', color: 'info' };
    case 'processing':
      return { label: 'Processing', color: 'primary' };
    case 'shipped':
      return { label: 'Shipped', color: 'info' };
    case 'delivered':
      return { label: 'Delivered', color: 'success' };
    case 'cancelled':
      return { label: 'Cancelled', color: 'error' };
    case 'refunded':
      return { label: 'Refunded', color: 'secondary' };
    default:
      return { label: status || 'Unknown', color: 'default' };
  }
};
