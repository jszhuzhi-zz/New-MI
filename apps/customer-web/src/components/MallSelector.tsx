import React, { useState, useMemo } from 'react';
import { Popup, List, SearchBar, Tag } from 'antd-mobile';
import { DownOutline, LocationFill } from 'antd-mobile-icons';
import { useAuthStore } from '../store/auth';
import { useSettingsStore, type Locale } from '../store/settings';
import { malls } from '../data/malls';

// Multilingual labels
const labels: Record<string, Record<Locale, string>> = {
  selectMall: { 'zh-TW': '選擇商場', 'zh-CN': '选择商场', en: 'Select Mall' },
  close: { 'zh-TW': '關閉', 'zh-CN': '关闭', en: 'Close' },
  searchPlaceholder: { 'zh-TW': '搜尋商場名稱或地區', 'zh-CN': '搜索商场名称或地区', en: 'Search mall name or region' },
  current: { 'zh-TW': '當前', 'zh-CN': '当前', en: 'Current' },
  floors: { 'zh-TW': '層', 'zh-CN': '层', en: 'floors' },
  noResults: { 'zh-TW': '未找到符合條件的商場', 'zh-CN': '未找到符合条件的商场', en: 'No matching malls found' },
};

// Region names in different languages
const regionNames: Record<string, Record<Locale, string>> = {
  '九龍東': { 'zh-TW': '九龍東', 'zh-CN': '九龙东', en: 'Kowloon East' },
  '九龍西': { 'zh-TW': '九龍西', 'zh-CN': '九龙西', en: 'Kowloon West' },
  '新界東': { 'zh-TW': '新界東', 'zh-CN': '新界东', en: 'New Territories East' },
  '新界西': { 'zh-TW': '新界西', 'zh-CN': '新界西', en: 'New Territories West' },
  '港島': { 'zh-TW': '港島', 'zh-CN': '港岛', en: 'Hong Kong Island' },
};

interface MallSelectorProps {
  style?: React.CSSProperties;
  showLabel?: boolean;
}

export default function MallSelector({ style, showLabel = true }: MallSelectorProps) {
  const [visible, setVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const { currentMallId, setCurrentMall } = useAuthStore();
  const locale = useSettingsStore((s) => s.locale);
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();

  const t = (key: string) => labels[key]?.[locale] || labels[key]?.['zh-TW'] || key;
  const getRegionName = (region: string) => regionNames[region]?.[locale] || region;

  const currentMall = malls.find((m) => m.id === currentMallId) || malls[0];

  // Get mall display name based on locale
  const getMallName = (mall: typeof malls[0]) => {
    if (locale === 'en') return mall.nameEN;
    if (locale === 'zh-CN') return mall.name; // Simplified Chinese
    return mall.nameTW; // Traditional Chinese
  };

  // Get mall address based on locale
  const getMallAddress = (mall: typeof malls[0]) => {
    if (locale === 'en') return mall.addressEN || mall.address;
    return mall.address;
  };

  const filteredMalls = useMemo(() => {
    if (!searchText) return malls;
    const search = searchText.toLowerCase();
    return malls.filter((m) => {
      return (
        m.name.toLowerCase().includes(search) ||
        m.nameTW.includes(searchText) ||
        m.nameEN.toLowerCase().includes(search) ||
        m.region.includes(searchText) ||
        m.address.includes(searchText) ||
        (m.addressEN && m.addressEN.toLowerCase().includes(search))
      );
    });
  }, [searchText]);

  // Group by region
  const mallsByRegion = useMemo(() => {
    return filteredMalls.reduce((acc, mall) => {
      if (!acc[mall.region]) acc[mall.region] = [];
      acc[mall.region].push(mall);
      return acc;
    }, {} as Record<string, typeof malls>);
  }, [filteredMalls]);

  const handleSelect = (mallId: string) => {
    setCurrentMall(mallId);
    setVisible(false);
    setSearchText('');
  };

  return (
    <>
      <div
        onClick={() => setVisible(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          cursor: 'pointer',
          padding: '6px 12px',
          background: 'rgba(255,255,255,0.15)',
          borderRadius: 20,
          ...style,
        }}
      >
        <LocationFill fontSize={14} />
        <span style={{ fontSize: 14, fontWeight: 500, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {getMallName(currentMall)}
        </span>
        <DownOutline fontSize={12} />
      </div>

      <Popup
        visible={visible}
        onMaskClick={() => {
          setVisible(false);
          setSearchText('');
        }}
        position="bottom"
        bodyStyle={{
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: '80vh',
          overflow: 'auto',
        }}
      >
        <div style={{ padding: '16px 16px 8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 18, fontWeight: 600, color: '#333' }}>{t('selectMall')}</span>
            <span
              onClick={() => {
                setVisible(false);
                setSearchText('');
              }}
              style={{ color: colors.primary, fontSize: 14, cursor: 'pointer' }}
            >
              {t('close')}
            </span>
          </div>

          <SearchBar
            placeholder={t('searchPlaceholder')}
            value={searchText}
            onChange={setSearchText}
            style={{ '--background': '#f5f5f5', '--border-radius': '20px', marginBottom: 12 } as React.CSSProperties}
          />

          {Object.entries(mallsByRegion).map(([region, regionMalls]) => (
            <div key={region} style={{ marginBottom: 16 }}>
              <div style={{
                fontSize: 13,
                color: '#999',
                padding: '8px 0',
                borderBottom: '1px solid #f0f0f0',
                marginBottom: 8,
              }}>
                {getRegionName(region)}
              </div>
              <List style={{ '--border-top': 'none', '--border-bottom': 'none' }}>
                {regionMalls.map((mall) => (
                  <List.Item
                    key={mall.id}
                    onClick={() => handleSelect(mall.id)}
                    arrow={false}
                    style={{
                      background: mall.id === currentMallId ? `${colors.primary}10` : 'transparent',
                      borderRadius: 8,
                      marginBottom: 4,
                    }}
                    extra={
                      mall.id === currentMallId ? (
                        <Tag color="success" style={{ fontSize: 11 }}>{t('current')}</Tag>
                      ) : null
                    }
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <div style={{
                        fontSize: 15,
                        fontWeight: mall.id === currentMallId ? 600 : 400,
                        color: mall.id === currentMallId ? colors.primary : '#333',
                      }}>
                        {getMallName(mall)}
                      </div>
                      <div style={{ fontSize: 12, color: '#999' }}>
                        {locale === 'en' ? mall.nameTW : mall.nameEN} · {mall.floors.length} {t('floors')}
                      </div>
                      <div style={{ fontSize: 11, color: '#bbb', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <LocationFill fontSize={10} />
                        {getMallAddress(mall)}
                      </div>
                    </div>
                  </List.Item>
                ))}
              </List>
            </div>
          ))}

          {filteredMalls.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
              {t('noResults')}
            </div>
          )}
        </div>
      </Popup>
    </>
  );
}
