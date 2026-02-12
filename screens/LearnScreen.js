import { ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Navigation } from '../components/Navigation';
import { learnContent } from '../config/learnContent';
import { styles } from '../styles/appStyles';

export default function LearnScreen({ setScreen, setSelectedTopic, setSelectedFund, setActiveTool }) {
  const [activeTab, setActiveTab] = useState('beginner');

  const currentContent = activeTab === 'tips' ? learnContent.tips : 
                         activeTab === 'glossary' ? learnContent.glossary : 
                         activeTab === 'advanced' ? learnContent.advanced : 
                         learnContent.beginner;

  return (
    <View style={styles.container}>
      <View style={[styles.headerBlue, { backgroundColor: '#8B5CF6' }]}>
        <Text style={styles.pageTitle}>Learn 📚</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'beginner' && styles.tabButtonActive]}
            onPress={() => setActiveTab('beginner')}
          >
            <Text style={[styles.tabText, activeTab === 'beginner' && styles.tabTextActive]}>
              Beginner
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'advanced' && styles.tabButtonActive]}
            onPress={() => setActiveTab('advanced')}
          >
            <Text style={[styles.tabText, activeTab === 'advanced' && styles.tabTextActive]}>
              Advanced
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'tips' && styles.tabButtonActive]}
            onPress={() => setActiveTab('tips')}
          >
            <Text style={[styles.tabText, activeTab === 'tips' && styles.tabTextActive]}>
              Tips
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'glossary' && styles.tabButtonActive]}
            onPress={() => setActiveTab('glossary')}
          >
            <Text style={[styles.tabText, activeTab === 'glossary' && styles.tabTextActive]}>
              Glossary
            </Text>
          </TouchableOpacity>
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
      
      <Navigation 
        screen="learn"
        setScreen={setScreen}
        setSelectedFund={setSelectedFund}
        setActiveTool={setActiveTool}
        setSelectedTopic={setSelectedTopic}
      />
    </View>
  );
}
