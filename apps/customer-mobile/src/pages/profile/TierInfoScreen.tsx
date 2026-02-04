import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useLocale } from '../../hooks/useLocale';
import TierProgressBar from '../../components/TierProgressBar';

const COLORS = {
  primary: '#00694B',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#E0E0E0',
};

const tiers = [
  {
    key: 'green', color: '#00694B', minStamps: 0,
    name: { 'zh-TW': '綠卡會員', 'zh-CN': '绿卡会员', en: 'Green' },
    benefits: {
      'zh-TW': ['基本印花比率 1:1', '會員專屬優惠', '生日祝賀'],
      'zh-CN': ['基本印花比率 1:1', '会员专属优惠', '生日祝贺'],
      en: ['Base stamp rate 1:1', 'Member-exclusive offers', 'Birthday greetings'],
    },
  },
  {
    key: 'silver', color: '#9E9E9E', minStamps: 500,
    name: { 'zh-TW': '銀卡會員', 'zh-CN': '银卡会员', en: 'Silver' },
    benefits: {
      'zh-TW': ['印花1.2倍', '生日月雙倍印花', '專屬優惠券', '優先參與活動'],
      'zh-CN': ['印花1.2倍', '生日月双倍印花', '专属优惠券', '优先参与活动'],
      en: ['1.2x stamps', 'Birthday month double stamps', 'Exclusive coupons', 'Priority event access'],
    },
  },
  {
    key: 'gold', color: '#C4A962', minStamps: 2000,
    name: { 'zh-TW': '金卡會員', 'zh-CN': '金卡会员', en: 'Gold' },
    benefits: {
      'zh-TW': ['印花1.5倍', '免費泊車2小時/次', '生日月三倍印花', '會員休息室使用', '專屬客服通道'],
      'zh-CN': ['印花1.5倍', '免费停车2小时/次', '生日月三倍印花', '会员休息室使用', '专属客服通道'],
      en: ['1.5x stamps', '2-hour free parking per visit', 'Birthday month triple stamps', 'Member lounge access', 'Priority customer service'],
    },
  },
  {
    key: 'platinum', color: '#424242', minStamps: 5000,
    name: { 'zh-TW': '白金會員', 'zh-CN': '白金会员', en: 'Platinum' },
    benefits: {
      'zh-TW': ['印花2倍', '免費泊車3小時/次', '生日月四倍印花', 'VIP休息室', '專屬禮遇', '優先換購新品'],
      'zh-CN': ['印花2倍', '免费停车3小时/次', '生日月四倍印花', 'VIP休息室', '专属礼遇', '优先换购新品'],
      en: ['2x stamps', '3-hour free parking', 'Birthday month 4x stamps', 'VIP lounge', 'Exclusive perks', 'Priority new gift redemption'],
    },
  },
  {
    key: 'diamond', color: '#7B1FA2', minStamps: 10000,
    name: { 'zh-TW': '鑽石會員', 'zh-CN': '钻石会员', en: 'Diamond' },
    benefits: {
      'zh-TW': ['印花3倍', '免費泊車4小時/次', '生日月五倍印花', '鑽石VIP專屬通道', '全年專屬禮物', '私人活動邀請', '指定商戶額外折扣'],
      'zh-CN': ['印花3倍', '免费停车4小时/次', '生日月五倍印花', '钻石VIP专属通道', '全年专属礼物', '私人活动邀请', '指定商户额外折扣'],
      en: ['3x stamps', '4-hour free parking', 'Birthday month 5x stamps', 'Diamond VIP access', 'Annual exclusive gifts', 'Private event invitations', 'Extra merchant discounts'],
    },
  },
];

export default function TierInfoScreen() {
  const { user, tierColor } = useAuth();
  const { locale } = useLocale();

  const currentTier = user?.tier || 'green';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Current Tier */}
      <View style={styles.currentTierCard}>
        <Text style={styles.currentTierLabel}>
          {locale === 'en' ? 'Your Current Tier' : locale === 'zh-CN' ? '您当前的等级' : '您目前的等級'}
        </Text>
        <View style={[styles.currentTierBadge, { backgroundColor: tierColor }]}>
          <Text style={styles.currentTierName}>{user?.tierNameZh || 'Green'}</Text>
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressSection}>
        <TierProgressBar />
      </View>

      {/* Tier List */}
      {tiers.map((tier) => {
        const isCurrent = tier.key === currentTier;
        const name = tier.name[locale as keyof typeof tier.name] || tier.name.en;
        const benefits = tier.benefits[locale as keyof typeof tier.benefits] || tier.benefits.en;

        return (
          <View
            key={tier.key}
            style={[styles.tierCard, isCurrent && { borderColor: tier.color, borderWidth: 2 }]}
          >
            <View style={styles.tierHeader}>
              <View style={[styles.tierDot, { backgroundColor: tier.color }]} />
              <Text style={[styles.tierName, { color: tier.color }]}>{name}</Text>
              {isCurrent && (
                <View style={[styles.currentBadge, { backgroundColor: tier.color + '20' }]}>
                  <Text style={[styles.currentBadgeText, { color: tier.color }]}>
                    {locale === 'en' ? 'Current' : '目前'}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.tierRequirement}>
              {tier.minStamps === 0
                ? (locale === 'en' ? 'Free upon registration' : locale === 'zh-CN' ? '注册即可成为' : '註冊即可成為')
                : `${locale === 'en' ? 'Annual stamps:' : '年度印花：'} ${tier.minStamps.toLocaleString()}`}
            </Text>
            <View style={styles.benefitsList}>
              {benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <View style={[styles.benefitDot, { backgroundColor: tier.color }]} />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      })}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 32 },
  currentTierCard: {
    alignItems: 'center', backgroundColor: COLORS.surface,
    padding: 24, borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  currentTierLabel: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 10 },
  currentTierBadge: {
    paddingHorizontal: 24, paddingVertical: 8, borderRadius: 20,
  },
  currentTierName: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  progressSection: { paddingHorizontal: 16, paddingVertical: 12 },
  tierCard: {
    backgroundColor: COLORS.surface, marginHorizontal: 16, marginTop: 12,
    borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  tierHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  tierDot: { width: 12, height: 12, borderRadius: 6 },
  tierName: { fontSize: 17, fontWeight: '700' },
  currentBadge: { paddingHorizontal: 10, paddingVertical: 2, borderRadius: 8 },
  currentBadgeText: { fontSize: 11, fontWeight: '600' },
  tierRequirement: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 12 },
  benefitsList: {},
  benefitItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5, gap: 8 },
  benefitDot: { width: 5, height: 5, borderRadius: 2.5 },
  benefitText: { fontSize: 14, color: COLORS.text, flex: 1 },
});
