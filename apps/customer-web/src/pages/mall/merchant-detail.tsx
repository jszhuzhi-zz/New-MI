import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NavBar, Card, List, Tag, Button, Divider, Empty } from 'antd-mobile';
import { merchants, getMallById } from '../../data/malls';

const PRIMARY = '#00694B';
const GOLD = '#C4A962';

export default function MerchantDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Find merchant by id
  const merchant = merchants.find((m) => m.id === id);
  const mall = merchant ? getMallById(merchant.mallId) : null;

  if (!merchant || !mall) {
    return (
      <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
        <NavBar onBack={() => navigate(-1)} style={{ background: '#fff' }}>商戶詳情</NavBar>
        <div style={{ padding: 40 }}>
          <Empty description="找不到該商戶" />
        </div>
      </div>
    );
  }

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
        <div style={{ fontSize: 22, fontWeight: 700 }}>{merchant.nameTW || merchant.name}</div>
        {merchant.nameTW && (
          <div style={{ fontSize: 14, opacity: 0.7, marginTop: 2 }}>{merchant.name}</div>
        )}
      </div>

      {/* Tags */}
      <div style={{ padding: '12px 16px 0', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <Tag color="primary" fill="outline" style={{ '--border-color': PRIMARY, '--text-color': PRIMARY } as React.CSSProperties}>
          {merchant.category}
        </Tag>
        {merchant.stampMultiplier > 0 && (
          <Tag style={{ '--background-color': `${GOLD}22`, '--text-color': GOLD } as React.CSSProperties}>
            印花 x{merchant.stampMultiplier}
          </Tag>
        )}
        {merchant.tags.slice(0, 4).map((tag: string) => (
          <Tag key={tag} style={{ '--background-color': '#f0f0f0', '--text-color': '#666' } as React.CSSProperties}>
            {tag}
          </Tag>
        ))}
      </div>

      {/* Info */}
      <div style={{ padding: 16 }}>
        <Card style={{ borderRadius: 12 }}>
          <div style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 12 }}>
            歡迎光臨 {merchant.nameTW || merchant.name}，位於 {mall.nameTW} {merchant.floor} 層 {merchant.unit}。
            {merchant.stampMultiplier > 1 && (
              <span style={{ color: GOLD }}> 消費可享 {merchant.stampMultiplier} 倍印花獎賞！</span>
            )}
          </div>
          <Divider />
          <List style={{ '--border-top': 'none', '--border-bottom': 'none' } as React.CSSProperties}>
            <List.Item extra={`${mall.nameTW} (${mall.nameEN})`}>所屬商場</List.Item>
            <List.Item extra={`${merchant.floor} - ${merchant.unit}`}>位置</List.Item>
            <List.Item extra={merchant.hours || '10:00 - 22:00'}>營業時間</List.Item>
            <List.Item extra={merchant.phone || '-'}>聯絡電話</List.Item>
            <List.Item extra={merchant.stampMultiplier > 0 ? `${merchant.stampMultiplier}x 印花` : '不適用'}>
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
