/**
 * ============================================================
 * TOOLS SCREEN - Updated with Phase 4 AI Tools
 * ============================================================
 * FILE: tools/ToolsScreen.js
 * 
 * 3 Sections:
 * 1. 🤖 AI-Powered Analysis (Risk Profile, Portfolio Overlap)
 * 2. 🧮 Calculators (SIP, Goal, Returns, Expense)
 * 3. 📊 Fund Analysis (Risk Analyzer, Tax, Compare)
 */

import { 
  Calculator, 
  GitCompare, 
  Receipt, 
  Shield, 
  Target, 
  TrendingUp,
  PiggyBank,
  UserCheck,
  Layers,
  ChevronRight
} from 'lucide-react-native';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Navigation } from '../components/Navigation';
import { styles } from '../styles/appStyles';

export default function ToolsScreen({ 
  setScreen, 
  setActiveTool, 
  setSelectedFund, 
  setSelectedTopic,
  setPreviousScreen 
}) {
  
  // =====================================================
  // SECTION 1: AI-Powered Tools (Navigate to screens)
  // =====================================================
  const aiTools = [
    {
      id: 'riskProfile',
      title: 'Risk Profile Assessment',
      subtitle: 'Discover your SEBI risk category',
      icon: UserCheck,
      color: '#6C5CE7',
      badge: 'AI',
      isScreen: true,  // This navigates to a screen, not activeTool
    },
    {
      id: 'overlap',
      title: 'Portfolio Overlap',
      subtitle: 'Check stock overlap between funds',
      icon: Layers,
      color: '#00B894',
      badge: 'NEW',
      isScreen: true,
    },
  ];

  // =====================================================
  // SECTION 2: Calculators (Use activeTool)
  // =====================================================
  const calculatorTools = [
    {
      id: 'sip',
      title: 'SIP Calculator',
      subtitle: 'Plan monthly investments',
      icon: Calculator,
      color: '#7C3AED'
    },
    {
      id: 'goal',
      title: 'Goal Planner',
      subtitle: 'Plan for your dreams',
      icon: Target,
      color: '#2563EB'
    },
    {
      id: 'returns',
      title: 'Returns Calculator',
      subtitle: 'Lumpsum vs SIP',
      icon: TrendingUp,
      color: '#10B981'
    },
    {
      id: 'expense',
      title: 'Expense Impact',
      subtitle: 'Direct vs Regular plans',
      icon: PiggyBank,
      color: '#059669'
    }
  ];

  // =====================================================
  // SECTION 3: Analysis Tools (Use activeTool)
  // =====================================================
  const analysisTools = [
    {
      id: 'risk',
      title: 'Risk Analyzer',
      subtitle: 'Check portfolio risk',
      icon: Shield,
      color: '#DC2626'
    },
    {
      id: 'tax',
      title: 'Tax Optimizer',
      subtitle: 'Save on taxes',
      icon: Receipt,
      color: '#7C2D12'
    },
    {
      id: 'compare',
      title: 'Fund Compare',
      subtitle: 'Compare up to 3 funds',
      icon: GitCompare,
      color: '#EC4899'
    },
  ];

  // Handle tool press - navigate to screen or set active tool
  const handleToolPress = (tool) => {
    if (tool.isScreen) {
      // Navigate to a screen (Risk Profile, Overlap)
      if (setPreviousScreen) {
        setPreviousScreen('tools');
      }
      setScreen(tool.id);
    } else {
      // Open calculator tool
      setActiveTool(tool.id);
    }
  };

  // Render a tool card
  const renderToolCard = (tool, showBadge = false) => {
    const Icon = tool.icon;
    return (
      <TouchableOpacity
        key={tool.id}
        style={[styles.actionCard, { backgroundColor: tool.color }]}
        onPress={() => handleToolPress(tool)}
        activeOpacity={0.8}
      >
        <View style={styles.actionContent}>
          <View style={styles.actionLeft}>
            <View style={styles.actionIcon}>
              <Icon size={24} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={localStyles.titleRow}>
                <Text style={styles.actionTitle}>{tool.title}</Text>
                {tool.badge && (
                  <View style={localStyles.badge}>
                    <Text style={localStyles.badgeText}>{tool.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.actionSubtitle}>{tool.subtitle}</Text>
            </View>
          </View>
          <ChevronRight size={20} color="rgba(255,255,255,0.6)" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.headerBlue, { backgroundColor: '#2563EB' }]}>
        <Text style={styles.pageTitle}>Tools ⚡</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* ===== SECTION 1: AI-Powered ===== */}
        <View style={styles.section}>
          <View style={localStyles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: '#A78BFA' }]}>🤖 AI-Powered</Text>
            <View style={localStyles.newBadge}>
              <Text style={localStyles.newBadgeText}>NEW</Text>
            </View>
          </View>
          {aiTools.map((tool) => renderToolCard(tool, true))}
        </View>

        {/* ===== SECTION 2: Calculators ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧮 Calculators</Text>
          {calculatorTools.map((tool) => renderToolCard(tool))}
        </View>

        {/* ===== SECTION 3: Analysis ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Analysis</Text>
          {analysisTools.map((tool) => renderToolCard(tool))}
        </View>

        {/* Bottom padding for navigation */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
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

// ============================================================
// LOCAL STYLES (additions to appStyles)
// ============================================================
const localStyles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  newBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 10,
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});
