import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar, Card, List, ProgressBar, Steps } from 'antd-mobile';
import { CheckCircleFill } from 'antd-mobile-icons';

const PRIMARY = '#00694B';
const GOLD = '#C4A962';

interface TierInfo {
  name: string;
  nameEn: string;
  icon: string;
  requiredStamps: number;
  color: string;
  benefits: string[];
}

const tiers: TierInfo[] = [
  {
    name: '標準', nameEn: 'Standard', icon: '🥉', requiredStamps: 0, color: '#9E9E9E',
    benefits: ['基本印花獲取（每HK$10 = 1印花）', '生日月份印花獎賞', '電子優惠券'],
  },
  {
    name: '銀卡', nameEn: 'Silver', icon: '🥈', requiredStamps: 500, color: '#78909C',
    benefits: ['印花獲取 1.2 倍', '生日月份雙倍印花', '優先參加活動', '每月免費泊車1次'],
  },
  {
    name: '金卡', nameEn: 'Gold', icon: '🥇', requiredStamps: 2000, color: GOLD,
    benefits: ['印花獲取 1.5 倍', '生日月份三倍印花', '專屬活動邀請', '每月免費泊車2次', '季度禮品贈送'],
  },
  {
    name: '白金', nameEn: 'Platinum', icon: '💎', requiredStamps: 4000, color: '#5C6BC0',
    benefits: ['印花獲取 2 倍', '生日月份三倍印花', 'VIP專屬活動', '每月免費泊車4次', '季度禮品贈送', '專屬客服通道'],
  },
  {
    name: '鑽石', nameEn: 'Diamond', icon: '👑', requiredStamps: 8000, color: '#AB47BC',
    benefits: ['印花獲取 3 倍', '全年生日禮遇', '至尊VIP活動', '無限免費泊車', '每月精選禮品', '專屬客服經理', '貴賓室使用權'],
  },
];

const currentTierIndex = 2; // Gold

export default function TierPage() {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <NavBar onBack={() => navigate(-1)} style={{ background: '#fff' }}>我的等級</NavBar>

      {/* Current Tier */}
      <div
        style={{
          background: `linear-gradient(135deg, ${PRIMARY}, #004D36)`,
          padding: '24px 20px 32px',
          color: '#fff',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 48 }}>{tiers[currentTierIndex].icon}</div>
        <div style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>
          {tiers[currentTierIndex].nameEn} {tiers[currentTierIndex].name}
        </div>
        <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>當前會員等級</div>

        {/* Progress to next */}
        <div
          style={{
            background: 'rgba(255,255,255,0.12)',
            borderRadius: 12,
            padding: '14px 16px',
            marginTop: 20,
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
            <span>{tiers[currentTierIndex].icon} {tiers[currentTierIndex].name}</span>
            <span>{tiers[currentTierIndex + 1].icon} {tiers[currentTierIndex + 1].name}</span>
          </div>
          <ProgressBar
            percent={64.5}
            style={{
              '--fill-color': GOLD,
              '--track-color': 'rgba(255,255,255,0.2)',
              '--track-width': '8px',
            } as React.CSSProperties}
          />
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8, textAlign: 'center' }}>
            累計印花 2,580 / 4,000 · 距離升級還需 <span style={{ color: GOLD, fontWeight: 700 }}>1,420</span> 印花
          </div>
        </div>
      </div>

      {/* All Tiers */}
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#333', marginBottom: 12 }}>全部等級</div>
        {tiers.map((tier, i) => {
          const isCurrent = i === currentTierIndex;
          const isAchieved = i <= currentTierIndex;
          return (
            <Card
              key={tier.nameEn}
              style={{
                marginBottom: 12,
                borderRadius: 12,
                border: isCurrent ? `2px solid ${GOLD}` : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 32 }}>{tier.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 17, fontWeight: 700, color: '#333' }}>
                      {tier.nameEn} {tier.name}
                    </span>
                    {isCurrent && (
                      <span
                        style={{
                          background: GOLD,
                          color: '#fff',
                          padding: '1px 8px',
                          borderRadius: 8,
                          fontSize: 11,
                        }}
                      >
                        目前等級
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                    {tier.requiredStamps === 0 ? '基礎等級' : `需累計 ${tier.requiredStamps.toLocaleString()} 印花`}
                  </div>
                </div>
                {isAchieved && <CheckCircleFill style={{ color: PRIMARY, fontSize: 20 }} />}
              </div>

              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#666', marginBottom: 6 }}>會員權益</div>
                {tier.benefits.map((benefit, j) => (
                  <div
                    key={j}
                    style={{
                      fontSize: 13,
                      color: '#666',
                      marginBottom: 4,
                      display: 'flex',
                      gap: 6,
                      alignItems: 'flex-start',
                    }}
                  >
                    <span style={{ color: isAchieved ? PRIMARY : '#ccc' }}>✓</span>
                    <span style={{ color: isAchieved ? '#333' : '#999' }}>{benefit}</span>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
