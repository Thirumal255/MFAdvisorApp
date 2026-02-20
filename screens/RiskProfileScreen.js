/**
 * ============================================================
 * RISK PROFILE ASSESSMENT SCREEN - Fixed with null safety
 * ============================================================
 * FILE: screens/RiskProfileScreen.js
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { ArrowLeft, CheckCircle, ChevronRight } from 'lucide-react-native';

// ============================================================
// QUESTIONS - Hardcoded (no API dependency)
// ============================================================
const QUESTIONS = [
  {
    id: 1,
    question: "What is your age group?",
    options: [
      { text: "Under 30", score: 5 },
      { text: "30-45", score: 4 },
      { text: "45-55", score: 3 },
      { text: "55-65", score: 2 },
      { text: "Above 65", score: 1 }
    ]
  },
  {
    id: 2,
    question: "What is your investment horizon?",
    options: [
      { text: "Less than 1 year", score: 1 },
      { text: "1-3 years", score: 2 },
      { text: "3-5 years", score: 3 },
      { text: "5-10 years", score: 4 },
      { text: "More than 10 years", score: 5 }
    ]
  },
  {
    id: 3,
    question: "What is your primary investment goal?",
    options: [
      { text: "Preserve capital", score: 1 },
      { text: "Generate regular income", score: 2 },
      { text: "Balance growth & income", score: 3 },
      { text: "Long-term wealth creation", score: 4 },
      { text: "Aggressive growth", score: 5 }
    ]
  },
  {
    id: 4,
    question: "How would you react if your investment dropped 20% in a month?",
    options: [
      { text: "Sell everything immediately", score: 1 },
      { text: "Sell some to reduce risk", score: 2 },
      { text: "Hold and wait", score: 3 },
      { text: "Buy more at lower prices", score: 4 },
      { text: "Significantly increase investment", score: 5 }
    ]
  },
  {
    id: 5,
    question: "What percentage of your monthly income can you invest?",
    options: [
      { text: "Less than 10%", score: 1 },
      { text: "10-20%", score: 2 },
      { text: "20-30%", score: 3 },
      { text: "30-40%", score: 4 },
      { text: "More than 40%", score: 5 }
    ]
  },
  {
    id: 6,
    question: "How much investment experience do you have?",
    options: [
      { text: "None - I'm new to investing", score: 1 },
      { text: "Basic - FDs and savings only", score: 2 },
      { text: "Moderate - Some mutual funds", score: 3 },
      { text: "Good - Stocks and MFs", score: 4 },
      { text: "Expert - Various instruments", score: 5 }
    ]
  }
];

// ============================================================
// RISK CATEGORIES
// ============================================================
const RISK_CATEGORIES = {
  conservative: {
    name: "Conservative",
    color: "#10B981",
    emoji: "🛡️",
    description: "Focus on capital preservation with minimal risk",
    allocation: { debt: 80, equity: 10, gold: 10 },
    suitable: ["Liquid Funds", "Ultra Short Duration", "Banking & PSU Debt", "Corporate Bond Funds"]
  },
  moderatelyConservative: {
    name: "Moderately Conservative",
    color: "#34D399",
    emoji: "🌱",
    description: "Some growth with limited downside risk",
    allocation: { debt: 65, equity: 25, gold: 10 },
    suitable: ["Conservative Hybrid", "Short Duration Debt", "Dynamic Bond Funds", "Large Cap Funds"]
  },
  moderate: {
    name: "Moderate",
    color: "#F59E0B",
    emoji: "⚖️",
    description: "Balanced approach to growth and safety",
    allocation: { debt: 45, equity: 45, gold: 10 },
    suitable: ["Balanced Advantage", "Aggressive Hybrid", "Large & Mid Cap", "Multi Cap Funds"]
  },
  moderatelyAggressive: {
    name: "Moderately Aggressive",
    color: "#F97316",
    emoji: "📈",
    description: "Higher growth with tolerance for volatility",
    allocation: { debt: 25, equity: 65, gold: 10 },
    suitable: ["Flexi Cap Funds", "Mid Cap Funds", "Focused Funds", "Sectoral Funds"]
  },
  aggressive: {
    name: "Aggressive",
    color: "#EF4444",
    emoji: "🚀",
    description: "Maximum growth potential with high risk tolerance",
    allocation: { debt: 10, equity: 85, gold: 5 },
    suitable: ["Small Cap Funds", "Sectoral/Thematic", "International Funds", "Momentum Funds"]
  }
};

// ============================================================
// CALCULATE RISK PROFILE FROM ANSWERS
// ============================================================
const calculateProfile = (answers) => {
  let totalScore = 0;
  let maxScore = 0;
  
  QUESTIONS.forEach((q, idx) => {
    const answerIdx = answers[idx];
    if (answerIdx !== undefined && q.options && q.options[answerIdx]) {
      totalScore += q.options[answerIdx].score;
    }
    if (q.options) {
      maxScore += Math.max(...q.options.map(o => o.score));
    }
  });
  
  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 50;
  
  let category;
  if (percentage <= 25) category = 'conservative';
  else if (percentage <= 40) category = 'moderatelyConservative';
  else if (percentage <= 60) category = 'moderate';
  else if (percentage <= 80) category = 'moderatelyAggressive';
  else category = 'aggressive';
  
  return {
    score: totalScore,
    maxScore,
    percentage: Math.round(percentage),
    category,
    ...RISK_CATEGORIES[category]
  };
};

// ============================================================
// MAIN SCREEN COMPONENT
// ============================================================
export default function RiskProfileScreen({ navigation }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Get current question safely
  const currentQ = QUESTIONS[currentQuestion];
  const selectedAnswer = answers[currentQuestion];
  const allAnswered = Object.keys(answers).length === QUESTIONS.length;
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;

  // Handle answer selection
  const selectAnswer = (optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: optionIndex
    }));
  };

  // Navigate to next question
  const nextQuestion = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  // Navigate to previous question
  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  // Calculate and show result
  const showResult = () => {
    setSubmitting(true);
    // Small delay for UX
    setTimeout(() => {
      const profileResult = calculateProfile(answers);
      setResult(profileResult);
      setSubmitting(false);
    }, 500);
  };

  // Handle back navigation
  const handleBack = () => {
    if (result) {
      setResult(null);
    } else if (currentQuestion > 0) {
      prevQuestion();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  // ============================================================
  // RESULT SCREEN
  // ============================================================
  if (result) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Risk Profile</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Result Card */}
          <View style={[styles.resultCard, { borderColor: result.color }]}>
            <Text style={styles.resultEmoji}>{result.emoji}</Text>
            <Text style={[styles.resultTitle, { color: result.color }]}>{result.name}</Text>
            <Text style={styles.resultDescription}>{result.description}</Text>
            
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Risk Score</Text>
              <Text style={[styles.scoreValue, { color: result.color }]}>{result.percentage}%</Text>
            </View>
          </View>
          
          {/* Recommended Allocation */}
          <Text style={styles.sectionTitle}>📊 Recommended Allocation</Text>
          <View style={styles.allocationCard}>
            <View style={styles.allocationRow}>
              <View style={[styles.allocationDot, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.allocationLabel}>Debt/Fixed Income</Text>
              <Text style={styles.allocationValue}>{result.allocation?.debt || 0}%</Text>
            </View>
            <View style={styles.allocationRow}>
              <View style={[styles.allocationDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.allocationLabel}>Equity</Text>
              <Text style={styles.allocationValue}>{result.allocation?.equity || 0}%</Text>
            </View>
            <View style={styles.allocationRow}>
              <View style={[styles.allocationDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.allocationLabel}>Gold/Others</Text>
              <Text style={styles.allocationValue}>{result.allocation?.gold || 0}%</Text>
            </View>
          </View>
          
          {/* Suitable Fund Categories */}
          <Text style={styles.sectionTitle}>✅ Suitable Fund Categories</Text>
          <View style={styles.suitableCard}>
            {(result.suitable || []).map((fund, idx) => (
              <View key={idx} style={styles.suitableRow}>
                <CheckCircle size={16} color="#10B981" />
                <Text style={styles.suitableText}>{fund}</Text>
              </View>
            ))}
          </View>
          
          {/* Action Buttons */}
          <TouchableOpacity 
            style={styles.exploreButton}
            onPress={() => navigation?.goBack?.()}
          >
            <Text style={styles.exploreButtonText}>Done</Text>
            <ChevronRight size={20} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.retakeButton}
            onPress={() => {
              setResult(null);
              setAnswers({});
              setCurrentQuestion(0);
            }}
          >
            <Text style={styles.retakeButtonText}>Retake Assessment</Text>
          </TouchableOpacity>
          
          <View style={{ height: 50 }} />
        </ScrollView>
      </View>
    );
  }

  // ============================================================
  // QUESTION SCREEN
  // ============================================================
  
  // Safety check - should never happen but just in case
  if (!currentQ || !currentQ.options) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.backButton}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Risk Profile</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Error loading questions</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => {
              setCurrentQuestion(0);
              setAnswers({});
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Risk Assessment</Text>
        <View style={{ width: 40 }} />
      </View>
      
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Question {currentQuestion + 1} of {QUESTIONS.length}
        </Text>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Question */}
        <Text style={styles.questionText}>{currentQ.question}</Text>
        
        {/* Options */}
        {currentQ.options.map((option, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.optionButton,
              selectedAnswer === idx && styles.optionButtonSelected
            ]}
            onPress={() => selectAnswer(idx)}
          >
            <View style={[
              styles.optionRadio,
              selectedAnswer === idx && styles.optionRadioSelected
            ]}>
              {selectedAnswer === idx && <View style={styles.optionRadioInner} />}
            </View>
            <Text style={[
              styles.optionText,
              selectedAnswer === idx && styles.optionTextSelected
            ]}>
              {option.text}
            </Text>
          </TouchableOpacity>
        ))}
        
        {/* Navigation */}
        <View style={styles.navContainer}>
          {currentQuestion > 0 && (
            <TouchableOpacity style={styles.prevButton} onPress={prevQuestion}>
              <ArrowLeft size={20} color="#9CA3AF" />
              <Text style={styles.prevButtonText}>Previous</Text>
            </TouchableOpacity>
          )}
          
          <View style={{ flex: 1 }} />
          
          {currentQuestion < QUESTIONS.length - 1 ? (
            <TouchableOpacity 
              style={[styles.nextButton, selectedAnswer === undefined && styles.nextButtonDisabled]}
              onPress={nextQuestion}
              disabled={selectedAnswer === undefined}
            >
              <Text style={styles.nextButtonText}>Next</Text>
              <ChevronRight size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.submitButton, !allAnswered && styles.submitButtonDisabled]}
              onPress={showResult}
              disabled={!allAnswered || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>See Results</Text>
                  <CheckCircle size={20} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
        
        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F14',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#1A1A24',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A3C',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#9CA3AF',
    fontSize: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#A78BFA',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  progressContainer: {
    padding: 16,
    backgroundColor: '#1A1A24',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#2A2A3C',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#A78BFA',
    borderRadius: 3,
  },
  progressText: {
    marginTop: 8,
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 24,
    lineHeight: 28,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A24',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#2A2A3C',
  },
  optionButtonSelected: {
    borderColor: '#A78BFA',
    backgroundColor: '#A78BFA15',
  },
  optionRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#6B7280',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionRadioSelected: {
    borderColor: '#A78BFA',
  },
  optionRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#A78BFA',
  },
  optionText: {
    fontSize: 16,
    color: '#D1D5DB',
    flex: 1,
  },
  optionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  navContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  prevButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  prevButtonText: {
    color: '#9CA3AF',
    marginLeft: 4,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A78BFA',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  nextButtonDisabled: {
    backgroundColor: '#6B7280',
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: 4,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  submitButtonDisabled: {
    backgroundColor: '#6B7280',
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: 8,
  },
  resultCard: {
    backgroundColor: '#1A1A24',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
  },
  resultEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  resultDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 20,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  allocationCard: {
    backgroundColor: '#1A1A24',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  allocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  allocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  allocationLabel: {
    flex: 1,
    color: '#D1D5DB',
  },
  allocationValue: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  suitableCard: {
    backgroundColor: '#1A1A24',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  suitableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  suitableText: {
    color: '#D1D5DB',
    marginLeft: 10,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A78BFA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: 8,
  },
  retakeButton: {
    alignItems: 'center',
    padding: 16,
  },
  retakeButtonText: {
    color: '#9CA3AF',
  },
});
