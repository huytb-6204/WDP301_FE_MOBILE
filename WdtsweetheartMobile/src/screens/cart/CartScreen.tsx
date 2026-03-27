import React, { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    <View style={styles.safe}>
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButtonModern}>
            <ArrowLeft size={22} color={colors.secondary} />
          </Pressable>
          <Text style={styles.headerTitleModern}>Giỏ hàng của bạn</Text>
          <View style={styles.headerBadgeModern}>
            <Text style={styles.badgeTextModern}>{cartCount}</Text>
          </View>
        </View>
      </SafeAreaView>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrapModern}>
            <ShoppingBag size={40} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitleModern}>Giỏ hàng đang trống</Text>
          <Text style={styles.emptyTextModern}>Hãy chọn cho bé cưng những món đồ tuyệt vời nhất nhé!</Text>
          <TouchableOpacity style={styles.browseButtonModern} onPress={() => navigation.navigate('ProductList')}>
            <Text style={styles.browseButtonTextModern}>Khám phá ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.flex1}>
          <View style={styles.selectRowModern}>
            <Pressable onPress={toggleAll} style={styles.selectAllWrap}>
              <View style={[styles.checkBoxModern, isAllChecked && styles.checkBoxActiveModern]}>
                {isAllChecked ? <Check size={12} color="#fff" /> : null}
              </View>
              <Text style={styles.selectAllTextModern}>Chọn tất cả</Text>
            </Pressable>
            <Text style={styles.selectedCountModern}>Đã chọn {checkedCartCount} món</Text>
          </View>

          <ScrollView contentContainerStyle={styles.listModern} showsVerticalScrollIndicator={false}>
            {items.map((item) => (
              <View key={item.lineId} style={[styles.cardModern, item.checked && styles.cardActiveModern]}>
                <Pressable onPress={() => toggleCheck(item.lineId)} style={styles.checkColumnModern}>
                  <View style={[styles.checkBoxModern, item.checked && styles.checkBoxActiveModern]}>
                    {item.checked ? <Check size={12} color="#fff" /> : null}
                  </View>
                </Pressable>

                <View style={styles.cardContentModern}>
                  <View style={styles.cardTopRowModern}>
                    {item.product.primaryImage ? (
                      <Image source={{ uri: item.product.primaryImage }} style={styles.cardImageModern} />
                    ) : (
                      <View style={styles.cardImagePlaceholderModern} />
                    )}
                    <View style={styles.cardMainInfoModern}>
                      <Text style={styles.cardTitleModern} numberOfLines={2}>
                        {item.product.title}
                      </Text>
                      {item.variant && item.variant.length > 0 ? (
                        <View style={styles.variantBadgeModern}>
                           <Text style={styles.variantTextModern}>{item.variant.map((v) => v.label || v.value).join(' / ')}</Text>
                        </View>
                      ) : null}
                      <Text style={styles.cardPriceModern}>{formatPrice(item.product.priceValue)}</Text>
                    </View>
                    <TouchableOpacity onPress={() => removeFromCart(item.lineId)} style={styles.removeCircleModern}>
                      <Trash2 size={16} color="#FF4D4C" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.cardBottomRowModern}>
                    <View style={styles.qtyContainerModern}>
                      <TouchableOpacity onPress={() => updateQuantity(item.lineId, item.quantity - 1)} style={styles.qtyBtnModern}>
                        <Minus size={14} color={colors.secondary} />
                      </TouchableOpacity>
                      <Text style={styles.qtyTextModern}>{item.quantity}</Text>
                      <TouchableOpacity onPress={() => updateQuantity(item.lineId, item.quantity + 1)} style={styles.qtyBtnModern}>
                        <Plus size={14} color={colors.secondary} />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.subtotalContainerModern}>
                        <Text style={styles.subtotalLabelModern}>Thành tiền:</Text>
                        <Text style={styles.subtotalValueModern}>{formatPrice(item.product.priceValue * item.quantity)}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.footerModern}>
            <View style={styles.footerInfoModern}>
              <View>
                <Text style={styles.footerTotalLabelModern}>Tổng thanh toán</Text>
                <Text style={styles.footerTotalValueModern}>{formatPrice(checkedCartTotal)}</Text>
              </View>
              <TouchableOpacity
                style={[styles.checkoutBtnModern, checkedCartCount === 0 && styles.checkoutBtnDisabledModern]}
                onPress={() => checkedCartCount > 0 && navigation.navigate('Checkout')}
                activeOpacity={0.8}
              >
                <Text style={styles.checkoutBtnTextModern}>Thanh toán ({checkedCartCount})</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  flex1: { flex: 1 },
  headerSafe: { backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButtonModern: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleModern: {
    color: colors.secondary,
    fontSize: 17,
    fontWeight: '800',
  },
  headerBadgeModern: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF1F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTextModern: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#fff',
  },
  emptyIconWrapModern: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF1F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitleModern: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.secondary,
    marginBottom: 10,
  },
  emptyTextModern: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  browseButtonModern: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  browseButtonTextModern: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  selectRowModern: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  selectAllWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkBoxModern: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxActiveModern: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectAllTextModern: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.secondary,
  },
  selectedCountModern: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  listModern: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  cardModern: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 16,
    padding: 12,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardActiveModern: {
    borderColor: '#FFE4E6',
    backgroundColor: '#FFFBFB',
  },
  checkColumnModern: {
    justifyContent: 'center',
    paddingRight: 12,
  },
  cardContentModern: {
    flex: 1,
  },
  cardTopRowModern: {
    flexDirection: 'row',
    gap: 12,
  },
  cardImageModern: {
    width: 84,
    height: 84,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
  },
  cardImagePlaceholderModern: {
    width: 84,
    height: 84,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
  },
  cardMainInfoModern: {
    flex: 1,
    gap: 4,
  },
  cardTitleModern: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.secondary,
    lineHeight: 20,
  },
  variantBadgeModern: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  variantTextModern: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  cardPriceModern: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
  },
  removeCircleModern: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF1F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBottomRowModern: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  qtyContainerModern: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 2,
  },
  qtyBtnModern: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  qtyTextModern: {
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '800',
    color: colors.secondary,
  },
  subtotalContainerModern: {
    alignItems: 'flex-end',
  },
  subtotalLabelModern: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 2,
  },
  subtotalValueModern: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.secondary,
  },
  footerModern: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  footerInfoModern: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerTotalLabelModern: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  footerTotalValueModern: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.secondary,
  },
  checkoutBtnModern: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutBtnDisabledModern: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  checkoutBtnTextModern: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});

export default CartScreen;
