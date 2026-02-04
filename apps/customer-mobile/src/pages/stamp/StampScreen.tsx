import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StampScreenNavigationProp, StampTransaction } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { useLocale } from '../../hooks/useLocale';
import StampBalanceDisplay from '../../components/StampBalanceDisplay';
import TierProgressBar from '../../components/TierProgressBar';

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
  earn: '#2E7D32',
  redeem: '#D32F2F',
  expire: '#9E9E9E',
  pending: '#F9A825',
};

// ─── Mock Data ───────────────────────────────────────────────────────────────

const mockTransactions: StampTransaction[] = [
  {
    id: 'txn_001',
    type: 'earn',
    amount: 150,
    balance: 2680,
    description: '消費獲印花',
    mallName: 'T Town',
    merchantName: '大家樂',
    receiptAmount: 385.5,
    timestamp: '2024-01-28T14:30:00Z',
    status: 'approved',
  },
  {
    id: 'txn_002',
    type: 'earn',
    amount: 80,
    balance: 2530,
    description: '消費獲印花',
    mallName: '九龍城廣場',
    merchantName: 'UNIQLO',
    receiptAmount: 799.0,
    timestamp: '2024-01-25T11:15:00Z',
    status: 'approved',
  },
  {
    id: 'txn_003',
    type: 'redeem',
    amount: -200,
    balance: 2450,
    description: '兌換禮品 - Starbucks 咖啡券',
    mallName: '赤柱廣場',
    timestamp: '2024-01-22T16:45:00Z',
    status: 'approved',
  },
  {
    id: 'txn_004',
    type: 'earn',
    amount: 320,
    balance: 2650,
    description: '新春三倍印花',
    mallName: 'T Town',
    merchantName: '一田百貨',
    receiptAmount: 1280.0,
    timestamp: '2024-01-20T13:00:00Z',
    status: 'approved',
  },
  {
    id: 'txn_005',
    type: 'earn',
    amount: 45,
    balance: 2330,
    description: '消費獲印花',
    mallName: '九龍城廣場',
    merchantName: '翠華餐廳',
    receiptAmount: 226.0,
    timestamp: '2024-01-18T19:30:00Z',
    status: 'pending',
  },
  {
    id: 'txn_006',
    type: 'expire',
    amount: -100,
    balance: 2285,
    description: '印花過期',
    mallName: '-',
    timestamp: '2024-01-15T00:00:00Z',
    status: 'approved',
  },
  {
    id: 'txn_007',
    type: 'earn',
    amount: 200,
    balance: 2385,
    description: '消費獲印花',
    mallName: 'T Town',
    merchantName: 'MUJI',
    receiptAmount: 2000.0,
    timestamp: '2024-01-12T10:20:00Z',
    status: 'approved',
  },
  {
    id: 'txn_008',
    type: 'redeem',
    amount: -500,
    balance: 2185,
    description: '兌換禮品 - 現金券 HK$50',
    mallName: '赤柱廣場',
    timestamp: '2024-01-10T15:00:00Z',
    status: 'approved',
  },
];

type FilterType = 'all' | 'earn' | 'redeem' | 'expire';

