import { Bell, ChevronRight, Flame, MessageSquare, Search, Trophy, Upload } from 'lucide-react-native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Navigation } from '../components/Navigation';
import { styles } from '../styles/appStyles';

export default function HomeScreen({ setScreen, setPreviousScreen, setSelectedFund, setActiveTool, setSelectedTopic }) {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>hey bestie 👋</Text>
            <Text style={styles.userName}>Investor</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={18} color="#fff" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        <View style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <View style={styles.streakTitle}>
              <Flame size={24} color="#FB923C" />
              <Text style={styles.streakText}>7 Day Streak! 🔥</Text>
            </View>
            <Trophy size={32} color="#FBBF24" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>what u wanna do?</Text>
          
          <TouchableOpacity 
            style={[styles.actionCard, styles.purpleGradient]}
            onPress={() => {
              setPreviousScreen && setPreviousScreen('home');
              setScreen('check');
              setSelectedFund(null);
            }}
          >
            <View style={styles.actionContent}>
              <View style={styles.actionLeft}>
                <View style={styles.actionIcon}>
                  <Search size={24} color="#fff" />
                </View>
                <View>
                  <Text style={styles.actionTitle}>Search For a Fund</Text>
                  <Text style={styles.actionSubtitle}>is it fire? 🔍</Text>
                </View>
              </View>
              <ChevronRight size={24} color="#fff" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, styles.orangeGradient]}
            onPress={() => setScreen('advisor')}
          >
            <View style={styles.actionContent}>
              <View style={styles.actionLeft}>
                <View style={styles.actionIcon}>
                  <MessageSquare size={24} color="#fff" />
                </View>
                <View>
                  <Text style={styles.actionTitle}>Fresh Investment</Text>
                  <Text style={styles.actionSubtitle}>AI picks 4 u 🤖</Text>
                </View>
              </View>
              <ChevronRight size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 my investments</Text>
          
          <TouchableOpacity 
            style={[styles.actionCard, styles.greenGradient]}
            onPress={() => setScreen('analyzer')}
          >
            <View style={styles.actionContent}>
              <View style={styles.actionLeft}>
                <View style={styles.actionIcon}>
                  <Search size={24} color="#fff" />
                </View>
                <View>
                  <Text style={styles.actionTitle}>My Fund Analyzer</Text>
                  <Text style={styles.actionSubtitle}>find better funds 🎯</Text>
                </View>
              </View>
              <ChevronRight size={24} color="#fff" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, styles.blueGradient]}
            onPress={() => setScreen('import')}
          >
            <View style={styles.actionContent}>
              <View style={styles.actionLeft}>
                <View style={styles.actionIcon}>
                  <Upload size={24} color="#fff" />
                </View>
                <View>
                  <Text style={styles.actionTitle}>Import Portfolio</Text>
                  <Text style={styles.actionSubtitle}>upload excel ☕</Text>
                </View>
              </View>
              <ChevronRight size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>market vibes</Text>
          <View style={styles.marketGrid}>
            <View style={[styles.marketCard, styles.greenCard]}>
              <Text style={styles.marketLabel}>📈 Nifty 50</Text>
              <Text style={styles.marketValue}>23,456</Text>
              <Text style={styles.marketChange}>+1.2%</Text>
            </View>
            <View style={[styles.marketCard, styles.blueCard]}>
              <Text style={styles.marketLabel}>💹 Sensex</Text>
              <Text style={styles.marketValue}>77,234</Text>
              <Text style={styles.marketChange}>+0.8%</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      
      <Navigation 
        screen="home"
        setScreen={setScreen}
        setSelectedFund={setSelectedFund}
        setActiveTool={setActiveTool}
        setSelectedTopic={setSelectedTopic}
      />
    </View>
  );
}