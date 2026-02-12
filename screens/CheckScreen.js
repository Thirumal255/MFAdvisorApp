import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Search } from 'lucide-react-native';
import { styles } from '../styles/appStyles';
import { Navigation } from '../components/Navigation';
import { searchFunds, getFundDetails } from '../services/fundService';

export default function CheckScreen({ setScreen, setSelectedFund, setActiveTool, setSelectedTopic, setPreviousScreen }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const data = await searchFunds(query);
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      alert('Could not connect to server!');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFundPress = async (fund) => {
    setLoading(true);
    try {
      const details = await getFundDetails(fund.code);
      setSelectedFund(details);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error loading fund:', error);
      alert('Could not load fund details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerPurple}>
        <Text style={styles.pageTitle}>Search Funds 🔍</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color="#A78BFA" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search mutual funds..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      )}

      {!loading && searchResults.length > 0 && (
        <ScrollView style={styles.scrollView}>
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>
              {searchResults.length} funds found
            </Text>
            {searchResults.map((fund, index) => (
              <TouchableOpacity
                key={index}
                style={styles.fundCard}
                onPress={() => handleFundPress(fund)}
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
                  
                  <View style={styles.fundTags}>
                    {fund.risk && (
                      <View style={styles.tagRisk}>
                        <Text style={styles.tagText}>{fund.risk}</Text>
                      </View>
                    )}
                  </View>
                </View>
                
                {fund.score && (
                  <View style={[
                    styles.scoreBadge,
                    fund.score.has_sufficient_data === false && styles.scoreBadgeInsufficient
                  ]}>
                    <Text style={styles.scoreEmoji}>{fund.score.tier?.emoji || '📊'}</Text>
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
        </ScrollView>
      )}

      {!loading && searchQuery.length >= 2 && searchResults.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No funds found</Text>
          <Text style={styles.emptyStateSubtext}>Try a different search term</Text>
        </View>
      )}

      <Navigation 
        screen="check"
        setScreen={setScreen}
        setSelectedFund={setSelectedFund}
        setActiveTool={setActiveTool}
        setSelectedTopic={setSelectedTopic}
      />
    </View>
  );
}
