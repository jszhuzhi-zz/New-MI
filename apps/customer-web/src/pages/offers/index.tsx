import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, Card, Grid, Tag, Badge, Button } from 'antd-mobile';
import { RightOutline } from 'antd-mobile-icons';
import { useTranslation } from '../../locales';
import { useSettingsStore, type Locale } from '../../store/settings';
import { useAuthStore } from '../../store/auth';

const GOLD = '#C4A962';

interface CampaignData {
  id: string;
  title: Record<Locale, string>;
  mall: Record<Locale, string>;
  date: Record<Locale, string>;
  type: Record<Locale, string>;
  color: string;
  desc: Record<Locale, string>;
}

interface CouponData {
  id: string;
  title: Record<Locale, string>;
  merchant: Record<Locale, string>;
  expire: string;
  status: 'unused' | 'used' | 'expired';
}

interface LuckyDrawData {
  id: string;
  title: Record<Locale, string>;
  prize: Record<Locale, string>;
  endDate: string;
  stampCost: number;
  color: string;
}

interface GiftData {
  id: string;
  title: Record<Locale, string>;
  stamps: number;
  stock: boolean;
  color: string;
}

const campaignsData: CampaignData[] = [
  {
    id: 'c1',
    title: { 'zh-TW': '新春印花三倍賞', 'zh-CN': '新春印花三倍赏', en: 'Triple Stamps for CNY' },
    mall: { 'zh-TW': '又一城 Festival Walk', 'zh-CN': '又一城 Festival Walk', en: 'Festival Walk' },
    date: { 'zh-TW': '2026.01.15 - 2026.02.28', 'zh-CN': '2026.01.15 - 2026.02.28', en: 'Jan 15 - Feb 28, 2026' },
    type: { 'zh-TW': '印花加倍', 'zh-CN': '印花加倍', en: 'Stamp Multiplier' },
    color: '#C62828',
    desc: { 'zh-TW': '農曆新年期間所有消費可獲三倍印花獎賞', 'zh-CN': '农历新年期间所有消费可获三倍印花奖赏', en: 'Earn triple stamps on all purchases during Chinese New Year' },
  },
  {
    id: 'c5',
    title: { 'zh-TW': '荷里活廣場春季購物祭', 'zh-CN': '荷里活广场春季购物祭', en: 'Plaza Hollywood Spring Shopping' },
    mall: { 'zh-TW': '荷里活廣場', 'zh-CN': '荷里活广场', en: 'Plaza Hollywood' },
    date: { 'zh-TW': '2026.02.15 - 2026.03.31', 'zh-CN': '2026.02.15 - 2026.03.31', en: 'Feb 15 - Mar 31, 2026' },
    type: { 'zh-TW': '購物優惠', 'zh-CN': '购物优惠', en: 'Shopping Offers' },
    color: '#1565C0',
    desc: { 'zh-TW': '春季購物消費滿額送電子禮券', 'zh-CN': '春季购物消费满额送电子礼券', en: 'Spend and earn e-vouchers during spring shopping' },
  },
  {
    id: 'c6',
    title: { 'zh-TW': '屯門市廣場美食嘉年華', 'zh-CN': '屯门市广场美食嘉年华', en: 'Tuen Mun Food Carnival' },
    mall: { 'zh-TW': '屯門市廣場', 'zh-CN': '屯门市广场', en: 'Tuen Mun Town Plaza' },
    date: { 'zh-TW': '2026.02.01 - 2026.02.28', 'zh-CN': '2026.02.01 - 2026.02.28', en: 'Feb 1 - Feb 28, 2026' },
    type: { 'zh-TW': '美食活動', 'zh-CN': '美食活动', en: 'Food Event' },
    color: '#FF6F00',
    desc: { 'zh-TW': '精選餐廳限定美食及會員專屬優惠', 'zh-CN': '精选餐厅限定美食及会员专属优惠', en: 'Exclusive dishes and member-only offers' },
  },
  {
    id: 'c7',
    title: { 'zh-TW': '大埔超級城親子樂園', 'zh-CN': '大埔超级城亲子乐园', en: 'Tai Po Family Fun' },
    mall: { 'zh-TW': '大埔超級城', 'zh-CN': '大埔超级城', en: 'Tai Po Mega Mall' },
    date: { 'zh-TW': '2026.02.10 - 2026.03.15', 'zh-CN': '2026.02.10 - 2026.03.15', en: 'Feb 10 - Mar 15, 2026' },
    type: { 'zh-TW': '親子活動', 'zh-CN': '亲子活动', en: 'Family Event' },
    color: '#43A047',
    desc: { 'zh-TW': '親子消費享三倍印花及免費工作坊', 'zh-CN': '亲子消费享三倍印花及免费工作坊', en: 'Triple stamps plus free workshops' },
  },
  {
    id: 'c8',
    title: { 'zh-TW': '樂富廣場週年慶', 'zh-CN': '乐富广场周年庆', en: 'Lok Fu Anniversary' },
    mall: { 'zh-TW': '樂富廣場', 'zh-CN': '乐富广场', en: 'Lok Fu Place' },
    date: { 'zh-TW': '2026.03.01 - 2026.03.31', 'zh-CN': '2026.03.01 - 2026.03.31', en: 'Mar 1 - Mar 31, 2026' },
    type: { 'zh-TW': '週年慶', 'zh-CN': '周年庆', en: 'Anniversary' },
    color: '#8E24AA',
    desc: { 'zh-TW': '週年慶期間消費可參加幸運大抽獎', 'zh-CN': '周年庆期间消费可参加幸运大抽奖', en: 'Join lucky draw during anniversary' },
  },
  {
    id: 'c9',
    title: { 'zh-TW': '將軍澳廣場電子產品展', 'zh-CN': '将军澳广场电子产品展', en: 'TKO Tech Expo' },
    mall: { 'zh-TW': '將軍澳廣場', 'zh-CN': '将军澳广场', en: 'TKO Gateway' },
    date: { 'zh-TW': '2026.02.20 - 2026.03.10', 'zh-CN': '2026.02.20 - 2026.03.10', en: 'Feb 20 - Mar 10, 2026' },
    type: { 'zh-TW': '科技展覽', 'zh-CN': '科技展览', en: 'Tech Expo' },
    color: '#00897B',
    desc: { 'zh-TW': '電子產品優惠及會員專屬折扣', 'zh-CN': '电子产品优惠及会员专属折扣', en: 'Tech deals and member discounts' },
  },
  {
    id: 'c3',
    title: { 'zh-TW': '會員專屬生日禮遇', 'zh-CN': '会员专属生日礼遇', en: 'Member Birthday Rewards' },
    mall: { 'zh-TW': '全線商場', 'zh-CN': '全线商场', en: 'All Malls' },
    date: { 'zh-TW': '全年適用', 'zh-CN': '全年适用', en: 'Year-round' },
    type: { 'zh-TW': '會員專屬', 'zh-CN': '会员专属', en: 'Member Exclusive' },
    color: '#00694B',
    desc: { 'zh-TW': '生日月份享雙倍印花及神秘禮品', 'zh-CN': '生日月份享双倍印花及神秘礼品', en: 'Double stamps and mystery gifts' },
  },
  {
    id: 'c10',
    title: { 'zh-TW': '晚間免費泊車優惠', 'zh-CN': '晚间免费泊车优惠', en: 'Evening Free Parking' },
    mall: { 'zh-TW': '又一城', 'zh-CN': '又一城', en: 'Festival Walk' },
    date: { 'zh-TW': '長期優惠', 'zh-CN': '长期优惠', en: 'Ongoing' },
    type: { 'zh-TW': '泊車優惠', 'zh-CN': '泊车优惠', en: 'Parking' },
    color: '#546E7A',
    desc: { 'zh-TW': '晚上7時後消費滿HK$100享免費泊車', 'zh-CN': '晚上7时后消费满HK$100享免费泊车', en: 'Free parking after 7pm with HK$100 spend' },
  },
];

