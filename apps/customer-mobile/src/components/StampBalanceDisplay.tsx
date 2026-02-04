import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useLocale } from '../hooks/useLocale';

interface StampBalanceDisplayProps {
  size?: 'small' | 'medium' | 'large';
}

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

const StampBalanceDisplay: React.FC<StampBalanceDisplayProps> = ({ size = 'medium' }) => {
  const { user } = useAuth();
  const { t, locale } = useLocale();

  const balance = user?.stampBalance || 0;
  const totalEarned = user?.totalStampsEarned || 0;

  if (size === 'small') {
    return (
      <View style={styles.smallContainer}>
        <Text style={styles.smallLabel}>{t('stamps.balance')}</Text>
        <Text style={styles.smallValue}>{balance.toLocaleString()}</Text>
      </View>
    );
  }

  if (size === 'large') {
    return (
      <View style={styles.largeContainer}>
        <View style={styles.largeBalanceSection}>
          <Text style={styles.largeLabel}>{t('stamps.balance')}</Text>
          <Text style={styles.largeValue}>{balance.toLocaleString()}</Text>
          <Text style={styles.largeUnit}>{locale === 'en' ? 'STAMPS' : '印花'}</Text>
        </View>
        <View style={styles.largeDivider} />
        <View style={styles.largeStatsRow}>
          <View style={styles.largeStat}>
            <Text style={styles.largeStatLabel}>
              {locale === 'en' ? 'Total Earned' : locale === 'zh-CN' ? '累计获得' : '累計獲得'}
            </Text>
            <Text style={styles.largeStatValue}>{totalEarned.toLocaleString()}</Text>
          </View>
          <View style={styles.largeStatDivider} />
          <View style={styles.largeStat}>
            <Text style={styles.largeStatLabel}>
              {locale === 'en' ? 'This Month' : locale === 'zh-CN' ? '本月获得' : '本月獲得'}
            </Text>
            <Text style={styles.largeStatValue}>+380</Text>
          </View>
        </View>
      </View>
    );
  }

  // Medium (default)
  return (
    <View style={styles.mediumContainer}>
      <View style={styles.mediumIcon}>
        <Text style={styles.mediumIconText}>*</Text>
      </View>
      <View style={styles.mediumContent}>
        <Text style={styles.mediumLabel}>{t('stamps.balance')}</Text>
        <View style={styles.mediumValueRow}>
          <Text style={styles.mediumValue}>{balance.toLocaleString()}</Text>
          <Text style={styles.mediumUnit}>{locale === 'en' ? 'stamps' : '印花'}</Text>
        </View>
      </View>
      <View style={styles.mediumMonthly}>
        <Text style={styles.monthlyLabel}>
          {locale === 'en' ? 'This month' : '本月'}
        </Text>
        <Text style={styles.monthlyValue}>+380</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Small
  smallContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  smallLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  smallValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // Medium
  mediumContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  mediumIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mediumIconText: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
  },
  mediumContent: {
    flex: 1,
  },
  mediumLabel: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  mediumValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  mediumValue: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
  },
  mediumUnit: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  mediumMonthly: {
    alignItems: 'flex-end',
  },
  monthlyLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },
  monthlyValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
    marginTop: 2,
  },

  // Large
  largeContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  largeBalanceSection: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  largeLabel: {
    fontSize: 14,
    color: COLORS.textTertiary,
    marginBottom: 4,
  },
  largeValue: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -1,
  },
  largeUnit: {
    fontSize: 14,
    color: COLORS.textSecondary,
    letterSpacing: 2,
    fontWeight: '500',
    marginTop: 4,
  },
  largeDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
  largeStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  largeStat: {
    alignItems: 'center',
    flex: 1,
  },
  largeStatLabel: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginBottom: 4,
  },
  largeStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  largeStatDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },
});

export default StampBalanceDisplay;
