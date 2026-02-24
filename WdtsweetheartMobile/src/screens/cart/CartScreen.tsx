import React from 'react';
import {
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Trash2, Plus, Minus } from 'lucide-react-native';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../navigation/types';

type CartScreenNavigation = NativeStackNavigationProp<RootStackParamList, 'Cart'>;

const CartScreen = () => {
  const navigation = useNavigation<CartScreenNavigation>();
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();

  const handleCheckout = () => {
    if (items.length === 0) {
      alert('Giỏ hàng trống. Vui lòng thêm sản phẩm!');
      return;
    }
    navigation.navigate('Checkout', { items });
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      {/* Hình ảnh sản phẩm */}
      <Image
        source={{ uri: item.primaryImage }}
        style={styles.itemImage}
        resizeMode="cover"
      />

      {/* Thông tin sản phẩm */}
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.itemPrice}>{item.price}</Text>

        {/* Điều khiển số lượng */}
        <View style={styles.quantityControl}>
          <Pressable
            onPress={() =>
              updateQuantity(item.productId, Math.max(1, item.quantity - 1))
            }
            style={styles.qtyButton}
          >
            <Minus size={16} color={colors.secondary} />
          </Pressable>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <Pressable
            onPress={() => updateQuantity(item.productId, item.quantity + 1)}
            style={styles.qtyButton}
          >
            <Plus size={16} color={colors.secondary} />
          </Pressable>
        </View>
      </View>

      {/* Nút xóa */}
      <Pressable
        onPress={() => removeItem(item.productId)}
        style={styles.deleteButton}
      >
        <Trash2 size={20} color={colors.primary} />
      </Pressable>
    </View>
  );

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.headerButton}
          >
            <ArrowLeft size={20} color={colors.secondary} />
          </Pressable>
          <Text style={styles.headerTitle}>Giỏ hàng</Text>
          <View style={styles.headerButton} />
        </View>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
          <Text style={styles.emptyText}>
            Hãy thêm sản phẩm yêu thích vào giỏ hàng
          </Text>
          <Pressable
            onPress={() => navigation.navigate('ProductList')}
            style={styles.emptyButton}
          >
            <Text style={styles.emptyButtonText}>Tiếp tục mua sắm</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <ArrowLeft size={20} color={colors.secondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Giỏ hàng ({items.length})</Text>
        <Pressable
          onPress={clearCart}
          style={[styles.headerButton, { opacity: 0.6 }]}
        >
          <Trash2 size={20} color={colors.primary} />
        </Pressable>
      </View>

      {/* Danh sách sản phẩm */}
      <FlatList
        data={items}
        renderItem={renderCartItem}
        keyExtractor={item => item.productId}
        contentContainerStyle={styles.listContent}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.subtotalContainer}>
          <Text style={styles.subtotalLabel}>Tạm tính</Text>
          <Text style={styles.subtotalPrice}>{formatPrice(totalPrice)}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.checkoutButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleCheckout}
        >
          <Text style={styles.checkoutButtonText}>Thanh toán</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
    backgroundColor: '#fff',
    zIndex: 10,
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 120,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  itemImage: {
    width: 72,
    height: 72,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: colors.softPink,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f3f5',
    borderRadius: 999,
    paddingHorizontal: 4,
    paddingVertical: 4,
    width: 90,
  },
  qtyButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.secondary,
    flex: 1,
    textAlign: 'center',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#F1F1F1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 10,
  },
  subtotalContainer: {
    flex: 1,
  },
  subtotalLabel: {
    fontSize: 12,
    color: colors.text,
    marginBottom: 4,
  },
  subtotalPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  checkoutButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default CartScreen;
