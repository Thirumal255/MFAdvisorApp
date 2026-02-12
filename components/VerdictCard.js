import { Text, View } from 'react-native';
import { styles } from '../styles/appStyles';

/**
 * VERDICT CARD COMPONENT
 * Display AI verdict with pros and cons
 */
export const VerdictCard = ({ verdict, pros = [], cons = [] }) => {
  return (
    <View style={styles.verdictCard}>
      <Text style={styles.verdictTitle}>AI Verdict</Text>
      <Text style={styles.verdictText}>{verdict}</Text>
      
      {pros.length > 0 && (
        <>
          <Text style={styles.verdictSubtitle}>Pros</Text>
          {pros.map((pro, index) => (
            <Text key={index} style={styles.verdictPro}>
              ✓ {pro}
            </Text>
          ))}
        </>
      )}
      
      {cons.length > 0 && (
        <>
          <Text style={styles.verdictSubtitle}>Cons</Text>
          {cons.map((con, index) => (
            <Text key={index} style={styles.verdictCon}>
              ✗ {con}
            </Text>
          ))}
        </>
      )}
    </View>
  );
};