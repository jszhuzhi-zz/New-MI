import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { OffersScreenNavigationProp } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { useLocale } from '../../hooks/useLocale';

const COLORS = {
  primary: '#00694B',
  primaryLight: '#E8F5EF',
  accent: '#C4A962',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#E0E0E0',
  error: '#D32F2F',
};

interface GiftItem {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  stampCost: number;
  stock: number;
  category: string;
  imageUrl: string;
  isHot: boolean;
}

const mockGifts: GiftItem[] = [
  {
    id: 'gift_1',
    name: { 'zh-TW': '不鏽鋼保溫杯', 'zh-CN': '不锈钢保温杯', en: 'Stainless Steel Tumbler' },
    description: { 'zh-TW': '500ml 真空保溫', 'zh-CN': '500ml 真空保温', en: '500ml vacuum insulated' },
    stampCost: 500, stock: 120, category: 'lifestyle', imageUrl: '', isHot: true,
  },
  {
    id: 'gift_2',
    name: { 'zh-TW': '環保購物袋', 'zh-CN': '环保购物袋', en: 'Eco Tote Bag' },
    description: { 'zh-TW': '可摺疊環保袋', 'zh-CN': '可折叠环保袋', en: 'Foldable eco bag' },
    stampCost: 200, stock: 300, category: 'lifestyle', imageUrl: '', isHot: false,
  },
  {
    id: 'gift_3',
    name: { 'zh-TW': 'HK$50 現金券', 'zh-CN': 'HK$50 现金券', en: 'HK$50 Cash Voucher' },
    description: { 'zh-TW': '適用於所有參與商場', 'zh-CN': '适用于所有参与商场', en: 'Valid at all participating malls' },
    stampCost: 800, stock: 50, category: 'voucher', imageUrl: '', isHot: true,
  },
  {
    id: 'gift_4',
    name: { 'zh-TW': '電影禮券', 'zh-CN': '电影礼券', en: 'Movie Tickets' },
    description: { 'zh-TW': '2張百老匯電影券', 'zh-CN': '2张百老汇电影券', en: '2x Broadway cinema tickets' },
    stampCost: 600, stock: 80, category: 'entertainment', imageUrl: '', isHot: false,
  },
  {
    id: 'gift_5',
    name: { 'zh-TW': 'Starbucks 飲品券', 'zh-CN': 'Starbucks 饮品券', en: 'Starbucks Drink Voucher' },
    description: { 'zh-TW': '任選大杯手工調配飲品', 'zh-CN': '任选大杯手工调配饮品', en: 'Any Grande handcrafted drink' },
    stampCost: 350, stock: 200, category: 'dining', imageUrl: '', isHot: true,
  },
  {
    id: 'gift_6',
    name: { 'zh-TW': '免費泊車券 (2小時)', 'zh-CN': '免费停车券 (2小时)', en: 'Free Parking (2hrs)' },
    description: { 'zh-TW': '適用於指定商場', 'zh-CN': '适用于指定商场', en: 'Valid at selected malls' },
    stampCost: 400, stock: 150, category: 'service', imageUrl: '', isHot: false,
  },
];

const categoryFilters = [
  { key: 'all', label: { 'zh-TW': '全部', 'zh-CN': '全部', en: 'All' } },
  { key: 'voucher', label: { 'zh-TW': '現金券', 'zh-CN': '现金券', en: 'Vouchers' } },
  { key: 'dining', label: { 'zh-TW': '餐飲', 'zh-CN': '餐饮', en: 'Dining' } },
  { key: 'lifestyle', label: { 'zh-TW': '生活', 'zh-CN': '生活', en: 'Lifestyle' } },
  { key: 'entertainment', label: { 'zh-TW': '娛樂', 'zh-CN': '娱乐', en: 'Entertainment' } },
  { key: 'service', label: { 'zh-TW': '服務', 'zh-CN': '服务', en: 'Service' } },
];

