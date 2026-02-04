import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NavBar, Card, List, Tag, Button, Divider } from 'antd-mobile';

const PRIMARY = '#00694B';

const couponData: Record<string, any> = {
  cp1: {
    title: '星巴克 HK$50 現金券', merchant: 'Starbucks',
    mall: '又一城 Festival Walk', expire: '2026-03-31', status: 'unused', stampCost: 200,
    desc: '可於又一城 Starbucks 門店使用，不設最低消費。',
    rules: ['每次消費只可使用一張優惠券', '不可與其他優惠同時使用', '不可兌換現金或找續', '優惠券到期後自動作廢', '僅適用於又一城 Starbucks 門店'],
  },
  cp2: {
    title: '免費泊車 3 小時', merchant: '又一城停車場',
    mall: '又一城 Festival Walk', expire: '2026-02-28', status: 'unused', stampCost: 100,
    desc: '於又一城停車場享免費泊車3小時，須於出場前掃碼使用。',
    rules: ['每次泊車只可使用一張', '超出3小時部分按正常收費', '適用於又一城停車場B1-B3層', '優惠券到期後自動作廢'],
  },
};

const defaultCoupon = {
  title: '優惠券詳情', merchant: '指定商戶', mall: '領展商場',
  expire: '2026-12-31', status: 'unused', stampCost: 0,
  desc: '請按照使用規則於指定商戶出示此優惠券。',
  rules: ['請出示優惠券QR碼予商戶工作人員掃描', '每次消費只可使用一張', '領展保留最終決定權'],
};

const statusMap: Record<string, { text: string; color: string }> = {
  unused: { text: '未使用', color: '#52c41a' },
  used: { text: '已使用', color: '#999' },
  expired: { text: '已過期', color: '#999' },
};

export default function CouponDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const coupon = couponData[id || ''] || defaultCoupon;
  const st = statusMap[coupon.status] || statusMap.unused;
  const isActive = coupon.status === 'unused';

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <NavBar onBack={() => navigate(-1)} style={{ background: '#fff' }}>優惠券詳情</NavBar>

      <div style={{ padding: 16 }}>
        <Card style={{ borderRadius: 16, overflow: 'hidden' }}>
          <div style={{
            background: isActive ? `linear-gradient(135deg, ${PRIMARY}, #004D36)` : '#999',
            margin: '-12px -12px 16px', padding: '24px 20px', color: '#fff', textAlign: 'center',
          }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{coupon.title}</div>
            <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>{coupon.merchant}</div>
            <Tag style={{ '--background-color': 'rgba(255,255,255,0.2)', '--text-color': '#fff', marginTop: 8 } as React.CSSProperties}>
              {st.text}
            </Tag>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{
              width: '80%', height: 60, margin: '0 auto', background: isActive ? '#f0f0f0' : '#e0e0e0',
              borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: isActive ? `2px dashed ${PRIMARY}` : '2px dashed #ccc',
            }}>
              <span style={{ fontSize: 12, color: isActive ? PRIMARY : '#999', fontWeight: 600 }}>
                {isActive ? '| | | | | | | | | | |  Barcode  | | | | | | | | | | |' : '已失效'}
              </span>
            </div>
            {isActive && <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>出示此條碼予商戶掃描使用</div>}
          </div>

          <Divider />
          <div style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 12 }}>{coupon.desc}</div>
        </Card>
      </div>

      <div style={{ padding: '0 16px' }}>
        <Card style={{ borderRadius: 12 }}>
          <List style={{ '--border-top': 'none', '--border-bottom': 'none' } as React.CSSProperties}>
            <List.Item extra={coupon.merchant}>適用商戶</List.Item>
            <List.Item extra={coupon.mall}>所屬商場</List.Item>
            <List.Item extra={coupon.expire}>有效期至</List.Item>
            <List.Item extra={`${coupon.stampCost} 印花`}>兌換花費</List.Item>
          </List>
        </Card>
      </div>

      <div style={{ padding: 16 }}>
        <Card title={<span style={{ fontWeight: 600 }}>使用規則</span>} style={{ borderRadius: 12 }}>
          {coupon.rules.map((rule: string, i: number) => (
            <div key={i} style={{ fontSize: 13, color: '#666', marginBottom: 6, display: 'flex', gap: 6 }}>
              <span style={{ color: '#999' }}>•</span><span>{rule}</span>
            </div>
          ))}
        </Card>
      </div>

      {isActive && (
        <div style={{ padding: '0 16px 32px' }}>
          <Button block color="primary" size="large"
            style={{ '--background-color': PRIMARY, '--border-color': PRIMARY, borderRadius: 12, fontWeight: 600 } as React.CSSProperties}
          >立即使用</Button>
        </div>
      )}
    </div>
  );
}
