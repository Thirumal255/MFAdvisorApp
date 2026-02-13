import { ArrowLeft, Search } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Navigation } from './components/Navigation';
import { API_ENDPOINTS } from './config/api';
import CompareScreen from './screens/CompareScreen';
import HomeScreen from './screens/HomeScreen';
import LearnScreen from './screens/LearnScreen';
import TopFundsScreen from './screens/TopFundsScreen';
import { styles } from './styles/appStyles';
import ExpenseImpact from './tools/ExpenseImpact';
import FundCompare from './tools/FundCompare';
import GoalPlanner from './tools/GoalPlanner';
import ReturnsCalculator from './tools/ReturnsCalculator';
import RiskAnalyzer from './tools/RiskAnalyzer';
import SIPCalculator from './tools/SIPCalculator';
import TaxOptimizer from './tools/TaxOptimizer';
import ToolsScreen from './tools/ToolsScreen';



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
  
  const [selectedTopic, setSelectedTopic] = useState(null);
// PHASE 5: My Fund Analyzer states
  const [myFundCode, setMyFundCode] = useState(null);
  const [myFundData, setMyFundData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [compareMode, setCompareMode] = useState(false);
  const [compareFund1, setCompareFund1] = useState(null);
  const [compareFund2, setCompareFund2] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [previousScreen, setPreviousScreen] = useState('home');  

 
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



// ── Helper functions (still needed by CheckFund & MyFundAnalyzer screens) ──
// These will move to utils/formatters.js when those screens are modularized

// Format Date to DD-MM-YYYY
const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Format currency with Cr/L shortcuts
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

// Format metric names for display
const formatMetricName = (metric) => {
  const names = {
    'cagr': 'CAGR', 'rolling_1y': '1Y Rolling Return', 'rolling_3y': '3Y Rolling Return',
    'rolling_5y': '5Y Rolling Return', 'volatility': 'Volatility', 'max_drawdown': 'Max Drawdown',
    'downside_deviation': 'Downside Deviation', 'sharpe': 'Sharpe Ratio', 'sortino': 'Sortino Ratio',
    'consistency_score': 'Consistency Score', 'positive_months_pct': 'Positive Months %',
    'current_drawdown_pct': 'Current Drawdown', 'alpha': 'Alpha',
    'information_ratio': 'Information Ratio', 'calmar_ratio': 'Calmar Ratio'
  };
  return names[metric] || metric.replace(/_/g, ' ').toUpperCase();
};

// Format metric values for display
const formatMetricValue = (metric, value) => {
  if (value == null) return 'N/A';
  if (['cagr', 'rolling_1y', 'rolling_3y', 'rolling_5y', 'volatility',
       'downside_deviation', 'max_drawdown', 'current_drawdown_pct',
       'positive_months_pct'].includes(metric)) {
    return `${(value * 100).toFixed(2)}%`;
  }
  if (['sharpe', 'sortino', 'alpha', 'information_ratio', 'calmar_ratio'].includes(metric)) {
    return value.toFixed(2);
  }
  if (['consistency_score'].includes(metric)) {
    return value.toFixed(1);
  }
  return value.toFixed(2);
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



// Top funds fetching is now handled inside TopFundsScreen.js

  



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



  




  // Navigation imported from components/Navigation.js


  // ========== HOME SCREEN ==========
  if (screen === 'home') {
  return (
    <HomeScreen
      setScreen={setScreen}
      setPreviousScreen={setPreviousScreen}
      setSelectedFund={setSelectedFund}
      setActiveTool={setActiveTool}
      setSelectedTopic={setSelectedTopic}
      screen={screen}
    />
  );
}

 // ========== TOP FUNDS SCREEN (NEW) ==========
  if (screen === 'topFunds') {
  return (
    <TopFundsScreen
      setScreen={setScreen}
      setPreviousScreen={setPreviousScreen}
      setSelectedFund={setSelectedFund}
      setActiveTool={setActiveTool}
      setSelectedTopic={setSelectedTopic}
      screen={screen}
      onFundPress={(code) => {
        setPreviousScreen('topFunds');
        setScreen('check');
        getFundDetails(code);     // ← Uses your existing App.js function
      }}
    />
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
    <ToolsScreen
      setActiveTool={setActiveTool}
      screen={screen}
      setScreen={setScreen}
      setSelectedFund={setSelectedFund}
      setSelectedTopic={setSelectedTopic}
    />
  );
}

// ========== SIP CALCULATOR SCREEN ==========
if (screen === 'tools' && activeTool === 'sip') {
  return <SIPCalculator setActiveTool={setActiveTool} />;
}

// ========== GOAL PLANNER SCREEN ==========
if (screen === 'tools' && activeTool === 'goal') {
  return <GoalPlanner setActiveTool={setActiveTool} />;
}

// ========== LUMPSUM VS SIP SCREEN ==========
if (screen === 'tools' && activeTool === 'returns') {
  return <ReturnsCalculator setActiveTool={setActiveTool} />;
}

// ========== FUND COMPARE SCREEN ==========
if (screen === 'tools' && activeTool === 'compare') {
  return <FundCompare setActiveTool={setActiveTool} />;
}

// ========== RISK ANALYZER SCREEN ==========
if (screen === 'tools' && activeTool === 'risk') {
  return <RiskAnalyzer setActiveTool={setActiveTool} />;
}

// ========== TAX OPTIMIZER SCREEN ==========
if (screen === 'tools' && activeTool === 'tax') {
  return <TaxOptimizer setActiveTool={setActiveTool} />;
}

// ========== EXPENSE IMPACT CALCULATOR ==========
if (screen === 'tools' && activeTool === 'expense') {
  return <ExpenseImpact setActiveTool={setActiveTool} setScreen={setScreen} selectedFund={selectedFund} />;
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
  return (
    <CompareScreen
      comparisonData={comparisonData}
      setCompareMode={setCompareMode}
      setComparisonData={setComparisonData}
      setScreen={setScreen}
    />
  );
}


// ========== LEARN SECTION - MAIN SCREEN ==========
if (screen === 'learn') {
  return (
    <LearnScreen
      screen={screen}
      setScreen={setScreen}
      setSelectedFund={setSelectedFund}
      setActiveTool={setActiveTool}
      setSelectedTopic={setSelectedTopic}
    />
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
