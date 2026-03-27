<<<<<<< HEAD
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
=======
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
>>>>>>> main
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Camera, Check } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme/colors';
import { createMyPet, updateMyPet, type Pet, type PetPayload } from '../../services/api/pet';
import { Toast } from '../../components/common';

<<<<<<< HEAD
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dxyuuul0q/image/upload';
const UPLOAD_PRESET = 'teddypet';
=======
// Cloudinary Configuration
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dxyuuul0q/image/upload";
const UPLOAD_PRESET = "teddypet";
>>>>>>> main

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

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
<<<<<<< HEAD
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
=======
    setTimeout(() => setToastVisible(false), 2000);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showToast('Cần cấp quyền truy cập thư viện ảnh');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      await uploadToCloudinary(result.assets[0].uri);
    }
  };

  const uploadToCloudinary = async (uri: string) => {
    setUploading(true);
    try {
      const formData = new FormData();
      
      const fileUri = uri.startsWith('file://') ? uri : `file://${uri}`;
      const fileName = uri.split('/').pop() || `pet_avatar_${Date.now()}.jpg`;
      const fileType = 'image/jpeg';

      // @ts-ignore
>>>>>>> main
      formData.append('file', {
        uri: fileUri,
        type: fileType,
        name: fileName,
      });
      formData.append('upload_preset', UPLOAD_PRESET);

      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
<<<<<<< HEAD
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
=======
        // Don't set Content-Type header manually, let fetch set it with boundary
      });

      const data = await response.json();
      if (data.secure_url) {
        setForm({ ...form, avatar: data.secure_url });
        showToast('Tải ảnh lên thành công');
      } else {
        console.error('Cloudinary Response Error:', data);
        showToast('Lỗi khi tải ảnh lên Cloudinary');
      }
    } catch (error) {
      console.error('Cloudinary Upload Error:', error);
>>>>>>> main
      showToast('Lỗi khi tải ảnh lên');
    } finally {
      setUploading(false);
    }
  };

<<<<<<< HEAD
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

=======
>>>>>>> main
  const handleSave = async () => {
    if (!form.name.trim()) {
      showToast('Vui lòng nhập tên bé cưng');
      return;
    }

<<<<<<< HEAD
    if (uploading) {
      showToast('Ảnh đang được tải lên, vui lòng đợi');
      return;
    }

=======
>>>>>>> main
    setLoading(true);
    try {
      if (isEdit) {
        await updateMyPet(pet._id, form);
<<<<<<< HEAD
        showToast('Cập nhật thú cưng thành công');
      } else {
        await createMyPet(form);
        showToast('Đã thêm thú cưng mới');
      }
      setTimeout(() => navigation.goBack(), 900);
    } catch {
      showToast('Lỗi khi lưu thông tin thú cưng');
=======
        showToast('Cập nhật thành công');
      } else {
        await createMyPet(form);
        showToast('Đã thêm bé cưng mới');
      }
      setTimeout(() => navigation.goBack(), 1000);
    } catch (error) {
      showToast('Lỗi khi lưu thông tin');
>>>>>>> main
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
<<<<<<< HEAD
        <Text style={styles.headerTitle}>{isEdit ? 'Chỉnh sửa thú cưng' : 'Thêm thú cưng mới'}</Text>
=======
        <Text style={styles.headerTitle}>{isEdit ? 'Chỉnh sửa bé cưng' : 'Thêm bé cưng mới'}</Text>
>>>>>>> main
        <TouchableOpacity onPress={handleSave} disabled={loading || uploading} style={styles.saveBtn}>
          {loading ? <ActivityIndicator color={colors.primary} /> : <Check size={24} color={colors.primary} />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
<<<<<<< HEAD
          <TouchableOpacity
            style={[styles.avatarWrapper, uploading && styles.avatarWrapperDisabled]}
=======
          <TouchableOpacity 
            style={styles.avatarWrapper} 
>>>>>>> main
            onPress={handlePickImage}
            disabled={uploading}
          >
            {form.avatar ? (
<<<<<<< HEAD
              <>
                <Image source={{ uri: form.avatar }} style={styles.avatar} />
                <View style={styles.avatarEditBadge}>
                  <Camera size={16} color="#fff" />
                </View>
              </>
=======
              <Image source={{ uri: form.avatar }} style={styles.avatar} />
>>>>>>> main
            ) : (
              <View style={styles.placeholderAvatar}>
                {uploading ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <>
<<<<<<< HEAD
                    <Camera size={40} color={colors.primaryDeep} />
=======
                    <Camera size={40} color="#ccc" />
>>>>>>> main
                    <Text style={styles.addPhotoText}>Thêm ảnh</Text>
                  </>
                )}
              </View>
            )}
<<<<<<< HEAD
            {uploading ? (
              <View style={styles.uploadOverlay}>
                <ActivityIndicator color="#fff" />
              </View>
            ) : null}
          </TouchableOpacity>
          <Text style={styles.avatarHint}>
            {uploading ? 'Đang tải ảnh lên...' : 'Nhấn để chụp ảnh hoặc chọn ảnh từ thư viện'}
          </Text>
=======
            {form.avatar && uploading && (
               <View style={styles.uploadOverlay}>
                 <ActivityIndicator color="#fff" />
               </View>
            )}
          </TouchableOpacity>
>>>>>>> main
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
<<<<<<< HEAD
            <Text style={styles.label}>Tên thú cưng *</Text>
=======
            <Text style={styles.label}>Tên bé cưng *</Text>
>>>>>>> main
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: Lucky, Mimi..."
              value={form.name}
<<<<<<< HEAD
              onChangeText={(val) => setForm((prev) => ({ ...prev, name: val }))}
=======
              onChangeText={(val) => setForm({ ...form, name: val })}
>>>>>>> main
            />
          </View>

          <View style={styles.row}>
<<<<<<< HEAD
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
=======
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Loài</Text>
              <View style={styles.pickerRow}>
                <TouchableOpacity 
                  style={[styles.typeBtn, form.type === 'dog' && styles.typeBtnActive]}
                  onPress={() => setForm({ ...form, type: 'dog' })}
                >
                  <Text style={[styles.typeBtnText, form.type === 'dog' && styles.typeBtnTextActive]}>Chó</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.typeBtn, form.type === 'cat' && styles.typeBtnActive]}
                  onPress={() => setForm({ ...form, type: 'cat' })}
