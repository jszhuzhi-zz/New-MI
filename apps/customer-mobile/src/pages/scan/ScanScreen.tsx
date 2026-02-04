import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useLocale } from '../../hooks/useLocale';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const COLORS = {
  primary: '#00694B',
  primaryLight: '#E8F5EF',
  accent: '#C4A962',
  background: '#000000',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  success: '#2E7D32',
  pending: '#F9A825',
};

type ScanMode = 'camera' | 'receipt' | 'member_qr' | 'coupon';

export default function ScanScreen() {
  const { user, formattedCardNumber } = useAuth();
  const { t, locale } = useLocale();

  const [mode, setMode] = useState<ScanMode>('camera');
  const [showResult, setShowResult] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<{
    stamps: number;
    receiptAmount: number;
    status: 'pending' | 'approved';
    merchant: string;
    mall: string;
  } | null>(null);

  const handleScanReceipt = async () => {
    setMode('receipt');
    setIsProcessing(true);
    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 2500));
    setScanResult({
      stamps: 128,
      receiptAmount: 645.0,
      status: 'pending',
      merchant: locale === 'en' ? 'Cafe de Coral' : '大家樂',
      mall: 'T Town',
    });
    setIsProcessing(false);
    setShowResult(true);
  };

  const handleShowMemberQR = () => {
    setMode('member_qr');
  };

  const handleScanCoupon = () => {
    setMode('coupon');
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setScanResult(null);
    setMode('camera');
  };

  const modeOptions = [
    {
      key: 'receipt' as ScanMode,
      label: t('scan.scanReceipt'),
      sublabel: locale === 'en' ? 'Photo receipt for stamps' : '小票拍照換印花',
      onPress: handleScanReceipt,
    },
    {
      key: 'member_qr' as ScanMode,
      label: t('scan.showQr'),
      sublabel: locale === 'en' ? 'Show to merchant' : '出示給商戶掃描',
      onPress: handleShowMemberQR,
    },
    {
      key: 'coupon' as ScanMode,
      label: t('scan.scanCoupon'),
      sublabel: locale === 'en' ? 'Scan coupon QR code' : '掃描優惠券二維碼',
      onPress: handleScanCoupon,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {mode === 'camera' && (
        <View style={styles.cameraContainer}>
          {/* Camera placeholder */}
          <View style={styles.cameraPlaceholder}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
              <View style={styles.scanLine} />
            </View>
            <Text style={styles.aimText}>{t('scan.aimCamera')}</Text>
          </View>

          {/* Mode Selection */}
          <View style={styles.modePanel}>
            <Text style={styles.modePanelTitle}>
              {locale === 'en' ? 'What would you like to do?' : '請選擇操作'}
            </Text>
            {modeOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={styles.modeButton}
                onPress={option.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.modeButtonIcon}>
                  <View style={styles.modeButtonDot} />
                </View>
                <View style={styles.modeButtonContent}>
                  <Text style={styles.modeButtonLabel}>{option.label}</Text>
                  <Text style={styles.modeButtonSublabel}>{option.sublabel}</Text>
                </View>
                <Text style={styles.modeButtonArrow}>{'>'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {mode === 'member_qr' && (
        <View style={styles.qrContainer}>
          <View style={styles.qrCard}>
            <Text style={styles.qrTitle}>{t('scan.showQr')}</Text>
            <Text style={styles.qrSubtitle}>
              {locale === 'en'
                ? 'Show this QR code to the merchant'
                : locale === 'zh-CN'
                ? '出示此二维码给商户扫描'
                : '出示此二維碼給商戶掃描'}
            </Text>

            {/* QR Code placeholder */}
            <View style={styles.qrCodeBox}>
              <View style={styles.qrCodeInner}>
                <Text style={styles.qrCodeText}>QR</Text>
                <Text style={styles.qrCodeSubtext}>
                  {user?.memberId || 'LM-2024-0088312'}
                </Text>
              </View>
            </View>

            <Text style={styles.cardNumber}>{formattedCardNumber}</Text>
            <Text style={styles.memberName}>{user?.displayName || '陳大文'}</Text>
            <View style={[styles.tierBadge, { backgroundColor: COLORS.accent + '20' }]}>
              <Text style={[styles.tierBadgeText, { color: COLORS.accent }]}>
                {user?.tierNameZh || '金卡會員'}
              </Text>
            </View>

            <Text style={styles.qrNote}>
              {locale === 'en'
                ? 'QR code refreshes every 60 seconds for security'
                : locale === 'zh-CN'
                ? '二维码每60秒自动刷新以确保安全'
                : '二維碼每60秒自動刷新以確保安全'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setMode('camera')}
          >
            <Text style={styles.backButtonText}>{t('common.back')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {mode === 'receipt' && isProcessing && (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.processingText}>{t('scan.calculating')}</Text>
        </View>
      )}

      {mode === 'coupon' && (
        <View style={styles.cameraContainer}>
          <View style={styles.cameraPlaceholder}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
              <View style={styles.scanLine} />
            </View>
            <Text style={styles.aimText}>
              {locale === 'en' ? 'Scan coupon QR code' : '掃描優惠券二維碼'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.bottomBackButton}
            onPress={() => setMode('camera')}
          >
            <Text style={styles.bottomBackButtonText}>{t('common.back')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Result Modal */}
      <Modal visible={showResult} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View style={styles.resultIcon}>
                <View style={styles.resultCheckmark} />
              </View>
              <Text style={styles.resultTitle}>
                {locale === 'en' ? 'Receipt Submitted' : locale === 'zh-CN' ? '小票已提交' : '小票已提交'}
              </Text>
            </View>

            {scanResult && (
              <View style={styles.resultDetails}>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>
                    {locale === 'en' ? 'Merchant' : '商戶'}
                  </Text>
                  <Text style={styles.resultValue}>{scanResult.merchant}</Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>
                    {locale === 'en' ? 'Mall' : '商場'}
                  </Text>
                  <Text style={styles.resultValue}>{scanResult.mall}</Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>
                    {locale === 'en' ? 'Receipt Amount' : '消費金額'}
                  </Text>
                  <Text style={styles.resultValue}>HK${scanResult.receiptAmount.toFixed(2)}</Text>
                </View>
                <View style={styles.resultDivider} />
                <View style={styles.resultStampRow}>
                  <Text style={styles.resultStampLabel}>
                    {locale === 'en' ? 'Stamps to Earn' : '預計獲得印花'}
                  </Text>
                  <Text style={styles.resultStampAmount}>+{scanResult.stamps}</Text>
                </View>
                <View style={styles.pendingNotice}>
                  <Text style={styles.pendingNoticeText}>
                    {t('scan.pendingApproval')}
                  </Text>
                  <Text style={styles.pendingNoticeSubtext}>
                    {locale === 'en'
                      ? 'Usually approved within 24 hours'
                      : locale === 'zh-CN'
                      ? '通常24小时内审核完成'
                      : '通常24小時內審核完成'}
                  </Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.resultButton}
              onPress={handleCloseResult}
            >
              <Text style={styles.resultButtonText}>{t('common.done')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  cameraContainer: { flex: 1 },
  cameraPlaceholder: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  scanFrame: {
    width: 240, height: 240, position: 'relative',
    justifyContent: 'center', alignItems: 'center',
  },
  corner: { position: 'absolute', width: 32, height: 32 },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderColor: COLORS.primary },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderColor: COLORS.primary },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: COLORS.primary },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderColor: COLORS.primary },
  scanLine: {
    width: 200, height: 2, backgroundColor: COLORS.primary, opacity: 0.8,
  },
  aimText: { marginTop: 32, fontSize: 15, color: 'rgba(255,255,255,0.7)' },
  modePanel: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 20,
    borderTopRightRadius: 20, padding: 20, paddingBottom: 32,
  },
  modePanelTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 16 },
  modeButton: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    backgroundColor: '#F8F9FA', borderRadius: 12, marginBottom: 10,
  },
  modeButtonIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.primaryLight, justifyContent: 'center',
    alignItems: 'center', marginRight: 14,
  },
  modeButtonDot: { width: 18, height: 18, borderRadius: 9, backgroundColor: COLORS.primary },
  modeButtonContent: { flex: 1 },
  modeButtonLabel: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  modeButtonSublabel: { fontSize: 12, color: COLORS.textTertiary, marginTop: 2 },
  modeButtonArrow: { fontSize: 16, color: COLORS.textTertiary },
  qrContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F5F5F5', paddingHorizontal: 24,
  },
  qrCard: {
    width: '100%', backgroundColor: COLORS.surface,
    borderRadius: 16, padding: 24, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 6,
  },
  qrTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  qrSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 24 },
  qrCodeBox: {
    width: 200, height: 200, backgroundColor: '#F8F9FA',
    borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 16,
  },
  qrCodeInner: { alignItems: 'center' },
  qrCodeText: { fontSize: 48, fontWeight: '800', color: COLORS.primary },
  qrCodeSubtext: { fontSize: 11, color: COLORS.textTertiary, marginTop: 8 },
  cardNumber: { fontSize: 16, fontWeight: '600', color: COLORS.text, letterSpacing: 1 },
  memberName: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4, marginBottom: 8 },
  tierBadge: { paddingHorizontal: 16, paddingVertical: 4, borderRadius: 12 },
  tierBadgeText: { fontSize: 13, fontWeight: '600' },
  qrNote: { fontSize: 11, color: COLORS.textTertiary, marginTop: 16, textAlign: 'center' },
  backButton: {
    marginTop: 20, paddingVertical: 14, paddingHorizontal: 40,
    backgroundColor: COLORS.primary, borderRadius: 12,
  },
  backButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  bottomBackButton: {
    position: 'absolute', bottom: 40, alignSelf: 'center',
    paddingVertical: 12, paddingHorizontal: 32,
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 24,
  },
  bottomBackButtonText: { fontSize: 15, fontWeight: '500', color: '#FFFFFF' },
  processingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  processingText: { fontSize: 16, color: COLORS.textSecondary, marginTop: 16 },
  modalOverlay: {
    flex: 1, justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  resultCard: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 20,
    borderTopRightRadius: 20, padding: 24, paddingBottom: 40,
  },
  resultHeader: { alignItems: 'center', marginBottom: 24 },
  resultIcon: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.primaryLight, justifyContent: 'center',
    alignItems: 'center', marginBottom: 12,
  },
  resultCheckmark: {
    width: 20, height: 10, borderLeftWidth: 3, borderBottomWidth: 3,
    borderColor: COLORS.primary, transform: [{ rotate: '-45deg' }],
  },
  resultTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  resultDetails: {},
  resultRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10,
  },
  resultLabel: { fontSize: 14, color: COLORS.textSecondary },
  resultValue: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  resultDivider: {
    height: 1, backgroundColor: COLORS.border, marginVertical: 8,
  },
  resultStampRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 12,
  },
  resultStampLabel: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  resultStampAmount: { fontSize: 28, fontWeight: '800', color: COLORS.primary },
  pendingNotice: {
    backgroundColor: COLORS.pending + '10', borderRadius: 10,
    padding: 12, marginTop: 8,
  },
  pendingNoticeText: { fontSize: 14, fontWeight: '600', color: COLORS.pending },
  pendingNoticeSubtext: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  resultButton: {
    height: 52, backgroundColor: COLORS.primary, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginTop: 20,
  },
  resultButtonText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
});
