import React, { useMemo } from 'react';
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Check, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { formatPrice } from '../../utils';
import type { RootStackParamList } from '../../navigation/types';
import { useCart } from '../../context/CartContext';

const CartScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    cartCount,
    checkedCartCount,
    checkedCartTotal,
    toggleCheck,
    toggleAll,
  } = useCart();

  const items = useMemo(() => cartItems, [cartItems]);
  const isAllChecked = items.length > 0 && items.every((item) => item.checked);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerButton}>
          <ArrowLeft size={20} color={colors.secondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Giỏ hàng</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{cartCount}</Text>
        </View>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrap}>
            <ShoppingBag size={34} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
          <Text style={styles.emptyText}>Thêm sản phẩm để tiếp tục mua sắm.</Text>
          <Pressable style={styles.browseButton} onPress={() => navigation.navigate('ProductList')}>
            <Text style={styles.browseButtonText}>Mở danh sách sản phẩm</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.selectRow}>
            <Pressable onPress={toggleAll} style={styles.selectAllWrap}>
              <View style={[styles.checkBox, isAllChecked && styles.checkBoxActive]}>
                {isAllChecked ? <Check size={12} color="#fff" /> : null}
              </View>
              <Text style={styles.selectAllText}>Chọn tất cả</Text>
            </Pressable>
            <Text style={styles.selectedCount}>{checkedCartCount} sản phẩm</Text>
          </View>

          <ScrollView contentContainerStyle={styles.list}>
            {items.map((item) => (
              <View key={item.lineId} style={[styles.card, item.checked && styles.cardActive]}>
                <Pressable onPress={() => toggleCheck(item.lineId)} style={styles.checkColumn}>
                  <View style={[styles.checkBox, item.checked && styles.checkBoxActive]}>
                    {item.checked ? <Check size={12} color="#fff" /> : null}
                  </View>
                </Pressable>

                {item.product.primaryImage ? (
                  <Image source={{ uri: item.product.primaryImage }} style={styles.cardImage} />
                ) : (
                  <View style={styles.cardImagePlaceholder} />
                )}

                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.product.title}
                  </Text>
                  {item.variant && item.variant.length > 0 ? (
                    <Text style={styles.variantText}>{item.variant.map((variant) => variant.label || variant.value).join(' / ')}</Text>
                  ) : null}
                  <Text style={styles.cardPrice}>{formatPrice(item.product.priceValue)}</Text>

                  <View style={styles.bottomRow}>
                    <View style={styles.qtyRow}>
                      <Pressable onPress={() => updateQuantity(item.lineId, item.quantity - 1)} style={styles.qtyButton}>
                        <Minus size={16} color={colors.text} />
                      </Pressable>
                      <Text style={styles.qtyValue}>{item.quantity}</Text>
                      <Pressable onPress={() => updateQuantity(item.lineId, item.quantity + 1)} style={styles.qtyButton}>
                        <Plus size={16} color={colors.text} />
                      </Pressable>
                    </View>
                    <Text style={styles.lineTotal}>{formatPrice(item.product.priceValue * item.quantity)}</Text>
                  </View>
                </View>

                <Pressable onPress={() => removeFromCart(item.lineId)} style={styles.removeButton}>
                  <Trash2 size={18} color={colors.text} />
                </Pressable>
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>{formatPrice(checkedCartTotal)}</Text>
            <Pressable
              style={[styles.checkoutButton, checkedCartCount === 0 && styles.checkoutButtonDisabled]}
              onPress={() => checkedCartCount > 0 && navigation.navigate('Checkout')}
            >
              <Text style={styles.checkoutText}>Tiếp tục thanh toán</Text>
            </Pressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
    backgroundColor: '#fff',
  },
  headerTitle: { color: colors.secondary, fontSize: 18, fontWeight: '700' },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.softPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadge: {
    minWidth: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.softPink,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  headerBadgeText: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  selectRow: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectAllWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#D5D5D5',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkBoxActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  selectAllText: { color: colors.secondary, fontWeight: '600' },
  selectedCount: { color: colors.text, fontSize: 12 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.softPink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.secondary },
  emptyText: { fontSize: 14, color: colors.text, marginTop: 8, marginBottom: 20, textAlign: 'center' },
  browseButton: { backgroundColor: colors.primary, borderRadius: 999, paddingHorizontal: 18, paddingVertical: 12 },
  browseButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  list: { padding: 20, paddingBottom: 150 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3E8E8',
  },
  cardActive: { borderColor: '#F6B0B0', backgroundColor: '#FFFDFD' },
  checkColumn: { paddingRight: 10 },
  cardImage: { width: 80, height: 80, borderRadius: 12, backgroundColor: colors.softPink },
  cardImagePlaceholder: { width: 80, height: 80, borderRadius: 12, backgroundColor: colors.border },
  cardBody: { flex: 1, marginLeft: 12 },
  cardTitle: { color: colors.secondary, fontSize: 14, fontWeight: '600' },
  variantText: { color: '#8B7A7A', fontSize: 12, marginTop: 4 },
  cardPrice: { color: colors.primary, fontSize: 14, fontWeight: '700', marginTop: 4 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, gap: 12 },
  qtyRow: { flexDirection: 'row', alignItems: 'center' },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.softPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: { marginHorizontal: 8, fontSize: 14, color: colors.text, minWidth: 20, textAlign: 'center' },
  lineTotal: { color: colors.secondary, fontSize: 14, fontWeight: '700' },
  removeButton: { paddingLeft: 8 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F3E8E8',
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
  checkoutButtonDisabled: { opacity: 0.45 },
  checkoutText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default CartScreen;
