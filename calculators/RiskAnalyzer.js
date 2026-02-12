import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { ArrowLeft, Shield } from 'lucide-react-native';
import { styles } from '../styles/appStyles';
import { Navigation } from '../components/Navigation';

export default function RiskAnalyzer({ setActiveTool, setScreen, setSelectedFund, setSelectedTopic }) {
  const [riskAnswers, setRiskAnswers] = useState({});
  const [riskResult, setRiskResult] = useState(null);

  const questions = [
    {
      id: 1,
      question: "What is your investment time horizon?",
      options: [
        { text: "Less than 1 year", score: 1 },
        { text: "1-3 years", score: 2 },
        { text: "3-5 years", score: 3 },
        { text: "5-10 years", score: 4 },
        { text: "More than 10 years", score: 5 }
      ]
    },
    {
      id: 2,
      question: "How would you react to a 20% drop in your portfolio?",
      options: [
        { text: "Panic and sell everything", score: 1 },
        { text: "Worried, might sell some", score: 2 },
        { text: "Stay calm, do nothing", score: 3 },
        { text: "Hold and wait for recovery", score: 4 },
        { text: "Buy more at lower prices!", score: 5 }
      ]
    },
    {
      id: 3,
      question: "What's your primary investment goal?",
      options: [
        { text: "Capital preservation", score: 1 },
        { text: "Steady income", score: 2 },
        { text: "Balanced growth", score: 3 },
        { text: "High growth", score: 4 },
        { text: "Maximum returns", score: 5 }
      ]
    },
    {
      id: 4,
      question: "What percentage of income can you invest?",
      options: [
        { text: "Less than 10%", score: 1 },
        { text: "10-20%", score: 2 },
        { text: "20-30%", score: 3 },
        { text: "30-50%", score: 4 },
        { text: "More than 50%", score: 5 }
      ]
    },
    {
      id: 5,
      question: "Your investment knowledge level?",
      options: [
        { text: "Beginner", score: 1 },
        { text: "Basic understanding", score: 2 },
        { text: "Moderate knowledge", score: 3 },
        { text: "Good understanding", score: 4 },
        { text: "Expert investor", score: 5 }
      ]
    }
  ];

  const calculateRisk = () => {
    const answers = Object.values(riskAnswers);
    if (answers.length < 5) {
      alert('Please answer all questions!');
      return;
    }

    const score = answers.reduce((sum, val) => sum + val, 0);
    const percentage = (score / 25) * 100;

    let profile, description, funds;
    if (percentage <= 40) {
      profile = 'Conservative';
      description = 'You prefer safety over high returns. Focus on debt funds and balanced funds.';
      funds = ['Liquid Funds', 'Short Duration Funds', 'Corporate Bond Funds', 'Balanced Advantage Funds'];
    } else if (percentage <= 70) {
      profile = 'Moderate';
      description = 'You can handle moderate risk for better returns. Mix of equity and debt funds.';
      funds = ['Hybrid Funds', 'Large Cap Funds', 'Balanced Funds', 'Index Funds'];
    } else {
      profile = 'Aggressive';
      description = 'You can handle high risk for maximum returns. Focus on equity funds.';
      funds = ['Small Cap Funds', 'Mid Cap Funds', 'Sectoral Funds', 'Flexi Cap Funds'];
    }

    setRiskResult({ score, percentage, profile, description, funds });
  };

  const reset = () => {
    setRiskAnswers({});
    setRiskResult(null);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.headerBlue, { backgroundColor: '#DC2626' }]}>
        <TouchableOpacity onPress={() => setActiveTool(null)}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Risk Analyzer 🛡️</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {!riskResult ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Know Your Risk Profile</Text>

            {questions.map((q) => (
              <View key={q.id} style={styles.questionCard}>
                <Text style={styles.questionText}>{q.question}</Text>
                {q.options.map((option) => (
                  <TouchableOpacity
                    key={option.text}
                    style={[
                      styles.optionButton,
                      riskAnswers[q.id] === option.score && styles.optionButtonSelected
                    ]}
                    onPress={() => setRiskAnswers({ ...riskAnswers, [q.id]: option.score })}
                  >
                    <Text style={[
                      styles.optionText,
                      riskAnswers[q.id] === option.score && styles.optionTextSelected
                    ]}>
                      {option.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: '#DC2626' }]}
              onPress={calculateRisk}
            >
              <View style={styles.actionContent}>
                <View style={styles.actionLeft}>
                  <View style={styles.actionIcon}>
                    <Shield size={24} color="#fff" />
                  </View>
                  <Text style={styles.actionTitle}>Analyze My Risk Profile</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Risk Profile</Text>

            <View style={styles.resultCard}>
              <View style={styles.riskScoreContainer}>
                <Text style={styles.riskScore}>{Math.round(riskResult.percentage)}%</Text>
                <Text style={styles.riskProfile}>{riskResult.profile}</Text>
              </View>

              <Text style={styles.riskDescription}>{riskResult.description}</Text>

              <Text style={styles.recommendedTitle}>Recommended Fund Types:</Text>
              {riskResult.funds.map((fund, index) => (
                <View key={index} style={styles.recommendedItem}>
                  <Text style={styles.recommendedText}>• {fund}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.backButton} onPress={reset}>
              <Text style={styles.backButtonText}>Take Assessment Again</Text>
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
