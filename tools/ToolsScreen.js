// ============================================================
// 📁 tools/ToolsScreen.js
// ============================================================
// WHAT THIS FILE DOES:
//   This is the "landing page" for the Tools section.
//   It shows a grid of tool cards (SIP, Goal, Returns, Risk, Tax, Expense, Compare).
//   When the user taps a card, it tells App.js which tool to open
//   by calling setActiveTool('sip'), setActiveTool('goal'), etc.
//
// WHAT IT REPLACES IN App.js:
//   Lines ~2177-2316 → the `if (screen === 'tools' && !activeTool)` block.
//
// HOW TO USE:
//   In App.js, replace the old block with:
//     import ToolsScreen from './tools/ToolsScreen';
//     if (screen === 'tools' && !activeTool) {
//       return <ToolsScreen setActiveTool={setActiveTool} screen={screen} setScreen={setScreen}
//                setSelectedFund={setSelectedFund} setSelectedTopic={setSelectedTopic} />;
//     }
// ============================================================

import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Navigation } from '../components/Navigation';
import { styles } from '../styles/appStyles';

export default function ToolsScreen({
  setActiveTool,       // Function → tells App.js which tool to open
  screen,              // String → current screen name (always 'tools' here)
  setScreen,           // Function → navigate to other screens
  setSelectedFund,     // Function → needed by Navigation component
  setSelectedTopic,    // Function → needed by Navigation component
}) {

  // ── Tool definitions ──────────────────────────────────────
  // Each object defines one tool card in the grid.
  // 'key' matches the activeTool value in App.js (e.g., 'sip', 'goal')
  // 'color' is the left border accent color
  const tools = [
    {
      key: 'sip',
      emoji: '🧮',
      title: 'SIP Calculator',
      subtitle: 'monthly investment returns',
      color: '#3B82F6',       // Blue
    },
    {
      key: 'goal',
      emoji: '🎯',
      title: 'Goal Planner',
      subtitle: 'plan for your dreams',
      color: '#8B5CF6',       // Purple
    },
    {
      key: 'returns',
      emoji: '📈',
      title: 'Returns Calculator',
      subtitle: 'lumpsum vs SIP',
      color: '#10B981',       // Green
    },
    {
      key: 'risk',
      emoji: '⚠️',
      title: 'Risk Analyzer',
      subtitle: 'check portfolio risk',
      color: '#F59E0B',       // Amber
    },
    {
      key: 'tax',
      emoji: '💸',
      title: 'Tax Optimizer',
      subtitle: 'save on taxes',
      color: '#EF4444',       // Red
    },
    {
      key: 'expense',
      emoji: '💰',
      title: 'Expense Impact',
      subtitle: 'Direct vs Regular plans',
      color: '#10B981',       // Green
    },
    {
      key: 'compare',
      emoji: '⚖️',
      title: 'Fund Compare',
      subtitle: 'side-by-side analysis',
      color: '#EC4899',       // Pink
    },
  ];

  // ── Render ─────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Header bar */}
      <View style={styles.headerOrange}>
        <Text style={styles.pageTitle}>Tools ⚡</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.toolsContainer}>

          {/* Loop through tool definitions and render a card for each */}
          {tools.map((tool) => (
            <TouchableOpacity
              key={tool.key}
              style={[styles.toolCard, { borderLeftColor: tool.color }]}
              onPress={() => setActiveTool(tool.key)}   // ← Tells App.js to open this tool
            >
              <View style={styles.toolContent}>
                <View style={[styles.toolIcon, { backgroundColor: `${tool.color}20` }]}>
                  <Text style={styles.toolEmoji}>{tool.emoji}</Text>
                </View>
                <View style={styles.toolInfo}>
                  <Text style={styles.toolTitle}>{tool.title}</Text>
                  <Text style={styles.toolSubtitle}>{tool.subtitle}</Text>
                </View>
              </View>
              <ChevronRight size={24} color="#6B7280" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Disclaimer at the bottom */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            💡 These are educational tools only. Results are indicative and not guaranteed.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom navigation bar */}
      <Navigation
        screen={screen}
        setScreen={setScreen}
        setSelectedFund={setSelectedFund}
        setActiveTool={setActiveTool}
        setSelectedTopic={setSelectedTopic}
      />
    </View>
  );
}
