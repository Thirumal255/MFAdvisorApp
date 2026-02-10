// Centralized API configuration
export const API_URL = 'http://192.168.1.27:8000';

export const API_ENDPOINTS = {
  SEARCH: `${API_URL}/api/funds/search`,
  FUND_DETAILS: `${API_URL}/api/funds`,
  TOP_FUNDS: `${API_URL}/api/funds/top`,
  ALL_FUNDS: `${API_URL}/api/funds/all`,
  RECOMMENDATIONS: `${API_URL}/api/recommendations`,
  COMPARE: `${API_URL}/api/compare`,
  COMPARE_INVESTMENT: `${API_URL}/api/compare-investment`,  // ✅ NEW
};