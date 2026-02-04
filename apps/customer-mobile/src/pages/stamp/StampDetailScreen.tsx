import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { StampScreenRouteProp } from '../../navigation/types';
import { useLocale } from '../../hooks/useLocale';

const COLORS = {
  primary: '#00694B',
  primaryLight: '#E8F5EF',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#E0E0E0',
  earn: '#2E7D32',
  redeem: '#D32F2F',
  pending: '#F9A825',
};

// Mock detail data
const mockDetail = {
  id: 'txn_001',
  type: 'earn' as const,
  amount: 150,
  balance: 2680,
  previousBalance: 2530,
  description: '消費獲印花',
  mallName: 'T Town',
  mallAddress: '屯門屯順街1號',
  merchantName: '大家樂',
  merchantFloor: 'L2',
  merchantUnit: '218',
  receiptAmount: 385.5,
  receiptNumber: 'RCP-20240128-003291',
  stampRate: '每HK$1 = 1印花 (三倍活動)',
  timestamp: '2024-01-28T14:30:00Z',
  approvedAt: '2024-01-28T14:35:00Z',
  status: 'approved' as const,
  campaignName: '新春印花三倍賞',
  baseStamps: 50,
  bonusStamps: 100,
  bonusReason: '新春三倍活動額外印花',
};

export default function StampDetailScreen() {
  const route = useRoute<StampScreenRouteProp<'StampDetail'>>();
  const { locale } = useLocale();

  const detail = mockDetail;
  const isEarn = detail.type === 'earn';
  const typeColor = isEarn ? COLORS.earn : COLORS.redeem;

  const formatDateTime = (ts: string) => {
    const d = new Date(ts);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const labels = {
    type: locale === 'en' ? 'Type' : '類型',
    typeEarn: locale === 'en' ? 'Earned' : locale === 'zh-CN' ? '获得' : '獲得',
    typeRedeem: locale === 'en' ? 'Redeemed' : locale === 'zh-CN' ? '兑换' : '兌換',
    amount: locale === 'en' ? 'Stamp Amount' : locale === 'zh-CN' ? '印花数量' : '印花數量',
    balance: locale === 'en' ? 'Balance After' : locale === 'zh-CN' ? '交易后余额' : '交易後餘額',
    prevBalance: locale === 'en' ? 'Balance Before' : locale === 'zh-CN' ? '交易前余额' : '交易前餘額',
    mall: locale === 'en' ? 'Mall' : locale === 'zh-CN' ? '商场' : '商場',
    merchant: locale === 'en' ? 'Merchant' : locale === 'zh-CN' ? '商户' : '商戶',
    location: locale === 'en' ? 'Location' : locale === 'zh-CN' ? '位置' : '位置',
    receiptNo: locale === 'en' ? 'Receipt No.' : locale === 'zh-CN' ? '小票编号' : '小票編號',
    receiptAmount: locale === 'en' ? 'Receipt Amount' : locale === 'zh-CN' ? '消费金额' : '消費金額',
    stampRate: locale === 'en' ? 'Stamp Rate' : locale === 'zh-CN' ? '印花比率' : '印花比率',
    baseStamps: locale === 'en' ? 'Base Stamps' : locale === 'zh-CN' ? '基础印花' : '基礎印花',
    bonusStamps: locale === 'en' ? 'Bonus Stamps' : locale === 'zh-CN' ? '额外印花' : '額外印花',
    campaign: locale === 'en' ? 'Campaign' : locale === 'zh-CN' ? '活动' : '活動',
    time: locale === 'en' ? 'Transaction Time' : locale === 'zh-CN' ? '交易时间' : '交易時間',
    approvedAt: locale === 'en' ? 'Approved At' : locale === 'zh-CN' ? '审核时间' : '審核時間',
    status: locale === 'en' ? 'Status' : locale === 'zh-CN' ? '状态' : '狀態',
    statusApproved: locale === 'en' ? 'Approved' : locale === 'zh-CN' ? '已确认' : '已確認',
    statusPending: locale === 'en' ? 'Pending' : locale === 'zh-CN' ? '审核中' : '審核中',
  };

  const InfoRow = ({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Amount Header */}
      <View style={styles.amountHeader}>
        <View style={[styles.typeCircle, { backgroundColor: typeColor + '15' }]}>
          <Text style={[styles.typeIcon, { color: typeColor }]}>
            {isEarn ? '+' : '-'}
          </Text>
        </View>
        <Text style={[styles.amountText, { color: typeColor }]}>
          {isEarn ? '+' : '-'}{Math.abs(detail.amount)}
        </Text>
        <Text style={styles.amountLabel}>
          {locale === 'en' ? 'Stamps' : '印花'}
        </Text>
      </View>

      {/* Transaction Details */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {locale === 'en' ? 'Transaction Details' : locale === 'zh-CN' ? '交易详情' : '交易詳情'}
        </Text>
        <InfoRow label={labels.type} value={isEarn ? labels.typeEarn : labels.typeRedeem} valueColor={typeColor} />
        <InfoRow label={labels.amount} value={`${Math.abs(detail.amount)} ${locale === 'en' ? 'stamps' : '印花'}`} />
        <InfoRow label={labels.prevBalance} value={`${detail.previousBalance}`} />
        <InfoRow label={labels.balance} value={`${detail.balance}`} />
        <InfoRow
          label={labels.status}
          value={detail.status === 'approved' ? labels.statusApproved : labels.statusPending}
          valueColor={detail.status === 'approved' ? COLORS.earn : COLORS.pending}
        />
        <InfoRow label={labels.time} value={formatDateTime(detail.timestamp)} />
        {detail.approvedAt && (
          <InfoRow label={labels.approvedAt} value={formatDateTime(detail.approvedAt)} />
        )}
      </View>

      {/* Receipt Info (if earn type) */}
      {isEarn && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {locale === 'en' ? 'Receipt Info' : locale === 'zh-CN' ? '消费信息' : '消費資訊'}
          </Text>
          <InfoRow label={labels.mall} value={detail.mallName} />
          <InfoRow label={labels.merchant} value={detail.merchantName || '-'} />
          <InfoRow label={labels.location} value={`${detail.merchantFloor}-${detail.merchantUnit}`} />
          <InfoRow label={labels.receiptNo} value={detail.receiptNumber} />
          <InfoRow label={labels.receiptAmount} value={`HK$${detail.receiptAmount.toFixed(2)}`} />
          <InfoRow label={labels.stampRate} value={detail.stampRate} />
        </View>
      )}

      {/* Bonus Breakdown */}
      {isEarn && detail.bonusStamps > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {locale === 'en' ? 'Stamp Breakdown' : locale === 'zh-CN' ? '印花明细' : '印花明細'}
          </Text>
          <InfoRow label={labels.baseStamps} value={`${detail.baseStamps}`} />
          <InfoRow label={labels.bonusStamps} value={`+${detail.bonusStamps}`} valueColor={COLORS.earn} />
          <InfoRow label={labels.campaign} value={detail.campaignName} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 32 },
  amountHeader: {
    alignItems: 'center', paddingVertical: 28,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  typeCircle: {
    width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  typeIcon: { fontSize: 28, fontWeight: '700' },
  amountText: { fontSize: 36, fontWeight: '800' },
  amountLabel: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  card: {
    backgroundColor: COLORS.surface, marginHorizontal: 16, marginTop: 12,
    borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 14 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  infoLabel: { fontSize: 14, color: COLORS.textSecondary },
  infoValue: { fontSize: 14, fontWeight: '500', color: COLORS.text, maxWidth: '60%', textAlign: 'right' },
});
