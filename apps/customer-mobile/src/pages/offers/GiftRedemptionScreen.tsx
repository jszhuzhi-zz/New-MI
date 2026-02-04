import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Modal } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { OffersScreenRouteProp } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
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
  success: '#2E7D32',
};

const mockGiftDetail = {
  id: 'gift_1',
  name: { 'zh-TW': '不鏽鋼保溫杯', 'zh-CN': '不锈钢保温杯', en: 'Stainless Steel Tumbler' },
  description: {
    'zh-TW': '500ml 真空保溫不鏽鋼杯，保溫12小時。領展限定設計，時尚大方。',
    'zh-CN': '500ml 真空保温不锈钢杯，保温12小时。领展限定设计，时尚大方。',
    en: '500ml vacuum insulated stainless steel tumbler. 12-hour heat retention. Exclusive Link Mall design.',
  },
  stampCost: 500,
  stock: 120,
  category: 'lifestyle',
  pickupLocations: ['T Town 服務台', '九龍城廣場 服務台', '赤柱廣場 服務台'],
  pickupNote: {
    'zh-TW': '兌換後請於30天內到指定服務台領取',
    'zh-CN': '兑换后请于30天内到指定服务台领取',
    en: 'Please collect at designated service counter within 30 days',
  },
  terms: {
    'zh-TW': ['數量有限，換完即止', '每位會員限兌換2件', '已兌換不可退還', '需出示會員二維碼領取'],
    'zh-CN': ['数量有限，换完即止', '每位会员限兑换2件', '已兑换不可退还', '需出示会员二维码领取'],
    en: ['While stocks last', 'Maximum 2 per member', 'Non-refundable once redeemed', 'Present member QR code for collection'],
  },
};

