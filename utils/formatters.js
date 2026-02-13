// ============================================================
// 📁 utils/formatters.js
// ============================================================
// WHAT THIS FILE DOES:
//   Shared helper functions used by multiple screens.
//   Formatting currency, dates, metric names, score colors, etc.
//   NO UI code — just pure utility logic.
//
// WHAT IT REPLACES IN App.js:
//   - formatDate() ~lines 91-96
//   - formatCurrency() ~lines 140-149
//   - getScoreColor() ~lines 302-307
//   - getScoreEmoji() ~lines 309-314
//   - formatMetricName() ~lines 318-337
//   - formatMetricValue() ~lines 340-361
// ============================================================


// ── Format date to DD-MM-YYYY ────────────────────────────────
// Used by: MyFundAnalyzer (date picker for investment comparison)
export const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};


// ── Format Indian currency with Cr/L shortcuts ───────────────
// ₹1,00,00,000 → ₹1.00 Cr  |  ₹5,00,000 → ₹5.00 L
// Used by: MyFundAnalyzer (investment comparison results)
export const formatCurrency = (amount) => {
  const num = parseFloat(amount);
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  } else {
    return `₹${num.toLocaleString('en-IN')}`;
  }
};


// ── Score color based on value ───────────────────────────────
// 75+ = green, 60+ = amber, 40+ = indigo, below = gray
// Used by: TopFundsScreen, CheckFundScreen
export const getScoreColor = (score) => {
  if (score >= 75) return '#10B981';
  if (score >= 60) return '#F59E0B';
  if (score >= 40) return '#6366F1';
  return '#6B7280';
};


// ── Score emoji tier ─────────────────────────────────────────
// Used by: TopFundsScreen (fund list cards)
export const getScoreEmoji = (score) => {
  if (score >= 75) return '🔥🔥🔥';
  if (score >= 60) return '🔥';
  if (score >= 40) return '✨';
  return '📊';
};


// ── Human-readable metric names ──────────────────────────────
// 'cagr' → 'CAGR', 'rolling_1y' → '1Y Rolling Return'
// Used by: CheckFundScreen (score breakdown)
export const formatMetricName = (metric) => {
  const names = {
    'cagr': 'CAGR',
    'rolling_1y': '1Y Rolling Return',
    'rolling_3y': '3Y Rolling Return',
    'rolling_5y': '5Y Rolling Return',
    'volatility': 'Volatility',
    'max_drawdown': 'Max Drawdown',
    'downside_deviation': 'Downside Deviation',
    'sharpe': 'Sharpe Ratio',
    'sortino': 'Sortino Ratio',
    'consistency_score': 'Consistency Score',
    'positive_months_pct': 'Positive Months %',
    'current_drawdown_pct': 'Current Drawdown',
    'alpha': 'Alpha',
    'information_ratio': 'Information Ratio',
    'calmar_ratio': 'Calmar Ratio',
  };
  return names[metric] || metric.replace(/_/g, ' ').toUpperCase();
};


// ── Format metric values with correct units ──────────────────
// Percentages get ×100 + %, ratios get 2 decimals, etc.
// Used by: CheckFundScreen (score breakdown values)
export const formatMetricValue = (metric, value) => {
  if (value == null) return 'N/A';

  // Percentage metrics (stored as decimals, multiply by 100)
  if (['cagr', 'rolling_1y', 'rolling_3y', 'rolling_5y', 'volatility',
       'downside_deviation', 'max_drawdown', 'current_drawdown_pct',
       'positive_months_pct'].includes(metric)) {
    return `${(value * 100).toFixed(2)}%`;
  }

  // Ratio metrics (show as-is with 2 decimals)
  if (['sharpe', 'sortino', 'alpha', 'information_ratio', 'calmar_ratio'].includes(metric)) {
    return value.toFixed(2);
  }

  // Score metrics (1 decimal)
  if (['consistency_score'].includes(metric)) {
    return value.toFixed(1);
  }

  return value.toFixed(2);
};
