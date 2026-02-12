/**
 * VALIDATION UTILITIES
 * 
 * Input validation functions
 */

import { MIN_SIP_AMOUNT, MAX_SIP_AMOUNT, MIN_INVESTMENT_YEARS, MAX_INVESTMENT_YEARS } from '../config/constants';

/**
 * Validate amount input
 * 
 * @param {string|number} amount - Amount to validate
 * @param {number} min - Minimum allowed
 * @param {number} max - Maximum allowed
 * @returns {object} - { valid: boolean, error: string }
 */
export const validateAmount = (amount, min = 0, max = Infinity) => {
  const num = parseFloat(amount);
  
  if (!amount || amount.toString().trim() === '') {
    return { valid: false, error: 'Amount is required' };
  }
  
  if (isNaN(num)) {
    return { valid: false, error: 'Please enter a valid number' };
  }
  
  if (num <= 0) {
    return { valid: false, error: 'Amount must be greater than zero' };
  }
  
  if (num < min) {
    return { valid: false, error: `Amount must be at least ₹${min.toLocaleString('en-IN')}` };
  }
  
  if (num > max) {
    return { valid: false, error: `Amount cannot exceed ₹${max.toLocaleString('en-IN')}` };
  }
  
  return { valid: true, error: null };
};

/**
 * Validate SIP amount
 */
export const validateSIPAmount = (amount) => {
  return validateAmount(amount, MIN_SIP_AMOUNT, MAX_SIP_AMOUNT);
};

/**
 * Validate years input
 * 
 * @param {string|number} years - Years to validate
 * @returns {object} - { valid: boolean, error: string }
 */
export const validateYears = (years) => {
  const num = parseInt(years);
  
  if (!years || years.toString().trim() === '') {
    return { valid: false, error: 'Duration is required' };
  }
  
  if (isNaN(num)) {
    return { valid: false, error: 'Please enter a valid number' };
  }
  
  if (num < MIN_INVESTMENT_YEARS) {
    return { valid: false, error: `Duration must be at least ${MIN_INVESTMENT_YEARS} year` };
  }
  
  if (num > MAX_INVESTMENT_YEARS) {
    return { valid: false, error: `Duration cannot exceed ${MAX_INVESTMENT_YEARS} years` };
  }
  
  return { valid: true, error: null };
};

/**
 * Validate return rate
 * 
 * @param {string|number} rate - Return rate to validate (percentage)
 * @returns {object} - { valid: boolean, error: string }
 */
export const validateReturnRate = (rate) => {
  const num = parseFloat(rate);
  
  if (!rate || rate.toString().trim() === '') {
    return { valid: false, error: 'Return rate is required' };
  }
  
  if (isNaN(num)) {
    return { valid: false, error: 'Please enter a valid number' };
  }
  
  if (num <= 0) {
    return { valid: false, error: 'Return rate must be positive' };
  }
  
  if (num > 50) {
    return { valid: false, error: 'Return rate seems unrealistic (max 50%)' };
  }
  
  return { valid: true, error: null };
};

/**
 * Validate date input
 * 
 * @param {string} dateString - Date in DD-MM-YYYY format
 * @returns {object} - { valid: boolean, error: string, date: Date }
 */
export const validateDate = (dateString) => {
  if (!dateString || dateString.trim() === '') {
    return { valid: false, error: 'Date is required', date: null };
  }
  
  const parts = dateString.split('-');
  if (parts.length !== 3) {
    return { valid: false, error: 'Invalid date format (use DD-MM-YYYY)', date: null };
  }
  
  const day = parseInt(parts[0]);
  const month = parseInt(parts[1]);
  const year = parseInt(parts[2]);
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    return { valid: false, error: 'Invalid date values', date: null };
  }
  
  const date = new Date(year, month - 1, day);
  const today = new Date();
  
  if (date > today) {
    return { valid: false, error: 'Date cannot be in the future', date: null };
  }
  
  if (date < new Date(2000, 0, 1)) {
    return { valid: false, error: 'Date too far in the past', date: null };
  }
  
  return { valid: true, error: null, date };
};

/**
 * Validate search query
 * 
 * @param {string} query - Search query
 * @param {number} minLength - Minimum length required
 * @returns {object} - { valid: boolean, error: string }
 */
export const validateSearchQuery = (query, minLength = 2) => {
  if (!query || query.trim() === '') {
    return { valid: false, error: 'Please enter a search term' };
  }
  
  if (query.trim().length < minLength) {
    return { valid: false, error: `Please enter at least ${minLength} characters` };
  }
  
  return { valid: true, error: null };
};

/**
 * Validate percentage
 * 
 * @param {string|number} percentage - Percentage to validate
 * @returns {object} - { valid: boolean, error: string }
 */
export const validatePercentage = (percentage) => {
  const num = parseFloat(percentage);
  
  if (!percentage || percentage.toString().trim() === '') {
    return { valid: false, error: 'Percentage is required' };
  }
  
  if (isNaN(num)) {
    return { valid: false, error: 'Please enter a valid number' };
  }
  
  if (num < 0 || num > 100) {
    return { valid: false, error: 'Percentage must be between 0 and 100' };
  }
  
  return { valid: true, error: null };
};

/**
 * Validate fund code
 * 
 * @param {string|number} code - Fund code
 * @returns {object} - { valid: boolean, error: string }
 */
export const validateFundCode = (code) => {
  if (!code || code.toString().trim() === '') {
    return { valid: false, error: 'Fund code is required' };
  }
  
  const codeStr = code.toString().trim();
  if (codeStr.length < 3) {
    return { valid: false, error: 'Invalid fund code' };
  }
  
  return { valid: true, error: null };
};

/**
 * Sanitize and validate all calculator inputs
 * 
 * @param {object} inputs - Calculator inputs
 * @returns {object} - { valid: boolean, errors: object }
 */
export const validateCalculatorInputs = (inputs) => {
  const errors = {};
  let valid = true;
  
  if (inputs.amount) {
    const amountValidation = validateAmount(inputs.amount);
    if (!amountValidation.valid) {
      errors.amount = amountValidation.error;
      valid = false;
    }
  }
  
  if (inputs.years) {
    const yearsValidation = validateYears(inputs.years);
    if (!yearsValidation.valid) {
      errors.years = yearsValidation.error;
      valid = false;
    }
  }
  
  if (inputs.returnRate) {
    const rateValidation = validateReturnRate(inputs.returnRate);
    if (!rateValidation.valid) {
      errors.returnRate = rateValidation.error;
      valid = false;
    }
  }
  
  return { valid, errors };
};
