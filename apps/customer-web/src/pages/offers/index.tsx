import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, Card, Grid, Tag, Badge, Button } from 'antd-mobile';
import { RightOutline } from 'antd-mobile-icons';

const PRIMARY = '#00694B';
const GOLD = '#C4A962';

const campaigns = [
  {
    id: 'c1', title: '新春印花三倍賞', mall: '又一城 Festival Walk',
    date: '2026.01.15 - 2026.02.28', type: '印花加倍', color: '#C62828',
    desc: '農曆新年期間所有消費可獲三倍印花獎賞',
  },
  {
    id: 'c2', title: '春日美食節', mall: 'T Town',
    date: '2026.02.01 - 2026.03.31', type: '餐飲優惠', color: '#E65100',
    desc: '指定餐廳消費享額外印花及折扣優惠',
  },
  {
    id: 'c3', title: '會員專屬生日禮遇', mall: '全線商場',
    date: '全年適用', type: '會員專屬', color: PRIMARY,
    desc: '生日月份享雙倍印花及神秘禮品',
  },
  {
    id: 'c4', title: '新年幸運大抽獎', mall: '九龍城廣場',
    date: '2026.01.15 - 2026.03.15', type: '抽獎', color: '#6A1B9A',
    desc: '消費滿HK$300即可參加抽獎',
  },
  {
    id: 'c5', title: '冬日禮品換購', mall: '赤柱廣場',
    date: '2026.01.01 - 2026.02.28', type: '禮品兌換', color: '#1565C0',
    desc: '以印花換購精選冬日限定禮品',
  },
];

const coupons = [
  { id: 'cp1', title: '星巴克 HK$50 現金券', merchant: 'Starbucks', expire: '2026-03-31', status: 'unused' as const },
  { id: 'cp2', title: '免費泊車 3 小時', merchant: '又一城停車場', expire: '2026-02-28', status: 'unused' as const },
  { id: 'cp3', title: 'Pacific Coffee 買一送一', merchant: 'Pacific Coffee', expire: '2026-01-31', status: 'used' as const },
  { id: 'cp4', title: 'UNIQLO 9折優惠券', merchant: 'UNIQLO', expire: '2025-12-31', status: 'expired' as const },
];

const luckyDraws = [
  { id: 'ld1', title: '新年幸運大抽獎', prize: '日本來回機票 + 酒店住宿', endDate: '2026-03-15', entries: 2, maxEntries: 5, color: '#C62828' },
  { id: 'ld2', title: '春日驚喜扭蛋機', prize: '最高可贏取 5,000 印花', endDate: '2026-04-30', entries: 0, maxEntries: 3, color: '#6A1B9A' },
];

const gifts = [
  { id: 'g1', title: '領展環保購物袋', stamps: 200, stock: true, color: PRIMARY },
  { id: 'g2', title: '精選咖啡禮盒', stamps: 500, stock: true, color: '#795548' },
  { id: 'g3', title: '藍牙無線耳機', stamps: 1500, stock: true, color: '#1565C0' },
  { id: 'g4', title: '日本和風餐具套裝', stamps: 800, stock: true, color: '#C62828' },
  { id: 'g5', title: '便攜式充電寶', stamps: 1000, stock: false, color: '#616161' },
  { id: 'g6', title: '限量版Link Mall公仔', stamps: 2000, stock: true, color: GOLD },
];

const statusMap = {
  unused: { text: '未使用', color: 'success' as const },
  used: { text: '已使用', color: 'default' as const },
  expired: { text: '已過期', color: 'default' as const },
};

export default function OffersPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('campaigns');

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', paddingBottom: 60 }}>
      <div style={{ background: PRIMARY, padding: '20px 16px 12px', color: '#fff' }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>優惠專區</div>
        <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>探索專屬優惠與活動</div>
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
        <Tabs.Tab title="活動" key="campaigns" />
        <Tabs.Tab title="優惠券" key="coupons" />
        <Tabs.Tab title="抽獎" key="draws" />
        <Tabs.Tab title="禮品兌換" key="gifts" />
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
                        <span style={{ fontSize: 11, color: '#bbb' }}>有效期至 {cp.expire}</span>
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
              <Card key={ld.id} style={{ borderRadius: 12 }}>
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
                      已抽 <span style={{ fontWeight: 700, color: PRIMARY }}>{ld.entries}</span> / {ld.maxEntries} 次
                    </div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>截止日期: {ld.endDate}</div>
                  </div>
                  <Button color="primary" size="small"
                    style={{ '--background-color': PRIMARY, '--border-color': PRIMARY, borderRadius: 20 } as React.CSSProperties}
                    disabled={ld.entries >= ld.maxEntries}
                  >{ld.entries >= ld.maxEntries ? '已用完' : '立即抽獎'}</Button>
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
                    <span style={{ fontSize: 16, fontWeight: 700, color: GOLD }}>{g.stamps} 印花</span>
                    {!g.stock && <Tag color="default" style={{ fontSize: 10 }}>已售罄</Tag>}
                  </div>
                  <Button block size="small" color="primary" disabled={!g.stock}
                    style={{ marginTop: 8, '--background-color': g.stock ? PRIMARY : '#ccc', '--border-color': g.stock ? PRIMARY : '#ccc', borderRadius: 8, fontSize: 13 } as React.CSSProperties}
                  >{g.stock ? '立即兌換' : '已售罄'}</Button>
                </Card>
              </Grid.Item>
            ))}
          </Grid>
        )}
      </div>
    </div>
  );
}
