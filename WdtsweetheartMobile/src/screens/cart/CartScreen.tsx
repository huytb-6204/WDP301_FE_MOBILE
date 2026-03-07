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
  }, [cartItems, fetchCartDetail]);

  const displayItems = cartDetailItems.length > 0 ? cartDetailItems : cartItems;
  const displayTotal = cartDetailItems.length > 0 ? cartDetailTotal : cartTotal;

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.product.primaryImage }} style={styles.itemImage} />

      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.product.title}
        </Text>
        <Text style={styles.itemPrice}>{formatPrice(item.product.priceValue)}</Text>

        <View style={styles.actionRow}>
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
          <Text style={styles.emptyDesc}>
            Hãy tìm thêm những món đồ thú vị cho thú cưng của bạn nhé.
          </Text>
          <TouchableOpacity style={styles.shopNowBtn} onPress={() => navigation.navigate('Home')}>
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
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    paddingBottom: 120,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
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
  },
});

export default CartScreen;
