import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocale } from '../hooks/useLocale';

const COLORS = {
  primary: '#00694B',
  primaryLight: '#E8F5EF',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#E0E0E0',
  success: '#2E7D32',
  warning: '#F9A825',
  error: '#D32F2F',
};

interface CouponCardProps {
  coupon: {
    id: string;
    title: string;
    description: string;
    merchantName: string;
    mallName: string;
    code: string;
    expiryDate: string;
    status: 'active' | 'used' | 'expired';
    imageUrl: string;
    terms: string[];
  };
  onPress: () => void;
}

const CouponCard: React.FC<CouponCardProps> = ({ coupon, onPress }) => {
  const { locale } = useLocale();

  const statusColors: Record<string, { bg: string; text: string }> = {
    active: { bg: COLORS.primaryLight, text: COLORS.primary },
    used: { bg: '#F5F5F5', text: COLORS.textTertiary },
    expired: { bg: '#FFEBEE', text: COLORS.error },
  };

  const statusLabels: Record<string, Record<string, string>> = {
    active: { 'zh-TW': '可使用', 'zh-CN': '可使用', en: 'Active' },
    used: { 'zh-TW': '已使用', 'zh-CN': '已使用', en: 'Used' },
    expired: { 'zh-TW': '已過期', 'zh-CN': '已过期', en: 'Expired' },
  };

  const isInactive = coupon.status !== 'active';
  const statusColor = statusColors[coupon.status] || statusColors.active;
  const statusLabel = statusLabels[coupon.status]?.[locale] || coupon.status;

  const daysUntilExpiry = () => {
    const expiry = new Date(coupon.expiryDate);
    const now = new Date();
    const diff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return '';
    if (diff <= 7) {
      return locale === 'en' ? `${diff} days left` : `${diff}天後到期`;
    }
    return '';
  };

  const expiryWarning = daysUntilExpiry();

  return (
    <TouchableOpacity
      style={[styles.card, isInactive && styles.cardInactive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Left accent / ticket edge */}
      <View style={styles.ticketEdge}>
        <View style={[styles.merchantIcon, { opacity: isInactive ? 0.5 : 1 }]}>
          <Text style={styles.merchantInitial}>{coupon.merchantName.charAt(0)}</Text>
        </View>
      </View>

      {/* Dashed divider */}
      <View style={styles.dashedDivider}>
        <View style={styles.circleTop} />
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={i} style={styles.dashSegment} />
        ))}
        <View style={styles.circleBottom} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.title, isInactive && styles.titleInactive]} numberOfLines={1}>
            {coupon.title}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
            <Text style={[styles.statusText, { color: statusColor.text }]}>{statusLabel}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={1}>{coupon.description}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.merchantName}>{coupon.merchantName}</Text>
          <Text style={styles.metaDivider}>|</Text>
          <Text style={styles.mallName}>{coupon.mallName}</Text>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.expiryDate}>
            {locale === 'en' ? 'Expires' : '到期'}: {coupon.expiryDate}
          </Text>
          {expiryWarning && coupon.status === 'active' && (
            <View style={styles.expiryWarning}>
              <Text style={styles.expiryWarningText}>{expiryWarning}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardInactive: {
    opacity: 0.65,
  },
  ticketEdge: {
    width: 72,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
  },
  merchantIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  merchantInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dashedDivider: {
    width: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 0,
  },
  circleTop: {
    width: 16,
    height: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: '#F5F5F5',
    marginTop: -1,
  },
  circleBottom: {
    width: 16,
    height: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: '#F5F5F5',
    marginBottom: -1,
  },
  dashSegment: {
    width: 1,
    height: 6,
    backgroundColor: COLORS.border,
    marginVertical: 2,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  titleInactive: {
    color: COLORS.textTertiary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  merchantName: {
    fontSize: 12,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
  metaDivider: {
    fontSize: 12,
    color: COLORS.border,
  },
  mallName: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  expiryDate: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },
  expiryWarning: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  expiryWarningText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.warning,
  },
});

export default CouponCard;
