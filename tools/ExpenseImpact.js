import { AlertCircle, ArrowLeft, Search } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { API_ENDPOINTS } from '../config/api';
import { styles } from '../styles/appStyles';

export default function ExpenseImpactCalculator({ setActiveTool, setScreen, selectedFund }) {
  const [fund, setFund] = useState(selectedFund);
  const [fundSearchQuery, setFundSearchQuery] = useState('');
  const [fundSearchResults, setFundSearchResults] = useState([]);
  const [searchingFunds, setSearchingFunds] = useState(false);
  
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('');
  const [investmentType, setInvestmentType] = useState('lumpsum');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);  // NEW: Error state

  const searchFunds = async (query) => {
    if (query.length < 2) {
      setFundSearchResults([]);
      return;
    }

    setSearchingFunds(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.SEARCH}?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setFundSearchResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearchingFunds(false);
    }
  };

  const selectFund = (selectedFundData) => {
    setFund(selectedFundData);
    setFundSearchQuery('');
    setFundSearchResults([]);
    setError(null);  // Clear any previous errors
    setResult(null);  // Clear previous results
  };

  const formatCurrency = (amount) => {
    const num = parseFloat(amount);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const calculateImpact = async () => {
    if (!fund) {
      Alert.alert('No Fund Selected', 'Please select a fund first');
      return;
    }
    
    const investmentAmount = parseFloat(amount);
    const years = parseInt(duration);
    
    if (!investmentAmount || investmentAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive amount');
      return;
    }
    
    if (!years || years <= 0 || years > 50) {
      Alert.alert('Invalid Duration', 'Please enter duration between 1-50 years');
      return;
    }
    
    setLoading(true);
    setError(null);  // Clear previous errors
    setResult(null);  // Clear previous results
    
    try {
      const requestData = {
        scheme_code: fund.code || fund.canonical_code || fund.scheme_code,
        amount: investmentAmount,
        duration_years: years,
        investment_type: investmentType
      };
      
      const response = await fetch(API_ENDPOINTS.EXPENSE_IMPACT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      
      // ✅ Handle both success and error responses
      if (!response.ok) {
        const errorData = await response.json();
        
        // Check if it's the "no expense data" error
        if (errorData.detail && errorData.detail.error === "Expense ratio data not available") {
          setError({
            message: errorData.detail.message,
            suggestion: errorData.detail.suggestion
          });
        } else {
          throw new Error(errorData.detail || 'Calculation failed');
        }
      } else {
        const data = await response.json();
        setResult(data);
      }
      
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', error.message || 'Failed to calculate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.headerPurple, { backgroundColor: '#10B981' }]}>
        <TouchableOpacity onPress={() => setActiveTool(null)}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.sectionHeader}>Expense Impact 💰</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollViewFull}>
        <View style={styles.calculatorContainer}>
          
          {/* Fund Selection */}
          {!fund && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>🔍 Select Fund</Text>
                <View style={styles.searchBox}>
                  <Search size={20} color="#10B981" />
                  <TextInput
                    style={styles.searchInput}
                    value={fundSearchQuery}
                    onChangeText={(text) => {
                      setFundSearchQuery(text);
                      searchFunds(text);
                    }}
                    placeholder="Type fund name..."
                    placeholderTextColor="#6B7280"
                  />
                </View>
              </View>

              {searchingFunds && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#10B981" />
                </View>
              )}

              {fundSearchResults.length > 0 && (
                <View style={styles.resultsContainer}>
                  {fundSearchResults.map((item, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.fundCard}
                      onPress={() => selectFund(item)}
                    >
                      <Text style={styles.fundName}>{item.name}</Text>
                      {item.category && (
                        <Text style={styles.categoryText}>{item.category}</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}

          {/* Selected Fund */}
          {fund && (
            <>
              <View style={styles.resultsCard}>
                <Text style={styles.resultsTitle}>Selected Fund</Text>
                <View style={styles.detailsCard}>
                  <Text style={styles.fundName}>{fund.name || fund.fund_name}</Text>
                  {fund.category && (
                    <View style={styles.fundTags}>
                      <View style={styles.tagBlue}>
                        <Text style={styles.tagText}>{fund.category}</Text>
                      </View>
                    </View>
                  )}
                  <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => setFund(null)}
                  >
                    <Text style={styles.backButtonText}>Change Fund</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Investment Type */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>💼 Investment Type</Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    style={[
                      styles.actionCard,
                      { 
                        flex: 1, 
                        padding: 16,
                        backgroundColor: investmentType === 'lumpsum' ? '#10B981' : 'rgba(16, 185, 129, 0.2)'
                      }
                    ]}
                    onPress={() => setInvestmentType('lumpsum')}
                  >
                    <Text style={[
                      styles.actionTitle,
                      { 
                        textAlign: 'center',
                        color: investmentType === 'lumpsum' ? '#fff' : '#10B981'
                      }
                    ]}>
                      Lumpsum
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.actionCard,
                      { 
                        flex: 1,
                        padding: 16,
                        backgroundColor: investmentType === 'sip' ? '#10B981' : 'rgba(16, 185, 129, 0.2)'
                      }
                    ]}
                    onPress={() => setInvestmentType('sip')}
                  >
                    <Text style={[
                      styles.actionTitle,
                      { 
                        textAlign: 'center',
                        color: investmentType === 'sip' ? '#fff' : '#10B981'
                      }
                    ]}>
                      SIP
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Amount */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  💰 {investmentType === 'lumpsum' ? 'Investment Amount (₹)' : 'Monthly SIP (₹)'}
                </Text>
                <TextInput
                  style={styles.calculatorInput}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  placeholder={investmentType === 'lumpsum' ? 'e.g., 100000' : 'e.g., 5000'}
                  placeholderTextColor="#6B7280"
                />
              </View>

              {/* Duration */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>📅 Duration (Years)</Text>
                <TextInput
                  style={styles.calculatorInput}
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="numeric"
                  placeholder="e.g., 10"
                  placeholderTextColor="#6B7280"
                />
              </View>

              {/* Calculate Button */}
              <TouchableOpacity
                style={styles.calculateButton}
                onPress={calculateImpact}
                disabled={loading}
              >
                <Text style={styles.calculateButtonText}>
                  {loading ? 'Calculating...' : 'Calculate Impact 🚀'}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* ✅ ERROR MESSAGE - No Expense Data */}
          {error && (
            <View style={styles.warningBanner}>
              <AlertCircle size={24} color="#FBBF24" />
              <View style={styles.warningBannerTextContainer}>
                <Text style={styles.warningBannerTitle}>Data Not Available</Text>
                <Text style={styles.warningBannerText}>{error.message}</Text>
                <Text style={styles.warningBannerText}>{error.suggestion}</Text>
              </View>
            </View>
          )}

          {/* Results */}
          {result && (
            <>
              <View style={styles.resultsCard}>
                <Text style={styles.resultsTitle}>Comparison Results 📊</Text>
              </View>
              
              {/* Direct Plan */}
              <View style={[styles.compareSection, { borderLeftColor: '#10B981' }]}>
                <Text style={[styles.compareSectionTitle, { color: '#10B981' }]}>
                  ✅ Direct Plan
                </Text>
                <Text style={styles.inputHint}>
                  Expense Ratio: {result.direct_plan.expense_ratio}%
                </Text>
                
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Final Value</Text>
                  <Text style={[styles.resultValue, { color: '#10B981' }]}>
                    {formatCurrency(result.direct_plan.final_value)}
                  </Text>
                </View>
                
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Returns</Text>
                  <Text style={styles.resultValue}>
                    {formatCurrency(result.direct_plan.returns)}
                  </Text>
                </View>
                
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Effective CAGR</Text>
                  <Text style={styles.resultValue}>
                    {result.direct_plan.effective_cagr}% p.a.
                  </Text>
                </View>
              </View>

              {/* Regular Plan */}
              <View style={[styles.compareSection, { borderLeftColor: '#FB923C' }]}>
                <Text style={[styles.compareSectionTitle, { color: '#FB923C' }]}>
                  ⚠️ Regular Plan
                </Text>
                <Text style={styles.inputHint}>
                  Expense Ratio: {result.regular_plan.expense_ratio}%
                </Text>
                
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Final Value</Text>
                  <Text style={[styles.resultValue, { color: '#FB923C' }]}>
                    {formatCurrency(result.regular_plan.final_value)}
                  </Text>
                </View>
                
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Returns</Text>
                  <Text style={styles.resultValue}>
                    {formatCurrency(result.regular_plan.returns)}
                  </Text>
                </View>
                
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Effective CAGR</Text>
                  <Text style={styles.resultValue}>
                    {result.regular_plan.effective_cagr}% p.a.
                  </Text>
                </View>
              </View>

              {/* Savings */}
              <View style={styles.winnerCard}>
                <Text style={styles.winnerText}>
                  💰 You Save: {formatCurrency(result.savings.amount)}
                </Text>
                <Text style={styles.winnerSubtext}>
                  by choosing Direct Plan!
                </Text>
                <View style={{ height: 8 }} />
                <Text style={styles.insightText}>
                  • Average: {formatCurrency(result.savings.per_year)}/year
                </Text>
                <Text style={styles.insightText}>
                  • {result.savings.percentage.toFixed(2)}% better returns
                </Text>
              </View>

              {/* Verdict */}
              <View style={styles.verdictCard}>
                <Text style={styles.verdictTitle}>💡 Why Direct Plans?</Text>
                <Text style={styles.verdictText}>
                  Direct plans have lower expense ratios because they don't pay distributor commissions.
                </Text>
                <Text style={styles.verdictPro}>
                  ✓ Always choose Direct plans when possible
                </Text>
                <Text style={styles.verdictPro}>
                  ✓ Buy directly from AMC or online platforms
                </Text>
              </View>
            </>
          )}

        </View>
      </ScrollView>
    </View>
  );
}