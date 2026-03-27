import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, FlatList } from 'react-native';
import { ArrowLeft, Search, MessageCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../../theme/colors';

const StaffChatScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trò chuyện</Text>
        <TouchableOpacity style={styles.searchBtn}>
          <Search size={24} color="#637381" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.emptyWrap}>
          <View style={styles.iconCircle}>
            <MessageCircle size={48} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Hộp thư đến trống</Text>
          <Text style={styles.emptySubtitle}>
            Bạn chưa có cuộc trò chuyện nào. Khi khách hàng nhắn tin cho phòng ban của bạn, chúng sẽ xuất hiện ở đây.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F4F6F8'
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  searchBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyWrap: { alignItems: 'center', maxWidth: 320 },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#212B36',
    marginBottom: 12
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#637381',
    textAlign: 'center',
    lineHeight: 22
  }
});

export default StaffChatScreen;
