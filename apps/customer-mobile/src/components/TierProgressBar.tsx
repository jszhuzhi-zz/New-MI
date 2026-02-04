import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useLocale } from '../hooks/useLocale';

const COLORS = {
  primary: '#00694B',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#E0E0E0',
};

const TIER_THRESHOLDS: Record<string, { stamps: number; color: string; next?: string; nextStamps?: number }> = {
  green: { stamps: 0, color: '#00694B', next: 'silver', nextStamps: 500 },
  silver: { stamps: 500, color: '#9E9E9E', next: 'gold', nextStamps: 2000 },
  gold: { stamps: 2000, color: '#C4A962', next: 'platinum', nextStamps: 5000 },
  platinum: { stamps: 5000, color: '#424242', next: 'diamond', nextStamps: 10000 },
  diamond: { stamps: 10000, color: '#7B1FA2' },
};

const TIER_NAMES: Record<string, Record<string, string>> = {
  green: { 'zh-TW': '綠卡', 'zh-CN': '绿卡', en: 'Green' },
  silver: { 'zh-TW': '銀卡', 'zh-CN': '银卡', en: 'Silver' },
  gold: { 'zh-TW': '金卡', 'zh-CN': '金卡', en: 'Gold' },
  platinum: { 'zh-TW': '白金', 'zh-CN': '白金', en: 'Platinum' },
  diamond: { 'zh-TW': '鑽石', 'zh-CN': '钻石', en: 'Diamond' },
};

const TierProgressBar: React.FC = () => {
  const { user, tierColor } = useAuth();
  const { locale } = useLocale();

  const currentTier = user?.tier || 'green';
  const tierInfo = TIER_THRESHOLDS[currentTier];
  const stampsToNext = user?.stampsToNextTier || 0;
  const totalEarned = user?.totalStampsEarned || 0;

  if (!tierInfo || !tierInfo.next) {
    // Diamond - max tier
    return (
      <View style={styles.container}>
        <View style={styles.maxTierBanner}>
          <Text style={[styles.maxTierText, { color: tierInfo?.color || COLORS.primary }]}>
            {locale === 'en' ? 'Maximum tier reached!' : locale === 'zh-CN' ? '已达到最高等级！' : '已達到最高等級！'}
          </Text>
        </View>
      </View>
    );
  }

  const nextTier = tierInfo.next;
  const nextThreshold = tierInfo.nextStamps || 0;
  const currentThreshold = tierInfo.stamps;
  const rangeTotal = nextThreshold - currentThreshold;
  const progress = Math.min(1, Math.max(0, (totalEarned - currentThreshold) / rangeTotal));
  const nextTierColor = TIER_THRESHOLDS[nextTier]?.color || COLORS.primary;
  const currentTierName = TIER_NAMES[currentTier]?.[locale] || currentTier;
  const nextTierName = TIER_NAMES[nextTier]?.[locale] || nextTier;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.tierLabelRow}>
          <View style={[styles.tierDot, { backgroundColor: tierInfo.color }]} />
          <Text style={[styles.tierLabel, { color: tierInfo.color }]}>{currentTierName}</Text>
        </View>
        <View style={styles.tierLabelRow}>
          <Text style={[styles.tierLabel, { color: nextTierColor }]}>{nextTierName}</Text>
          <View style={[styles.tierDot, { backgroundColor: nextTierColor }]} />
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progress * 100}%`,
                backgroundColor: tierInfo.color,
              },
            ]}
          />
        </View>
      </View>

      {/* Info */}
      <View style={styles.infoRow}>
        <Text style={styles.infoText}>
          {locale === 'en'
            ? `${stampsToNext.toLocaleString()} stamps to ${nextTierName}`
            : locale === 'zh-CN'
            ? `距${nextTierName}还需 ${stampsToNext.toLocaleString()} 印花`
            : `距${nextTierName}還需 ${stampsToNext.toLocaleString()} 印花`}
        </Text>
        <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tierLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tierDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tierLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    minWidth: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  maxTierBanner: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  maxTierText: {
    fontSize: 15,
    fontWeight: '700',
  },
});

export default TierProgressBar;
