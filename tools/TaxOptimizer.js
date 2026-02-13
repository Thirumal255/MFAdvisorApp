// ============================================================
// 📁 tools/TaxOptimizer.js
// ============================================================
// WHAT THIS FILE DOES:
//   Tax savings calculator for ELSS (Equity Linked Savings Scheme).
//   User enters annual income and ELSS investment amount.
//   Shows how much tax they save under Section 80C (₹1.5L max).
//   Also lists top ELSS funds from the API.
//
// WHAT IT REPLACES IN App.js:
//   Lines ~3190-3323 → the `if (screen === 'tools' && activeTool === 'tax')` block.
//   Also the loadElssFunds function and calculateTaxSavings logic.
//
// HOW TO USE:
//   In App.js:
//     import TaxOptimizer from './tools/TaxOptimizer';
//     if (screen === 'tools' && activeTool === 'tax') {
//       return <TaxOptimizer setActiveTool={setActiveTool} />;
//     }
// ============================================================

import { ArrowLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { API_ENDPOINTS } from '../config/api';
import { styles } from '../styles/appStyles';
import { calculateTaxSavings } from '../utils/calculations';

export default function TaxOptimizer({ setActiveTool }) {

  // ── Local state ────────────────────────────────────────────
  const [taxIncome, setTaxIncome] = useState('');
  const [taxInvestment, setTaxInvestment] = useState('');
  const [taxResult, setTaxResult] = useState(null);
  const [elssFunds, setElssFunds] = useState([]);      // List of ELSS funds from API

  // ── Load ELSS funds on mount ───────────────────────────────
  // useEffect runs once when this screen first renders.
  // It fetches ELSS funds from the backend API.
  useEffect(() => {
    const loadElssFunds = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.SEARCH}?q=elss`);
        const data = await response.json();
        setElssFunds(data.results || []);
      } catch (error) {
        console.log('Error loading ELSS funds:', error);
      }
    };

    loadElssFunds();
  }, []);  // Empty array = run once on mount

  // ── Handle Calculate ───────────────────────────────────────
  const handleCalculate = () => {
    const result = calculateTaxSavings(taxIncome, taxInvestment);
    if (!result) {
      alert('Please enter valid values!');
      return;
    }
    setTaxResult(result);
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <View style={[styles.headerBlue, { backgroundColor: '#EF4444' }]}>
        <TouchableOpacity onPress={() => setActiveTool(null)}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Tax Optimizer 💸</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollViewFull}>
        <View style={styles.calculatorContainer}>

          {/* Section Header */}
          <Text style={styles.sectionHeader}>Calculate Tax Savings 💰</Text>

          {/* Input: Annual Income */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>💼 Annual Income (₹)</Text>
            <TextInput
              style={styles.calculatorInput}
              placeholder="e.g., 1000000"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={taxIncome}
              onChangeText={setTaxIncome}
            />
          </View>

          {/* Input: ELSS Investment */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>💸 ELSS Investment (₹)</Text>
            <TextInput
              style={styles.calculatorInput}
              placeholder="e.g., 150000"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={taxInvestment}
              onChangeText={setTaxInvestment}
            />
            <Text style={styles.inputHint}>
              Max deduction: ₹1.5 lakhs under Section 80C
            </Text>
          </View>

          <TouchableOpacity style={styles.calculateButton} onPress={handleCalculate}>
            <Text style={styles.calculateButtonText}>Calculate Savings 🚀</Text>
          </TouchableOpacity>

          {/* Results */}
          {taxResult && (
            <View style={styles.resultsCard}>
              <Text style={styles.resultsTitle}>Tax Savings 💰</Text>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Investment</Text>
                <Text style={styles.resultValue}>
                  ₹{taxResult.investment.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Eligible Deduction</Text>
                <Text style={styles.resultValue}>
                  ₹{taxResult.deduction.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Tax Saved</Text>
                <Text style={[styles.resultValue, styles.resultGain]}>
                  ₹{taxResult.taxSaved.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={[styles.resultRow, styles.resultRowTotal]}>
                <Text style={styles.resultLabelTotal}>Effective Cost</Text>
                <Text style={styles.resultValueTotal}>
                  ₹{taxResult.effectiveCost.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={styles.insightCard}>
                <Text style={styles.insightText}>
                  💡 You save ₹{taxResult.taxSaved.toLocaleString('en-IN')} in taxes!
                  Your actual investment cost is only ₹{taxResult.effectiveCost.toLocaleString('en-IN')}! 🔥
                </Text>
              </View>
            </View>
          )}

          {/* ELSS Funds List from API */}
          <Text style={styles.sectionHeader}>Top ELSS Funds 📋</Text>
          {elssFunds.length > 0 ? (
            elssFunds.slice(0, 10).map((fund, index) => (
              <View key={index} style={styles.elssFundCard}>
                <Text style={styles.elssFundName} numberOfLines={2}>
                  {fund.name}
                </Text>
                <View style={styles.elssFundMeta}>
                  <View style={styles.elssFundMetaItem}>
                    <Text style={styles.elssFundLabel}>CAGR</Text>
                    <Text style={styles.elssFundValue}>
                      {fund.cagr > 0 ? '+' : ''}{fund.cagr}%
                    </Text>
                  </View>
                  {fund.risk && (
                    <View style={styles.elssFundMetaItem}>
                      <Text style={styles.elssFundLabel}>Risk</Text>
                      <Text style={styles.elssFundValue}>{fund.risk}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#EF4444" />
              <Text style={styles.loadingText}>Loading ELSS funds...</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
