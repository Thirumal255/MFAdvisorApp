import { ChevronRight } from 'lucide-react-native';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles/appStyles';
import { formatPercentage } from '../utils/formatters';

/**
 * FUND CARD COMPONENT
 * Reusable fund list item
 */
export const FundCard = ({ fund, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.fundCard}
      onPress={() => onPress(fund)}
    >
      <View style={styles.fundCardContent}>
        <View style={styles.fundInfo}>
          <Text style={styles.fundName} numberOfLines={2}>
            {fund.fund_name || fund.name}
          </Text>
          <View style={styles.fundTags}>
            <View style={styles.tagBlue}>
              <Text style={styles.tagText}>
                {fund.category_display || fund.category}
              </Text>
            </View>
            {fund.risk && (
              <View style={styles.tagRisk}>
                <Text style={styles.tagText}>{fund.risk}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.fundReturn}>
          <Text style={styles.returnValue}>
            {fund.cagr ? formatPercentage(fund.cagr) : 'N/A'}
          </Text>
          <Text style={styles.returnLabel}>3Y CAGR</Text>
        </View>
      </View>
      <ChevronRight size={20} color="#7C3AED" />
    </TouchableOpacity>
  );
};