export default function GiftRedemptionScreen() {
  const route = useRoute<OffersScreenRouteProp<'GiftRedemption'>>();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { t, locale } = useLocale();

  const [isRedeeming, setIsRedeeming] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const gift = mockGiftDetail;
  const name = gift.name[locale as keyof typeof gift.name] || gift.name.en;
  const desc = gift.description[locale as keyof typeof gift.description] || gift.description.en;
  const pickupNote = gift.pickupNote[locale as keyof typeof gift.pickupNote] || gift.pickupNote.en;
  const terms = gift.terms[locale as keyof typeof gift.terms] || gift.terms.en;

  const totalCost = gift.stampCost * quantity;
  const stampBalance = user?.stampBalance || 2680;
  const canAfford = stampBalance >= totalCost;

  const handleRedeem = () => {
    if (!canAfford) {
      const msg = locale === 'en' ? 'Insufficient stamps' : locale === 'zh-CN' ? '印花不足' : '印花不足';
      Alert.alert('', msg);
      return;
    }

    const confirmMsg = locale === 'en'
      ? `Redeem ${quantity}x ${name} for ${totalCost} stamps?`
      : `確認以 ${totalCost} 印花兌換 ${quantity}x ${name}？`;

    Alert.alert(t('common.confirm'), confirmMsg, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.confirm'),
        onPress: async () => {
          setIsRedeeming(true);
          await new Promise((resolve) => setTimeout(resolve, 2000));
          setIsRedeeming(false);
          setShowSuccess(true);
        },
      },
    ]);
  };

  const labels = {
    stampCost: locale === 'en' ? 'Stamps Required' : locale === 'zh-CN' ? '所需印花' : '所需印花',
    stock: locale === 'en' ? 'Stock' : locale === 'zh-CN' ? '库存' : '庫存',
    quantity: locale === 'en' ? 'Quantity' : locale === 'zh-CN' ? '数量' : '數量',
    total: locale === 'en' ? 'Total' : locale === 'zh-CN' ? '合计' : '合計',
    yourBalance: locale === 'en' ? 'Your Balance' : locale === 'zh-CN' ? '您的余额' : '您的餘額',
    afterRedeem: locale === 'en' ? 'After Redemption' : locale === 'zh-CN' ? '兑换后余额' : '兌換後餘額',
    pickup: locale === 'en' ? 'Collection Points' : locale === 'zh-CN' ? '领取地点' : '領取地點',
    redeemNow: locale === 'en' ? 'Redeem Now' : locale === 'zh-CN' ? '立即兑换' : '立即兌換',
    insufficient: locale === 'en' ? 'Insufficient Stamps' : locale === 'zh-CN' ? '印花不足' : '印花不足',
    redeemSuccess: locale === 'en' ? 'Redeemed Successfully!' : locale === 'zh-CN' ? '兑换成功！' : '兌換成功！',
    redeemCode: locale === 'en' ? 'Redemption Code' : locale === 'zh-CN' ? '兑换码' : '兌換碼',
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Gift Image */}
        <View style={styles.imageSection}>
          <Text style={styles.imageText}>{name.charAt(0)}</Text>
        </View>

        {/* Gift Info */}
        <View style={styles.infoSection}>
          <Text style={styles.giftName}>{name}</Text>
          <Text style={styles.giftDescription}>{desc}</Text>

          <View style={styles.costBadge}>
            <Text style={styles.costAmount}>{gift.stampCost}</Text>
            <Text style={styles.costLabel}>{locale === 'en' ? 'stamps' : '印花'}</Text>
          </View>
          <Text style={styles.stockText}>{labels.stock}: {gift.stock}</Text>
        </View>

        {/* Quantity Selector */}
        <View style={styles.quantitySection}>
          <Text style={styles.sectionTitle}>{labels.quantity}</Text>
          <View style={styles.quantityRow}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityValue}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.min(2, quantity + 1))}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cost Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{labels.total}</Text>
            <Text style={styles.summaryValue}>{totalCost} {locale === 'en' ? 'stamps' : '印花'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{labels.yourBalance}</Text>
            <Text style={styles.summaryValue}>{stampBalance.toLocaleString()}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryRowLast]}>
            <Text style={styles.summaryLabel}>{labels.afterRedeem}</Text>
            <Text style={[styles.summaryValue, !canAfford && { color: COLORS.error }]}>
              {canAfford ? (stampBalance - totalCost).toLocaleString() : labels.insufficient}
            </Text>
          </View>
        </View>

        {/* Pickup */}
        <View style={styles.pickupSection}>
          <Text style={styles.sectionTitle}>{labels.pickup}</Text>
          {gift.pickupLocations.map((location, index) => (
            <View key={index} style={styles.pickupItem}>
              <View style={styles.pickupDot} />
              <Text style={styles.pickupText}>{location}</Text>
            </View>
          ))}
          <Text style={styles.pickupNote}>{pickupNote}</Text>
        </View>

        {/* Terms */}
        <View style={styles.termsSection}>
          <Text style={styles.sectionTitle}>
            {locale === 'en' ? 'Terms' : locale === 'zh-CN' ? '条款' : '條款'}
          </Text>
          {terms.map((term, index) => (
            <View key={index} style={styles.termItem}>
              <Text style={styles.termBullet}>{index + 1}.</Text>
              <Text style={styles.termText}>{term}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Redeem Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.redeemButton, !canAfford && styles.redeemButtonDisabled]}
          onPress={handleRedeem}
          disabled={!canAfford || isRedeeming}
        >
          {isRedeeming ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.redeemButtonText}>
              {canAfford ? `${labels.redeemNow} (${totalCost} ${locale === 'en' ? 'stamps' : '印花'})` : labels.insufficient}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal visible={showSuccess} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIcon}>
              <View style={styles.successCheck} />
            </View>
            <Text style={styles.successTitle}>{labels.redeemSuccess}</Text>
            <Text style={styles.successGift}>{quantity}x {name}</Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeLabel}>{labels.redeemCode}</Text>
              <Text style={styles.codeValue}>RDM-{Date.now().toString().slice(-8)}</Text>
            </View>
            <Text style={styles.successNote}>{pickupNote}</Text>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => { setShowSuccess(false); navigation.goBack(); }}
            >
              <Text style={styles.doneButtonText}>{t('common.done')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  imageSection: {
    height: 200, backgroundColor: COLORS.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  imageText: { fontSize: 64, color: COLORS.primary, fontWeight: '800' },
  infoSection: {
    backgroundColor: COLORS.surface, padding: 20,
    borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  giftName: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  giftDescription: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 16 },
  costBadge: {
    flexDirection: 'row', alignItems: 'baseline', gap: 6,
  },
  costAmount: { fontSize: 32, fontWeight: '800', color: COLORS.primary },
  costLabel: { fontSize: 14, color: COLORS.textSecondary },
  stockText: { fontSize: 13, color: COLORS.textTertiary, marginTop: 6 },
  quantitySection: {
    backgroundColor: COLORS.surface, marginHorizontal: 16, marginTop: 12,
    borderRadius: 12, padding: 16, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  quantityButton: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  quantityButtonText: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  quantityValue: { fontSize: 20, fontWeight: '700', color: COLORS.text, minWidth: 30, textAlign: 'center' },
  summarySection: {
    backgroundColor: COLORS.surface, marginHorizontal: 16, marginTop: 12,
    borderRadius: 12, padding: 16,
  },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  summaryRowLast: { borderBottomWidth: 0 },
  summaryLabel: { fontSize: 14, color: COLORS.textSecondary },
  summaryValue: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  pickupSection: {
    backgroundColor: COLORS.surface, marginHorizontal: 16, marginTop: 12,
    borderRadius: 12, padding: 16,
  },
  pickupItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10 },
  pickupDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary },
  pickupText: { fontSize: 14, color: COLORS.text },
  pickupNote: { fontSize: 12, color: COLORS.textTertiary, marginTop: 8 },
  termsSection: {
    backgroundColor: COLORS.surface, marginHorizontal: 16, marginTop: 12,
    borderRadius: 12, padding: 16,
  },
  termItem: { flexDirection: 'row', paddingVertical: 4, gap: 8 },
  termBullet: { fontSize: 13, color: COLORS.textTertiary },
  termText: { flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, paddingBottom: 32, backgroundColor: COLORS.surface,
    borderTopWidth: 0.5, borderTopColor: COLORS.border,
  },
  redeemButton: {
    height: 52, backgroundColor: COLORS.primary, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  redeemButtonDisabled: { backgroundColor: COLORS.border },
  redeemButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  modalOverlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', padding: 32,
  },
  successCard: {
    width: '100%', backgroundColor: COLORS.surface,
    borderRadius: 20, padding: 28, alignItems: 'center',
  },
  successIcon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: COLORS.primaryLight, justifyContent: 'center',
    alignItems: 'center', marginBottom: 16,
  },
  successCheck: {
    width: 24, height: 14, borderLeftWidth: 3, borderBottomWidth: 3,
    borderColor: COLORS.primary, transform: [{ rotate: '-45deg' }],
  },
  successTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  successGift: { fontSize: 16, color: COLORS.primary, fontWeight: '600', marginBottom: 16 },
  codeBox: {
    backgroundColor: COLORS.background, borderRadius: 10, padding: 16,
    width: '100%', alignItems: 'center', marginBottom: 12,
  },
  codeLabel: { fontSize: 12, color: COLORS.textTertiary, marginBottom: 4 },
  codeValue: { fontSize: 20, fontWeight: '700', color: COLORS.text, letterSpacing: 2 },
  successNote: { fontSize: 12, color: COLORS.textTertiary, textAlign: 'center', marginBottom: 20 },
  doneButton: {
    height: 48, backgroundColor: COLORS.primary, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', width: '100%',
  },
  doneButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
