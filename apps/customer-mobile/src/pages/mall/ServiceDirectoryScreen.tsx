import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
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
};

const services = [
  {
    category: { 'zh-TW': '會員服務', 'zh-CN': '会员服务', en: 'Member Services' },
    items: [
      { name: { 'zh-TW': '會員服務台', 'zh-CN': '会员服务台', en: 'Member Service Counter' }, location: 'G/F', hours: '10:00-21:00' },
      { name: { 'zh-TW': '印花兌換中心', 'zh-CN': '印花兑换中心', en: 'Stamp Redemption Centre' }, location: 'G/F', hours: '10:00-21:00' },
      { name: { 'zh-TW': '禮品包裝服務', 'zh-CN': '礼品包装服务', en: 'Gift Wrapping' }, location: 'L1', hours: '10:00-20:00' },
    ],
  },
  {
    category: { 'zh-TW': '便利設施', 'zh-CN': '便利设施', en: 'Amenities' },
    items: [
      { name: { 'zh-TW': '育嬰室', 'zh-CN': '育婴室', en: 'Nursery Room' }, location: 'L1, L3', hours: '10:00-22:00' },
      { name: { 'zh-TW': '無障礙洗手間', 'zh-CN': '无障碍洗手间', en: 'Accessible Restroom' }, location: locale === 'en' ? 'All floors' : '各樓層', hours: '10:00-22:00' },
      { name: { 'zh-TW': '免費Wi-Fi', 'zh-CN': '免费Wi-Fi', en: 'Free Wi-Fi' }, location: locale === 'en' ? 'All areas' : '全區', hours: '24/7' },
      { name: { 'zh-TW': '手機充電站', 'zh-CN': '手机充电站', en: 'Phone Charging Station' }, location: 'G/F, L2', hours: '10:00-22:00' },
    ],
  },
  {
    category: { 'zh-TW': '交通', 'zh-CN': '交通', en: 'Transportation' },
    items: [
      { name: { 'zh-TW': '停車場', 'zh-CN': '停车场', en: 'Parking' }, location: 'B1-B3', hours: '06:00-01:00' },
      { name: { 'zh-TW': '的士站', 'zh-CN': '出租车站', en: 'Taxi Stand' }, location: 'G/F', hours: '24/7' },
      { name: { 'zh-TW': '巴士站', 'zh-CN': '公交站', en: 'Bus Stop' }, location: locale === 'en' ? 'Adjacent' : '鄰近', hours: '-' },
    ],
  },
  {
    category: { 'zh-TW': '其他服務', 'zh-CN': '其他服务', en: 'Other Services' },
    items: [
      { name: { 'zh-TW': '失物認領', 'zh-CN': '失物认领', en: 'Lost & Found' }, location: 'G/F', hours: '10:00-21:00' },
      { name: { 'zh-TW': 'ATM 自動櫃員機', 'zh-CN': 'ATM 自动柜员机', en: 'ATM' }, location: 'G/F', hours: '24/7' },
      { name: { 'zh-TW': '寄存服務', 'zh-CN': '寄存服务', en: 'Locker Service' }, location: 'B1', hours: '10:00-22:00' },
    ],
  },
];

export default function ServiceDirectoryScreen() {
  const { locale } = useLocale();

  const labels = {
    location: locale === 'en' ? 'Location' : locale === 'zh-CN' ? '位置' : '位置',
    hours: locale === 'en' ? 'Hours' : locale === 'zh-CN' ? '时间' : '時間',
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {services.map((section, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.sectionTitle}>
            {section.category[locale as keyof typeof section.category] || section.category.en}
          </Text>
          {section.items.map((item, itemIndex) => (
            <View key={itemIndex} style={styles.serviceItem}>
              <Text style={styles.serviceName}>
                {item.name[locale as keyof typeof item.name] || item.name.en}
              </Text>
              <View style={styles.serviceMeta}>
                <Text style={styles.serviceMetaText}>{labels.location}: {item.location}</Text>
                <Text style={styles.serviceMetaDivider}>|</Text>
                <Text style={styles.serviceMetaText}>{labels.hours}: {item.hours}</Text>
              </View>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 32 },
  section: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 16,
    marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.primary, marginBottom: 12 },
  serviceItem: {
    paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  serviceName: { fontSize: 15, fontWeight: '500', color: COLORS.text },
  serviceMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 },
  serviceMetaText: { fontSize: 12, color: COLORS.textTertiary },
  serviceMetaDivider: { fontSize: 12, color: COLORS.border },
});
