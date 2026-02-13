// ============================================================
// 📁 screens/LearnScreen.js
// ============================================================
// WHAT THIS FILE DOES:
//   The Learn section with 4 tabs: Beginner, Advanced, Tips, Glossary.
//   Beginner & Advanced show topic cards that open article views.
//   Tips shows numbered tip cards.
//   Glossary shows term + definition cards.
//   Also handles the article detail view when a topic is selected.
//
// WHAT IT REPLACES IN App.js:
//   Lines ~4083-4224 → both `if (screen === 'learn' && !selectedTopic)`
//                       AND `if (screen === 'learn' && selectedTopic)` blocks.
//
// HOW TO USE:
//   In App.js:
//     import LearnScreen from './screens/LearnScreen';
//     if (screen === 'learn') {
//       return <LearnScreen screen={screen} setScreen={setScreen}
//                setSelectedFund={setSelectedFund} setActiveTool={setActiveTool}
//                setSelectedTopic={setSelectedTopic} />;
//     }
// ============================================================

import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Navigation } from '../components/Navigation';
import { learnContent } from '../config/learnContent';
import { styles } from '../styles/appStyles';

export default function LearnScreen({
  screen,
  setScreen,
  setSelectedFund,
  setActiveTool,
  setSelectedTopic: setParentSelectedTopic,  // Parent still needs this for nav
}) {

  // ── Local state ────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('beginner');
  const [selectedTopic, setSelectedTopic] = useState(null);

  // ── Tab definitions ────────────────────────────────────────
  const tabs = [
    { key: 'beginner', label: 'Beginner' },
    { key: 'advanced', label: 'Advanced' },
    { key: 'tips', label: 'Tips' },
    { key: 'glossary', label: 'Glossary' },
  ];

  // ── Get content for active tab ─────────────────────────────
  const currentContent = activeTab === 'tips' ? learnContent.tips :
                         activeTab === 'glossary' ? learnContent.glossary :
                         activeTab === 'advanced' ? learnContent.advanced :
                         learnContent.beginner;

  // ── ARTICLE VIEW (when a topic is selected) ────────────────
  if (selectedTopic) {
    return (
      <View style={styles.container}>
        <View style={[styles.headerBlue, { backgroundColor: '#8B5CF6' }]}>
          <TouchableOpacity onPress={() => setSelectedTopic(null)}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.pageTitle} numberOfLines={1}>
            {selectedTopic.icon} {selectedTopic.title}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.scrollViewFull}>
          <View style={styles.articleContainer}>
            <Text style={styles.articleTitle}>{selectedTopic.title}</Text>
            <Text style={styles.articleSubtitle}>{selectedTopic.subtitle}</Text>
            <Text style={styles.articleContent}>{selectedTopic.content}</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── MAIN LEARN SCREEN (tab list view) ──────────────────────
  return (
    <View style={styles.container}>
      <View style={[styles.headerBlue, { backgroundColor: '#8B5CF6' }]}>
        <Text style={styles.pageTitle}>Learn 📚</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <View style={styles.learnContainer}>

          {/* Topics List (Beginner & Advanced) */}
          {(activeTab === 'beginner' || activeTab === 'advanced') && (
            <>
              <Text style={styles.learnSectionTitle}>
                {activeTab === 'beginner' ? '🌱 Start Here' : '🚀 Level Up'}
              </Text>
              {currentContent.map((topic) => (
                <TouchableOpacity
                  key={topic.id}
                  style={styles.topicCard}
                  onPress={() => setSelectedTopic(topic)}
                >
                  <View style={styles.topicContent}>
                    <Text style={styles.topicIcon}>{topic.icon}</Text>
                    <View style={styles.topicInfo}>
                      <Text style={styles.topicTitle}>{topic.title}</Text>
                      <Text style={styles.topicSubtitle}>{topic.subtitle}</Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color="#8B5CF6" />
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* Tips */}
          {activeTab === 'tips' && (
            <>
              <Text style={styles.learnSectionTitle}>💡 Daily Wisdom</Text>
              {currentContent.map((tip, index) => (
                <View key={index} style={styles.tipCard}>
                  <Text style={styles.tipNumber}>Tip {index + 1}</Text>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </>
          )}

          {/* Glossary */}
          {activeTab === 'glossary' && (
            <>
              <Text style={styles.learnSectionTitle}>📖 Quick Reference</Text>
              {currentContent.map((item, index) => (
                <View key={index} style={styles.glossaryCard}>
                  <Text style={styles.glossaryTerm}>{item.term}</Text>
                  <Text style={styles.glossaryDefinition}>{item.definition}</Text>
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>

      <Navigation screen={screen} setScreen={setScreen}
        setSelectedFund={setSelectedFund} setActiveTool={setActiveTool}
        setSelectedTopic={setParentSelectedTopic} />
    </View>
  );
}