const couponsData: CouponData[] = [
  { id: 'cp1', title: { 'zh-TW': '星巴克 HK$50 現金券', 'zh-CN': '星巴克 HK$50 现金券', en: 'Starbucks HK$50 Voucher' }, merchant: { 'zh-TW': 'Starbucks', 'zh-CN': 'Starbucks', en: 'Starbucks' }, expire: '2026-03-31', status: 'unused' },
  { id: 'cp2', title: { 'zh-TW': '免費泊車 3 小時', 'zh-CN': '免费泊车 3 小时', en: '3 Hours Free Parking' }, merchant: { 'zh-TW': '又一城停車場', 'zh-CN': '又一城停车场', en: 'Festival Walk Parking' }, expire: '2026-02-28', status: 'unused' },
  { id: 'cp3', title: { 'zh-TW': 'Pacific Coffee 買一送一', 'zh-CN': 'Pacific Coffee 买一送一', en: 'Pacific Coffee Buy 1 Get 1' }, merchant: { 'zh-TW': 'Pacific Coffee', 'zh-CN': 'Pacific Coffee', en: 'Pacific Coffee' }, expire: '2026-01-31', status: 'used' },
  { id: 'cp4', title: { 'zh-TW': 'UNIQLO 9折優惠券', 'zh-CN': 'UNIQLO 9折优惠券', en: 'UNIQLO 10% Off Coupon' }, merchant: { 'zh-TW': 'UNIQLO', 'zh-CN': 'UNIQLO', en: 'UNIQLO' }, expire: '2025-12-31', status: 'expired' },
];