export default function GiftCatalogScreen() {
  const navigation = useNavigation<OffersScreenNavigationProp<'GiftCatalog'>>();
  const { user } = useAuth();
  const { t, locale } = useLocale();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchText, setSearchText] = useState('');

  const filteredGifts = mockGifts.filter((gift) => {
    const matchCategory = selectedCategory === 'all' || gift.category === selectedCategory;
    const matchSearch = !searchText || gift.name[locale]?.toLowerCase().includes(searchText.toLowerCase());
    return matchCategory && matchSearch;
  });

  const stampBalance = user?.stampBalance || 2680;

  const renderGift = ({ item }: { item: GiftItem }) => {
    const canAfford = stampBalance >= item.stampCost;
    const name = item.name[locale] || item.name.en;
    const desc = item.description[locale] || item.description.en;

    return (
      <TouchableOpacity
        style={styles.giftCard}
        onPress={() => navigation.navigate('GiftRedemption', { giftId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.giftImageContainer}>
          <View style={styles.giftImage}>
            <Text style={styles.giftImageText}>{name.charAt(0)}</Text>
          </View>
          {item.isHot && (
            <View style={styles.hotBadge}>
              <Text style={styles.hotBadgeText}>HOT</Text>
            </View>
          )}
        </View>
        <View style={styles.giftInfo}>
          <Text style={styles.giftName} numberOfLines={1}>{name}</Text>
          <Text style={styles.giftDesc} numberOfLines={1}>{desc}</Text>
          <View style={styles.giftBottom}>
            <View style={styles.giftCostRow}>
              <Text style={[styles.giftCost, !canAfford && styles.giftCostInsufficient]}>
                {item.stampCost}
              </Text>
              <Text style={styles.giftCostLabel}>{locale === 'en' ? 'stamps' : '印花'}</Text>
            </View>
            <Text style={styles.giftStock}>{t('offers.remaining')}: {item.stock}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Balance Header */}
      <View style={styles.balanceBar}>
        <Text style={styles.balanceLabel}>
          {locale === 'en' ? 'Your Stamps' : locale === 'zh-CN' ? '您的印花' : '您的印花'}
        </Text>
        <Text style={styles.balanceAmount}>{stampBalance.toLocaleString()}</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('common.search')}
          placeholderTextColor={COLORS.textTertiary}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Category Filters */}
      <FlatList
        data={categoryFilters}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryBar}
        contentContainerStyle={styles.categoryContent}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.categoryChip, selectedCategory === item.key && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(item.key)}
          >
            <Text style={[styles.categoryText, selectedCategory === item.key && styles.categoryTextActive]}>
              {item.label[locale as keyof typeof item.label] || item.label.en}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Gift Grid */}
      <FlatList
        data={filteredGifts}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.gridRow}
        showsVerticalScrollIndicator={false}
        renderItem={renderGift}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{t('common.noData')}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  balanceBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 14,
  },
  balanceLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  balanceAmount: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  searchContainer: { paddingHorizontal: 16, paddingTop: 12 },
  searchInput: {
    height: 44, backgroundColor: COLORS.surface, borderRadius: 10,
    paddingHorizontal: 16, fontSize: 14, color: COLORS.text,
    borderWidth: 1, borderColor: COLORS.border,
  },
  categoryBar: { maxHeight: 48, marginTop: 8 },
  categoryContent: { paddingHorizontal: 12 },
  categoryChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16,
    backgroundColor: COLORS.surface, marginHorizontal: 4,
    borderWidth: 1, borderColor: COLORS.border,
  },
  categoryChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryText: { fontSize: 12, color: COLORS.textSecondary },
  categoryTextActive: { color: '#FFFFFF', fontWeight: '600' },
  gridContent: { padding: 12, paddingBottom: 32 },
  gridRow: { gap: 12, marginBottom: 12 },
  giftCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12,
    overflow: 'hidden', shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04,
    shadowRadius: 4, elevation: 1,
  },
  giftImageContainer: { position: 'relative' },
  giftImage: {
    height: 120, backgroundColor: COLORS.background,
    justifyContent: 'center', alignItems: 'center',
  },
  giftImageText: { fontSize: 32, color: COLORS.textTertiary },
  hotBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: COLORS.error, paddingHorizontal: 8,
    paddingVertical: 2, borderRadius: 4,
  },
  hotBadgeText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  giftInfo: { padding: 12 },
  giftName: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  giftDesc: { fontSize: 12, color: COLORS.textTertiary, marginBottom: 8 },
  giftBottom: {},
  giftCostRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  giftCost: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  giftCostInsufficient: { color: COLORS.error },
  giftCostLabel: { fontSize: 12, color: COLORS.textSecondary },
  giftStock: { fontSize: 11, color: COLORS.textTertiary, marginTop: 4 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 14, color: COLORS.textTertiary },
});
