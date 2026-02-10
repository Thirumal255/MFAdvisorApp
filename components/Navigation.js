import { BookOpen, Calculator, Home, Search, Trophy } from 'lucide-react-native';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles/appStyles';

export const Navigation = ({ screen, setScreen, setSelectedFund, setActiveTool, setSelectedTopic }) => (
  <View style={styles.bottomNav}>
    <TouchableOpacity
      style={styles.navItem}
      onPress={() => {
        setScreen('home');
        setActiveTool(null);
      }}
    >
      <Home color={screen === 'home' ? '#A855F7' : '#6B7280'} size={24} />
      <Text style={[styles.navLabel, screen === 'home' && styles.navLabelActive]}>Home</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.navItem} onPress={() => setScreen('topFunds')}>
      <Trophy color={screen === 'topFunds' ? '#A855F7' : '#6B7280'} size={24} />
      <Text style={[styles.navLabel, screen === 'topFunds' && styles.navLabelActive]}>Top</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.navItem}
      onPress={() => {
        setScreen('check');
        setSelectedFund(null);
      }}
    >
      <Search color={screen === 'check' ? '#A855F7' : '#6B7280'} size={24} />
      <Text style={[styles.navLabel, screen === 'check' && styles.navLabelActive]}>Check</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.navItem}
      onPress={() => {
        setScreen('tools');
        setActiveTool(null);
      }}
    >
      <Calculator color={screen === 'tools' ? '#A855F7' : '#6B7280'} size={24} />
      <Text style={[styles.navLabel, screen === 'tools' && styles.navLabelActive]}>Tools</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.navItem}
      onPress={() => {
        setScreen('learn');
        setSelectedTopic(null);
      }}
    >
      <BookOpen color={screen === 'learn' ? '#A855F7' : '#6B7280'} size={24} />
      <Text style={[styles.navLabel, screen === 'learn' && styles.navLabelActive]}>Learn</Text>
    </TouchableOpacity>
  </View>
);