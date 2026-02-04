import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { OffersScreenRouteProp } from '../../navigation/types';
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
  success: '#2E7D32',
};

const mockCampaignDetail = {
  id: 'camp_cny_2024',
  title: { 'zh-TW': '新春印花三倍賞', 'zh-CN': '新春印花三倍赏', en: 'CNY Triple Stamps' },
  description: {
    'zh-TW': '農曆新年期間（2024年2月1日至29日），於領展旗下指定商場消費滿HK$100或以上，掃描小票即可獲得三倍印花！活動期間每位會員最高可獲額外50,000印花。把握新春佳節，盡享三倍獎賞！',
    'zh-CN': '农历新年期间（2024年2月1日至29日），于领展旗下指定商场消费满HK$100或以上，扫描小票即可获得三倍印花！活动期间每位会员最高可获额外50,000印花。把握新春佳节，尽享三倍奖赏！',
    en: 'During CNY period (Feb 1-29, 2024), earn triple stamps on purchases of HK$100+ at participating Link malls! Maximum 50,000 bonus stamps per member. Celebrate the festive season with triple rewards!',
  },
  imageUrl: '',
  startDate: '2024-02-01',
  endDate: '2024-02-29',
  type: 'stamp_bonus',
  participatingMalls: [
    { name: 'T Town', address: '屯門屯順街1號' },
    { name: '九龍城廣場', address: '九龍城賈炳達道128號' },
    { name: '赤柱廣場', address: '赤柱赤柱村道23號' },
  ],
  terms: {
    'zh-TW': [
      '活動期間：2024年2月1日至2月29日',
      '適用於所有領展會員等級',
      '每筆消費需滿HK$100或以上',
      '每位會員最高可獲額外50,000印花',
      '小票需於消費當日起7天內提交',
      '不可與其他印花加倍活動疊加使用',
      '領展保留最終解釋權',
    ],
    'zh-CN': [
      '活动期间：2024年2月1日至2月29日',
      '适用于所有领展会员等级',
      '每笔消费需满HK$100或以上',
      '每位会员最高可获额外50,000印花',
      '小票需于消费当日起7天内提交',
      '不可与其他印花加倍活动叠加使用',
      '领展保留最终解释权',
    ],
    en: [
      'Campaign period: Feb 1 - Feb 29, 2024',
      'Available to all Link Mall membership tiers',
      'Minimum spend of HK$100 per transaction',
      'Maximum 50,000 bonus stamps per member',
      'Receipts must be submitted within 7 days of purchase',
      'Cannot be combined with other stamp bonus campaigns',
      'Link REIT reserves the right of final interpretation',
    ],
  },
};

export default function CampaignDetailScreen() {
  const route = useRoute<OffersScreenRouteProp<'CampaignDetail'>>();
  const { locale } = useLocale();

  const campaign = mockCampaignDetail;
  const title = campaign.title[locale as keyof typeof campaign.title] || campaign.title.en;
  const description = campaign.description[locale as keyof typeof campaign.description] || campaign.description.en;
  const terms = campaign.terms[locale as keyof typeof campaign.terms] || campaign.terms.en;

  const handleShare = async () => {
    try {
      await Share.share({ message: `${title} - Link Mall` });
    } catch (error) {}
  };

  const labels = {
    period: locale === 'en' ? 'Campaign Period' : locale === 'zh-CN' ? '活动期间' : '活動期間',
    malls: locale === 'en' ? 'Participating Malls' : locale === 'zh-CN' ? '参与商场' : '參與商場',
    terms: locale === 'en' ? 'Terms & Conditions' : locale === 'zh-CN' ? '条款及细则' : '條款及細則',
    share: locale === 'en' ? 'Share' : locale === 'zh-CN' ? '分享' : '分享',
    participate: locale === 'en' ? 'Participate Now' : locale === 'zh-CN' ? '立即参与' : '立即參與',
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>{title}</Text>
          <View style={styles.periodBadge}>
            <Text style={styles.periodText}>
              {campaign.startDate} ~ {campaign.endDate}
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.descriptionText}>{description}</Text>
        </View>

        {/* Participating Malls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{labels.malls}</Text>
          {campaign.participatingMalls.map((mall, index) => (
            <View key={index} style={styles.mallItem}>
              <View style={styles.mallDot} />
              <View>
                <Text style={styles.mallName}>{mall.name}</Text>
                <Text style={styles.mallAddress}>{mall.address}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Terms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{labels.terms}</Text>
          {terms.map((term, index) => (
            <View key={index} style={styles.termItem}>
              <Text style={styles.termNumber}>{index + 1}.</Text>
              <Text style={styles.termText}>{term}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>{labels.share}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.participateButton}>
          <Text style={styles.participateButtonText}>{labels.participate}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  heroSection: {
    backgroundColor: COLORS.primary, paddingHorizontal: 20,
    paddingVertical: 28, alignItems: 'center',
  },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', marginBottom: 12 },
  periodBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16,
    paddingVertical: 6, borderRadius: 16,
  },
  periodText: { fontSize: 13, color: '#FFFFFF', fontWeight: '500' },
  section: {
    backgroundColor: COLORS.surface, marginHorizontal: 16, marginTop: 12,
    borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 12 },
  descriptionText: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 24 },
  mallItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  mallDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  mallName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  mallAddress: { fontSize: 13, color: COLORS.textTertiary, marginTop: 2 },
  termItem: { flexDirection: 'row', paddingVertical: 6, gap: 8 },
  termNumber: { fontSize: 13, color: COLORS.textTertiary, width: 20 },
  termText: { flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', padding: 16, paddingBottom: 32,
    backgroundColor: COLORS.surface, borderTopWidth: 0.5,
    borderTopColor: COLORS.border, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 8,
  },
  shareButton: {
    height: 50, paddingHorizontal: 24, justifyContent: 'center',
    alignItems: 'center', borderRadius: 12, borderWidth: 1,
    borderColor: COLORS.border,
  },
  shareButtonText: { fontSize: 15, fontWeight: '600', color: COLORS.textSecondary },
  participateButton: {
    flex: 1, height: 50, justifyContent: 'center', alignItems: 'center',
    borderRadius: 12, backgroundColor: COLORS.primary,
  },
  participateButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
