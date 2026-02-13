// ============================================================
// 📁 utils/calculations.js
// ============================================================
// WHAT THIS FILE DOES:
//   Contains ALL the math formulas used by the tools.
//   No UI code here — just pure calculations.
//   Each function takes inputs and returns a result object.
//
// WHY IT EXISTS:
//   - One place to fix/update formulas
//   - Can be tested independently (no React needed)
//   - Reusable across different screens
//
// WHAT IT REPLACES IN App.js:
//   Lines ~502-673 → calculateSIP, calculateGoal, calculateComparison,
//                     calculateRiskScore, calculateTaxSavings functions.
// ============================================================


// ── SIP Calculator ───────────────────────────────────────────
// Formula: FV = P × [(1 + r)^n - 1] / r × (1 + r)
//   P = Monthly investment amount
//   r = Monthly interest rate (annual rate / 12 / 100)
//   n = Total months (years × 12)
//
// Returns: { total, invested, returns } or null if inputs are invalid
export const calculateSIP = (amount, years, annualReturn) => {
  const P = parseFloat(amount);
  const n = parseFloat(years) * 12;            // Convert years → months
  const r = parseFloat(annualReturn) / 100 / 12; // Convert annual % → monthly decimal

  // Validation: all values must be positive numbers
  if (!P || !n || !r || P <= 0 || n <= 0 || r < 0) {
    return null;  // Caller should show an error
  }

  const futureValue = P * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
  const totalInvested = P * n;
  const returns = futureValue - totalInvested;

  return {
    total: Math.round(futureValue),
    invested: Math.round(totalInvested),
    returns: Math.round(returns),
  };
};


// ── Goal Planner (Reverse SIP) ──────────────────────────────
// Given a target amount, how much to invest per month?
// Formula: P = FV × r / [((1 + r)^n - 1) × (1 + r)]
//   FV = Target/goal amount
//   r  = Monthly rate
//   n  = Total months
//
// Returns: { monthly, total, target } or null if invalid
export const calculateGoal = (targetAmount, years, annualReturn) => {
  const FV = parseFloat(targetAmount);
  const n = parseFloat(years) * 12;
  const r = parseFloat(annualReturn) / 100 / 12;

  if (!FV || !n || !r || FV <= 0 || n <= 0 || r < 0) {
    return null;
  }

  const monthlyInvestment = (FV * r) / ((Math.pow(1 + r, n) - 1) * (1 + r));
  const totalInvested = monthlyInvestment * n;

  return {
    monthly: Math.round(monthlyInvestment),
    total: Math.round(totalInvested),
    target: Math.round(FV),
  };
};


// ── Lumpsum vs SIP Comparison ────────────────────────────────
// Compares investing all money at once (lumpsum) vs spreading it monthly (SIP).
//
// Lumpsum Formula: FV = P × (1 + r)^n
// SIP Formula:     Same as calculateSIP but monthly amount = total / (years × 12)
//
// Returns: { lumpsum: {...}, sip: {...}, winner: 'Lumpsum' | 'SIP' } or null
export const calculateComparison = (totalAmount, years, annualReturn) => {
  const amount = parseFloat(totalAmount);
  const yrs = parseFloat(years);
  const rate = parseFloat(annualReturn) / 100;  // Annual decimal rate

  if (!amount || !yrs || !rate || amount <= 0 || yrs <= 0 || rate < 0) {
    return null;
  }

  // Lumpsum: invest everything now, let it compound
  const lumpsumFV = amount * Math.pow(1 + rate, yrs);
  const lumpsumReturns = lumpsumFV - amount;

  // SIP: divide total into equal monthly parts
  const monthlyAmount = amount / (yrs * 12);
  const n = yrs * 12;
  const r = rate / 12;
  const sipFV = monthlyAmount * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
  const sipReturns = sipFV - amount;

  return {
    lumpsum: {
      invested: Math.round(amount),
      returns: Math.round(lumpsumReturns),
      total: Math.round(lumpsumFV),
    },
    sip: {
      monthly: Math.round(monthlyAmount),
      invested: Math.round(amount),
      returns: Math.round(sipReturns),
      total: Math.round(sipFV),
    },
    winner: sipFV > lumpsumFV ? 'SIP' : 'Lumpsum',
  };
};


// ── Risk Score Calculator ────────────────────────────────────
// Takes quiz answers (5 questions, each scored 1-5)
// Total max score = 25
// Maps to Conservative / Moderate / Aggressive profile
//
// Input:  riskAnswers = { 1: 3, 2: 5, 3: 4, 4: 5, 5: 4 }
// Returns: { score, percentage, profile, description, funds } or null
export const calculateRiskScore = (riskAnswers) => {
  const answers = Object.values(riskAnswers);

  if (answers.length < 5) {
    return null;  // Not all questions answered
  }

  const score = answers.reduce((sum, val) => sum + val, 0);
  const percentage = (score / 25) * 100;

  let profile, description, funds;

  if (percentage <= 40) {
    profile = 'Conservative';
    description = 'You prefer safety over high returns. Focus on debt funds and balanced funds.';
    funds = ['Liquid Funds', 'Short Duration Funds', 'Corporate Bond Funds', 'Balanced Advantage Funds'];
  } else if (percentage <= 70) {
    profile = 'Moderate';
    description = 'You can handle moderate risk for better returns. Mix of equity and debt funds.';
    funds = ['Hybrid Funds', 'Large Cap Funds', 'Balanced Funds', 'Index Funds'];
  } else {
    profile = 'Aggressive';
    description = 'You can handle high risk for maximum returns. Focus on equity funds.';
    funds = ['Small Cap Funds', 'Mid Cap Funds', 'Sectoral Funds', 'Flexi Cap Funds'];
  }

  return { score, percentage, profile, description, funds };
};


// ── Tax Savings Calculator ───────────────────────────────────
// Calculates how much tax you save by investing in ELSS funds
// under Section 80C (max ₹1.5 lakh deduction).
//
// Tax slabs (Old Regime):
//   ≤ 2.5L  → 0%
//   ≤ 5L    → 5%
//   ≤ 10L   → 20%
//   > 10L   → 30%
//
// Returns: { investment, deduction, taxSaved, effectiveCost } or null
export const calculateTaxSavings = (annualIncome, investmentAmount) => {
  const income = parseFloat(annualIncome);
  const investment = parseFloat(investmentAmount);

  if (!income || !investment || income <= 0 || investment <= 0) {
    return null;
  }

  const maxDeduction = Math.min(investment, 150000); // 80C cap = ₹1.5L
  let taxSaved = 0;

  if (income <= 250000) taxSaved = 0;
  else if (income <= 500000) taxSaved = maxDeduction * 0.05;
  else if (income <= 1000000) taxSaved = maxDeduction * 0.20;
  else taxSaved = maxDeduction * 0.30;

  return {
    investment: Math.round(investment),
    deduction: Math.round(maxDeduction),
    taxSaved: Math.round(taxSaved),
    effectiveCost: Math.round(investment - taxSaved),
  };
};