export default function StampScreen() {
  const navigation = useNavigation<StampScreenNavigationProp<'Stamps'>>();
  const { user } = useAuth();
  const { t, locale } = useLocale();

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredTransactions = mockTransactions.filter((txn) =>
    filter === 'all' ? true : txn.type === filter
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const filterOptions: { key: FilterType; label: string }[] = [
    { key: 'all', label: locale === 'en' ? 'All' : '全部' },
    { key: 'earn', label: t('stamps.earn') },
    { key: 'redeem', label: t('stamps.redeem') },
    { key: 'expire', label: t('stamps.expire') },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'earn': return COLORS.earn;
      case 'redeem': return COLORS.redeem;
      case 'expire': return COLORS.expire;
      default: return COLORS.textSecondary;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'earn': return '+';
      case 'redeem': return '-';
      case 'expire': return '-';
      default: return '';
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const renderTransaction = ({ item }: { item: StampTransaction }) => (
    <TouchableOpacity
      style={styles.transactionCard}
      onPress={() => navigation.navigate('StampDetail', { transactionId: item.id })}
      activeOpacity={0.7}
    >
      <View style={[styles.typeIndicator, { backgroundColor: getTypeColor(item.type) + '20' }]}>
        <Text style={[styles.typeIndicatorText, { color: getTypeColor(item.type) }]}>
          {item.type === 'earn' ? '+' : item.type === 'redeem' ? '-' : '!'}
        </Text>
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionDesc} numberOfLines={1}>
          {item.description}
        </Text>
        <Text style={styles.transactionMall}>
          {item.merchantName ? `${item.merchantName} | ${item.mallName}` : item.mallName}
        </Text>
        <View style={styles.transactionMeta}>
          <Text style={styles.transactionDate}>{formatDate(item.timestamp)}</Text>
          {item.status === 'pending' && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>{t('stamps.pending')}</Text>
            </View>
          )}
        </View>
      </View>
      <Text style={[styles.transactionAmount, { color: getTypeColor(item.type) }]}>
        {getTypeLabel(item.type)}{Math.abs(item.amount)}
      </Text>
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <View>
      {/* Balance Display */}
      <View style={styles.balanceSection}>
        <StampBalanceDisplay />
      </View>

      {/* Tier Progress */}
      <View style={styles.tierSection}>
        <TierProgressBar />
      </View>

      {/* Stamp Rules Link */}
      <TouchableOpacity
        style={styles.rulesLink}
        onPress={() => navigation.navigate('StampRules')}
      >
        <Text style={styles.rulesLinkText}>{t('stamps.rules')}</Text>
        <Text style={styles.rulesArrow}>{'>'}</Text>
      </TouchableOpacity>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[styles.filterTab, filter === option.key && styles.filterTabActive]}
            onPress={() => setFilter(option.key)}
          >
            <Text
              style={[styles.filterTabText, filter === option.key && styles.filterTabTextActive]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* History Title */}
      <Text style={styles.historyTitle}>{t('stamps.history')}</Text>
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      data={filteredTransactions}
      keyExtractor={(item) => item.id}
      renderItem={renderTransaction}
      ListHeaderComponent={<ListHeader />}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
      }
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
  listContent: { paddingBottom: 24 },
  balanceSection: { paddingHorizontal: 16, paddingTop: 16 },
  tierSection: { paddingHorizontal: 16, marginTop: 12 },
  rulesLink: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 16, marginTop: 12, backgroundColor: COLORS.surface,
    borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  rulesLinkText: { fontSize: 15, fontWeight: '500', color: COLORS.primary },
  rulesArrow: { fontSize: 16, color: COLORS.textTertiary },
  filterRow: {
    flexDirection: 'row', paddingHorizontal: 16, marginTop: 16,
    marginBottom: 8, gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  filterTabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterTabText: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary },
  filterTabTextActive: { color: '#FFFFFF' },
  historyTitle: {
    fontSize: 16, fontWeight: '600', color: COLORS.text,
    paddingHorizontal: 16, marginTop: 12, marginBottom: 8,
  },
  transactionCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, marginHorizontal: 16, marginBottom: 8,
    borderRadius: 12, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  typeIndicator: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  typeIndicatorText: { fontSize: 18, fontWeight: '700' },
  transactionInfo: { flex: 1 },
  transactionDesc: { fontSize: 15, fontWeight: '500', color: COLORS.text },
  transactionMall: { fontSize: 12, color: COLORS.textTertiary, marginTop: 3 },
  transactionMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 },
  transactionDate: { fontSize: 12, color: COLORS.textTertiary },
  pendingBadge: {
    backgroundColor: COLORS.pending + '20', paddingHorizontal: 8,
    paddingVertical: 2, borderRadius: 4,
  },
  pendingBadgeText: { fontSize: 10, fontWeight: '600', color: COLORS.pending },
  transactionAmount: { fontSize: 18, fontWeight: '700', minWidth: 60, textAlign: 'right' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, color: COLORS.textTertiary },
});
