import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Camera, Check } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme/colors';
import { createMyPet, updateMyPet, type Pet, type PetPayload } from '../../services/api/pet';
import { Toast } from '../../components/common';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dxyuuul0q/image/upload';
const UPLOAD_PRESET = 'teddypet';

const PetFormScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const pet = route.params?.pet as Pet | undefined;
  const isEdit = !!pet;

  const [form, setForm] = useState<PetPayload>({
    name: pet?.name || '',
    type: pet?.type || 'dog',
    breed: pet?.breed || '',
    weight: pet?.weight || 1,
    age: pet?.age || 0,
    gender: pet?.gender || 'male',
    healthStatus: pet?.healthStatus || 'accepted',
    notes: pet?.notes || '',
    avatar: pet?.avatar || '',
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [successPopupVisible, setSuccessPopupVisible] = useState(false);
  const [successPopupMessage, setSuccessPopupMessage] = useState('');

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2200);
  };

  const uploadToCloudinary = async (asset: ImagePicker.ImagePickerAsset) => {
    setUploading(true);
    try {
      const formData = new FormData();
      const fileUri = asset.uri.startsWith('file://') ? asset.uri : `file://${asset.uri}`;
      const fileName = asset.fileName || asset.uri.split('/').pop() || `pet_avatar_${Date.now()}.jpg`;
      const fileType = asset.mimeType || 'image/jpeg';

      // @ts-ignore React Native file object
      formData.append('file', {
        uri: fileUri,
        type: fileType,
        name: fileName,
      });
      formData.append('upload_preset', UPLOAD_PRESET);

      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data.secure_url) {
        console.error('Cloudinary upload failed:', data);
        showToast('Không thể tải ảnh thú cưng lên');
        return;
      }

      setForm((prev) => ({ ...prev, avatar: data.secure_url }));
      showToast('Đã cập nhật ảnh thú cưng');
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      showToast('Lỗi khi tải ảnh lên');
    } finally {
      setUploading(false);
    }
  };

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showToast('Cần cấp quyền truy cập thư viện ảnh');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      await uploadToCloudinary(result.assets[0]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showToast('Cần cấp quyền truy cập camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      cameraType: ImagePicker.CameraType.front,
    });

    if (!result.canceled && result.assets?.[0]) {
      await uploadToCloudinary(result.assets[0]);
    }
  };

  const handlePickImage = () => {
    Alert.alert('Ảnh thú cưng', 'Chọn cách thêm ảnh cho thú cưng của bạn', [
      { text: 'Chụp ảnh', onPress: () => void takePhoto() },
      { text: 'Chọn từ thư viện', onPress: () => void pickFromLibrary() },
      ...(form.avatar
        ? [
            {
              text: 'Xóa ảnh hiện tại',
              style: 'destructive' as const,
              onPress: () => setForm((prev) => ({ ...prev, avatar: '' })),
            },
          ]
        : []),
      { text: 'Hủy', style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      showToast('Vui lòng nhập tên bé cưng');
      return;
    }

    if (uploading) {
      showToast('Ảnh đang được tải lên, vui lòng đợi');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await updateMyPet(pet._id, form);
        setSuccessPopupMessage('Cập nhật thú cưng thành công!');
        setSuccessPopupVisible(true);
      } else {
        await createMyPet(form);
        setSuccessPopupMessage('Đã thêm thú cưng mới thành công!');
        setSuccessPopupVisible(true);
      }
    } catch {
      Alert.alert('Lỗi', 'Lỗi khi lưu thông tin thú cưng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? 'Chỉnh sửa thú cưng' : 'Thêm thú cưng mới'}</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading || uploading} style={styles.saveBtn}>
          {loading ? <ActivityIndicator color={colors.primary} /> : <Check size={24} color={colors.primary} />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={[styles.avatarWrapper, uploading && styles.avatarWrapperDisabled]}
            onPress={handlePickImage}
            disabled={uploading}
          >
            {form.avatar ? (
              <>
                <Image source={{ uri: form.avatar }} style={styles.avatar} />
                <View style={styles.avatarEditBadge}>
                  <Camera size={16} color="#fff" />
                </View>
              </>
            ) : (
              <View style={styles.placeholderAvatar}>
                {uploading ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <>
                    <Camera size={40} color={colors.primaryDeep} />
                    <Text style={styles.addPhotoText}>Thêm ảnh</Text>
                  </>
                )}
              </View>
            )}
            {uploading ? (
              <View style={styles.uploadOverlay}>
                <ActivityIndicator color="#fff" />
              </View>
            ) : null}
          </TouchableOpacity>
          <Text style={styles.avatarHint}>
            {uploading ? 'Đang tải ảnh lên...' : 'Nhấn để chụp ảnh hoặc chọn ảnh từ thư viện'}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên thú cưng *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: Lucky, Mimi..."
              value={form.name}
              onChangeText={(val) => setForm((prev) => ({ ...prev, name: val }))}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flexOne]}>
              <Text style={styles.label}>Loài</Text>
              <View style={styles.pickerRow}>
                <TouchableOpacity
                  style={[styles.typeBtn, form.type === 'dog' && styles.typeBtnActive]}
                  onPress={() => setForm((prev) => ({ ...prev, type: 'dog' }))}
                >
                  <Text style={[styles.typeBtnText, form.type === 'dog' && styles.typeBtnTextActive]}>Chó</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeBtn, form.type === 'cat' && styles.typeBtnActive]}
                  onPress={() => setForm((prev) => ({ ...prev, type: 'cat' }))}
                >
                  <Text style={[styles.typeBtnText, form.type === 'cat' && styles.typeBtnTextActive]}>Mèo</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.inputGroup, styles.flexOne, styles.rowGap]}>
              <Text style={styles.label}>Giới tính</Text>
              <View style={styles.pickerRow}>
                <TouchableOpacity
                  style={[styles.typeBtn, form.gender === 'male' && styles.typeBtnActive]}
                  onPress={() => setForm((prev) => ({ ...prev, gender: 'male' }))}
                >
                  <Text style={[styles.typeBtnText, form.gender === 'male' && styles.typeBtnTextActive]}>Đực</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeBtn, form.gender === 'female' && styles.typeBtnActive]}
                  onPress={() => setForm((prev) => ({ ...prev, gender: 'female' }))}
                >
                  <Text style={[styles.typeBtnText, form.gender === 'female' && styles.typeBtnTextActive]}>Cái</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Giống</Text>
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: Shiba Inu, Poodle..."
              value={form.breed}
              onChangeText={(val) => setForm((prev) => ({ ...prev, breed: val }))}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flexOne]}>
              <Text style={styles.label}>Cân nặng (kg)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="0.0"
                value={(form.weight || 0).toString()}
                onChangeText={(val) => setForm((prev) => ({ ...prev, weight: parseFloat(val) || 0 }))}
              />
            </View>
            <View style={[styles.inputGroup, styles.flexOne, styles.rowGap]}>
              <Text style={styles.label}>Tuổi</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="0"
                value={(form.age || 0).toString()}
                onChangeText={(val) => setForm((prev) => ({ ...prev, age: parseInt(val, 10) || 0 }))}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ghi chú sức khỏe</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ví dụ: bị dị ứng, sợ người lạ, cần chăm sóc đặc biệt..."
              multiline
              numberOfLines={4}
              value={form.notes}
              onChangeText={(val) => setForm((prev) => ({ ...prev, notes: val }))}
            />
          </View>

          <TouchableOpacity
            style={[styles.mainSaveBtn, (loading || uploading) && styles.mainSaveBtnDisabled]}
            onPress={handleSave}
            disabled={loading || uploading}
          >
            {loading || uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.mainSaveBtnText}>{isEdit ? 'LƯU THAY ĐỔI' : 'THÊM THÚ CƯNG'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal 
        visible={successPopupVisible} 
        animationType="fade" 
        transparent 
        onRequestClose={() => { 
          setSuccessPopupVisible(false); 
          navigation.goBack(); 
        }}
      >
        <View style={styles.successModalBackdrop}>
          <View style={styles.successModalCard}>
            <View style={styles.successIconWrap}>
              <Check size={32} color="#fff" />
            </View>
            <Text style={styles.successModalTitle}>Thành công</Text>
            <Text style={styles.successModalMessage}>{successPopupMessage}</Text>
            <TouchableOpacity 
              style={styles.successModalButton} 
              onPress={() => { 
                setSuccessPopupVisible(false); 
                navigation.goBack(); 
              }}
            >
              <Text style={styles.successModalButtonText}>Tuyệt vời</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Toast visible={toastVisible} message={toastMessage} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    backgroundColor: colors.background,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: colors.secondary },
  saveBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20 },
  avatarSection: { alignItems: 'center', marginBottom: 30 },
  avatarWrapper: {
    width: 132,
    height: 132,
    borderRadius: 26,
    backgroundColor: colors.backgroundSoft,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    borderStyle: 'dashed',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrapperDisabled: {
    opacity: 0.72,
  },
  avatar: { width: '100%', height: '100%' },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryDeep,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  placeholderAvatar: { alignItems: 'center' },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(64, 43, 46, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoText: { fontSize: 12, color: colors.primaryDeep, marginTop: 6, fontWeight: '700' },
  avatarHint: {
    marginTop: 10,
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
  },
  form: { gap: 16 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: '700', color: colors.secondary },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.secondary,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  flexOne: { flex: 1 },
  rowGap: { marginLeft: 16 },
  pickerRow: { flexDirection: 'row', gap: 8 },
  typeBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  typeBtnActive: { borderColor: colors.primaryDeep, backgroundColor: colors.softPink },
  typeBtnText: { fontSize: 13, fontWeight: '600', color: colors.text },
  typeBtnTextActive: { color: colors.primaryDeep, fontWeight: '800' },
  mainSaveBtn: {
    backgroundColor: colors.primaryDeep,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  mainSaveBtnDisabled: {
    opacity: 0.82,
  },
  mainSaveBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  successModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  successModalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  successIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.secondary,
    marginBottom: 8,
  },
  successModalMessage: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  successModalButton: {
    width: '100%',
    height: 48,
    borderRadius: 999,
    backgroundColor: colors.primaryDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successModalButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default PetFormScreen;
