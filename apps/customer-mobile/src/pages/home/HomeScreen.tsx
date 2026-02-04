import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  FlatList,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenNavigationProp } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { useLocale } from '../../hooks/useLocale';
import MemberCardWidget from '../../components/MemberCardWidget';
import StampBalanceDisplay from '../../components/StampBalanceDisplay';
import CampaignCard from '../../components/CampaignCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - 32;

const COLORS = {
  primary: '#00694B',
  primaryDark: '#004D36',
  primaryLight: '#E8F5EF',
  accent: '#C4A962',
  accentLight: '#FDF6E3',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#E0E0E0',
};

// ─── Mock Data ───────────────────────────────────────────────────────────────

const mockBanners = [
  {
    id: 'banner_1',
    title: { 'zh-TW': '新春印花三倍賞', 'zh-CN': '新春印花三倍赏', en: 'CNY Triple Stamps' },
    imageUrl: 'https://placehold.co/700x300/00694B/FFFFFF?text=CNY+Triple+Stamps',
    campaignId: 'camp_cny_2024',
  },
  {
    id: 'banner_2',
    title: { 'zh-TW': '全新會員專屬優惠', 'zh-CN': '全新会员专属优惠', en: 'New Member Exclusive' },
    imageUrl: 'https://placehold.co/700x300/C4A962/FFFFFF?text=Member+Exclusive',
    campaignId: 'camp_new_member',
  },
  {
    id: 'banner_3',
    title: { 'zh-TW': '聖誕購物節', 'zh-CN': '圣诞购物节', en: 'Christmas Shopping Festival' },
    imageUrl: 'https://placehold.co/700x300/D32F2F/FFFFFF?text=Christmas+Shopping',
    campaignId: 'camp_xmas',
  },
];

const mockCampaigns = [
  {
    id: 'camp_cny_2024',
    title: { 'zh-TW': '新春印花三倍賞', 'zh-CN': '新春印花三倍赏', en: 'CNY Triple Stamps' },
    description: { 'zh-TW': '農曆新年期間消費可獲三倍印花', 'zh-CN': '农历新年期间消费可获三倍印花', en: 'Earn triple stamps during CNY period' },
    imageUrl: 'https://placehold.co/300x200/00694B/FFFFFF?text=CNY',
    startDate: '2024-02-01',
    endDate: '2024-02-29',
    type: 'stamp_bonus' as const,
    mallName: { 'zh-TW': 'T Town', 'zh-CN': 'T Town', en: 'T Town' },
    isActive: true,
  },
  {
    id: 'camp_lucky',
    title: { 'zh-TW': '新年幸運大抽獎', 'zh-CN': '新年幸运大抽奖', en: 'New Year Lucky Draw' },
    description: { 'zh-TW': '消費滿HK$200即可參與抽獎', 'zh-CN': '消费满HK$200即可参与抽奖', en: 'Spend HK$200+ to join' },
    imageUrl: 'https://placehold.co/300x200/C4A962/FFFFFF?text=Lucky+Draw',
    startDate: '2024-01-15',
    endDate: '2024-03-15',
    type: 'lucky_draw' as const,
    mallName: { 'zh-TW': '九龍城廣場', 'zh-CN': '九龙城广场', en: 'Kowloon City Mall' },
    isActive: true,
  },
  {
    id: 'camp_gift',
    title: { 'zh-TW': '冬日禮品換購', 'zh-CN': '冬日礼品换购', en: 'Winter Gift Redemption' },
    description: { 'zh-TW': '以印花兌換精選冬日禮品', 'zh-CN': '以印花兑换精选冬日礼品', en: 'Redeem stamps for winter gifts' },
    imageUrl: 'https://placehold.co/300x200/7B1FA2/FFFFFF?text=Gifts',
    startDate: '2024-01-01',
    endDate: '2024-02-28',
    type: 'gift_redemption' as const,
    mallName: { 'zh-TW': '赤柱廣場', 'zh-CN': '赤柱广场', en: 'Stanley Plaza' },
    isActive: true,
  },
];

