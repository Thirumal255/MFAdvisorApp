// ============================================================
// 📁 tools/GoalPlanner.js
// ============================================================
// WHAT THIS FILE DOES:
//   The Goal Planner (Reverse SIP) screen.
//   User enters: target amount, years to achieve, expected return %.
//   It calculates how much SIP they need per month to reach the goal.
//
// WHAT IT REPLACES IN App.js:
//   Lines ~2450-2549 → the `if (screen === 'tools' && activeTool === 'goal')` block.
//
// HOW TO USE:
//   In App.js:
//     import GoalPlanner from './tools/GoalPlanner';
//     if (screen === 'tools' && activeTool === 'goal') {
//       return <GoalPlanner setActiveTool={setActiveTool} />;
//     }
// ============================================================

import { ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles/appStyles';
import { calculateGoal } from '../utils/calculations';

export default function GoalPlanner({ setActiveTool }) {

  // ── Local state ────────────────────────────────────────────
  const [goalAmount, setGoalAmount] = useState('');   // Target amount ₹
  const [goalYears, setGoalYears] = useState('');      // Years to achieve
  const [goalReturn, setGoalReturn] = useState('');    // Expected return %
  const [goalResult, setGoalResult] = useState(null);  // Result object

  // ── Handle Calculate ───────────────────────────────────────
  const handleCalculate = () => {
    const result = calculateGoal(goalAmount, goalYears, goalReturn);
    if (!result) {
      alert('Please enter valid values!');
      return;
    }
    setGoalResult(result);
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <View style={[styles.headerBlue, { backgroundColor: '#8B5CF6' }]}>
        <TouchableOpacity onPress={() => setActiveTool(null)}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Goal Planner 🎯</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollViewFull}>
        <View style={styles.calculatorContainer}>

          {/* Input: Target Amount */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>🎯 Target Amount (₹)</Text>
            <TextInput
              style={styles.calculatorInput}
              placeholder="e.g., 5000000"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={goalAmount}
              onChangeText={setGoalAmount}
            />
            <Text style={styles.inputHint}>How much do you need?</Text>
          </View>

          {/* Input: Time Period */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>📅 Time Period (Years)</Text>
            <TextInput
              style={styles.calculatorInput}
              placeholder="e.g., 15"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={goalYears}
              onChangeText={setGoalYears}
            />
          </View>

          {/* Input: Expected Return */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>📈 Expected Return (%)</Text>
            <TextInput
              style={styles.calculatorInput}
              placeholder="e.g., 12"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={goalReturn}
              onChangeText={setGoalReturn}
            />
          </View>

          <TouchableOpacity style={styles.calculateButton} onPress={handleCalculate}>
            <Text style={styles.calculateButtonText}>Calculate 🚀</Text>
          </TouchableOpacity>

          {/* Results */}
          {goalResult && (
            <View style={styles.resultsCard}>
              <Text style={styles.resultsTitle}>Your Plan 📊</Text>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Monthly Investment Needed</Text>
                <Text style={[styles.resultValue, styles.resultGain]}>
                  ₹{goalResult.monthly.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Total You'll Invest</Text>
                <Text style={styles.resultValue}>
                  ₹{goalResult.total.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={[styles.resultRow, styles.resultRowTotal]}>
                <Text style={styles.resultLabelTotal}>Goal Amount</Text>
                <Text style={styles.resultValueTotal}>
                  ₹{goalResult.target.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={styles.insightCard}>
                <Text style={styles.insightText}>
                  💡 Start a SIP of ₹{goalResult.monthly.toLocaleString('en-IN')}/month
                  and reach your ₹{(goalResult.target / 100000).toFixed(0)} lakh goal!
                  Your returns: ₹{(goalResult.target - goalResult.total).toLocaleString('en-IN')} 🎯
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
