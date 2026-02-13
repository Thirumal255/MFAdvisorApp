// ============================================================
// 📁 screens/TopFundsScreen.js
// ============================================================
// WHAT THIS FILE DOES:
//   Shows a ranked list of top-performing funds with category
//   filter chips (All, Equity, Debt, Hybrid, Solution Oriented, Other).
//   Supports pull-to-refresh. Tapping a fund navigates to Check Fund.
//
// WHAT IT REPLACES IN App.js:
//   Lines ~835-986 → the `if (screen === 'topFunds')` block.
//   Also the fetchTopFunds, onRefreshTopFunds, getScoreEmoji functions.
//
// HOW TO USE:
//   In App.js:
//     import TopFundsScreen from './screens/TopFundsScreen';
//     if (screen === 'topFunds') {
//       return <TopFundsScreen setScreen={setScreen} setPreviousScreen={setPreviousScreen}
//                setSelectedFund={setSelectedFund} setActiveTool={setActiveTool}
//                setSelectedTopic={setSelectedTopic} screen={screen}
//                getFundDetails={getFundDetails} />;
//     }
// ============================================================

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Navigation } from '../components/Navigation';
import { styles } from '../styles/appStyles';
import { fetchTopFunds as fetchTopFundsAPI } from '../utils/api';
import { getScoreEmoji } from '../utils/formatters';

export default function TopFundsScreen({
  setScreen,
  setPreviousScreen,
  setSelectedFund,
  setActiveTool,
  setSelectedTopic,
  screen,
  onFundPress,   // Function(code) → called when user taps a fund
}) {

  // ── Local state ────────────────────────────────────────────
  const [topFunds, setTopFunds] = useState([]);
  const [topFundsCategory, setTopFundsCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ── Fetch funds on mount and when category changes ─────────
  useEffect(() => {
    loadFunds();
  }, [topFundsCategory]);

  const loadFunds = async () => {
    setLoading(true);
    const results = await fetchTopFundsAPI(topFundsCategory);
    setTopFunds(results);
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFunds();
  };

  // ── Category filter definitions ────────────────────────────
  const categories = [
    { key: null, label: 'All' },
    { key: 'equity', label: 'Equity' },
    { key: 'debt', label: 'Debt' },
    { key: 'hybrid', label: 'Hybrid' },
    { key: 'solution oriented', label: 'Solution Oriented' },
    { key: 'other', label: 'Other' },
  ];

  // ── Loading state ──────────────────────────────────────────
  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#A855F7" />
          <Text style={styles.loadingText}>Loading top funds...</Text>
        </View>
        <Navigation screen={screen} setScreen={setScreen}
          setSelectedFund={setSelectedFund} setActiveTool={setActiveTool}
          setSelectedTopic={setSelectedTopic} />
      </View>
    );
  }

  // ── Main render ────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <View style={styles.headerPurple}>
        <Text style={styles.pageTitle}>🏆 Top Performing Funds</Text>
      </View>

      {/* Category Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={styles.filterScrollContainer}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.key || 'all'}
            style={[styles.filterChip, topFundsCategory === cat.key && styles.filterChipActive]}
            onPress={() => setTopFundsCategory(cat.key)}
          >
            <Text style={[styles.filterText, topFundsCategory === cat.key && styles.filterTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Fund List */}
      <ScrollView style={styles.topFundsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#A855F7" />
        }>
        {topFunds.map((fund, index) => (
          <TouchableOpacity
            key={`top-${fund.code}-${index}`}
            style={styles.topFundCard}
            onPress={() => onFundPress(fund.code)}
          >
            <View style={styles.topFundContent}>
              <Text style={styles.topFundName} numberOfLines={2}>{fund.name}</Text>

              {fund.category && (
                <View style={styles.topFundCategoryRow}>
                  <Text style={styles.topFundCategoryEmoji}>{fund.category_emoji}</Text>
                  <Text style={styles.topFundCategoryText}>{fund.category}</Text>
                </View>
              )}

              {fund.risk && (
                <Text style={styles.topFundRisk} numberOfLines={1}>{fund.risk}</Text>
              )}

              {fund.fund_age != null && (
                <Text style={styles.topFundAge}>{fund.fund_age.toFixed(1)} years old</Text>
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
                  : Math.round(fund.score?.total || fund.composite_score || 0)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Navigation screen={screen} setScreen={setScreen}
        setSelectedFund={setSelectedFund} setActiveTool={setActiveTool}
        setSelectedTopic={setSelectedTopic} />
    </View>
  );
}
