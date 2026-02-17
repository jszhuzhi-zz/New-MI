import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, Card, Grid, Tag, Badge, Button } from 'antd-mobile';
import { RightOutline } from 'antd-mobile-icons';
import { useTranslation } from '../../locales';
import { useSettingsStore, type Locale } from '../../store/settings';

const PRIMARY = '#00694B';
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
  entries: number;
  maxEntries: number;
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
    id: 'c2',
    title: { 'zh-TW': '春日美食節', 'zh-CN': '春日美食节', en: 'Spring Food Festival' },
    mall: { 'zh-TW': 'T Town', 'zh-CN': 'T Town', en: 'T Town' },
    date: { 'zh-TW': '2026.02.01 - 2026.03.31', 'zh-CN': '2026.02.01 - 2026.03.31', en: 'Feb 1 - Mar 31, 2026' },
    type: { 'zh-TW': '餐飲優惠', 'zh-CN': '餐饮优惠', en: 'Dining Offers' },
    color: '#E65100',
    desc: { 'zh-TW': '指定餐廳消費享額外印花及折扣優惠', 'zh-CN': '指定餐厅消费享额外印花及折扣优惠', en: 'Earn extra stamps and discounts at selected restaurants' },
  },
  {
    id: 'c3',
    title: { 'zh-TW': '會員專屬生日禮遇', 'zh-CN': '会员专属生日礼遇', en: 'Member Birthday Rewards' },
    mall: { 'zh-TW': '全線商場', 'zh-CN': '全线商场', en: 'All Malls' },
    date: { 'zh-TW': '全年適用', 'zh-CN': '全年适用', en: 'Year-round' },
    type: { 'zh-TW': '會員專屬', 'zh-CN': '会员专属', en: 'Member Exclusive' },
    color: PRIMARY,
    desc: { 'zh-TW': '生日月份享雙倍印花及神秘禮品', 'zh-CN': '生日月份享双倍印花及神秘礼品', en: 'Enjoy double stamps and mystery gifts during birthday month' },
  },
  {
    id: 'c4',
    title: { 'zh-TW': '新年幸運大抽獎', 'zh-CN': '新年幸运大抽奖', en: 'New Year Lucky Draw' },
    mall: { 'zh-TW': '九龍城廣場', 'zh-CN': '九龙城广场', en: 'Kowloon City Plaza' },
    date: { 'zh-TW': '2026.01.15 - 2026.03.15', 'zh-CN': '2026.01.15 - 2026.03.15', en: 'Jan 15 - Mar 15, 2026' },
    type: { 'zh-TW': '抽獎', 'zh-CN': '抽奖', en: 'Lucky Draw' },
    color: '#6A1B9A',
    desc: { 'zh-TW': '消費滿HK$300即可參加抽獎', 'zh-CN': '消费满HK$300即可参加抽奖', en: 'Spend HK$300 to join the lucky draw' },
  },
  {
    id: 'c5',
    title: { 'zh-TW': '冬日禮品換購', 'zh-CN': '冬日礼品换购', en: 'Winter Gift Redemption' },
    mall: { 'zh-TW': '赤柱廣場', 'zh-CN': '赤柱广场', en: 'Stanley Plaza' },
    date: { 'zh-TW': '2026.01.01 - 2026.02.28', 'zh-CN': '2026.01.01 - 2026.02.28', en: 'Jan 1 - Feb 28, 2026' },
    type: { 'zh-TW': '禮品兌換', 'zh-CN': '礼品兑换', en: 'Gift Redemption' },
    color: '#1565C0',
    desc: { 'zh-TW': '以印花換購精選冬日限定禮品', 'zh-CN': '以印花换购精选冬日限定礼品', en: 'Redeem stamps for exclusive winter gifts' },
  },
];

const couponsData: CouponData[] = [
  { id: 'cp1', title: { 'zh-TW': '星巴克 HK$50 現金券', 'zh-CN': '星巴克 HK$50 现金券', en: 'Starbucks HK$50 Voucher' }, merchant: { 'zh-TW': 'Starbucks', 'zh-CN': 'Starbucks', en: 'Starbucks' }, expire: '2026-03-31', status: 'unused' },
  { id: 'cp2', title: { 'zh-TW': '免費泊車 3 小時', 'zh-CN': '免费泊车 3 小时', en: '3 Hours Free Parking' }, merchant: { 'zh-TW': '又一城停車場', 'zh-CN': '又一城停车场', en: 'Festival Walk Parking' }, expire: '2026-02-28', status: 'unused' },
  { id: 'cp3', title: { 'zh-TW': 'Pacific Coffee 買一送一', 'zh-CN': 'Pacific Coffee 买一送一', en: 'Pacific Coffee Buy 1 Get 1' }, merchant: { 'zh-TW': 'Pacific Coffee', 'zh-CN': 'Pacific Coffee', en: 'Pacific Coffee' }, expire: '2026-01-31', status: 'used' },
  { id: 'cp4', title: { 'zh-TW': 'UNIQLO 9折優惠券', 'zh-CN': 'UNIQLO 9折优惠券', en: 'UNIQLO 10% Off Coupon' }, merchant: { 'zh-TW': 'UNIQLO', 'zh-CN': 'UNIQLO', en: 'UNIQLO' }, expire: '2025-12-31', status: 'expired' },
];

