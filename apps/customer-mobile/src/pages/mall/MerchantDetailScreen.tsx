import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { HomeScreenRouteProp } from '../../navigation/types';
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

const mockMerchant = {
  id: 'merch_1',
  name: '大家樂',
  nameEn: 'Cafe de Coral',
  category: 'dining',
  mallId: 'mall_t1',
  mallName: 'T Town',
  floor: 'L2',
  unit: '218',
  phone: '2450-1234',
  openingHours: '07:30 - 22:30',
  description: {
    'zh-TW': '大家樂集團為香港最大速食連鎖餐飲集團，提供多元化的中西式美食。',
    'zh-CN': '大家乐集团为香港最大速食连锁餐饮集团，提供多元化的中西式美食。',
    en: 'Cafe de Coral is the largest quick-service restaurant chain in Hong Kong, offering a diverse menu of Chinese and Western cuisines.',
  },
  stampMultiplier: 1,
  stampNote: {
    'zh-TW': '每消費HK$1獲1印花',
    'zh-CN': '每消费HK$1获1印花',
    en: '1 stamp per HK$1 spent',
  },
  acceptsStampPayment: false,
  isFavorite: false,
};

export default function MerchantDetailScreen() {
  const route = useRoute<HomeScreenRouteProp<'MerchantDetail'>>();
  const { locale } = useLocale();
  const [isFav, setIsFav] = useState(mockMerchant.isFavorite);

  const merchant = mockMerchant;
  const desc = merchant.description[locale as keyof typeof merchant.description] || merchant.description.en;
  const stampNote = merchant.stampNote[locale as keyof typeof merchant.stampNote] || merchant.stampNote.en;

  const labels = {
    location: locale === 'en' ? 'Location' : locale === 'zh-CN' ? '位置' : '位置',
    hours: locale === 'en' ? 'Opening Hours' : locale === 'zh-CN' ? '营业时间' : '營業時間',
    phone: locale === 'en' ? 'Phone' : locale === 'zh-CN' ? '电话' : '電話',
    stampInfo: locale === 'en' ? 'Stamp Info' : locale === 'zh-CN' ? '印花信息' : '印花資訊',
    addFav: locale === 'en' ? 'Add to Favorites' : locale === 'zh-CN' ? '加入收藏' : '加入收藏',
    removeFav: locale === 'en' ? 'Remove from Favorites' : locale === 'zh-CN' ? '取消收藏' : '取消收藏',
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero */}
      <View style={styles.heroSection}>
        <View style={styles.heroImage}>
          <Text style={styles.heroInitial}>{merchant.name.charAt(0)}</Text>
        </View>
      </View>

      {/* Name */}
      <View style={styles.nameSection}>
        <View>
          <Text style={styles.merchantName}>{merchant.name}</Text>
          <Text style={styles.merchantNameEn}>{merchant.nameEn}</Text>
        </View>
        <TouchableOpacity
          style={[styles.favButton, isFav && styles.favButtonActive]}
          onPress={() => setIsFav(!isFav)}
        >
          <Text style={[styles.favButtonText, isFav && styles.favButtonTextActive]}>
            {isFav ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.descText}>{desc}</Text>
      </View>

      {/* Details */}
      <View style={styles.section}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{labels.location}</Text>
          <Text style={styles.detailValue}>{merchant.mallName}, {merchant.floor}-{merchant.unit}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{labels.hours}</Text>
          <Text style={styles.detailValue}>{merchant.openingHours}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{labels.phone}</Text>
          <Text style={[styles.detailValue, styles.phoneLink]}>{merchant.phone}</Text>
        </View>
      </View>

      {/* Stamp Info */}
      <View style={styles.stampSection}>
        <Text style={styles.sectionTitle}>{labels.stampInfo}</Text>
        <View style={styles.stampInfoCard}>
          <View style={styles.stampMultiplierBadge}>
            <Text style={styles.stampMultiplierText}>{merchant.stampMultiplier}x</Text>
          </View>
          <Text style={styles.stampInfoText}>{stampNote}</Text>
        </View>
      </View>

      {/* Favorite button */}
      <TouchableOpacity
        style={[styles.actionButton, isFav && styles.actionButtonActive]}
        onPress={() => setIsFav(!isFav)}
      >
        <Text style={[styles.actionButtonText, isFav && styles.actionButtonTextActive]}>
          {isFav ? labels.removeFav : labels.addFav}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 32 },
  heroSection: { height: 180, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },
  heroImage: { width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
  heroInitial: { fontSize: 40, fontWeight: '800', color: COLORS.primary },
  nameSection: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.surface, paddingHorizontal: 16, paddingVertical: 16,
    borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  merchantName: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  merchantNameEn: { fontSize: 14, color: COLORS.textTertiary, marginTop: 2 },
  favButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center',
  },
  favButtonActive: { backgroundColor: COLORS.error + '15' },
  favButtonText: { fontSize: 22, color: COLORS.textTertiary },
  favButtonTextActive: { color: COLORS.error },
  section: {
    backgroundColor: COLORS.surface, marginHorizontal: 16, marginTop: 12,
    borderRadius: 12, padding: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 12 },
  descText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  detailLabel: { fontSize: 14, color: COLORS.textSecondary },
  detailValue: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  phoneLink: { color: COLORS.primary },
  stampSection: {
    backgroundColor: COLORS.surface, marginHorizontal: 16, marginTop: 12,
    borderRadius: 12, padding: 16,
  },
  stampInfoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.primaryLight, borderRadius: 10, padding: 14,
  },
  stampMultiplierBadge: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
  },
  stampMultiplierText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  stampInfoText: { fontSize: 14, color: COLORS.primary, fontWeight: '500', flex: 1 },
  actionButton: {
    height: 50, marginHorizontal: 16, marginTop: 20,
    borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.primary,
  },
  actionButtonActive: { backgroundColor: COLORS.primary },
  actionButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.primary },
  actionButtonTextActive: { color: '#FFFFFF' },
});
