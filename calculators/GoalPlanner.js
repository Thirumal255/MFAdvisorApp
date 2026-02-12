import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { ArrowLeft, Target } from 'lucide-react-native';
import { styles } from '../styles/appStyles';
import { Navigation } from '../components/Navigation';
import { calculateRequiredSIP } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import { validateAmount, validateYears, validateReturnRate } from '../utils/validators';

export default function GoalPlanner({ setActiveTool, setScreen, setSelectedFund, setSelectedTopic }) {
  const [goalAmount, setGoalAmount] = useState('');
  const [goalYears, setGoalYears] = useState('');
  const [goalReturn, setGoalReturn] = useState('');
  const [goalResult, setGoalResult] = useState(null);

  const calculate = () => {
    // Validate inputs
    const amountValidation = validateAmount(goalAmount, 10000, 100000000);
    if (!amountValidation.valid) {
      Alert.alert('Invalid Goal Amount', amountValidation.error);
      return;
    }

    const yearsValidation = validateYears(goalYears);
    if (!yearsValidation.valid) {
      Alert.alert('Invalid Duration', yearsValidation.error);
      return;
    }

    const returnValidation = validateReturnRate(goalReturn);
    if (!returnValidation.valid) {
      Alert.alert('Invalid Return', returnValidation.error);
      return;
    }

    // Calculate required monthly SIP
    const monthlyRequired = calculateRequiredSIP(
      parseFloat(goalAmount),
      parseFloat(goalYears),
      parseFloat(goalReturn)
    );

    const totalInvested = monthlyRequired * parseFloat(goalYears) * 12;

    setGoalResult({
      monthly: monthlyRequired,
      total: totalInvested,
      target: parseFloat(goalAmount)
    });
  };

  const reset = () => {
    setGoalAmount('');
    setGoalYears('');
    setGoalReturn('');
    setGoalResult(null);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.headerBlue, { backgroundColor: '#2563EB' }]}>
        <TouchableOpacity onPress={() => setActiveTool(null)}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Goal Planner 🎯</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Financial Goal</Text>

          {/* Goal Amount */}
          <View style={styles.toolInputGroup}>
            <Text style={styles.toolInputLabel}>Target Amount (₹)</Text>
            <TextInput
              style={styles.toolInput}
              placeholder="e.g., 5000000 (50 lakhs)"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={goalAmount}
              onChangeText={setGoalAmount}
            />
          </View>

          {/* Time to Goal */}
          <View style={styles.toolInputGroup}>
            <Text style={styles.toolInputLabel}>Time to Achieve (Years)</Text>
            <TextInput
              style={styles.toolInput}
              placeholder="e.g., 15"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={goalYears}
              onChangeText={setGoalYears}
            />
          </View>

          {/* Expected Return */}
          <View style={styles.toolInputGroup}>
            <Text style={styles.toolInputLabel}>Expected Return (% per year)</Text>
            <TextInput
              style={styles.toolInput}
              placeholder="e.g., 12"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={goalReturn}
              onChangeText={setGoalReturn}
            />
          </View>

          {/* Calculate Button */}
          <TouchableOpacity
            style={[styles.actionCard, styles.blueGradient]}
            onPress={calculate}
          >
            <View style={styles.actionContent}>
              <View style={styles.actionLeft}>
                <View style={styles.actionIcon}>
                  <Target size={24} color="#fff" />
                </View>
                <Text style={styles.actionTitle}>Calculate Required SIP</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Results Section */}
        {goalResult && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Investment Plan</Text>

            <View style={styles.resultCard}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Monthly SIP Required</Text>
                <Text style={[styles.resultValue, { color: '#2563EB' }]}>
                  {formatCurrency(goalResult.monthly)}
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Total Investment</Text>
                <Text style={styles.resultValue}>
                  {formatCurrency(goalResult.total)}
                </Text>
              </View>

              <View style={[styles.resultRow, styles.resultRowTotal]}>
                <Text style={styles.resultLabelTotal}>Goal Amount</Text>
                <Text style={styles.resultValueTotal}>
                  {formatCurrency(goalResult.target)}
                </Text>
              </View>
            </View>

            {/* Insights */}
            <View style={styles.insightCard}>
              <Text style={styles.insightTitle}>💡 Your Path to Success</Text>
              <Text style={styles.insightText}>
                • Invest {formatCurrency(goalResult.monthly)} every month
              </Text>
              <Text style={styles.insightText}>
                • Continue for {goalYears} years consistently
              </Text>
              <Text style={styles.insightText}>
                • You'll reach your goal of {formatCurrency(goalResult.target)}!
              </Text>
              <Text style={styles.insightText}>
                • Returns: {formatCurrency(goalResult.target - goalResult.total)}
              </Text>
            </View>

            {/* Reset Button */}
            <TouchableOpacity style={styles.backButton} onPress={reset}>
              <Text style={styles.backButtonText}>Plan Another Goal</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Navigation
        screen="tools"
        setScreen={setScreen}
        setSelectedFund={setSelectedFund}
        setActiveTool={setActiveTool}
        setSelectedTopic={setSelectedTopic}
      />
    </View>
  );
}
