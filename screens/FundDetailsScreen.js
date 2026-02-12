import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { styles } from '../styles/appStyles';
import { formatPercentage } from '../utils/formatters';

export default function FundDetailsScreen({ fund, setScreen, setSelectedFund }) {
  const [metricsTab, setMetricsTab] = useState('returns');
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);

  if (!fund) {
    return (
      <View style={styles.container}>
        <Text>No fund selected</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerPurple}>
        <TouchableOpacity onPress={() => setSelectedFund(null)}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.pageTitle} numberOfLines={1}>
          {fund.name || fund.fund_name}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.detailsContainer}>
          <View style={styles.detailsCard}>
            {/* Fund Name */}
            <Text style={styles.detailsName}>{fund.name || fund.fund_name}</Text>

            {/* Category Banner */}
            {fund.category && (
              <View style={styles.categoryBanner}>
                <Text style={styles.categoryBannerEmoji}>{fund.category_emoji}</Text>
                <View style={styles.categoryBannerTextContainer}>
                  <Text style={styles.categoryBannerText}>{fund.category}</Text>
                  <Text style={styles.categoryBannerSubtext}>
                    {fund.sub_category || fund.main_category}
                  </Text>
                </View>
              </View>
            )}

            {/* Score Section */}
            {fund.score && (
              <View style={styles.scoreSection}>
                {fund.score.has_sufficient_data === false ? (
                  <View style={styles.insufficientDataBanner}>
                    <Text style={styles.insufficientDataEmoji}>📊</Text>
                    <View style={styles.insufficientDataTextContainer}>
                      <Text style={styles.insufficientDataTitle}>Not Enough Data</Text>
                      <Text style={styles.insufficientDataReason}>
                        {fund.score.reliability_reason || 'Insufficient historical data'}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.scoreCard}>
                    <View style={styles.scoreHeader}>
                      <View>
                        <Text style={styles.scoreLabel}>Fund Score</Text>
                        <Text style={styles.scoreCategory}>
                          {fund.score.category || 'Unknown'} Fund
                        </Text>
                      </View>
                      <View style={styles.scoreDisplay}>
                        <Text style={styles.scoreLarge}>
                          {Math.round(fund.score.total)}
                        </Text>
                        <Text style={styles.scoreOutOf}>/100</Text>
                      </View>
                    </View>
                    
                    {fund.score.tier && (
                      <View style={styles.scoreTier}>
                        <Text style={styles.scoreTierEmoji}>
                          {fund.score.tier.emoji || '📊'}
                        </Text>
                        <Text style={styles.scoreTierLabel}>
                          {fund.score.tier.label || 'Unknown'}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* Metrics Tabs */}
            <View style={styles.metricsTabContainer}>
              <TouchableOpacity
                style={[styles.metricsTab, metricsTab === 'returns' && styles.metricsTabActive]}
                onPress={() => setMetricsTab('returns')}
              >
                <Text style={[styles.metricsTabText, metricsTab === 'returns' && styles.metricsTabTextActive]}>
                  Returns
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.metricsTab, metricsTab === 'risk' && styles.metricsTabActive]}
                onPress={() => setMetricsTab('risk')}
              >
                <Text style={[styles.metricsTabText, metricsTab === 'risk' && styles.metricsTabTextActive]}>
                  Risk
                </Text>
              </TouchableOpacity>
            </View>

            {/* Metrics Display */}
            {fund.metrics && (
              <View style={styles.metricsGrid}>
                {metricsTab === 'returns' && (
                  <>
                    <View style={styles.metricBox}>
                      <Text style={styles.metricLabel}>CAGR</Text>
                      <Text style={styles.metricValue}>
                        {fund.metrics.cagr ? formatPercentage(fund.metrics.cagr) : 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.metricBox}>
                      <Text style={styles.metricLabel}>1Y Rolling</Text>
                      <Text style={styles.metricValue}>
                        {fund.metrics.rolling_1y ? formatPercentage(fund.metrics.rolling_1y) : 'N/A'}
                      </Text>
                    </View>
                  </>
                )}
                {metricsTab === 'risk' && (
                  <>
                    <View style={styles.metricBox}>
                      <Text style={styles.metricLabel}>Volatility</Text>
                      <Text style={styles.metricValue}>
                        {fund.metrics.volatility ? formatPercentage(fund.metrics.volatility) : 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.metricBox}>
                      <Text style={styles.metricLabel}>Max Drawdown</Text>
                      <Text style={styles.metricValue}>
                        {fund.metrics.max_drawdown ? formatPercentage(fund.metrics.max_drawdown) : 'N/A'}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            )}

            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setSelectedFund(null)}
            >
              <Text style={styles.backButtonText}>← Back to Search</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
