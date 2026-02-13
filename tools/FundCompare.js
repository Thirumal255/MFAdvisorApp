// ============================================================
// 📁 tools/FundCompare.js
// ============================================================
// WHAT THIS FILE DOES:
//   Side-by-side fund comparison tool.
//   User searches & selects up to 3 funds, then sees a comparison
//   table with CAGR, Sharpe, Sortino, Volatility, Returns, etc.
//   🏆 emoji marks the winner in each metric row.
//
// WHAT IT REPLACES IN App.js:
//   Lines ~2686-3085 → the `if (screen === 'tools' && activeTool === 'compare')` block.
//   Also the searchFundsForCompare and addFundToCompare functions.
//
// HOW TO USE:
//   In App.js:
//     import FundCompare from './tools/FundCompare';
//     if (screen === 'tools' && activeTool === 'compare') {
//       return <FundCompare setActiveTool={setActiveTool} />;
//     }
// ============================================================

import { ArrowLeft, Search } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { API_ENDPOINTS } from '../config/api';
import { styles } from '../styles/appStyles';

export default function FundCompare({ setActiveTool }) {

  // ── Local state ────────────────────────────────────────────
  const [selectedFunds, setSelectedFunds] = useState([]);          // Array of fund detail objects
  const [fundSearchQuery, setFundSearchQuery] = useState('');       // Search text
  const [fundSearchResults, setFundSearchResults] = useState([]);   // Search results from API

  // ── Search for funds (API call) ────────────────────────────
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

  // ── Add a fund to comparison (fetch full details) ──────────
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

  // ── Remove a fund from the selection ───────────────────────
  const removeFund = (index) => {
    setSelectedFunds(selectedFunds.filter((_, i) => i !== index));
  };

  // ── Handle Back ────────────────────────────────────────────
  const handleBack = () => {
    setActiveTool(null);
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <View style={[styles.headerBlue, { backgroundColor: '#EC4899' }]}>
        <TouchableOpacity onPress={handleBack}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Fund Compare ⚖️</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollViewFull}>
        <View style={styles.calculatorContainer}>

          {/* ── Search Bar ── */}
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

          {/* ── Search Results Dropdown ── */}
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

          {/* ── Selected Funds Pills ── */}
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
                  <TouchableOpacity onPress={() => removeFund(index)}>
                    <Text style={styles.removeFundButton}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* ── Comparison Table (shows when 2+ funds selected) ── */}
          {selectedFunds.length >= 2 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View style={styles.comparisonTableWide}>
                <Text style={styles.resultsTitle}>Side-by-Side Comparison 📊</Text>

                {/* Header Row */}
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

                {/* Risk Level Row */}
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

                {/* CAGR Row (highlighted) */}
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
                          {cagr.toFixed(2)}%{isMax && ' 🏆'}
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
                          {vol ? `${vol.toFixed(2)}%` : 'N/A'}{isMin && vol && ' 🏆'}
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
                          {sharpe ? sharpe.toFixed(2) : 'N/A'}{isMax && sharpe && ' 🏆'}
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
                          {sortino ? sortino.toFixed(2) : 'N/A'}{isMax && sortino && ' 🏆'}
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
                          {ret ? `${ret.toFixed(1)}%` : 'N/A'}{isMax && ret && ' 🏆'}
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
                          {ret ? `${ret.toFixed(1)}%` : 'N/A'}{isMax && ret && ' 🏆'}
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
                          {ret ? `${ret.toFixed(1)}%` : 'N/A'}{isMax && ret && ' 🏆'}
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

          {/* Empty state prompt */}
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
