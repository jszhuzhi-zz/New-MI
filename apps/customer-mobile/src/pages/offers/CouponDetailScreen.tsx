import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
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
};

const mockCouponDetail = {
  id: 'cpn_1',
  title: { 'zh-TW': 'Starbucks 九折優惠', 'zh-CN': 'Starbucks 九折优惠', en: 'Starbucks 10% Off' },
  description: {
    'zh-TW': '於指定領展商場 Starbucks 分店出示此優惠券，可享指定飲品九折優惠。適用於大杯及特大杯手工調配飲品。',
    'zh-CN': '于指定领展商场 Starbucks 分店出示此优惠券，可享指定饮品九折优惠。适用于大杯及特大杯手工调配饮品。',
    en: 'Present this coupon at participating Starbucks in Link malls for 10% off selected beverages. Applies to Grande and Venti handcrafted drinks.',
  },
  merchantName: 'Starbucks',
  mallName: 'T Town',
  code: 'LM-STB-2024-0088312',
  barcode: '6280012345678901001',
  expiryDate: '2024-03-31',
  status: 'active' as const,
  terms: {
    'zh-TW': [
      '每人限用一次',
      '不可與其他優惠同時使用',
      '適用於大杯及特大杯手工調配飲品',
      '不適用於瓶裝飲品及食品',
      '需出示會員二維碼方可使用',
      '領展保留最終解釋權',
    ],
    'zh-CN': [
      '每人限用一次',
      '不可与其他优惠同时使用',
      '适用于大杯及特大杯手工调配饮品',
      '不适用于瓶装饮品及食品',
      '需出示会员二维码方可使用',
      '领展保留最终解释权',
    ],
    en: [
      'One-time use per member',
      'Cannot be combined with other offers',
      'Applies to Grande and Venti handcrafted drinks only',
      'Not applicable for bottled drinks and food items',
      'Must present member QR code for verification',
      'Link REIT reserves the right of final interpretation',
    ],
  },
};

export default function CouponDetailScreen() {
  const route = useRoute<OffersScreenRouteProp<'CouponDetail'>>();
  const { locale } = useLocale();

  const coupon = mockCouponDetail;
  const title = coupon.title[locale as keyof typeof coupon.title] || coupon.title.en;
  const description = coupon.description[locale as keyof typeof coupon.description] || coupon.description.en;
  const terms = coupon.terms[locale as keyof typeof coupon.terms] || coupon.terms.en;

  const labels = {
    code: locale === 'en' ? 'Coupon Code' : locale === 'zh-CN' ? '优惠券编号' : '優惠券編號',
    merchant: locale === 'en' ? 'Merchant' : locale === 'zh-CN' ? '商户' : '商戶',
    mall: locale === 'en' ? 'Location' : locale === 'zh-CN' ? '商场' : '商場',
    expiry: locale === 'en' ? 'Valid Until' : locale === 'zh-CN' ? '有效期至' : '有效期至',
    terms: locale === 'en' ? 'Terms & Conditions' : locale === 'zh-CN' ? '条款及细则' : '條款及細則',
    showToMerchant: locale === 'en' ? 'Show to Merchant' : locale === 'zh-CN' ? '出示给商户' : '出示給商戶',
    scanInstruction: locale === 'en'
      ? 'Show this QR code / barcode to the merchant to redeem'
      : locale === 'zh-CN'
      ? '出示此二维码/条码给商户扫描核销'
      : '出示此二維碼/條碼給商戶掃描核銷',
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Coupon Header */}
        <View style={styles.couponHeader}>
          <View style={styles.merchantBadge}>
            <Text style={styles.merchantBadgeText}>{coupon.merchantName}</Text>
          </View>
          <Text style={styles.couponTitle}>{title}</Text>
          <Text style={styles.couponDescription}>{description}</Text>
        </View>

        {/* QR / Barcode */}
        <View style={styles.codeSection}>
          <Text style={styles.codeSectionTitle}>{labels.showToMerchant}</Text>

          {/* QR Code placeholder */}
          <View style={styles.qrCode}>
            <Text style={styles.qrCodeText}>QR</Text>
            <Text style={styles.qrSubtext}>{coupon.code}</Text>
          </View>

          {/* Barcode placeholder */}
          <View style={styles.barcode}>
            <View style={styles.barcodeLines}>
              {Array.from({ length: 30 }).map((_, i) => (
                <View
                  key={i}
                  style={[styles.barcodeLine, { width: i % 3 === 0 ? 3 : 1.5 }]}
                />
              ))}
            </View>
            <Text style={styles.barcodeText}>{coupon.barcode}</Text>
          </View>

          <Text style={styles.scanInstruction}>{labels.scanInstruction}</Text>
        </View>

        {/* Details */}
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{labels.code}</Text>
            <Text style={styles.detailValue}>{coupon.code}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{labels.merchant}</Text>
            <Text style={styles.detailValue}>{coupon.merchantName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{labels.mall}</Text>
            <Text style={styles.detailValue}>{coupon.mallName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{labels.expiry}</Text>
            <Text style={styles.detailValue}>{coupon.expiryDate}</Text>
          </View>
        </View>

        {/* Terms */}
        <View style={styles.termsSection}>
          <Text style={styles.termsSectionTitle}>{labels.terms}</Text>
          {terms.map((term, index) => (
            <View key={index} style={styles.termItem}>
              <View style={styles.termBullet} />
              <Text style={styles.termText}>{term}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  couponHeader: {
    backgroundColor: COLORS.primary, padding: 20, alignItems: 'center',
  },
  merchantBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14,
    paddingVertical: 4, borderRadius: 12, marginBottom: 10,
  },
  merchantBadgeText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  couponTitle: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', marginBottom: 8 },
  couponDescription: { fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 20 },
  codeSection: {
    backgroundColor: COLORS.surface, marginHorizontal: 16, marginTop: 16,
    borderRadius: 12, padding: 20, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  codeSectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 16 },
  qrCode: {
    width: 180, height: 180, backgroundColor: '#F8F9FA', borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 16,
  },
  qrCodeText: { fontSize: 40, fontWeight: '800', color: COLORS.primary },
  qrSubtext: { fontSize: 10, color: COLORS.textTertiary, marginTop: 8 },
  barcode: { alignItems: 'center', marginBottom: 16 },
  barcodeLines: { flexDirection: 'row', height: 50, gap: 1.5, alignItems: 'center' },
  barcodeLine: { height: 50, backgroundColor: COLORS.text },
  barcodeText: { fontSize: 12, color: COLORS.textTertiary, marginTop: 6, letterSpacing: 2 },
  scanInstruction: { fontSize: 12, color: COLORS.textTertiary, textAlign: 'center' },
  detailsSection: {
    backgroundColor: COLORS.surface, marginHorizontal: 16, marginTop: 12,
    borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  detailLabel: { fontSize: 14, color: COLORS.textSecondary },
  detailValue: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  termsSection: {
    backgroundColor: COLORS.surface, marginHorizontal: 16, marginTop: 12,
    borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  termsSectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 12 },
  termItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  termBullet: {
    width: 5, height: 5, borderRadius: 2.5,
    backgroundColor: COLORS.primary, marginTop: 7, marginRight: 10,
  },
  termText: { flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },
});
