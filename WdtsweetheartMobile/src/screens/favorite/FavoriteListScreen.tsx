import React, { useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Heart, ShoppingCart, Trash2 } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { Toast } from '../../components/common';
import { useCart } from '../../context/CartContext';
import { useFavorites, type FavoriteProduct } from '../../context/FavoritesContext';

const FavoriteListScreen = () => {
  const navigation = useNavigation<any>();
  const { addToCart } = useCart();
  const { favorites, removeFavorite, isReady } = useFavorites();
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  const handleRemove = (item: FavoriteProduct) => {
    removeFavorite(item.productId, item.variant);
    showToast('Đã xóa khỏi danh sách yêu thích');
  };

  const handleAddToCart = (item: FavoriteProduct) => {
    const { detail } = item;
    addToCart(
      {
        id: detail.id,
        title: detail.title,
        price: detail.price,
        primaryImage: detail.primaryImage,
        priceValue: detail.priceValue,
        originalPrice: detail.originalPrice,
        rating: detail.rating || 5,
        isSale: !!detail.originalPrice,
      },
      item.quantity,
      item.variant
    );
    showToast('Đã thêm vào giỏ hàng!');
  };

  const renderItem = ({ item }: { item: FavoriteProduct }) => {
    const { detail } = item;
    if (!detail) return null;

    return (
      <View style={styles.card}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('ProductDetail', { productSlug: detail.slug || detail.id })}
          style={styles.cardContent}
        >
          <Image source={{ uri: detail.primaryImage || 'https://via.placeholder.com/150' }} style={styles.image} />
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={2}>{detail.title}</Text>
            <Text style={styles.price}>{detail.price}</Text>
            {item.variant && item.variant.length > 0 && (
              <View style={styles.variantWrap}>
                <Text style={styles.variantText}>
                  {item.variant.map(v => v.label || v.value).join(' / ')}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.cartBtn]} 
            onPress={() => handleAddToCart(item)}
          >
            <ShoppingCart size={16} color="#fff" />
            <Text style={styles.cartBtnText}>Thêm giỏ hàng</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.removeBtn]} 
            onPress={() => handleRemove(item)}
          >
            <Trash2 size={16} color="#FF4D4D" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sản phẩm yêu thích ({favorites.length})</Text>
        <View style={{ width: 40 }} />
      </View>

      {!isReady ? (
        <View style={styles.center}>
          <Text>Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item, index) => `${item.productId}-${index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIconWrap}>
                 <Heart size={40} color={colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>Danh sách trống</Text>
              <Text style={styles.emptyText}>Hãy lưu lại những sản phẩm bạn yêu thích nhé!</Text>
              <TouchableOpacity 
                style={styles.exploreBtn}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.exploreBtnText}>KHÁM PHÁ NGAY</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
      <Toast visible={toastVisible} message={toastMessage} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.secondary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardContent: { flexDirection: 'row', padding: 12 },
  image: { width: 100, height: 100, borderRadius: 12, backgroundColor: '#F3F4F6' },
  info: { flex: 1, marginLeft: 12, justifyContent: 'center', gap: 4 },
  name: { fontSize: 15, fontWeight: '700', color: colors.secondary },
  price: { fontSize: 16, fontWeight: '800', color: colors.primary },
  variantWrap: { 
    marginTop: 4, 
    backgroundColor: '#F9FAFB', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  variantText: { fontSize: 11, color: '#6B7280', fontWeight: '500' },
  categoryWrap: { alignSelf: 'flex-start', backgroundColor: '#FFF5F6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  categoryText: { fontSize: 10, color: colors.primary, fontWeight: '700' },
  actions: { 
    flexDirection: 'row', 
    borderTopWidth: 1, 
    borderTopColor: '#f9f9f9',
    padding: 8,
    gap: 8
  },
  actionBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    height: 40,
    borderRadius: 12,
  },
  cartBtn: { 
    flex: 1, 
    backgroundColor: colors.primary,
    gap: 8
  },
  cartBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  removeBtn: { 
    width: 44, 
    backgroundColor: '#FFF5F6',
    borderWidth: 1,
    borderColor: '#FFEBEA'
  },
  empty: { alignItems: 'center', justifyContent: 'center', marginTop: 120, paddingHorizontal: 40 },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF5F6', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.secondary, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#7d7b7b', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  exploreBtn: { backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 999 },
  exploreBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});

export default FavoriteListScreen;
