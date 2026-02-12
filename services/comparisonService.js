/**
 * COMPARISON SERVICE
 * Fund comparison and recommendations API calls
 */

import { API_ENDPOINTS } from '../config/api';

/**
 * Get recommendations for a fund
 */
export const getRecommendations = async (fundCode, limit = 5, minScoreDiff = 5) => {
  try {
    const response = await fetch(
      `${API_ENDPOINTS.RECOMMENDATIONS}/${fundCode}?limit=${limit}&min_score_diff=${minScoreDiff}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Recommendations error:', error);
    throw error;
  }
};

/**
 * Compare two funds side-by-side
 */
export const compareFunds = async (code1, code2) => {
  try {
    const response = await fetch(`${API_ENDPOINTS.COMPARE}/${code1}/${code2}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Comparison error:', error);
    throw error;
  }
};

/**
 * Compare investment returns (what-if analysis)
 */
export const compareInvestment = async (fund1Code, fund2Code, investmentDate, amount) => {
  try {
    const response = await fetch(API_ENDPOINTS.COMPARE_INVESTMENT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fund1_code: parseInt(fund1Code),
        fund2_code: parseInt(fund2Code),
        investment_date: investmentDate,
        investment_amount: amount
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Comparison failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Investment comparison error:', error);
    throw error;
  }
};