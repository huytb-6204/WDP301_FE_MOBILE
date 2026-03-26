import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Heart, ShoppingCart, ShoppingBag, Trash2 } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { getWishlist, toggleWishlist } from '../../services/api/dashboard';
import { Toast } from '../../components/common';
import { useCart } from '../../context/CartContext';

const FavoriteListScreen = () => {
  const navigation = useNavigation<any>();
  const { addToCart } = useCart();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  const fetchWishlist = async () => {
    try {
      const data = await getWishlist();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast('Không thể tải danh sách yêu thích');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId: string) => {
    try {
      await toggleWishlist(productId);
      setItems(prev => prev.filter(item => (item.productId?._id || item._id) !== productId));
      showToast('Đã xóa khỏi danh sách yêu thích');
    } catch (error) {
      showToast('Lỗi khi xóa sản phẩm');
    }
  };

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product._id,
      title: product.name,
      price: `${product.priceNew || product.price}`,
      primaryImage: product.images?.[0] || '',
      rating: 5,
      isSale: !!product.priceOld,
      priceValue: product.priceNew || product.price
    }, 1);
    showToast('Đã thêm vào giỏ hàng!');
  };

  const formatCurrency = (value: number) => 
    `${(value || 0).toLocaleString('vi-VN')} đ`;

  const renderItem = ({ item }: { item: any }) => {
    const product = item.productId || item;
    return (
      <View style={styles.card}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('ProductDetail', { productSlug: product.slug, product })}
          style={styles.cardContent}
        >
          <Image source={{ uri: product.images?.[0] || 'https://via.placeholder.com/150' }} style={styles.image} />
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
            <Text style={styles.price}>{formatCurrency(product.priceNew || product.price)}</Text>
            <View style={styles.categoryWrap}>
               <Text style={styles.categoryText}>{product.category?.name || 'Phụ kiện'}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.cartBtn]} 
            onPress={() => handleAddToCart(product)}
          >
            <ShoppingCart size={16} color="#fff" />
            <Text style={styles.cartBtnText}>Thêm giỏ hàng</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.removeBtn]} 
            onPress={() => handleRemove(product._id)}
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
        <Text style={styles.headerTitle}>Sản phẩm yêu thích ({items.length})</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id || (item.productId?._id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchWishlist(); }} />
          }
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
