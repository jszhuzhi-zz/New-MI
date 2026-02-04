import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NavBar, Card, List, Tag, Button, Divider } from 'antd-mobile';

const PRIMARY = '#00694B';
const GOLD = '#C4A962';

const merchantData: Record<string, any> = {
  m1: {
    name: '星巴克', nameEn: 'Starbucks', category: '餐飲', floor: 'G', unit: 'G12',
    mall: '又一城 Festival Walk', phone: '2265 8328',
    hours: '08:00 - 22:00', stampEnabled: true, stampMultiplier: 1,
    desc: '星巴克咖啡是全球最大的咖啡連鎖品牌，提供優質咖啡、茶飲及輕食。',
    tags: ['咖啡', 'Wi-Fi', '外賣'],
  },
  m2: {
    name: 'Pacific Coffee', nameEn: 'Pacific Coffee', category: '餐飲', floor: 'G', unit: 'G08',
    mall: '又一城 Festival Walk', phone: '2265 8800',
    hours: '07:30 - 21:30', stampEnabled: true, stampMultiplier: 1,
    desc: '太平洋咖啡是香港本地咖啡品牌，提供多款精品咖啡及特色飲品。',
    tags: ['咖啡', 'Wi-Fi', '本地品牌'],
  },
  m4: {
    name: 'UNIQLO', nameEn: 'UNIQLO', category: '時裝', floor: '1F', unit: '132-136',
    mall: '又一城 Festival Walk', phone: '2265 8500',
    hours: '10:00 - 22:00', stampEnabled: true, stampMultiplier: 1.5,
    desc: 'UNIQLO是日本知名快時尚品牌，以高品質基本款服飾聞名。',
    tags: ['時裝', '日本品牌', '家庭'],
  },
};

const defaultMerchant = {
  name: '商戶', nameEn: 'Merchant', category: '綜合', floor: 'G', unit: '-',
  mall: '領展商場', phone: '-', hours: '10:00 - 22:00',
  stampEnabled: true, stampMultiplier: 1,
  desc: '歡迎光臨本商戶。',
  tags: ['商戶'],
};

export default function MerchantDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const merchant = merchantData[id || ''] || defaultMerchant;

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <NavBar onBack={() => navigate(-1)} style={{ background: '#fff' }}>商戶詳情</NavBar>

      {/* Hero */}
      <div
        style={{
          height: 160,
          background: `linear-gradient(135deg, ${PRIMARY} 0%, #004D36 100%)`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#fff',
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 8 }}>🏪</div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>{merchant.name}</div>
        <div style={{ fontSize: 14, opacity: 0.7, marginTop: 2 }}>{merchant.nameEn}</div>
      </div>

      {/* Tags */}
      <div style={{ padding: '12px 16px 0', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <Tag color="primary" fill="outline" style={{ '--border-color': PRIMARY, '--text-color': PRIMARY } as React.CSSProperties}>
          {merchant.category}
        </Tag>
        {merchant.stampEnabled && (
          <Tag style={{ '--background-color': `${GOLD}22`, '--text-color': GOLD } as React.CSSProperties}>
            印花 x{merchant.stampMultiplier}
          </Tag>
        )}
        {merchant.tags.map((tag: string) => (
          <Tag key={tag} style={{ '--background-color': '#f0f0f0', '--text-color': '#666' } as React.CSSProperties}>
            {tag}
          </Tag>
        ))}
      </div>

      {/* Info */}
      <div style={{ padding: 16 }}>
        <Card style={{ borderRadius: 12 }}>
          <div style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 12 }}>
            {merchant.desc}
          </div>
          <Divider />
          <List style={{ '--border-top': 'none', '--border-bottom': 'none' } as React.CSSProperties}>
            <List.Item extra={merchant.mall}>所屬商場</List.Item>
            <List.Item extra={`${merchant.floor} - ${merchant.unit}`}>位置</List.Item>
            <List.Item extra={merchant.hours}>營業時間</List.Item>
            <List.Item extra={merchant.phone}>聯絡電話</List.Item>
            <List.Item extra={merchant.stampEnabled ? `${merchant.stampMultiplier}x 印花` : '不適用'}>
              印花獎賞
            </List.Item>
          </List>
        </Card>
      </div>

      {/* Actions */}
      <div style={{ padding: '0 16px 32px', display: 'flex', gap: 12 }}>
        <Button
          block
          color="primary"
          style={{
            '--background-color': PRIMARY,
            '--border-color': PRIMARY,
            borderRadius: 12,
            fontWeight: 600,
          } as React.CSSProperties}
          onClick={() => navigate('/scan')}
        >
          掃碼換印花
        </Button>
        <Button
          block
          fill="outline"
          style={{
            '--border-color': PRIMARY,
            '--text-color': PRIMARY,
            borderRadius: 12,
            fontWeight: 600,
          } as React.CSSProperties}
        >
          收藏商戶
        </Button>
      </div>
    </div>
  );
}
