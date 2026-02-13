// ============================================================
// 📁 utils/api.js
// ============================================================
// WHAT THIS FILE DOES:
//   All backend API call functions used across screens.
//   Each function handles its own fetch, error handling, and
//   returns data for the calling screen to use.
//
// WHY IT EXISTS:
//   - searchFunds() is used by BOTH CheckFundScreen AND MyFundAnalyzer
//   - getFundDetails() is used by CheckFundScreen, TopFundsScreen, MyFundAnalyzer
//   - Centralizing API calls avoids duplicating fetch logic
//
// WHAT IT REPLACES IN App.js:
//   - searchFunds() ~lines 366-390
//   - getFundDetails() ~lines 393-456
//   - getRecommendations() ~lines 459-474
//   - compareTwoFunds() ~lines 477-495
//   - fetchTopFunds() ~lines 264-294
//   - calculateInvestmentComparison() ~lines 152-253
// ============================================================

import { Alert } from 'react-native';
import { API_ENDPOINTS } from '../config/api';


// ── Search funds by name ─────────────────────────────────────
// Used by: CheckFundScreen, MyFundAnalyzer
// Returns: array of fund results or empty array
export const searchFunds = async (query) => {
  if (query.length < 2) return [];

  try {
    const cleanQuery = encodeURIComponent(query.trim());
    const response = await fetch(`${API_ENDPOINTS.SEARCH}?q=${cleanQuery}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.log('Search error:', error);
    return [];
  }
};


// ── Get full fund details by AMFI code ───────────────────────
// Used by: CheckFundScreen, TopFundsScreen (on tap), MyFundAnalyzer
// Returns: fund data object or null
export const getFundDetails = async (code) => {
  const cleanCode = String(code).trim();
  try {
    const response = await fetch(`${API_ENDPOINTS.FUND_DETAILS}/${cleanCode}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data || !data.name) throw new Error('Invalid fund data');
    return data;
  } catch (error) {
    console.error('❌ Error in getFundDetails:', error);
    alert(`Could not load fund: ${error.message}`);
    return null;
  }
};


// ── Get fund recommendations ─────────────────────────────────
// Used by: MyFundAnalyzer
// Given a fund code, returns the user's fund data + better alternatives
export const getRecommendations = async (fundCode) => {
  try {
    const response = await fetch(`${API_ENDPOINTS.RECOMMENDATIONS}/${fundCode}?limit=5&min_score_diff=5`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return {
      userFund: data.user_fund,
      recommendations: data.recommendations || [],
    };
  } catch (error) {
    console.log('❌ Recommendations error:', error);
    alert('Could not fetch recommendations');
    return { userFund: null, recommendations: [] };
  }
};


// ── Compare two funds side-by-side ───────────────────────────
// Used by: MyFundAnalyzer → Compare button
// Returns: comparison data object or null
export const compareTwoFunds = async (code1, code2) => {
  try {
    const response = await fetch(`${API_ENDPOINTS.COMPARE}/${code1}/${code2}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.log('❌ Comparison error:', error);
    alert('Could not compare funds');
    return null;
  }
};


// ── Fetch top-performing funds ───────────────────────────────
// Used by: TopFundsScreen
// Returns: array of top funds or empty array
export const fetchTopFunds = async (category = null) => {
  try {
    const baseUrl = API_ENDPOINTS.TOP_FUNDS.replace(/\/$/, '');
    let url = `${baseUrl}?limit=20`;
    if (category) {
      url += `&category=${category}`;
    }
    const response = await fetch(url);
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.log('❌ Top funds error:', error);
    return [];
  }
};


// ── Investment comparison (MyFundAnalyzer calculator) ─────────
// Compares historical returns between two funds for a given investment
// Used by: MyFundAnalyzer → "Calculate Returns" button
export const calculateInvestmentComparison = async (fund1Code, fund2Code, amount, date) => {
  try {
    const response = await fetch(API_ENDPOINTS.COMPARE_INVESTMENT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fund1_code: parseInt(fund1Code),
        fund2_code: parseInt(fund2Code),
        investment_date: date,
        investment_amount: amount,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.detail || 'Failed to calculate comparison';

      if (errorMessage.includes('started on')) {
        Alert.alert('Investment Date Too Early', errorMessage);
      } else if (errorMessage.includes('Cannot compare')) {
        Alert.alert('Cannot Compare Funds', errorMessage);
      } else {
        Alert.alert('Error', errorMessage);
      }
      return null;
    }

    const data = await response.json();

    // Transform API response into screen-friendly format
    return {
      currentFund: {
        investedAmount: data.fund1.investment.amount,
        currentValue: data.fund1.current.value,
        absoluteReturns: data.fund1.returns.absolute,
        returnPercentage: data.fund1.returns.percentage,
        xirr: data.fund1.returns.xirr,
        investmentDate: data.fund1.investment.date,
      },
      recommendedFund: {
        investedAmount: data.fund2.investment.amount,
        currentValue: data.fund2.current.value,
        absoluteReturns: data.fund2.returns.absolute,
        returnPercentage: data.fund2.returns.percentage,
        xirr: data.fund2.returns.xirr,
        investmentDate: data.fund2.investment.date,
      },
      difference: {
        value: data.comparison.value_difference,
        percentage: data.comparison.percentage_difference,
        xirr: data.comparison.xirr_difference,
        isPositive: data.comparison.is_fund2_better,
        text: data.comparison.improvement_text,
      },
      adjustment: data.adjustment || { adjusted: false },
    };
  } catch (error) {
    console.error('❌ Comparison error:', error);
    Alert.alert('Error', 'An unexpected error occurred. Please check your connection and try again.');
    return null;
  }
};
