import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar, Grid, Card, Tag, SearchBar, Dropdown, Button, Empty } from 'antd-mobile';
import { LocationFill, RightOutline } from 'antd-mobile-icons';
import { useAuthStore } from '../../store/auth';
import { malls, categories, searchMerchants, getMallById, getMerchantsByMall } from '../../data/malls';
import MallSelector from '../../components/MallSelector';

const PRIMARY = '#00694B';
const GOLD = '#C4A962';

export default function MallDirectory() {
  const navigate = useNavigate();
  const { currentMallId } = useAuthStore();
  const [selectedFloor, setSelectedFloor] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchText, setSearchText] = useState('');

  const mall = getMallById(currentMallId) || malls[0];
  const mallMerchants = getMerchantsByMall(currentMallId);

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

  // 楼层名称映射
  const getFloorName = (floor: string): string => {
    const floorNames: Record<string, string> = {
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
    return floorNames[floor] || floor;
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <NavBar
        onBack={() => navigate(-1)}
        style={{ background: PRIMARY, color: '#fff' }}
        right={
          <MallSelector style={{ color: '#fff' }} />
        }
      >
        商場導覽
      </NavBar>

      {/* Mall Info Header */}
      <div style={{ background: PRIMARY, padding: '0 16px 20px', color: '#fff' }}>
        <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>
          {mall.nameTW}
        </div>
        <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 4 }}>
          {mall.nameEN}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, opacity: 0.85 }}>
          <LocationFill fontSize={14} />
          {mall.address}
        </div>
        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
          共 {mallMerchants.length} 間商戶 · {mall.floors.length} 層樓面
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ padding: '12px 16px', background: '#fff' }}>
        <SearchBar
          placeholder="搜尋商戶名稱、類別或標籤"
          value={searchText}
          onChange={setSearchText}
          style={{ '--background': '#f5f5f5', '--border-radius': '20px' } as React.CSSProperties}
        />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        {/* Floor Filter */}
        <Dropdown>
          <Dropdown.Item key="floor" title={selectedFloor === 'all' ? '樓層' : selectedFloor}>
            <div style={{ padding: 12 }}>
              <Grid columns={4} gap={8}>
                <Grid.Item>
                  <Button
                    size="small"
                    block
                    color={selectedFloor === 'all' ? 'primary' : 'default'}
                    onClick={() => setSelectedFloor('all')}
                  >
                    全部
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
          <Dropdown.Item key="category" title={selectedCategory === 'all' ? '類別' : categories.find(c => c.key === selectedCategory)?.label || selectedCategory}>
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
                      {c.label}
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
        找到 {filteredMerchants.length} 間商戶
        {searchText && <span> · 搜尋「{searchText}」</span>}
      </div>

      {/* Merchant List by Floor */}
      {filteredMerchants.length === 0 ? (
        <div style={{ padding: 40 }}>
          <Empty description="未找到符合條件的商戶" />
        </div>
      ) : (
        <div style={{ padding: '0 16px 16px' }}>
          {floorOrder.map((floor) => {
            const floorMerchants = merchantsByFloor[floor];
            if (!floorMerchants || floorMerchants.length === 0) return null;

            return (
              <div key={floor} style={{ marginBottom: 16 }}>
                <div style={{
                  fontSize: 14, fontWeight: 600, color: PRIMARY,
                  padding: '8px 0', borderBottom: `2px solid ${PRIMARY}`, marginBottom: 8,
                  display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <span style={{
                    background: PRIMARY, color: '#fff', padding: '2px 8px',
                    borderRadius: 4, fontSize: 12
                  }}>
                    {floor}
                  </span>
                  {getFloorName(floor)}
                  <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 400, color: '#999' }}>
                    {floorMerchants.length} 商戶
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
                            {m.nameTW || m.name}
                          </div>
                          {m.nameTW && (
                            <div style={{ fontSize: 11, color: '#999' }}>{m.name}</div>
                          )}
                          <div style={{ fontSize: 12, color: '#666' }}>
                            {m.unit}
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                            {m.stampMultiplier > 1 && (
                              <Tag color="warning" style={{ fontSize: 10 }}>
                                印花{m.stampMultiplier}倍
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
