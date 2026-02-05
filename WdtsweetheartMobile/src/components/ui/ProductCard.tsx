import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../theme/colors';
import type { ProductItem } from '../../types';

type Props = {
  product: ProductItem;
  onPress?: () => void;
};

const ProductCard = ({ product, onPress }: Props) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card} activeOpacity={0.8}>
      <View style={styles.imageWrap}>
        {product.primaryImage ? (
          <Image source={{ uri: product.primaryImage }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
        {product.isSale ? (
          <View style={styles.saleBadge}>
            <Text style={styles.saleText}>SALE</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.body}>
        <View style={styles.ratingRow}>
          {[0, 1, 2, 3, 4].map((idx) => (
            <View
              key={idx}
              style={[styles.star, idx < product.rating ? styles.starActive : styles.starInactive]}
            />
          ))}
        </View>
        <Text numberOfLines={1} style={styles.title}>
          {product.title}
        </Text>
        <Text style={styles.price}>{product.price}</Text>
      </View>
      <View style={styles.cartButton}>
        <View style={styles.cartInner} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.softPink,
    borderRadius: 20,
    overflow: 'hidden',
    paddingBottom: 16,
    minHeight: 290,
  },
  imageWrap: {
    margin: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 170,
  },
  imagePlaceholder: {
    width: '100%',
    height: 170,
    backgroundColor: colors.border,
  },
  saleBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  saleText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  ratingRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  star: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  starActive: {
    backgroundColor: colors.warning,
  },
  starInactive: {
    backgroundColor: '#d9d9d9',
  },
  title: {
    color: colors.secondary,
    fontSize: 16,
    fontWeight: '700',
  },
  price: {
    marginTop: 6,
    color: colors.secondary,
  },
  cartButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 56,
    height: 56,
    borderTopLeftRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
  },
});

export default ProductCard;
