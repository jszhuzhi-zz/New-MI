import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { OffersScreenNavigationProp } from '../../navigation/types';
import { useLocale } from '../../hooks/useLocale';
import CampaignCard from '../../components/CampaignCard';
import CouponCard from '../../components/CouponCard';

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
};

type OffersTab = 'campaigns' | 'coupons' | 'lucky_draw' | 'gifts';

const mockCampaigns = [
  {
    id: 'camp_1', title: '新春印花三倍賞', description: '農曆新年消費可獲三倍印花',
    imageUrl: '', startDate: '2024-02-01', endDate: '2024-02-29',
    type: 'stamp_bonus' as const, mallName: 'T Town', isActive: true,
  },
  {
    id: 'camp_2', title: '情人節甜蜜獎賞', description: '指定商戶消費享雙倍印花',
    imageUrl: '', startDate: '2024-02-10', endDate: '2024-02-14',
    type: 'stamp_bonus' as const, mallName: '九龍城廣場', isActive: true,
  },
  {
    id: 'camp_3', title: '新春幸運大抽獎', description: '消費滿HK$200參與抽獎',
    imageUrl: '', startDate: '2024-01-15', endDate: '2024-03-15',
    type: 'lucky_draw' as const, mallName: '赤柱廣場', isActive: true,
  },
];

const mockCoupons = [
  {
    id: 'cpn_1', title: 'Starbucks 九折優惠', description: '指定飲品享九折',
    merchantName: 'Starbucks', mallName: 'T Town', code: 'LM-STB-2024',
    expiryDate: '2024-03-31', status: 'active' as const, imageUrl: '',
    terms: ['每人限用一次', '不可與其他優惠同時使用'],
  },
  {
    id: 'cpn_2', title: 'MUJI 滿$300減$30', description: '消費滿HK$300即減HK$30',
    merchantName: 'MUJI', mallName: 'T Town', code: 'LM-MUJI-30',
    expiryDate: '2024-02-28', status: 'active' as const, imageUrl: '',
    terms: ['每人限用一次'],
  },
];

const mockGifts = [
  { id: 'gift_1', name: '保溫杯', stampCost: 500, stock: 120, category: 'lifestyle' },
  { id: 'gift_2', name: '環保袋', stampCost: 200, stock: 300, category: 'lifestyle' },
  { id: 'gift_3', name: 'HK$50現金券', stampCost: 800, stock: 50, category: 'voucher' },
  { id: 'gift_4', name: '電影禮券', stampCost: 600, stock: 80, category: 'entertainment' },
];

const categories = [
  { key: 'all', label: { 'zh-TW': '全部', 'zh-CN': '全部', en: 'All' } },
  { key: 'dining', label: { 'zh-TW': '餐飲', 'zh-CN': '餐饮', en: 'Dining' } },
  { key: 'shopping', label: { 'zh-TW': '購物', 'zh-CN': '购物', en: 'Shopping' } },
  { key: 'lifestyle', label: { 'zh-TW': '生活', 'zh-CN': '生活', en: 'Lifestyle' } },
  { key: 'entertainment', label: { 'zh-TW': '娛樂', 'zh-CN': '娱乐', en: 'Entertainment' } },
];

