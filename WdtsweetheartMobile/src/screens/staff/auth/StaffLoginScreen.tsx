import React, { useState } from 'react';
<<<<<<< HEAD
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
=======
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ActivityIndicator, Image, KeyboardAvoidingView, 
  Platform, StatusBar, StyleSheet, 
  Text, TextInput, TouchableOpacity, View,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react-native';
import { staffLogin } from '../../../services/api/staffAuth';
import { useAuth } from '../../../context/AuthContext';
import { useNotifier } from '../../../context/NotifierContext';
>>>>>>> main

import type { RootStackParamList } from '../../../navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const StaffLoginScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { updateUser } = useAuth();
<<<<<<< HEAD
=======
    const { showToast, showAlert } = useNotifier();
    
>>>>>>> main
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
<<<<<<< HEAD
          Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ email và mật khẩu!');
=======
          showToast('Vui lòng nhập đầy đủ thông tin!', 'warning');
>>>>>>> main
          return;
        }
        
        setLoading(true);
        try {
<<<<<<< HEAD
          console.log('--- Attempting Staff Login ---');
          const staff = await staffLogin(email, password);
          console.log('Login Response Staff User:', staff);
          
          if (staff) {
            // Check if level is staff or admin
            const roles = (staff as any).roles || [];
            console.log('User Roles discovered:', roles);
            
=======
          const staff = await staffLogin(email, password);
          
          if (staff) {
            const roles = (staff as any).roles || [];
>>>>>>> main
            const isAuthorized = roles.some((r: any) => 
               (typeof r === 'string' && (r === 'staff' || r === 'admin')) ||
               (r && (r.level === 'staff' || r.level === 'admin')) ||
               (r && (r.name?.toLowerCase().includes('nhân viên') || r.name?.toLowerCase().includes('admin')))
            );
            
            if (!isAuthorized) {
<<<<<<< HEAD
              console.warn('Unauthorized staff login attempt');
              Alert.alert('Từ chối truy cập', 'Bạn không có quyền truy cập vào bảng điều khiển nhân viên. Cấp độ tài khoản của bạn không phù hợp.');
=======
              showAlert('Từ chối truy cập', 'Tài khoản của bạn không có quyền truy cập vào cổng thông tin nhân viên.', 'error');
>>>>>>> main
              setLoading(false);
              return;
            }

<<<<<<< HEAD
            // Success
            await updateUser({ ...staff, userType: 'staff' });
            console.log('Updated user context as staff');
            
            // Navigate and Reset
=======
            await updateUser({ ...staff, userType: 'staff' });
            showToast('Đăng nhập thành công!', 'success');
            
>>>>>>> main
            navigation.reset({
                index: 0,
                routes: [{ name: 'StaffHome' }],
            });
          }
        } catch (error: any) {
          console.error('Staff Login Error', error);
<<<<<<< HEAD
          Alert.alert('Lỗi đăng nhập', error?.message || 'Email hoặc mật khẩu không chính xác!');
=======
          showAlert('Lỗi đăng nhập', error?.message || 'Email hoặc mật khẩu không chính xác!', 'error');
>>>>>>> main
        } finally {
          setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="light-content" />
<<<<<<< HEAD
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
=======
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
                    style={styles.flex}
                >
                    <View style={styles.contentContainer}>
                        {/* Header Section */}
                        <View style={styles.header}>
                            <View style={styles.logoContainer}>
                                <Image 
                                   source={require('../../../../assets/app_logo.png')} 
                                   style={styles.logo} 
                                   resizeMode="contain"
                                />
                            </View>
                            <View style={styles.badge}>
                                <ShieldCheck size={14} color="#007B55" />
                                <Text style={styles.badgeText}>PORTAL NHÂN VIÊN</Text>
                            </View>
                        </View>

                        {/* Form Section */}
                        <View style={styles.formCard}>
                            <Text style={styles.welcomeText}>Chào mừng trở lại!</Text>
                            <Text style={styles.instruction}>Cổng thông tin nội bộ của Teddy Pet. Đăng nhập để bắt đầu ca trực.</Text>

                            <View style={styles.inputGroup}>
                                <View style={styles.inputWrapper}>
                                    <Mail size={18} color="#919EAB" />
                                    <TextInput 
                                      placeholder="Email nhân viên" 
                                      placeholderTextColor="#919EAB"
                                      style={styles.input}
                                      value={email}
                                      onChangeText={setEmail}
                                      autoCapitalize="none"
                                      keyboardType="email-address"
                                    />
                                </View>
                            </View>

                            <View style={[styles.inputGroup, { marginTop: 16 }]}>
                                <View style={styles.inputWrapper}>
                                    <Lock size={18} color="#919EAB" />
                                    <TextInput 
                                      placeholder="Mật khẩu" 
                                      placeholderTextColor="#919EAB"
                                      style={styles.input}
                                      value={password}
                                      onChangeText={setPassword}
                                      secureTextEntry={!showPassword}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                                        {showPassword ? <EyeOff size={20} color="#919EAB" /> : <Eye size={20} color="#919EAB" />}
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity style={styles.forgotPass}>
                                <Text style={styles.forgotText}>Quên mật khẩu?</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                               style={[styles.loginButton, loading && styles.loginBtnLoading]} 
                               onPress={handleLogin}
                               activeOpacity={0.7}
                               disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Text style={styles.loginBtnText}>Đăng nhập ngay</Text>
                                        <ArrowRight size={20} color="#fff" />
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.switchMode} 
                                onPress={() => navigation.goBack()}
                            >
                                <Text style={styles.switchText}>Dành cho Khách hàng</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
>>>>>>> main
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
<<<<<<< HEAD
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
=======
    safe: { flex: 1, backgroundColor: '#0A0E17' },
    flex: { flex: 1 },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: { 
        alignItems: 'center',
        marginBottom: 24
    },
    logoContainer: {
        width: 100,
        height: 100,
        backgroundColor: '#fff',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        marginBottom: 16
    },
    logo: { 
        width: 70, 
        height: 70,
    },
    badge: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#E7F5EF', 
        paddingHorizontal: 12, 
        paddingVertical: 5, 
        borderRadius: 10,
    },
    badgeText: { 
        marginLeft: 8, 
        fontSize: 10, 
        fontWeight: '900', 
        color: '#007B55',
        letterSpacing: 1
    },
    formCard: { 
        width: '100%',
        backgroundColor: '#fff', 
        borderRadius: 28, 
        paddingHorizontal: 20, 
        paddingTop: 32,
        paddingBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 4
    },
    welcomeText: { 
        fontSize: 20, 
        fontWeight: '900', 
        color: '#111827',
        textAlign: 'center'
    },
    instruction: { 
        fontSize: 12, 
        color: '#919EAB', 
        textAlign: 'center', 
        marginTop: 6, 
        lineHeight: 18,
        fontWeight: '500',
        paddingHorizontal: 10
    },
    inputGroup: { 
        marginTop: 20 
    },
    inputWrapper: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#F4F6F8', 
        borderRadius: 12, 
        paddingHorizontal: 16, 
        height: 50,
    },
    input: { 
        flex: 1, 
        marginLeft: 12, 
        fontSize: 14, 
        color: '#111827', 
        fontWeight: '700' 
    },
    eyeBtn: {
        padding: 4
    },
    forgotPass: { 
        alignSelf: 'flex-end', 
        marginTop: 10 
    },
    forgotText: { 
        color: '#1890FF', 
        fontWeight: '700',
        fontSize: 12
    },
    loginButton: { 
        backgroundColor: '#111827', 
        height: 54, 
        borderRadius: 14, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginTop: 24,
        gap: 12
    },
    loginBtnLoading: { 
        opacity: 0.7 
    },
    loginBtnText: { 
        color: '#fff', 
        fontSize: 16, 
        fontWeight: '800',
    },
    switchMode: {
        marginTop: 12,
        alignItems: 'center',
        paddingVertical: 10
    },
    switchText: {
        color: '#919EAB',
        fontWeight: '700',
        fontSize: 12,
        textDecorationLine: 'underline'
    }
>>>>>>> main
});

export default StaffLoginScreen;
