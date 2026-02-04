import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenNavigationProp, Mall } from '../../navigation/types';
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

const mockMalls: (Mall & { nameZh: string })[] = [
  {
    id: 'mall_t1', name: 'T Town', nameZh: 'T Town',
    address: '屯門屯順街1號', imageUrl: '',
    latitude: 22.3907, longitude: 113.9726,
    floors: 5, openingHours: '10:00 - 22:00', phone: '2450-7977',
  },
  {
    id: 'mall_kcm', name: 'Kowloon City Mall', nameZh: '九龍城廣場',
    address: '九龍城賈炳達道128號', imageUrl: '',
    latitude: 22.3316, longitude: 114.1877,
    floors: 4, openingHours: '10:00 - 22:00', phone: '2382-3222',
  },
  {
    id: 'mall_stanley', name: 'Stanley Plaza', nameZh: '赤柱廣場',
    address: '赤柱赤柱村道23號', imageUrl: '',
    latitude: 22.2188, longitude: 114.2126,
    floors: 3, openingHours: '09:00 - 22:00', phone: '2813-8138',
  },
  {
    id: 'mall_tko', name: 'TKO Gateway', nameZh: '將軍澳廣場',
    address: '將軍澳唐德街9號', imageUrl: '',
    latitude: 22.3072, longitude: 114.2593,
    floors: 4, openingHours: '10:00 - 22:00', phone: '2628-1288',
  },
  {
    id: 'mall_lok_fu', name: 'Lok Fu Place', nameZh: '樂富廣場',
    address: '九龍樂富聯合道198號', imageUrl: '',
    latitude: 22.3375, longitude: 114.1870,
    floors: 3, openingHours: '10:00 - 22:00', phone: '2337-0828',
  },
];

export default function MallDirectoryScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp<'MallDirectory'>>();
  const { locale } = useLocale();
  const [searchText, setSearchText] = useState('');

  const filteredMalls = mockMalls.filter((mall) => {
    if (!searchText) return true;
    const query = searchText.toLowerCase();
    return mall.name.toLowerCase().includes(query) || mall.nameZh.includes(query) || mall.address.includes(query);
  });

  const labels = {
    search: locale === 'en' ? 'Search malls...' : locale === 'zh-CN' ? '搜索商场...' : '搜尋商場...',
    floors: locale === 'en' ? 'floors' : locale === 'zh-CN' ? '层' : '層',
    hours: locale === 'en' ? 'Hours' : locale === 'zh-CN' ? '营业时间' : '營業時間',
    phone: locale === 'en' ? 'Tel' : locale === 'zh-CN' ? '电话' : '電話',
    services: locale === 'en' ? 'Services' : locale === 'zh-CN' ? '服务' : '服務',
    parking: locale === 'en' ? 'Parking' : locale === 'zh-CN' ? '停车' : '泊車',
    floorPlan: locale === 'en' ? 'Floor Plan' : locale === 'zh-CN' ? '楼层图' : '樓層圖',
  };

  const renderMall = ({ item }: { item: typeof mockMalls[0] }) => (
    <View style={styles.mallCard}>
      <View style={styles.mallImagePlaceholder}>
        <Text style={styles.mallInitial}>{item.nameZh.charAt(0)}</Text>
      </View>
      <View style={styles.mallInfo}>
        <Text style={styles.mallName}>{locale === 'en' ? item.name : item.nameZh}</Text>
        <Text style={styles.mallAddress}>{item.address}</Text>
        <Text style={styles.mallMeta}>
          {item.floors} {labels.floors} | {labels.hours}: {item.openingHours}
        </Text>
        <View style={styles.mallActions}>
          <TouchableOpacity
            style={styles.actionChip}
            onPress={() => navigation.navigate('ServiceDirectory', { mallId: item.id })}
          >
            <Text style={styles.actionChipText}>{labels.services}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionChip}
            onPress={() => navigation.navigate('Parking', { mallId: item.id })}
          >
            <Text style={styles.actionChipText}>{labels.parking}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionChip}>
            <Text style={styles.actionChipText}>{labels.floorPlan}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={labels.search}
          placeholderTextColor={COLORS.textTertiary}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
      <FlatList
        data={filteredMalls}
        keyExtractor={(item) => item.id}
        renderItem={renderMall}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchContainer: { padding: 16, backgroundColor: COLORS.surface },
  searchInput: {
    height: 44, backgroundColor: COLORS.background, borderRadius: 10,
    paddingHorizontal: 16, fontSize: 14, color: COLORS.text,
    borderWidth: 1, borderColor: COLORS.border,
  },
  listContent: { padding: 16, paddingBottom: 32 },
  mallCard: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    borderRadius: 12, padding: 14, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  mallImagePlaceholder: {
    width: 80, height: 80, borderRadius: 10,
    backgroundColor: COLORS.primaryLight, justifyContent: 'center',
    alignItems: 'center', marginRight: 14,
  },
  mallInitial: { fontSize: 28, fontWeight: '700', color: COLORS.primary },
  mallInfo: { flex: 1 },
  mallName: { fontSize: 17, fontWeight: '600', color: COLORS.text },
  mallAddress: { fontSize: 13, color: COLORS.textSecondary, marginTop: 3 },
  mallMeta: { fontSize: 12, color: COLORS.textTertiary, marginTop: 3 },
  mallActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  actionChip: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6,
    backgroundColor: COLORS.primaryLight,
  },
  actionChipText: { fontSize: 11, fontWeight: '600', color: COLORS.primary },
});
