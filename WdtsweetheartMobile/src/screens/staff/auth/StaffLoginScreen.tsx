import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ChevronRight } from 'lucide-react-native';
import { colors } from '../../../theme/colors';
import { staffLogin } from '../../../services/api/staffAuth';
import { useAuth } from '../../../context/AuthContext';

import type { RootStackParamList } from '../../../navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const StaffLoginScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { updateUser } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
          Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ email và mật khẩu!');
          return;
        }
        
        setLoading(true);
        try {
          console.log('--- Attempting Staff Login ---');
          const staff = await staffLogin(email, password);
          console.log('Login Response Staff User:', staff);
          
          if (staff) {
            // Check if level is staff or admin
            const roles = (staff as any).roles || [];
            console.log('User Roles discovered:', roles);
            
            const isAuthorized = roles.some((r: any) => 
               (typeof r === 'string' && (r === 'staff' || r === 'admin')) ||
               (r && (r.level === 'staff' || r.level === 'admin')) ||
               (r && (r.name?.toLowerCase().includes('nhân viên') || r.name?.toLowerCase().includes('admin')))
            );
            
            if (!isAuthorized) {
              console.warn('Unauthorized staff login attempt');
              Alert.alert('Từ chối truy cập', 'Bạn không có quyền truy cập vào bảng điều khiển nhân viên. Cấp độ tài khoản của bạn không phù hợp.');
              setLoading(false);
              return;
            }

            // Success
            await updateUser({ ...staff, userType: 'staff' });
            console.log('Updated user context as staff');
            
            // Navigate and Reset
            navigation.reset({
                index: 0,
                routes: [{ name: 'StaffHome' }],
            });
          }
        } catch (error: any) {
          console.error('Staff Login Error', error);
          Alert.alert('Lỗi đăng nhập', error?.message || 'Email hoặc mật khẩu không chính xác!');
        } finally {
          setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="light-content" />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
                <ScrollView contentContainerStyle={styles.scroll}>
                    <View style={styles.hero}>
                        <Image 
                           source={require('../../../../assets/app_logo.png')} 
                           style={styles.logo} 
                           resizeMode="contain"
                        />
                        <View style={styles.badge}>
                            <ShieldCheck size={16} color="#fff" />
                            <Text style={styles.badgeText}>BẢNG ĐIỀU KHIỂN NHÂN VIÊN</Text>
                        </View>
                    </View>

                    <View style={styles.formContainer}>
                        <Text style={styles.title}>Chào mừng trở lại</Text>
                        <Text style={styles.subtitle}>Sử dụng tài khoản nội bộ để quản lý thú cưng và dịch vụ</Text>

                        <View style={styles.inputWrap}>
                           <Mail size={20} color="#919EAB" />
                           <TextInput 
                             placeholder="Email nhân viên" 
                             style={styles.input}
                             value={email}
                             onChangeText={setEmail}
                             autoCapitalize="none"
                             keyboardType="email-address"
                           />
                        </View>

                        <View style={styles.inputWrap}>
                           <Lock size={20} color="#919EAB" />
                           <TextInput 
                             placeholder="Mật khẩu" 
                             style={styles.input}
                             value={password}
                             onChangeText={setPassword}
                             secureTextEntry={!showPassword}
                           />
                           <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                               {showPassword ? <EyeOff size={20} color="#919EAB" /> : <Eye size={20} color="#919EAB" />}
                           </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.forgotBtn}>
                            <Text style={styles.forgotText}>Quên mật khẩu?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                           style={[styles.loginBtn, loading && styles.loginBtnLoading]} 
                           onPress={handleLogin}
                           disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : (
                                <>
                                    <Text style={styles.loginText}>Đăng nhập ngay</Text>
                                    <View style={styles.loginIconWrap}>
                                        <ChevronRight size={18} color="#000" />
                                    </View>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.clientBtn} onPress={() => navigation.goBack()}>
                            <Text style={styles.clientText}>Quay lại khu vực Khách hàng</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#111827' },
    flex: { flex: 1 },
    hero: { height: 280, alignItems: 'center', justifyContent: 'center' },
    logo: { width: 150, height: 150, marginBottom: 20 },
    badge: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#007B55', 
        paddingHorizontal: 12, 
        paddingVertical: 6, 
        borderRadius: 20 
    },
    badgeText: { marginLeft: 6, fontSize: 10, fontWeight: '800', color: '#fff' },
    formContainer: { 
        flex: 1, 
        backgroundColor: '#fff', 
        borderTopLeftRadius: 40, 
        borderTopRightRadius: 40, 
        paddingHorizontal: 32, 
        paddingTop: 40,
        paddingBottom: 40
    },
    title: { fontSize: 28, fontWeight: '900', color: '#111827' },
    subtitle: { fontSize: 15, color: '#637381', marginTop: 10, lineHeight: 22 },
    inputWrap: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#F9FAFB', 
        borderRadius: 18, 
        paddingHorizontal: 16, 
        height: 60, 
        marginTop: 24,
        borderWidth: 1,
        borderColor: '#F4F6F8'
    },
    input: { flex: 1, marginLeft: 12, fontSize: 16, color: '#111827', fontWeight: '600' },
    forgotBtn: { alignSelf: 'flex-end', marginTop: 16 },
    forgotText: { color: colors.primary, fontWeight: '700' },
    loginBtn: { 
        backgroundColor: '#111827', 
        height: 64, 
        borderRadius: 20, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginTop: 32,
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 15
    },
    loginBtnLoading: { opacity: 0.8 },
    loginText: { color: '#fff', fontSize: 18, fontWeight: '800' },
    loginIconWrap: { 
        width: 32, 
        height: 32, 
        borderRadius: 10, 
        backgroundColor: '#fff', 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginLeft: 16 
    },
    clientBtn: { marginTop: 24, alignItems: 'center' },
    clientText: { color: '#637381', fontWeight: '700', textDecorationLine: 'underline' },
    scroll: { flexGrow: 1 }
});

export default StaffLoginScreen;
