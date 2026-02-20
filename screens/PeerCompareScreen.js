/**
 * ============================================================
 * PEER COMPARISON SCREEN - Fixed to Match Backend Response
 * ============================================================
 * FILE: screens/PeerCompareScreen.js
 * 
 * Backend Response Structure:
 * {
 *   fund_name, category, main_category,
 *   category_count,      // ← maps to peers_count
 *   overall_percentile,  // ← maps to percentile
 *   overall_label,
 *   metrics: {           // ← object, not array
 *     cagr_1y: { label, fund_value, category_avg, percentile, is_better, ... }
 *   }
 * }
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { API_ENDPOINTS } from '../config/api';

// ============================================================
// COMPARISON BAR COMPONENT
// ============================================================
const ComparisonBar = ({ metric }) => {
  const maxVal = Math.max(
    Math.abs(metric.fund_value || 0),
    Math.abs(metric.category_avg || 0),
    Math.abs(metric.category_max || 1)
  ) * 1.2;
  
  const fundWidth = maxVal > 0 ? Math.min(100, (Math.abs(metric.fund_value || 0) / maxVal) * 100) : 0;
  const avgWidth = maxVal > 0 ? Math.min(100, (Math.abs(metric.category_avg || 0) / maxVal) * 100) : 0;
  
  const barColor = metric.is_better ? '#10B981' : '#EF4444';
  
  const formatValue = (val) => {
    if (val == null) return 'N/A';
    // Check if it's a ratio (small number) or percentage
    if (metric.label?.toLowerCase().includes('ratio')) {
      return val.toFixed(2);
    }
    return val.toFixed(1) + '%';
  };
  
  return (
    <View style={styles.metricContainer}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricLabel}>{metric.label}</Text>
        <View style={[styles.betterBadge, { backgroundColor: metric.is_better ? '#10B98130' : '#EF444430' }]}>
          <Text style={[styles.betterText, { color: metric.is_better ? '#10B981' : '#EF4444' }]}>
            {metric.is_better ? '✓ Better' : '✗ Below'}
          </Text>
        </View>
      </View>
      
      <View style={styles.barRow}>
        <Text style={styles.barLabel}>Fund</Text>
        <View style={styles.barContainer}>
          <View style={[styles.bar, { width: `${fundWidth}%`, backgroundColor: barColor }]} />
        </View>
        <Text style={styles.barValue}>{formatValue(metric.fund_value)}</Text>
      </View>
      
      <View style={styles.barRow}>
        <Text style={styles.barLabel}>Avg</Text>
        <View style={styles.barContainer}>
          <View style={[styles.bar, { width: `${avgWidth}%`, backgroundColor: '#6B7280' }]} />
        </View>
        <Text style={styles.barValue}>{formatValue(metric.category_avg)}</Text>
      </View>
      
      <Text style={styles.percentileText}>
        {metric.percentile_label || `Top ${100 - (metric.percentile || 50)}%`}
      </Text>
    </View>
  );
};

// ============================================================
// MAIN SCREEN
// ============================================================
export default function PeerCompareScreen({ route, navigation, fundCode: propFundCode, setScreen, previousScreen }) {
  // Support both navigation params and direct props
  const fundCode = route?.params?.fundCode || propFundCode;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  
  const fetchPeerComparison = async () => {
    if (!fundCode) {
      setError('No fund code provided');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Fetching peer comparison for:', fundCode);
      const response = await fetch(`${API_ENDPOINTS.PEER_COMPARISON}/${fundCode}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }
      
      const result = await response.json();
      console.log('📊 Peer comparison response:', result);
      setData(result);
    } catch (err) {
      console.error('Peer compare error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPeerComparison();
  }, [fundCode]);
  
  // Handle back navigation
  const handleBack = () => {
    if (navigation?.goBack) {
      navigation.goBack();
    } else if (setScreen && previousScreen) {
      setScreen(previousScreen);
    } else if (setScreen) {
      setScreen('check');
    }
  };
  
  // Transform metrics object to array for rendering
  const getComparisonsArray = () => {
    if (!data?.metrics) return [];
    
    return Object.entries(data.metrics).map(([key, metric]) => ({
      key,
      ...metric
    }));
  };
  
  // Calculate rank from percentile
  const getRank = () => {
    if (!data?.overall_percentile || !data?.category_count) return '?';
    const rank = Math.max(1, Math.round((100 - data.overall_percentile) / 100 * data.category_count));
    return rank;
  };
  
  // Loading State
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Peer Comparison</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#A78BFA" />
          <Text style={styles.loadingText}>Analyzing peers...</Text>
        </View>
      </View>
    );
  }
  
  // Error State
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Peer Comparison</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={styles.errorTitle}>Could not load comparison</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchPeerComparison}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  const comparisons = getComparisonsArray();
  const peersCount = data?.category_count || 0;
  const percentile = data?.overall_percentile || 50;
  const rank = getRank();
  
  // Success State
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Peer Comparison</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Fund Info Card */}
        <View style={styles.fundCard}>
          <Text style={styles.fundName} numberOfLines={2}>
            {data?.fund_name || 'Unknown Fund'}
          </Text>
          <Text style={styles.categoryText}>
            {data?.category || 'Unknown Category'} • {peersCount} peers
          </Text>
        </View>
        
        {/* Overall Rank Card */}
        <View style={styles.rankCard}>
          <View style={styles.rankHeader}>
            <Text style={styles.rankLabel}>Category Rank</Text>
            <View style={[
              styles.rankBadge,
              { backgroundColor: percentile >= 70 ? '#10B981' : percentile >= 40 ? '#F59E0B' : '#EF4444' }
            ]}>
              <Text style={styles.rankEmoji}>
                {percentile >= 70 ? '🏆' : percentile >= 40 ? '👍' : '📈'}
              </Text>
            </View>
          </View>
          <Text style={styles.rankValue}>
            #{rank} of {peersCount}
          </Text>
          <Text style={styles.rankPercentile}>
            {data?.overall_label || `Top ${100 - percentile}% in category`}
          </Text>
        </View>
        
        {/* Metrics Comparison */}
        <Text style={styles.sectionTitle}>📊 Metric Comparison</Text>
        
        {comparisons.length > 0 ? (
          comparisons.map((metric, index) => (
            <ComparisonBar key={metric.key || index} metric={metric} />
          ))
        ) : (
          <View style={styles.noDataCard}>
            <Text style={styles.noDataText}>No comparison data available</Text>
            <Text style={styles.noDataHint}>This fund may not have enough metrics calculated yet</Text>
          </View>
        )}
        
        {/* Risk Level */}
        {data?.riskometer && (
          <View style={styles.riskCard}>
            <Text style={styles.riskLabel}>Risk Level</Text>
            <Text style={styles.riskValue}>{data.riskometer}</Text>
          </View>
        )}
        
        <View style={{ height: 100 }} />
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9CA3AF',
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#A78BFA',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  fundCard: {
    backgroundColor: '#1A1A24',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A3C',
  },
  fundName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  rankCard: {
    backgroundColor: '#1A1A24',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A3C',
    alignItems: 'center',
  },
  rankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rankLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginRight: 8,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankEmoji: {
    fontSize: 16,
  },
  rankValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  rankPercentile: {
    fontSize: 14,
    color: '#A78BFA',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    marginTop: 8,
  },
  metricContainer: {
    backgroundColor: '#1A1A24',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A3C',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  betterBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  betterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  barLabel: {
    width: 40,
    fontSize: 12,
    color: '#9CA3AF',
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#2A2A3C',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  barValue: {
    width: 60,
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'right',
  },
  percentileText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 4,
  },
  noDataCard: {
    backgroundColor: '#1A1A24',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A3C',
  },
  noDataText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  noDataHint: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  riskCard: {
    backgroundColor: '#1A1A24',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A3C',
  },
  riskLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  riskValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
});
