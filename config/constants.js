/**
 * APP-WIDE CONSTANTS
 * 
 * Centralized place for all app constants
 */

// App Information
export const APP_NAME = 'MF Advisor';
export const APP_VERSION = '1.0.0';
export const APP_TAGLINE = 'Smart Mutual Fund Analysis';

// User Information
export const DEFAULT_USER_NAME = 'Investor';
export const DEFAULT_GREETING = 'good morning';

// Limits and Constraints
export const MIN_SEARCH_LENGTH = 2;
export const MAX_SEARCH_RESULTS = 50;
export const TOP_FUNDS_LIMIT = 20;
export const RECOMMENDATIONS_LIMIT = 5;
export const MIN_SCORE_DIFF = 5;

// Investment Limits
export const MIN_SIP_AMOUNT = 500;
export const MAX_SIP_AMOUNT = 10000000;
export const MIN_INVESTMENT_YEARS = 1;
export const MAX_INVESTMENT_YEARS = 50;

// Score Thresholds
export const SCORE_EXCELLENT = 75;
export const SCORE_GOOD = 60;
export const SCORE_AVERAGE = 40;

// Colors (can also be imported from styles)
export const COLORS = {
  primary: '#7C3AED',
  secondary: '#2563EB',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
  orange: '#EA580C',
  dark: '#0F0F0F',
  gray: '#6B7280',
};

// Score Emojis
export const SCORE_EMOJIS = {
  excellent: '🔥🔥🔥',
  good: '🔥',
  average: '✨',
  poor: '📊',
};

// Metric Categories
export const METRIC_CATEGORIES = {
  returns: ['cagr', 'rolling_1y', 'rolling_3y', 'rolling_5y'],
  risk: ['volatility', 'max_drawdown', 'downside_deviation', 'current_drawdown_pct'],
  ratios: ['sharpe', 'sortino', 'alpha', 'information_ratio', 'calmar_ratio'],
  consistency: ['consistency_score', 'positive_months_pct'],
};

// Fund Categories
export const FUND_CATEGORIES = [
  'Equity',
  'Debt',
  'Hybrid',
  'Solution Oriented',
  'Other',
];

// Risk Levels
export const RISK_LEVELS = [
  'Low',
  'Low to Moderate',
  'Moderate',
  'Moderately High',
  'High',
  'Very High',
];

// Default Values
export const DEFAULTS = {
  sipAmount: '5000',
  sipYears: '10',
  sipReturn: '12',
  goalAmount: '5000000',
  goalYears: '15',
  goalReturn: '12',
  compareAmount: '100000',
  compareYears: '10',
  compareReturn: '12',
};
