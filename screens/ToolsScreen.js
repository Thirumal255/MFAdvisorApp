import { Calculator, GitCompare, Receipt, Shield, Target, TrendingUp } from 'lucide-react-native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Navigation } from '../components/Navigation';
import { styles } from '../styles/appStyles';

export default function ToolsScreen({ setScreen, setActiveTool, setSelectedFund, setSelectedTopic }) {
  const tools = [
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
      subtitle: 'Achieve financial goals',
      icon: Target,
      color: '#2563EB'
    },
    {
      id: 'returns',
      title: 'Returns Calculator',
      subtitle: 'Lumpsum vs SIP comparison',
      icon: TrendingUp,
      color: '#10B981'
    },
    {
      id: 'risk',
      title: 'Risk Analyzer',
      subtitle: 'Know your risk profile',
      icon: Shield,
      color: '#DC2626'
    },
    {
      id: 'tax',
      title: 'Tax Optimizer',
      subtitle: 'Save tax with ELSS',
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

    {
      id: 'expense',
      title: 'Expense Impact',
      subtitle: 'Direct vs Regular plans',
      icon: PiggyBank,
      color: '#059669'
    }
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.headerBlue, { backgroundColor: '#2563EB' }]}>
        <Text style={styles.pageTitle}>Tools 🛠️</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Calculators</Text>
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <TouchableOpacity
                key={tool.id}
                style={[styles.actionCard, { backgroundColor: tool.color }]}
                onPress={() => setActiveTool(tool.id)}
              >
                <View style={styles.actionContent}>
                  <View style={styles.actionLeft}>
                    <View style={styles.actionIcon}>
                      <Icon size={24} color="#fff" />
                    </View>
                    <View>
                      <Text style={styles.actionTitle}>{tool.title}</Text>
                      <Text style={styles.actionSubtitle}>{tool.subtitle}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
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