const luckyDrawsData: LuckyDrawData[] = [
  { id: 'ld1', title: { 'zh-TW': '印花幸運轉盤', 'zh-CN': '印花幸运转盘', en: 'Stamp Lucky Wheel' }, prize: { 'zh-TW': '最高贏取HK$500現金券', 'zh-CN': '最高赢取HK$500现金券', en: 'Win up to HK$500 voucher' }, endDate: '2026-06-30', stampCost: 100, color: '#C62828' },
  { id: 'ld2', title: { 'zh-TW': '新春黃金大抽獎', 'zh-CN': '新春黄金大抽奖', en: 'Spring Golden Draw' }, prize: { 'zh-TW': '最高贏取Apple iPad Air', 'zh-CN': '最高赢取Apple iPad Air', en: 'Win up to Apple iPad Air' }, endDate: '2026-04-30', stampCost: 500, color: '#6A1B9A' },
  { id: 'ld3', title: { 'zh-TW': '週年慶鑽石抽獎', 'zh-CN': '周年庆钻石抽奖', en: 'Anniversary Diamond Draw' }, prize: { 'zh-TW': '最高贏取日本機票酒店', 'zh-CN': '最高赢取日本机票酒店', en: 'Win Japan trip + hotel' }, endDate: '2026-12-31', stampCost: 1000, color: '#00695C' },
];

const giftsData: GiftData[] = [
  { id: 'g1', title: { 'zh-TW': '領展環保購物袋', 'zh-CN': '领展环保购物袋', en: 'Link Eco Shopping Bag' }, stamps: 200, stock: true, color: '#00694B' },
  { id: 'g2', title: { 'zh-TW': '精選咖啡禮盒', 'zh-CN': '精选咖啡礼盒', en: 'Premium Coffee Gift Set' }, stamps: 500, stock: true, color: '#795548' },
  { id: 'g3', title: { 'zh-TW': '藍牙無線耳機', 'zh-CN': '蓝牙无线耳机', en: 'Bluetooth Wireless Earbuds' }, stamps: 1500, stock: true, color: '#1565C0' },
  { id: 'g4', title: { 'zh-TW': '日本和風餐具套裝', 'zh-CN': '日本和风餐具套装', en: 'Japanese Style Tableware Set' }, stamps: 800, stock: true, color: '#C62828' },
  { id: 'g5', title: { 'zh-TW': '便攜式充電寶', 'zh-CN': '便携式充电宝', en: 'Portable Power Bank' }, stamps: 1000, stock: false, color: '#616161' },
  { id: 'g6', title: { 'zh-TW': '限量版Link Mall公仔', 'zh-CN': '限量版Link Mall公仔', en: 'Limited Edition Link Mall Figurine' }, stamps: 2000, stock: true, color: GOLD },
];