export default function OffersScreen() {
  const navigation = useNavigation<OffersScreenNavigationProp<'Offers'>>();
  const { t, locale } = useLocale();

  const [activeTab, setActiveTab] = useState<OffersTab>('campaigns');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchText, setSearchText] = useState('');

  const tabs: { key: OffersTab; label: string }[] = [
    { key: 'campaigns', label: t('offers.campaigns') },
    { key: 'coupons', label: t('offers.coupons') },
    { key: 'lucky_draw', label: t('offers.luckyDraw') },
    { key: 'gifts', label: t('offers.gifts') },
  ];

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarContent}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryBar} contentContainerStyle={styles.categoryContent}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.categoryChip, selectedCategory === cat.key && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(cat.key)}
          >
            <Text style={[styles.categoryText, selectedCategory === cat.key && styles.categoryTextActive]}>
              {cat.label[locale as keyof typeof cat.label] || cat.label.en}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Campaigns */}
        {activeTab === 'campaigns' && (
          <View style={styles.listSection}>
            {mockCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onPress={() => navigation.navigate('CampaignDetail', { campaignId: campaign.id })}
                style={styles.campaignItem}
                horizontal
              />
            ))}
          </View>
        )}

        {/* Coupons */}
        {activeTab === 'coupons' && (
          <View style={styles.listSection}>
            <TouchableOpacity
              style={styles.viewCouponsButton}
              onPress={() => navigation.navigate('CouponList')}
            >
              <Text style={styles.viewCouponsText}>
                {locale === 'en' ? 'View My Coupons' : locale === 'zh-CN' ? '查看我的优惠券' : '查看我的優惠券'}
              </Text>
              <Text style={styles.viewCouponsArrow}>{'>'}</Text>
            </TouchableOpacity>
            <Text style={styles.sectionLabel}>
              {locale === 'en' ? 'Available Coupons' : locale === 'zh-CN' ? '可领取优惠券' : '可領取優惠券'}
            </Text>
            {mockCoupons.map((coupon) => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                onPress={() => navigation.navigate('CouponDetail', { couponId: coupon.id })}
              />
            ))}
          </View>
        )}

        {/* Lucky Draw */}
        {activeTab === 'lucky_draw' && (
          <View style={styles.listSection}>
            <TouchableOpacity
              style={styles.luckyDrawCard}
              onPress={() => navigation.navigate('LuckyDraw', { campaignId: 'camp_3' })}
              activeOpacity={0.8}
            >
              <View style={styles.luckyDrawBanner}>
                <Text style={styles.luckyDrawBannerTitle}>
                  {locale === 'en' ? 'New Year Lucky Draw' : locale === 'zh-CN' ? '新年幸运大抽奖' : '新年幸運大抽獎'}
                </Text>
                <Text style={styles.luckyDrawBannerSubtitle}>
                  {locale === 'en' ? 'Spin to win amazing prizes!' : locale === 'zh-CN' ? '转动轮盘赢取丰富奖品！' : '轉動輪盤贏取豐富獎品！'}
                </Text>
              </View>
              <View style={styles.luckyDrawInfo}>
                <Text style={styles.luckyDrawChances}>
                  {locale === 'en' ? '3 chances remaining' : locale === 'zh-CN' ? '剩余3次机会' : '剩餘3次機會'}
                </Text>
                <View style={styles.luckyDrawButton}>
                  <Text style={styles.luckyDrawButtonText}>
                    {locale === 'en' ? 'Play Now' : locale === 'zh-CN' ? '立即参与' : '立即參與'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Gifts */}
        {activeTab === 'gifts' && (
          <View style={styles.listSection}>
            <TouchableOpacity
              style={styles.viewGiftsButton}
              onPress={() => navigation.navigate('GiftCatalog')}
            >
              <Text style={styles.viewGiftsText}>
                {locale === 'en' ? 'Browse Full Catalog' : locale === 'zh-CN' ? '浏览完整目录' : '瀏覽完整目錄'}
              </Text>
              <Text style={styles.viewGiftsArrow}>{'>'}</Text>
            </TouchableOpacity>
            <View style={styles.giftGrid}>
              {mockGifts.map((gift) => (
                <TouchableOpacity
                  key={gift.id}
                  style={styles.giftCard}
                  onPress={() => navigation.navigate('GiftRedemption', { giftId: gift.id })}
                  activeOpacity={0.7}
                >
                  <View style={styles.giftImage}>
                    <Text style={styles.giftImageText}>{gift.name.charAt(0)}</Text>
                  </View>
                  <Text style={styles.giftName} numberOfLines={1}>{gift.name}</Text>
                  <View style={styles.giftCost}>
                    <Text style={styles.giftCostText}>{gift.stampCost}</Text>
                    <Text style={styles.giftCostLabel}>{locale === 'en' ? 'stamps' : '印花'}</Text>
                  </View>
                  <Text style={styles.giftStock}>
                    {t('offers.remaining')}: {gift.stock}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  tabBar: { backgroundColor: COLORS.surface, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  tabBarContent: { paddingHorizontal: 12 },
  tab: { paddingHorizontal: 16, paddingVertical: 12, marginHorizontal: 2 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabText: { fontSize: 14, fontWeight: '500', color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.primary, fontWeight: '600' },
  categoryBar: { backgroundColor: COLORS.surface, maxHeight: 48, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  categoryContent: { paddingHorizontal: 12, alignItems: 'center' },
  categoryChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16,
    backgroundColor: COLORS.background, marginHorizontal: 4,
  },
  categoryChipActive: { backgroundColor: COLORS.primary },
  categoryText: { fontSize: 12, color: COLORS.textSecondary },
  categoryTextActive: { color: '#FFFFFF', fontWeight: '600' },
  content: { flex: 1 },
  listSection: { padding: 16 },
  campaignItem: { marginBottom: 12 },
  viewCouponsButton: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.primaryLight, borderRadius: 10, padding: 14,
    marginBottom: 16, borderWidth: 1, borderColor: COLORS.primary + '30',
  },
  viewCouponsText: { fontSize: 15, fontWeight: '600', color: COLORS.primary },
  viewCouponsArrow: { fontSize: 16, color: COLORS.primary },
  sectionLabel: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 12 },
  luckyDrawCard: {
    backgroundColor: COLORS.surface, borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  luckyDrawBanner: {
    backgroundColor: COLORS.accent, padding: 24, alignItems: 'center',
  },
  luckyDrawBannerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  luckyDrawBannerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  luckyDrawInfo: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 16,
  },
  luckyDrawChances: { fontSize: 14, color: COLORS.textSecondary },
  luckyDrawButton: {
    backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20,
  },
  luckyDrawButtonText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  viewGiftsButton: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.accentLight, borderRadius: 10, padding: 14,
    marginBottom: 16, borderWidth: 1, borderColor: COLORS.accent + '30',
  },
  viewGiftsText: { fontSize: 15, fontWeight: '600', color: COLORS.accent },
  viewGiftsArrow: { fontSize: 16, color: COLORS.accent },
  giftGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  giftCard: {
    width: '47%', backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  giftImage: {
    width: '100%', height: 100, borderRadius: 8, backgroundColor: COLORS.background,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  giftImageText: { fontSize: 28, color: COLORS.textTertiary },
  giftName: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  giftCost: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  giftCostText: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  giftCostLabel: { fontSize: 12, color: COLORS.textSecondary },
  giftStock: { fontSize: 11, color: COLORS.textTertiary, marginTop: 4 },
  accentLight: '#FDF6E3',
});
