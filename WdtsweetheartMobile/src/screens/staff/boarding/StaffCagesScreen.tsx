import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, LayoutGrid } from 'lucide-react-native';

const StaffCagesScreen = () => {
    const navigation = useNavigation();
    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.title}>Chuồng nội trú</Text>
                <View style={{ width: 24 }} />
            </View>
            <View style={styles.content}>
                <LayoutGrid size={64} color="#919EAB" strokeWidth={1} />
                <Text style={styles.emptyText}>Trạng thái các chuồng đang được cập nhật</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F4F6F8' },
    title: { fontSize: 18, fontWeight: '800', color: '#111827' },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
    emptyText: { marginTop: 16, fontSize: 15, color: '#637381', textAlign: 'center', fontWeight: '600' }
});

export default StaffCagesScreen;
