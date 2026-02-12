import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { ArrowLeft, TrendingUp } from 'lucide-react-native';
import { styles } from '../styles/appStyles';
import { Navigation } from '../components/Navigation';
import { calculateLumpsum, calculateSIP } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import { validateAmount, validateYears, validateReturnRate } from '../utils/validators';

export default function LumpsumVsSIP({ setActiveTool, setScreen, setSelectedFund, setSelectedTopic }) {
  const [compareAmount, setCompareAmount] = useState('');
  const [compareYears, setCompareYears] = useState('');
  const [compareReturn, setCompareReturn] = useState('');
  const [compareResult, setCompareResult] = useState(null);

  const calculate = () => {
    // Validate inputs
    const amountValidation = validateAmount(compareAmount, 10000, 100000000);
    if (!amountValidation.valid) {
      Alert.alert('Invalid Amount', amountValidation.error);
      return;
    }

    const yearsValidation = validateYears(compareYears);
    if (!yearsValidation.valid) {
      Alert.alert('Invalid Duration', yearsValidation.error);
      return;
    }

    const returnValidation = validateReturnRate(compareReturn);
    if (!returnValidation.valid) {
      Alert.alert('Invalid Return', returnValidation.error);
      return;
    }

    const amount = parseFloat(compareAmount);
    const years = parseFloat(compareYears);
    const returnRate = parseFloat(compareReturn);

    // Calculate Lumpsum
    const lumpsumResult = calculateLumpsum(amount, years, returnRate);

    // Calculate SIP (monthly amount = total amount / months)
    const monthlyAmount = amount / (years * 12);
    const sipResult = calculateSIP(monthlyAmount, years, returnRate);

    setCompareResult({
      lumpsum: lumpsumResult,
      sip: sipResult,
      winner: sipResult.total > lumpsumResult.total ? 'SIP' : 'Lumpsum'
    });
  };

  const reset = () => {
    setCompareAmount('');
    setCompareYears('');
    setCompareReturn('');
    setCompareResult(null);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.headerBlue, { backgroundColor: '#EA580C' }]}>
        <TouchableOpacity onPress={() => setActiveTool(null)}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Lumpsum vs SIP ⚖️</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compare Investment Strategies</Text>

          {/* Investment Amount */}
          <View style={styles.toolInputGroup}>
            <Text style={styles.toolInputLabel}>Total Amount (₹)</Text>
            <TextInput
              style={styles.toolInput}
              placeholder="e.g., 100000"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={compareAmount}
              onChangeText={setCompareAmount}
            />
          </View>

          {/* Duration */}
          <View style={styles.toolInputGroup}>
            <Text style={styles.toolInputLabel}>Investment Duration (Years)</Text>
            <TextInput
              style={styles.toolInput}
              placeholder="e.g., 10"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={compareYears}
              onChangeText={setCompareYears}
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
              value={compareReturn}
              onChangeText={setCompareReturn}
            />
          </View>

          {/* Calculate Button */}
          <TouchableOpacity
            style={[styles.actionCard, styles.orangeGradient]}
            onPress={calculate}
          >
            <View style={styles.actionContent}>
              <View style={styles.actionLeft}>
                <View style={styles.actionIcon}>
                  <TrendingUp size={24} color="#fff" />
                </View>
                <Text style={styles.actionTitle}>Compare Strategies</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Results Section */}
        {compareResult && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Comparison Results</Text>

            {/* Lumpsum Card */}
            <View style={[styles.detailsCard, { marginBottom: 12 }]}>
              <Text style={styles.verdictTitle}>💰 Lumpsum Investment</Text>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Invested Once</Text>
                <Text style={styles.resultValue}>
                  {formatCurrency(compareResult.lumpsum.invested)}
                </Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Returns</Text>
                <Text style={[styles.resultValue, { color: '#22C55E' }]}>
                  {formatCurrency(compareResult.lumpsum.returns)}
                </Text>
              </View>
              <View style={[styles.resultRow, styles.resultRowTotal]}>
                <Text style={styles.resultLabelTotal}>Final Value</Text>
                <Text style={styles.resultValueTotal}>
                  {formatCurrency(compareResult.lumpsum.total)}
                </Text>
              </View>
            </View>

            {/* SIP Card */}
            <View style={[styles.detailsCard, { marginBottom: 12 }]}>
              <Text style={styles.verdictTitle}>📅 SIP Investment</Text>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Monthly SIP</Text>
                <Text style={styles.resultValue}>
                  {formatCurrency(parseFloat(compareAmount) / (parseFloat(compareYears) * 12))}
                </Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Total Invested</Text>
                <Text style={styles.resultValue}>
                  {formatCurrency(compareResult.sip.invested)}
                </Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Returns</Text>
                <Text style={[styles.resultValue, { color: '#22C55E' }]}>
                  {formatCurrency(compareResult.sip.returns)}
                </Text>
              </View>
              <View style={[styles.resultRow, styles.resultRowTotal]}>
                <Text style={styles.resultLabelTotal}>Final Value</Text>
                <Text style={styles.resultValueTotal}>
                  {formatCurrency(compareResult.sip.total)}
                </Text>
              </View>
            </View>

            {/* Winner Card */}
            <View style={[styles.verdictCard, { backgroundColor: 'rgba(34, 197, 94, 0.2)' }]}>
              <Text style={styles.verdictTitle}>🏆 Winner</Text>
              <Text style={[styles.verdictText, { color: '#22C55E' }]}>
                {compareResult.winner}
              </Text>
              <Text style={styles.verdictSubtitle}>
                {compareResult.winner === 'SIP' 
                  ? 'SIP gives better returns due to rupee cost averaging!'
                  : 'Lumpsum wins if invested at the right time!'}
              </Text>
            </View>

            {/* Insights */}
            <View style={styles.insightCard}>
              <Text style={styles.insightTitle}>💡 Key Insights</Text>
              <Text style={styles.insightText}>
                • Difference: {formatCurrency(Math.abs(compareResult.sip.total - compareResult.lumpsum.total))}
              </Text>
              <Text style={styles.insightText}>
                • SIP reduces timing risk with regular investments
              </Text>
              <Text style={styles.insightText}>
                • Lumpsum works best in rising markets
              </Text>
            </View>

            {/* Reset Button */}
            <TouchableOpacity style={styles.backButton} onPress={reset}>
              <Text style={styles.backButtonText}>Compare Again</Text>
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
