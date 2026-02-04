import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NavBar, Card, List, Tag, Button, Divider } from 'antd-mobile';

const PRIMARY = '#00694B';

const campaignData: Record<string, any> = {
  c1: {
    title: '新春印花三倍賞', mall: '又一城 Festival Walk',
    date: '2026.01.15 - 2026.02.28', type: '印花加倍', color: '#C62828',
    desc: '農曆新年期間所有消費可獲三倍印花獎賞，讓你更快升級會員等級！',
    rules: [
      '活動期間於又一城任何商戶消費即可享三倍印花',
      '每筆消費最少滿HK$50方可參加',
      '印花將於消費後48小時內存入帳戶',
      '本活動不可與其他印花加倍活動同時使用',
      '領展保留最終決定權',
    ],
    howTo: [
      '於又一城商戶消費後保留收據',
      '打開 Link Mall App 掃描收據二維碼',
      '系統自動計算三倍印花並存入帳戶',
    ],
  },
  c2: {
    title: '春日美食節', mall: 'T Town',
    date: '2026.02.01 - 2026.03.31', type: '餐飲優惠', color: '#E65100',
    desc: '指定餐廳消費享額外印花及折扣優惠，與親友共享春日美食',
    rules: [
      '適用於T Town指定餐飲商戶',
      '每筆消費滿HK$100可獲額外50印花',
      '每位會員每日最多可獲3次額外印花',
      '需出示會員QR碼方可享優惠',
    ],
    howTo: ['前往T Town指定參與餐廳', '消費前出示會員QR碼', '付款後掃描收據獲取印花'],
  },
};

const defaultCampaign = {
  title: '活動詳情', mall: '全線商場', date: '進行中', type: '活動', color: PRIMARY,
  desc: '歡迎參加領展會員活動，享受專屬優惠。',
  rules: ['請留意活動相關條款及細則', '領展保留最終決定權'],
  howTo: ['前往指定商場參與活動', '出示會員QR碼即可參加'],
};

export default function CampaignDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const campaign = campaignData[id || ''] || defaultCampaign;

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <NavBar onBack={() => navigate(-1)} style={{ background: '#fff' }}>活動詳情</NavBar>

      <div style={{
        height: 200, background: `linear-gradient(135deg, ${campaign.color} 0%, ${campaign.color}BB 100%)`,
        display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px', color: '#fff',
      }}>
        <Tag style={{ '--background-color': 'rgba(255,255,255,0.2)', '--text-color': '#fff', alignSelf: 'flex-start', marginBottom: 12 } as React.CSSProperties}>
          {campaign.type}
        </Tag>
        <div style={{ fontSize: 24, fontWeight: 700 }}>{campaign.title}</div>
        <div style={{ fontSize: 14, opacity: 0.85, marginTop: 8 }}>{campaign.desc}</div>
      </div>

      <div style={{ padding: 16 }}>
        <Card style={{ borderRadius: 12 }}>
          <List style={{ '--border-top': 'none', '--border-bottom': 'none' } as React.CSSProperties}>
            <List.Item extra={campaign.mall}>適用商場</List.Item>
            <List.Item extra={campaign.date}>活動日期</List.Item>
            <List.Item extra={campaign.type}>活動類型</List.Item>
          </List>
        </Card>
      </div>

      <div style={{ padding: '0 16px' }}>
        <Card title={<span style={{ fontWeight: 600 }}>如何參加</span>} style={{ borderRadius: 12 }}>
          {campaign.howTo.map((step: string, i: number) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < campaign.howTo.length - 1 ? 12 : 0, alignItems: 'flex-start' }}>
              <div style={{
                width: 24, height: 24, borderRadius: 12, background: PRIMARY,
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, flexShrink: 0,
              }}>{i + 1}</div>
              <div style={{ fontSize: 14, color: '#333', lineHeight: 1.5 }}>{step}</div>
            </div>
          ))}
        </Card>
      </div>

      <div style={{ padding: 16 }}>
        <Card title={<span style={{ fontWeight: 600 }}>條款及細則</span>} style={{ borderRadius: 12 }}>
          {campaign.rules.map((rule: string, i: number) => (
            <div key={i} style={{ fontSize: 13, color: '#666', marginBottom: 8, display: 'flex', gap: 6 }}>
              <span style={{ color: '#999' }}>{i + 1}.</span><span>{rule}</span>
            </div>
          ))}
        </Card>
      </div>

      <div style={{ padding: '0 16px 32px' }}>
        <Button block color="primary" size="large"
          style={{ '--background-color': PRIMARY, '--border-color': PRIMARY, borderRadius: 12, fontWeight: 600 } as React.CSSProperties}
          onClick={() => navigate('/scan')}
        >立即參加</Button>
      </div>
    </div>
  );
}
