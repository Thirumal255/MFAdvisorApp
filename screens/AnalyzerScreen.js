import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Search } from 'lucide-react-native';
import { styles } from '../styles/appStyles';
import { Navigation } from '../components/Navigation';
import { getRecommendations } from '../services/comparisonService';
import { searchFunds } from '../services/fundService';

export default function AnalyzerScreen({ 
  setScreen, 
  myFundCode, 
  setMyFundCode, 
  setCompareMode,
  setCompareFund1,
  setCompareFund2,
  setSelectedFund,
  setActiveTool,
  setSelectedTopic
}) {
  const [fundSearchQuery, setFundSearchQuery] = useState('');
  const [fundSearchResults, setFundSearchResults] = useState([]);
  const [myFundData, setMyFundData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
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

  const handleSelectFund = async (fund) => {
    setLoading(true);
    try {
      const data = await getRecommendations(fund.code);
      setMyFundData(data.user_fund);
      setRecommendations(data.recommendations || []);
      setMyFundCode(fund.code);
      setFundSearchQuery('');
      setFundSearchResults([]);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      alert('Could not fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.headerBlue, { backgroundColor: '#059669' }]}>
        <Text style={styles.pageTitle}>My Fund Analyzer 🎯</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search Your Fund</Text>
          <View style={styles.searchBox}>
            <Search size={20} color="#A78BFA" />
            <TextInput
              style={styles.searchInput}
              placeholder="Enter your fund name..."
              placeholderTextColor="#6B7280"
              value={fundSearchQuery}
              onChangeText={handleSearch}
            />
          </View>

          {fundSearchResults.length > 0 && (
            <View style={styles.resultsContainer}>
              {fundSearchResults.map((fund, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.fundCard}
                  onPress={() => handleSelectFund(fund)}
                >
                  <Text style={styles.fundName}>{fund.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#059669" />
            <Text style={styles.loadingText}>Finding better alternatives...</Text>
          </View>
        )}

        {myFundData && recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Better Alternatives</Text>
            {recommendations.map((rec, index) => (
              <View key={index} style={styles.fundCard}>
                <Text style={styles.fundName}>{rec.fund_name}</Text>
                <Text style={styles.verdictPro}>
                  Score: {rec.composite_score} (Improvement: +{rec.score_difference})
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Navigation
        screen="analyzer"
        setScreen={setScreen}
        setSelectedFund={setSelectedFund}
        setActiveTool={setActiveTool}
        setSelectedTopic={setSelectedTopic}
      />
    </View>
  );
}
