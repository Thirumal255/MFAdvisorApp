import { Text, View } from 'react-native';
import { Navigation } from '../components/Navigation';
import { styles } from '../styles/appStyles';

export default function AdvisorScreen({ setScreen, setSelectedFund, setActiveTool, setSelectedTopic }) {
  return (
    <View style={styles.container}>
      <View style={styles.comingSoonContainer}>
        <Text style={styles.comingSoon}>AI Advisor 🤖</Text>
        <Text style={styles.comingSoonSub}>coming soon!</Text>
      </View>
      <Navigation 
        screen="advisor"
        setScreen={setScreen}
        setSelectedFund={setSelectedFund}
        setActiveTool={setActiveTool}
        setSelectedTopic={setSelectedTopic}
      />
    </View>
  );
}