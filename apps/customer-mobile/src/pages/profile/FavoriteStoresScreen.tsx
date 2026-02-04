import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocale } from '../../hooks/useLocale';
import { Merchant } from '../../navigation/types';

const COLORS = {
  primary: '#00694B',
  primaryLight: '#E8F5EF',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#E0E0E0',
  error: '#D32F2F',
};

const mockFavorites: Merchant[] = [
  {
    id: 'merch_1', name: '大家樂', category: 'dining', mallId: 'mall_t1', mallName: 'T Town',
    floor: 'L2', unit: '218', imageUrl: '', stampMultiplier: 1, isFavorite: true, phone: '2345-6789',
  },
  {
    id: 'merch_2', name: 'UNIQLO', category: 'shopping', mallId: 'mall_kcm', mallName: '九龍城廣場',
    floor: 'L1', unit: '105', imageUrl: '', stampMultiplier: 1, isFavorite: true,
  },
  {
    id: 'merch_3', name: 'MUJI', category: 'shopping', mallId: 'mall_t1', mallName: 'T Town',
    floor: 'L3', unit: '301', imageUrl: '', stampMultiplier: 1.5, isFavorite: true,
  },
  {
    id: 'merch_4', name: 'Starbucks', category: 'dining', mallId: 'mall_stanley', mallName: '赤柱廣場',
    floor: 'G', unit: '012', imageUrl: '', stampMultiplier: 1, isFavorite: true,
  },
  {
    id: 'merch_5', name: '翠華餐廳', category: 'dining', mallId: 'mall_kcm', mallName: '九龍城廣場',
    floor: 'L2', unit: '208', imageUrl: '', stampMultiplier: 1, isFavorite: true,
  },
];

export default function FavoriteStoresScreen() {
  const { t, locale } = useLocale();
  const [favorites, setFavorites] = useState(mockFavorites);

  const handleRemove = (id: string, name: string) => {
    const msg = locale === 'en' ? `Remove ${name} from favorites?` : `從收藏中移除 ${name}？`;
    Alert.alert('', msg, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => setFavorites((prev) => prev.filter((m) => m.id !== id)),
      },
    ]);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, Record<string, string>> = {
      dining: { 'zh-TW': '餐飲', 'zh-CN': '餐饮', en: 'Dining' },
      shopping: { 'zh-TW': '購物', 'zh-CN': '购物', en: 'Shopping' },
      service: { 'zh-TW': '服務', 'zh-CN': '服务', en: 'Services' },
    };
    return labels[category]?.[locale] || category;
  };

  const renderStore = ({ item }: { item: Merchant }) => (
    <View style={styles.storeCard}>
      <View style={styles.storeImage}>
        <Text style={styles.storeInitial}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.storeInfo}>
        <Text style={styles.storeName}>{item.name}</Text>
        <Text style={styles.storeMeta}>
          {item.mallName} | {item.floor}-{item.unit}
        </Text>
        <View style={styles.storeTagRow}>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryTagText}>{getCategoryLabel(item.category)}</Text>
          </View>
          {item.stampMultiplier > 1 && (
            <View style={styles.bonusTag}>
              <Text style={styles.bonusTagText}>{item.stampMultiplier}x {locale === 'en' ? 'stamps' : '印花'}</Text>
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemove(item.id, item.name)}
      >
        <Text style={styles.removeButtonText}>x</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      data={favorites}
      keyExtractor={(item) => item.id}
      renderItem={renderStore}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{t('common.noData')}</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  listContent: { padding: 16, paddingBottom: 32 },
  storeCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  storeImage: {
    width: 52, height: 52, borderRadius: 10,
    backgroundColor: COLORS.primaryLight, justifyContent: 'center',
    alignItems: 'center', marginRight: 12,
  },
  storeInitial: { fontSize: 22, fontWeight: '700', color: COLORS.primary },
  storeInfo: { flex: 1 },
  storeName: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  storeMeta: { fontSize: 13, color: COLORS.textTertiary, marginTop: 2 },
  storeTagRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  categoryTag: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4,
    backgroundColor: COLORS.background,
  },
  categoryTagText: { fontSize: 11, color: COLORS.textSecondary },
  bonusTag: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4,
    backgroundColor: COLORS.primaryLight,
  },
  bonusTagText: { fontSize: 11, fontWeight: '600', color: COLORS.primary },
  removeButton: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.background, justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: { fontSize: 14, fontWeight: '600', color: COLORS.textTertiary },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 14, color: COLORS.textTertiary },
});
