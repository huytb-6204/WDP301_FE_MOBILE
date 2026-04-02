import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { ArrowLeft, Smartphone } from 'lucide-react-native';
import type { StaffStackParamList } from '../../../navigation/StaffNavigator';

type FeatureInfoRoute = RouteProp<StaffStackParamList, 'StaffFeatureInfo'>;

const StaffFeatureInfoScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<FeatureInfoRoute>();
  const { title, description } = route.params;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Smartphone size={34} color="#0C53B7" />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{description}</Text>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('StaffHome')}>
          <Text style={styles.actionText}>Về trang nhân viên</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  placeholder: { width: 40, height: 40 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: '#E8F1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 18,
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
  },
  message: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  actionBtn: {
    marginTop: 20,
    minWidth: 180,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#0C53B7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default StaffFeatureInfoScreen;
