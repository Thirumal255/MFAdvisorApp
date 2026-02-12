import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ArrowLeft, Search, X } from 'lucide-react-native';
import { styles } from '../styles/appStyles';
import { Navigation } from '../components/Navigation';
import { searchFunds, getFundDetails } from '../services/fundService';
import { formatPercentage } from '../utils/formatters';

export default function FundCompare({ setActiveTool, setScreen, setSelectedFund, setSelectedTopic }) {
  const [fundSearchQuery, setFundSearchQuery] = useState('');
  const [fundSearchResults, setFundSearchResults] = useState([]);
  const [selectedFunds, setSelectedFunds] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query) => {
    setFundSearchQuery(query);
    if (query.length < 2) {
      setFundSearchResults([]);
      return;
    }

    try {
      const data = await searchFunds(query);
      setFundSearchResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const addFund = async (fundCode) => {
    if (selectedFunds.length >= 3) {
      alert('You can compare maximum 3 funds!');
      return;
    }

    setLoading(true);
    try {
      const fundData = await getFundDetails(fundCode);
      setSelectedFunds([...selectedFunds, fundData]);
      setFundSearchQuery('');
      setFundSearchResults([]);
    } catch (error) {
      console.error('Error loading fund:', error);
      alert('Could not load fund details');
    } finally {
      setLoading(false);
    }
  };

  const removeFund = (index) => {
    setSelectedFunds(selectedFunds.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      <View style={[styles.headerBlue, { backgroundColor: '#EC4899' }]}>
        <TouchableOpacity onPress={() => setActiveTool(null)}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Fund Compare ⚖️</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search Funds (Select up to 3)</Text>

          {/* Search Box */}
          <View style={styles.searchBox}>
            <Search size={20} color="#EC4899" />
            <TextInput
              style={styles.searchInput}
              placeholder="Type fund name..."
              placeholderTextColor="#6B7280"
              value={fundSearchQuery}
              onChangeText={handleSearch}
            />
          </View>

          {/* Search Results */}
          {fundSearchResults.length > 0 && (
            <View style={styles.resultsContainer}>
              {fundSearchResults.map((fund, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.fundCard}
                  onPress={() => addFund(fund.code)}
                >
                  <Text style={styles.fundName}>{fund.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#EC4899" />
            </View>
          )}
        </View>

        {/* Selected Funds */}
        {selectedFunds.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Selected Funds ({selectedFunds.length}/3)
            </Text>

            {selectedFunds.map((fund, index) => (
              <View key={index} style={styles.selectedFundCard}>
                <View style={styles.selectedFundInfo}>
                  <Text style={styles.selectedFundName}>{fund.name || fund.fund_name}</Text>
                  {fund.category && (
                    <Text style={styles.selectedFundCategory}>{fund.category}</Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => removeFund(index)}>
                  <X size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Comparison Table */}
        {selectedFunds.length >= 2 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Comparison</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.comparisonTable}>
                {/* Header Row */}
                <View style={styles.comparisonHeaderRow}>
                  <View style={styles.comparisonMetricCell}>
                    <Text style={styles.comparisonHeaderText}>Metric</Text>
                  </View>
                  {selectedFunds.map((fund, index) => (
                    <View key={index} style={styles.comparisonFundCell}>
                      <Text style={styles.comparisonFundName} numberOfLines={2}>
                        {fund.name || fund.fund_name}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* CAGR Row */}
                <View style={styles.comparisonRow}>
                  <View style={styles.comparisonMetricCell}>
                    <Text style={styles.comparisonMetricText}>3Y CAGR</Text>
                  </View>
                  {selectedFunds.map((fund, index) => (
                    <View key={index} style={styles.comparisonValueCell}>
                      <Text style={styles.comparisonValueText}>
                        {fund.metrics?.cagr ? formatPercentage(fund.metrics.cagr) : 'N/A'}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Risk Row */}
                <View style={styles.comparisonRow}>
                  <View style={styles.comparisonMetricCell}>
                    <Text style={styles.comparisonMetricText}>Risk</Text>
                  </View>
                  {selectedFunds.map((fund, index) => (
                    <View key={index} style={styles.comparisonValueCell}>
                      <Text style={styles.comparisonValueText}>
                        {fund.risk || 'N/A'}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Expense Ratio Row */}
                <View style={styles.comparisonRow}>
                  <View style={styles.comparisonMetricCell}>
                    <Text style={styles.comparisonMetricText}>Expense Ratio</Text>
                  </View>
                  {selectedFunds.map((fund, index) => (
                    <View key={index} style={styles.comparisonValueCell}>
                      <Text style={styles.comparisonValueText}>
                        {fund.expense ? `${fund.expense}%` : 'N/A'}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Volatility Row */}
                {selectedFunds.some(f => f.metrics?.volatility) && (
                  <View style={styles.comparisonRow}>
                    <View style={styles.comparisonMetricCell}>
                      <Text style={styles.comparisonMetricText}>Volatility</Text>
                    </View>
                    {selectedFunds.map((fund, index) => (
                      <View key={index} style={styles.comparisonValueCell}>
                        <Text style={styles.comparisonValueText}>
                          {fund.metrics?.volatility ? formatPercentage(fund.metrics.volatility) : 'N/A'}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Score Row */}
                {selectedFunds.some(f => f.score) && (
                  <View style={styles.comparisonRow}>
                    <View style={styles.comparisonMetricCell}>
                      <Text style={styles.comparisonMetricText}>AI Score</Text>
                    </View>
                    {selectedFunds.map((fund, index) => (
                      <View key={index} style={styles.comparisonValueCell}>
                        <Text style={[styles.comparisonValueText, { color: '#22C55E' }]}>
                          {fund.score?.total ? Math.round(fund.score.total) : 'N/A'}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        )}
      </ScrollView>

      <Navigation
        screen="tools"
        setScreen={setScreen}
        setSelectedFund={setSelectedFund}
        setActiveTool={setActiveTool}
        setSelectedTopic={setSelectedTopic}
      />
    </View>
  );
}
