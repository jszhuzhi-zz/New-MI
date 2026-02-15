import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, Grid, Card, Tag, PullToRefresh, Toast } from 'antd-mobile';
import { RightOutline, ScanCodeOutline } from 'antd-mobile-icons';
import { useAuthStore } from '../../store/auth';
import { getMallById, getMerchantsByMall } from '../../data/malls';
import MallSelector from '../../components/MallSelector';

const PRIMARY = '#00694B';
const GOLD = '#C4A962';

const banners = [
  { id: 1, title: '新春印花三倍賞', sub: '農曆新年期間消費可獲三倍印花', bg: PRIMARY },
  { id: 2, title: '全新會員專屬優惠', sub: '註冊即送200印花', bg: '#1976D2' },
  { id: 3, title: '聖誕購物節', sub: '消費滿HK$500送精美禮品', bg: '#C62828' },
];

const quickActions = [
  { icon: <ScanCodeOutline fontSize={24} />, label: '掃碼', path: '/scan' },
  { icon: '🎟️', label: '優惠券', path: '/offers' },
  { icon: '🏬', label: '商場', path: '/mall' },
  { icon: '🎁', label: '禮品', path: '/gifts' },
];

const campaigns = [
  { id: 'c1', title: '新春印花三倍賞', mall: '又一城', type: '印花加倍', date: '2/1 - 2/28', color: PRIMARY },
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

  return (
    <PullToRefresh onRefresh={async () => { Toast.show('已刷新'); }}>
      <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
        {/* Unified Header */}
        <div style={{
          background: `linear-gradient(180deg, ${PRIMARY} 0%, ${PRIMARY} 60%, #004D36 100%)`,
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
                <ScanCodeOutline fontSize={18} color="#fff" />
              </div>
              <div
                style={{
                  width: 32, height: 32, borderRadius: 16,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14,
                }}
              >
                🔔
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
                  <span style={{ fontSize: 28, fontWeight: 700, color: PRIMARY }}>{(user?.stampBalance || 2580).toLocaleString()}</span>
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
                    background: '#f5f5f5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 6px',
                    fontSize: 20,
                    color: PRIMARY,
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
            {banners.map((b) => (
              <Swiper.Item key={b.id}>
                <div
                  style={{
                    height: 120, borderRadius: 12, background: b.bg,
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
            <span style={{ fontSize: 12, color: PRIMARY, cursor: 'pointer' }} onClick={() => navigate('/offers')}>
              查看全部 <RightOutline fontSize={10} />
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {campaigns.map((c) => (
              <div
                key={c.id}
                onClick={() => navigate(`/campaign/${c.id}`)}
                style={{
                  minWidth: 160, background: '#fff', borderRadius: 10,
                  overflow: 'hidden', flexShrink: 0, cursor: 'pointer',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}
              >
                <div style={{ height: 80, background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 600, padding: '0 10px', textAlign: 'center' }}>
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