>>>>>>> main
                >
                  <Text style={[styles.typeBtnText, form.type === 'cat' && styles.typeBtnTextActive]}>Mèo</Text>
                </TouchableOpacity>
              </View>
            </View>
<<<<<<< HEAD

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
=======
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 16 }]}>
              <Text style={styles.label}>Giới tính</Text>
              <View style={styles.pickerRow}>
                 <TouchableOpacity 
                  style={[styles.typeBtn, form.gender === 'male' && styles.typeBtnActive]}
                  onPress={() => setForm({ ...form, gender: 'male' })}
                >
                  <Text style={[styles.typeBtnText, form.gender === 'male' && styles.typeBtnTextActive]}>Đực</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.typeBtn, form.gender === 'female' && styles.typeBtnActive]}
                  onPress={() => setForm({ ...form, gender: 'female' })}
>>>>>>> main
                >
                  <Text style={[styles.typeBtnText, form.gender === 'female' && styles.typeBtnTextActive]}>Cái</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

<<<<<<< HEAD
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Giống</Text>
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: Shiba Inu, Poodle..."
              value={form.breed}
              onChangeText={(val) => setForm((prev) => ({ ...prev, breed: val }))}
=======

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Giống (Breed)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: Shina Inu, Poodle..."
              value={form.breed}
              onChangeText={(val) => setForm({ ...form, breed: val })}
>>>>>>> main
            />
          </View>

          <View style={styles.row}>
<<<<<<< HEAD
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
=======
             <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Cân nặng (kg)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="0.0"
                  value={(form.weight || 0).toString()}
                  onChangeText={(val) => setForm({ ...form, weight: parseFloat(val) || 0 })}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 16 }]}>
                <Text style={styles.label}>Tuổi (năm)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="0"
                  value={(form.age || 0).toString()}
                  onChangeText={(val) => setForm({ ...form, age: parseInt(val) || 0 })}
                />
              </View>
>>>>>>> main
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ghi chú sức khỏe</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
<<<<<<< HEAD
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

=======
              placeholder="Bé bị dị ứng, nhát người lạ..."
              multiline
              numberOfLines={4}
              value={form.notes}
              onChangeText={(val) => setForm({ ...form, notes: val })}
            />
          </View>

          <TouchableOpacity 
            style={styles.mainSaveBtn}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainSaveBtnText}>{isEdit ? 'LƯU THAY ĐỔI' : 'THÊM BÉ CƯNG'}</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
>>>>>>> main
      <Toast visible={toastVisible} message={toastMessage} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
<<<<<<< HEAD
  container: { flex: 1, backgroundColor: colors.background },
=======
  container: { flex: 1, backgroundColor: '#fff' },
>>>>>>> main
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
<<<<<<< HEAD
    borderBottomColor: colors.cardBorder,
    backgroundColor: colors.background,
=======
    borderBottomColor: '#F0F0F0',
>>>>>>> main
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: colors.secondary },
  saveBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20 },
  avatarSection: { alignItems: 'center', marginBottom: 30 },
  avatarWrapper: {
<<<<<<< HEAD
    width: 132,
    height: 132,
    borderRadius: 26,
    backgroundColor: colors.backgroundSoft,
    borderWidth: 2,
    borderColor: colors.cardBorder,
=======
    width: 120,
    height: 120,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
>>>>>>> main
    borderStyle: 'dashed',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
<<<<<<< HEAD
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
=======
  avatar: { width: '100%', height: '100%' },
  placeholderAvatar: { alignItems: 'center' },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoText: { fontSize: 12, color: '#999', marginTop: 4, fontWeight: '600' },
>>>>>>> main
  form: { gap: 16 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: '700', color: colors.secondary },
  input: {
<<<<<<< HEAD
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
=======
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
>>>>>>> main
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.secondary,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
<<<<<<< HEAD
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
=======
  pickerRow: { flexDirection: 'row', gap: 8 },
  typeBtn: { 
    flex: 1, 
    height: 44, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  typeBtnActive: { borderColor: colors.primary, backgroundColor: colors.softPink },
  typeBtnText: { fontSize: 13, fontWeight: '600', color: '#666' },
  typeBtnTextActive: { color: colors.primary, fontWeight: '800' },
  mainSaveBtn: { 
    backgroundColor: colors.primary, 
    paddingVertical: 16, 
    borderRadius: 16, 
    alignItems: 'center', 
    marginTop: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
>>>>>>> main
  mainSaveBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});

export default PetFormScreen;
