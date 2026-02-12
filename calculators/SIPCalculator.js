import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { ArrowLeft, Calculator } from 'lucide-react-native';
import { styles } from '../styles/appStyles';
import { Navigation } from '../components/Navigation';
import { calculateSIP } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import { validateAmount, validateYears, validateReturnRate } from '../utils/validators';

export default function SIPCalculator({ setActiveTool, setScreen, setSelectedFund, setSelectedTopic }) {
  const [sipAmount, setSipAmount] = useState('');
  const [sipYears, setSipYears] = useState('');
  const [sipReturn, setSipReturn] = useState('');
  const [sipResult, setSipResult] = useState(null);

  const calculate = () => {
    // Validate inputs
    const amountValidation = validateAmount(sipAmount, 500, 10000000);
    if (!amountValidation.valid) {
      Alert.alert('Invalid Amount', amountValidation.error);
      return;
    }

    const yearsValidation = validateYears(sipYears);
    if (!yearsValidation.valid) {
      Alert.alert('Invalid Duration', yearsValidation.error);
      return;
    }

    const returnValidation = validateReturnRate(sipReturn);
    if (!returnValidation.valid) {
      Alert.alert('Invalid Return', returnValidation.error);
      return;
    }

    // Calculate SIP
    const result = calculateSIP(
      parseFloat(sipAmount),
      parseFloat(sipYears),
      parseFloat(sipReturn)
    );

    setSipResult(result);
  };

  const reset = () => {
    setSipAmount('');
    setSipYears('');
    setSipReturn('');
    setSipResult(null);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.headerBlue, { backgroundColor: '#7C3AED' }]}>
        <TouchableOpacity onPress={() => setActiveTool(null)}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>SIP Calculator 💰</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Investment Details</Text>

          {/* Monthly SIP Amount */}
          <View style={styles.toolInputGroup}>
            <Text style={styles.toolInputLabel}>Monthly SIP Amount (₹)</Text>
            <TextInput
              style={styles.toolInput}
              placeholder="e.g., 5000"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={sipAmount}
              onChangeText={setSipAmount}
            />
          </View>

          {/* Investment Duration */}
          <View style={styles.toolInputGroup}>
            <Text style={styles.toolInputLabel}>Investment Duration (Years)</Text>
            <TextInput
              style={styles.toolInput}
              placeholder="e.g., 10"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={sipYears}
              onChangeText={setSipYears}
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
              value={sipReturn}
              onChangeText={setSipReturn}
            />
          </View>

          {/* Calculate Button */}
          <TouchableOpacity
            style={[styles.actionCard, styles.purpleGradient]}
            onPress={calculate}
          >
            <View style={styles.actionContent}>
              <View style={styles.actionLeft}>
                <View style={styles.actionIcon}>
                  <Calculator size={24} color="#fff" />
                </View>
                <Text style={styles.actionTitle}>Calculate Returns</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Results Section */}
        {sipResult && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Results</Text>

            <View style={styles.resultCard}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Total Invested</Text>
                <Text style={styles.resultValue}>
                  {formatCurrency(sipResult.invested)}
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Expected Returns</Text>
                <Text style={[styles.resultValue, { color: '#22C55E' }]}>
                  {formatCurrency(sipResult.returns)}
                </Text>
              </View>

              <View style={[styles.resultRow, styles.resultRowTotal]}>
                <Text style={styles.resultLabelTotal}>Final Amount</Text>
                <Text style={styles.resultValueTotal}>
                  {formatCurrency(sipResult.total)}
                </Text>
              </View>
            </View>

            {/* Insights */}
            <View style={styles.insightCard}>
              <Text style={styles.insightTitle}>💡 Key Insights</Text>
              <Text style={styles.insightText}>
                • You'll invest {formatCurrency(sipAmount)} every month for {sipYears} years
              </Text>
              <Text style={styles.insightText}>
                • Your wealth will grow to {formatCurrency(sipResult.total)}
              </Text>
              <Text style={styles.insightText}>
                • That's {((sipResult.returns / sipResult.invested) * 100).toFixed(1)}% returns!
              </Text>
            </View>

            {/* Reset Button */}
            <TouchableOpacity style={styles.backButton} onPress={reset}>
              <Text style={styles.backButtonText}>Calculate Again</Text>
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