const luckyDrawsData: LuckyDrawData[] = [
  { id: 'ld1', title: { 'zh-TW': '新年幸運大抽獎', 'zh-CN': '新年幸运大抽奖', en: 'New Year Lucky Draw' }, prize: { 'zh-TW': '日本來回機票 + 酒店住宿', 'zh-CN': '日本来回机票 + 酒店住宿', en: 'Round-trip flight to Japan + Hotel' }, endDate: '2026-03-15', entries: 2, maxEntries: 5, color: '#C62828' },
  { id: 'ld2', title: { 'zh-TW': '春日驚喜扭蛋機', 'zh-CN': '春日惊喜扭蛋机', en: 'Spring Surprise Gacha' }, prize: { 'zh-TW': '最高可贏取 5,000 印花', 'zh-CN': '最高可赢取 5,000 印花', en: 'Win up to 5,000 stamps' }, endDate: '2026-04-30', entries: 0, maxEntries: 3, color: '#6A1B9A' },
];

const giftsData: GiftData[] = [
  { id: 'g1', title: { 'zh-TW': '領展環保購物袋', 'zh-CN': '领展环保购物袋', en: 'Link Eco Shopping Bag' }, stamps: 200, stock: true, color: PRIMARY },
  { id: 'g2', title: { 'zh-TW': '精選咖啡禮盒', 'zh-CN': '精选咖啡礼盒', en: 'Premium Coffee Gift Set' }, stamps: 500, stock: true, color: '#795548' },
  { id: 'g3', title: { 'zh-TW': '藍牙無線耳機', 'zh-CN': '蓝牙无线耳机', en: 'Bluetooth Wireless Earbuds' }, stamps: 1500, stock: true, color: '#1565C0' },
  { id: 'g4', title: { 'zh-TW': '日本和風餐具套裝', 'zh-CN': '日本和风餐具套装', en: 'Japanese Style Tableware Set' }, stamps: 800, stock: true, color: '#C62828' },
  { id: 'g5', title: { 'zh-TW': '便攜式充電寶', 'zh-CN': '便携式充电宝', en: 'Portable Power Bank' }, stamps: 1000, stock: false, color: '#616161' },
  { id: 'g6', title: { 'zh-TW': '限量版Link Mall公仔', 'zh-CN': '限量版Link Mall公仔', en: 'Limited Edition Link Mall Figurine' }, stamps: 2000, stock: true, color: GOLD },
];

export default function OffersPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const locale = useSettingsStore((s) => s.locale);
  const [activeTab, setActiveTab] = useState('campaigns');

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
      <div style={{ background: PRIMARY, padding: '20px 16px 12px', color: '#fff' }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>{t('offers.title')}</div>
        <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>{t('offers.exploreOffers')}</div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        style={{
          '--active-line-color': PRIMARY,
          '--active-title-color': PRIMARY,
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
                    <Tag color="primary" fill="outline" style={{ '--border-color': PRIMARY, '--text-color': PRIMARY, fontSize: 11 } as React.CSSProperties}>{c.type}</Tag>
                    <span style={{ fontSize: 12, color: '#999', marginLeft: 8 }}>{c.mall}</span>
                  </div>
                  <span style={{ fontSize: 12, color: '#999' }}>{c.date}</span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'coupons' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {coupons.map((cp) => {
              const st = statusMap[cp.status];
              const isActive = cp.status === 'unused';
              return (
                <Card key={cp.id} style={{ borderRadius: 12, opacity: isActive ? 1 : 0.6 }} onClick={() => navigate(`/coupon/${cp.id}`)}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{
                      width: 60, height: 60, borderRadius: 8,
                      background: isActive ? `linear-gradient(135deg, ${PRIMARY}, #004D36)` : '#ccc',
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
        )}

        {activeTab === 'draws' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {luckyDraws.map((ld) => (
              <Card key={ld.id} style={{ borderRadius: 12, cursor: 'pointer' }} onClick={() => navigate(`/lottery/${ld.id}`)}>
                <div style={{
                  height: 100, background: `linear-gradient(135deg, ${ld.color}, ${ld.color}BB)`,
                  margin: '-12px -12px 12px', display: 'flex', flexDirection: 'column',
                  justifyContent: 'center', padding: '0 20px', color: '#fff',
                }}>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{ld.title}</div>
                  <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>🎁 {ld.prize}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, color: '#666' }}>
                      {t('offers.drawnTimes', { times: ld.entries, max: ld.maxEntries })}
                    </div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{t('offers.deadline')}: {ld.endDate}</div>
                  </div>
                  <Button color="primary" size="small"
                    onClick={(e) => { e.stopPropagation(); navigate(`/lottery/${ld.id}`); }}
                    style={{ '--background-color': PRIMARY, '--border-color': PRIMARY, borderRadius: 20 } as React.CSSProperties}
                    disabled={ld.entries >= ld.maxEntries}
                  >{ld.entries >= ld.maxEntries ? t('offers.noMoreDraws') : t('offers.drawNow')}</Button>
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
                    style={{ marginTop: 8, '--background-color': g.stock ? PRIMARY : '#ccc', '--border-color': g.stock ? PRIMARY : '#ccc', borderRadius: 8, fontSize: 13 } as React.CSSProperties}
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
