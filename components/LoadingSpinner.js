import { ActivityIndicator, Text, View } from 'react-native';
import { styles } from '../styles/appStyles';

/**
 * LOADING SPINNER COMPONENT
 * Reusable loading indicator
 */
export const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#7C3AED" />
      <Text style={styles.loadingText}>{text}</Text>
    </View>
  );
};