import { ArrowLeft, Bell, ChevronRight, Flame, MessageSquare, Search, Trophy, Upload } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Navigation } from './components/Navigation';
import { API_ENDPOINTS } from './config/api';
import { learnContent } from './learnContent';
import { styles } from './styles/appStyles';


export default function App() {
  const [screen, setScreen] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFund, setSelectedFund] = useState(null);
  const [showVariants, setShowVariants] = useState(false);
  const [showManagers, setShowManagers] = useState(false);
  const [loading, setLoading] = useState(false);
  // Existing SIP states
const [activeTool, setActiveTool] = useState(null);
const [sipAmount, setSipAmount] = useState('');
const [sipYears, setSipYears] = useState('');
const [sipReturn, setSipReturn] = useState('');
const [sipResult, setSipResult] = useState(null);

// NEW: Goal Planner states
const [goalAmount, setGoalAmount] = useState('');
const [goalYears, setGoalYears] = useState('');
const [goalReturn, setGoalReturn] = useState('');
const [goalResult, setGoalResult] = useState(null);

// NEW: Lumpsum vs SIP states
const [compareAmount, setCompareAmount] = useState('');
const [compareYears, setCompareYears] = useState('');
const [compareReturn, setCompareReturn] = useState('');
const [compareResult, setCompareResult] = useState(null);

// NEW: Fund Compare states
const [selectedFunds, setSelectedFunds] = useState([]);
const [fundSearchQuery, setFundSearchQuery] = useState('');
const [fundSearchResults, setFundSearchResults] = useState([]);
const [compareData, setCompareData] = useState(null);

// NEW: Risk Analyzer states
const [riskAnswers, setRiskAnswers] = useState({});
const [riskResult, setRiskResult] = useState(null);

// NEW: Tax Optimizer states
const [taxIncome, setTaxIncome] = useState('');
const [taxInvestment, setTaxInvestment] = useState('');
const [taxResult, setTaxResult] = useState(null);
const [elssFunds, setElssFunds] = useState([]);

// Learn Section states
const [selectedTopic, setSelectedTopic] = useState(null);
const [activeTab, setActiveTab] = useState('beginner'); // 'beginner', 'advanced', 'tips', 'glossary'

// PHASE 5: My Fund Analyzer states
const [myFundCode, setMyFundCode] = useState(null);
const [myFundData, setMyFundData] = useState(null);
const [recommendations, setRecommendations] = useState([]);
const [compareMode, setCompareMode] = useState(false);
const [compareFund1, setCompareFund1] = useState(null);
const [compareFund2, setCompareFund2] = useState(null);
const [comparisonData, setComparisonData] = useState(null);
const [previousScreen, setPreviousScreen] = useState('home');  


// NEW: Top Funds states
const [topFunds, setTopFunds] = useState([]);
const [topFundsCategory, setTopFundsCategory] = useState(null);
const [refreshing, setRefreshing] = useState(false);
  
// NEW: Enhanced metrics view state
const [metricsTab, setMetricsTab] = useState('returns');

// PHASE 3: Score breakdown visibility
const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);

// Investment Comparison States
const [expandedCalculators, setExpandedCalculators] = useState({});
const [investmentInputs, setInvestmentInputs] = useState({});
const [comparisonResults, setComparisonResults] = useState({});
const [calculatingReturns, setCalculatingReturns] = useState({});
const [showDatePicker, setShowDatePicker] = useState(false);
const [activeDatePickerIndex, setActiveDatePickerIndex] = useState(null);


// Format Date to DD-MM-YYYY
const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Toggle calculator
const toggleCalculator = (index) => {
  setExpandedCalculators(prev => ({
    ...prev,
    [index]: !prev[index]
  }));
  
  if (!investmentInputs[index]) {
    setInvestmentInputs(prev => ({
      ...prev,
      [index]: { amount: '', date: '' }
    }));
  }
};

// Update investment input
const updateInvestmentInput = (index, field, value) => {
  setInvestmentInputs(prev => ({
    ...prev,
    [index]: {
      ...prev[index],
      [field]: value
    }
  }));
};

// Open date picker
const openDatePicker = (index) => {
  setActiveDatePickerIndex(index);
  setShowDatePicker(true);
};

// Handle date selection
const handleDateConfirm = (selectedDate) => {
  if (activeDatePickerIndex !== null) {
    updateInvestmentInput(activeDatePickerIndex, 'date', formatDate(selectedDate));
  }
  setShowDatePicker(false);
  setActiveDatePickerIndex(null);
};

// Format currency
const formatCurrency = (amount) => {
  const num = parseFloat(amount);
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  } else {
    return `₹${num.toLocaleString('en-IN')}`;
  }
};

// Call backend API for comparison
const calculateInvestmentComparison = async (index, fund1Code, fund2Code) => {
  const inputs = investmentInputs[index];
  
  if (!inputs || !inputs.amount || !inputs.date) {
    Alert.alert('Missing Information', 'Please enter both amount and date');
    return;
  }

  const amount = parseFloat(inputs.amount);
  if (isNaN(amount) || amount <= 0) {
    Alert.alert('Invalid Amount', 'Please enter a valid positive amount');
    return;
  }

  setCalculatingReturns(prev => ({ ...prev, [index]: true }));

  try {
    const response = await fetch(API_ENDPOINTS.COMPARE_INVESTMENT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fund1_code: parseInt(fund1Code),
        fund2_code: parseInt(fund2Code),
        investment_date: inputs.date,
        investment_amount: amount
      })
    });

    // ✅ UPDATED: Handle errors without throwing
    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.detail || 'Failed to calculate comparison';
      
      // Show user-friendly alert based on error type
      if (errorMessage.includes('started on')) {
        Alert.alert(
          'Investment Date Too Early',
          errorMessage
        );
      } else if (errorMessage.includes('Cannot compare')) {
        Alert.alert(
          'Cannot Compare Funds',
          errorMessage
        );
      } else {
        Alert.alert('Error', errorMessage);
      }
      
      setCalculatingReturns(prev => ({ ...prev, [index]: false }));
      return;  // Exit early
    }

    const data = await response.json();
    
    // Transform API response
    const transformedData = {
      currentFund: {
        investedAmount: data.fund1.investment.amount,
        currentValue: data.fund1.current.value,
        absoluteReturns: data.fund1.returns.absolute,
        returnPercentage: data.fund1.returns.percentage,
        xirr: data.fund1.returns.xirr,
        investmentDate: data.fund1.investment.date
      },
      recommendedFund: {
        investedAmount: data.fund2.investment.amount,
        currentValue: data.fund2.current.value,
        absoluteReturns: data.fund2.returns.absolute,
        returnPercentage: data.fund2.returns.percentage,
        xirr: data.fund2.returns.xirr,
        investmentDate: data.fund2.investment.date
      },
      difference: {
        value: data.comparison.value_difference,
        percentage: data.comparison.percentage_difference,
        xirr: data.comparison.xirr_difference,
        isPositive: data.comparison.is_fund2_better,
        text: data.comparison.improvement_text
      },
      adjustment: data.adjustment || { adjusted: false }
    };
    
    setComparisonResults(prev => ({
      ...prev,
      [index]: transformedData
    }));

    console.log('✅ Comparison successful:', transformedData);

  } catch (error) {
    // ✅ UPDATED: Handle unexpected errors
    console.error('❌ Comparison error:', error);
    Alert.alert(
      'Error', 
      'An unexpected error occurred. Please check your connection and try again.'
    );
  } finally {
    setCalculatingReturns(prev => ({ ...prev, [index]: false }));
  }
};



