// ============================================================
// 📁 tools/SIPCalculator.js
// ============================================================
// WHAT THIS FILE DOES:
//   The SIP (Systematic Investment Plan) Calculator screen.
//   User enters: monthly amount, years, expected return %.
//   It calculates how much wealth they'll accumulate.
//
// WHAT IT REPLACES IN App.js:
//   Lines ~2318-2448 → the `if (screen === 'tools' && activeTool === 'sip')` block.
//   Also uses calculateSIP from utils/calculations.js instead of
//   the inline function that was in App.js (~lines 502-523).
//
// HOW TO USE:
//   In App.js, replace the old block with:
//     import SIPCalculator from './tools/SIPCalculator';
//     if (screen === 'tools' && activeTool === 'sip') {
//       return <SIPCalculator setActiveTool={setActiveTool} />;
//     }
// ============================================================

import { ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles/appStyles';
import { calculateSIP } from '../utils/calculations';

export default function SIPCalculator({ setActiveTool }) {

  // ── Local state (only this screen needs these) ─────────────
  const [sipAmount, setSipAmount] = useState('');    // Monthly investment ₹
  const [sipYears, setSipYears] = useState('');       // Number of years
  const [sipReturn, setSipReturn] = useState('');     // Expected annual return %
  const [sipResult, setSipResult] = useState(null);   // Calculation result object

  // ── Handle Calculate button press ──────────────────────────
  const handleCalculate = () => {
    const result = calculateSIP(sipAmount, sipYears, sipReturn);
    if (!result) {
      alert('Please enter valid values!');
      return;
    }
    setSipResult(result);
  };

  // ── Handle Back button (go back to tools grid) ─────────────
  const handleBack = () => {
    setActiveTool(null);  // This tells App.js to show the tools grid again
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Header with back arrow */}
      <View style={styles.headerBlue}>
        <TouchableOpacity onPress={handleBack}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>SIP Calculator 🧮</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollViewFull}>
        <View style={styles.calculatorContainer}>

          {/* Input: Monthly Investment */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>💰 Monthly Investment (₹)</Text>
            <TextInput
              style={styles.calculatorInput}
              placeholder="e.g., 5000"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={sipAmount}
              onChangeText={setSipAmount}
            />
          </View>

          {/* Input: Investment Period */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>📅 Investment Period (Years)</Text>
            <TextInput
              style={styles.calculatorInput}
              placeholder="e.g., 10"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={sipYears}
              onChangeText={setSipYears}
            />
          </View>

          {/* Input: Expected Return */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>📈 Expected Annual Return (%)</Text>
            <TextInput
              style={styles.calculatorInput}
              placeholder="e.g., 12"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={sipReturn}
              onChangeText={setSipReturn}
            />
            <Text style={styles.inputHint}>
              Typical equity fund returns: 10-15% annually
            </Text>
          </View>

          {/* Calculate Button */}
          <TouchableOpacity style={styles.calculateButton} onPress={handleCalculate}>
            <Text style={styles.calculateButtonText}>Calculate 🚀</Text>
          </TouchableOpacity>

          {/* ── Results Section (only shows after calculation) ── */}
          {sipResult && (
            <View style={styles.resultsCard}>
              <Text style={styles.resultsTitle}>Your Results 📊</Text>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Total Invested</Text>
                <Text style={styles.resultValue}>
                  ₹{sipResult.invested.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Wealth Gained</Text>
                <Text style={[styles.resultValue, styles.resultGain]}>
                  ₹{sipResult.returns.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={[styles.resultRow, styles.resultRowTotal]}>
                <Text style={styles.resultLabelTotal}>Future Value</Text>
                <Text style={styles.resultValueTotal}>
                  ₹{sipResult.total.toLocaleString('en-IN')}
                </Text>
              </View>

              {/* Visual Bar showing invested vs returns ratio */}
              <View style={styles.visualBar}>
                <View style={styles.visualBarSection}>
                  <View style={[styles.visualBarFill, {
                    width: `${(sipResult.invested / sipResult.total) * 100}%`,
                    backgroundColor: '#3B82F6'
                  }]} />
                  <Text style={styles.visualBarLabel}>
                    Invested: {((sipResult.invested / sipResult.total) * 100).toFixed(0)}%
                  </Text>
                </View>
                <View style={styles.visualBarSection}>
                  <View style={[styles.visualBarFill, {
                    width: `${(sipResult.returns / sipResult.total) * 100}%`,
                    backgroundColor: '#10B981'
                  }]} />
                  <Text style={styles.visualBarLabel}>
                    Returns: {((sipResult.returns / sipResult.total) * 100).toFixed(0)}%
                  </Text>
                </View>
              </View>

              {/* Insight message */}
              <View style={styles.insightCard}>
                <Text style={styles.insightText}>
                  💡 By investing just ₹{Number(sipAmount).toLocaleString('en-IN')}/month,
                  you'll earn ₹{sipResult.returns.toLocaleString('en-IN')} in returns!
                  That's {((sipResult.returns / sipResult.invested) * 100).toFixed(0)}% growth! 🔥
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
      {/* No bottom navigation bar on individual tool screens */}
    </View>
  );
}
