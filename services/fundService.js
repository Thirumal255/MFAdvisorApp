/**
 * FUND SERVICE
 * All fund-related API calls
 */

import { API_ENDPOINTS } from '../config/api';

/**
 * Search for funds
 */
export const searchFunds = async (query) => {
  if (query.length < 2) {
    return { results: [] };
  }

  try {
    const cleanQuery = encodeURIComponent(query.trim());
    const response = await fetch(`${API_ENDPOINTS.SEARCH}?q=${cleanQuery}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

/**
 * Get fund details by code
 */
export const getFundDetails = async (code) => {
  try {
    const cleanCode = String(code).trim();
    const response = await fetch(`${API_ENDPOINTS.FUND_DETAILS}/${cleanCode}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || !data.name) {
      throw new Error('Invalid fund data');
    }
    
    return data;
  } catch (error) {
    console.error('Fund details error:', error);
    throw error;
  }
};

/**
 * Get top funds
 */
export const getTopFunds = async (category = null, limit = 20) => {
  try {
    const baseUrl = API_ENDPOINTS.TOP_FUNDS.replace(/\/$/, '');
    let url = `${baseUrl}?limit=${limit}`;
    if (category) {
      url += `&category=${category}`;
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    return data.results || [];
  } catch (error) {
    console.error('Top funds error:', error);
    throw error;
  }
};

/**
 * Get all funds
 */
export const getAllFunds = async (reliableOnly = false) => {
  try {
    let url = API_ENDPOINTS.ALL_FUNDS;
    if (reliableOnly) {
      url += '?reliable_only=true';
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    return data.results || [];
  } catch (error) {
    console.error('Get all funds error:', error);
    throw error;
  }
};

/**
 * Analyze an entire portfolio for a "Vibe Check" ⚡
 * @param {Array} items - Array of {fund_name, amfi_code, investment_type, invested_date, invested_amount}
 */
export const analyzePortfolio = async (items) => {
  try {
    const response = await fetch(`${API_ENDPOINTS.ANALYZE_PORTFOLIO}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Portfolio analysis error:', error);
    throw error;
  }
};