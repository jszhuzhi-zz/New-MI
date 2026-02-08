import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar, Tabs, Grid, Card, Tag, SearchBar, Dropdown, Button, Empty } from 'antd-mobile';
import { LocationFill, RightOutline } from 'antd-mobile-icons';

const PRIMARY = '#00694B';
const GOLD = '#C4A962';

interface MallInfo {
  id: string;
  name: string;
  nameTW: string;
  address: string;
  floors: string[];
}

interface Merchant {
  id: string;
  name: string;
  nameTW?: string;
  floor: string;
  unit: string;
  category: string;
  subCategory: string;
  phone?: string;
  hours?: string;
  stampMultiplier: number;
  tags: string[];
}

// Real Festival Walk mall data
const malls: MallInfo[] = [
  {
    id: 'fw',
    name: 'Festival Walk',
    nameTW: '又一城',
    address: '九龍塘達之路80號',
    floors: ['MTR', 'G', 'UG', 'L1', 'L2', 'LG1', 'LG2'],
  },
];

// Real merchants from Festival Walk directory (sourced from festivalwalk.com.hk)
const merchants: Merchant[] = [
  // Fashion & Beauty - LG1
  { id: 'abercrombie', name: 'Abercrombie & Fitch', floor: 'LG1', unit: 'LG1-01', category: '時裝', subCategory: 'Fashion & Beauty', stampMultiplier: 1, tags: ['時裝', '休閒'] },
  { id: 'agnesb', name: 'agnès b.', floor: 'LG1', unit: 'LG1-05', category: '時裝', subCategory: 'Ladies Fashion', stampMultiplier: 1, tags: ['時裝', '法國品牌'] },
  { id: 'birkenstock', name: 'BIRKENSTOCK', floor: 'LG1', unit: 'LG1-08', category: '鞋履', subCategory: 'Footwear', stampMultiplier: 1, tags: ['鞋履', '德國品牌'] },
  { id: 'charleskeith', name: 'CHARLES & KEITH', floor: 'LG1', unit: 'LG1-12', category: '鞋履', subCategory: 'Accessories & Footwear', stampMultiplier: 1, tags: ['鞋履', '手袋'] },
  { id: 'clubmonaco', name: 'CLUB MONACO', floor: 'LG1', unit: 'LG1-15', category: '時裝', subCategory: 'Casual Chic', stampMultiplier: 1, tags: ['時裝', '休閒'] },
  { id: 'colehaan', name: 'Cole Haan', floor: 'LG1', unit: 'LG1-18', category: '鞋履', subCategory: 'Accessories & Footwear', stampMultiplier: 1, tags: ['鞋履', '美國品牌'] },
  { id: 'descente', name: 'DESCENTE', floor: 'LG1', unit: 'LG1-22', category: '運動', subCategory: 'Sports Apparel', stampMultiplier: 1.5, tags: ['運動', '日本品牌', '印花1.5倍'] },
  { id: 'futureclassics', name: 'Future Classics | kapok', floor: 'LG1', unit: 'LG1-25', category: '時裝', subCategory: 'Fashion & Beauty', stampMultiplier: 1, tags: ['設計師品牌', '選物店'] },
  { id: 'casetify', name: 'CASETiFY STUDIO', floor: 'LG1', unit: 'LG1-30', category: '配件', subCategory: 'Smart Living', stampMultiplier: 1, tags: ['手機殼', '配件'] },

  // Fashion & Beauty - LG2
  { id: 'boss', name: 'BOSS', floor: 'LG2', unit: 'LG2-01', category: '時裝', subCategory: 'Men\'s Wear', stampMultiplier: 1, tags: ['男裝', '德國品牌'] },
  { id: 'brooksbrothers', name: 'Brooks Brothers', floor: 'LG2', unit: 'LG2-05', category: '時裝', subCategory: 'Men\'s Wear', stampMultiplier: 1, tags: ['男裝', '美國品牌'] },
  { id: 'breitling', name: 'Breitling', floor: 'LG2', unit: 'LG2-08', category: '鐘錶', subCategory: 'Jewellery & Timepieces', stampMultiplier: 1, tags: ['鐘錶', '瑞士品牌'] },
  { id: 'chowsangsang', name: 'Chow Sang Sang', nameTW: '周生生', floor: 'LG2', unit: 'LG2-12', category: '珠寶', subCategory: 'Jewellery & Timepieces', stampMultiplier: 1, tags: ['珠寶', '金飾'] },
  { id: 'chowtaifook', name: 'CHOW TAI FOOK', nameTW: '周大福', floor: 'LG2', unit: 'LG2-15', category: '珠寶', subCategory: 'Jewellery & Timepieces', stampMultiplier: 1, tags: ['珠寶', '金飾'] },
  { id: 'gucci', name: 'GUCCI Timepieces & Jewelry', floor: 'LG2', unit: 'LG2-18', category: '珠寶', subCategory: 'Jewellery & Timepieces', stampMultiplier: 1, tags: ['鐘錶', '珠寶', '奢華品牌'] },
  { id: 'apm', name: 'APM Monaco', floor: 'LG2', unit: 'LG2-22', category: '珠寶', subCategory: 'Jewellery & Timepieces', stampMultiplier: 1, tags: ['珠寶', '摩納哥品牌'] },
  { id: 'eslite', name: 'eslite spectrum', nameTW: '誠品生活', floor: 'LG2', unit: 'LG2-30', category: '書店', subCategory: 'Books & Gifts', stampMultiplier: 1, tags: ['書店', '文創', '生活風格'], hours: '10:00-22:00' },

  // Health & Beauty - G
  { id: 'chanelbeaute', name: 'CHANEL BEAUTÉ', floor: 'G', unit: 'G-01', category: '美妝', subCategory: 'Health & Beauty', stampMultiplier: 1, tags: ['美妝', '奢華品牌'] },
  { id: 'cledepeaubeaute', name: 'Clé de Peau Beauté', floor: 'G', unit: 'G-05', category: '美妝', subCategory: 'Health & Beauty', stampMultiplier: 1, tags: ['美妝', '日本品牌'] },
  { id: 'clinique', name: 'Clinique', floor: 'G', unit: 'G-08', category: '美妝', subCategory: 'Health & Beauty', stampMultiplier: 1, tags: ['美妝', '護膚'] },
  { id: 'diorbeauty', name: 'Dior Beauty', floor: 'G', unit: 'G-10', category: '美妝', subCategory: 'Health & Beauty', stampMultiplier: 1, tags: ['美妝', '奢華品牌'] },
  { id: 'diptyque', name: 'Diptyque', floor: 'G', unit: 'G-12', category: '香氛', subCategory: 'Health & Beauty', stampMultiplier: 1, tags: ['香氛', '蠟燭', '法國品牌'] },
  { id: 'guerlain', name: 'Guerlain', floor: 'G', unit: 'G-15', category: '美妝', subCategory: 'Health & Beauty', stampMultiplier: 1, tags: ['美妝', '香水', '法國品牌'] },
  { id: 'starbucks', name: 'Starbucks', nameTW: '星巴克', floor: 'G', unit: 'G-G12', category: '餐飲', subCategory: 'Food & Beverage', stampMultiplier: 1, tags: ['咖啡', '輕食'], hours: '07:30-22:30', phone: '2265 8328' },
  { id: '7eleven', name: '7-Eleven', floor: 'G', unit: 'G-20', category: '便利店', subCategory: 'Home & Leisure', stampMultiplier: 0.5, tags: ['便利店'] },
  { id: 'canvas', name: 'CANVAS', floor: 'G', unit: 'G-22', category: '美妝', subCategory: 'Health & Beauty', stampMultiplier: 1, tags: ['美妝', '天然'] },

  // Health & Beauty - UG
  { id: 'aesop', name: 'Aēsop', floor: 'UG', unit: 'UG-01', category: '護膚', subCategory: 'Health & Beauty', stampMultiplier: 1, tags: ['護膚', '澳洲品牌'] },
  { id: 'aveda', name: 'AVEDA', floor: 'UG', unit: 'UG-05', category: '護髮', subCategory: 'Health & Beauty', stampMultiplier: 1, tags: ['護髮', '天然'] },
  { id: 'babor', name: 'BABOR', floor: 'UG', unit: 'UG-08', category: '護膚', subCategory: 'Health & Beauty', stampMultiplier: 1, tags: ['護膚', '德國品牌'] },
  { id: 'bathandbodyworks', name: 'Bath & Body Works', floor: 'UG', unit: 'UG-10', category: '身體護理', subCategory: 'Health & Beauty', stampMultiplier: 1, tags: ['身體護理', '香氛'] },
  { id: 'clarins', name: 'Clarins', floor: 'UG', unit: 'UG-12', category: '護膚', subCategory: 'Health & Beauty', stampMultiplier: 1, tags: ['護膚', '法國品牌'] },
  { id: 'fancl', name: 'FANCL', floor: 'UG', unit: 'UG-15', category: '美妝', subCategory: 'Health & Beauty', stampMultiplier: 1, tags: ['美妝', '日本品牌', '無添加'] },
  { id: 'fresh', name: 'fresh', floor: 'UG', unit: 'UG-18', category: '護膚', subCategory: 'Health & Beauty', stampMultiplier: 1, tags: ['護膚', '天然'] },
  { id: 'francfranc', name: 'Francfranc', floor: 'UG', unit: 'UG-25', category: '家品', subCategory: 'Home & Leisure', stampMultiplier: 1, tags: ['家品', '日本品牌'] },
  { id: 'bookazine', name: 'Bookazine', floor: 'UG', unit: 'UG-28', category: '書店', subCategory: 'Books & Gifts', stampMultiplier: 1, tags: ['書店', '雜誌'] },
  { id: 'donguri', name: 'Donguri Republic', nameTW: '橡子共和國', floor: 'UG', unit: 'UG-30', category: '精品', subCategory: 'Books & Gifts', stampMultiplier: 1, tags: ['吉卜力', '精品'] },
  { id: 'cinema', name: 'Festival Grand Cinema', nameTW: '又一城Grand戲院', floor: 'UG', unit: 'UG-50', category: '娛樂', subCategory: 'Entertainment', stampMultiplier: 0.5, tags: ['電影院', '娛樂'], hours: '11:00-00:00' },
  { id: 'pizzaexpress', name: 'PizzaExpress', floor: 'UG', unit: 'UG-R05', category: '餐飲', subCategory: 'Food & Beverage', stampMultiplier: 1, tags: ['意式', 'Pizza'], hours: '11:30-22:30' },

  // Fashion - L1
  { id: 'aigle', name: 'AIGLE', floor: 'L1', unit: 'L1-01', category: '時裝', subCategory: 'Fashion & Beauty', stampMultiplier: 1, tags: ['戶外', '法國品牌'] },
  { id: 'americaneagle', name: 'American Eagle', floor: 'L1', unit: 'L1-05', category: '時裝', subCategory: 'Fashion & Beauty', stampMultiplier: 1, tags: ['休閒', '美國品牌'] },
  { id: 'fila', name: 'Fila', floor: 'L1', unit: 'L1-08', category: '運動', subCategory: 'Fashion & Beauty', stampMultiplier: 1, tags: ['運動', '意大利品牌'] },
  { id: 'g2000', name: 'G2000', floor: 'L1', unit: 'L1-10', category: '時裝', subCategory: 'Fashion & Beauty', stampMultiplier: 1, tags: ['正裝', '香港品牌'] },
  { id: 'giordano', name: 'Giordano', floor: 'L1', unit: 'L1-12', category: '時裝', subCategory: 'Fashion & Beauty', stampMultiplier: 1, tags: ['休閒', '香港品牌'] },
  { id: 'giordanoladies', name: 'Giordano Ladies', floor: 'L1', unit: 'L1-15', category: '時裝', subCategory: 'Ladies Fashion', stampMultiplier: 1, tags: ['女裝', '香港品牌'] },
  { id: 'gigasports', name: 'GigaSports', floor: 'L1', unit: 'L1-20', category: '運動', subCategory: 'Sports Apparel', stampMultiplier: 1, tags: ['運動', '運動用品'] },
  { id: 'gowild', name: 'GO WILD', floor: 'L1', unit: 'L1-25', category: '戶外', subCategory: 'Sports Apparel', stampMultiplier: 1, tags: ['戶外', '露營'] },
  { id: 'uniqlo', name: 'UNIQLO', floor: 'L1', unit: 'L1-30', category: '時裝', subCategory: 'Fashion & Beauty', stampMultiplier: 1, tags: ['時裝', '日本品牌', '基本款'], hours: '10:00-22:00' },
  { id: 'eggoptical', name: 'eGG Optical Boutique', floor: 'L1', unit: 'L1-35', category: '眼鏡', subCategory: 'Fashion & Beauty', stampMultiplier: 1, tags: ['眼鏡', '配飾'] },
  { id: 'pacificcoffee', name: 'Pacific Coffee', nameTW: '太平洋咖啡', floor: 'L1', unit: 'L1-102', category: '餐飲', subCategory: 'Food & Beverage', stampMultiplier: 1, tags: ['咖啡', '輕食'], hours: '07:30-22:00', phone: '2265 8800' },
  { id: 'genkisushi', name: 'Genki Sushi', nameTW: '元氣壽司', floor: 'L1', unit: 'L1-108', category: '餐飲', subCategory: 'Food & Beverage', stampMultiplier: 1, tags: ['日式', '壽司'], hours: '11:00-22:00' },
  { id: 'pepperlunch', name: 'Pepper Lunch', floor: 'L1', unit: 'L1-R08', category: '餐飲', subCategory: 'Food & Beverage', stampMultiplier: 1, tags: ['日式', '鐵板'], hours: '11:00-22:00' },

  // Fashion & Sports - L2
  { id: 'columbia', name: 'Columbia Sportswear', floor: 'L2', unit: 'L2-01', category: '運動', subCategory: 'Sports Apparel', stampMultiplier: 1, tags: ['戶外', '美國品牌'] },
  { id: 'crocs', name: 'CROCS', floor: 'L2', unit: 'L2-05', category: '鞋履', subCategory: 'Footwear', stampMultiplier: 1, tags: ['鞋履', '休閒'] },
  { id: 'ecco', name: 'ECCO', floor: 'L2', unit: 'L2-08', category: '鞋履', subCategory: 'Footwear', stampMultiplier: 1, tags: ['鞋履', '丹麥品牌'] },
  { id: 'cathkidston', name: 'Cath Kidston', floor: 'L2', unit: 'L2-10', category: '配件', subCategory: 'Accessories', stampMultiplier: 1, tags: ['手袋', '英國品牌', '碎花'] },
  { id: 'drkong', name: 'Dr. Kong', nameTW: '護足博士', floor: 'L2', unit: 'L2-12', category: '鞋履', subCategory: 'Footwear', stampMultiplier: 1, tags: ['鞋履', '健康', '香港品牌'] },
  { id: 'bduck', name: 'B.Duck Playful Store', floor: 'L2', unit: 'L2-18', category: '精品', subCategory: 'Books & Gifts', stampMultiplier: 1, tags: ['精品', '卡通'] },
  { id: 'tamjai', name: 'TamJai Yunnan Mixian', nameTW: '譚仔雲南米線', floor: 'L2', unit: 'L2-R12', category: '餐飲', subCategory: 'Food & Beverage', stampMultiplier: 1, tags: ['中式', '米線', '香港品牌'], hours: '11:00-22:30' },

  // Banks & Services - LG2
  { id: 'bochk', name: 'Bank of China (Hong Kong)', nameTW: '中國銀行(香港)', floor: 'LG2', unit: 'LG2-B1', category: '銀行', subCategory: 'Banks & Services', stampMultiplier: 0, tags: ['銀行'] },
  { id: 'citibank', name: 'Citibank (Hong Kong)', floor: 'LG2', unit: 'LG2-B2', category: '銀行', subCategory: 'Banks & Services', stampMultiplier: 0, tags: ['銀行'] },
  { id: 'dbs', name: 'DBS Treasures Centre', floor: 'LG2', unit: 'LG2-B3', category: '銀行', subCategory: 'Banks & Services', stampMultiplier: 0, tags: ['銀行', '理財'] },
  { id: 'danryans', name: "Dan Ryan's Chicago Grill", floor: 'LG2', unit: 'LG2-28', category: '餐飲', subCategory: 'Food & Beverage', stampMultiplier: 1.5, tags: ['美式', '西餐', '印花1.5倍'], hours: '11:30-22:30' },

  // MTR Level
  { id: 'fortress', name: 'Fortress', nameTW: '豐澤', floor: 'MTR', unit: 'MTR-01', category: '電器', subCategory: 'Home & Leisure', stampMultiplier: 1, tags: ['電器', '電子產品'], hours: '10:00-22:00' },
  { id: 'ctagoksik', name: 'C.T.A. by GOKSIK', floor: 'MTR', unit: 'MTR-05', category: '精品', subCategory: 'Books & Gifts', stampMultiplier: 1, tags: ['精品', '文創'] },

  // Major Store - LG1
  { id: 'apple', name: 'Apple Festival Walk', floor: 'LG1', unit: 'LG1-40', category: '電子', subCategory: 'Major Store', stampMultiplier: 1, tags: ['Apple', '電子產品', '旗艦店'], hours: '10:00-22:00', phone: '2972 1500' },

  // Additional G floor
  { id: 'tripleo', name: "Triple O's", floor: 'G', unit: 'G-R10', category: '餐飲', subCategory: 'Food & Beverage', stampMultiplier: 1, tags: ['漢堡', '美式'], hours: '11:00-22:00' },
];