export default function OffersPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { locale, getThemeColors } = useSettingsStore();
  const colors = getThemeColors();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [activeTab, setActiveTab] = useState('campaigns');

  // Multilingual labels for login prompt
  const loginLabels = {
    loginRequired: { 'zh-TW': '請先登入', 'zh-CN': '请先登录', en: 'Please Login First' },
    loginToCoupons: { 'zh-TW': '登入後可查看您的優惠券', 'zh-CN': '登录后可查看您的优惠券', en: 'Login to view your coupons' },
    loginToDraws: { 'zh-TW': '登入後可參與抽獎活動', 'zh-CN': '登录后可参与抽奖活动', en: 'Login to participate in lucky draws' },
    login: { 'zh-TW': '登入 / 註冊', 'zh-CN': '登录 / 注册', en: 'Login / Register' },
    noCoupons: { 'zh-TW': '暫無優惠券', 'zh-CN': '暂无优惠券', en: 'No coupons yet' },
  };

  // Derive locale-specific data
  const campaigns = useMemo(() => campaignsData.map(c => ({
    ...c,
    title: c.title[locale],
    mall: c.mall[locale],
    date: c.date[locale],
    type: c.type[locale],
    desc: c.desc[locale],
  })), [locale]);

  const coupons = useMemo(() => couponsData.map(cp => ({
    ...cp,
    title: cp.title[locale],
    merchant: cp.merchant[locale],
  })), [locale]);

  const luckyDraws = useMemo(() => luckyDrawsData.map(ld => ({
    ...ld,
    title: ld.title[locale],
    prize: ld.prize[locale],
  })), [locale]);

  const gifts = useMemo(() => giftsData.map(g => ({
    ...g,
    title: g.title[locale],
  })), [locale]);

  const statusMap = {
    unused: { text: t('offers.available'), color: 'success' as const },
    used: { text: t('offers.used'), color: 'default' as const },
    expired: { text: t('offers.expired'), color: 'default' as const },
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', paddingBottom: 60 }}>
      <div style={{ background: colors.primary, padding: '20px 16px 12px', color: '#fff' }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>{t('offers.title')}</div>
        <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>{t('offers.exploreOffers')}</div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        style={{
          '--active-line-color': colors.primary,
          '--active-title-color': colors.primary,
          background: '#fff',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        } as React.CSSProperties}
      >
        <Tabs.Tab title={t('offers.campaigns')} key="campaigns" />
        <Tabs.Tab title={t('offers.myCoupons')} key="coupons" />
        <Tabs.Tab title={t('offers.draws')} key="draws" />
        <Tabs.Tab title={t('offers.giftRedemption')} key="gifts" />
      </Tabs>

      <div style={{ padding: 16 }}>
        {activeTab === 'campaigns' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {campaigns.map((c) => (
              <Card key={c.id} style={{ borderRadius: 12, overflow: 'hidden' }} onClick={() => navigate(`/campaign/${c.id}`)}>
                <div
                  style={{
                    height: 120, background: `linear-gradient(135deg, ${c.color} 0%, ${c.color}BB 100%)`,
                    margin: '-12px -12px 12px', display: 'flex', flexDirection: 'column',
                    justifyContent: 'center', padding: '0 20px', color: '#fff',
                  }}
                >
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{c.title}</div>
                  <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>{c.desc}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Tag color="primary" fill="outline" style={{ '--border-color': colors.primary, '--text-color': colors.primary, fontSize: 11 } as React.CSSProperties}>{c.type}</Tag>
                    <span style={{ fontSize: 12, color: '#999', marginLeft: 8 }}>{c.mall}</span>
                  </div>
                  <span style={{ fontSize: 12, color: '#999' }}>{c.date}</span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'coupons' && (
          isAuthenticated ? (
            coupons.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {coupons.map((cp) => {
                  const st = statusMap[cp.status];
                  const isActive = cp.status === 'unused';
                  return (
                    <Card key={cp.id} style={{ borderRadius: 12, opacity: isActive ? 1 : 0.6 }} onClick={() => navigate(`/coupon/${cp.id}`)}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{
                          width: 60, height: 60, borderRadius: 8,
                          background: isActive ? `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})` : '#ccc',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: 20, flexShrink: 0,
                        }}>🎟️</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>{cp.title}</div>
                          <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{cp.merchant}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                            <Tag color={st.color} fill="outline" style={{ fontSize: 10, '--border-radius': '4px' } as React.CSSProperties}>{st.text}</Tag>
                            <span style={{ fontSize: 11, color: '#bbb' }}>{t('offers.validUntil')} {cp.expire}</span>
                          </div>
                        </div>
                        <RightOutline style={{ color: '#ccc' }} />
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🎟️</div>
                <div>{loginLabels.noCoupons[locale]}</div>
              </div>
            )
          ) : (
            <Card style={{ borderRadius: 12, textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎟️</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#333', marginBottom: 8 }}>
                {loginLabels.loginRequired[locale]}
              </div>
              <div style={{ fontSize: 13, color: '#999', marginBottom: 20 }}>
                {loginLabels.loginToCoupons[locale]}
              </div>
              <Button
                color="primary"
                onClick={() => navigate('/login')}
                style={{ '--background-color': colors.primary, '--border-color': colors.primary, borderRadius: 20, padding: '8px 32px' } as React.CSSProperties}
              >
                {loginLabels.login[locale]}
              </Button>
            </Card>
          )
        )}

        {activeTab === 'draws' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {luckyDraws.map((ld) => (
              <Card key={ld.id} style={{ borderRadius: 12, cursor: 'pointer' }} onClick={() => navigate(`/lottery/${ld.id}`)}>
                <div style={{
                  height: 100, background: `linear-gradient(135deg, ${ld.color}, ${ld.color}BB)`,
                  margin: '-12px -12px 12px', display: 'flex', flexDirection: 'column',
                  justifyContent: 'center', padding: '0 20px', color: '#fff', position: 'relative',
                }}>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{ld.title}</div>
                  <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>🎁 {ld.prize}</div>
                  <div style={{
                    position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: '8px 12px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>{ld.stampCost}</div>
                    <div style={{ fontSize: 10, opacity: 0.9 }}>{locale === 'en' ? 'STAMPS' : '印花'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, color: '#666' }}>
                      {locale === 'en' ? `Cost: ${ld.stampCost} stamps per draw` : `每次抽獎消耗 ${ld.stampCost} 印花`}
                    </div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{t('offers.deadline')}: {ld.endDate}</div>
                  </div>
                  <Button color="primary" size="small"
                    onClick={(e) => { e.stopPropagation(); navigate(isAuthenticated ? `/lottery/${ld.id}` : '/login'); }}
                    style={{ '--background-color': ld.color, '--border-color': ld.color, borderRadius: 20 } as React.CSSProperties}
                  >{!isAuthenticated ? loginLabels.login[locale] : t('offers.drawNow')}</Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'gifts' && (
          <Grid columns={2} gap={12}>
            {gifts.map((g) => (
              <Grid.Item key={g.id}>
                <Card style={{ borderRadius: 12, height: '100%' }}>
                  <div style={{
                    height: 100, background: `linear-gradient(135deg, ${g.color}, ${g.color}88)`,
                    margin: '-12px -12px 12px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: '#fff', fontSize: 32,
                  }}>🎁</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#333', lineHeight: 1.3 }}>{g.title}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: GOLD }}>{g.stamps} {t('common.stamp')}</span>
                    {!g.stock && <Tag color="default" style={{ fontSize: 10 }}>{t('offers.soldOut')}</Tag>}
                  </div>
                  <Button block size="small" color="primary" disabled={!g.stock}
                    style={{ marginTop: 8, '--background-color': g.stock ? colors.primary : '#ccc', '--border-color': g.stock ? colors.primary : '#ccc', borderRadius: 8, fontSize: 13 } as React.CSSProperties}
                  >{g.stock ? t('gifts.redeem') : t('offers.soldOut')}</Button>
                </Card>
              </Grid.Item>
            ))}
          </Grid>
        )}
      </div>
    </div>
  );
}
