import { ArrowLeft, Bell, BookOpen, Brain, Calculator, ChevronRight, Flame, Home, MessageSquare, Search, Trophy, Upload } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { learnContent } from './learnContent';
// ===== IMPORTANT: REPLACE WITH YOUR LAPTOP IP =====
const API_URL = 'http://192.168.1.27:8000';  // ← CHANGE THIS TO YOUR IP!
// ==================================================

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

  // Search for funds
  const searchFunds = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/funds/search?q=${query}`);
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.log('Search error:', error);
      alert('Could not connect to server. Make sure backend is running!');
    } finally {
      setLoading(false);
    }
  };

  // Get fund details
  const getFundDetails = async (code) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/funds/${code}`);
      const data = await response.json();
      setSelectedFund(data);
    } catch (error) {
      console.log('Details error:', error);
      alert('Could not load fund details!');
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
    const response = await fetch(`${API_URL}/api/funds/search?q=${query}`);
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
    const response = await fetch(`${API_URL}/api/funds/${code}`);
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
    const response = await fetch(`${API_URL}/api/funds/search?q=elss`);
    const data = await response.json();
    setElssFunds(data.results || []);
  } catch (error) {
    console.log('Error loading ELSS funds:', error);
  }
};



  // Bottom Navigation
  const NavBar = () => (
    <View style={styles.navbar}>
      {[
        { id: 'home', icon: Home, label: 'Home' },
        { id: 'advisor', icon: Brain, label: 'AI' },
        { id: 'tools', icon: Calculator, label: 'Tools' },
        { id: 'learn', icon: BookOpen, label: 'Learn' }
      ].map((item) => (
        <TouchableOpacity 
          key={item.id} 
          onPress={() => {
            setScreen(item.id);
            setSelectedFund(null);
            setSearchResults([]);
            setSearchQuery('');
          }}
          style={styles.navButton}
        >
          <item.icon 
            size={24} 
            color={screen === item.id ? '#A78BFA' : '#6B7280'} 
          />
          <Text style={[styles.navLabel, { color: screen === item.id ? '#A78BFA' : '#6B7280' }]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

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
              onPress={() => setScreen('check')}
            >
              <View style={styles.actionContent}>
                <View style={styles.actionLeft}>
                  <View style={styles.actionIcon}>
                    <Search size={24} color="#fff" />
                  </View>
                  <View>
                    <Text style={styles.actionTitle}>Check My Fund</Text>
                    <Text style={styles.actionSubtitle}>is it fire? 🔍</Text>
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
        <NavBar />
      </View>
    );
  }

  // ========== CHECK FUND SCREEN ==========
  if (screen === 'check') {
    return (
      <View style={styles.container}>
        <View style={styles.headerPurple}>
          <TouchableOpacity onPress={() => {
            setScreen('home');
            setSelectedFund(null);
            setSearchResults([]);
            setSearchQuery('');
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
              {searchResults.map((fund) => (
                <TouchableOpacity
                  key={fund.code}
                  style={styles.fundCard}
                  onPress={() => getFundDetails(fund.code)}
                >
                  <View style={styles.fundCardContent}>
                    <View style={styles.fundInfo}>
                      <Text style={styles.fundName} numberOfLines={2}>
                        {fund.name}
                      </Text>
                      <View style={styles.fundTags}>
                        {fund.type && (
                          <View style={styles.tagBlue}>
                            <Text style={styles.tagText}>{fund.type}</Text>
                          </View>
                        )}
                        {fund.risk && (
                          <View style={styles.tagRisk}>
                            <Text style={styles.tagText}>{fund.risk}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <View style={styles.fundReturn}>
                      <Text style={styles.returnValue}>
                        {fund.cagr > 0 ? '+' : ''}{fund.cagr}%
                      </Text>
                      <Text style={styles.returnLabel}>CAGR</Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color="#6B7280" />
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

      {/* Investment Objective */}
      {selectedFund.objective && (
        <View style={styles.objectiveCard}>
          <Text style={styles.objectiveTitle}>🎯 Investment Objective</Text>
          <Text style={styles.objectiveText}>{selectedFund.objective}</Text>
        </View>
      )}

      {/* Asset Allocation */}
      {selectedFund.asset_allocation && (
        <View style={styles.objectiveCard}>
          <Text style={styles.objectiveTitle}>💼 Asset Allocation</Text>
          <Text style={styles.objectiveText}>
            {typeof selectedFund.asset_allocation === 'string' 
              ? selectedFund.asset_allocation 
              : JSON.stringify(selectedFund.asset_allocation)}
          </Text>
        </View>
      )}

      {/* Expense Ratio */}
      {selectedFund.expense && (
        <View style={styles.expenseCard}>
          <Text style={styles.expenseTitle}>💰 Expense Ratio</Text>
          <View style={styles.expenseRow}>
            {selectedFund.expense.Direct && (
              <View style={styles.expenseItem}>
                <Text style={styles.expenseLabel}>Direct</Text>
                <Text style={styles.expenseValue}>{selectedFund.expense.Direct}%</Text>
              </View>
            )}
            {selectedFund.expense.Regular && (
              <View style={styles.expenseItem}>
                <Text style={styles.expenseLabel}>Regular</Text>
                <Text style={styles.expenseValue}>{selectedFund.expense.Regular}%</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Performance Metrics */}
      <Text style={styles.sectionHeader}>📊 Performance Metrics</Text>
      <View style={styles.metricsGrid}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>CAGR</Text>
          <Text style={styles.metricValue}>
            {selectedFund.metrics.cagr ? 
              `${(selectedFund.metrics.cagr * 100).toFixed(2)}%` : 
              'N/A'}
          </Text>
        </View>
        
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>1Y Return</Text>
          <Text style={styles.metricValue}>
            {selectedFund.metrics.return_1y ? 
              `${(selectedFund.metrics.return_1y * 100).toFixed(1)}%` : 
              'N/A'}
          </Text>
        </View>
        
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>3Y Return</Text>
          <Text style={styles.metricValue}>
            {selectedFund.metrics.return_3y ? 
              `${(selectedFund.metrics.return_3y * 100).toFixed(1)}%` : 
              'N/A'}
          </Text>
        </View>
        
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>5Y Return</Text>
          <Text style={styles.metricValue}>
            {selectedFund.metrics.return_5y ? 
              `${(selectedFund.metrics.return_5y * 100).toFixed(1)}%` : 
              'N/A'}
          </Text>
        </View>
      </View>

      {/* Risk Metrics */}
      <Text style={styles.sectionHeader}>⚠️ Risk Metrics</Text>
      <View style={styles.metricsGrid}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Volatility</Text>
          <Text style={[styles.metricValue, styles.metricWarning]}>
            {selectedFund.metrics.volatility ? 
              `${(selectedFund.metrics.volatility * 100).toFixed(2)}%` : 
              'N/A'}
          </Text>
        </View>
        
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Sharpe Ratio</Text>
          <Text style={styles.metricValue}>
            {selectedFund.metrics.sharpe ? 
              selectedFund.metrics.sharpe.toFixed(2) : 
              'N/A'}
          </Text>
        </View>
        
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Sortino Ratio</Text>
          <Text style={styles.metricValue}>
            {selectedFund.metrics.sortino ? 
              selectedFund.metrics.sortino.toFixed(2) : 
              'N/A'}
          </Text>
        </View>
        
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Max Drawdown</Text>
          <Text style={[styles.metricValue, styles.metricDanger]}>
            {selectedFund.metrics.max_drawdown ? 
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
      {selectedFund.managers && selectedFund.managers.length > 0 && (
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
              {selectedFund.managers.map((manager, index) => (
                <View key={index} style={styles.managerItem}>
                  {/* Handle both string and object formats */}
                  {typeof manager === 'string' ? (
                    <Text style={styles.managerName}>{manager}</Text>
                  ) : (
                    <>
                      <Text style={styles.managerName}>
                        {manager.name || 'Name not available'}
                      </Text>
                      {manager.type && (
                        <Text style={styles.managerType}>
                          Role: {manager.type}
                        </Text>
                      )}
                      {manager.from_date && (
                        <Text style={styles.managerDate}>
                          Since: {manager.from_date}
                        </Text>
                      )}
                    </>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Exit Load */}
      <View style={styles.exitLoadCard}>
        <Text style={styles.exitLoadTitle}>🚪 Exit Load</Text>
        <Text style={styles.exitLoadText}>
          {selectedFund.exit_load && selectedFund.exit_load !== 'null' && selectedFund.exit_load !== '' 
            ? selectedFund.exit_load 
            : 'No Exit Load ✅'}
        </Text>
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
                <View key={index} style={styles.variantItem}>
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
          <Text style={styles.verdictText}>
            {selectedFund.ai_verdict.verdict}
          </Text>
          
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
          
          <Text style={styles.verdictSubtitle}>✅ Pros:</Text>
          {selectedFund.ai_verdict.pros.map((pro, i) => (
            <Text key={i} style={styles.verdictPro}>• {pro}</Text>
          ))}
          
          <Text style={styles.verdictSubtitle}>⚠️ Watch Out:</Text>
          {selectedFund.ai_verdict.cons.map((con, i) => (
            <Text key={i} style={styles.verdictCon}>• {con}</Text>
          ))}
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
        <NavBar />
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
      <NavBar />
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
      <NavBar />
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
      <NavBar />
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
    <NavBar />
  </View>
);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F' },
  scrollView: { flex: 1, marginBottom: 80 },
  scrollViewFull: { flex: 1 },  // No bottom margin
  
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60 },
  greeting: { color: '#A78BFA', fontSize: 14, fontWeight: '700' },
  userName: { color: '#fff', fontSize: 30, fontWeight: '900' },
  notificationButton: { width: 44, height: 44, backgroundColor: '#7C3AED', borderRadius: 16, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  notificationDot: { position: 'absolute', top: -4, right: -4, width: 12, height: 12, backgroundColor: '#FBBF24', borderRadius: 6 },
  
  // Streak Card
  streakCard: { margin: 20, backgroundColor: 'rgba(124, 58, 237, 0.2)', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(124, 58, 237, 0.3)' },
  streakHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  streakTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  streakText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  
  // Sections
  section: { padding: 20, paddingTop: 0 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 16 },
  
  // Action Cards
  actionCard: { borderRadius: 24, padding: 24, marginBottom: 12 },
  purpleGradient: { backgroundColor: '#7C3AED' },
  blueGradient: { backgroundColor: '#2563EB' },
  orangeGradient: { backgroundColor: '#EA580C' },
  actionContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actionIcon: { width: 48, height: 48, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  actionTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  actionSubtitle: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 12 },
  
  // Market Cards
  marketGrid: { flexDirection: 'row', gap: 12 },
  marketCard: { flex: 1, borderRadius: 16, padding: 16, borderWidth: 1 },
  greenCard: { backgroundColor: 'rgba(34, 197, 94, 0.2)', borderColor: 'rgba(34, 197, 94, 0.3)' },
  blueCard: { backgroundColor: 'rgba(59, 130, 246, 0.2)', borderColor: 'rgba(59, 130, 246, 0.3)' },
  marketLabel: { color: '#A78BFA', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  marketValue: { color: '#fff', fontSize: 24, fontWeight: '900' },
  marketChange: { color: '#22C55E', fontSize: 12, fontWeight: '700' },
  
  // Check Screen Header
  headerPurple: { backgroundColor: '#7C3AED', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  pageTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
  
  // Search
  searchContainer: { padding: 20 },
  searchBox: { backgroundColor: 'rgba(124, 58, 237, 0.2)', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: 'rgba(124, 58, 237, 0.3)' },
  searchInput: { flex: 1, color: '#fff', fontSize: 16 },
  
  // Loading
  loadingContainer: { alignItems: 'center', padding: 40 },
  loadingText: { color: '#A78BFA', marginTop: 12, fontSize: 14, fontWeight: '700' },
  
  // Results
  resultsContainer: { padding: 20, paddingTop: 0 },
  resultsTitle: { color: '#A78BFA', fontSize: 14, fontWeight: '700', marginBottom: 12 },
  
  // Fund Card
  fundCard: { backgroundColor: 'rgba(26, 26, 26, 0.8)', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(124, 58, 237, 0.3)', flexDirection: 'row', alignItems: 'center', gap: 12 },
  fundCardContent: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fundInfo: { flex: 1 },
  fundName: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  fundTags: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  tagBlue: { backgroundColor: 'rgba(59, 130, 246, 0.3)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  tagRisk: { backgroundColor: 'rgba(251, 146, 60, 0.3)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  tagText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  fundReturn: { alignItems: 'flex-end', marginLeft: 12 },
  returnValue: { color: '#22C55E', fontSize: 20, fontWeight: '900' },
  returnLabel: { color: '#6B7280', fontSize: 10, fontWeight: '700' },
  
  // Details
  detailsContainer: { padding: 20 },
  detailsCard: { backgroundColor: 'rgba(26, 26, 26, 0.8)', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(124, 58, 237, 0.3)' },
  detailsName: { color: '#fff', fontSize: 20, fontWeight: '900', marginBottom: 12 },
  detailsTags: { flexDirection: 'row', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  
  // Metrics
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  metricBox: { backgroundColor: 'rgba(124, 58, 237, 0.2)', borderRadius: 12, padding: 12, flex: 1, minWidth: '45%' },
  metricLabel: { color: '#A78BFA', fontSize: 12, fontWeight: '700' },
  metricValue: { color: '#22C55E', fontSize: 20, fontWeight: '900', marginTop: 4 },
  
  // Verdict
  verdictCard: { backgroundColor: 'rgba(124, 58, 237, 0.15)', borderRadius: 16, padding: 16, marginBottom: 20 },
  verdictTitle: { color: '#A78BFA', fontSize: 14, fontWeight: '700', marginBottom: 8 },
  verdictText: { color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 16 },
  verdictSubtitle: { color: '#A78BFA', fontSize: 12, fontWeight: '700', marginTop: 12, marginBottom: 8 },
  verdictPro: { color: '#22C55E', fontSize: 14, marginBottom: 4 },
  verdictCon: { color: '#FB923C', fontSize: 14, marginBottom: 4 },
  
  // Back Button
  backButton: { backgroundColor: 'rgba(124, 58, 237, 0.3)', borderRadius: 12, padding: 16, alignItems: 'center' },
  backButtonText: { color: '#A78BFA', fontSize: 16, fontWeight: '700' },
  
  // Empty State
  emptyState: { alignItems: 'center', padding: 60 },
  emptyText: { color: '#fff', fontSize: 20, fontWeight: '900', marginBottom: 8 },
  emptySubtext: { color: '#6B7280', fontSize: 14 },
  
  // Nav Bar
  navbar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: 'rgba(0, 0, 0, 0.9)', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(124, 58, 237, 0.3)', paddingBottom: 20 },
  navButton: { alignItems: 'center', gap: 4 },
  navLabel: { fontSize: 10, fontWeight: '700' },
  
  // Coming Soon
  comingSoonContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 80 },
  comingSoon: { color: '#fff', fontSize: 24, fontWeight: '900' },
  comingSoonSub: { color: '#6B7280', fontSize: 16, marginTop: 8 },


// Info Row
codeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
codeLabel: { color: '#6B7280', fontSize: 12, fontWeight: '700' },
codeValue: { color: '#A78BFA', fontSize: 12, fontWeight: '700', fontFamily: 'monospace' },

infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(124, 58, 237, 0.2)' },
infoLabel: { color: '#A78BFA', fontSize: 14, fontWeight: '700' },
infoValue: { color: '#fff', fontSize: 14, fontWeight: '600' },

// Objective Card
objectiveCard: { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: 12, padding: 16, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#3B82F6' },
objectiveTitle: { color: '#3B82F6', fontSize: 14, fontWeight: '900', marginBottom: 8 },
objectiveText: { color: '#E5E7EB', fontSize: 13, lineHeight: 20 },

// Expense Card
expenseCard: { backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: 12, padding: 16, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#22C55E' },
expenseTitle: { color: '#22C55E', fontSize: 14, fontWeight: '900', marginBottom: 12 },
expenseRow: { flexDirection: 'row', gap: 12 },
expenseItem: { flex: 1, backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: 8, padding: 12, alignItems: 'center' },
expenseLabel: { color: '#6B7280', fontSize: 11, fontWeight: '700', marginBottom: 4 },
expenseValue: { color: '#22C55E', fontSize: 18, fontWeight: '900' },

// Section Headers
sectionHeader: { color: '#fff', fontSize: 16, fontWeight: '900', marginTop: 20, marginBottom: 12 },

// Metric Variants
metricWarning: { color: '#FB923C' },
metricDanger: { color: '#EF4444' },
metricDisabled: { opacity: 0.4 },
metricPlaceholder: { color: '#6B7280', fontSize: 14, marginTop: 4, fontStyle: 'italic' },

// Variants Card
variantsCard: { backgroundColor: 'rgba(124, 58, 237, 0.1)', borderRadius: 12, marginBottom: 16, overflow: 'hidden' },
variantsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
variantsTitle: { color: '#A78BFA', fontSize: 14, fontWeight: '900' },
variantsToggle: { color: '#A78BFA', fontSize: 16, fontWeight: '900' },
variantsList: { paddingHorizontal: 16, paddingBottom: 16 },
variantItem: { backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: 8, padding: 12, marginBottom: 8 },
variantName: { color: '#fff', fontSize: 13, fontWeight: '600', marginBottom: 4 },
variantCode: { color: '#6B7280', fontSize: 11, fontFamily: 'monospace' },

// Score Bar
scoreBar: { marginVertical: 12 },
scoreBarBg: { height: 8, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 4, overflow: 'hidden' },
scoreBarFill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 4 },
scoreText: { color: '#A78BFA', fontSize: 12, fontWeight: '700', marginTop: 8, textAlign: 'center' },


// Fund Managers
managersCard: { 
  backgroundColor: 'rgba(168, 85, 247, 0.1)', 
  borderRadius: 12, 
  marginBottom: 16, 
  overflow: 'hidden',
  borderLeftWidth: 4,
  borderLeftColor: '#A855F7'
},
managersHeader: { 
  flexDirection: 'row', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  padding: 16 
},
managersTitle: { 
  color: '#A855F7', 
  fontSize: 14, 
  fontWeight: '900' 
},
managersToggle: { 
  color: '#A855F7', 
  fontSize: 16, 
  fontWeight: '900' 
},
managersList: { 
  paddingHorizontal: 16, 
  paddingBottom: 16 
},
managerItem: { 
  backgroundColor: 'rgba(0, 0, 0, 0.3)', 
  borderRadius: 8, 
  padding: 12, 
  marginBottom: 8 
},
managerName: { 
  color: '#fff', 
  fontSize: 15, 
  fontWeight: '700', 
  marginBottom: 4 
},
managerType: { 
  color: '#A855F7', 
  fontSize: 12, 
  fontWeight: '600', 
  marginBottom: 2 
},
managerDate: { 
  color: '#6B7280', 
  fontSize: 11 
},

// Exit Load
exitLoadCard: { 
  backgroundColor: 'rgba(236, 72, 153, 0.1)', 
  borderRadius: 12, 
  padding: 16, 
  marginBottom: 16,
  borderLeftWidth: 4,
  borderLeftColor: '#EC4899'
},
exitLoadTitle: { 
  color: '#EC4899', 
  fontSize: 14, 
  fontWeight: '900', 
  marginBottom: 8 
},
exitLoadText: { 
  color: '#E5E7EB', 
  fontSize: 13, 
  lineHeight: 20 
},

// Tools Screen
headerOrange: { 
  backgroundColor: '#F97316', 
  paddingTop: 60, 
  paddingBottom: 20, 
  paddingHorizontal: 20, 
  flexDirection: 'row', 
  alignItems: 'center', 
  justifyContent: 'space-between', 
  borderBottomLeftRadius: 24, 
  borderBottomRightRadius: 24 
},
headerBlue: { 
  backgroundColor: '#3B82F6', 
  paddingTop: 60, 
  paddingBottom: 20, 
  paddingHorizontal: 20, 
  flexDirection: 'row', 
  alignItems: 'center', 
  justifyContent: 'space-between', 
  borderBottomLeftRadius: 24, 
  borderBottomRightRadius: 24 
},
toolsContainer: { 
  padding: 20 
},
toolCard: { 
  backgroundColor: 'rgba(26, 26, 26, 0.8)', 
  borderRadius: 16, 
  padding: 16, 
  marginBottom: 12, 
  borderWidth: 1, 
  borderColor: 'rgba(255, 255, 255, 0.1)', 
  borderLeftWidth: 4, 
  flexDirection: 'row', 
  alignItems: 'center', 
  justifyContent: 'space-between' 
},
toolContent: { 
  flexDirection: 'row', 
  alignItems: 'center', 
  gap: 16, 
  flex: 1 
},
toolIcon: { 
  width: 56, 
  height: 56, 
  borderRadius: 16, 
  alignItems: 'center', 
  justifyContent: 'center' 
},
toolEmoji: { 
  fontSize: 28 
},
toolInfo: { 
  flex: 1 
},
toolTitle: { 
  color: '#fff', 
  fontSize: 16, 
  fontWeight: '900', 
  marginBottom: 4 
},
toolSubtitle: { 
  color: '#9CA3AF', 
  fontSize: 12 
},
disclaimer: { 
  margin: 20, 
  marginTop: 0, 
  padding: 16, 
  backgroundColor: 'rgba(251, 191, 36, 0.1)', 
  borderRadius: 12, 
  borderLeftWidth: 4, 
  borderLeftColor: '#FBBF24' 
},
disclaimerText: { 
  color: '#FCD34D', 
  fontSize: 12, 
  lineHeight: 18 
},

// Calculator
calculatorContainer: { 
  padding: 20 
},
inputGroup: { 
  marginBottom: 24 
},
inputLabel: { 
  color: '#E5E7EB', 
  fontSize: 14, 
  fontWeight: '700', 
  marginBottom: 8 
},
calculatorInput: { 
  backgroundColor: 'rgba(59, 130, 246, 0.1)', 
  borderWidth: 1, 
  borderColor: 'rgba(59, 130, 246, 0.3)', 
  borderRadius: 12, 
  padding: 16, 
  color: '#fff', 
  fontSize: 16, 
  fontWeight: '600' 
},
inputHint: { 
  color: '#6B7280', 
  fontSize: 11, 
  marginTop: 6, 
  fontStyle: 'italic' 
},
calculateButton: { 
  backgroundColor: '#3B82F6', 
  borderRadius: 16, 
  padding: 18, 
  alignItems: 'center', 
  marginTop: 8, 
  marginBottom: 24 
},
calculateButtonText: { 
  color: '#fff', 
  fontSize: 18, 
  fontWeight: '900' 
},

// Results
resultsCard: { 
  backgroundColor: 'rgba(16, 185, 129, 0.1)', 
  borderRadius: 16, 
  padding: 20, 
  borderWidth: 1, 
  borderColor: 'rgba(16, 185, 129, 0.3)' 
},
resultsTitle: { 
  color: '#10B981', 
  fontSize: 18, 
  fontWeight: '900', 
  marginBottom: 20, 
  textAlign: 'center' 
},
resultRow: { 
  flexDirection: 'row', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  paddingVertical: 12, 
  borderBottomWidth: 1, 
  borderBottomColor: 'rgba(255, 255, 255, 0.1)' 
},
resultRowTotal: { 
  borderBottomWidth: 0, 
  marginTop: 8, 
  paddingTop: 16, 
  borderTopWidth: 2, 
  borderTopColor: '#10B981' 
},
resultLabel: { 
  color: '#9CA3AF', 
  fontSize: 14, 
  fontWeight: '600' 
},
resultValue: { 
  color: '#fff', 
  fontSize: 18, 
  fontWeight: '900' 
},
resultGain: { 
  color: '#10B981' 
},
resultLabelTotal: { 
  color: '#10B981', 
  fontSize: 16, 
  fontWeight: '900' 
},
resultValueTotal: { 
  color: '#10B981', 
  fontSize: 24, 
  fontWeight: '900' 
},

// Visual Bar
visualBar: { 
  marginTop: 20, 
  marginBottom: 16 
},
visualBarSection: { 
  marginBottom: 12 
},
visualBarFill: { 
  height: 32, 
  borderRadius: 8, 
  justifyContent: 'center', 
  paddingHorizontal: 12, 
  marginBottom: 4 
},
visualBarLabel: { 
  color: '#E5E7EB', 
  fontSize: 12, 
  fontWeight: '700' 
},

// Insight
insightCard: { 
  backgroundColor: 'rgba(59, 130, 246, 0.1)', 
  borderRadius: 12, 
  padding: 16, 
  marginTop: 16 
},
insightText: { 
  color: '#E5E7EB', 
  fontSize: 13, 
  lineHeight: 20 
},

// Add these to your existing styles object:

// Comparison Sections
compareSection: { 
  backgroundColor: 'rgba(59, 130, 246, 0.1)', 
  borderRadius: 12, 
  padding: 16, 
  marginBottom: 16,
  borderLeftWidth: 4,
  borderLeftColor: '#3B82F6'
},
compareSectionTitle: { 
  color: '#3B82F6', 
  fontSize: 16, 
  fontWeight: '900', 
  marginBottom: 12 
},

// Winner Card
winnerCard: { 
  backgroundColor: 'rgba(251, 191, 36, 0.2)', 
  borderRadius: 12, 
  padding: 16, 
  marginTop: 16,
  alignItems: 'center',
  borderWidth: 2,
  borderColor: '#FBBF24'
},
winnerText: { 
  color: '#FBBF24', 
  fontSize: 20, 
  fontWeight: '900', 
  marginBottom: 8 
},
winnerSubtext: { 
  color: '#FCD34D', 
  fontSize: 13, 
  textAlign: 'center' 
},

// Fund Compare Styles
searchResultsBox: { 
  backgroundColor: 'rgba(26, 26, 26, 0.8)', 
  borderRadius: 12, 
  marginBottom: 16,
  maxHeight: 250,
  borderWidth: 1,
  borderColor: 'rgba(236, 72, 153, 0.3)'
},
searchResultItem: { 
  padding: 16, 
  borderBottomWidth: 1, 
  borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center'
},
searchResultName: { 
  color: '#fff', 
  fontSize: 14, 
  fontWeight: '600',
  flex: 1,
  marginRight: 12
},
searchResultCagr: { 
  color: '#10B981', 
  fontSize: 14, 
  fontWeight: '900' 
},

// Selected Funds
selectedFundsContainer: { 
  marginBottom: 24 
},
selectedFundCard: { 
  backgroundColor: 'rgba(236, 72, 153, 0.2)', 
  borderRadius: 12, 
  padding: 16, 
  marginBottom: 8,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderWidth: 1,
  borderColor: 'rgba(236, 72, 153, 0.4)'
},
selectedFundInfo: { 
  flex: 1, 
  marginRight: 12 
},
selectedFundName: { 
  color: '#fff', 
  fontSize: 14, 
  fontWeight: '700', 
  marginBottom: 4 
},
selectedFundCagr: { 
  color: '#EC4899', 
  fontSize: 12, 
  fontWeight: '600' 
},
removeFundButton: { 
  color: '#EF4444', 
  fontSize: 24, 
  fontWeight: '900',
  width: 32,
  height: 32,
  textAlign: 'center'
},

// Comparison Table
comparisonTable: { 
  backgroundColor: 'rgba(236, 72, 153, 0.1)', 
  borderRadius: 16, 
  padding: 16,
  marginTop: 16,
  borderWidth: 1,
  borderColor: 'rgba(236, 72, 153, 0.3)'
},
comparisonRow: { 
  flexDirection: 'row', 
  paddingVertical: 12, 
  borderBottomWidth: 1, 
  borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  alignItems: 'center'
},
comparisonLabel: { 
  color: '#EC4899', 
  fontSize: 13, 
  fontWeight: '700',
  width: 80
},
comparisonValue: { 
  color: '#fff', 
  fontSize: 13, 
  fontWeight: '600',
  flex: 1,
  textAlign: 'center'
},
comparisonVerdict: { 
  color: '#10B981', 
  fontSize: 11, 
  fontWeight: '600',
  flex: 1,
  textAlign: 'center'
},

// Risk Analyzer Styles
quizTitle: { 
  color: '#F59E0B', 
  fontSize: 18, 
  fontWeight: '900', 
  marginBottom: 20,
  textAlign: 'center'
},
questionCard: { 
  backgroundColor: 'rgba(245, 158, 11, 0.1)', 
  borderRadius: 12, 
  padding: 16, 
  marginBottom: 16,
  borderLeftWidth: 4,
  borderLeftColor: '#F59E0B'
},
questionText: { 
  color: '#fff', 
  fontSize: 14, 
  fontWeight: '700', 
  marginBottom: 12 
},
optionButton: { 
  backgroundColor: 'rgba(26, 26, 26, 0.8)', 
  borderRadius: 8, 
  padding: 12, 
  marginBottom: 8,
  borderWidth: 1,
  borderColor: 'rgba(245, 158, 11, 0.3)'
},
optionSelected: { 
  backgroundColor: 'rgba(245, 158, 11, 0.3)',
  borderColor: '#F59E0B',
  borderWidth: 2
},
optionText: { 
  color: '#9CA3AF', 
  fontSize: 13, 
  fontWeight: '600' 
},
optionTextSelected: { 
  color: '#FBBF24', 
  fontWeight: '900' 
},

// Risk Profile Result
riskProfileCard: { 
  backgroundColor: 'rgba(245, 158, 11, 0.2)', 
  borderRadius: 16, 
  padding: 20, 
  alignItems: 'center',
  marginBottom: 16,
  borderWidth: 2,
  borderColor: '#F59E0B'
},
riskProfileName: { 
  color: '#FBBF24', 
  fontSize: 28, 
  fontWeight: '900', 
  marginBottom: 8 
},
riskProfileScore: { 
  color: '#FCD34D', 
  fontSize: 14, 
  fontWeight: '700' 
},
riskDescription: { 
  color: '#E5E7EB', 
  fontSize: 14, 
  lineHeight: 22, 
  marginBottom: 20,
  textAlign: 'center'
},

// Tax Optimizer - ELSS Funds
elssFundCard: { 
  backgroundColor: 'rgba(239, 68, 68, 0.1)', 
  borderRadius: 12, 
  padding: 16, 
  marginBottom: 12,
  borderLeftWidth: 4,
  borderLeftColor: '#EF4444'
},
elssFundName: { 
  color: '#fff', 
  fontSize: 14, 
  fontWeight: '700', 
  marginBottom: 8 
},
elssFundMeta: { 
  flexDirection: 'row', 
  gap: 16 
},
elssFundMetaItem: { 
  flex: 1 
},
elssFundLabel: { 
  color: '#9CA3AF', 
  fontSize: 11, 
  fontWeight: '600', 
  marginBottom: 4 
},
elssFundValue: { 
  color: '#10B981', 
  fontSize: 14, 
  fontWeight: '900' 
},

// Enhanced Comparison Table
comparisonTableWide: { 
  backgroundColor: 'rgba(236, 72, 153, 0.1)', 
  borderRadius: 16, 
  padding: 16,
  marginTop: 16,
  borderWidth: 1,
  borderColor: 'rgba(236, 72, 153, 0.3)',
  minWidth: '100%'
},

// Header Row
comparisonHeaderRow: { 
  flexDirection: 'row', 
  paddingBottom: 16, 
  borderBottomWidth: 2, 
  borderBottomColor: '#EC4899',
  marginBottom: 8
},
comparisonMetricColumn: { 
  width: 120, 
  justifyContent: 'center',
  paddingRight: 12
},
comparisonFundColumn: { 
  width: 140, 
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 8
},
comparisonHeaderLabel: { 
  color: '#EC4899', 
  fontSize: 14, 
  fontWeight: '900'
},
comparisonFundHeader: { 
  color: '#fff', 
  fontSize: 12, 
  fontWeight: '900',
  textAlign: 'center',
  lineHeight: 16
},

// Data Rows
comparisonDataRow: { 
  flexDirection: 'row', 
  paddingVertical: 12, 
  borderBottomWidth: 1, 
  borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  minHeight: 50,
  alignItems: 'center'
},
highlightRow: {
  backgroundColor: 'rgba(236, 72, 153, 0.05)'
},
comparisonMetricName: { 
  color: '#EC4899', 
  fontSize: 13, 
  fontWeight: '700'
},
comparisonValueText: { 
  color: '#fff', 
  fontSize: 13, 
  fontWeight: '600',
  textAlign: 'center'
},
comparisonSubValue: {
  color: '#9CA3AF',
  fontSize: 11,
  fontWeight: '600',
  textAlign: 'center',
  marginTop: 2
},

// Value Colors
comparisonGreen: { 
  color: '#10B981' 
},
comparisonOrange: { 
  color: '#F59E0B' 
},
comparisonGray: { 
  color: '#6B7280',
  fontStyle: 'italic'
},
comparisonWinner: { 
  fontWeight: '900',
  fontSize: 15
},

// Risk Badge
riskBadge: {
  borderRadius: 8,
  paddingVertical: 4,
  paddingHorizontal: 8,
  alignSelf: 'center'
},

// Verdict Text
comparisonVerdictText: { 
  color: '#FBBF24', 
  fontSize: 12, 
  fontWeight: '700',
  textAlign: 'center',
  lineHeight: 16
},

// Learn Section Styles
tabContainer: { 
  flexDirection: 'row', 
  padding: 16, 
  gap: 8,
  backgroundColor: '#0F0F0F'
},
tabButton: { 
  flex: 1, 
  paddingVertical: 12, 
  paddingHorizontal: 16, 
  borderRadius: 12, 
  backgroundColor: 'rgba(139, 92, 246, 0.1)',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: 'rgba(139, 92, 246, 0.3)'
},
tabButtonActive: { 
  backgroundColor: '#8B5CF6',
  borderColor: '#8B5CF6'
},
tabText: { 
  color: '#9CA3AF', 
  fontSize: 13, 
  fontWeight: '700' 
},
tabTextActive: { 
  color: '#fff', 
  fontWeight: '900' 
},

// Learn Container
learnContainer: { 
  padding: 20 
},
learnSectionTitle: { 
  color: '#8B5CF6', 
  fontSize: 18, 
  fontWeight: '900', 
  marginBottom: 16 
},

// Topic Cards
topicCard: { 
  backgroundColor: 'rgba(139, 92, 246, 0.1)', 
  borderRadius: 16, 
  padding: 16, 
  marginBottom: 12,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderWidth: 1,
  borderColor: 'rgba(139, 92, 246, 0.3)',
  borderLeftWidth: 4,
  borderLeftColor: '#8B5CF6'
},
topicContent: { 
  flexDirection: 'row', 
  alignItems: 'center', 
  gap: 16, 
  flex: 1 
},
topicIcon: { 
  fontSize: 32 
},
topicInfo: { 
  flex: 1 
},
topicTitle: { 
  color: '#fff', 
  fontSize: 16, 
  fontWeight: '900', 
  marginBottom: 4 
},
topicSubtitle: { 
  color: '#A78BFA', 
  fontSize: 12, 
  fontWeight: '600' 
},

// Tip Cards
tipCard: { 
  backgroundColor: 'rgba(251, 191, 36, 0.1)', 
  borderRadius: 12, 
  padding: 16, 
  marginBottom: 12,
  borderLeftWidth: 4,
  borderLeftColor: '#FBBF24'
},
tipNumber: { 
  color: '#FBBF24', 
  fontSize: 12, 
  fontWeight: '900', 
  marginBottom: 8 
},
tipText: { 
  color: '#E5E7EB', 
  fontSize: 14, 
  lineHeight: 22 
},

// Glossary Cards
glossaryCard: { 
  backgroundColor: 'rgba(59, 130, 246, 0.1)', 
  borderRadius: 12, 
  padding: 16, 
  marginBottom: 12,
  borderLeftWidth: 4,
  borderLeftColor: '#3B82F6'
},
glossaryTerm: { 
  color: '#3B82F6', 
  fontSize: 16, 
  fontWeight: '900', 
  marginBottom: 6 
},
glossaryDefinition: { 
  color: '#E5E7EB', 
  fontSize: 13, 
  lineHeight: 20 
},

// Article View
articleContainer: { 
  padding: 20 
},
articleTitle: { 
  color: '#fff', 
  fontSize: 28, 
  fontWeight: '900', 
  marginBottom: 8 
},
articleSubtitle: { 
  color: '#8B5CF6', 
  fontSize: 16, 
  fontWeight: '700', 
  marginBottom: 24 
},
articleContent: { 
  color: '#E5E7EB', 
  fontSize: 15, 
  lineHeight: 26,
  letterSpacing: 0.2
},

});