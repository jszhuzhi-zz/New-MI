import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, Card, Tag, PullToRefresh, Toast, Image } from 'antd-mobile';
import { RightOutline } from 'antd-mobile-icons';
import { useAuthStore } from '../../store/auth';
import { useSettingsStore, type Locale } from '../../store/settings';
import { getMallById } from '../../data/malls';
import MallSelector from '../../components/MallSelector';
import { useTranslation } from '../../locales';

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

const CarIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M19 17h1c.6 0 1-.4 1-1v-3c0-.6-.4-1-1-1h-1l-3-5c-.3-.6-1-1-1.6-1H8.6c-.6 0-1.3.4-1.6 1l-3 5H3c-.6 0-1 .4-1 1v3c0 .6.4 1 1 1h1" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="7" cy="17" r="2" stroke={color} strokeWidth="2"/>
    <circle cx="17" cy="17" r="2" stroke={color} strokeWidth="2"/>
    <path d="M5 12l2-4h10l2 4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const BellIcon = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M18 8A6 6 0 106 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface BannerData {
  id: number;
  title: Record<Locale, string>;
  sub: Record<Locale, string>;
  image: string;
  link: string;
}

interface CampaignData {
  id: string;
  title: Record<Locale, string>;
  mall: Record<Locale, string>;
  type: Record<Locale, string>;
  date: string;
  image: string;
}

interface NewsData {
  id: string;
  title: Record<Locale, string>;
  date: string;
  image: string;
}

const bannersData: BannerData[] = [
  {
    id: 1,
    title: { 'zh-TW': '新春印花三倍賞', 'zh-CN': '新春印花三倍赏', en: 'Triple Stamps for CNY' },
    sub: { 'zh-TW': '農曆新年期間消費可獲三倍印花', 'zh-CN': '农历新年期间消费可获三倍印花', en: 'Earn triple stamps during Chinese New Year' },
    image: 'https://images.unsplash.com/photo-1549451371-64aa98a6f660?w=800&q=80',
    link: '/campaign/c1'
  },
  {
    id: 2,
    title: { 'zh-TW': '春日美食節', 'zh-CN': '春日美食节', en: 'Spring Food Festival' },
    sub: { 'zh-TW': '指定餐廳消費享額外印花及折扣', 'zh-CN': '指定餐厅消费享额外印花及折扣', en: 'Earn extra stamps at selected restaurants' },
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    link: '/campaign/c2'
  },
  {
    id: 3,
    title: { 'zh-TW': '會員生日禮遇', 'zh-CN': '会员生日礼遇', en: 'Birthday Rewards' },
    sub: { 'zh-TW': '生日月份專屬雙倍印花及神秘禮物', 'zh-CN': '生日月份专属双倍印花及神秘礼物', en: 'Enjoy double stamps and mystery gifts' },
    image: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=800&q=80',
    link: '/campaign/c3'
  },
];

const campaignsData: CampaignData[] = [
  {
    id: 'c1',
    title: { 'zh-TW': '新春印花三倍賞', 'zh-CN': '新春印花三倍赏', en: 'CNY Triple Stamps' },
    mall: { 'zh-TW': '又一城', 'zh-CN': '又一城', en: 'Festival Walk' },
    type: { 'zh-TW': '印花加倍', 'zh-CN': '印花加倍', en: 'Stamp Bonus' },
    date: '2/1 - 2/28',
    image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400&q=80'
  },
  {
    id: 'c2',
    title: { 'zh-TW': '新年幸運大抽獎', 'zh-CN': '新年幸运大抽奖', en: 'New Year Lucky Draw' },
    mall: { 'zh-TW': '荷里活廣場', 'zh-CN': '荷里活广场', en: 'Hollywood Plaza' },
    type: { 'zh-TW': '抽獎', 'zh-CN': '抽奖', en: 'Lucky Draw' },
    date: '1/15 - 3/15',
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&q=80'
  },
  {
    id: 'c3',
    title: { 'zh-TW': '冬日禮品換購', 'zh-CN': '冬日礼品换购', en: 'Winter Gift Redemption' },
    mall: { 'zh-TW': '大埔超級城', 'zh-CN': '大埔超级城', en: 'Tai Po Mega Mall' },
    type: { 'zh-TW': '禮品兌換', 'zh-CN': '礼品兑换', en: 'Gift Redemption' },
    date: '1/1 - 2/28',
    image: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=400&q=80'
  },
  {
    id: 'c4',
    title: { 'zh-TW': '美食節', 'zh-CN': '美食节', en: 'Food Festival' },
    mall: { 'zh-TW': '屯門市廣場', 'zh-CN': '屯门市广场', en: 'Tuen Mun Town Plaza' },
    type: { 'zh-TW': '美食優惠', 'zh-CN': '美食优惠', en: 'Food Deals' },
    date: '2/1 - 2/14',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80'
  },
];

