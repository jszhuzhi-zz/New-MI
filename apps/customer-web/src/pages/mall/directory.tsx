import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar, Card, Tabs, Grid, Tag, SearchBar, Selector } from 'antd-mobile';

const PRIMARY = '#00694B';

const malls = [
  { id: 'm1', name: '又一城 Festival Walk' },
  { id: 'm2', name: 'T Town' },
  { id: 'm3', name: '九龍城廣場' },
  { id: 'm4', name: '赤柱廣場 Stanley Plaza' },
];

const merchants = [
  { id: 'mc1', name: 'Pacific Coffee', category: '餐飲', floor: '1F', unit: 'A12' },
  { id: 'mc2', name: 'UNIQLO', category: '時裝', floor: '2F', unit: 'B08' },
  { id: 'mc3', name: 'Starbucks', category: '餐飲', floor: 'G', unit: 'G15' },
  { id: 'mc4', name: 'MUJI', category: '生活', floor: '3F', unit: 'C22' },
  { id: 'mc5', name: '大家樂', category: '餐飲', floor: 'B1', unit: 'F03' },
  { id: 'mc6', name: 'H&M', category: '時裝', floor: '2F', unit: 'B15' },
  { id: 'mc7', name: '百佳', category: '超市', floor: 'B2', unit: 'LG01' },
  { id: 'mc8', name: 'Apple Store', category: '電子', floor: '1F', unit: 'A01' },
  { id: 'mc9', name: 'Sephora', category: '美容', floor: '1F', unit: 'A20' },
  { id: 'mc10', name: 'CINEMA CITY', category: '娛樂', floor: '3F', unit: 'D01' },
];

const categories = ['全部', '餐飲', '時裝', '生活', '超市', '電子', '美容', '娛樂'];
const catColors: Record<string, string> = { '餐飲': '#E65100', '時裝': '#7B1FA2', '生活': '#00695C', '超市': '#1565C0', '電子': '#37474F', '美容': '#AD1457', '娛樂': '#F57F17' };

export default function MallDirectory() {
  const navigate = useNavigate();
  const [selectedMall, setSelectedMall] = useState('m1');
  const [floor, setFloor] = useState('all');
  const [cat, setCat] = useState('全部');
  const [search, setSearch] = useState('');

  const floors = ['all', 'B2', 'B1', 'G', '1F', '2F', '3F'];
  const filtered = merchants.filter((m) => {
    if (cat !== '全部' && m.category !== cat) return false;
    if (floor !== 'all' && m.floor !== floor) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <NavBar onBack={() => navigate(-1)} style={{ background: '#fff' }}>商場目錄</NavBar>

      {/* Mall Selector */}
      <div style={{ background: '#fff', padding: '8px 16px 0', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
          {malls.map((m) => (
            <div
              key={m.id}
              onClick={() => setSelectedMall(m.id)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 13, whiteSpace: 'nowrap', cursor: 'pointer',
                background: selectedMall === m.id ? PRIMARY : '#f0f0f0',
                color: selectedMall === m.id ? '#fff' : '#666',
                fontWeight: selectedMall === m.id ? 600 : 400,
              }}
            >
              {m.name}
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '8px 16px', background: '#fff' }}>
        <SearchBar placeholder="搜索商戶" value={search} onChange={setSearch} style={{ '--background': '#f5f5f5' } as any} />
      </div>

      {/* Floor Tabs */}
      <Tabs activeKey={floor} onChange={setFloor} style={{ '--active-line-color': PRIMARY, '--active-title-color': PRIMARY, background: '#fff' } as any}>
        {floors.map((f) => (
          <Tabs.Tab title={f === 'all' ? '全部' : f} key={f} />
        ))}
      </Tabs>

      {/* Category Filter */}
      <div style={{ padding: '8px 16px 0', display: 'flex', gap: 6, overflowX: 'auto' }}>
        {categories.map((c) => (
          <Tag
            key={c}
            color={cat === c ? 'primary' : 'default'}
            fill={cat === c ? 'solid' : 'outline'}
            onClick={() => setCat(c)}
            style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            {c}
          </Tag>
        ))}
      </div>

      {/* Merchant List */}
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 13, color: '#999', marginBottom: 8 }}>共 {filtered.length} 間商戶</div>
        <Grid columns={2} gap={12}>
          {filtered.map((m) => (
            <Grid.Item key={m.id}>
              <Card onClick={() => navigate(`/merchant/${m.id}`)} style={{ cursor: 'pointer' }}>
                <div style={{ height: 60, background: '#f0f0f0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, fontSize: 24 }}>
                  🏪
                </div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{m.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <Tag color="primary" fill="outline" style={{ fontSize: 10, '--border-radius': '4px' } as any}>
                    {m.category}
                  </Tag>
                  <span style={{ fontSize: 11, color: '#999' }}>{m.floor} {m.unit}</span>
                </div>
              </Card>
            </Grid.Item>
          ))}
        </Grid>
      </div>
    </div>
  );
}