const categories = [
  { key: 'all', label: '全部' },
  { key: '時裝', label: '時裝' },
  { key: '美妝', label: '美妝護膚' },
  { key: '珠寶', label: '珠寶鐘錶' },
  { key: '鞋履', label: '鞋履配件' },
  { key: '運動', label: '運動戶外' },
  { key: '餐飲', label: '餐飲美食' },
  { key: '家品', label: '家品生活' },
];

export default function MallDirectory() {
  const navigate = useNavigate();
  const [selectedMall] = useState('fw');
  const [selectedFloor, setSelectedFloor] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchText, setSearchText] = useState('');

  const mall = malls.find((m) => m.id === selectedMall) || malls[0];

  // Filter merchants
  const filteredMerchants = useMemo(() => {
    return merchants.filter((m) => {
      const matchFloor = selectedFloor === 'all' || m.floor === selectedFloor;
      const matchCategory = selectedCategory === 'all' ||
        m.category === selectedCategory ||
        m.category.includes(selectedCategory) ||
        m.subCategory.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchSearch = !searchText ||
        m.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (m.nameTW && m.nameTW.includes(searchText)) ||
        m.tags.some((t) => t.includes(searchText));
      return matchFloor && matchCategory && matchSearch;
    });
  }, [selectedFloor, selectedCategory, searchText]);

  // Group by floor for display
  const merchantsByFloor = useMemo(() => {
    const grouped: Record<string, Merchant[]> = {};
    filteredMerchants.forEach((m) => {
      if (!grouped[m.floor]) grouped[m.floor] = [];
      grouped[m.floor].push(m);
    });
    return grouped;
  }, [filteredMerchants]);

  const floorOrder = mall.floors;

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <NavBar onBack={() => navigate(-1)} style={{ background: PRIMARY, color: '#fff' }}>
        {mall.nameTW} 商場導覽
      </NavBar>

      {/* Mall Info Header */}
      <div style={{ background: PRIMARY, padding: '0 16px 20px', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, opacity: 0.85 }}>
          <LocationFill fontSize={14} />
          {mall.address}
        </div>
        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
          共 {merchants.length} 間商戶 · {mall.floors.length} 層樓面
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ padding: '12px 16px', background: '#fff' }}>
        <SearchBar
          placeholder="搜尋商戶名稱或類別"
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
                  {floor === 'G' ? 'Ground Floor' :
                    floor === 'UG' ? 'Upper Ground' :
                      floor === 'L1' ? 'Level 1' :
                        floor === 'L2' ? 'Level 2' :
                          floor === 'LG1' ? 'Lower Ground 1' :
                            floor === 'LG2' ? 'Lower Ground 2' :
                              floor === 'MTR' ? 'MTR Level' : floor}
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
