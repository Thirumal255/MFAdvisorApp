/**
 * ============================================================
 * PORTFOLIO OVERLAP ANALYSIS SCREEN
 * ============================================================
 * FILE: screens/OverlapScreen.js
 * 
 * Works with App.js navigation pattern:
 * navigation={{ goBack: () => setScreen(...) }}
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { ArrowLeft, Search, X, Plus, Layers, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { API_ENDPOINTS } from '../config/api';

// ============================================================
// FUND SEARCH COMPONENT
// ============================================================
const FundSearch = ({ onSelectFund, selectedFunds }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const searchFunds = async (q) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    
    setSearching(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.SEARCH_FUNDS}?q=${encodeURIComponent(q)}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        const selectedCodes = selectedFunds.map(f => f.code);
        const filtered = (data.funds || data.results || []).filter(
          f => !selectedCodes.includes(f.scheme_code || f.code)
        );
        setResults(filtered);
      }
    } catch (err) {
      console.log('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Search size={18} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search funds to compare..."
          placeholderTextColor="#6B7280"
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            searchFunds(text);
          }}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }}>
            <X size={18} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>
      
      {searching && (
        <View style={styles.searchingContainer}>
          <ActivityIndicator size="small" color="#A78BFA" />
        </View>
      )}
      
      {results.length > 0 && (
        <View style={styles.resultsContainer}>
          {results.slice(0, 5).map((fund, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.resultItem}
              onPress={() => {
                onSelectFund({
                  code: fund.scheme_code || fund.code,
                  name: fund.fund_name || fund.name,
                  category: fund.category
                });
                setQuery('');
                setResults([]);
              }}
            >
              <View style={styles.resultInfo}>
                <Text style={styles.resultName} numberOfLines={1}>{fund.fund_name || fund.name}</Text>
                <Text style={styles.resultCategory}>{fund.category}</Text>
              </View>
              <Plus size={18} color="#A78BFA" />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// ============================================================
// SELECTED FUND CHIP
// ============================================================
const FundChip = ({ fund, onRemove }) => (
  <View style={styles.fundChip}>
    <View style={styles.fundChipInfo}>
      <Text style={styles.fundChipName} numberOfLines={1}>{fund.name}</Text>
      <Text style={styles.fundChipCategory}>{fund.category}</Text>
    </View>
    <TouchableOpacity onPress={onRemove} style={styles.fundChipRemove}>
      <X size={16} color="#EF4444" />
    </TouchableOpacity>
  </View>
);

// ============================================================
// OVERLAP RESULT CARD
// ============================================================
const OverlapCard = ({ pair }) => {
  const level = pair.overlap_percentage > 50 ? 'high' : pair.overlap_percentage > 25 ? 'moderate' : 'low';
  const colors = {
    high: { bg: '#EF444420', border: '#EF4444', text: '#EF4444' },
    moderate: { bg: '#F59E0B20', border: '#F59E0B', text: '#F59E0B' },
    low: { bg: '#10B98120', border: '#10B981', text: '#10B981' }
  };
  const style = colors[level];

  return (
    <View style={[styles.overlapCard, { backgroundColor: style.bg, borderColor: style.border }]}>
      <View style={styles.overlapHeader}>
        <Layers size={20} color={style.text} />
        <Text style={[styles.overlapPercentage, { color: style.text }]}>
          {pair.overlap_percentage}% Overlap
        </Text>
      </View>
      
      <Text style={styles.overlapFund1} numberOfLines={1}>{pair.fund1_name}</Text>
      <Text style={styles.overlapVs}>vs</Text>
      <Text style={styles.overlapFund2} numberOfLines={1}>{pair.fund2_name}</Text>
      
      <View style={styles.overlapStats}>
        <Text style={styles.overlapStatText}>
          {pair.common_stocks} common stocks
        </Text>
      </View>
      
      {pair.common_stock_names && pair.common_stock_names.length > 0 && (
        <View style={styles.commonStocks}>
          <Text style={styles.commonStocksLabel}>Top common holdings:</Text>
          <Text style={styles.commonStocksList}>
            {pair.common_stock_names.slice(0, 5).join(', ')}
            {pair.common_stock_names.length > 5 && ` +${pair.common_stock_names.length - 5} more`}
          </Text>
        </View>
      )}
    </View>
  );
};

// ============================================================
// MAIN SCREEN COMPONENT
// ============================================================
export default function OverlapScreen({ navigation }) {
  const [selectedFunds, setSelectedFunds] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const addFund = (fund) => {
    if (selectedFunds.length >= 5) {
      setError('Maximum 5 funds allowed');
      return;
    }
    if (selectedFunds.find(f => f.code === fund.code)) {
      setError('Fund already added');
      return;
    }
    setSelectedFunds(prev => [...prev, fund]);
    setError(null);
  };

  const removeFund = (code) => {
    setSelectedFunds(prev => prev.filter(f => f.code !== code));
    setResult(null);
  };

  const analyzeOverlap = async () => {
    if (selectedFunds.length < 2) {
      setError('Select at least 2 funds');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.OVERLAP_ANALYSIS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fund_codes: selectedFunds.map(f => String(f.code))
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Analysis failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  // Handle back - uses navigation.goBack from App.js
  const handleBack = () => {
    if (result) {
      setResult(null);
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Portfolio Overlap</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Layers size={24} color="#A78BFA" />
          <Text style={styles.infoText}>
            Check how much your funds overlap in holdings. High overlap means less diversification.
          </Text>
        </View>

        {/* Search */}
        <Text style={styles.sectionTitle}>Select Funds (2-5)</Text>
        <FundSearch onSelectFund={addFund} selectedFunds={selectedFunds} />

        {/* Selected Funds */}
        {selectedFunds.length > 0 && (
          <View style={styles.selectedFunds}>
            {selectedFunds.map((fund) => (
              <FundChip 
                key={fund.code} 
                fund={fund} 
                onRemove={() => removeFund(fund.code)} 
              />
            ))}
          </View>
        )}

        {/* Error */}
        {error && (
          <View style={styles.errorBox}>
            <AlertTriangle size={16} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Analyze Button */}
        <TouchableOpacity
          style={[
            styles.analyzeButton,
            (selectedFunds.length < 2 || analyzing) && styles.analyzeButtonDisabled
          ]}
          onPress={analyzeOverlap}
          disabled={selectedFunds.length < 2 || analyzing}
        >
          {analyzing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Layers size={20} color="#FFFFFF" />
              <Text style={styles.analyzeButtonText}>Analyze Overlap</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Results */}
        {result && (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>📊 Analysis Results</Text>
            
            {/* Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Diversification Score</Text>
                <Text style={[
                  styles.summaryValue,
                  { color: result.diversification_score > 70 ? '#10B981' : result.diversification_score > 40 ? '#F59E0B' : '#EF4444' }
                ]}>
                  {result.diversification_score}%
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Average Overlap</Text>
                <Text style={styles.summaryValue}>{result.average_overlap}%</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Unique Stocks</Text>
                <Text style={styles.summaryValue}>{result.unique_stocks_count}</Text>
              </View>
              
              {/* Risk Level */}
              <View style={[
                styles.riskBadge,
                { 
                  backgroundColor: result.risk_level?.includes('High') ? '#EF444420' : 
                                  result.risk_level?.includes('Moderate') ? '#F59E0B20' : '#10B98120'
                }
              ]}>
                {result.risk_level?.includes('High') ? (
                  <AlertTriangle size={16} color="#EF4444" />
                ) : (
                  <CheckCircle size={16} color="#10B981" />
                )}
                <Text style={[
                  styles.riskText,
                  { 
                    color: result.risk_level?.includes('High') ? '#EF4444' : 
                           result.risk_level?.includes('Moderate') ? '#F59E0B' : '#10B981'
                  }
                ]}>
                  {result.risk_level}
                </Text>
              </View>
              
              {result.recommendation && (
                <Text style={styles.recommendation}>{result.recommendation}</Text>
              )}
            </View>

            {/* Overlap Matrix */}
            {result.overlap_matrix && result.overlap_matrix.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>📈 Pair-wise Overlap</Text>
                {result.overlap_matrix.map((pair, idx) => (
                  <OverlapCard key={idx} pair={pair} />
                ))}
              </>
            )}

            {/* Common to All */}
            {result.common_to_all && result.common_to_all.length > 0 && (
              <View style={styles.commonAllCard}>
                <Text style={styles.commonAllTitle}>
                  🎯 Stocks in ALL selected funds ({result.common_to_all.length})
                </Text>
                <Text style={styles.commonAllList}>
                  {result.common_to_all.slice(0, 10).join(', ')}
                  {result.common_to_all.length > 10 && ` +${result.common_to_all.length - 10} more`}
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F14',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#1A1A24',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A3C',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#A78BFA15',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    marginTop: 8,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A24',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#2A2A3C',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    color: '#FFFFFF',
    fontSize: 15,
  },
  searchingContainer: {
    padding: 12,
    alignItems: 'center',
  },
  resultsContainer: {
    backgroundColor: '#1A1A24',
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#2A2A3C',
    overflow: 'hidden',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A3C',
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  resultCategory: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  selectedFunds: {
    marginBottom: 16,
  },
  fundChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A24',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#A78BFA40',
  },
  fundChipInfo: {
    flex: 1,
  },
  fundChipName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  fundChipCategory: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  fundChipRemove: {
    padding: 4,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF444420',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    marginLeft: 8,
    fontSize: 14,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A78BFA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  analyzeButtonDisabled: {
    backgroundColor: '#6B7280',
    opacity: 0.5,
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  resultsSection: {
    marginTop: 8,
  },
  summaryCard: {
    backgroundColor: '#1A1A24',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2A2A3C',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  riskText: {
    fontWeight: '600',
    marginLeft: 8,
  },
  recommendation: {
    color: '#9CA3AF',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  overlapCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  overlapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  overlapPercentage: {
    fontWeight: '700',
    fontSize: 18,
    marginLeft: 8,
  },
  overlapFund1: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  overlapVs: {
    color: '#6B7280',
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 4,
  },
  overlapFund2: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  overlapStats: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2A3C',
  },
  overlapStatText: {
    color: '#9CA3AF',
    fontSize: 13,
  },
  commonStocks: {
    marginTop: 8,
  },
  commonStocksLabel: {
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 4,
  },
  commonStocksList: {
    color: '#D1D5DB',
    fontSize: 12,
  },
  commonAllCard: {
    backgroundColor: '#10B98115',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#10B98140',
  },
  commonAllTitle: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  commonAllList: {
    color: '#D1D5DB',
    fontSize: 13,
    lineHeight: 20,
  },
});
