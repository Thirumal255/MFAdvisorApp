import { BookOpen, Calculator, Home, Trophy } from 'lucide-react-native';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles/appStyles';


export const Navigation = ({ screen, setScreen, setSelectedFund, setActiveTool, setSelectedTopic }) => (
  <View style={styles.bottomNav}>
    {/* HOME */}
    <TouchableOpacity
      style={styles.navItem}
      onPress={() => {
        setScreen('home');
        setActiveTool(null);
      }}
    >
      <Home color={screen === 'home' ? '#A855F7' : '#6B7280'} size={22} />
      <Text style={[styles.navLabel, screen === 'home' && styles.navLabelActive]}>Home</Text>
    </TouchableOpacity>

    {/* TOP FUNDS */}
    <TouchableOpacity style={styles.navItem} onPress={() => setScreen('topFunds')}>
      <Trophy color={screen === 'topFunds' ? '#A855F7' : '#6B7280'} size={22} />
      <Text style={[styles.navLabel, screen === 'topFunds' && styles.navLabelActive]}>Top</Text>
    </TouchableOpacity>

    
    {/* TOOLS */}
    <TouchableOpacity
      style={styles.navItem}
      onPress={() => {
        setScreen('tools');
        setActiveTool(null);
      }}
    >
      <Calculator color={screen === 'tools' ? '#A855F7' : '#6B7280'} size={22} />
      <Text style={[styles.navLabel, screen === 'tools' && styles.navLabelActive]}>Tools</Text>
    </TouchableOpacity>

    {/* LEARN */}
    <TouchableOpacity
      style={styles.navItem}
      onPress={() => {
        setScreen('learn');
        setSelectedTopic(null);
      }}
    >
      <BookOpen color={screen === 'learn' ? '#A855F7' : '#6B7280'} size={22} />
      <Text style={[styles.navLabel, screen === 'learn' && styles.navLabelActive]}>Learn</Text>
    </TouchableOpacity>
  </View>
);