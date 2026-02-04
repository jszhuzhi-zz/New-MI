import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useLocale } from '../hooks/useLocale';

const COLORS = {
  primary: '#00694B',
  primaryLight: '#E8F5EF',
  accent: '#C4A962',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#E0E0E0',
};

const TYPE_COLORS: Record<string, string> = {
  stamp_bonus: '#00694B',
  lucky_draw: '#C4A962',
  gift_redemption: '#7B1FA2',
  coupon: '#1976D2',
  event: '#D32F2F',
};

interface CampaignCardProps {
  campaign: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    startDate: string;
    endDate: string;
    type: string;
    mallName?: string;
    isActive: boolean;
  };
  onPress: () => void;
  style?: ViewStyle;
  horizontal?: boolean;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onPress, style, horizontal = false }) => {
  const { locale } = useLocale();

  const typeColor = TYPE_COLORS[campaign.type] || COLORS.primary;

  const typeLabels: Record<string, Record<string, string>> = {
    stamp_bonus: { 'zh-TW': '印花加倍', 'zh-CN': '印花加倍', en: 'Stamp Bonus' },
    lucky_draw: { 'zh-TW': '幸運抽獎', 'zh-CN': '幸运抽奖', en: 'Lucky Draw' },
    gift_redemption: { 'zh-TW': '禮品換購', 'zh-CN': '礼品换购', en: 'Gift Redemption' },
    coupon: { 'zh-TW': '優惠券', 'zh-CN': '优惠券', en: 'Coupon' },
    event: { 'zh-TW': '活動', 'zh-CN': '活动', en: 'Event' },
  };

  const typeLabel = typeLabels[campaign.type]?.[locale] || campaign.type;

  const formatDateRange = () => {
    const start = campaign.startDate.replace(/-/g, '/');
    const end = campaign.endDate.replace(/-/g, '/');
    return `${start} - ${end}`;
  };

  if (horizontal) {
    return (
      <TouchableOpacity
        style={[styles.horizontalCard, style]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={[styles.horizontalImage, { backgroundColor: typeColor + '15' }]}>
          <Text style={[styles.horizontalImageText, { color: typeColor }]}>
            {campaign.title.charAt(0)}
          </Text>
        </View>
        <View style={styles.horizontalContent}>
          <View style={[styles.typeBadge, { backgroundColor: typeColor + '15' }]}>
            <Text style={[styles.typeBadgeText, { color: typeColor }]}>{typeLabel}</Text>
          </View>
          <Text style={styles.horizontalTitle} numberOfLines={2}>{campaign.title}</Text>
          <Text style={styles.horizontalDesc} numberOfLines={1}>{campaign.description}</Text>
          <View style={styles.horizontalFooter}>
            {campaign.mallName && (
              <Text style={styles.horizontalMall}>{campaign.mallName}</Text>
            )}
            <Text style={styles.horizontalDate}>{formatDateRange()}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Vertical card (for horizontal scroll lists)
  return (
    <TouchableOpacity
      style={[styles.verticalCard, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.verticalImage, { backgroundColor: typeColor + '15' }]}>
        <Text style={[styles.verticalImageText, { color: typeColor }]}>
          {campaign.title.charAt(0)}
        </Text>
        <View style={[styles.typeTag, { backgroundColor: typeColor }]}>
          <Text style={styles.typeTagText}>{typeLabel}</Text>
        </View>
      </View>
      <View style={styles.verticalContent}>
        <Text style={styles.verticalTitle} numberOfLines={2}>{campaign.title}</Text>
        <Text style={styles.verticalDesc} numberOfLines={2}>{campaign.description}</Text>
        <View style={styles.verticalFooter}>
          {campaign.mallName && (
            <Text style={styles.verticalMall}>{campaign.mallName}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Vertical (for horizontal scrolls)
  verticalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  verticalImage: {
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  verticalImageText: {
    fontSize: 36,
    fontWeight: '800',
  },
  typeTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  typeTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  verticalContent: {
    padding: 12,
  },
  verticalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  verticalDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginBottom: 8,
  },
  verticalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verticalMall: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },

  // Horizontal (full width)
  horizontalCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  horizontalImage: {
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontalImageText: {
    fontSize: 32,
    fontWeight: '800',
  },
  horizontalContent: {
    flex: 1,
    padding: 12,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  horizontalTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  horizontalDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  horizontalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  horizontalMall: {
    fontSize: 11,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
  horizontalDate: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },
});

export default CampaignCard;
