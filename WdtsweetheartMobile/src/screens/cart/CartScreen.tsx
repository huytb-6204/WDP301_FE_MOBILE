<<<<<<< HEAD
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Trash2, ShoppingBag } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { formatPrice } from '../../utils';
import { useCart } from '../../context/CartContext';


const CartScreen = () => {
  const navigation = useNavigation<any>();
  const {
    cartItems,
    cartDetailItems,
    cartDetailLoading,
    cartDetailError,
    fetchCartDetail,
    updateQuantity,
    removeFromCart,
    cartTotal,
    cartDetailTotal,
  } = useCart();

  useEffect(() => {
    fetchCartDetail();
  }, [cartItems]);

  const displayItems = cartDetailItems.length > 0 ? cartDetailItems : cartItems;
  const displayTotal = cartDetailItems.length > 0 ? cartDetailTotal : cartTotal;

  // Component hiển thị từng món hàng trong giỏ
  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.product.primaryImage }} style={styles.itemImage} />
      
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={2}>{item.product.title}</Text>
        <Text style={styles.itemPrice}>{formatPrice(item.product.priceValue)}</Text>
        
        <View style={styles.actionRow}>
          {/* Bộ tăng giảm số lượng */}
          <View style={styles.quantityControl}>
            <TouchableOpacity 
              style={styles.qtyButton}
              onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
            >
              <Text style={styles.qtyText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{item.quantity}</Text>
            <TouchableOpacity 
              style={styles.qtyButton}
              onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
            >
              <Text style={styles.qtyText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Nút xóa */}
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => removeFromCart(item.product.id)}
          >
            <Trash2 size={18} color="#FF4D4D" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

 return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giỏ hàng của bạn</Text>
        <View style={{ width: 24 }} />
      </View>

      {displayItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <ShoppingBag size={48} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Giỏ hàng đang trống!</Text>
          <Text style={styles.emptyDesc}>Hãy tìm thêm những món đồ thú vị cho thú cưng của bạn nhé.</Text>
          <TouchableOpacity 
            style={styles.shopNowBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.shopNowText}>Mua sắm ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={displayItems}
            keyExtractor={(item) => item.product.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.bottomBar}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
              <Text style={styles.totalPrice}>{formatPrice(displayTotal)}</Text>
            </View>
            {cartDetailLoading ? (
              <Text style={styles.cartMeta}>Đang đồng bộ giá & tồn kho...</Text>
            ) : cartDetailError ? (
              <Text style={styles.cartMetaError}>{cartDetailError}</Text>
            ) : null}
            <TouchableOpacity 
              style={styles.checkoutBtn}
              onPress={() => navigation.navigate('Checkout')} 
            >
              <Text style={styles.checkoutText}>Tiến hành đặt hàng</Text>
            </TouchableOpacity>
          </View>
        </>
      )} 
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8', // Màu nền xám nhạt để thẻ item nổi lên
  },
=======
import React, { useMemo, useState, useEffect } from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Minus, Plus, Trash2 } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { formatPrice } from '../../utils';
import type { RootStackParamList } from '../../navigation/types';
import { fetchCartList, CartPayloadItem, UserAddress } from '../../services/api/cart';

type CartItem = {
  id: string;
  title: string;
  price: number;
  image?: string;
  qty: number;
};

const CartScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [items, setItems] = useState<CartItem[]>([
    {
      id: '1',
      title: 'Sản phẩm A',
      price: 120000,
      image: '',
      qty: 2,
    },
    {
      id: '2',
      title: 'Sản phẩm B',
      price: 75000,
      image: '',
      qty: 1,
    },
  ]);

  const [shippingOptions, setShippingOptions] = useState<any[]>([]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.qty, 0),
    [items]
  );

  // calculate shipping option cheaply for demonstration
  useEffect(() => {
    const loadCart = async () => {
      try {
        // convert local items to payload structure expected by backend
        const payload = items.map((i) => ({
          productId: i.id,
          quantity: i.qty,
          // variant: [] // add variant data if available
        }));

        // example address; in real app obtain from user profile or location
        const userAddress = {
          latitude: 10.762622,
          longitude: 106.660172,
        };

        const { shippingOptions: opts } = await fetchCartList(payload, userAddress);
        setShippingOptions(opts || []);
      } catch (err) {
        console.warn('Failed to fetch cart details', err);
      }
    };

    loadCart();
  }, [items]);

  const updateQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerButton}>
          <ArrowLeft size={20} color={colors.secondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Giỏ hàng</Text>
        <View style={styles.headerButton} />
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Giỏ hàng trống</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {items.map((item) => (
            <View key={item.id} style={styles.card}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.cardImage} />
              ) : (
                <View style={styles.cardImagePlaceholder} />
              )}
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.cardPrice}>{formatPrice(item.price)}</Text>
                <View style={styles.qtyRow}>
                  <Pressable onPress={() => updateQty(item.id, -1)} style={styles.qtyButton}>
                    <Minus size={16} color={colors.text} />
                  </Pressable>
                  <Text style={styles.qtyValue}>{item.qty}</Text>
                  <Pressable onPress={() => updateQty(item.id, 1)} style={styles.qtyButton}>
                    <Plus size={16} color={colors.text} />
                  </Pressable>
                </View>
              </View>
              <Pressable onPress={() => removeItem(item.id)} style={styles.removeButton}>
                <Trash2 size={18} color={colors.text} />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}

      {items.length > 0 && (
        <>
          {shippingOptions.length > 0 && (
            <View style={styles.shippingSection}>
              <Text style={styles.shippingLabel}>Phí vận chuyển:</Text>
              {shippingOptions.map((opt: any, idx: number) => (
                <Text key={idx} style={styles.shippingOptionText}>
                  {opt.service_name || opt.name || '…'} - {formatPrice(opt.fee || 0)}
                </Text>
              ))}
            </View>
          )}
          <View style={styles.footer}>
            <Text style={styles.totalLabel}>Tổng cộng:</Text>
            <Text style={styles.totalValue}>{formatPrice(total)}</Text>
            <Pressable
              style={styles.checkoutButton}
              onPress={() => navigation.navigate('Payment')}
            >
              <Text style={styles.checkoutText}>Thanh toán</Text>
            </Pressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
>>>>>>> Quan
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
<<<<<<< HEAD
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 120, // Khoảng trống cho BottomBar
  },
  cartItem: {
    flexDirection: 'row',
=======
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
    backgroundColor: '#fff',
  },
  headerTitle: {
    color: colors.secondary,
    fontSize: 18,
    fontWeight: '700',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.softPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16, color: colors.text },
  list: { padding: 20, paddingBottom: 120 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
>>>>>>> Quan
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
<<<<<<< HEAD
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: colors.softPink,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 20,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  qtyButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  qtyValue: {
    width: 32,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  deleteButton: {
    padding: 6,
    backgroundColor: '#FFF0F0',
    borderRadius: 8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 15,
    color: '#666',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  cartMeta: {
    fontSize: 12,
    color: '#777',
    marginBottom: 10,
  },
  cartMetaError: {
    fontSize: 12,
    color: '#D64545',
    marginBottom: 10,
  },
  checkoutBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.softPink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  shopNowBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 999,
  },
  shopNowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
=======
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImage: { width: 80, height: 80, borderRadius: 12, backgroundColor: colors.softPink },
  cardImagePlaceholder: { width: 80, height: 80, borderRadius: 12, backgroundColor: colors.border },
  cardBody: { flex: 1, marginLeft: 12 },
  cardTitle: { color: colors.secondary, fontSize: 14, fontWeight: '600' },
  cardPrice: { color: colors.primary, fontSize: 14, fontWeight: '700', marginTop: 4 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.softPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: { marginHorizontal: 8, fontSize: 14, color: colors.text },
  removeButton: { padding: 8 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F1F1F1',
  },
  totalLabel: { color: colors.text, fontSize: 14 },
  totalValue: { color: colors.secondary, fontSize: 18, fontWeight: '700', marginTop: 4 },
  checkoutButton: {
    marginTop: 12,
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  checkoutText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  shippingSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F1F1F1',
  },
  shippingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  shippingOptionText: {
    fontSize: 13,
    color: colors.secondary,
    marginBottom: 2,
>>>>>>> Quan
  },
});

export default CartScreen;
