import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, Grid, Card, Tag, PullToRefresh, Toast } from 'antd-mobile';
import { RightOutline } from 'antd-mobile-icons';
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
  { icon: '📷', label: '掃碼換印花', path: '/scan' },
  { icon: '🎟️', label: '我的優惠券', path: '/offers' },
  { icon: '🏬', label: '商場導覽', path: '/mall' },
  { icon: '🎁', label: '印花商城', path: '/offers' },
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
  const mallMerchants = getMerchantsByMall(currentMallId);

  return (
    <PullToRefresh onRefresh={async () => { Toast.show('已刷新'); }}>
      <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ background: PRIMARY, padding: '12px 16px 24px', color: '#fff' }}>
          {/* Mall Selector Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <MallSelector style={{ color: '#fff' }} />
            <div
              style={{
                width: 36, height: 36, borderRadius: 18,
                background: 'rgba(255,255,255,0.15)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 18,
              }}
            >
              🔔
            </div>
          </div>
          {/* User Greeting */}
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>你好，{user?.name || '會員'}</div>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>
              Gold 金卡會員 · {currentMall?.nameTW} ({mallMerchants.length} 商戶)
            </div>
          </div>
        </div>

        {/* Member Card */}
        <div style={{ margin: '-12px 16px 0', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              background: `linear-gradient(135deg, ${PRIMARY} 0%, #004D36 100%)`,
              borderRadius: 16, padding: 20, color: '#fff',
              boxShadow: '0 4px 12px rgba(0,105,75,0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>Link Mall 會員卡</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4, letterSpacing: 1 }}>
                  {user?.cardNo || 'LM-2024-0088'}
                </div>
              </div>
              <div
                style={{
                  width: 56, height: 56, borderRadius: 8, background: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: PRIMARY, fontSize: 10, fontWeight: 700,
                }}
              >
                QR Code
              </div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'baseline' }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: GOLD }}>2,580</span>
              <span style={{ fontSize: 14, marginLeft: 6, opacity: 0.8 }}>印花</span>
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
                    height: 140, borderRadius: 12, background: b.bg,
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    padding: '0 24px', color: '#fff',
                  }}
                >
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{b.title}</div>
                  <div style={{ fontSize: 13, opacity: 0.85, marginTop: 6 }}>{b.sub}</div>
                </div>
              </Swiper.Item>
            ))}
          </Swiper>
        </div>

        {/* Quick Actions */}
        <div style={{ padding: '16px', }}>
          <div
            style={{
              background: '#fff', borderRadius: 12, padding: '16px 8px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}
          >
            <Grid columns={4} gap={8}>
              {quickActions.map((a) => (
                <Grid.Item key={a.label} onClick={() => navigate(a.path)}>
                  <div style={{ textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>{a.icon}</div>
                    <div style={{ fontSize: 12, color: '#333' }}>{a.label}</div>
                  </div>
                </Grid.Item>
              ))}
            </Grid>
          </div>
        </div>

        {/* Campaigns */}
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 18, fontWeight: 700 }}>熱門活動</span>
            <span style={{ fontSize: 13, color: PRIMARY, cursor: 'pointer' }} onClick={() => navigate('/offers')}>
              查看全部 <RightOutline />
            </span>
          </div>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
            {campaigns.map((c) => (
              <div
                key={c.id}
                onClick={() => navigate(`/campaign/${c.id}`)}
                style={{
                  minWidth: 200, background: '#fff', borderRadius: 12,
                  overflow: 'hidden', flexShrink: 0, cursor: 'pointer',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}
              >
                <div style={{ height: 100, background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 600, padding: '0 12px', textAlign: 'center' }}>
                  {c.title}
                </div>
                <div style={{ padding: 12 }}>
                  <Tag color="primary" fill="outline" style={{ '--border-radius': '4px', fontSize: 11 } as any}>
                    {c.type}
                  </Tag>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 6 }}>{c.mall} · {c.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* News */}
        <div style={{ padding: '16px' }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>最新消息</div>
          {news.map((n) => (
            <Card key={n.id} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{n.title}</div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{n.date}</div>
            </Card>
          ))}
        </div>

        <div style={{ height: 16 }} />
      </div>
    </PullToRefresh>
  );
}