// NEW: Fetch top funds
  useEffect(() => {
    if (screen === 'topFunds') {
      fetchTopFunds();
    }
  }, [screen, topFundsCategory]);

  const fetchTopFunds = async () => {
    try {
      setLoading(true);
      const baseUrl = API_ENDPOINTS.TOP_FUNDS.replace(/\/$/, '');
      let url = `${baseUrl}?limit=20`;
      if (topFundsCategory) {
        url += `&category=${topFundsCategory}`;
      }
      console.log('🔍 [DEBUG] Fetching top funds from:', url);
      const response = await fetch(url);
      const data = await response.json();
      
      // Debug: Check if score field exists
      if (data.results && data.results.length > 0) {
        const firstFund = data.results[0];
        console.log('🔍 [DEBUG] First fund data sample:');
        console.log('  - name:', firstFund.name);
        console.log('  - composite_score:', firstFund.composite_score);
        console.log('  - score:', firstFund.score);
        console.log('  - score.total:', firstFund.score?.total);
        console.log('  - Fields:', Object.keys(firstFund));
      }
      
      setTopFunds(data.results || []);
    } catch (error) {
      console.log('❌ [DEBUG] Top funds error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefreshTopFunds = () => {
    setRefreshing(true);
    fetchTopFunds();
  };

  // Helper: Get score color
  const getScoreColor = (score) => {
    if (score >= 75) return '#10B981';
    if (score >= 60) return '#F59E0B';
    if (score >= 40) return '#6366F1';
    return '#6B7280';
  };

  const getScoreEmoji = (score) => {
    if (score >= 75) return '🔥🔥🔥';
    if (score >= 60) return '🔥';
    if (score >= 40) return '✨';
    return '📊';
  };


  // PHASE 3: Format metric names for display
  const formatMetricName = (metric) => {
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
      'calmar_ratio': 'Calmar Ratio'
    };
    return names[metric] || metric.replace(/_/g, ' ').toUpperCase();
  };

  // PHASE 3: Format metric values for display
  const formatMetricValue = (metric, value) => {
    if (value == null) return 'N/A';
    
    // Percentage metrics (multiply by 100)
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



// Search for funds
  const searchFunds = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const cleanQuery = encodeURIComponent(query.trim());
      const response = await fetch(`${API_ENDPOINTS.SEARCH}?q=${cleanQuery}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.log('Search error:', error);
      alert('Could not connect to server!');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Get fund details
  const getFundDetails = async (code) => {
    setLoading(true);
    setMetricsTab('returns');
    
    const cleanCode = String(code).trim();
    
    console.log('🔍 [DEBUG] getFundDetails called with code:', cleanCode);
    
    try {
      const response = await fetch(`${API_ENDPOINTS.FUND_DETAILS}/${cleanCode}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('📦 [DEBUG] Received fund data for:', data.name);
      console.log('📦 [DEBUG] Fund data keys:', Object.keys(data));
      
      // Deep inspection of problematic fields
      console.log('🔍 [DEBUG] Field type checks:');
      console.log('  - managers type:', typeof data.managers, '| value:', data.managers);
      console.log('  - expense type:', typeof data.expense, '| value:', data.expense);
      console.log('  - annual_expense type:', typeof data.annual_expense, '| value:', data.annual_expense);
      console.log('  - asset_allocation type:', typeof data.asset_allocation);
      console.log('  - benchmark type:', typeof data.benchmark);
      console.log('  - exit_load type:', typeof data.exit_load);
      console.log('  - fund_managers type:', typeof data.fund_managers);
      
      // Check for non-primitive types
      const problematicFields = [];
      Object.keys(data).forEach(key => {
        const value = data[key];
        const type = typeof value;
        if (value !== null && type === 'object' && !Array.isArray(value) && 
            key !== 'metrics' && key !== 'expense' && key !== 'annual_expense') {
          problematicFields.push(`${key}: ${type}`);
        }
        if (Array.isArray(value) && key !== 'variants' && key !== 'isins') {
          problematicFields.push(`${key}: array`);
        }
      });
      
      if (problematicFields.length > 0) {
        console.warn('⚠️ [DEBUG] Potentially problematic fields:', problematicFields);
      }
      
      if (!data || !data.name) {
        throw new Error('Invalid fund data');
      }
      
      console.log('✅ [DEBUG] Setting fund data in state');
      setSelectedFund(data);
      console.log('✅ [DEBUG] Fund data set successfully');
      
    } catch (error) {
      console.error('❌ [DEBUG] Error in getFundDetails:', error);
      alert(`Could not load fund: ${error.message}`);
      setSelectedFund(null);
    } finally {
      setLoading(false);
    }
  };

// PHASE 5: Get Recommendations
const getRecommendations = async (fundCode) => {
  setLoading(true);
  try {
    const response = await fetch(`${API_ENDPOINTS.RECOMMENDATIONS}/${fundCode}?limit=5&min_score_diff=5`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    setMyFundData(data.user_fund);
    setRecommendations(data.recommendations || []);
  } catch (error) {
    console.log('❌ Recommendations error:', error);
    alert('Could not fetch recommendations');
  } finally {
    setLoading(false);
  }
};

// PHASE 5: Compare Two Funds
const compareTwoFunds = async (code1, code2) => {
  setLoading(true);
  try {
    const response = await fetch(`${API_ENDPOINTS.COMPARE}/${code1}/${code2}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    setComparisonData(data);
    setCompareFund1(data.fund1);
    setCompareFund2(data.fund2);
    setCompareMode(true);
    setScreen('compare');
  } catch (error) {
    console.log('❌ Comparison error:', error);
    alert('Could not compare funds');
  } finally {
    setLoading(false);
  }
};






  // SIP Calculation Function
const calculateSIP = () => {
  const P = parseFloat(sipAmount);
  const n = parseFloat(sipYears) * 12; // months
  const r = parseFloat(sipReturn) / 100 / 12; // monthly rate

  if (!P || !n || !r || P <= 0 || n <= 0 || r < 0) {
    alert('Please enter valid values!');
    return;
  }

  // SIP Formula: FV = P × [(1 + r)^n - 1] / r × (1 + r)
  const futureValue = P * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
  const totalInvested = P * n;
  const returns = futureValue - totalInvested;

  setSipResult({
    total: Math.round(futureValue),
    invested: Math.round(totalInvested),
    returns: Math.round(returns)
  });
};


// Goal Planner Calculation
const calculateGoal = () => {
  const FV = parseFloat(goalAmount);
  const n = parseFloat(goalYears) * 12;
  const r = parseFloat(goalReturn) / 100 / 12;

  if (!FV || !n || !r || FV <= 0 || n <= 0 || r < 0) {
    alert('Please enter valid values!');
    return;
  }

  // Reverse SIP: P = FV × r / [((1 + r)^n - 1) × (1 + r)]
  const monthlyInvestment = (FV * r) / (((Math.pow(1 + r, n) - 1)) * (1 + r));
  const totalInvested = monthlyInvestment * n;

  setGoalResult({
    monthly: Math.round(monthlyInvestment),
    total: Math.round(totalInvested),
    target: Math.round(FV)
  });
};

// Lumpsum vs SIP Calculation
const calculateComparison = () => {
  const amount = parseFloat(compareAmount);
  const years = parseFloat(compareYears);
  const rate = parseFloat(compareReturn) / 100;

  if (!amount || !years || !rate || amount <= 0 || years <= 0 || rate < 0) {
    alert('Please enter valid values!');
    return;
  }

  // Lumpsum: FV = P × (1 + r)^n
  const lumpsumFV = amount * Math.pow(1 + rate, years);
  const lumpsumReturns = lumpsumFV - amount;

  // SIP: Monthly amount = Lumpsum / 12 / years
  const monthlyAmount = amount / (years * 12);
  const n = years * 12;
  const r = rate / 12;
  const sipFV = monthlyAmount * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
  const sipReturns = sipFV - amount;

  setCompareResult({
    lumpsum: {
      invested: Math.round(amount),
      returns: Math.round(lumpsumReturns),
      total: Math.round(lumpsumFV)
    },
    sip: {
      monthly: Math.round(monthlyAmount),
      invested: Math.round(amount),
      returns: Math.round(sipReturns),
      total: Math.round(sipFV)
    },
    winner: sipFV > lumpsumFV ? 'SIP' : 'Lumpsum'
  });
};

// Fund Compare - Search Funds
const searchFundsForCompare = async (query) => {
  if (query.length < 2) {
    setFundSearchResults([]);
    return;
  }

  try {
    const response = await fetch(`${API_ENDPOINTS.SEARCH}?q=${query}`);
    const data = await response.json();
    setFundSearchResults(data.results || []);
  } catch (error) {
    console.log('Search error:', error);
  }
};

// Fund Compare - Add Fund
const addFundToCompare = async (code) => {
  if (selectedFunds.length >= 3) {
    alert('You can compare maximum 3 funds!');
    return;
  }

  try {
    const response = await fetch(`${API_ENDPOINTS.FUND_DETAILS}/${code}`);
    const data = await response.json();
    setSelectedFunds([...selectedFunds, data]);
    setFundSearchQuery('');
    setFundSearchResults([]);
  } catch (error) {
    console.log('Error loading fund:', error);
  }
};

// Risk Analyzer Calculation
const calculateRiskScore = () => {
  const answers = Object.values(riskAnswers);
  if (answers.length < 5) {
    alert('Please answer all questions!');
    return;
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

  setRiskResult({ score, percentage, profile, description, funds });
};

// Tax Optimizer Calculation
const calculateTaxSavings = () => {
  const income = parseFloat(taxIncome);
  const investment = parseFloat(taxInvestment);

  if (!income || !investment || income <= 0 || investment <= 0) {
    alert('Please enter valid values!');
    return;
  }

  const maxDeduction = Math.min(investment, 150000); // 80C limit
  let taxSaved = 0;

  if (income <= 250000) taxSaved = 0;
  else if (income <= 500000) taxSaved = maxDeduction * 0.05;
  else if (income <= 1000000) taxSaved = maxDeduction * 0.20;
  else taxSaved = maxDeduction * 0.30;

  setTaxResult({
    investment: Math.round(investment),
    deduction: Math.round(maxDeduction),
    taxSaved: Math.round(taxSaved),
    effectiveCost: Math.round(investment - taxSaved)
  });
};

// Load ELSS Funds
const loadElssFunds = async () => {
  try {
    const response = await fetch(`${API_ENDPOINTS.SEARCH}?q=elss`);
    const data = await response.json();
    setElssFunds(data.results || []);
  } catch (error) {
    console.log('Error loading ELSS funds:', error);
  }
};



  // Navigation imported from components/Navigation.js


  // ========== HOME SCREEN ==========
  if (screen === 'home') {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>hey bestie 👋</Text>
              <Text style={styles.userName}>Investor</Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Bell size={18} color="#fff" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>

          <View style={styles.streakCard}>
            <View style={styles.streakHeader}>
              <View style={styles.streakTitle}>
                <Flame size={24} color="#FB923C" />
                <Text style={styles.streakText}>7 Day Streak! 🔥</Text>
              </View>
              <Trophy size={32} color="#FBBF24" />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>what u wanna do?</Text>
            
            <TouchableOpacity 
              style={[styles.actionCard, styles.purpleGradient]}
              onPress={() => {
                setPreviousScreen('home');  // ✅ ADD THIS
                setScreen('check');
                setSelectedFund(null);  // ✅ ADD THIS - Clear any previous fund
            }}
            >
              <View style={styles.actionContent}>
                <View style={styles.actionLeft}>
                  <View style={styles.actionIcon}>
                    <Search size={24} color="#fff" />
                  </View>
                  <View>
                    <Text style={styles.actionTitle}>Search For a Fund</Text>
                    <Text style={styles.actionSubtitle}>is it fire? 🔍</Text>
                  </View>
                </View>
                <ChevronRight size={24} color="#fff" />
              </View>
            </TouchableOpacity>

            
            <TouchableOpacity 
              style={[styles.actionCard, styles.orangeGradient]}
              onPress={() => setScreen('advisor')}
            >
              <View style={styles.actionContent}>
                <View style={styles.actionLeft}>
                  <View style={styles.actionIcon}>
                    <MessageSquare size={24} color="#fff" />
                  </View>
                  <View>
                    <Text style={styles.actionTitle}>Fresh Investment</Text>
                    <Text style={styles.actionSubtitle}>AI picks 4 u 🤖</Text>
                  </View>
                </View>
                <ChevronRight size={24} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
          

          {/* ========== PHASE 5: MY FUND ANALYZER ========== */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 my investments</Text>
            
            <TouchableOpacity 
              style={[styles.actionCard, styles.greenGradient]}
              onPress={() => setScreen('myFundAnalyzer')}
            >
              <View style={styles.actionContent}>
                <View style={styles.actionLeft}>
                  <View style={styles.actionIcon}>
                    <Search size={24} color="#fff" />
                  </View>
                  <View>
                    <Text style={styles.actionTitle}>My Fund Analyzer</Text>
                    <Text style={styles.actionSubtitle}>find better funds 🎯</Text>
                  </View>
                </View>
                <ChevronRight size={24} color="#fff" />
              </View>
            </TouchableOpacity>

            
            <TouchableOpacity 
              style={[styles.actionCard, styles.blueGradient]}
              onPress={() => setScreen('import')}
            >
              <View style={styles.actionContent}>
                <View style={styles.actionLeft}>
                  <View style={styles.actionIcon}>
                    <Upload size={24} color="#fff" />
                  </View>
                  <View>
                    <Text style={styles.actionTitle}>Import Portfolio</Text>
                    <Text style={styles.actionSubtitle}>upload excel ☕</Text>
                  </View>
                </View>
                <ChevronRight size={24} color="#fff" />
              </View>
            </TouchableOpacity>


          </View>

          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>market vibes</Text>
            <View style={styles.marketGrid}>
              <View style={[styles.marketCard, styles.greenCard]}>
                <Text style={styles.marketLabel}>📈 Nifty 50</Text>
                <Text style={styles.marketValue}>23,456</Text>
                <Text style={styles.marketChange}>+1.2%</Text>
              </View>
              <View style={[styles.marketCard, styles.blueCard]}>
                <Text style={styles.marketLabel}>💹 Sensex</Text>
                <Text style={styles.marketValue}>77,234</Text>
                <Text style={styles.marketChange}>+0.8%</Text>
              </View>
            </View>
          </View>
        </ScrollView>
        <Navigation 
          screen={screen}
          setScreen={setScreen}
          setSelectedFund={setSelectedFund}
          setActiveTool={setActiveTool}
          setSelectedTopic={setSelectedTopic}
        />
      </View>
    );
  }

 // ========== TOP FUNDS SCREEN (NEW) ==========
  if (screen === 'topFunds') {
    if (loading && !refreshing) {
      return (
        <View style={styles.container}>
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#A855F7" />
            <Text style={styles.loadingText}>Loading top funds...</Text>
          </View>
          <Navigation 
          screen={screen}
          setScreen={setScreen}
          setSelectedFund={setSelectedFund}
          setActiveTool={setActiveTool}
          setSelectedTopic={setSelectedTopic}
        />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View style={styles.headerPurple}>
          <Text style={styles.pageTitle}>🏆 Top Performing Funds</Text>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterScrollContainer}
        >
          <TouchableOpacity
            style={[styles.filterChip, !topFundsCategory && styles.filterChipActive]}
            onPress={() => setTopFundsCategory(null)}
          >
            <Text style={[styles.filterText, !topFundsCategory && styles.filterTextActive]}>All</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, topFundsCategory === 'equity' && styles.filterChipActive]}
            onPress={() => setTopFundsCategory('equity')}
          >
            <Text style={[styles.filterText, topFundsCategory === 'equity' && styles.filterTextActive]}>Equity</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, topFundsCategory === 'debt' && styles.filterChipActive]}
            onPress={() => setTopFundsCategory('debt')}
          >
            <Text style={[styles.filterText, topFundsCategory === 'debt' && styles.filterTextActive]}>Debt</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, topFundsCategory === 'hybrid' && styles.filterChipActive]}
            onPress={() => setTopFundsCategory('hybrid')}
          >
            <Text style={[styles.filterText, topFundsCategory === 'hybrid' && styles.filterTextActive]}>Hybrid</Text>
          </TouchableOpacity>

          {/* NEW BUTTON 1: Solution Oriented */}
        <TouchableOpacity
          style={[styles.filterChip, topFundsCategory === 'solution oriented' && styles.filterChipActive]}
          onPress={() => setTopFundsCategory('solution oriented')}
        >
          <Text style={[styles.filterText, topFundsCategory === 'solution oriented' && styles.filterTextActive]}>Solution Oriented</Text>
        </TouchableOpacity>

         {/* NEW BUTTON 2: Other */}
        <TouchableOpacity
          style={[styles.filterChip, topFundsCategory === 'other' && styles.filterChipActive]}
          onPress={() => setTopFundsCategory('other')}
        >
          <Text style={[styles.filterText, topFundsCategory === 'other' && styles.filterTextActive]}>Other</Text>
        </TouchableOpacity>

      </ScrollView>

        <ScrollView
          style={styles.topFundsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefreshTopFunds} tintColor="#A855F7" />
          }
        >
          {topFunds.map((fund, index) => {
            // Get score - try new format first, fallback to old
            const score = fund.score?.total || fund.composite_score || 0;
            const scoreEmoji = fund.score?.tier?.emoji || getScoreEmoji(score);
            
            return (
            <TouchableOpacity
              key={`top-${fund.code}-${index}`}
              style={styles.topFundCard}
              onPress={() => {
                setPreviousScreen('topFunds');  // ✅ ADD THIS
                setScreen('check');
                getFundDetails(fund.code);
          }}
            >
              <View style={styles.topFundContent}>
  <Text style={styles.topFundName} numberOfLines={2}>
    {fund.name}
  </Text>
  
  {/* CATEGORY DISPLAY - NEW */}
  {fund.category && (
    <View style={styles.topFundCategoryRow}>
      <Text style={styles.topFundCategoryEmoji}>{fund.category_emoji}</Text>
      <Text style={styles.topFundCategoryText}>{fund.category}</Text>
    </View>
  )}
  
  {fund.risk && (
    <Text style={styles.topFundRisk} numberOfLines={1}>
      {fund.risk}
    </Text>
  )}
  
  {fund.fund_age != null && (
    <Text style={styles.topFundAge}>
      {fund.fund_age.toFixed(1)} years old
    </Text>
  )}
</View>

<View style={styles.topFundScore}>
  <Text style={styles.scoreEmoji}>
    {fund.score?.tier?.emoji || getScoreEmoji(fund.composite_score || 0)}
  </Text>
  <Text style={[
    styles.scoreNumber,
    fund.score?.has_sufficient_data === false && styles.scoreNumberInsufficient
  ]}>
    {fund.score?.has_sufficient_data === false 
      ? 'N/A' 
      : Math.round(fund.score?.total || fund.composite_score || 0)
    }
  </Text>
</View>
            </TouchableOpacity>
            );
          })}
        </ScrollView>
        <Navigation 
          screen={screen}
          setScreen={setScreen}
          setSelectedFund={setSelectedFund}
          setActiveTool={setActiveTool}
          setSelectedTopic={setSelectedTopic}
        />
      </View>
    );
  }



  // ========== CHECK FUND SCREEN ==========
  if (screen === 'check') {
    return (
      <View style={styles.container}>
        <View style={styles.headerPurple}>
          <TouchableOpacity onPress={() => {
            // ✅ SMART NAVIGATION
            if (selectedFund) {
            // If viewing fund details, go back to previous screen
            setScreen(previousScreen);
            setSelectedFund(null);
          } else {
          // If just on search screen, go to previous screen
            setScreen(previousScreen);
          }
          setSearchResults([]);
          setSearchQuery('');
          setPreviousScreen('home');  // ✅ Reset for next time
    }}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
          <Text style={styles.pageTitle}>Check Ur Fund 🔍</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.scrollView}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Search size={20} color="#A78BFA" />
              <TextInput
                style={styles.searchInput}
                placeholder="type fund name..."
                placeholderTextColor="#6B7280"
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  searchFunds(text);
                }}
              />
            </View>
          </View>

          {/* Loading */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#A78BFA" />
              <Text style={styles.loadingText}>searching...</Text>
            </View>
          )}

          {/* Search Results */}
          {!selectedFund && searchResults.length > 0 && (
            <View style={styles.resultsContainer}>
              <Text style={styles.resultsTitle}>found {searchResults.length} funds</Text>
              {searchResults.map((fund, fundIndex) => (
                <TouchableOpacity
                  key={fundIndex}
                  style={styles.fundCard}
                  onPress={() => {
                    setPreviousScreen('check');  // ✅ ADD THIS - Stay on check screen
                    getFundDetails(fund.code);
                    setSearchQuery('');  // ✅ ADD THIS - Clear search
                    setSearchResults([]);  // ✅ ADD THIS - Clear results
                  }}
                >
                  <View style={styles.fundCardContent}>
                    <Text style={styles.fundName} numberOfLines={2}>
                      {fund.name}
                    </Text>
                    
                    {/* CATEGORY BADGE - NEW */}
                    {fund.category && (
                      <View style={styles.categoryRow}>
                        <Text style={styles.categoryEmoji}>{fund.category_emoji}</Text>
                        <Text style={styles.categoryText}>{fund.category}</Text>
                      </View>
                    )}
                    
                    <View style={styles.fundTags}>
                      {fund.risk && (
                        <View style={styles.tagRisk}>
                          <Text style={styles.tagText}>{fund.risk}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  {/* Score Badge - UPDATED */}
                  {fund.score && (
                    <View style={[
                      styles.scoreBadge,
                      fund.score.has_sufficient_data === false && styles.scoreBadgeInsufficient
                    ]}>
                      <Text style={styles.scoreEmoji}>{fund.score.tier.emoji}</Text>
                      <Text style={[
                        styles.scoreValue,
                        fund.score.has_sufficient_data === false && styles.scoreValueInsufficient
                      ]}>
                        {fund.score.has_sufficient_data === false 
                          ? 'N/A' 
                          : Math.round(fund.score.total)
                        }
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Fund Details */}
{selectedFund && (
  <View style={styles.detailsContainer}>
    <View style={styles.detailsCard}>
      {/* Fund Name & Code */}
      <Text style={styles.detailsName}>{selectedFund.name}</Text>

      {/* CATEGORY BANNER - NEW */}
      {selectedFund.category && (
        <View style={styles.categoryBanner}>
          <Text style={styles.categoryBannerEmoji}>{selectedFund.category_emoji}</Text>
          <View style={styles.categoryBannerTextContainer}>
            <Text style={styles.categoryBannerText}>{selectedFund.category}</Text>
            <Text style={styles.categoryBannerSubtext}>
              {selectedFund.sub_category || selectedFund.main_category}
            </Text>
          </View>
        </View>
      )}

      {/* SCORE SECTION - COMPLETE DEBUG VERSION */}
{selectedFund.score ? (
  <View style={styles.scoreSection}>
    
    {/* Debug Box - Remove after fixing */}
    <View style={{backgroundColor: '#FEF3C7', padding: 10, marginBottom: 10}}>
      <Text style={{color: '#000', fontWeight: 'bold'}}>
        DEBUG INFO:
      </Text>
      <Text style={{color: '#000'}}>
        Score Total: {selectedFund.score.total ?? 'NULL'}
      </Text>
      <Text style={{color: '#000'}}>
        Has Sufficient Data: {String(selectedFund.score.has_sufficient_data ?? 'NULL')}
      </Text>
      <Text style={{color: '#000'}}>
        Tier: {selectedFund.score.tier?.label ?? 'NULL'}
      </Text>
    </View>
    
    {selectedFund.score.has_sufficient_data === false ? (
      
      // ========== INSUFFICIENT DATA WARNING ==========
      <View style={styles.insufficientDataBanner}>
        <Text style={styles.insufficientDataEmoji}>📊</Text>
        <View style={styles.insufficientDataTextContainer}>
          <Text style={styles.insufficientDataTitle}>Not Enough Data</Text>
          <Text style={styles.insufficientDataReason}>
            {selectedFund.score.reliability_reason || 'Insufficient historical data for reliable scoring'}
          </Text>
        </View>
      </View>
      
    ) : selectedFund.score.total != null ? (
      
      // ========== SCORE CARD ==========
      <View style={styles.scoreCard}>
        
        {/* Header with Score */}
        <View style={styles.scoreHeader}>
          <View>
            <Text style={styles.scoreLabel}>Fund Score</Text>
            <Text style={styles.scoreCategory}>
              {selectedFund.score.category || 'Unknown'} Fund
            </Text>
          </View>
          <View style={styles.scoreDisplay}>
            <Text style={styles.scoreLarge}>
              {Math.round(selectedFund.score.total)}
            </Text>
            <Text style={styles.scoreOutOf}>/100</Text>
          </View>
        </View>
        
        {/* Tier Badge */}
        {selectedFund.score.tier && (
          <View style={styles.scoreTier}>
            <Text style={styles.scoreTierEmoji}>
              {selectedFund.score.tier.emoji || '📊'}
            </Text>
            <Text style={styles.scoreTierLabel}>
              {selectedFund.score.tier.label || 'Unknown'}
            </Text>
          </View>
        )}
        
        {/* Visual Progress Meter */}
        <View style={styles.scoreMeter}>
          <View style={[
            styles.scoreMeterFill,
            { 
              width: `${Math.min(Math.max(selectedFund.score.total || 0, 0), 100)}%`,
              backgroundColor: selectedFund.score.tier?.color || '#3B82F6'
            }
          ]} />
        </View>
        
        {/* Reliability Indicator */}
        {selectedFund.score.reliability && (
          <View style={styles.reliabilityRow}>
            <Text style={styles.reliabilityLabel}>Reliability:</Text>
            <Text style={[
              styles.reliabilityValue,
              selectedFund.score.reliability === 'High' && styles.reliabilityHigh,
              selectedFund.score.reliability === 'Moderate' && styles.reliabilityModerate,
              selectedFund.score.reliability === 'Preliminary' && styles.reliabilityPreliminary
            ]}>
              {selectedFund.score.reliability}
            </Text>
          </View>
        )}
        
        {/* Metrics Count */}
        {selectedFund.score.total_metrics_used != null && (
          <Text style={styles.metricsUsed}>
            Based on {selectedFund.score.total_metrics_used} of{' '}
            {selectedFund.score.total_metrics_available || '12'} metrics
          </Text>
        )}
        
      </View>
      
    ) : (
      
      // ========== FALLBACK: NO SCORE DATA ==========
      <View style={{backgroundColor: '#FEE2E2', padding: 16, borderRadius: 8}}>
        <Text style={{color: '#991B1B', fontWeight: 'bold'}}>
          Score data exists but total is null
        </Text>
        <Text style={{color: '#991B1B', fontSize: 12}}>
          This should not happen - check backend scoring logic
        </Text>
      </View>
      
    )}
  </View>
) : (
  
  // ========== NO SCORE FIELD AT ALL ==========
  <View style={{backgroundColor: '#FEE2E2', padding: 16, borderRadius: 8, margin: 16}}>
    <Text style={{color: '#991B1B', fontWeight: 'bold'}}>
      ⚠️ No Score Data Available
    </Text>
    <Text style={{color: '#991B1B', fontSize: 12, marginTop: 4}}>
      Backend did not return score field. Run: python app/run_scoring.py
    </Text>
  </View>
  
)}


{/* ========== SCORE BREAKDOWN SECTION - ADD THIS ========== */}
{selectedFund.score && selectedFund.score.has_sufficient_data !== false && (
  <>
    {/* Breakdown Toggle Button */}
    <TouchableOpacity 
      style={styles.breakdownButton}
      onPress={() => setShowScoreBreakdown(!showScoreBreakdown)}
    >
      <Text style={styles.breakdownButtonText}>
        {showScoreBreakdown ? 'Hide' : 'Show'} Score Breakdown
      </Text>
      <Text style={styles.breakdownButtonIcon}>
        {showScoreBreakdown ? '▲' : '▼'}
      </Text>
    </TouchableOpacity>
    
    {/* Collapsible Breakdown Content */}
    {showScoreBreakdown && selectedFund.score.contributions && (
      <View style={styles.scoreBreakdown}>
        <Text style={styles.breakdownTitle}>Score Components</Text>
        
        {/* Show Top 8 Contributing Metrics */}
        {Object.entries(selectedFund.score.contributions)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 8)
          .map(([metric, contribution]) => {
            const metricData = selectedFund.score.normalized_metrics?.[metric];
            return (
              <View key={metric} style={styles.breakdownRow}>
                
                {/* Left Side: Metric Name & Value */}
                <View style={styles.breakdownMetric}>
                  <Text style={styles.breakdownMetricName}>
                    {formatMetricName(metric)}
                  </Text>
                  <Text style={styles.breakdownMetricValue}>
                    {formatMetricValue(metric, metricData?.raw)}
                  </Text>
                </View>
                
                {/* Right Side: Contribution & Bar */}
                <View style={styles.breakdownContribution}>
                  <Text style={styles.breakdownContributionValue}>
                    +{contribution.toFixed(1)}
                  </Text>
                  <View style={styles.breakdownBar}>
                    <View style={[
                      styles.breakdownBarFill,
                      { 
                        width: `${Math.min((contribution / 20) * 100, 100)}%` 
                      }
                    ]} />
                  </View>
                </View>
                
              </View>
            );
          })}
        
        {/* Show Missing Metrics */}
        {selectedFund.score.missing_metrics && 
        selectedFund.score.missing_metrics.length > 0 && (
          <View style={styles.missingMetrics}>
            <Text style={styles.missingMetricsTitle}>
              Missing Metrics ({selectedFund.score.missing_metrics.length})
            </Text>
            <Text style={styles.missingMetricsList}>
              {selectedFund.score.missing_metrics
                .slice(0, 5)
                .map(formatMetricName)
                .join(', ')}
              {selectedFund.score.missing_metrics.length > 5 && '...'}
            </Text>
          </View>
        )}
        
      </View>
    )}
  </>
)}
{/* ========== END SCORE BREAKDOWN SECTION ========== */}


{/* Rest of existing content continues... */}


{/* Rest of existing content continues... */}
      {/* ✅ ADD SCORE SECTION HERE - RIGHT AFTER FUND NAME */}
      {selectedFund.score && selectedFund.score.total != null && (
        <View style={styles.scoreSection}>
          <View style={styles.scoreHeader}>
            <Text style={styles.scoreTitle}>Fund Score</Text>
            {selectedFund.score.adjusted && (
              <Text style={styles.scoreAdjusted}>*Adjusted</Text>
            )}
          </View>
          
          <View style={styles.scoreDisplay}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreNumber}>
                {selectedFund.score.total.toFixed(0)}
              </Text>
              <Text style={styles.scoreOutOf}>/100</Text>
            </View>
            
            <View style={styles.scoreTierInfo}>
              <Text style={styles.scoreTierEmoji}>
                {selectedFund.score.tier.emoji}
              </Text>
              <Text style={styles.scoreTierLabel}>
                {selectedFund.score.tier.label}
              </Text>
              {selectedFund.score.missing_metrics && 
               selectedFund.score.missing_metrics.length > 0 && (
                <Text style={styles.scoreMissing}>
                  {selectedFund.score.missing_metrics.length} metrics missing
                </Text>
              )}
            </View>
          </View>
        </View>
      )}
          
      <View style={styles.codeRow}>
        <Text style={styles.codeLabel}>AMFI Code:</Text>
        <Text style={styles.codeValue}>{selectedFund.code}</Text>
      </View>
      
      {/* Tags */}
      <View style={styles.detailsTags}>
        {selectedFund.type && (
          <View style={styles.tagBlue}>
            <Text style={styles.tagText}>{selectedFund.type}</Text>
          </View>
        )}
        {selectedFund.risk && (
          <View style={styles.tagRisk}>
            <Text style={styles.tagText}>{selectedFund.risk}</Text>
          </View>
        )}
      </View>

      {/* Scheme Start Date */}
      {selectedFund.fund_age && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📅 Scheme Age:</Text>
          <Text style={styles.infoValue}>{selectedFund.fund_age.toFixed(1)} years</Text>
        </View>
      )}

      {(() => {
        console.log('🔍 [DEBUG] About to render Investment Objective');
        console.log('  - objective type:', typeof selectedFund?.objective);
        console.log('  - objective value:', selectedFund?.objective?.substring?.(0, 100));
        return null;
      })()}
      {/* Investment Objective */}
      {selectedFund.objective && (
        <View style={styles.objectiveCard}>
          <Text style={styles.objectiveTitle}>🎯 Investment Objective</Text>
          <Text style={styles.objectiveText}>{selectedFund.objective}</Text>
        </View>
      )}

      {(() => {
        console.log('🔍 [DEBUG] About to render Asset Allocation');
        console.log('  - asset_allocation type:', typeof selectedFund?.asset_allocation);
        console.log('  - asset_allocation value:', selectedFund?.asset_allocation?.substring?.(0, 100));
        return null;
      })()}
      {/* Asset Allocation */}
      {selectedFund.asset_allocation && (
        <View style={styles.objectiveCard}>
          <Text style={styles.objectiveTitle}>💼 Asset Allocation</Text>
          <Text style={styles.objectiveText}>
            {typeof selectedFund.asset_allocation === 'string' 
              ? selectedFund.asset_allocation 
              : typeof selectedFund.asset_allocation === 'object'
              ? JSON.stringify(selectedFund.asset_allocation, null, 2)
              : String(selectedFund.asset_allocation)}
          </Text>
        </View>
      )}

      {/* Expense Ratio */}
      {(selectedFund.expense || selectedFund.annual_expense) && (() => {
        const expenseData = selectedFund.expense || selectedFund.annual_expense;
        console.log('💰 [DEBUG] Rendering expense section');
        console.log('  - expenseData type:', typeof expenseData);
        console.log('  - expenseData value:', expenseData);
        console.log('  - expenseData keys:', typeof expenseData === 'object' ? Object.keys(expenseData) : 'N/A');
        
        // Handle case where expense might be empty object
        if (typeof expenseData === 'object' && Object.keys(expenseData).length === 0) {
          return null;
        }
        
        return (
          <View style={styles.expenseCard}>
            <Text style={styles.expenseTitle}>💰 Expense Ratio</Text>
            {typeof expenseData === 'object' ? (
              <View style={styles.expenseRow}>
                {expenseData.Direct != null && (
                  <View style={styles.expenseItem}>
                    <Text style={styles.expenseLabel}>Direct</Text>
                    <Text style={styles.expenseValue}>{expenseData.Direct}%</Text>
                  </View>
                )}
                {expenseData.Regular != null && (
                  <View style={styles.expenseItem}>
                    <Text style={styles.expenseLabel}>Regular</Text>
                    <Text style={styles.expenseValue}>{expenseData.Regular}%</Text>
                  </View>
                )}
                {expenseData.Retail != null && (
                  <View style={styles.expenseItem}>
                    <Text style={styles.expenseLabel}>Retail</Text>
                    <Text style={styles.expenseValue}>{expenseData.Retail}%</Text>
                  </View>
                )}
              </View>
            ) : (
              <Text style={styles.objectiveText}>{String(expenseData)}</Text>
            )}
          </View>
        );
      })()}

      {(() => {
        console.log('🔍 [DEBUG] About to render Performance Metrics');
        console.log('  - metrics:', typeof selectedFund?.metrics);
        console.log('  - metrics keys:', selectedFund?.metrics ? Object.keys(selectedFund.metrics) : 'none');
        return null;
      })()}
      {/* Performance Metrics */}
      <Text style={styles.sectionHeader}>📊 Performance Metrics</Text>
      <View style={styles.metricsGrid}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>CAGR</Text>
          <Text style={styles.metricValue}>
            {selectedFund?.metrics?.cagr ? 
              `${(selectedFund.metrics.cagr * 100).toFixed(2)}%` : 
              'N/A'}
          </Text>
        </View>
        
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>1Y Return</Text>
          <Text style={styles.metricValue}>
            {selectedFund?.metrics?.rolling_1y != null ? 
              `${(selectedFund.metrics.rolling_1y * 100).toFixed(1)}%` : 
              'N/A'}
          </Text>
        </View>
        
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>3Y Return</Text>
          <Text style={styles.metricValue}>
            {selectedFund?.metrics?.rolling_3y != null ? 
              `${(selectedFund.metrics.rolling_3y * 100).toFixed(1)}%` : 
              'N/A'}
          </Text>
        </View>
        
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>5Y Return</Text>
          <Text style={styles.metricValue}>
            {selectedFund?.metrics?.rolling_5y != null ? 
              `${(selectedFund.metrics.rolling_5y * 100).toFixed(1)}%` : 
              'N/A'}
          </Text>
        </View>
      </View>

      {(() => {
        console.log('🔍 [DEBUG] About to render Risk Metrics');
        console.log('  - volatility:', selectedFund?.metrics?.volatility);
        console.log('  - sharpe:', selectedFund?.metrics?.sharpe);
        return null;
      })()}
      {/* Risk Metrics */}
      <Text style={styles.sectionHeader}>⚠️ Risk Metrics</Text>
      <View style={styles.metricsGrid}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Volatility</Text>
          <Text style={[styles.metricValue, styles.metricWarning]}>
            {selectedFund?.metrics?.volatility != null ? 
              `${(selectedFund.metrics.volatility * 100).toFixed(2)}%` : 
              'N/A'}
          </Text>
        </View>
        
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Sharpe Ratio</Text>
          <Text style={styles.metricValue}>
            {selectedFund?.metrics?.sharpe != null ? 
              selectedFund.metrics.sharpe.toFixed(2) : 
              'N/A'}
          </Text>
        </View>
        
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Sortino Ratio</Text>
          <Text style={styles.metricValue}>
            {selectedFund?.metrics?.sortino != null ? 
              selectedFund.metrics.sortino.toFixed(2) : 
              'N/A'}
          </Text>
        </View>
        
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Max Drawdown</Text>
          <Text style={[styles.metricValue, styles.metricDanger]}>
            {selectedFund?.metrics?.max_drawdown != null ? 
              `${(selectedFund.metrics.max_drawdown * 100).toFixed(1)}%` : 
              'N/A'}
          </Text>
        </View>
      </View>

      {/* Future Metrics Placeholders */}
      <Text style={styles.sectionHeader}>🔮 Advanced Metrics (Coming Soon)</Text>
      <View style={styles.metricsGrid}>
        <View style={[styles.metricBox, styles.metricDisabled]}>
          <Text style={styles.metricLabel}>Alpha</Text>
          <Text style={styles.metricPlaceholder}>Coming Soon</Text>
        </View>
        
        <View style={[styles.metricBox, styles.metricDisabled]}>
          <Text style={styles.metricLabel}>Beta</Text>
          <Text style={styles.metricPlaceholder}>Coming Soon</Text>
        </View>
      </View>

      {/* Fund Managers */}
      {(() => {
        console.log('👨‍💼 [DEBUG] Checking managers field');
        console.log('  - managers:', typeof selectedFund?.managers, selectedFund?.managers);
        console.log('  - fund_managers:', typeof selectedFund?.fund_managers, selectedFund?.fund_managers);
        console.log('  - is array?', Array.isArray(selectedFund?.managers));
        return null; // Just for logging
      })()}
      {selectedFund?.managers && Array.isArray(selectedFund.managers) && selectedFund.managers.length > 0 && (
        <View style={styles.managersCard}>
          <TouchableOpacity 
            style={styles.managersHeader}
            onPress={() => setShowManagers(!showManagers)}
          >
            <Text style={styles.managersTitle}>
              👨‍💼 Fund Manager{selectedFund.managers.length > 1 ? 's' : ''}
            </Text>
            <Text style={styles.managersToggle}>
              {showManagers ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>
          
          {showManagers && (
            <View style={styles.managersList}>
              {selectedFund.managers.map((manager, index) => {
                const managerName = typeof manager === 'string' ? manager : (manager?.name || 'Unknown');
                return (
                <View key={`mgr-${index}-${managerName.substring(0, 20)}`} style={styles.managerItem}>
                  {/* Handle both string and object formats */}
                  {typeof manager === 'string' ? (
                    <Text style={styles.managerName}>{String(manager)}</Text>
                  ) : (
                    <>
                      <Text style={styles.managerName}>
                        {manager.name ? String(manager.name) : 'Name not available'}
                      </Text>
                      {manager.type && (
                        <Text style={styles.managerType}>
                          Role: {String(manager.type)}
                        </Text>
                      )}
                      {manager.from_date && (
                        <Text style={styles.managerDate}>
                          Since: {String(manager.from_date)}
                        </Text>
                      )}
                    </>
                  )}
                </View>
                );
              })}
            </View>
          )}
        </View>
      )}

      {(() => {
        console.log('🔍 [DEBUG] About to render Exit Load section');
        console.log('  - exit_load:', typeof selectedFund?.exit_load, selectedFund?.exit_load);
        return null;
      })()}
      {/* Exit Load */}
      {(() => {
        console.log('🔍 [DEBUG] Inside Exit Load render');
        console.log('  - Step 1: About to check exit_load conditions');
        console.log('  - exit_load != null:', selectedFund?.exit_load != null);
        console.log('  - exit_load !== "null":', selectedFund?.exit_load !== 'null');
        console.log('  - exit_load !== "":', selectedFund?.exit_load !== '');
        
        const shouldShowExitLoad = selectedFund?.exit_load != null && 
                                   selectedFund.exit_load !== 'null' && 
                                   selectedFund.exit_load !== '';
        
        console.log('  - shouldShowExitLoad:', shouldShowExitLoad);
        
        if (shouldShowExitLoad) {
          console.log('  - Step 2: Will show exit load:', String(selectedFund.exit_load).substring(0, 50));
        } else {
          console.log('  - Step 2: Will show "No Exit Load"');
        }
        
        return null;
      })()}
      <View style={styles.exitLoadCard}>
        {(() => {
          console.log('🔍 [DEBUG] Rendering Exit Load title');
          return null;
        })()}
        <Text style={styles.exitLoadTitle}>🚪 Exit Load</Text>
        
        {(() => {
          console.log('🔍 [DEBUG] About to render Exit Load text');
          return null;
        })()}
        <Text style={styles.exitLoadText}>
          {selectedFund?.exit_load != null && selectedFund.exit_load !== 'null' && selectedFund.exit_load !== '' 
            ? String(selectedFund.exit_load)
            : 'No Exit Load ✅'}
        </Text>
        
        {(() => {
          console.log('🔍 [DEBUG] Exit Load text rendered successfully');
          return null;
        })()}
      </View>
      
      {(() => {
        console.log('🔍 [DEBUG] Exit Load section completed');
        return null;
      })()}

      {(() => {
        console.log('🔍 [DEBUG] About to render WARNING BANNER section');
        console.log('  - is_reliable:', selectedFund?.is_reliable);
        return null;
      })()}
      
      {/* WARNING BANNER FOR INSUFFICIENT DATA */}
      {selectedFund.is_reliable === false && (
            <View style={styles.warningBanner}>
              <Text style={styles.warningBannerIcon}>⚠️</Text>
              <View style={styles.warningBannerTextContainer}>
                <Text style={styles.warningBannerTitle}>Insufficient Historical Data</Text>
                <Text style={styles.warningBannerText}>
                  This fund has limited NAV history. Metrics may not be reliable.
                </Text>
              </View>
            </View>
          )}

          {(() => {
            console.log('🔍 [DEBUG] About to render ENHANCED METRICS WITH TABS');
            console.log('  - metricsTab:', metricsTab);
            console.log('  - metrics exists:', !!selectedFund?.metrics);
            return null;
          })()}
          {/* ENHANCED METRICS WITH TABS */}
          <View style={styles.metricsSection}>
            {(() => {
              console.log('🔍 [DEBUG] Rendering metrics section title');
              return null;
            })()}
            <Text style={styles.sectionTitle}>📊 Performance Metrics</Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.metricsTabsContainer}>
              <TouchableOpacity
                style={[styles.metricsTab, metricsTab === 'returns' && styles.metricsTabActive]}
                onPress={() => setMetricsTab('returns')}
              >
                <Text style={styles.metricsTabIcon}>📈</Text>
                <Text style={[styles.metricsTabLabel, metricsTab === 'returns' && styles.metricsTabLabelActive]}>
                  Returns
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.metricsTab, metricsTab === 'risk' && styles.metricsTabActive]}
                onPress={() => setMetricsTab('risk')}
              >
                <Text style={styles.metricsTabIcon}>⚠️</Text>
                <Text style={[styles.metricsTabLabel, metricsTab === 'risk' && styles.metricsTabLabelActive]}>
                  Risk
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.metricsTab, metricsTab === 'consistency' && styles.metricsTabActive]}
                onPress={() => setMetricsTab('consistency')}
              >
                <Text style={styles.metricsTabIcon}>✅</Text>
                <Text style={[styles.metricsTabLabel, metricsTab === 'consistency' && styles.metricsTabLabelActive]}>
                  Consistency
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.metricsTab, metricsTab === 'advanced' && styles.metricsTabActive]}
                onPress={() => setMetricsTab('advanced')}
              >
                <Text style={styles.metricsTabIcon}>🔬</Text>
                <Text style={[styles.metricsTabLabel, metricsTab === 'advanced' && styles.metricsTabLabelActive]}>
                  Advanced
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {(() => {
              console.log('🔍 [DEBUG] Checking returns tab');
              console.log('  - metricsTab === "returns":', metricsTab === 'returns');
              console.log('  - selectedFund.metrics exists:', !!selectedFund?.metrics);
              return null;
            })()}
            {/* RETURNS TAB */}
            {metricsTab === 'returns' && selectedFund.metrics && (
              <View style={styles.metricsContent}>
                {(() => {
                  console.log('🔍 [DEBUG] Inside RETURNS TAB rendering');
                  return null;
                })()}
                
                {(() => {
                  console.log('🔍 [DEBUG] About to render "Annualized Returns" title');
                  return null;
                })()}
                <Text style={styles.metricsSectionTitle}>Annualized Returns</Text>
                
                {(() => {
                  console.log('🔍 [DEBUG] About to render CAGR card');
                  console.log('  - cagr value:', selectedFund?.metrics?.cagr);
                  return null;
                })()}
                <View style={styles.metricCard}>
                  {(() => {
                    console.log('🔍 [DEBUG] Rendering CAGR label');
                    return null;
                  })()}
                  <Text style={styles.metricLabel}>CAGR</Text>
                  
                  {(() => {
                    console.log('🔍 [DEBUG] About to render CAGR value');
                    const cagrValue = selectedFund?.metrics?.cagr != null ? `${(selectedFund.metrics.cagr * 100).toFixed(2)}%` : 'N/A';
                    console.log('  - computed value:', cagrValue);
                    return null;
                  })()}
                  <Text style={[styles.metricValue, { color: '#10B981' }]}>
                    {selectedFund?.metrics?.cagr != null ? `${(selectedFund.metrics.cagr * 100).toFixed(2)}%` : 'N/A'}
                  </Text>
                  
                  {(() => {
                    console.log('🔍 [DEBUG] Rendering CAGR good value text');
                    return null;
                  })()}
                  <Text style={styles.metricGoodValue}>{'>'}12% for equity</Text>
                </View>
                
                {(() => {
                  console.log('🔍 [DEBUG] CAGR card rendered successfully');
                  return null;
                })()}

                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>1 YEAR ROLLING</Text>
                  <Text style={[styles.metricValue, { color: '#A855F7' }]}>
                    {selectedFund?.metrics?.rolling_1y != null ? `${(selectedFund.metrics.rolling_1y * 100).toFixed(2)}%` : 'N/A'}
                  </Text>
                </View>

                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>3 YEAR ROLLING</Text>
                  <Text style={[styles.metricValue, { color: '#A855F7' }]}>
                    {selectedFund?.metrics?.rolling_3y != null ? `${(selectedFund.metrics.rolling_3y * 100).toFixed(2)}%` : 'N/A'}
                  </Text>
                </View>

                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>5 YEAR ROLLING</Text>
                  <Text style={[styles.metricValue, { color: '#A855F7' }]}>
                    {selectedFund?.metrics?.rolling_5y != null ? `${(selectedFund.metrics.rolling_5y * 100).toFixed(2)}%` : 'N/A'}
                  </Text>
                </View>

                <Text style={styles.metricsSectionTitle}>Absolute Returns</Text>
                <View style={styles.metricsGrid}>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>1M</Text>
                    <Text style={styles.gridValue}>
                      {selectedFund?.metrics?.abs_return_1m != null ? `${selectedFund.metrics.abs_return_1m.toFixed(1)}%` : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>3M</Text>
                    <Text style={styles.gridValue}>
                      {selectedFund?.metrics?.abs_return_3m != null ? `${selectedFund.metrics.abs_return_3m.toFixed(1)}%` : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>6M</Text>
                    <Text style={styles.gridValue}>
                      {selectedFund?.metrics?.abs_return_6m != null ? `${selectedFund.metrics.abs_return_6m.toFixed(1)}%` : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>1Y</Text>
                    <Text style={styles.gridValue}>
                      {selectedFund?.metrics?.abs_return_1y != null ? `${selectedFund.metrics.abs_return_1y.toFixed(1)}%` : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>3Y</Text>
                    <Text style={styles.gridValue}>
                      {selectedFund?.metrics?.abs_return_3y != null ? `${selectedFund.metrics.abs_return_3y.toFixed(1)}%` : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>5Y</Text>
                    <Text style={styles.gridValue}>
                      {selectedFund?.metrics?.abs_return_5y != null ? `${selectedFund.metrics.abs_return_5y.toFixed(1)}%` : 'N/A'}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* RISK TAB */}
            {metricsTab === 'risk' && selectedFund.metrics && (
              <View style={styles.metricsContent}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>VOLATILITY</Text>
                  <Text style={[styles.metricValue, { color: '#EF4444' }]}>
                    {selectedFund?.metrics?.volatility != null ? `${(selectedFund.metrics.volatility * 100).toFixed(2)}%` : 'N/A'}
                  </Text>
                  <Text style={styles.metricGoodValue}>Lower is better</Text>
                </View>

                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>MAX DRAWDOWN</Text>
                  <Text style={[styles.metricValue, { color: '#EF4444' }]}>
                    {selectedFund?.metrics?.max_drawdown != null ? `${(selectedFund.metrics.max_drawdown * 100).toFixed(2)}%` : 'N/A'}
                  </Text>
                  <Text style={styles.metricGoodValue}>{'>'}−20% is acceptable</Text>
                </View>

                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>DOWNSIDE DEVIATION</Text>
                  <Text style={[styles.metricValue, { color: '#F59E0B' }]}>
                    {selectedFund?.metrics?.downside_deviation != null ? `${(selectedFund.metrics.downside_deviation * 100).toFixed(2)}%` : 'N/A'}
                  </Text>
                  <Text style={styles.metricGoodValue}>Only downside volatility</Text>
                </View>

                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>ULCER INDEX</Text>
                  <Text style={[styles.metricValue, { color: '#F59E0B' }]}>
                    {selectedFund?.metrics?.ulcer_index != null ? selectedFund.metrics.ulcer_index.toFixed(2) : 'N/A'}
                  </Text>
                  <Text style={styles.metricGoodValue}>{'<'} 5 low stress, {'>'} 10 high</Text>
                </View>

                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>VALUE AT RISK (95%)</Text>
                  <Text style={[styles.metricValue, { color: '#EF4444' }]}>
                    {selectedFund?.metrics?.value_at_risk_95 != null ? `${(selectedFund.metrics.value_at_risk_95 * 100).toFixed(2)}%` : 'N/A'}
                  </Text>
                  <Text style={styles.metricGoodValue}>Max loss in worst 5% days</Text>
                </View>

                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>PAIN INDEX</Text>
                  <Text style={[styles.metricValue, { color: '#F59E0B' }]}>
                    {selectedFund?.metrics?.pain_index != null ? selectedFund.metrics.pain_index.toFixed(2) : 'N/A'}
                  </Text>
                  <Text style={styles.metricGoodValue}>Average drawdown</Text>
                </View>
              </View>
            )}

            {/* CONSISTENCY TAB */}
            {metricsTab === 'consistency' && selectedFund.metrics && (
              <View style={styles.metricsContent}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>CONSISTENCY SCORE</Text>
                  <Text style={[styles.metricValue, { color: '#10B981' }]}>
                    {selectedFund?.metrics?.consistency_score != null ? `${selectedFund.metrics.consistency_score.toFixed(0)}%` : 'N/A'}
                  </Text>
                  <Text style={styles.metricGoodValue}>{'>'}60% is consistent</Text>
                </View>

                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>POSITIVE MONTHS</Text>
                  <Text style={[styles.metricValue, { color: '#10B981' }]}>
                    {selectedFund?.metrics?.positive_months_pct != null ? `${selectedFund.metrics.positive_months_pct.toFixed(0)}%` : 'N/A'}
                  </Text>
                  <Text style={styles.metricGoodValue}>{'>'} 55% is good</Text>
                </View>

                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>GAIN TO PAIN RATIO</Text>
                  <Text style={[styles.metricValue, { color: '#A855F7' }]}>
                    {selectedFund?.metrics?.gain_to_pain_ratio != null ? selectedFund.metrics.gain_to_pain_ratio.toFixed(2) : 'N/A'}
                  </Text>
                  <Text style={styles.metricGoodValue}>{'>'}2.0 excellent</Text>
                </View>

                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>CURRENT DRAWDOWN</Text>
                  <Text style={[styles.metricValue, { color: '#F59E0B' }]}>
                    {selectedFund.metrics.current_drawdown_pct ? `${selectedFund.metrics.current_drawdown_pct.toFixed(2)}%` : 'N/A'}
                  </Text>
                </View>

                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>DAYS SINCE PEAK</Text>
                  <Text style={[styles.metricValue, { color: '#6B7280' }]}>
                    {selectedFund.metrics.days_since_peak ? `${selectedFund.metrics.days_since_peak} days` : 'N/A'}
                  </Text>
                </View>

                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>MAX RECOVERY TIME</Text>
                  <Text style={[styles.metricValue, { color: '#6B7280' }]}>
                    {selectedFund.metrics.max_recovery_time_days ? `${selectedFund.metrics.max_recovery_time_days} days` : 'N/A'}
                  </Text>
                </View>
              </View>
            )}

            {/* ADVANCED TAB */}
            {metricsTab === 'advanced' && selectedFund.metrics && (
              <View style={styles.metricsContent}>
                <Text style={styles.metricsSectionTitle}>Risk-Adjusted Returns</Text>
                
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>SHARPE RATIO</Text>
                  <Text style={[styles.metricValue, { color: '#6366F1' }]}>
                    {selectedFund?.metrics?.sharpe != null ? selectedFund.metrics.sharpe.toFixed(2) : 'N/A'}
                  </Text>
                  <Text style={styles.metricGoodValue}>{'>'}1 good, {'>'}2 excellent</Text>
                </View>

                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>SORTINO RATIO</Text>
                  <Text style={[styles.metricValue, { color: '#6366F1' }]}>
                    {selectedFund?.metrics?.sortino != null ? selectedFund.metrics.sortino.toFixed(2) : 'N/A'}
                  </Text>
                  <Text style={styles.metricGoodValue}>{'>'}1 good</Text>
                </View>

                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>CALMAR RATIO</Text>
                  <Text style={[styles.metricValue, { color: '#6366F1' }]}>
                    {selectedFund?.metrics?.calmar_ratio != null ? selectedFund.metrics.calmar_ratio.toFixed(2) : 'N/A'}
                  </Text>
                  <Text style={styles.metricGoodValue}>{'>'}1 good, {'>'}3 excellent</Text>
                </View>

                <Text style={styles.metricsSectionTitle}>Distribution</Text>
                
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>SKEWNESS</Text>
                  <Text style={[styles.metricValue, { color: '#A855F7' }]}>
                    {selectedFund?.metrics?.skewness != null ? selectedFund.metrics.skewness.toFixed(2) : 'N/A'}
                  </Text>
                  <Text style={styles.metricGoodValue}>+ = more extreme gains</Text>
                </View>

                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>KURTOSIS</Text>
                  <Text style={[styles.metricValue, { color: '#A855F7' }]}>
                    {selectedFund?.metrics?.kurtosis != null ? selectedFund.metrics.kurtosis.toFixed(2) : 'N/A'}
                  </Text>
                  <Text style={styles.metricGoodValue}>{'>'}3 high tail risk</Text>
                </View>

                <Text style={styles.metricsSectionTitle}>Fund Info</Text>
                
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>FUND AGE</Text>
                  <Text style={[styles.metricValue, { color: '#6B7280' }]}>
                    {selectedFund.metrics.fund_age_years ? `${selectedFund.metrics.fund_age_years.toFixed(1)} years` : 'N/A'}
                  </Text>
                </View>

                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>DATA QUALITY</Text>
                  <Text style={[styles.metricValue, { color: selectedFund.metrics.is_statistically_reliable ? '#10B981' : '#F59E0B' }]}>
                    {selectedFund.metrics.is_statistically_reliable ? 'Reliable ✅' : 'Insufficient ⚠️'}
                  </Text>
                </View>
              </View>
            )}
          </View>

      {/* Variants Dropdown */}


      {selectedFund.variants && selectedFund.variants.length > 0 && (
        <View style={styles.variantsCard}>
          <TouchableOpacity 
            style={styles.variantsHeader}
            onPress={() => setShowVariants(!showVariants)}
          >
            <Text style={styles.variantsTitle}>
              📋 Available Variants ({selectedFund.variants.length})
            </Text>
            <Text style={styles.variantsToggle}>
              {showVariants ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>
          
          {showVariants && (
            <View style={styles.variantsList}>
              {selectedFund.variants.map((variant, index) => (
                <View key={`variant-${variant.amfi_code}-${index}`} style={styles.variantItem}>
                  <Text style={styles.variantName}>{variant.scheme_name}</Text>
                  <Text style={styles.variantCode}>Code: {variant.amfi_code}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      


      {/* AI Verdict */}
      {selectedFund.ai_verdict && (
        <View style={styles.verdictCard}>
          <Text style={styles.verdictTitle}>🤖 AI Analysis</Text>
          {selectedFund.ai_verdict.verdict && (
            <Text style={styles.verdictText}>
              {String(selectedFund.ai_verdict.verdict)}
            </Text>
          )}
          
          {selectedFund.ai_verdict.score && (
            <View style={styles.scoreBar}>
              <View style={styles.scoreBarBg}>
                <View style={[
                  styles.scoreBarFill, 
                  { width: `${selectedFund.ai_verdict.score}%` }
                ]} />
              </View>
              <Text style={styles.scoreText}>
                Score: {selectedFund.ai_verdict.score}/100
              </Text>
            </View>
          )}
          
          {selectedFund.ai_verdict.pros && Array.isArray(selectedFund.ai_verdict.pros) && selectedFund.ai_verdict.pros.length > 0 && (
            <>
              <Text style={styles.verdictSubtitle}>✅ Pros:</Text>
              {selectedFund.ai_verdict.pros.map((pro, i) => (
                <Text key={`pro-${i}`} style={styles.verdictPro}>• {String(pro)}</Text>
              ))}
            </>
          )}
          
          {selectedFund.ai_verdict.cons && Array.isArray(selectedFund.ai_verdict.cons) && selectedFund.ai_verdict.cons.length > 0 && (
            <>
              <Text style={styles.verdictSubtitle}>⚠️ Watch Out:</Text>
              {selectedFund.ai_verdict.cons.map((con, i) => (
                <Text key={`con-${i}`} style={styles.verdictCon}>• {String(con)}</Text>
              ))}
            </>
          )}
        </View>
      )}

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          setSelectedFund(null);
          setShowVariants(false);
          setShowManagers(false);
        }}
      >
        <Text style={styles.backButtonText}>← search another fund</Text>
      </TouchableOpacity>
    </View>
  </View>
)}

          {/* Empty State */}
          {!loading && searchQuery.length >= 2 && searchResults.length === 0 && !selectedFund && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>no funds found 😢</Text>
              <Text style={styles.emptySubtext}>try different keywords</Text>
            </View>
          )}

          {/* Initial State */}
          {searchQuery.length < 2 && !selectedFund && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>start typing to search 🔍</Text>
              <Text style={styles.emptySubtext}>type at least 2 characters</Text>
            </View>
          )}
        </ScrollView>
        <Navigation 
          screen={screen}
          setScreen={setScreen}
          setSelectedFund={setSelectedFund}
          setActiveTool={setActiveTool}
          setSelectedTopic={setSelectedTopic}
        />
      </View>
    );
  }

// ========== TOOLS LIST SCREEN ==========
if (screen === 'tools' && !activeTool) {
  return (
    <View style={styles.container}>
      <View style={styles.headerOrange}>
        <Text style={styles.pageTitle}>Tools ⚡</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.toolsContainer}>
          <TouchableOpacity
            style={[styles.toolCard, { borderLeftColor: '#3B82F6' }]}
            onPress={() => setActiveTool('sip')}
          >
            <View style={styles.toolContent}>
              <View style={[styles.toolIcon, { backgroundColor: '#3B82F620' }]}>
                <Text style={styles.toolEmoji}>🧮</Text>
              </View>
              <View style={styles.toolInfo}>
                <Text style={styles.toolTitle}>SIP Calculator</Text>
                <Text style={styles.toolSubtitle}>monthly investment returns</Text>
              </View>
            </View>
            <ChevronRight size={24} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolCard, { borderLeftColor: '#8B5CF6' }]}
            onPress={() => setActiveTool('goal')}
          >
            <View style={styles.toolContent}>
              <View style={[styles.toolIcon, { backgroundColor: '#8B5CF620' }]}>
                <Text style={styles.toolEmoji}>🎯</Text>
              </View>
              <View style={styles.toolInfo}>
                <Text style={styles.toolTitle}>Goal Planner</Text>
                <Text style={styles.toolSubtitle}>plan for your dreams</Text>
              </View>
            </View>
            <ChevronRight size={24} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolCard, { borderLeftColor: '#10B981' }]}
            onPress={() => setActiveTool('returns')}
          >
            <View style={styles.toolContent}>
              <View style={[styles.toolIcon, { backgroundColor: '#10B98120' }]}>
                <Text style={styles.toolEmoji}>📈</Text>
              </View>
              <View style={styles.toolInfo}>
                <Text style={styles.toolTitle}>Returns Calculator</Text>
                <Text style={styles.toolSubtitle}>lumpsum vs SIP</Text>
              </View>
            </View>
            <ChevronRight size={24} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolCard, { borderLeftColor: '#F59E0B' }]}
            onPress={() => setActiveTool('risk')}
          >
            <View style={styles.toolContent}>
              <View style={[styles.toolIcon, { backgroundColor: '#F59E0B20' }]}>
                <Text style={styles.toolEmoji}>⚠️</Text>
              </View>
              <View style={styles.toolInfo}>
                <Text style={styles.toolTitle}>Risk Analyzer</Text>
                <Text style={styles.toolSubtitle}>check portfolio risk</Text>
              </View>
            </View>
            <ChevronRight size={24} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolCard, { borderLeftColor: '#EF4444' }]}
            onPress={() => setActiveTool('tax')}
          >
            <View style={styles.toolContent}>
              <View style={[styles.toolIcon, { backgroundColor: '#EF444420' }]}>
                <Text style={styles.toolEmoji}>💸</Text>
              </View>
              <View style={styles.toolInfo}>
                <Text style={styles.toolTitle}>Tax Optimizer</Text>
                <Text style={styles.toolSubtitle}>save on taxes</Text>
              </View>
            </View>
            <ChevronRight size={24} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolCard, { borderLeftColor: '#EC4899' }]}
            onPress={() => setActiveTool('compare')}
          >
            <View style={styles.toolContent}>
              <View style={[styles.toolIcon, { backgroundColor: '#EC489920' }]}>
                <Text style={styles.toolEmoji}>⚖️</Text>
              </View>
              <View style={styles.toolInfo}>
                <Text style={styles.toolTitle}>Fund Compare</Text>
                <Text style={styles.toolSubtitle}>side-by-side analysis</Text>
              </View>
            </View>
            <ChevronRight size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            💡 These are educational tools only. Results are indicative and not guaranteed.
          </Text>
        </View>
      </ScrollView>
      <Navigation 
          screen={screen}
          setScreen={setScreen}
          setSelectedFund={setSelectedFund}
          setActiveTool={setActiveTool}
          setSelectedTopic={setSelectedTopic}
        />
    </View>
  );
}

// ========== SIP CALCULATOR SCREEN ==========
if (screen === 'tools' && activeTool === 'sip') {
  return (
    <View style={styles.container}>
      <View style={styles.headerBlue}>
        <TouchableOpacity onPress={() => {
          setActiveTool(null);
          setSipAmount('');
          setSipYears('');
          setSipReturn('');
          setSipResult(null);
        }}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>SIP Calculator 🧮</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollViewFull}>
        <View style={styles.calculatorContainer}>
          {/* Monthly Investment */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>💰 Monthly Investment (₹)</Text>
            <TextInput
              style={styles.calculatorInput}
              placeholder="e.g., 5000"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={sipAmount}
              onChangeText={setSipAmount}
            />
          </View>

          {/* Time Period */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>📅 Investment Period (Years)</Text>
            <TextInput
              style={styles.calculatorInput}
              placeholder="e.g., 10"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={sipYears}
              onChangeText={setSipYears}
            />
          </View>

          {/* Expected Return */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>📈 Expected Annual Return (%)</Text>
            <TextInput
              style={styles.calculatorInput}
              placeholder="e.g., 12"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={sipReturn}
              onChangeText={setSipReturn}
            />
            <Text style={styles.inputHint}>
              Typical equity fund returns: 10-15% annually
            </Text>
          </View>

          {/* Calculate Button */}
          <TouchableOpacity style={styles.calculateButton} onPress={calculateSIP}>
            <Text style={styles.calculateButtonText}>Calculate 🚀</Text>
          </TouchableOpacity>

          {/* Results */}
          {sipResult && (
            <View style={styles.resultsCard}>
              <Text style={styles.resultsTitle}>Your Results 📊</Text>
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Total Invested</Text>
                <Text style={styles.resultValue}>
                  ₹{sipResult.invested.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Wealth Gained</Text>
                <Text style={[styles.resultValue, styles.resultGain]}>
                  ₹{sipResult.returns.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={[styles.resultRow, styles.resultRowTotal]}>
                <Text style={styles.resultLabelTotal}>Future Value</Text>
                <Text style={styles.resultValueTotal}>
                  ₹{sipResult.total.toLocaleString('en-IN')}
                </Text>
              </View>

              {/* Visual Bar */}
              <View style={styles.visualBar}>
                <View style={styles.visualBarSection}>
                  <View style={[styles.visualBarFill, { 
                    width: `${(sipResult.invested / sipResult.total) * 100}%`,
                    backgroundColor: '#3B82F6'
                  }]} />
                  <Text style={styles.visualBarLabel}>
                    Invested: {((sipResult.invested / sipResult.total) * 100).toFixed(0)}%
                  </Text>
                </View>
                <View style={styles.visualBarSection}>
                  <View style={[styles.visualBarFill, { 
                    width: `${(sipResult.returns / sipResult.total) * 100}%`,
                    backgroundColor: '#10B981'
                  }]} />
                  <Text style={styles.visualBarLabel}>
                    Returns: {((sipResult.returns / sipResult.total) * 100).toFixed(0)}%
                  </Text>
                </View>
              </View>

              {/* Insight */}
              <View style={styles.insightCard}>
                <Text style={styles.insightText}>
                  💡 By investing just ₹{Number(sipAmount).toLocaleString('en-IN')}/month, 
                  you'll earn ₹{sipResult.returns.toLocaleString('en-IN')} in returns! 
                  That's {((sipResult.returns / sipResult.invested) * 100).toFixed(0)}% growth! 🔥
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
      {/* ❌ NO NavBar here! */}
    </View>
  );
}

// ========== GOAL PLANNER SCREEN ==========
if (screen === 'tools' && activeTool === 'goal') {
  return (
    <View style={styles.container}>
      <View style={[styles.headerBlue, { backgroundColor: '#8B5CF6' }]}>
        <TouchableOpacity onPress={() => {
          setActiveTool(null);
          setGoalAmount('');
          setGoalYears('');
          setGoalReturn('');
          setGoalResult(null);
        }}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Goal Planner 🎯</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollViewFull}>
        <View style={styles.calculatorContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>🎯 Target Amount (₹)</Text>
            <TextInput
              style={styles.calculatorInput}
              placeholder="e.g., 5000000"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={goalAmount}
              onChangeText={setGoalAmount}
            />
            <Text style={styles.inputHint}>How much do you need?</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>📅 Time Period (Years)</Text>
            <TextInput
              style={styles.calculatorInput}
              placeholder="e.g., 15"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={goalYears}
              onChangeText={setGoalYears}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>📈 Expected Return (%)</Text>
            <TextInput
              style={styles.calculatorInput}
              placeholder="e.g., 12"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={goalReturn}
              onChangeText={setGoalReturn}
            />
          </View>

          <TouchableOpacity style={styles.calculateButton} onPress={calculateGoal}>
            <Text style={styles.calculateButtonText}>Calculate 🚀</Text>
          </TouchableOpacity>

          {goalResult && (
            <View style={styles.resultsCard}>
              <Text style={styles.resultsTitle}>Your Plan 📊</Text>
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Monthly Investment Needed</Text>
                <Text style={[styles.resultValue, styles.resultGain]}>
                  ₹{goalResult.monthly.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Total You'll Invest</Text>
                <Text style={styles.resultValue}>
                  ₹{goalResult.total.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={[styles.resultRow, styles.resultRowTotal]}>
                <Text style={styles.resultLabelTotal}>Goal Amount</Text>
                <Text style={styles.resultValueTotal}>
                  ₹{goalResult.target.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={styles.insightCard}>
                <Text style={styles.insightText}>
                  💡 Start a SIP of ₹{goalResult.monthly.toLocaleString('en-IN')}/month 
                  and reach your ₹{(goalResult.target/100000).toFixed(0)} lakh goal! 
                  Your returns: ₹{(goalResult.target - goalResult.total).toLocaleString('en-IN')} 🎯
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ========== LUMPSUM VS SIP SCREEN ==========
if (screen === 'tools' && activeTool === 'returns') {
  return (
    <View style={styles.container}>
      <View style={[styles.headerBlue, { backgroundColor: '#10B981' }]}>
        <TouchableOpacity onPress={() => {
          setActiveTool(null);
          setCompareAmount('');
          setCompareYears('');
          setCompareReturn('');
          setCompareResult(null);
        }}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Lumpsum vs SIP 📈</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollViewFull}>
        <View style={styles.calculatorContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>💰 Total Amount (₹)</Text>
            <TextInput
              style={styles.calculatorInput}
              placeholder="e.g., 100000"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={compareAmount}
              onChangeText={setCompareAmount}
            />
            <Text style={styles.inputHint}>
              Lumpsum: Invest all at once | SIP: Divide over time
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>📅 Investment Period (Years)</Text>
            <TextInput
              style={styles.calculatorInput}
              placeholder="e.g., 10"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={compareYears}
              onChangeText={setCompareYears}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>📈 Expected Return (%)</Text>
            <TextInput
              style={styles.calculatorInput}
              placeholder="e.g., 12"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={compareReturn}
              onChangeText={setCompareReturn}
            />
          </View>

          <TouchableOpacity style={styles.calculateButton} onPress={calculateComparison}>
            <Text style={styles.calculateButtonText}>Compare 🚀</Text>
          </TouchableOpacity>

          {compareResult && (
            <View style={styles.resultsCard}>
              <Text style={styles.resultsTitle}>Comparison Results 📊</Text>
              
              {/* Lumpsum */}
              <View style={styles.compareSection}>
                <Text style={styles.compareSectionTitle}>
                  💎 Lumpsum (Invest all now)
                </Text>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Invested</Text>
                  <Text style={styles.resultValue}>
                    ₹{compareResult.lumpsum.invested.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Returns</Text>
                  <Text style={[styles.resultValue, styles.resultGain]}>
                    ₹{compareResult.lumpsum.returns.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={[styles.resultRow, styles.resultRowTotal]}>
                  <Text style={styles.resultLabelTotal}>Final Value</Text>
                  <Text style={styles.resultValueTotal}>
                    ₹{compareResult.lumpsum.total.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>

              {/* SIP */}
              <View style={styles.compareSection}>
                <Text style={styles.compareSectionTitle}>
                  📅 SIP (₹{compareResult.sip.monthly.toLocaleString('en-IN')}/month)
                </Text>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Invested</Text>
                  <Text style={styles.resultValue}>
                    ₹{compareResult.sip.invested.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Returns</Text>
                  <Text style={[styles.resultValue, styles.resultGain]}>
                    ₹{compareResult.sip.returns.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={[styles.resultRow, styles.resultRowTotal]}>
                  <Text style={styles.resultLabelTotal}>Final Value</Text>
                  <Text style={styles.resultValueTotal}>
                    ₹{compareResult.sip.total.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>

              <View style={styles.winnerCard}>
                <Text style={styles.winnerText}>
                  🏆 Winner: {compareResult.winner}
                </Text>
                <Text style={styles.winnerSubtext}>
                  {compareResult.winner === 'Lumpsum' 
                    ? 'Lumpsum wins if you invest all at the start!' 
                    : 'SIP benefits from rupee cost averaging!'}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ========== FUND COMPARE SCREEN ==========
if (screen === 'tools' && activeTool === 'compare') {
  return (
    <View style={styles.container}>
      <View style={[styles.headerBlue, { backgroundColor: '#EC4899' }]}>
        <TouchableOpacity onPress={() => {
          setActiveTool(null);
          setSelectedFunds([]);
          setFundSearchQuery('');
          setFundSearchResults([]);
        }}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Fund Compare ⚖️</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollViewFull}>
        <View style={styles.calculatorContainer}>
          {/* Search Bar */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              🔍 Search Funds (Select up to 3)
            </Text>
            <View style={styles.searchBox}>
              <Search size={20} color="#EC4899" />
              <TextInput
                style={styles.searchInput}
                placeholder="type fund name..."
                placeholderTextColor="#6B7280"
                value={fundSearchQuery}
                onChangeText={(text) => {
                  setFundSearchQuery(text);
                  searchFundsForCompare(text);
                }}
              />
            </View>
          </View>

          {/* Search Results */}
          {fundSearchResults.length > 0 && (
            <View style={styles.searchResultsBox}>
              {fundSearchResults.slice(0, 5).map((fund) => (
                <TouchableOpacity
                  key={fund.code}
                  style={styles.searchResultItem}
                  onPress={() => addFundToCompare(fund.code)}
                >
                  <Text style={styles.searchResultName} numberOfLines={1}>
                    {fund.name}
                  </Text>
                  <Text style={styles.searchResultCagr}>
                    {fund.cagr > 0 ? '+' : ''}{fund.cagr}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Selected Funds */}
          {selectedFunds.length > 0 && (
            <View style={styles.selectedFundsContainer}>
              <Text style={styles.inputLabel}>
                ✅ Selected Funds ({selectedFunds.length}/3)
              </Text>
              {selectedFunds.map((fund, index) => (
                <View key={index} style={styles.selectedFundCard}>
                  <View style={styles.selectedFundInfo}>
                    <Text style={styles.selectedFundName} numberOfLines={1}>
                      {fund.name}
                    </Text>
                    <Text style={styles.selectedFundCagr}>
                      CAGR: {(fund.metrics.cagr * 100).toFixed(1)}%
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedFunds(selectedFunds.filter((_, i) => i !== index));
                    }}
                  >
                    <Text style={styles.removeFundButton}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

           {/* Comparison Table */}
{selectedFunds.length >= 2 && (
  <ScrollView horizontal showsHorizontalScrollIndicator={true}>
    <View style={styles.comparisonTableWide}>
      <Text style={styles.resultsTitle}>Side-by-Side Comparison 📊</Text>
      
      {/* Header Row - Fund Names */}
      <View style={styles.comparisonHeaderRow}>
        <View style={styles.comparisonMetricColumn}>
          <Text style={styles.comparisonHeaderLabel}>Metric</Text>
        </View>
        {selectedFunds.map((fund, i) => (
          <View key={i} style={styles.comparisonFundColumn}>
            <Text style={styles.comparisonFundHeader} numberOfLines={3}>
              {fund.name}
            </Text>
          </View>
        ))}
      </View>

      {/* Fund Type Row */}
      <View style={styles.comparisonDataRow}>
        <View style={styles.comparisonMetricColumn}>
          <Text style={styles.comparisonMetricName}>Fund Type</Text>
        </View>
        {selectedFunds.map((fund, i) => (
          <View key={i} style={styles.comparisonFundColumn}>
            <Text style={styles.comparisonValueText} numberOfLines={2}>
              {fund.type || 'N/A'}
            </Text>
          </View>
        ))}
      </View>

      {/* Riskometer Row */}
      <View style={styles.comparisonDataRow}>
        <View style={styles.comparisonMetricColumn}>
          <Text style={styles.comparisonMetricName}>Risk Level</Text>
        </View>
        {selectedFunds.map((fund, i) => (
          <View key={i} style={styles.comparisonFundColumn}>
            <View style={[styles.riskBadge, { 
              backgroundColor: 
                fund.risk?.toLowerCase().includes('high') ? 'rgba(239, 68, 68, 0.2)' : 
                fund.risk?.toLowerCase().includes('moderate') ? 'rgba(245, 158, 11, 0.2)' : 
                'rgba(16, 185, 129, 0.2)'
            }]}>
              <Text style={[styles.comparisonValueText, {
                color: 
                  fund.risk?.toLowerCase().includes('high') ? '#EF4444' : 
                  fund.risk?.toLowerCase().includes('moderate') ? '#F59E0B' : 
                  '#10B981'
              }]}>
                {fund.risk || 'N/A'}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Expense Ratio Row */}
      <View style={styles.comparisonDataRow}>
        <View style={styles.comparisonMetricColumn}>
          <Text style={styles.comparisonMetricName}>Expense Ratio</Text>
        </View>
        {selectedFunds.map((fund, i) => (
          <View key={i} style={styles.comparisonFundColumn}>
            <Text style={styles.comparisonValueText}>
              {fund.expense?.Direct 
                ? `D: ${fund.expense.Direct}%` 
                : fund.expense?.Regular 
                  ? `R: ${fund.expense.Regular}%` 
                  : 'N/A'}
            </Text>
            {fund.expense?.Regular && fund.expense?.Direct && (
              <Text style={styles.comparisonSubValue}>
                R: {fund.expense.Regular}%
              </Text>
            )}
          </View>
        ))}
      </View>

      {/* CAGR Row */}
      <View style={[styles.comparisonDataRow, styles.highlightRow]}>
        <View style={styles.comparisonMetricColumn}>
          <Text style={styles.comparisonMetricName}>CAGR</Text>
        </View>
        {selectedFunds.map((fund, i) => {
          const cagr = fund.metrics.cagr * 100;
          const isMax = Math.max(...selectedFunds.map(f => f.metrics.cagr * 100)) === cagr;
          return (
            <View key={i} style={styles.comparisonFundColumn}>
              <Text style={[
                styles.comparisonValueText,
                styles.comparisonGreen,
                isMax && styles.comparisonWinner
              ]}>
                {cagr.toFixed(2)}%
                {isMax && ' 🏆'}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Volatility Row */}
      <View style={styles.comparisonDataRow}>
        <View style={styles.comparisonMetricColumn}>
          <Text style={styles.comparisonMetricName}>Volatility</Text>
        </View>
        {selectedFunds.map((fund, i) => {
          const vol = fund.metrics.volatility ? fund.metrics.volatility * 100 : null;
          const isMin = vol && Math.min(...selectedFunds.map(f => 
            f.metrics.volatility ? f.metrics.volatility * 100 : Infinity
          )) === vol;
          return (
            <View key={i} style={styles.comparisonFundColumn}>
              <Text style={[
                styles.comparisonValueText,
                styles.comparisonOrange,
                isMin && styles.comparisonWinner
              ]}>
                {vol ? `${vol.toFixed(2)}%` : 'N/A'}
                {isMin && vol && ' 🏆'}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Sharpe Ratio Row */}
      <View style={[styles.comparisonDataRow, styles.highlightRow]}>
        <View style={styles.comparisonMetricColumn}>
          <Text style={styles.comparisonMetricName}>Sharpe Ratio</Text>
        </View>
        {selectedFunds.map((fund, i) => {
          const sharpe = fund.metrics.sharpe;
          const isMax = sharpe && Math.max(...selectedFunds.map(f => 
            f.metrics.sharpe || -Infinity
          )) === sharpe;
          return (
            <View key={i} style={styles.comparisonFundColumn}>
              <Text style={[
                styles.comparisonValueText,
                styles.comparisonGreen,
                isMax && styles.comparisonWinner
              ]}>
                {sharpe ? sharpe.toFixed(2) : 'N/A'}
                {isMax && sharpe && ' 🏆'}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Sortino Ratio Row */}
      <View style={styles.comparisonDataRow}>
        <View style={styles.comparisonMetricColumn}>
          <Text style={styles.comparisonMetricName}>Sortino Ratio</Text>
        </View>
        {selectedFunds.map((fund, i) => {
          const sortino = fund.metrics.sortino;
          const isMax = sortino && Math.max(...selectedFunds.map(f => 
            f.metrics.sortino || -Infinity
          )) === sortino;
          return (
            <View key={i} style={styles.comparisonFundColumn}>
              <Text style={[
                styles.comparisonValueText,
                styles.comparisonGreen,
                isMax && styles.comparisonWinner
              ]}>
                {sortino ? sortino.toFixed(2) : 'N/A'}
                {isMax && sortino && ' 🏆'}
              </Text>
            </View>
          );
        })}
      </View>

      {/* 1Y Return Row */}
      <View style={[styles.comparisonDataRow, styles.highlightRow]}>
        <View style={styles.comparisonMetricColumn}>
          <Text style={styles.comparisonMetricName}>1Y Return</Text>
        </View>
        {selectedFunds.map((fund, i) => {
          const ret = fund.metrics.return_1y ? fund.metrics.return_1y * 100 : null;
          const isMax = ret && Math.max(...selectedFunds.map(f => 
            f.metrics.return_1y ? f.metrics.return_1y * 100 : -Infinity
          )) === ret;
          return (
            <View key={i} style={styles.comparisonFundColumn}>
              <Text style={[
                styles.comparisonValueText,
                styles.comparisonGreen,
                isMax && styles.comparisonWinner
              ]}>
                {ret ? `${ret.toFixed(1)}%` : 'N/A'}
                {isMax && ret && ' 🏆'}
              </Text>
            </View>
          );
        })}
      </View>

      {/* 3Y Return Row */}
      <View style={styles.comparisonDataRow}>
        <View style={styles.comparisonMetricColumn}>
          <Text style={styles.comparisonMetricName}>3Y Return</Text>
        </View>
        {selectedFunds.map((fund, i) => {
          const ret = fund.metrics.return_3y ? fund.metrics.return_3y * 100 : null;
          const isMax = ret && Math.max(...selectedFunds.map(f => 
            f.metrics.return_3y ? f.metrics.return_3y * 100 : -Infinity
          )) === ret;
          return (
            <View key={i} style={styles.comparisonFundColumn}>
              <Text style={[
                styles.comparisonValueText,
                styles.comparisonGreen,
                isMax && styles.comparisonWinner
              ]}>
                {ret ? `${ret.toFixed(1)}%` : 'N/A'}
                {isMax && ret && ' 🏆'}
              </Text>
            </View>
          );
        })}
      </View>

      {/* 5Y Return Row */}
      <View style={[styles.comparisonDataRow, styles.highlightRow]}>
        <View style={styles.comparisonMetricColumn}>
          <Text style={styles.comparisonMetricName}>5Y Return</Text>
        </View>
        {selectedFunds.map((fund, i) => {
          const ret = fund.metrics.return_5y ? fund.metrics.return_5y * 100 : null;
          const isMax = ret && Math.max(...selectedFunds.map(f => 
            f.metrics.return_5y ? f.metrics.return_5y * 100 : -Infinity
          )) === ret;
          return (
            <View key={i} style={styles.comparisonFundColumn}>
              <Text style={[
                styles.comparisonValueText,
                styles.comparisonGreen,
                isMax && styles.comparisonWinner
              ]}>
                {ret ? `${ret.toFixed(1)}%` : 'N/A'}
                {isMax && ret && ' 🏆'}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Alpha Row - Coming Soon */}
      <View style={styles.comparisonDataRow}>
        <View style={styles.comparisonMetricColumn}>
          <Text style={styles.comparisonMetricName}>Alpha</Text>
        </View>
        {selectedFunds.map((fund, i) => (
          <View key={i} style={styles.comparisonFundColumn}>
            <Text style={[styles.comparisonValueText, styles.comparisonGray]}>
              Coming Soon
            </Text>
          </View>
        ))}
      </View>

      {/* Beta Row - Coming Soon */}
      <View style={[styles.comparisonDataRow, styles.highlightRow]}>
        <View style={styles.comparisonMetricColumn}>
          <Text style={styles.comparisonMetricName}>Beta</Text>
        </View>
        {selectedFunds.map((fund, i) => (
          <View key={i} style={styles.comparisonFundColumn}>
            <Text style={[styles.comparisonValueText, styles.comparisonGray]}>
              Coming Soon
            </Text>
          </View>
        ))}
      </View>

      {/* AI Verdict Row */}
      <View style={styles.comparisonDataRow}>
        <View style={styles.comparisonMetricColumn}>
          <Text style={styles.comparisonMetricName}>AI Verdict</Text>
        </View>
        {selectedFunds.map((fund, i) => (
          <View key={i} style={styles.comparisonFundColumn}>
            <Text style={styles.comparisonVerdictText} numberOfLines={3}>
              {fund.ai_verdict?.verdict || 'N/A'}
            </Text>
          </View>
        ))}
      </View>
    </View>
  </ScrollView>
)}

          {selectedFunds.length < 2 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Select at least 2 funds to compare! 📊
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ========== RISK ANALYZER SCREEN ==========
if (screen === 'tools' && activeTool === 'risk') {
  const questions = [
    { id: 1, q: 'What is your investment horizon?', opts: ['<1 year (1)', '1-3 years (2)', '3-5 years (4)', '5+ years (5)'], vals: [1, 2, 4, 5] },
    { id: 2, q: 'How would you react to a 20% drop?', opts: ['Panic & sell (1)', 'Worry (2)', 'Hold steady (4)', 'Buy more! (5)'], vals: [1, 2, 4, 5] },
    { id: 3, q: 'Your investment goal?', opts: ['Capital safety (1)', 'Regular income (2)', 'Growth (4)', 'Max returns (5)'], vals: [1, 2, 4, 5] },
    { id: 4, q: 'Your age group?', opts: ['50+ (1)', '40-50 (2)', '30-40 (4)', '<30 (5)'], vals: [1, 2, 4, 5] },
    { id: 5, q: 'Emergency fund status?', opts: ['None (1)', 'Building (2)', '3-6 months (4)', '6+ months (5)'], vals: [1, 2, 4, 5] }
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.headerBlue, { backgroundColor: '#F59E0B' }]}>
        <TouchableOpacity onPress={() => {
          setActiveTool(null);
          setRiskAnswers({});
          setRiskResult(null);
        }}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Risk Analyzer ⚠️</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollViewFull}>
        <View style={styles.calculatorContainer}>
          {!riskResult ? (
            <>
              <Text style={styles.quizTitle}>Answer these 5 questions 📝</Text>
              {questions.map((item) => (
                <View key={item.id} style={styles.questionCard}>
                  <Text style={styles.questionText}>{item.id}. {item.q}</Text>
                  {item.opts.map((opt, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.optionButton,
                        riskAnswers[item.id] === item.vals[idx] && styles.optionSelected
                      ]}
                      onPress={() => setRiskAnswers({...riskAnswers, [item.id]: item.vals[idx]})}
                    >
                      <Text style={[
                        styles.optionText,
                        riskAnswers[item.id] === item.vals[idx] && styles.optionTextSelected
                      ]}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}

              <TouchableOpacity style={styles.calculateButton} onPress={calculateRiskScore}>
                <Text style={styles.calculateButtonText}>Get My Risk Profile 🚀</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.resultsCard}>
              <Text style={styles.resultsTitle}>Your Risk Profile ⚠️</Text>
              
              <View style={styles.riskProfileCard}>
                <Text style={styles.riskProfileName}>{riskResult.profile}</Text>
                <Text style={styles.riskProfileScore}>
                  Score: {riskResult.score}/25 ({riskResult.percentage.toFixed(0)}%)
                </Text>
              </View>

              <View style={styles.scoreBar}>
                <View style={styles.scoreBarBg}>
                  <View style={[
                    styles.scoreBarFill, 
                    { width: `${riskResult.percentage}%`, backgroundColor: 
                      riskResult.percentage <= 40 ? '#10B981' : 
                      riskResult.percentage <= 70 ? '#F59E0B' : '#EF4444' 
                    }
                  ]} />
                </View>
              </View>

              <Text style={styles.riskDescription}>{riskResult.description}</Text>

              <Text style={styles.verdictSubtitle}>✅ Recommended Funds:</Text>
              {riskResult.funds.map((fund, i) => (
                <Text key={i} style={styles.verdictPro}>• {fund}</Text>
              ))}

              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  setRiskAnswers({});
                  setRiskResult(null);
                }}
              >
                <Text style={styles.backButtonText}>← retake quiz</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ========== TAX OPTIMIZER SCREEN ==========
if (screen === 'tools' && activeTool === 'tax') {
  // Load ELSS funds when screen opens
  if (elssFunds.length === 0 && activeTool === 'tax') {
    loadElssFunds();
  }

  return (
    <View style={styles.container}>
      <View style={[styles.headerBlue, { backgroundColor: '#EF4444' }]}>
        <TouchableOpacity onPress={() => {
          setActiveTool(null);
          setTaxIncome('');
          setTaxInvestment('');
          setTaxResult(null);
        }}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Tax Optimizer 💸</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollViewFull}>
        <View style={styles.calculatorContainer}>
          {/* Tax Calculator */}
          <Text style={styles.sectionHeader}>Calculate Tax Savings 💰</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>💼 Annual Income (₹)</Text>
            <TextInput
              style={styles.calculatorInput}
              placeholder="e.g., 1000000"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={taxIncome}
              onChangeText={setTaxIncome}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>💸 ELSS Investment (₹)</Text>
            <TextInput
              style={styles.calculatorInput}
              placeholder="e.g., 150000"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={taxInvestment}
              onChangeText={setTaxInvestment}
            />
            <Text style={styles.inputHint}>
              Max deduction: ₹1.5 lakhs under Section 80C
            </Text>
          </View>

          <TouchableOpacity style={styles.calculateButton} onPress={calculateTaxSavings}>
            <Text style={styles.calculateButtonText}>Calculate Savings 🚀</Text>
          </TouchableOpacity>

          {taxResult && (
            <View style={styles.resultsCard}>
              <Text style={styles.resultsTitle}>Tax Savings 💰</Text>
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Investment</Text>
                <Text style={styles.resultValue}>
                  ₹{taxResult.investment.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Eligible Deduction</Text>
                <Text style={styles.resultValue}>
                  ₹{taxResult.deduction.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Tax Saved</Text>
                <Text style={[styles.resultValue, styles.resultGain]}>
                  ₹{taxResult.taxSaved.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={[styles.resultRow, styles.resultRowTotal]}>
                <Text style={styles.resultLabelTotal}>Effective Cost</Text>
                <Text style={styles.resultValueTotal}>
                  ₹{taxResult.effectiveCost.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={styles.insightCard}>
                <Text style={styles.insightText}>
                  💡 You save ₹{taxResult.taxSaved.toLocaleString('en-IN')} in taxes! 
                  Your actual investment cost is only ₹{taxResult.effectiveCost.toLocaleString('en-IN')}! 🔥
                </Text>
              </View>
            </View>
          )}

          {/* ELSS Funds List */}
          <Text style={styles.sectionHeader}>Top ELSS Funds 📋</Text>
          {elssFunds.length > 0 ? (
            elssFunds.slice(0, 10).map((fund, index) => (
              <View key={index} style={styles.elssFundCard}>
                <Text style={styles.elssFundName} numberOfLines={2}>
                  {fund.name}
                </Text>
                <View style={styles.elssFundMeta}>
                  <View style={styles.elssFundMetaItem}>
                    <Text style={styles.elssFundLabel}>CAGR</Text>
                    <Text style={styles.elssFundValue}>
                      {fund.cagr > 0 ? '+' : ''}{fund.cagr}%
                    </Text>
                  </View>
                  {fund.risk && (
                    <View style={styles.elssFundMetaItem}>
                      <Text style={styles.elssFundLabel}>Risk</Text>
                      <Text style={styles.elssFundValue}>{fund.risk}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#EF4444" />
              <Text style={styles.loadingText}>Loading ELSS funds...</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}


// ========== MY FUND ANALYZER SCREEN ==========
if (screen === 'myFundAnalyzer') {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerPurple}>
        <TouchableOpacity onPress={() => {
          setScreen('home');
          setActiveTool(null);
          setMyFundCode(null);
          setMyFundData(null);
          setRecommendations([]);
        }}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>🔍 My Fund Analyzer</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        
        {/* Instructions Card */}
        {!myFundData && (
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>Find Better Alternatives</Text>
            <Text style={styles.instructionsText}>
              Enter your current mutual fund to get personalized recommendations for better performing funds in the same category.
            </Text>
          </View>
        )}

        {/* Search Box */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Search size={20} color="#A78BFA" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search your fund..."
              placeholderTextColor="#6B7280"
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                searchFunds(text);
              }}
            />
          </View>
        </View>

        {/* Loading */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#A78BFA" />
            <Text style={styles.loadingText}>Analyzing...</Text>
          </View>
        )}

        {/* Search Results - Select Your Fund */}
        {!myFundData && searchResults.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Select Your Fund</Text>
            {searchResults.map((fund, index) => (
              <TouchableOpacity
                key={index}
                style={styles.fundCard}
                onPress={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  getRecommendations(fund.code);
                }}
              >
                <View style={styles.fundCardContent}>
                  <Text style={styles.fundName} numberOfLines={2}>
                    {fund.name}
                  </Text>
                  
                  {fund.category && (
                    <View style={styles.categoryRow}>
                      <Text style={styles.categoryEmoji}>{fund.category_emoji}</Text>
                      <Text style={styles.categoryText}>{fund.category}</Text>
                    </View>
                  )}
                </View>
                
                {fund.score && (
                  <View style={styles.scoreBadge}>
                    <Text style={styles.scoreEmoji}>{fund.score.tier.emoji}</Text>
                    <Text style={styles.scoreValue}>
                      {Math.round(fund.score.total)}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Your Fund Analysis */}
        {myFundData && (
          <View style={styles.analyzerContainer}>
            
            {/* Your Fund Card */}
            <View style={styles.yourFundCard}>
              <Text style={styles.sectionTitle}>📊 Your Current Fund</Text>
              
              <View style={styles.yourFundDetails}>
                <Text style={styles.yourFundName}>{myFundData.name}</Text>
                
                {myFundData.category && (
                  <View style={styles.categoryRow}>
                    <Text style={styles.categoryEmoji}>{myFundData.category_emoji}</Text>
                    <Text style={styles.categoryText}>{myFundData.category}</Text>
                  </View>
                )}

                <View style={styles.yourFundMetrics}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Score</Text>
                    <View style={styles.scoreDisplay}>
                      <Text style={styles.metricValue}>
                        {myFundData.score?.total ? Math.round(myFundData.score.total) : 'N/A'}
                      </Text>
                      {myFundData.score?.tier && (
                        <Text style={styles.scoreTierText}>
                          {myFundData.score.tier.label}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Expense Ratio</Text>
                    <Text style={styles.metricValue}>
                      {myFundData.expense_ratio?.toFixed(2)}%
                    </Text>
                  </View>

                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>CAGR</Text>
                    <Text style={styles.metricValue}>
                      {myFundData.cagr?.toFixed(2)}%
                    </Text>
                  </View>

                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Sharpe Ratio</Text>
                    <Text style={styles.metricValue}>
                      {myFundData.sharpe?.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Recommendations Section */}
            {recommendations.length > 0 ? (
              <View style={styles.recommendationsSection}>
                <Text style={styles.sectionTitle}>
                  🎯 Better Alternatives Found ({recommendations.length})
                </Text>
                
                {recommendations.map((rec, index) => (
                  <View key={index} style={styles.recommendationCard}>
                    
                    {/* Switch Potential Badge */}
                    <View style={[
                      styles.switchPotentialBadge,
                      rec.switch_potential === 'High' && styles.switchPotentialHigh,
                      rec.switch_potential === 'Moderate' && styles.switchPotentialModerate,
                      rec.switch_potential === 'Low' && styles.switchPotentialLow
                    ]}>
                      <Text style={styles.switchPotentialText}>
                        {rec.switch_potential} Switch Potential
                      </Text>
                    </View>

                    {/* Fund Name */}
                    <Text style={styles.recommendationName}>{rec.name}</Text>
                    
                    {/* Category */}
                    {rec.category && (
                      <View style={styles.categoryRow}>
                        <Text style={styles.categoryEmoji}>{rec.category_emoji}</Text>
                        <Text style={styles.categoryText}>{rec.category}</Text>
                      </View>
                    )}

                    {/* Score Comparison */}
                    <View style={styles.scoreComparison}>
                      <View style={styles.scoreCompareItem}>
                        <Text style={styles.scoreCompareLabel}>Your Fund</Text>
                        <Text style={styles.scoreCompareValue}>
                          {myFundData.score?.total ? Math.round(myFundData.score.total) : 'N/A'}
                        </Text>
                      </View>
                      
                      <Text style={styles.scoreArrow}>→</Text>
                      
                      <View style={styles.scoreCompareItem}>
                        <Text style={styles.scoreCompareLabel}>This Fund</Text>
                        <Text style={[styles.scoreCompareValue, styles.scoreCompareHighlight]}>
                          {rec.score?.total ? Math.round(rec.score.total) : 'N/A'}
                        </Text>
                      </View>
                    </View>

                    {/* Improvement Indicator */}
                    <View style={styles.improvementRow}>
                      <Text style={styles.improvementText}>
                        📈 Better by +{rec.score_difference.toFixed(0)} points
                      </Text>
                    </View>

                    {/* Key Metrics */}
                    <View style={styles.recMetrics}>
                      <View style={styles.recMetricItem}>
                        <Text style={styles.recMetricLabel}>Expense</Text>
                        <Text style={styles.recMetricValue}>
                          {rec.expense_ratio?.toFixed(2)}%
                        </Text>
                        {rec.expense_difference > 0 && (
                          <Text style={styles.expenseSavings}>
                            (Save {rec.expense_difference.toFixed(2)}%)
                          </Text>
                        )}
                      </View>

                      <View style={styles.recMetricItem}>
                        <Text style={styles.recMetricLabel}>CAGR</Text>
                        <Text style={styles.recMetricValue}>
                          {rec.cagr?.toFixed(2)}%
                        </Text>
                      </View>

                      <View style={styles.recMetricItem}>
                        <Text style={styles.recMetricLabel}>Sharpe</Text>
                        <Text style={styles.recMetricValue}>
                          {rec.sharpe?.toFixed(2)}
                        </Text>
                      </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.recActions}>
                      <TouchableOpacity
                        style={styles.recButtonSecondary}
                        onPress={() => {
                          setPreviousScreen('myFundAnalyzer');  // ✅ ADD THIS
                          getFundDetails(rec.code);
                          setScreen('check');
                        }}
                      >
                        <Text style={styles.recButtonSecondaryText}>View Details</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.recButtonPrimary}
                        onPress={() => {
                          compareTwoFunds(myFundData.code, rec.code);
                        }}
                      >
                        <Text style={styles.recButtonPrimaryText}>Compare</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.recButtonCalculator}
                        onPress={() => toggleCalculator(index)}
                      >
                        <Text style={styles.recButtonCalculatorText}>
                          💰 Calculate Returns
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Investment Calculator Section */}
{expandedCalculators[index] && (
  <View style={styles.calculatorSection}>
    <Text style={styles.calculatorTitle}>📊 Compare Your Investment</Text>
    
    {/* Amount Input */}
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>Investment Amount</Text>
      <TextInput
        style={styles.amountInput}
        value={investmentInputs[index]?.amount || ''}
        keyboardType="numeric"
        placeholder="Enter amount (e.g., 50000)"
        placeholderTextColor="#9CA3AF"
        onChangeText={(text) => updateInvestmentInput(index, 'amount', text)}
      />
    </View>

    {/* Date Input */}
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>Investment Date</Text>
      <TouchableOpacity
        style={styles.dateInput}
        onPress={() => openDatePicker(index)}
      >
        <Text style={investmentInputs[index]?.date ? styles.dateInputText : styles.dateInputPlaceholder}>
          {investmentInputs[index]?.date || 'Select date'}
        </Text>
        <Text style={styles.dateInputIcon}>📅</Text>
      </TouchableOpacity>
    </View>

    {/* Calculate Button */}
    <TouchableOpacity
      style={styles.calculateButton}
      onPress={() => calculateInvestmentComparison(index, myFundData.code, rec.code)}
      disabled={calculatingReturns[index]}
    >
      <Text style={styles.calculateButtonText}>
        {calculatingReturns[index] ? 'Calculating...' : 'Compare Returns'}
      </Text>
    </TouchableOpacity>

    {/* Results Section */}
    {comparisonResults[index] && (
      <View style={styles.resultsSection}>
        <Text style={styles.resultsTitle}>📈 Investment Comparison</Text>

        {/* Adjustment Notice */}
        {comparisonResults[index].adjustment?.adjusted && (
          <View style={styles.adjustmentNotice}>
            <Text style={styles.adjustmentIcon}>ℹ️</Text>
            <View style={styles.adjustmentTextContainer}>
              <Text style={styles.adjustmentTitle}>Date Adjusted for Fair Comparison</Text>
              <Text style={styles.adjustmentText}>
                {comparisonResults[index].adjustment.disclaimer}
              </Text>
              <Text style={styles.adjustmentDetail}>
                Original Date: {comparisonResults[index].adjustment.original_date}
              </Text>
              <Text style={styles.adjustmentDetail}>
                Comparison Date: {comparisonResults[index].adjustment.adjusted_date}
              </Text>
            </View>
          </View>
        )}


        {/* Current Fund Results */}
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultLabel}>Your Current Fund</Text>
          </View>
          <View style={styles.resultDetails}>
            <View style={styles.resultRow}>
              <Text style={styles.resultKey}>Invested</Text>
              <Text style={styles.resultValue}>
                {formatCurrency(comparisonResults[index].currentFund.investedAmount)}
              </Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultKey}>Current Value</Text>
              <Text style={[styles.resultValue, styles.resultValueBold]}>
                {formatCurrency(comparisonResults[index].currentFund.currentValue)}
              </Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultKey}>Returns</Text>
              <Text style={[styles.resultValue, styles.returnPositive]}>
                +{formatCurrency(comparisonResults[index].currentFund.absoluteReturns)}
                {' '}({comparisonResults[index].currentFund.returnPercentage}%)
              </Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultKey}>XIRR</Text>
              <Text style={styles.resultValue}>
                {comparisonResults[index].currentFund.xirr}% p.a.
              </Text>
            </View>
          </View>
        </View>

        {/* Recommended Fund Results */}
        <View style={[styles.resultCard, styles.resultCardHighlight]}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultLabel}>✨ Recommended Fund</Text>
          </View>
          <View style={styles.resultDetails}>
            <View style={styles.resultRow}>
              <Text style={styles.resultKey}>Invested</Text>
              <Text style={styles.resultValue}>
                {formatCurrency(comparisonResults[index].recommendedFund.investedAmount)}
              </Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultKey}>Current Value</Text>
              <Text style={[styles.resultValue, styles.resultValueBold]}>
                {formatCurrency(comparisonResults[index].recommendedFund.currentValue)}
              </Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultKey}>Returns</Text>
              <Text style={[styles.resultValue, styles.returnPositive]}>
                +{formatCurrency(comparisonResults[index].recommendedFund.absoluteReturns)}
                {' '}({comparisonResults[index].recommendedFund.returnPercentage}%)
              </Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultKey}>XIRR</Text>
              <Text style={styles.resultValue}>
                {comparisonResults[index].recommendedFund.xirr}% p.a.
              </Text>
            </View>
          </View>
        </View>

        {/* Difference Highlight */}
        <View style={[
          styles.differenceCard,
          comparisonResults[index].difference.isPositive ? styles.differencePositive : styles.differenceNegative
        ]}>
          <Text style={styles.differenceTitle}>
            {comparisonResults[index].difference.isPositive ? '🎉 You Would Have Gained' : '⚠️ Difference'}
          </Text>
          <Text style={styles.differenceAmount}>
            {comparisonResults[index].difference.isPositive ? '+' : ''}
            {formatCurrency(comparisonResults[index].difference.value)}
          </Text>
          <Text style={styles.differenceSubtext}>
            ({comparisonResults[index].difference.isPositive ? '+' : ''}
            {comparisonResults[index].difference.percentage}% higher returns)
          </Text>
          <Text style={styles.differenceDetail}>
            XIRR Difference: {comparisonResults[index].difference.isPositive ? '+' : ''}
            {comparisonResults[index].difference.xirr}% p.a.
          </Text>
        </View>
      </View>
    )}
  </View>
)}    

                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.noRecommendationsCard}>
                <Text style={styles.noRecommendationsEmoji}>🎉</Text>
                <Text style={styles.noRecommendationsTitle}>You're All Set!</Text>
                <Text style={styles.noRecommendationsText}>
                  Your fund is already one of the best performers in its category. No better alternatives found.
                </Text>
              </View>
            )}

            {/* Reset Button */}
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setMyFundCode(null);
                setMyFundData(null);
                setRecommendations([]);
                setSearchQuery('');
              }}
            >
              <Text style={styles.resetButtonText}>Analyze Another Fund</Text>
            </TouchableOpacity>

          </View>
        )}

      </ScrollView>
      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => setShowDatePicker(false)}
        maximumDate={new Date()}
        minimumDate={new Date(2000, 0, 1)}
      />  
      
    </View>
  );
}


// ========== COMPARISON SCREEN ==========
if (screen === 'compare' && compareMode && comparisonData) {
  const fund1 = comparisonData.fund1;
  const fund2 = comparisonData.fund2;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerPurple}>
        <TouchableOpacity onPress={() => {
          setCompareMode(false);
          setComparisonData(null);
          setScreen('myFundAnalyzer');
        }}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>⚖️ Compare Funds</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        
        {/* Fund Headers */}
        <View style={styles.comparisonHeader}>
          <View style={styles.comparisonFundCard}>
            <Text style={styles.comparisonFundName} numberOfLines={2}>
              {fund1.name}
            </Text>
            {fund1.score && (
              <View style={styles.comparisonScore}>
                <Text style={styles.comparisonScoreEmoji}>
                  {fund1.score.tier?.emoji || '📊'}
                </Text>
                <Text style={styles.comparisonScoreValue}>
                  {Math.round(fund1.score.total)}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.comparisonVs}>VS</Text>

          <View style={styles.comparisonFundCard}>
            <Text style={styles.comparisonFundName} numberOfLines={2}>
              {fund2.name}
            </Text>
            {fund2.score && (
              <View style={styles.comparisonScore}>
                <Text style={styles.comparisonScoreEmoji}>
                  {fund2.score.tier?.emoji || '📊'}
                </Text>
                <Text style={styles.comparisonScoreValue}>
                  {Math.round(fund2.score.total)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Comparison Table */}
        <View style={styles.comparisonTable}>
          
          {/* Score */}
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonMetricName}>Overall Score</Text>
            <View style={styles.comparisonValues}>
              <Text style={[
                styles.comparisonValue,
                fund1.score?.total > fund2.score?.total && styles.comparisonValueBetter
              ]}>
                {fund1.score?.total ? Math.round(fund1.score.total) : 'N/A'}
              </Text>
              <Text style={[
                styles.comparisonValue,
                fund2.score?.total > fund1.score?.total && styles.comparisonValueBetter
              ]}>
                {fund2.score?.total ? Math.round(fund2.score.total) : 'N/A'}
              </Text>
            </View>
          </View>

          {/* Expense Ratio */}
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonMetricName}>Expense Ratio</Text>
            <View style={styles.comparisonValues}>
              <Text style={[
                styles.comparisonValue,
                parseFloat(fund1.expense?.Direct || 999) < parseFloat(fund2.expense?.Direct || 999) && styles.comparisonValueBetter
              ]}>
                {fund1.expense?.Direct || 'N/A'}%
              </Text>
              <Text style={[
                styles.comparisonValue,
                parseFloat(fund2.expense?.Direct || 999) < parseFloat(fund1.expense?.Direct || 999) && styles.comparisonValueBetter
              ]}>
                {fund2.expense?.Direct || 'N/A'}%
              </Text>
            </View>
          </View>

          {/* CAGR */}
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonMetricName}>CAGR</Text>
            <View style={styles.comparisonValues}>
              <Text style={[
                styles.comparisonValue,
                fund1.cagr > fund2.cagr && styles.comparisonValueBetter
              ]}>
                {fund1.cagr ? (fund1.cagr * 100).toFixed(2) : 'N/A'}%
              </Text>
              <Text style={[
                styles.comparisonValue,
                fund2.cagr > fund1.cagr && styles.comparisonValueBetter
              ]}>
                {fund2.cagr ? (fund2.cagr * 100).toFixed(2) : 'N/A'}%
              </Text>
            </View>
          </View>

          {/* Sharpe Ratio */}
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonMetricName}>Sharpe Ratio</Text>
            <View style={styles.comparisonValues}>
              <Text style={[
                styles.comparisonValue,
                fund1.sharpe > fund2.sharpe && styles.comparisonValueBetter
              ]}>
                {fund1.sharpe?.toFixed(2) || 'N/A'}
              </Text>
              <Text style={[
                styles.comparisonValue,
                fund2.sharpe > fund1.sharpe && styles.comparisonValueBetter
              ]}>
                {fund2.sharpe?.toFixed(2) || 'N/A'}
              </Text>
            </View>
          </View>

          {/* Sortino Ratio */}
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonMetricName}>Sortino Ratio</Text>
            <View style={styles.comparisonValues}>
              <Text style={[
                styles.comparisonValue,
                fund1.sortino > fund2.sortino && styles.comparisonValueBetter
              ]}>
                {fund1.sortino?.toFixed(2) || 'N/A'}
              </Text>
              <Text style={[
                styles.comparisonValue,
                fund2.sortino > fund1.sortino && styles.comparisonValueBetter
              ]}>
                {fund2.sortino?.toFixed(2) || 'N/A'}
              </Text>
            </View>
          </View>

          {/* Volatility */}
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonMetricName}>Volatility</Text>
            <View style={styles.comparisonValues}>
              <Text style={[
                styles.comparisonValue,
                fund1.volatility < fund2.volatility && styles.comparisonValueBetter
              ]}>
                {fund1.volatility ? (fund1.volatility * 100).toFixed(2) : 'N/A'}%
              </Text>
              <Text style={[
                styles.comparisonValue,
                fund2.volatility < fund1.volatility && styles.comparisonValueBetter
              ]}>
                {fund2.volatility ? (fund2.volatility * 100).toFixed(2) : 'N/A'}%
              </Text>
            </View>
          </View>

          {/* Max Drawdown */}
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonMetricName}>Max Drawdown</Text>
            <View style={styles.comparisonValues}>
              <Text style={[
                styles.comparisonValue,
                fund1.max_drawdown > fund2.max_drawdown && styles.comparisonValueBetter
              ]}>
                {fund1.max_drawdown ? (fund1.max_drawdown * 100).toFixed(2) : 'N/A'}%
              </Text>
              <Text style={[
                styles.comparisonValue,
                fund2.max_drawdown > fund1.max_drawdown && styles.comparisonValueBetter
              ]}>
                {fund2.max_drawdown ? (fund2.max_drawdown * 100).toFixed(2) : 'N/A'}%
              </Text>
            </View>
          </View>

          {/* Consistency Score */}
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonMetricName}>Consistency Score</Text>
            <View style={styles.comparisonValues}>
              <Text style={[
                styles.comparisonValue,
                fund1.consistency_score > fund2.consistency_score && styles.comparisonValueBetter
              ]}>
                {fund1.consistency_score?.toFixed(1) || 'N/A'}
              </Text>
              <Text style={[
                styles.comparisonValue,
                fund2.consistency_score > fund1.consistency_score && styles.comparisonValueBetter
              ]}>
                {fund2.consistency_score?.toFixed(1) || 'N/A'}
              </Text>
            </View>
          </View>

          {/* Positive Months % */}
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonMetricName}>Positive Months %</Text>
            <View style={styles.comparisonValues}>
              <Text style={[
                styles.comparisonValue,
                fund1.positive_months_pct > fund2.positive_months_pct && styles.comparisonValueBetter
              ]}>
                {fund1.positive_months_pct ? (fund1.positive_months_pct * 100).toFixed(0) : 'N/A'}%
              </Text>
              <Text style={[
                styles.comparisonValue,
                fund2.positive_months_pct > fund1.positive_months_pct && styles.comparisonValueBetter
              ]}>
                {fund2.positive_months_pct ? (fund2.positive_months_pct * 100).toFixed(0) : 'N/A'}%
              </Text>
            </View>
          </View>

          {/* Fund Age */}
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonMetricName}>Fund Age</Text>
            <View style={styles.comparisonValues}>
              <Text style={styles.comparisonValue}>
                {fund1.fund_age} yrs
              </Text>
              <Text style={styles.comparisonValue}>
                {fund2.fund_age} yrs
              </Text>
            </View>
          </View>

          {/* Risk Level */}
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonMetricName}>Risk Level</Text>
            <View style={styles.comparisonValues}>
              <Text style={styles.comparisonValue}>
                {fund1.risk || 'N/A'}
              </Text>
              <Text style={styles.comparisonValue}>
                {fund2.risk || 'N/A'}
              </Text>
            </View>
          </View>

        </View>

        {/* Legend */}
        <View style={styles.comparisonLegend}>
          <Text style={styles.comparisonLegendText}>
            💚 Green indicates better performance
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}


// ========== LEARN SECTION - MAIN SCREEN ==========
if (screen === 'learn' && !selectedTopic) {
  const currentContent = activeTab === 'tips' ? learnContent.tips : 
                         activeTab === 'glossary' ? learnContent.glossary : 
                         activeTab === 'advanced' ? learnContent.advanced : 
                         learnContent.beginner;

  return (
    <View style={styles.container}>
      <View style={[styles.headerBlue, { backgroundColor: '#8B5CF6' }]}>
        <Text style={styles.pageTitle}>Learn 📚</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'beginner' && styles.tabButtonActive]}
            onPress={() => setActiveTab('beginner')}
          >
            <Text style={[styles.tabText, activeTab === 'beginner' && styles.tabTextActive]}>
              Beginner
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'advanced' && styles.tabButtonActive]}
            onPress={() => setActiveTab('advanced')}
          >
            <Text style={[styles.tabText, activeTab === 'advanced' && styles.tabTextActive]}>
              Advanced
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'tips' && styles.tabButtonActive]}
            onPress={() => setActiveTab('tips')}
          >
            <Text style={[styles.tabText, activeTab === 'tips' && styles.tabTextActive]}>
              Tips
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'glossary' && styles.tabButtonActive]}
            onPress={() => setActiveTab('glossary')}
          >
            <Text style={[styles.tabText, activeTab === 'glossary' && styles.tabTextActive]}>
              Glossary
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.learnContainer}>
          {/* Topics List (Beginner & Advanced) */}
          {(activeTab === 'beginner' || activeTab === 'advanced') && (
            <>
              <Text style={styles.learnSectionTitle}>
                {activeTab === 'beginner' ? '🌱 Start Here' : '🚀 Level Up'}
              </Text>
              {currentContent.map((topic) => (
                <TouchableOpacity
                  key={topic.id}
                  style={styles.topicCard}
                  onPress={() => setSelectedTopic(topic)}
                >
                  <View style={styles.topicContent}>
                    <Text style={styles.topicIcon}>{topic.icon}</Text>
                    <View style={styles.topicInfo}>
                      <Text style={styles.topicTitle}>{topic.title}</Text>
                      <Text style={styles.topicSubtitle}>{topic.subtitle}</Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color="#8B5CF6" />
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* Tips */}
          {activeTab === 'tips' && (
            <>
              <Text style={styles.learnSectionTitle}>💡 Daily Wisdom</Text>
              {currentContent.map((tip, index) => (
                <View key={index} style={styles.tipCard}>
                  <Text style={styles.tipNumber}>Tip {index + 1}</Text>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </>
          )}

          {/* Glossary */}
          {activeTab === 'glossary' && (
            <>
              <Text style={styles.learnSectionTitle}>📖 Quick Reference</Text>
              {currentContent.map((item, index) => (
                <View key={index} style={styles.glossaryCard}>
                  <Text style={styles.glossaryTerm}>{item.term}</Text>
                  <Text style={styles.glossaryDefinition}>{item.definition}</Text>
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>
      <Navigation 
          screen={screen}
          setScreen={setScreen}
          setSelectedFund={setSelectedFund}
          setActiveTool={setActiveTool}
          setSelectedTopic={setSelectedTopic}
        />
    </View>
  );
}

// ========== LEARN SECTION - ARTICLE VIEW ==========
if (screen === 'learn' && selectedTopic) {
  return (
    <View style={styles.container}>
      <View style={[styles.headerBlue, { backgroundColor: '#8B5CF6' }]}>
        <TouchableOpacity onPress={() => setSelectedTopic(null)}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.pageTitle} numberOfLines={1}>
          {selectedTopic.icon} {selectedTopic.title}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollViewFull}>
        <View style={styles.articleContainer}>
          <Text style={styles.articleTitle}>{selectedTopic.title}</Text>
          <Text style={styles.articleSubtitle}>{selectedTopic.subtitle}</Text>
          <Text style={styles.articleContent}>{selectedTopic.content}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ========== ADVISOR SCREEN (Coming Soon) ==========
if (screen === 'advisor') {
  return (
    <View style={styles.container}>
      <View style={styles.comingSoonContainer}>
        <Text style={styles.comingSoon}>AI Advisor 🤖</Text>
        <Text style={styles.comingSoonSub}>coming soon!</Text>
      </View>
      <Navigation 
          screen={screen}
          setScreen={setScreen}
          setSelectedFund={setSelectedFund}
          setActiveTool={setActiveTool}
          setSelectedTopic={setSelectedTopic}
        />
    </View>
  );
}

// ========== IMPORT PORTFOLIO (Coming Soon) ==========
return (
  <View style={styles.container}>
    <View style={styles.comingSoonContainer}>
      <Text style={styles.comingSoon}>coming soon! 🚀</Text>
      <Text style={styles.comingSoonSub}>{screen} screen</Text>
    </View>
    <Navigation 
          screen={screen}
          setScreen={setScreen}
          setSelectedFund={setSelectedFund}
          setActiveTool={setActiveTool}
          setSelectedTopic={setSelectedTopic}
        />
  </View>
);
}
