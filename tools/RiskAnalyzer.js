// ============================================================
// 📁 tools/RiskAnalyzer.js
// ============================================================
// WHAT THIS FILE DOES:
//   A 5-question quiz that determines the user's risk profile.
//   Based on answers, classifies as: Conservative / Moderate / Aggressive.
//   Then recommends fund types for each profile.
//
// WHAT IT REPLACES IN App.js:
//   Lines ~3087-3188 → the `if (screen === 'tools' && activeTool === 'risk')` block.
//   Also the questions array and calculateRiskScore logic.
//
// HOW TO USE:
//   In App.js:
//     import RiskAnalyzer from './tools/RiskAnalyzer';
//     if (screen === 'tools' && activeTool === 'risk') {
//       return <RiskAnalyzer setActiveTool={setActiveTool} />;
//     }
// ============================================================

import { ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles/appStyles';
import { calculateRiskScore } from '../utils/calculations';

// ── Quiz Questions ───────────────────────────────────────────
// Each question has:
//   id   → unique number
//   q    → question text
//   opts → display labels for each option
//   vals → numerical score for each option (1 = conservative, 5 = aggressive)
const questions = [
  {
    id: 1,
    q: 'What is your investment horizon?',
    opts: ['<1 year (1)', '1-3 years (2)', '3-5 years (4)', '5+ years (5)'],
    vals: [1, 2, 4, 5],
  },
  {
    id: 2,
    q: 'How would you react to a 20% drop?',
    opts: ['Panic & sell (1)', 'Worry (2)', 'Hold steady (4)', 'Buy more! (5)'],
    vals: [1, 2, 4, 5],
  },
  {
    id: 3,
    q: 'Your investment goal?',
    opts: ['Capital safety (1)', 'Regular income (2)', 'Growth (4)', 'Max returns (5)'],
    vals: [1, 2, 4, 5],
  },
  {
    id: 4,
    q: 'Your age group?',
    opts: ['50+ (1)', '40-50 (2)', '30-40 (4)', '<30 (5)'],
    vals: [1, 2, 4, 5],
  },
  {
    id: 5,
    q: 'Emergency fund status?',
    opts: ['None (1)', 'Building (2)', '3-6 months (4)', '6+ months (5)'],
    vals: [1, 2, 4, 5],
  },
];

export default function RiskAnalyzer({ setActiveTool }) {

  // ── Local state ────────────────────────────────────────────
  const [riskAnswers, setRiskAnswers] = useState({});   // { questionId: score }
  const [riskResult, setRiskResult] = useState(null);   // Result from calculation

  // ── Handle Calculate ───────────────────────────────────────
  const handleCalculate = () => {
    const result = calculateRiskScore(riskAnswers);
    if (!result) {
      alert('Please answer all questions!');
      return;
    }
    setRiskResult(result);
  };

  // ── Handle Retake ──────────────────────────────────────────
  const handleRetake = () => {
    setRiskAnswers({});
    setRiskResult(null);
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <View style={[styles.headerBlue, { backgroundColor: '#F59E0B' }]}>
        <TouchableOpacity onPress={() => setActiveTool(null)}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Risk Analyzer ⚠️</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollViewFull}>
        <View style={styles.calculatorContainer}>

          {/* ── Quiz Mode (before result) ── */}
          {!riskResult ? (
            <>
              <Text style={styles.quizTitle}>Answer these 5 questions 📝</Text>

              {questions.map((item) => (
                <View key={item.id} style={styles.questionCard}>
                  <Text style={styles.questionText}>
                    {item.id}. {item.q}
                  </Text>
                  {item.opts.map((opt, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.optionButton,
                        riskAnswers[item.id] === item.vals[idx] && styles.optionSelected,
                      ]}
                      onPress={() =>
                        setRiskAnswers({ ...riskAnswers, [item.id]: item.vals[idx] })
                      }
                    >
                      <Text
                        style={[
                          styles.optionText,
                          riskAnswers[item.id] === item.vals[idx] && styles.optionTextSelected,
                        ]}
                      >
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}

              <TouchableOpacity style={styles.calculateButton} onPress={handleCalculate}>
                <Text style={styles.calculateButtonText}>Get My Risk Profile 🚀</Text>
              </TouchableOpacity>
            </>
          ) : (
            /* ── Result Mode ── */
            <View style={styles.resultsCard}>
              <Text style={styles.resultsTitle}>Your Risk Profile ⚠️</Text>

              <View style={styles.riskProfileCard}>
                <Text style={styles.riskProfileName}>{riskResult.profile}</Text>
                <Text style={styles.riskProfileScore}>
                  Score: {riskResult.score}/25 ({riskResult.percentage.toFixed(0)}%)
                </Text>
              </View>

              {/* Visual score bar */}
              <View style={styles.scoreBar}>
                <View style={styles.scoreBarBg}>
                  <View
                    style={[
                      styles.scoreBarFill,
                      {
                        width: `${riskResult.percentage}%`,
                        backgroundColor:
                          riskResult.percentage <= 40
                            ? '#10B981'    // Green = conservative
                            : riskResult.percentage <= 70
                            ? '#F59E0B'    // Amber = moderate
                            : '#EF4444',   // Red = aggressive
                      },
                    ]}
                  />
                </View>
              </View>

              <Text style={styles.riskDescription}>{riskResult.description}</Text>

              <Text style={styles.verdictSubtitle}>✅ Recommended Funds:</Text>
              {riskResult.funds.map((fund, i) => (
                <Text key={i} style={styles.verdictPro}>• {fund}</Text>
              ))}

              <TouchableOpacity style={styles.backButton} onPress={handleRetake}>
                <Text style={styles.backButtonText}>← retake quiz</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
