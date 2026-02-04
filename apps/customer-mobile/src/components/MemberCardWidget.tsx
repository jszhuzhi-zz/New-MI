import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useLocale } from '../hooks/useLocale';

const TIER_GRADIENTS: Record<string, { bg: string; accent: string }> = {
  green: { bg: '#00694B', accent: '#00895F' },
  silver: { bg: '#757575', accent: '#9E9E9E' },
  gold: { bg: '#8B7335', accent: '#C4A962' },
  platinum: { bg: '#37474F', accent: '#546E7A' },
  diamond: { bg: '#4A148C', accent: '#7B1FA2' },
};

interface MemberCardWidgetProps {
  compact?: boolean;
  onPress?: () => void;
}

const MemberCardWidget: React.FC<MemberCardWidgetProps> = ({ compact = false, onPress }) => {
  const { user, memberDisplayName, formattedCardNumber, tierColor, tierDisplayName } = useAuth();
  const { locale } = useLocale();

  const tier = user?.tier || 'green';
  const colors = TIER_GRADIENTS[tier] || TIER_GRADIENTS.green;

  if (compact) {
    return (
      <TouchableOpacity style={[styles.compactCard, { backgroundColor: colors.bg }]} onPress={onPress}>
        <View style={styles.compactLeft}>
          <Text style={styles.compactName}>{memberDisplayName}</Text>
          <Text style={styles.compactTier}>{tierDisplayName}</Text>
        </View>
        <Text style={styles.compactBalance}>{user?.stampBalance?.toLocaleString() || '0'}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.bg }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Card background pattern */}
      <View style={[styles.cardAccent1, { backgroundColor: colors.accent }]} />
      <View style={[styles.cardAccent2, { backgroundColor: colors.accent }]} />

      {/* Card Content */}
      <View style={styles.cardContent}>
        {/* Top row */}
        <View style={styles.cardTopRow}>
          <View>
            <Text style={styles.brandName}>
              {locale === 'en' ? 'LINK MALL' : '領展商場'}
            </Text>
            <Text style={styles.tierBadge}>{tierDisplayName}</Text>
          </View>
          <View style={styles.qrPlaceholder}>
            <Text style={styles.qrText}>QR</Text>
          </View>
        </View>

        {/* Card Number */}
        <Text style={styles.cardNumber}>{formattedCardNumber}</Text>

        {/* Bottom row */}
        <View style={styles.cardBottomRow}>
          <View>
            <Text style={styles.memberLabel}>
              {locale === 'en' ? 'MEMBER' : '會員'}
            </Text>
            <Text style={styles.memberName}>{memberDisplayName}</Text>
          </View>
          <View style={styles.stampBalanceBox}>
            <Text style={styles.stampBalanceLabel}>
              {locale === 'en' ? 'STAMPS' : '印花'}
            </Text>
            <Text style={styles.stampBalanceValue}>
              {user?.stampBalance?.toLocaleString() || '0'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    minHeight: 190,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  cardAccent1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -80,
    right: -60,
    opacity: 0.15,
  },
  cardAccent2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    bottom: -50,
    left: -30,
    opacity: 0.1,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  brandName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  tierBadge: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    fontWeight: '500',
  },
  qrPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#00694B',
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginVertical: 16,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  memberLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 2,
  },
  stampBalanceBox: {
    alignItems: 'flex-end',
  },
  stampBalanceLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
  },
  stampBalanceValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  // Compact styles
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 14,
  },
  compactLeft: {},
  compactName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  compactTier: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  compactBalance: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default MemberCardWidget;