const newsData: NewsData[] = [
  {
    id: 'n1',
    title: { 'zh-TW': '領展商場推出全新環保倡議', 'zh-CN': '领展商场推出全新环保倡议', en: 'Link REIT Launches New Green Initiative' },
    date: '2026-02-15',
    image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&q=80'
  },
  {
    id: 'n2',
    title: { 'zh-TW': '全新餐飲品牌進駐屯門市廣場', 'zh-CN': '全新餐饮品牌进驻屯门市广场', en: 'New F&B Brands Open at Tuen Mun Town Plaza' },
    date: '2026-02-10',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80'
  },
  {
    id: 'n3',
    title: { 'zh-TW': '春季時裝展即將開幕', 'zh-CN': '春季时装展即将开幕', en: 'Spring Fashion Show Coming Soon' },
    date: '2026-02-08',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80'
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { t, locale } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const currentMallId = useAuthStore((s) => s.currentMallId);
  const currentMall = getMallById(currentMallId);
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();

  const banners = useMemo(() => bannersData.map(b => ({
    ...b,
    title: b.title[locale],
    sub: b.sub[locale],
    link: b.link,
  })), [locale]);

  const campaigns = useMemo(() => campaignsData.map(c => ({
    ...c,
    title: c.title[locale],
    mall: c.mall[locale],
    type: c.type[locale],
  })), [locale]);

  const news = useMemo(() => newsData.map(n => ({
    ...n,
    title: n.title[locale],
  })), [locale]);

  const goldTierLabel = { 'zh-TW': 'Gold 金卡', 'zh-CN': 'Gold 金卡', en: 'Gold Member' }[locale];
  const guestLabel = { 'zh-TW': '訪客', 'zh-CN': '访客', en: 'Guest' }[locale];
  const loginHint = { 'zh-TW': '登入查看印花', 'zh-CN': '登录查看印花', en: 'Login to view stamps' }[locale];
  const loginButton = { 'zh-TW': '登入 / 註冊', 'zh-CN': '登录 / 注册', en: 'Login / Register' }[locale];

  const quickActions = [
    { icon: <MallIcon color={colors.primary} />, label: t('home.mall'), path: '/mall' },
    { icon: <CouponIcon color={colors.primary} />, label: t('home.coupons'), path: '/offers' },
    { icon: <GiftIcon color={colors.primary} />, label: t('home.gifts'), path: '/gifts' },
    { icon: <CarIcon color={colors.primary} />, label: t('parking.title'), path: '/parking' },
  ];

  return (
    <PullToRefresh onRefresh={async () => { Toast.show(t('common.success')); }}>
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
                onClick={() => navigate('/messages')}
                style={{
                  width: 32, height: 32, borderRadius: 16,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
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
            onClick={() => isAuthenticated ? navigate('/stamp') : navigate('/login')}
            style={{
              background: '#fff',
              borderRadius: 16, padding: 16,
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              cursor: 'pointer',
            }}
          >
            {isAuthenticated ? (
              // Logged in member view
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 13, color: '#666' }}>{t('home.hello')}，{user?.name || t('home.member')}</div>
                  <div style={{
                    display: 'inline-block',
                    background: GOLD,
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: 11,
                    marginTop: 4,
                  }}>
                    {user?.tier === 'gold' ? goldTierLabel : (user?.tierName || goldTierLabel)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: '#999' }}>{t('home.availableStamps')}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: 28, fontWeight: 700, color: colors.primary }}>{(user?.stampBalance || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              // Guest view - prompt to login
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, color: '#666' }}>{t('home.hello')}，{guestLabel}</div>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{loginHint}</div>
                </div>
                <div
                  onClick={(e) => { e.stopPropagation(); navigate('/login'); }}
                  style={{
                    background: colors.primary,
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  {loginButton}
                </div>
              </div>
            )}
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

        {/* Banners with Images */}
        <div style={{ padding: '16px 16px 0' }}>
          <Swiper autoplay autoplayInterval={3500} loop style={{ '--border-radius': '12px' } as any}>
            {banners.map((b) => (
              <Swiper.Item key={b.id}>
                <div
                  onClick={() => navigate(b.link)}
                  style={{
                    height: 160, borderRadius: 12,
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                >
                  <Image
                    src={b.image}
                    fit="cover"
                    style={{ width: '100%', height: '100%' }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                    padding: '30px 16px 16px',
                    color: '#fff',
                  }}>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{b.title}</div>
                    <div style={{ fontSize: 12, opacity: 0.9, marginTop: 4 }}>{b.sub}</div>
                  </div>
                </div>
              </Swiper.Item>
            ))}
          </Swiper>
        </div>

        {/* Campaigns with Images */}
        <div style={{ padding: '16px 16px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 16, fontWeight: 600 }}>{t('home.hotEvents')}</span>
            <span style={{ fontSize: 12, color: colors.primary, cursor: 'pointer' }} onClick={() => navigate('/offers')}>
              {t('common.viewAll')} <RightOutline fontSize={10} />
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
                <Image
                  src={c.image}
                  fit="cover"
                  style={{ width: '100%', height: 100 }}
                />
                <div style={{ padding: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, lineHeight: 1.3 }}>{c.title}</div>
                  <Tag color="primary" fill="outline" style={{ '--border-radius': '4px', fontSize: 10 } as any}>
                    {c.type}
                  </Tag>
                  <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>{c.mall} · {c.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* News with Images */}
        <div style={{ padding: '16px' }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>{t('home.latestNews')}</div>
          {news.map((n) => (
            <Card
              key={n.id}
              onClick={() => navigate(`/news/${n.id}`)}
              style={{ marginBottom: 10, borderRadius: 10, padding: 0, overflow: 'hidden', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', gap: 12, position: 'relative' }}>
                <Image
                  src={n.image}
                  fit="cover"
                  style={{ width: 100, height: 80, borderRadius: '10px 0 0 10px' }}
                />
                <div style={{ flex: 1, padding: '10px 30px 10px 0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}>{n.title}</div>
                  <div style={{ fontSize: 11, color: '#999', marginTop: 6 }}>{n.date}</div>
                </div>
                <RightOutline style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#ccc' }} />
              </div>
            </Card>
          ))}
        </div>

        <div style={{ height: 16 }} />
      </div>
    </PullToRefresh>
  );
}
