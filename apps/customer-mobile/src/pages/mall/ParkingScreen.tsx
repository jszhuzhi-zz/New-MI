import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { useLocale } from '../../hooks/useLocale';
import { useAuth } from '../../hooks/useAuth';

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
  success: '#2E7D32',
  warning: '#F9A825',
};

export default function ParkingScreen() {
  const { user, tierColor } = useAuth();
  const { locale } = useLocale();

  const [licensePlate, setLicensePlate] = useState('');
  const [queryResult, setQueryResult] = useState<{
    entryTime: string;
    duration: string;
    fee: number;
    freeHours: number;
    discountedFee: number;
  } | null>(null);

  const handleQuery = () => {
    if (!licensePlate || licensePlate.length < 2) {
      Alert.alert('', locale === 'en' ? 'Please enter license plate' : '請輸入車牌號碼');
      return;
    }
    // Mock result
    setQueryResult({
      entryTime: '2024-01-28 10:30',
      duration: '3h 25m',
      fee: 60,
      freeHours: user?.tier === 'gold' ? 2 : user?.tier === 'platinum' ? 3 : user?.tier === 'diamond' ? 4 : 0,
      discountedFee: user?.tier === 'gold' ? 20 : user?.tier === 'platinum' ? 0 : 60,
    });
  };

  const labels = {
    title: locale === 'en' ? 'Parking Info' : locale === 'zh-CN' ? '停车信息' : '泊車資訊',
    rates: locale === 'en' ? 'Parking Rates' : locale === 'zh-CN' ? '收费标准' : '收費標準',
    query: locale === 'en' ? 'Check Parking Fee' : locale === 'zh-CN' ? '查询停车费' : '查詢泊車費',
    plate: locale === 'en' ? 'License Plate' : locale === 'zh-CN' ? '车牌号码' : '車牌號碼',
    platePlaceholder: locale === 'en' ? 'Enter license plate' : locale === 'zh-CN' ? '请输入车牌号码' : '請輸入車牌號碼',
    search: locale === 'en' ? 'Search' : locale === 'zh-CN' ? '查询' : '查詢',
    entryTime: locale === 'en' ? 'Entry Time' : locale === 'zh-CN' ? '入场时间' : '入場時間',
    duration: locale === 'en' ? 'Duration' : locale === 'zh-CN' ? '停车时长' : '泊車時長',
    fee: locale === 'en' ? 'Total Fee' : locale === 'zh-CN' ? '总费用' : '總費用',
    freeHours: locale === 'en' ? 'Free Parking (Tier Benefit)' : locale === 'zh-CN' ? '免费停车（会员权益）' : '免費泊車（會員權益）',
    amountDue: locale === 'en' ? 'Amount Due' : locale === 'zh-CN' ? '应付金额' : '應付金額',
    memberBenefit: locale === 'en' ? 'Member Parking Benefit' : locale === 'zh-CN' ? '会员停车权益' : '會員泊車權益',
    hours: locale === 'en' ? 'hours' : locale === 'zh-CN' ? '小时' : '小時',
  };

  const rateItems = [
    { period: locale === 'en' ? 'Mon-Fri (before 18:00)' : locale === 'zh-CN' ? '周一至五（18:00前）' : '週一至五（18:00前）', rate: 'HK$18/hr' },
    { period: locale === 'en' ? 'Mon-Fri (after 18:00)' : locale === 'zh-CN' ? '周一至五（18:00后）' : '週一至五（18:00後）', rate: 'HK$22/hr' },
    { period: locale === 'en' ? 'Sat, Sun & Holidays' : locale === 'zh-CN' ? '周末及假日' : '週末及假日', rate: 'HK$25/hr' },
  ];

  const tierBenefits = [
    { tier: locale === 'en' ? 'Green' : '綠卡', hours: 0 },
    { tier: locale === 'en' ? 'Silver' : '銀卡', hours: 0 },
    { tier: locale === 'en' ? 'Gold' : '金卡', hours: 2 },
    { tier: locale === 'en' ? 'Platinum' : '白金', hours: 3 },
    { tier: locale === 'en' ? 'Diamond' : '鑽石', hours: 4 },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Parking Rate */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{labels.rates}</Text>
        {rateItems.map((item, index) => (
          <View key={index} style={styles.rateRow}>
            <Text style={styles.rateLabel}>{item.period}</Text>
            <Text style={styles.rateValue}>{item.rate}</Text>
          </View>
        ))}
      </View>

      {/* Member Parking Benefit */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{labels.memberBenefit}</Text>
        {tierBenefits.map((benefit, index) => {
          const isCurrent = (
            (benefit.tier === '金卡' || benefit.tier === 'Gold') && user?.tier === 'gold' ||
            (benefit.tier === '白金' || benefit.tier === 'Platinum') && user?.tier === 'platinum' ||
            (benefit.tier === '鑽石' || benefit.tier === 'Diamond') && user?.tier === 'diamond'
          );
          return (
            <View key={index} style={[styles.benefitRow, isCurrent && styles.benefitRowCurrent]}>
              <Text style={[styles.benefitTier, isCurrent && styles.benefitTierCurrent]}>
                {benefit.tier}
              </Text>
              <Text style={[styles.benefitHours, isCurrent && styles.benefitHoursCurrent]}>
                {benefit.hours > 0 ? `${benefit.hours} ${labels.hours}` : '-'}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Query Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{labels.query}</Text>
        <Text style={styles.inputLabel}>{labels.plate}</Text>
        <View style={styles.queryRow}>
          <TextInput
            style={styles.plateInput}
            placeholder={labels.platePlaceholder}
            placeholderTextColor={COLORS.textTertiary}
            value={licensePlate}
            onChangeText={setLicensePlate}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.queryButton} onPress={handleQuery}>
            <Text style={styles.queryButtonText}>{labels.search}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Query Result */}
      {queryResult && (
        <View style={styles.resultSection}>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>{labels.entryTime}</Text>
            <Text style={styles.resultValue}>{queryResult.entryTime}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>{labels.duration}</Text>
            <Text style={styles.resultValue}>{queryResult.duration}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>{labels.fee}</Text>
            <Text style={styles.resultValue}>HK${queryResult.fee}</Text>
          </View>
          {queryResult.freeHours > 0 && (
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>{labels.freeHours}</Text>
              <Text style={[styles.resultValue, { color: COLORS.success }]}>
                -{queryResult.freeHours} {labels.hours}
              </Text>
            </View>
          )}
          <View style={styles.resultDivider} />
          <View style={styles.resultRow}>
            <Text style={styles.resultLabelBold}>{labels.amountDue}</Text>
            <Text style={styles.resultValueBold}>HK${queryResult.discountedFee}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
  section: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 12 },
  rateRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  rateLabel: { fontSize: 14, color: COLORS.textSecondary },
  rateValue: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  benefitRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  benefitRowCurrent: { backgroundColor: COLORS.primaryLight, marginHorizontal: -8, paddingHorizontal: 8, borderRadius: 6 },
  benefitTier: { fontSize: 14, color: COLORS.textSecondary },
  benefitTierCurrent: { color: COLORS.primary, fontWeight: '600' },
  benefitHours: { fontSize: 14, color: COLORS.text },
  benefitHoursCurrent: { color: COLORS.primary, fontWeight: '700' },
  inputLabel: { fontSize: 14, fontWeight: '500', color: COLORS.text, marginBottom: 8 },
  queryRow: { flexDirection: 'row', gap: 10 },
  plateInput: {
    flex: 1, height: 48, backgroundColor: COLORS.background, borderRadius: 10,
    paddingHorizontal: 14, fontSize: 16, color: COLORS.text, fontWeight: '600',
    letterSpacing: 1, borderWidth: 1, borderColor: COLORS.border,
  },
  queryButton: {
    height: 48, paddingHorizontal: 20, backgroundColor: COLORS.primary,
    borderRadius: 10, justifyContent: 'center', alignItems: 'center',
  },
  queryButtonText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  resultSection: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 16,
    borderWidth: 1.5, borderColor: COLORS.primary,
  },
  resultRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 8,
  },
  resultLabel: { fontSize: 14, color: COLORS.textSecondary },
  resultValue: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  resultDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 4 },
  resultLabelBold: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  resultValueBold: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
});
