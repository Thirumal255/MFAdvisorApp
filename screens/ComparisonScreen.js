import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { styles } from '../styles/appStyles';
import { formatPercentage } from '../utils/formatters';

export default function ComparisonScreen({ fund1, fund2, setScreen, setCompareMode }) {
  return (
    <View style={styles.container}>
      <View style={[styles.headerBlue, { backgroundColor: '#059669' }]}>
        <TouchableOpacity onPress={() => setCompareMode(false)}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Fund Comparison</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          {/* Fund Names */}
          <View style={styles.comparisonHeader}>
            <View style={styles.comparisonColumn}>
              <Text style={styles.comparisonFundName}>{fund1?.fund_name}</Text>
            </View>
            <View style={styles.comparisonColumn}>
              <Text style={styles.comparisonFundName}>{fund2?.fund_name}</Text>
            </View>
          </View>

          {/* Metrics Comparison */}
          <View style={styles.comparisonMetrics}>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonMetricName}>CAGR</Text>
              <View style={styles.comparisonValues}>
                <Text style={styles.comparisonValue}>
                  {fund1?.cagr ? formatPercentage(fund1.cagr) : 'N/A'}
                </Text>
                <Text style={styles.comparisonValue}>
                  {fund2?.cagr ? formatPercentage(fund2.cagr) : 'N/A'}
                </Text>
              </View>
            </View>

            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonMetricName}>Risk</Text>
              <View style={styles.comparisonValues}>
                <Text style={styles.comparisonValue}>{fund1?.risk || 'N/A'}</Text>
                <Text style={styles.comparisonValue}>{fund2?.risk || 'N/A'}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
