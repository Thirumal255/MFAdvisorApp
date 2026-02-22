/**
 * CENTRALIZED API CONFIGURATION
 * 
 * Purpose: Single source of truth for all API endpoints
 * 
 * Usage:
 * import { API_URL, API_ENDPOINTS } from './config/api';
 * fetch(API_ENDPOINTS.SEARCH + '?q=hdfc')
 */

// Base URL - Switch between local and production
//export const API_URL = 'http://192.168.1.8:8000';  // Local development
export const API_URL = 'https://mf-advisor-backend-264866286943.asia-south1.run.app';  // Production

/**
 * All API endpoints organized by category
 */
export const API_ENDPOINTS = {
  // ========== FUND DISCOVERY ==========
  SEARCH: `${API_URL}/api/funds/search`,                  // Search funds by name
  FUND_DETAILS: `${API_URL}/api/funds`,                   // Get fund details by code
  TOP_FUNDS: `${API_URL}/api/funds/top`,                  // Get top-ranked funds
  ALL_FUNDS: `${API_URL}/api/funds/all`,                  // Get all funds
  
  // ========== RECOMMENDATIONS ==========
  RECOMMENDATIONS: `${API_URL}/api/recommendations`,       // Get better alternatives

  // ========== PORTFOLIO (NEW) ==========
  ANALYZE_PORTFOLIO: `${API_URL}/api/portfolio/analyze`,  // Analyze portfolio with AI Vibe Check
  
  // ========== COMPARISON ==========
  COMPARE: `${API_URL}/api/compare`,                       // Compare two funds
  COMPARE_INVESTMENT: `${API_URL}/api/compare-investment`, // Investment what-if analysis
  
  // ========== CALCULATORS (PHASE 2) ==========
  EXPENSE_IMPACT: `${API_URL}/api/expense-impact`,         // Direct vs Regular comparison (NEW)
  
  // ========== NAV DATA ==========
  NAV: `${API_URL}/api/nav`,                               // Get NAV data
  NAV_LATEST: `${API_URL}/api/nav/latest`,                 // Latest NAV
  
  // ========== HEALTH & DEBUG ==========
  HEALTH: `${API_URL}/health`,                             // Health check
  ROOT: `${API_URL}/`,                                     // API info

   // Chat / AI
  CHAT_MESSAGE: `${API_URL}/api/chat/message`,
  CHAT_HEALTH: `${API_URL}/api/chat/health`,
  RISK_PROFILE: `${API_URL}/api/chat/risk-profile`,
  QUICK_RISK: `${API_URL}/api/chat/quick-risk`,
  RISK_QUESTIONS: `${API_URL}/api/chat/risk-questions`,
  FUND_SUITABILITY: `${API_URL}/api/chat/check-fund-suitability`,
  SUGGESTIONS: `${API_URL}/api/chat/suggestions`,
  
  // Analytics
  ANALYTICS_HEALTH: `${API_URL}/api/analytics/health`,
  PEER_COMPARISON: `${API_URL}/api/analytics/peer-comparison`, // + /{fund_code}
  SECTOR_ALLOCATION: `${API_URL}/api/analytics/sector-allocation`, // + /{fund_code}
  OVERLAP_ANALYSIS: `${API_URL}/api/analytics/overlap-analysis`, // POST
  FUND_MANAGER: `${API_URL}/api/analytics/fund-manager`, // + /{fund_code}
  SEARCH_FUNDS: `${API_URL}/api/analytics/search`, // + ?q=query
  LIST_FUNDS: `${API_URL}/api/analytics/list-funds`, // + ?limit=20
};

/**
 * API request helper with error handling
 * 
 * Usage:
 * const data = await apiRequest(API_ENDPOINTS.SEARCH, { method: 'GET' });
 */
export const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request Failed:', error);
    throw error;
  }
};

/**
 * Request timeout in milliseconds
 */
export const REQUEST_TIMEOUT = 30000; // 30 seconds

/**
 * Retry configuration
 */
export const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
};
