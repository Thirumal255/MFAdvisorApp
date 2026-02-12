/**
 * FORMATTING UTILITIES
 * 
 * Purpose: Centralized formatting functions for currency, dates, percentages
 * 
 * Why separate file?
 * - Used across multiple screens
 * - Easy to test
 * - Consistent formatting throughout app
 */

/**
 * Format number as Indian currency
 * 
 * Examples:
 * formatCurrency(1000) → "₹1,000"
 * formatCurrency(150000) → "₹1.5 L"
 * formatCurrency(50000000) → "₹5 Cr"
 */
export const formatCurrency = (amount) => {
  const num = parseFloat(amount);
  
  if (isNaN(num)) return '₹0';
  
  if (num >= 10000000) {
    // Crores (1 Cr = 10 million)
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    // Lakhs (1 L = 100 thousand)
    return `₹${(num / 100000).toFixed(2)} L`;
  } else {
    // Thousands with comma separator
    return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  }
};

/**
 * Format currency with full precision (no abbreviation)
 * 
 * Examples:
 * formatCurrencyFull(1234567) → "₹12,34,567"
 */
export const formatCurrencyFull = (amount) => {
  const num = parseFloat(amount);
  if (isNaN(num)) return '₹0';
  return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
};

/**
 * Format Date object to DD-MM-YYYY
 * 
 * Example:
 * formatDate(new Date('2024-01-15')) → "15-01-2024"
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  
  return `${day}-${month}-${year}`;
};

/**
 * Format date to readable format
 * 
 * Example:
 * formatDateReadable(new Date()) → "15 Jan 2024"
 */
export const formatDateReadable = (date) => {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  
  return dateObj.toLocaleDateString('en-IN', options);
};

/**
 * Format decimal as percentage
 * 
 * Examples:
 * formatPercentage(0.1532) → "15.32%"
 * formatPercentage(0.08, 1) → "8.0%"
 */
export const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  
  const percentage = (value * 100).toFixed(decimals);
  return `${percentage}%`;
};

/**
 * Format percentage with sign (+ or -)
 * 
 * Examples:
 * formatPercentageSigned(0.15) → "+15.00%"
 * formatPercentageSigned(-0.08) → "-8.00%"
 */
export const formatPercentageSigned = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  
  const percentage = (value * 100).toFixed(decimals);
  const sign = value >= 0 ? '+' : '';
  return `${sign}${percentage}%`;
};

/**
 * Format large numbers with abbreviations
 * 
 * Examples:
 * formatNumber(1500) → "1.5K"
 * formatNumber(2500000) → "2.5M"
 */
export const formatNumber = (num) => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

/**
 * Format duration in years
 * 
 * Examples:
 * formatYears(5) → "5 years"
 * formatYears(1) → "1 year"
 * formatYears(0.5) → "6 months"
 */
export const formatYears = (years) => {
  if (years >= 1) {
    const y = Math.floor(years);
    return y === 1 ? '1 year' : `${y} years`;
  } else {
    const months = Math.round(years * 12);
    return months === 1 ? '1 month' : `${months} months`;
  }
};

/**
 * Format days to readable duration
 * 
 * Examples:
 * formatDays(456) → "1.2 years"
 * formatDays(90) → "3 months"
 * formatDays(15) → "15 days"
 */
export const formatDays = (days) => {
  if (days >= 365) {
    return `${(days / 365).toFixed(1)} years`;
  } else if (days >= 30) {
    return `${Math.floor(days / 30)} months`;
  }
  return `${days} days`;
};

/**
 * Truncate text with ellipsis
 * 
 * Example:
 * truncateText("Very Long Fund Name", 15) → "Very Long Fu..."
 */
export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Get color based on value (green for positive, red for negative)
 */
export const getColorForValue = (value) => {
  if (value > 0) return '#22C55E';  // Green
  if (value < 0) return '#EF4444';  // Red
  return '#6B7280';  // Gray
};

/**
 * Format XIRR/CAGR for display
 * 
 * Example:
 * formatReturn(18.5) → "18.5% p.a."
 */
export const formatReturn = (value) => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return `${value.toFixed(2)}% p.a.`;
};
