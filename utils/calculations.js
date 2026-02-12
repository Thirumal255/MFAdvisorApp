/**
 * CALCULATION UTILITIES
 * 
 * Financial calculation functions for SIP, Lumpsum, XIRR, etc.
 */

/**
 * Calculate SIP Future Value
 * Formula: FV = P × ({[1 + r]^n - 1} / r) × (1 + r)
 * 
 * @param {number} monthlyAmount - Monthly SIP amount
 * @param {number} years - Investment duration in years
 * @param {number} annualReturn - Expected annual return (as percentage, e.g., 12 for 12%)
 * @returns {object} - { invested, returns, total }
 */
export const calculateSIP = (monthlyAmount, years, annualReturn) => {
  const months = years * 12;
  const monthlyRate = (annualReturn / 100) / 12;
  
  const futureValue = monthlyAmount * 
    (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
  
  const invested = monthlyAmount * months;
  const returns = futureValue - invested;
  
  return {
    invested: Math.round(invested),
    returns: Math.round(returns),
    total: Math.round(futureValue),
  };
};

/**
 * Calculate Lumpsum Future Value
 * Formula: FV = P × (1 + r)^n
 * 
 * @param {number} amount - Initial lumpsum amount
 * @param {number} years - Investment duration in years
 * @param {number} annualReturn - Expected annual return (as percentage)
 * @returns {object} - { invested, returns, total }
 */
export const calculateLumpsum = (amount, years, annualReturn) => {
  const rate = annualReturn / 100;
  const futureValue = amount * Math.pow(1 + rate, years);
  const returns = futureValue - amount;
  
  return {
    invested: Math.round(amount),
    returns: Math.round(returns),
    total: Math.round(futureValue),
  };
};

/**
 * Calculate required monthly SIP for a goal
 * Reverse SIP formula: P = FV × (r / {[1 + r]^n - 1}) / (1 + r)
 * 
 * @param {number} targetAmount - Goal amount
 * @param {number} years - Time to achieve goal
 * @param {number} annualReturn - Expected annual return (as percentage)
 * @returns {number} - Required monthly SIP amount
 */
export const calculateRequiredSIP = (targetAmount, years, annualReturn) => {
  const months = years * 12;
  const monthlyRate = (annualReturn / 100) / 12;
  
  const requiredSIP = targetAmount * 
    (monthlyRate / ((Math.pow(1 + monthlyRate, months) - 1) * (1 + monthlyRate)));
  
  return Math.round(requiredSIP);
};

/**
 * Calculate step-up SIP (increasing SIP amount yearly)
 * 
 * @param {number} initialAmount - Starting SIP amount
 * @param {number} years - Investment duration
 * @param {number} annualReturn - Expected return (percentage)
 * @param {number} stepUp - Annual increase (percentage, e.g., 10 for 10%)
 * @returns {object} - { invested, returns, total }
 */
export const calculateStepUpSIP = (initialAmount, years, annualReturn, stepUp) => {
  let totalInvested = 0;
  let totalValue = 0;
  let currentSIP = initialAmount;
  const monthlyReturn = (annualReturn / 100) / 12;
  
  for (let year = 0; year < years; year++) {
    for (let month = 0; month < 12; month++) {
      totalInvested += currentSIP;
      totalValue = (totalValue + currentSIP) * (1 + monthlyReturn);
    }
    currentSIP = currentSIP * (1 + stepUp / 100); // Increase for next year
  }
  
  return {
    invested: Math.round(totalInvested),
    returns: Math.round(totalValue - totalInvested),
    total: Math.round(totalValue),
  };
};

/**
 * Calculate XIRR (Extended Internal Rate of Return)
 * Simplified Newton-Raphson method
 * 
 * @param {Array} cashflows - Array of {date: Date, amount: number}
 * @returns {number} - XIRR as percentage
 */
export const calculateXIRR = (cashflows) => {
  // Sort by date
  cashflows.sort((a, b) => a.date - b.date);
  
  const firstDate = cashflows[0].date;
  
  // Convert to days from first investment
  const flows = cashflows.map(cf => ({
    days: Math.floor((cf.date - firstDate) / (1000 * 60 * 60 * 24)),
    amount: cf.amount,
  }));
  
  // Newton-Raphson iteration
  let rate = 0.1; // Initial guess 10%
  const maxIterations = 100;
  const tolerance = 0.0001;
  
  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let derivative = 0;
    
    flows.forEach(flow => {
      const years = flow.days / 365;
      npv += flow.amount / Math.pow(1 + rate, years);
      derivative -= years * flow.amount / Math.pow(1 + rate, years + 1);
    });
    
    const newRate = rate - npv / derivative;
    
    if (Math.abs(newRate - rate) < tolerance) {
      return (newRate * 100); // Return as percentage
    }
    
    rate = newRate;
  }
  
  return (rate * 100);
};

/**
 * Calculate compound annual growth rate (CAGR)
 * Formula: CAGR = (Ending Value / Beginning Value)^(1/years) - 1
 * 
 * @param {number} beginningValue - Initial investment
 * @param {number} endingValue - Final value
 * @param {number} years - Number of years
 * @returns {number} - CAGR as percentage
 */
export const calculateCAGR = (beginningValue, endingValue, years) => {
  const cagr = (Math.pow(endingValue / beginningValue, 1 / years) - 1) * 100;
  return cagr;
};

/**
 * Calculate absolute returns
 * 
 * @param {number} invested - Amount invested
 * @param {number} current - Current value
 * @returns {object} - { absolute, percentage }
 */
export const calculateReturns = (invested, current) => {
  const absolute = current - invested;
  const percentage = (absolute / invested) * 100;
  
  return {
    absolute: Math.round(absolute),
    percentage: percentage.toFixed(2),
  };
};

/**
 * Calculate tax on capital gains
 * 
 * @param {number} gains - Capital gains amount
 * @param {string} fundType - 'equity' or 'debt'
 * @param {number} holdingPeriod - Months held
 * @returns {object} - { taxAmount, taxRate, taxType }
 */
export const calculateTax = (gains, fundType, holdingPeriod) => {
  if (fundType === 'equity') {
    if (holdingPeriod >= 12) {
      // LTCG - 12.5% above 1.25 lakhs
      const exemptAmount = 125000;
      const taxableGains = Math.max(0, gains - exemptAmount);
      return {
        taxAmount: taxableGains * 0.125,
        taxRate: 12.5,
        taxType: 'LTCG',
        exempt: Math.min(gains, exemptAmount),
      };
    } else {
      // STCG - 20%
      return {
        taxAmount: gains * 0.20,
        taxRate: 20,
        taxType: 'STCG',
        exempt: 0,
      };
    }
  } else {
    // Debt funds
    if (holdingPeriod >= 36) {
      // LTCG - 20% with indexation (simplified)
      return {
        taxAmount: gains * 0.20 * 0.7, // Approximate after indexation
        taxRate: 20,
        taxType: 'LTCG (with indexation)',
        exempt: 0,
      };
    } else {
      // STCG - As per slab (assume 30%)
      return {
        taxAmount: gains * 0.30,
        taxRate: 30,
        taxType: 'STCG (slab rate)',
        exempt: 0,
      };
    }
  }
};

/**
 * Calculate inflation-adjusted amount
 * 
 * @param {number} amount - Today's amount
 * @param {number} years - Number of years
 * @param {number} inflationRate - Annual inflation rate (percentage)
 * @returns {number} - Future value adjusted for inflation
 */
export const calculateInflationAdjusted = (amount, years, inflationRate = 6) => {
  return amount * Math.pow(1 + inflationRate / 100, years);
};