const mockNews = [
  {
    id: 'news_1',
    title: { 'zh-TW': '領展商場推出全新環保倡議', 'zh-CN': '领展商场推出全新环保倡议', en: 'Link Mall Launches New Green Initiative' },
    date: '2024-01-25',
    excerpt: { 'zh-TW': '響應可持續發展，多個商場增設回收設施', 'zh-CN': '响应可持续发展，多个商场增设回收设施', en: 'Supporting sustainability with new recycling facilities across malls' },
  },
  {
    id: 'news_2',
    title: { 'zh-TW': '全新餐飲品牌進駐 T Town', 'zh-CN': '全新餐饮品牌进驻 T Town', en: 'New F&B Brands at T Town' },
    date: '2024-01-20',
    excerpt: { 'zh-TW': '多間人氣餐廳即將開幕', 'zh-CN': '多间人气餐厅即将开幕', en: 'Popular restaurants opening soon' },
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp<'Home'>>();
  const { user, memberDisplayName } = useAuth();
  const { t, locale } = useLocale();

  const [refreshing, setRefreshing] = useState(false);
  const [bannerIndex, setBannerIndex] = useState(0);
  const bannerRef = useRef<FlatList>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  // Auto-scroll banners
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setBannerIndex((prev) => {
        const next = (prev + 1) % mockBanners.length;
        bannerRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
  }, []);

  const quickActions = [
    {
      id: 'scan',
      label: t('home.scanReceipt'),
      icon: 'scan',
      color: COLORS.primary,
      onPress: () => {},
    },
    {
      id: 'coupons',
      label: t('home.myCoupons'),
      icon: 'coupon',
      color: COLORS.accent,
      onPress: () => {},
    },
    {
      id: 'nearby',
      label: t('home.nearbyMall'),
      icon: 'location',
      color: '#1976D2',
      onPress: () => navigation.navigate('MallDirectory', {}),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>
            {t('home.greeting')}, {memberDisplayName}
          </Text>
          <Text style={styles.greetingSubtitle}>
            {user?.tierNameZh || 'Green'} {locale === 'en' ? 'Member' : '會員'}
          </Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <View style={styles.notificationIcon}>
            <View style={styles.notificationDot} />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Member Card Widget */}
        <View style={styles.section}>
          <MemberCardWidget />
        </View>

        {/* Stamp Balance */}
        <View style={styles.section}>
          <StampBalanceDisplay />
        </View>

        {/* Banner Carousel */}
        <View style={styles.bannerSection}>
          <FlatList
            ref={bannerRef}
            data={mockBanners}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / BANNER_WIDTH);
              setBannerIndex(idx);
            }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.bannerItem}
                onPress={() => navigation.navigate('CampaignDetail', { campaignId: item.campaignId })}
                activeOpacity={0.9}
              >
                <View style={styles.bannerImage}>
                  <Text style={styles.bannerImageText}>
                    {item.title[locale as keyof typeof item.title] || item.title.en}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
          <View style={styles.bannerDots}>
            {mockBanners.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, index === bannerIndex && styles.dotActive]}
              />
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.quickActionsRow}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickAction}
                onPress={action.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color + '15' }]}>
                  <View style={[styles.quickActionDot, { backgroundColor: action.color }]} />
                </View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Active Campaigns */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.campaigns')}</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>{t('common.viewAll')}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {mockCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={{
                  id: campaign.id,
                  title: campaign.title[locale as keyof typeof campaign.title] || campaign.title.en,
                  description: campaign.description[locale as keyof typeof campaign.description] || campaign.description.en,
                  imageUrl: campaign.imageUrl,
                  startDate: campaign.startDate,
                  endDate: campaign.endDate,
                  type: campaign.type,
                  mallName: campaign.mallName[locale as keyof typeof campaign.mallName] || campaign.mallName.en,
                  isActive: campaign.isActive,
                }}
                onPress={() => navigation.navigate('CampaignDetail', { campaignId: campaign.id })}
                style={styles.campaignCardItem}
              />
            ))}
          </ScrollView>
        </View>

        {/* News Feed */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.news')}</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>{t('common.viewAll')}</Text>
            </TouchableOpacity>
          </View>
          {mockNews.map((news) => (
            <TouchableOpacity key={news.id} style={styles.newsCard} activeOpacity={0.7}>
              <View style={styles.newsContent}>
                <Text style={styles.newsTitle}>
                  {news.title[locale as keyof typeof news.title] || news.title.en}
                </Text>
                <Text style={styles.newsExcerpt} numberOfLines={2}>
                  {news.excerpt[locale as keyof typeof news.excerpt] || news.excerpt.en}
                </Text>
                <Text style={styles.newsDate}>{news.date}</Text>
              </View>
              <View style={styles.newsImagePlaceholder}>
                <Text style={styles.newsImageText}>IMG</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
  },
  headerLeft: { flex: 1 },
  greeting: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  greetingSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  notificationButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  notificationIcon: {
    width: 20, height: 20, borderWidth: 2, borderColor: '#FFFFFF',
    borderRadius: 4, position: 'relative',
  },
  notificationDot: {
    position: 'absolute', top: -4, right: -4,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#D32F2F',
  },
  section: { paddingHorizontal: 16, marginTop: 16 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  seeAllText: { fontSize: 14, color: COLORS.primary, fontWeight: '500' },
  bannerSection: { marginTop: 16, paddingHorizontal: 16 },
  bannerItem: {
    width: BANNER_WIDTH, height: 150, borderRadius: 12,
    overflow: 'hidden', marginRight: 0,
  },
  bannerImage: {
    flex: 1, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
    borderRadius: 12,
  },
  bannerImageText: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  bannerDots: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', marginTop: 10,
  },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: COLORS.border, marginHorizontal: 3,
  },
  dotActive: { backgroundColor: COLORS.primary, width: 18 },
  quickActionsRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: COLORS.surface, borderRadius: 12,
    paddingVertical: 16, paddingHorizontal: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  quickAction: { alignItems: 'center', flex: 1 },
  quickActionIcon: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  quickActionDot: { width: 22, height: 22, borderRadius: 11 },
  quickActionLabel: { fontSize: 12, fontWeight: '500', color: COLORS.text, textAlign: 'center' },
  campaignCardItem: { marginRight: 12, width: 220 },
  newsCard: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    borderRadius: 12, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  newsContent: { flex: 1, marginRight: 12 },
  newsTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  newsExcerpt: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 6 },
  newsDate: { fontSize: 12, color: COLORS.textTertiary },
  newsImagePlaceholder: {
    width: 72, height: 72, borderRadius: 8,
    backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center',
  },
  newsImageText: { fontSize: 12, color: COLORS.textTertiary },
});
