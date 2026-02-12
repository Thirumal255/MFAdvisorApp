import { Text, View } from 'react-native';
import { styles } from '../styles/appStyles';
import { formatPercentage } from '../utils/formatters';

/**
 * METRIC BOX COMPONENT
 * Display a single metric with label and value
 */
export const MetricBox = ({ label, value, isPercentage = false, color = '#22C55E' }) => {
  const displayValue = isPercentage && value != null 
    ? formatPercentage(value) 
    : (value != null ? value : 'N/A');

  return (
    <View style={styles.metricBox}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color }]}>
        {displayValue}
      </Text>
    </View>
  );
};