import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar, Tabs, Grid, Card, Tag, Dropdown, Button } from 'antd-mobile';

const PRIMARY = '#00694B';
const GOLD = '#C4A962';

interface MallInfo {
  id: string;
  name: string;
  nameEn: string;
}

const malls: MallInfo[] = [
  { id: 'fw', name: '又一城', nameEn: 'Festival Walk' },
  { id: 'tt', name: 'T Town', nameEn: 'T Town' },
];

const floors = ['B2', 'B1', 'G', '1F', '2F', '3F'];

const categories = ['全部', '餐飲', '時裝', '美容', '電子', '生活', '超市', '娛樂'];

interface MerchantItem {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  floor: string;
  mall: string;
  stampEnabled: boolean;
}

const merchants: MerchantItem[] = [
  { id: 'm1', name: '星巴克', nameEn: 'Starbucks', category: '餐飲', floor: 'G', mall: 'fw', stampEnabled: true },
  { id: 'm2', name: 'Pacific Coffee', nameEn: 'Pacific Coffee', category: '餐飲', floor: 'G', mall: 'fw', stampEnabled: true },
  { id: 'm3', name: '大家樂', nameEn: 'Cafe de Coral', category: '餐飲', floor: 'B1', mall: 'fw', stampEnabled: true },
  { id: 'm4', name: 'UNIQLO', nameEn: 'UNIQLO', category: '時裝', floor: '1F', mall: 'fw', stampEnabled: true },
  { id: 'm5', name: 'ZARA', nameEn: 'ZARA', category: '時裝', floor: '2F', mall: 'fw', stampEnabled: true },
  { id: 'm6', name: 'Sephora', nameEn: 'Sephora', category: '美容', floor: '2F', mall: 'fw', stampEnabled: true },
  { id: 'm7', name: 'Apple Store', nameEn: 'Apple Store', category: '電子', floor: '1F', mall: 'fw', stampEnabled: false },
  { id: 'm8', name: 'Page One', nameEn: 'Page One', category: '生活', floor: '3F', mall: 'fw', stampEnabled: true },
  { id: 'm9', name: '百佳超級市場', nameEn: 'PARKnSHOP', category: '超市', floor: 'B2', mall: 'fw', stampEnabled: true },
  { id: 'm10', name: 'MCL 戲院', nameEn: 'MCL Cinema', category: '娛樂', floor: '3F', mall: 'fw', stampEnabled: true },
  { id: 'm11', name: '譚仔三哥', nameEn: 'TamJai SamGor', category: '餐飲', floor: 'G', mall: 'tt', stampEnabled: true },
  { id: 'm12', name: 'H&M', nameEn: 'H&M', category: '時裝', floor: '1F', mall: 'tt', stampEnabled: true },
  { id: 'm13', name: '屈臣氏', nameEn: 'Watsons', category: '美容', floor: 'G', mall: 'tt', stampEnabled: true },
  { id: 'm14', name: '惠康超市', nameEn: 'Wellcome', category: '超市', floor: 'B1', mall: 'tt', stampEnabled: true },
];

export default function MallDirectory() {
  const navigate = useNavigate();
  const [selectedMall, setSelectedMall] = useState('fw');
  const [selectedFloor, setSelectedFloor] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('全部');

  const filtered = merchants.filter((m) => {
    if (m.mall !== selectedMall) return false;
    if (selectedFloor !== 'all' && m.floor !== selectedFloor) return false;
    if (selectedCategory !== '全部' && m.category !== selectedCategory) return false;
    return true;
  });

  const currentMall = malls.find((m) => m.id === selectedMall);

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <NavBar onBack={() => navigate(-1)} style={{ background: '#fff' }}>商場目錄</NavBar>

      {/* Mall Selector */}
      <div style={{ background: '#fff', padding: '8px 16px 0' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {malls.map((mall) => (
            <Button
              key={mall.id}
              size="small"
              color={selectedMall === mall.id ? 'primary' : 'default'}
              fill={selectedMall === mall.id ? 'solid' : 'outline'}
              onClick={() => setSelectedMall(mall.id)}
              style={{
                borderRadius: 20,
                ...(selectedMall === mall.id
                  ? { '--background-color': PRIMARY, '--border-color': PRIMARY }
                  : { '--border-color': '#ddd', '--text-color': '#666' }),
              } as React.CSSProperties}
            >
              {mall.name} {mall.nameEn}
            </Button>
          ))}
        </div>

        {/* Floor Tabs */}
        <Tabs
          activeKey={selectedFloor}
          onChange={setSelectedFloor}
          style={{ '--active-line-color': PRIMARY, '--active-title-color': PRIMARY } as React.CSSProperties}
        >
          <Tabs.Tab title="全部" key="all" />
          {floors.map((f) => (
            <Tabs.Tab title={f} key={f} />
          ))}
        </Tabs>
      </div>

      {/* Category Filters */}
      <div style={{ padding: '8px 16px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        {categories.map((cat) => (
          <Tag
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              marginRight: 8,
              padding: '4px 12px',
              cursor: 'pointer',
              '--background-color': selectedCategory === cat ? PRIMARY : '#fff',
              '--text-color': selectedCategory === cat ? '#fff' : '#666',
              '--border-color': selectedCategory === cat ? PRIMARY : '#ddd',
              borderRadius: 16,
            } as React.CSSProperties}
          >
            {cat}
          </Tag>
        ))}
      </div>

      {/* Merchant Grid */}
      <div style={{ padding: '8px 16px 16px' }}>
        <div style={{ fontSize: 13, color: '#999', marginBottom: 8 }}>
          {currentMall?.name} · 共 {filtered.length} 間商戶
        </div>
        <Grid columns={2} gap={10}>
          {filtered.map((m) => (
            <Grid.Item key={m.id}>
              <Card
                style={{ borderRadius: 12, height: '100%', cursor: 'pointer' }}
                onClick={() => navigate(`/merchant/${m.id}`)}
              >
                <div
                  style={{
                    height: 60,
                    background: `linear-gradient(135deg, ${PRIMARY}22, ${PRIMARY}11)`,
                    margin: '-12px -12px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                  }}
                >
                  🏪
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>{m.name}</div>
                <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{m.nameEn}</div>
                <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                  <Tag
                    color="primary"
                    fill="outline"
                    style={{ '--border-color': PRIMARY, '--text-color': PRIMARY, fontSize: 10, '--border-radius': '4px' } as React.CSSProperties}
                  >
                    {m.category}
                  </Tag>
                  <Tag style={{ '--background-color': '#f0f0f0', '--text-color': '#999', fontSize: 10, '--border-radius': '4px' } as React.CSSProperties}>
                    {m.floor}
                  </Tag>
                  {m.stampEnabled && (
                    <Tag style={{ '--background-color': `${GOLD}22`, '--text-color': GOLD, fontSize: 10, '--border-radius': '4px' } as React.CSSProperties}>
                      印花
                    </Tag>
                  )}
                </div>
              </Card>
            </Grid.Item>
          ))}
        </Grid>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999', fontSize: 14 }}>
            暫無符合條件的商戶
          </div>
        )}
      </div>
    </div>
  );
}
