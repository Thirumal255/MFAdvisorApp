/**
 * CALCULATOR SERVICE
 * Calculator-specific API calls (Phase 2+)
 */

import { API_ENDPOINTS } from '../config/api';

/**
 * Calculate expense ratio impact (NEW - Phase 2)
 */
export const calculateExpenseImpact = async (data) => {
  try {
    const response = await fetch(API_ENDPOINTS.EXPENSE_IMPACT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Calculation failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Expense impact calculation error:', error);
    throw error;
  }
};

// Add more calculator APIs here as Phase progresses