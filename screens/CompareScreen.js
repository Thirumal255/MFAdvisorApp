// ============================================================
// 📁 screens/CompareScreen.js
// ============================================================
// WHAT THIS FILE DOES:
//   Side-by-side comparison screen for two funds.
//   Opened from MyFundAnalyzer when user taps "Compare" button.
//   Shows: Score, Expense Ratio, CAGR, Sharpe, Sortino,
//          Volatility, Max Drawdown, Consistency, Positive Months %,
//          Fund Age, Risk Level.
//   Green highlights the better value in each row.
//
// WHAT IT REPLACES IN App.js:
//   Lines ~3809-4080 → the `if (screen === 'compare' && compareMode && comparisonData)` block.
//
// HOW TO USE:
//   In App.js:
//     import CompareScreen from './screens/CompareScreen';
//     if (screen === 'compare' && compareMode && comparisonData) {
//       return <CompareScreen comparisonData={comparisonData}
//                setCompareMode={setCompareMode} setComparisonData={setComparisonData}
//                setScreen={setScreen} />;
//     }
// ============================================================

import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles/appStyles';

export default function CompareScreen({
  comparisonData,       // The API response with fund1 & fund2 data
  setCompareMode,       // Function → set to false to exit compare
  setComparisonData,    // Function → set to null to clear data
  setScreen,            // Function → navigate back
}) {

  const fund1 = comparisonData.fund1;
  const fund2 = comparisonData.fund2;

  // ── Handle back ────────────────────────────────────────────
  const handleBack = () => {
    setCompareMode(false);
    setComparisonData(null);
    setScreen('myFundAnalyzer');
  };

  // ── Comparison row helper ──────────────────────────────────
  // Renders one row of the comparison table.
  // higherIsBetter: true = green goes to higher value, false = green goes to lower
  const ComparisonRow = ({ label, val1, val2, format, higherIsBetter = true }) => {
    const v1 = val1 != null ? val1 : null;
    const v2 = val2 != null ? val2 : null;
    const f1Better = v1 != null && v2 != null && (higherIsBetter ? v1 > v2 : v1 < v2);
    const f2Better = v1 != null && v2 != null && (higherIsBetter ? v2 > v1 : v2 < v1);

    return (
      <View style={styles.comparisonRow}>
        <Text style={styles.comparisonMetricName}>{label}</Text>
        <View style={styles.comparisonValues}>
          <Text style={[styles.comparisonValue, f1Better && styles.comparisonValueBetter]}>
            {format(v1)}
          </Text>
          <Text style={[styles.comparisonValue, f2Better && styles.comparisonValueBetter]}>
            {format(v2)}
          </Text>
        </View>
      </View>
    );
  };

  // ── Format helpers ─────────────────────────────────────────
  const fmtScore = (v) => v != null ? Math.round(v) : 'N/A';
  const fmtPct = (v) => v != null ? `${(v * 100).toFixed(2)}%` : 'N/A';
  const fmtPct0 = (v) => v != null ? `${(v * 100).toFixed(0)}%` : 'N/A';
  const fmtDec = (v) => v != null ? v.toFixed(2) : 'N/A';
  const fmtDec1 = (v) => v != null ? v.toFixed(1) : 'N/A';
  const fmtYrs = (v) => v != null ? `${v} yrs` : 'N/A';
  const fmtStr = (v) => v || 'N/A';
  const fmtExpense = (fund) => fund.expense?.Direct || 'N/A';

  // ── Render ─────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerPurple}>
        <TouchableOpacity onPress={handleBack}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>⚖️ Compare Funds</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>

        {/* Fund Name Headers */}
        <View style={styles.comparisonHeader}>
          <View style={styles.comparisonFundCard}>
            <Text style={styles.comparisonFundName} numberOfLines={2}>{fund1.name}</Text>
            {fund1.score && (
              <View style={styles.comparisonScore}>
                <Text style={styles.comparisonScoreEmoji}>{fund1.score.tier?.emoji || '📊'}</Text>
                <Text style={styles.comparisonScoreValue}>{Math.round(fund1.score.total)}</Text>
              </View>
            )}
          </View>

          <Text style={styles.comparisonVs}>VS</Text>

          <View style={styles.comparisonFundCard}>
            <Text style={styles.comparisonFundName} numberOfLines={2}>{fund2.name}</Text>
            {fund2.score && (
              <View style={styles.comparisonScore}>
                <Text style={styles.comparisonScoreEmoji}>{fund2.score.tier?.emoji || '📊'}</Text>
                <Text style={styles.comparisonScoreValue}>{Math.round(fund2.score.total)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Comparison Table */}
        <View style={styles.comparisonTable}>
          <ComparisonRow label="Overall Score" val1={fund1.score?.total} val2={fund2.score?.total} format={fmtScore} />

          {/* Expense Ratio - lower is better */}
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonMetricName}>Expense Ratio</Text>
            <View style={styles.comparisonValues}>
              <Text style={[
                styles.comparisonValue,
                parseFloat(fund1.expense?.Direct || 999) < parseFloat(fund2.expense?.Direct || 999) && styles.comparisonValueBetter
              ]}>
                {fmtExpense(fund1)}%
              </Text>
              <Text style={[
                styles.comparisonValue,
                parseFloat(fund2.expense?.Direct || 999) < parseFloat(fund1.expense?.Direct || 999) && styles.comparisonValueBetter
              ]}>
                {fmtExpense(fund2)}%
              </Text>
            </View>
          </View>

          <ComparisonRow label="CAGR" val1={fund1.cagr} val2={fund2.cagr} format={fmtPct} />
          <ComparisonRow label="Sharpe Ratio" val1={fund1.sharpe} val2={fund2.sharpe} format={fmtDec} />
          <ComparisonRow label="Sortino Ratio" val1={fund1.sortino} val2={fund2.sortino} format={fmtDec} />
          <ComparisonRow label="Volatility" val1={fund1.volatility} val2={fund2.volatility} format={fmtPct} higherIsBetter={false} />
          <ComparisonRow label="Max Drawdown" val1={fund1.max_drawdown} val2={fund2.max_drawdown} format={fmtPct} higherIsBetter={true} />
          <ComparisonRow label="Consistency Score" val1={fund1.consistency_score} val2={fund2.consistency_score} format={fmtDec1} />
          <ComparisonRow label="Positive Months %" val1={fund1.positive_months_pct} val2={fund2.positive_months_pct} format={fmtPct0} />

          {/* Fund Age (no winner highlight) */}
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonMetricName}>Fund Age</Text>
            <View style={styles.comparisonValues}>
              <Text style={styles.comparisonValue}>{fund1.fund_age} yrs</Text>
              <Text style={styles.comparisonValue}>{fund2.fund_age} yrs</Text>
            </View>
          </View>

          {/* Risk Level (no winner highlight) */}
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonMetricName}>Risk Level</Text>
            <View style={styles.comparisonValues}>
              <Text style={styles.comparisonValue}>{fund1.risk || 'N/A'}</Text>
              <Text style={styles.comparisonValue}>{fund2.risk || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.comparisonLegend}>
          <Text style={styles.comparisonLegendText}>
            💚 Green indicates better performance
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
