import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { OffersScreenNavigationProp, Coupon } from '../../navigation/types';
import { useLocale } from '../../hooks/useLocale';
import CouponCard from '../../components/CouponCard';

const COLORS = {
  primary: '#00694B',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#E0E0E0',
};

type CouponTab = 'active' | 'used' | 'expired';

const mockCoupons: Coupon[] = [
  {
    id: 'cpn_1', title: 'Starbucks 九折優惠', description: '指定飲品享九折',
    merchantName: 'Starbucks', mallName: 'T Town', code: 'LM-STB-2024',
    expiryDate: '2024-03-31', status: 'active', imageUrl: '',
    terms: ['每人限用一次', '不可與其他優惠同時使用'],
  },
  {
    id: 'cpn_2', title: 'MUJI 滿$300減$30', description: '消費滿HK$300即減HK$30',
    merchantName: 'MUJI', mallName: 'T Town', code: 'LM-MUJI-30',
    expiryDate: '2024-02-28', status: 'active', imageUrl: '',
    terms: ['每人限用一次'],
  },
  {
    id: 'cpn_3', title: '翠華八折套餐', description: '指定套餐享八折優惠',
    merchantName: '翠華餐廳', mallName: '九龍城廣場', code: 'LM-TSW-80',
    expiryDate: '2024-02-15', status: 'active', imageUrl: '',
    terms: ['不適用於外賣', '每枱限用一張'],
  },
  {
    id: 'cpn_4', title: 'Pacific Coffee 買一送一', description: '指定時段買一送一',
    merchantName: 'Pacific Coffee', mallName: '赤柱廣場', code: 'LM-PC-BOGO',
    expiryDate: '2024-01-20', status: 'used', imageUrl: '',
    terms: ['限指定飲品'],
  },
  {
    id: 'cpn_5', title: '一田超市$20優惠', description: '消費滿$200即減$20',
    merchantName: '一田百貨', mallName: 'T Town', code: 'LM-YT-20',
    expiryDate: '2023-12-31', status: 'expired', imageUrl: '',
    terms: ['不適用於煙酒'],
  },
];

export default function CouponListScreen() {
  const navigation = useNavigation<OffersScreenNavigationProp<'CouponList'>>();
  const { t, locale } = useLocale();
  const [activeTab, setActiveTab] = useState<CouponTab>('active');

  const filteredCoupons = mockCoupons.filter((c) => c.status === activeTab);

  const tabs: { key: CouponTab; label: string; count: number }[] = [
    { key: 'active', label: t('offers.active'), count: mockCoupons.filter((c) => c.status === 'active').length },
    { key: 'used', label: t('offers.used'), count: mockCoupons.filter((c) => c.status === 'used').length },
    { key: 'expired', label: t('offers.expired'), count: mockCoupons.filter((c) => c.status === 'expired').length },
  ];

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label} ({tab.count})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredCoupons}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <CouponCard
            coupon={item}
            onPress={() => navigation.navigate('CouponDetail', { couponId: item.id })}
          />
        )}
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
  tabBar: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabText: { fontSize: 14, fontWeight: '500', color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.primary, fontWeight: '600' },
  listContent: { padding: 16, paddingBottom: 32 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 14, color: COLORS.textTertiary },
});
