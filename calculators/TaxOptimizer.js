import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { ArrowLeft, Receipt } from 'lucide-react-native';
import { styles } from '../styles/appStyles';
import { Navigation } from '../components/Navigation';
import { searchFunds } from '../services/fundService';
import { formatCurrency } from '../utils/formatters';
import { validateAmount } from '../utils/validators';

export default function TaxOptimizer({ setActiveTool, setScreen, setSelectedFund, setSelectedTopic }) {
  const [taxIncome, setTaxIncome] = useState('');
  const [taxInvestment, setTaxInvestment] = useState('');
  const [taxResult, setTaxResult] = useState(null);
  const [elssFunds, setElssFunds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadElssFunds();
  }, []);

  const loadElssFunds = async () => {
    setLoading(true);
    try {
      const data = await searchFunds('elss');
      setElssFunds(data.results || []);
    } catch (error) {
      console.error('Error loading ELSS funds:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculate = () => {
    // Validate inputs
    const incomeValidation = validateAmount(taxIncome, 100000, 100000000);
    if (!incomeValidation.valid) {
      Alert.alert('Invalid Income', incomeValidation.error);
      return;
    }

    const investmentValidation = validateAmount(taxInvestment, 500, 150000);
    if (!investmentValidation.valid) {
      Alert.alert('Invalid Investment', investmentValidation.error);
      return;
    }

    const income = parseFloat(taxIncome);
    const investment = parseFloat(taxInvestment);

    const maxDeduction = Math.min(investment, 150000); // 80C limit
    let taxSaved = 0;

    if (income <= 250000) {
      taxSaved = 0;
    } else if (income <= 500000) {
      taxSaved = maxDeduction * 0.05;
    } else if (income <= 1000000) {
      taxSaved = maxDeduction * 0.20;
    } else {
      taxSaved = maxDeduction * 0.30;
    }

    setTaxResult({
      investment: Math.round(investment),
      deduction: Math.round(maxDeduction),
      taxSaved: Math.round(taxSaved),
      effectiveCost: Math.round(investment - taxSaved)
    });
  };

  const reset = () => {
    setTaxIncome('');
    setTaxInvestment('');
    setTaxResult(null);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.headerBlue, { backgroundColor: '#7C2D12' }]}>
        <TouchableOpacity onPress={() => setActiveTool(null)}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Tax Optimizer 💰</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calculate Tax Savings (Section 80C)</Text>

          {/* Annual Income */}
          <View style={styles.toolInputGroup}>
            <Text style={styles.toolInputLabel}>Annual Income (₹)</Text>
            <TextInput
              style={styles.toolInput}
              placeholder="e.g., 1000000"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={taxIncome}
              onChangeText={setTaxIncome}
            />
          </View>

          {/* ELSS Investment */}
          <View style={styles.toolInputGroup}>
            <Text style={styles.toolInputLabel}>ELSS Investment (₹)</Text>
            <TextInput
              style={styles.toolInput}
              placeholder="e.g., 150000 (max)"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={taxInvestment}
              onChangeText={setTaxInvestment}
            />
            <Text style={styles.inputHint}>Maximum deduction: ₹1,50,000 under Section 80C</Text>
          </View>

          {/* Calculate Button */}
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#7C2D12' }]}
            onPress={calculate}
          >
            <View style={styles.actionContent}>
              <View style={styles.actionLeft}>
                <View style={styles.actionIcon}>
                  <Receipt size={24} color="#fff" />
                </View>
                <Text style={styles.actionTitle}>Calculate Tax Savings</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Results Section */}
        {taxResult && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Tax Savings</Text>

            <View style={styles.resultCard}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Investment Amount</Text>
                <Text style={styles.resultValue}>
                  {formatCurrency(taxResult.investment)}
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Tax Deduction</Text>
                <Text style={styles.resultValue}>
                  {formatCurrency(taxResult.deduction)}
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Tax Saved</Text>
                <Text style={[styles.resultValue, { color: '#22C55E' }]}>
                  {formatCurrency(taxResult.taxSaved)}
                </Text>
              </View>

              <View style={[styles.resultRow, styles.resultRowTotal]}>
                <Text style={styles.resultLabelTotal}>Effective Cost</Text>
                <Text style={styles.resultValueTotal}>
                  {formatCurrency(taxResult.effectiveCost)}
                </Text>
              </View>
            </View>

            {/* Insights */}
            <View style={styles.insightCard}>
              <Text style={styles.insightTitle}>💡 Tax Benefits</Text>
              <Text style={styles.insightText}>
                • You save {formatCurrency(taxResult.taxSaved)} in taxes!
              </Text>
              <Text style={styles.insightText}>
                • Effective investment: Only {formatCurrency(taxResult.effectiveCost)}
              </Text>
              <Text style={styles.insightText}>
                • ELSS has 3-year lock-in period
              </Text>
              <Text style={styles.insightText}>
                • Best tax-saving investment option
              </Text>
            </View>

            {/* Reset Button */}
            <TouchableOpacity style={styles.backButton} onPress={reset}>
              <Text style={styles.backButtonText}>Calculate Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ELSS Funds List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top ELSS Funds</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#7C2D12" />
              <Text style={styles.loadingText}>Loading ELSS funds...</Text>
            </View>
          ) : (
            <>
              {elssFunds.slice(0, 5).map((fund, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.fundCard}
                  onPress={() => {
                    setSelectedFund(fund);
                    setScreen('check');
                  }}
                >
                  <View style={styles.fundCardContent}>
                    <Text style={styles.fundName} numberOfLines={2}>
                      {fund.name}
                    </Text>
                    {fund.risk && (
                      <View style={styles.fundTags}>
                        <View style={styles.tagRisk}>
                          <Text style={styles.tagText}>{fund.risk}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>
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
