import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar, Grid, Card, Tag, SearchBar, Dropdown, Button, Empty } from 'antd-mobile';
import { LocationFill, RightOutline } from 'antd-mobile-icons';
import { useAuthStore } from '../../store/auth';
import { useSettingsStore, type Locale } from '../../store/settings';
import { useTranslation } from '../../locales';
import { malls, categories, searchMerchants, getMallById, getMerchantsByMall } from '../../data/malls';
import MallSelector from '../../components/MallSelector';

const GOLD = '#C4A962';

export default function MallDirectory() {
  const navigate = useNavigate();
  const { t, locale } = useTranslation();
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();
  const { currentMallId } = useAuthStore();
  const [selectedFloor, setSelectedFloor] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchText, setSearchText] = useState('');

  const mall = getMallById(currentMallId) || malls[0];
  const mallMerchants = getMerchantsByMall(currentMallId);

  const labels = useMemo(() => ({
    title: { 'zh-TW': '商場導覽', 'zh-CN': '商场导览', en: 'Mall Directory' },
    searchPlaceholder: { 'zh-TW': '搜尋商戶名稱、類別或標籤', 'zh-CN': '搜索商户名称、类别或标签', en: 'Search merchants, categories, or tags' },
    floor: { 'zh-TW': '樓層', 'zh-CN': '楼层', en: 'Floor' },
    category: { 'zh-TW': '類別', 'zh-CN': '类别', en: 'Category' },
    all: { 'zh-TW': '全部', 'zh-CN': '全部', en: 'All' },
    merchants: { 'zh-TW': '間商戶', 'zh-CN': '间商户', en: 'merchants' },
    floors: { 'zh-TW': '層樓面', 'zh-CN': '层楼面', en: 'floors' },
    total: { 'zh-TW': '共', 'zh-CN': '共', en: '' },
    found: { 'zh-TW': '找到', 'zh-CN': '找到', en: 'Found' },
    searching: { 'zh-TW': '搜尋', 'zh-CN': '搜索', en: 'Searching' },
    noResults: { 'zh-TW': '未找到符合條件的商戶', 'zh-CN': '未找到符合条件的商户', en: 'No merchants found' },
    stampMultiplier: { 'zh-TW': '印花', 'zh-CN': '印花', en: 'Stamps' },
    times: { 'zh-TW': '倍', 'zh-CN': '倍', en: 'x' },
  }), []);

  // Localized category labels
  const getCategoryLabel = (key: string) => {
    const cat = categories.find((c) => c.key === key);
    if (!cat) return key;
    return locale === 'en' ? cat.labelEN : cat.label;
  };

  // Filter merchants
  const filteredMerchants = useMemo(() => {
    return searchMerchants(currentMallId, searchText, selectedFloor, selectedCategory);
  }, [currentMallId, searchText, selectedFloor, selectedCategory]);

  // Group by floor for display
  const merchantsByFloor = useMemo(() => {
    const grouped: Record<string, typeof filteredMerchants> = {};
    filteredMerchants.forEach((m) => {
      if (!grouped[m.floor]) grouped[m.floor] = [];
      grouped[m.floor].push(m);
    });
    return grouped;
  }, [filteredMerchants]);

  const floorOrder = mall.floors;

  // Floor name mapping
  const getFloorName = (floor: string): string => {
    const floorNamesTW: Record<string, string> = {
      'G': '地下',
      'UG': '高層地下',
      'L1': '1樓',
      'L2': '2樓',
      'L3': '3樓',
      'L4': '4樓',
      'L5': '5樓',
      'L6': '6樓',
      'L7': '7樓',
      'L8': '8樓',
      'L9': '9樓',
      'LG1': '地庫1層',
      'LG2': '地庫2層',
      'MTR': '港鐵層',
    };
    const floorNamesCN: Record<string, string> = {
      'G': '地下',
      'UG': '高层地下',
      'L1': '1楼',
      'L2': '2楼',
      'L3': '3楼',
      'L4': '4楼',
      'L5': '5楼',
      'L6': '6楼',
      'L7': '7楼',
      'L8': '8楼',
      'L9': '9楼',
      'LG1': '地库1层',
      'LG2': '地库2层',
      'MTR': '港铁层',
    };
    const floorNamesEN: Record<string, string> = {
      'G': 'Ground Floor',
      'UG': 'Upper Ground',
      'L1': 'Level 1',
      'L2': 'Level 2',
      'L3': 'Level 3',
      'L4': 'Level 4',
      'L5': 'Level 5',
      'L6': 'Level 6',
      'L7': 'Level 7',
      'L8': 'Level 8',
      'L9': 'Level 9',
      'LG1': 'Lower Ground 1',
      'LG2': 'Lower Ground 2',
      'MTR': 'MTR Level',
    };
    if (locale === 'en') return floorNamesEN[floor] || floor;
    if (locale === 'zh-CN') return floorNamesCN[floor] || floor;
    return floorNamesTW[floor] || floor;
  };

  // Get localized mall and merchant names
  const mallName = locale === 'en' ? mall.nameEN : mall.nameTW;
  const mallAddress = locale === 'en' ? mall.addressEN : mall.address;

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <NavBar
        onBack={() => navigate(-1)}
        style={{ background: colors.primary, color: '#fff' }}
        right={
          <MallSelector style={{ color: '#fff' }} />
        }
      >
        {labels.title[locale]}
      </NavBar>

      {/* Mall Info Header */}
      <div style={{ background: colors.primary, padding: '0 16px 20px', color: '#fff' }}>
        <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>
          {mallName}
        </div>
        {locale !== 'en' && (
          <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 4 }}>
            {mall.nameEN}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, opacity: 0.85 }}>
          <LocationFill fontSize={14} />
          {mallAddress}
        </div>
        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
          {labels.total[locale]} {mallMerchants.length} {labels.merchants[locale]} · {mall.floors.length} {labels.floors[locale]}
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ padding: '12px 16px', background: '#fff' }}>
        <SearchBar
          placeholder={labels.searchPlaceholder[locale]}
          value={searchText}
          onChange={setSearchText}
          style={{ '--background': '#f5f5f5', '--border-radius': '20px' } as React.CSSProperties}
        />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        {/* Floor Filter */}
        <Dropdown>
          <Dropdown.Item key="floor" title={selectedFloor === 'all' ? labels.floor[locale] : selectedFloor}>
            <div style={{ padding: 12 }}>
              <Grid columns={4} gap={8}>
                <Grid.Item>
                  <Button
                    size="small"
                    block
                    color={selectedFloor === 'all' ? 'primary' : 'default'}
                    onClick={() => setSelectedFloor('all')}
                  >
                    {labels.all[locale]}
                  </Button>
                </Grid.Item>
                {mall.floors.map((f) => (
                  <Grid.Item key={f}>
                    <Button
                      size="small"
                      block
                      color={selectedFloor === f ? 'primary' : 'default'}
                      onClick={() => setSelectedFloor(f)}
                    >
                      {f}
                    </Button>
                  </Grid.Item>
                ))}
              </Grid>
            </div>
          </Dropdown.Item>
        </Dropdown>

        {/* Category Filter */}
        <Dropdown>
          <Dropdown.Item key="category" title={selectedCategory === 'all' ? labels.category[locale] : getCategoryLabel(selectedCategory)}>
            <div style={{ padding: 12 }}>
              <Grid columns={3} gap={8}>
                {categories.map((c) => (
                  <Grid.Item key={c.key}>
                    <Button
                      size="small"
                      block
                      color={selectedCategory === c.key ? 'primary' : 'default'}
                      onClick={() => setSelectedCategory(c.key)}
                    >
                      {locale === 'en' ? c.labelEN : c.label}
                    </Button>
                  </Grid.Item>
                ))}
              </Grid>
            </div>
          </Dropdown.Item>
        </Dropdown>
      </div>

      {/* Results Count */}
      <div style={{ padding: '12px 16px', fontSize: 13, color: '#999' }}>
        {labels.found[locale]} {filteredMerchants.length} {labels.merchants[locale]}
        {searchText && <span> · {labels.searching[locale]}「{searchText}」</span>}
      </div>

      {/* Merchant List by Floor */}
      {filteredMerchants.length === 0 ? (
        <div style={{ padding: 40 }}>
          <Empty description={labels.noResults[locale]} />
        </div>
      ) : (
        <div style={{ padding: '0 16px 16px' }}>
          {floorOrder.map((floor) => {
            const floorMerchants = merchantsByFloor[floor];
            if (!floorMerchants || floorMerchants.length === 0) return null;

            return (
              <div key={floor} style={{ marginBottom: 16 }}>
                <div style={{
                  fontSize: 14, fontWeight: 600, color: colors.primary,
                  padding: '8px 0', borderBottom: `2px solid ${colors.primary}`, marginBottom: 8,
                  display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <span style={{
                    background: colors.primary, color: '#fff', padding: '2px 8px',
                    borderRadius: 4, fontSize: 12
                  }}>
                    {floor}
                  </span>
                  {getFloorName(floor)}
                  <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 400, color: '#999' }}>
                    {floorMerchants.length} {labels.merchants[locale]}
                  </span>
                </div>

                <Grid columns={2} gap={8}>
                  {floorMerchants.map((m) => (
                    <Grid.Item key={m.id}>
                      <Card
                        style={{ borderRadius: 12, position: 'relative' }}
                        onClick={() => navigate(`/merchant/${m.id}`)}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#333', paddingRight: 16 }}>
                            {locale === 'en' ? m.name : (m.nameTW || m.name)}
                          </div>
                          {locale !== 'en' && m.nameTW && (
                            <div style={{ fontSize: 11, color: '#999' }}>{m.name}</div>
                          )}
                          <div style={{ fontSize: 12, color: '#666' }}>
                            {m.unit}
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                            {m.stampMultiplier > 1 && (
                              <Tag color="warning" style={{ fontSize: 10 }}>
                                {labels.stampMultiplier[locale]}{m.stampMultiplier}{labels.times[locale]}
                              </Tag>
                            )}
                            <Tag style={{ '--background-color': '#f5f5f5', '--text-color': '#666', fontSize: 10 } as React.CSSProperties}>
                              {m.category}
                            </Tag>
                          </div>
                        </div>
                        <RightOutline
                          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#ccc' }}
                        />
                      </Card>
                    </Grid.Item>
                  ))}
                </Grid>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
