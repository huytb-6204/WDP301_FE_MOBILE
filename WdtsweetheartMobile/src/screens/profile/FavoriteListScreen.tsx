import React from 'react';
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
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Heart, ShoppingCart, Trash2 } from 'lucide-react-native';
import { useFavorites } from '../../context/FavoritesContext';
import type { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'FavoriteList'>;

const FavoriteListScreen = () => {
  const navigation = useNavigation<Navigation>();
  const { favorites, removeFavorite } = useFavorites();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yêu thích</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <Heart size={24} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Chưa có sản phẩm yêu thích</Text>
            <Text style={styles.emptyText}>
              Hãy bấm tim ở danh sách hoặc chi tiết sản phẩm để lưu mục yêu thích của bạn.
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => navigation.navigate('ProductList')}>
              <Text style={styles.emptyButtonText}>Mở danh sách sản phẩm</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.favoriteCard}
            activeOpacity={0.9}
            onPress={() => {
              if (item.slug) {
                navigation.navigate('ProductDetail', { productSlug: item.slug, product: item });
              }
            }}
          >
            <Image
              source={{ uri: item.primaryImage || 'https://via.placeholder.com/120' }}
              style={styles.favoriteImage}
            />

            <View style={styles.favoriteContent}>
              <Text style={styles.favoriteTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.favoritePrice}>{item.price}</Text>
              {item.originalPrice ? (
                <Text style={styles.favoriteOriginalPrice}>{item.originalPrice}</Text>
              ) : null}

              <View style={styles.favoriteMetaRow}>
                <View style={styles.favoriteBadge}>
                  <ShoppingCart size={12} color={colors.primary} />
                  <Text style={styles.favoriteBadgeText}>Đã lưu</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeFavorite(item.id)}
                >
                  <Trash2 size={14} color="#D14343" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.softPink,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.secondary,
    fontSize: 18,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flexGrow: 1,
    padding: 16,
    gap: 12,
  },
  emptyCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    alignItems: 'center',
    marginTop: 80,
    backgroundColor: '#fff',
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.softPink,
    marginBottom: 16,
  },
  emptyTitle: {
    color: colors.secondary,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
  },
  emptyText: {
    color: colors.text,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 18,
  },
  emptyButton: {
    minHeight: 44,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  favoriteCard: {
    flexDirection: 'row',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  favoriteImage: {
    width: 108,
    height: 108,
    backgroundColor: '#F3F3F3',
  },
  favoriteContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  favoriteTitle: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  favoritePrice: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 6,
  },
  favoriteOriginalPrice: {
    color: colors.textLight,
    textDecorationLine: 'line-through',
    fontSize: 12,
    marginTop: 2,
  },
  favoriteMetaRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  favoriteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.softPink,
  },
  favoriteBadgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  removeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3F3',
  },
});

export default FavoriteListScreen;
