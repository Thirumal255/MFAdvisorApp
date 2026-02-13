// ============================================================
// 📁 tools/ReturnsCalculator.js
// ============================================================
// WHAT THIS FILE DOES:
//   Lumpsum vs SIP comparison screen.
//   User enters a total amount and it shows what happens if you:
//     (a) Invest it all at once (Lumpsum)  vs
//     (b) Spread it monthly over time (SIP)
//   Shows a winner based on which gives higher returns.
//
// WHAT IT REPLACES IN App.js:
//   Lines ~2551-2683 → the `if (screen === 'tools' && activeTool === 'returns')` block.
//
// HOW TO USE:
//   In App.js:
//     import ReturnsCalculator from './tools/ReturnsCalculator';
//     if (screen === 'tools' && activeTool === 'returns') {
//       return <ReturnsCalculator setActiveTool={setActiveTool} />;
//     }
// ============================================================

import { ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles/appStyles';
import { calculateComparison } from '../utils/calculations';

export default function ReturnsCalculator({ setActiveTool }) {

  // ── Local state ────────────────────────────────────────────
  const [compareAmount, setCompareAmount] = useState('');
  const [compareYears, setCompareYears] = useState('');
  const [compareReturn, setCompareReturn] = useState('');
  const [compareResult, setCompareResult] = useState(null);

  // ── Handle Calculate ───────────────────────────────────────
  const handleCalculate = () => {
    const result = calculateComparison(compareAmount, compareYears, compareReturn);
    if (!result) {
      alert('Please enter valid values!');
      return;
    }
    setCompareResult(result);
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <View style={[styles.headerBlue, { backgroundColor: '#10B981' }]}>
        <TouchableOpacity onPress={() => setActiveTool(null)}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Lumpsum vs SIP 📈</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollViewFull}>
        <View style={styles.calculatorContainer}>

          {/* Input: Total Amount */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>💰 Total Amount (₹)</Text>
            <TextInput
              style={styles.calculatorInput}
              placeholder="e.g., 100000"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={compareAmount}
              onChangeText={setCompareAmount}
            />
            <Text style={styles.inputHint}>
              Lumpsum: Invest all at once | SIP: Divide over time
            </Text>
          </View>

          {/* Input: Period */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>📅 Investment Period (Years)</Text>
            <TextInput
              style={styles.calculatorInput}
              placeholder="e.g., 10"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={compareYears}
              onChangeText={setCompareYears}
            />
          </View>

          {/* Input: Return */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>📈 Expected Return (%)</Text>
            <TextInput
              style={styles.calculatorInput}
              placeholder="e.g., 12"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={compareReturn}
              onChangeText={setCompareReturn}
            />
          </View>

          <TouchableOpacity style={styles.calculateButton} onPress={handleCalculate}>
            <Text style={styles.calculateButtonText}>Compare 🚀</Text>
          </TouchableOpacity>

          {/* Results */}
          {compareResult && (
            <View style={styles.resultsCard}>
              <Text style={styles.resultsTitle}>Comparison Results 📊</Text>

              {/* Lumpsum Section */}
              <View style={styles.compareSection}>
                <Text style={styles.compareSectionTitle}>
                  💎 Lumpsum (Invest all now)
                </Text>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Invested</Text>
                  <Text style={styles.resultValue}>
                    ₹{compareResult.lumpsum.invested.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Returns</Text>
                  <Text style={[styles.resultValue, styles.resultGain]}>
                    ₹{compareResult.lumpsum.returns.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={[styles.resultRow, styles.resultRowTotal]}>
                  <Text style={styles.resultLabelTotal}>Final Value</Text>
                  <Text style={styles.resultValueTotal}>
                    ₹{compareResult.lumpsum.total.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>

              {/* SIP Section */}
              <View style={styles.compareSection}>
                <Text style={styles.compareSectionTitle}>
                  📅 SIP (₹{compareResult.sip.monthly.toLocaleString('en-IN')}/month)
                </Text>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Invested</Text>
                  <Text style={styles.resultValue}>
                    ₹{compareResult.sip.invested.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Returns</Text>
                  <Text style={[styles.resultValue, styles.resultGain]}>
                    ₹{compareResult.sip.returns.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={[styles.resultRow, styles.resultRowTotal]}>
                  <Text style={styles.resultLabelTotal}>Final Value</Text>
                  <Text style={styles.resultValueTotal}>
                    ₹{compareResult.sip.total.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>

              {/* Winner */}
              <View style={styles.winnerCard}>
                <Text style={styles.winnerText}>
                  🏆 Winner: {compareResult.winner}
                </Text>
                <Text style={styles.winnerSubtext}>
                  {compareResult.winner === 'Lumpsum'
                    ? 'Lumpsum wins if you invest all at the start!'
                    : 'SIP benefits from rupee cost averaging!'}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
