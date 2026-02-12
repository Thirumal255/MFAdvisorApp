import { ArrowLeft } from 'lucide-react-native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles/appStyles';

export default function ArticleScreen({ topic, setSelectedTopic }) {
  return (
    <View style={styles.container}>
      <View style={[styles.headerBlue, { backgroundColor: '#8B5CF6' }]}>
        <TouchableOpacity onPress={() => setSelectedTopic(null)}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.pageTitle} numberOfLines={1}>
          {topic.icon} {topic.title}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollViewFull}>
        <View style={styles.articleContainer}>
          <Text style={styles.articleTitle}>{topic.title}</Text>
          <Text style={styles.articleSubtitle}>{topic.subtitle}</Text>
          <Text style={styles.articleContent}>{topic.content}</Text>
        </View>
      </ScrollView>
    </View>
  );
}