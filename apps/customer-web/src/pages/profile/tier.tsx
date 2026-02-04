import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar, Card, List, ProgressBar, Steps, Tag } from 'antd-mobile';
import { CheckCircleFill } from 'antd-mobile-icons';

const PRIMARY = '#00694B';
const GOLD = '#C4A962';

const tiers = [
  { name: 'Standard 標準', stamps: 0, icon: '🟢', color: '#4CAF50', current: false, benefits: ['基本印花獲取 (每HK$10 = 1印花)', '會員專屬價格', '生日雙倍印花'] },
  { name: 'Silver 銀卡', stamps: 1000, icon: '🥈', color: '#9E9E9E', current: false, benefits: ['1.2倍印花加成', '免費泊車2小時/月', '優先參與活動', '生日雙倍印花'] },
  { name: 'Gold 金卡', stamps: 3000, icon: '🥇', color: GOLD, current: true, benefits: ['1.5倍印花加成', '免費泊車3小時/月', '優先參與活動', '專屬客服通道', '生日三倍印花', '季度禮品'] },
  { name: 'Platinum 白金', stamps: 5000, icon: '💎', color: '#90CAF9', current: false, benefits: ['2倍印花加成', '免費泊車5小時/月', 'VIP活動邀請', '專屬客服經理', '生日五倍印花', '每月禮品', '機場貴賓廳'] },
  { name: 'Diamond 鑽石', stamps: 10000, icon: '👑', color: '#CE93D8', current: false, benefits: ['3倍印花加成', '無限免費泊車', 'VIP活動邀請', '1對1客服經理', '生日十倍印花', '每月精選禮品', '全球機場貴賓廳', '專屬折扣通道'] },
];

export default function TierPage() {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <NavBar onBack={() => navigate(-1)} style={{ background: '#fff' }}>我的等級</NavBar>

      {/* Current Tier */}
      <div style={{ background: `linear-gradient(135deg, ${PRIMARY}, #004D36)`, padding: '24px 20px', color: '#fff', textAlign: 'center' }}>
        <div style={{ fontSize: 40 }}>🥇</div>
        <div style={{ fontSize: 24, fontWeight: 800, marginTop: 8 }}>Gold 金卡會員</div>
        <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>累計印花：3,580 / 升級需要：5,000</div>
        <div style={{ margin: '16px 20px 0' }}>
          <ProgressBar
            percent={71.6}
            style={{ '--fill-color': GOLD, '--track-color': 'rgba(255,255,255,0.2)', '--track-width': '10px' } as any}
          />
        </div>
        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>距離 Platinum 白金還需 1,420 印花</div>
      </div>

      {/* Tier List */}
      <div style={{ padding: 16 }}>
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            style={{
              marginBottom: 12,
              border: tier.current ? `2px solid ${GOLD}` : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 28 }}>{tier.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {tier.name}
                  {tier.current && <Tag color="warning" fill="solid" style={{ fontSize: 10 }}>當前等級</Tag>}
                </div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                  {tier.stamps === 0 ? '註冊即可' : `累計 ${tier.stamps.toLocaleString()} 印花`}
                </div>
              </div>
            </div>
            <List style={{ '--border-top': '1px solid #f0f0f0', '--border-bottom': 'none', '--padding-left': '0' } as any}>
              {tier.benefits.map((b, i) => (
                <List.Item key={i} prefix={<CheckCircleFill color={tier.current ? PRIMARY : '#ccc'} fontSize={14} />} style={{ fontSize: 13, padding: '4px 0' }}>
                  {b}
                </List.Item>
              ))}
            </List>
          </Card>
        ))}
      </div>
    </div>
  );
}
