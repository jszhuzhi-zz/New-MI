import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, Card, Tag, PullToRefresh, Toast } from 'antd-mobile';
import { RightOutline } from 'antd-mobile-icons';
import { useAuthStore } from '../../store/auth';
import { useSettingsStore } from '../../store/settings';
import { getMallById } from '../../data/malls';
import MallSelector from '../../components/MallSelector';

const GOLD = '#C4A962';

// Custom SVG Icons
const ScanIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="7" y="7" width="10" height="10" rx="1" stroke={color} strokeWidth="2"/>
  </svg>
);

const CouponIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6M20 12V6a2 2 0 00-2-2H6a2 2 0 00-2 2v6M20 12a2 2 0 10-4 0 2 2 0 004 0zM8 12a2 2 0 10-4 0 2 2 0 004 0z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 8h6M9 16h6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const MallIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M3 21h18M5 21V7l7-4 7 4v14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 21v-6h6v6M9 10h.01M15 10h.01M9 14h.01M15 14h.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const GiftIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M20 12v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8M22 8v4H2V8a2 2 0 012-2h16a2 2 0 012 2zM12 22V6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 6a3 3 0 00-3-3c-1.5 0-3 1.5-3 3h6zM12 6a3 3 0 013-3c1.5 0 3 1.5 3 3h-6z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BellIcon = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M18 8A6 6 0 106 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const banners = [
  { id: 1, title: '新春印花三倍賞', sub: '農曆新年期間消費可獲三倍印花', bg: '#00694B' },
  { id: 2, title: '全新會員專屬優惠', sub: '註冊即送200印花', bg: '#1976D2' },
  { id: 3, title: '聖誕購物節', sub: '消費滿HK$500送精美禮品', bg: '#C62828' },
];

const campaigns = [
  { id: 'c1', title: '新春印花三倍賞', mall: '又一城', type: '印花加倍', date: '2/1 - 2/28', color: '#00694B' },
  { id: 'c2', title: '新年幸運大抽獎', mall: '荷里活廣場', type: '抽獎', date: '1/15 - 3/15', color: GOLD },
  { id: 'c3', title: '冬日禮品換購', mall: '大埔超級城', type: '禮品兌換', date: '1/1 - 2/28', color: '#7B1FA2' },
];

const news = [
  { id: 'n1', title: '領展商場推出全新環保倡議', date: '2024-01-25' },
  { id: 'n2', title: '全新餐飲品牌進駐屯門市廣場', date: '2024-01-20' },
];

export default function Home() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const currentMallId = useAuthStore((s) => s.currentMallId);
  const currentMall = getMallById(currentMallId);
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();

  const quickActions = [
    { icon: <ScanIcon color={colors.primary} />, label: '掃碼', path: '/scan' },
    { icon: <CouponIcon color={colors.primary} />, label: '優惠券', path: '/offers' },
    { icon: <MallIcon color={colors.primary} />, label: '商場', path: '/mall' },
    { icon: <GiftIcon color={colors.primary} />, label: '禮品', path: '/gifts' },
  ];

  return (
    <PullToRefresh onRefresh={async () => { Toast.show('已刷新'); }}>
      <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
        {/* Unified Header */}
        <div style={{
          background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.primary} 60%, ${colors.primaryDark} 100%)`,
          padding: '12px 16px 80px',
        }}>
          {/* Top Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <MallSelector style={{ color: '#fff' }} />
            <div style={{ display: 'flex', gap: 12 }}>
              <div
                onClick={() => navigate('/scan')}
                style={{
                  width: 32, height: 32, borderRadius: 16,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <ScanIcon color="#fff" />
              </div>
              <div
                style={{
                  width: 32, height: 32, borderRadius: 16,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <BellIcon color="#fff" />
              </div>
            </div>
          </div>
        </div>

        {/* Member Card - Floating */}
        <div style={{ margin: '-64px 16px 0', position: 'relative', zIndex: 1 }}>
          <div
            onClick={() => navigate('/stamp')}
            style={{
              background: '#fff',
              borderRadius: 16, padding: 16,
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 13, color: '#666' }}>你好，{user?.name || '會員'}</div>
                <div style={{
                  display: 'inline-block',
                  background: GOLD,
                  color: '#fff',
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: 11,
                  marginTop: 4,
                }}>
                  Gold 金卡
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: '#999' }}>可用印花</div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: 28, fontWeight: 700, color: colors.primary }}>{(user?.stampBalance || 2580).toLocaleString()}</span>
                </div>
              </div>
            </div>
            {/* Quick Actions in Card */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              marginTop: 16,
              paddingTop: 12,
              borderTop: '1px solid #f0f0f0',
            }}>
              {quickActions.map((a) => (
                <div
                  key={a.label}
                  onClick={(e) => { e.stopPropagation(); navigate(a.path); }}
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 22,
                    background: `${colors.primary}10`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 6px',
                  }}>
                    {a.icon}
                  </div>
                  <div style={{ fontSize: 11, color: '#666' }}>{a.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Banners */}
        <div style={{ padding: '16px 16px 0' }}>
          <Swiper autoplay autoplayInterval={3500} loop style={{ '--border-radius': '12px' } as any}>
            {banners.map((b, idx) => (
              <Swiper.Item key={b.id}>
                <div
                  style={{
                    height: 120, borderRadius: 12,
                    background: idx === 0 ? colors.primary : b.bg,
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    padding: '0 20px', color: '#fff',
                  }}
                >
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{b.title}</div>
                  <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>{b.sub}</div>
                </div>
              </Swiper.Item>
            ))}
          </Swiper>
        </div>

        {/* Campaigns */}
        <div style={{ padding: '16px 16px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 16, fontWeight: 600 }}>熱門活動</span>
            <span style={{ fontSize: 12, color: colors.primary, cursor: 'pointer' }} onClick={() => navigate('/offers')}>
              查看全部 <RightOutline fontSize={10} />
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {campaigns.map((c, idx) => (
              <div
                key={c.id}
                onClick={() => navigate(`/campaign/${c.id}`)}
                style={{
                  minWidth: 160, background: '#fff', borderRadius: 10,
                  overflow: 'hidden', flexShrink: 0, cursor: 'pointer',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}
              >
                <div style={{
                  height: 80,
                  background: idx === 0 ? colors.primary : c.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 14, fontWeight: 600,
                  padding: '0 10px', textAlign: 'center'
                }}>
                  {c.title}
                </div>
                <div style={{ padding: 10 }}>
                  <Tag color="primary" fill="outline" style={{ '--border-radius': '4px', fontSize: 10 } as any}>
                    {c.type}
                  </Tag>
                  <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>{c.mall} · {c.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* News */}
        <div style={{ padding: '16px' }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>最新消息</div>
          {news.map((n) => (
            <Card key={n.id} style={{ marginBottom: 8, borderRadius: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{n.title}</div>
              <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>{n.date}</div>
            </Card>
          ))}
        </div>

        <div style={{ height: 16 }} />
      </div>
    </PullToRefresh>
  );
}
