import { ChevronRight } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Navigation } from '../components/Navigation';
import { getTopFunds } from '../services/fundService';
import { styles } from '../styles/appStyles';

export default function TopFundsScreen({ setScreen, setSelectedFund, setActiveTool, setSelectedTopic }) {
  const [topFunds, setTopFunds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState(null);

  useEffect(() => {
    fetchTopFunds();
  }, [category]);

  const fetchTopFunds = async () => {
    try {
      setLoading(true);
      const funds = await getTopFunds(category, 20);
      setTopFunds(funds);
    } catch (error) {
      console.error('Error fetching top funds:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTopFunds();
  };

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

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#A855F7" />
          <Text style={styles.loadingText}>Loading top funds...</Text>
        </View>
        <Navigation 
          screen="topFunds"
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

      {/* Category Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterScrollContainer}
      >
        <TouchableOpacity
          style={[styles.filterChip, !category && styles.filterChipActive]}
          onPress={() => setCategory(null)}
        >
          <Text style={[styles.filterText, !category && styles.filterTextActive]}>All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, category === 'equity' && styles.filterChipActive]}
          onPress={() => setCategory('equity')}
        >
          <Text style={[styles.filterText, category === 'equity' && styles.filterTextActive]}>Equity</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, category === 'debt' && styles.filterChipActive]}
          onPress={() => setCategory('debt')}
        >
          <Text style={[styles.filterText, category === 'debt' && styles.filterTextActive]}>Debt</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, category === 'hybrid' && styles.filterChipActive]}
          onPress={() => setCategory('hybrid')}
        >
          <Text style={[styles.filterText, category === 'hybrid' && styles.filterTextActive]}>Hybrid</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Funds List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#A855F7']} />
        }
      >
        <View style={styles.resultsContainer}>
          {topFunds.map((fund, index) => {
            const score = fund.composite_score || fund.score?.total || 0;
            const scoreColor = getScoreColor(score);
            const scoreEmoji = getScoreEmoji(score);

            return (
              <TouchableOpacity
                key={index}
                style={styles.fundCard}
                onPress={() => {
                  setSelectedFund(fund);
                  setScreen('check');
                }}
              >
                <View style={styles.fundCardContent}>
                  <View style={styles.fundInfo}>
                    <Text style={styles.fundName} numberOfLines={2}>
                      {fund.name || fund.fund_name}
                    </Text>
                    <View style={styles.fundTags}>
                      <View style={styles.tagBlue}>
                        <Text style={styles.tagText}>
                          {fund.category_display || fund.category}
                        </Text>
                      </View>
                      {fund.risk && (
                        <View style={styles.tagRisk}>
                          <Text style={styles.tagText}>{fund.risk}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.fundReturn}>
                    <Text style={[styles.returnValue, { color: scoreColor }]}>
                      {scoreEmoji} {score}
                    </Text>
                    <Text style={styles.returnLabel}>AI Score</Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#7C3AED" />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <Navigation 
        screen="topFunds"
        setScreen={setScreen}
        setSelectedFund={setSelectedFund}
        setActiveTool={setActiveTool}
        setSelectedTopic={setSelectedTopic}
      />
    </View>
  );
}