import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, List, Tag, ProgressBar } from 'antd-mobile';
import { useLocale } from '../../hooks/useLocale';

const PRIMARY = '#00694B';
const GOLD = '#C4A962';

const transactions = [
  { id: 't1', date: '2026-02-03', desc: '又一城 Pacific Coffee 消費', amount: +25, type: 'earn', source: '掃碼' },
  { id: 't2', date: '2026-02-02', desc: '兌換: 星巴克 HK$50 優惠券', amount: -200, type: 'redeem', source: '兌換' },
  { id: 't3', date: '2026-02-01', desc: '新春三倍印花活動獎勵', amount: +150, type: 'earn', source: '活動' },
  { id: 't4', date: '2026-01-30', desc: 'T Town UNIQLO 消費', amount: +45, type: 'earn', source: '掃碼' },
  { id: 't5', date: '2026-01-28', desc: '又一城 Page One 消費', amount: +18, type: 'earn', source: '掃碼' },
  { id: 't6', date: '2026-01-25', desc: '兌換: 免費泊車3小時', amount: -100, type: 'redeem', source: '兌換' },
  { id: 't7', date: '2026-01-22', desc: '會員生日雙倍印花獎勵', amount: +60, type: 'earn', source: '活動' },
  { id: 't8', date: '2026-01-20', desc: '九龍城廣場 大家樂 消費', amount: +12, type: 'earn', source: '掃碼' },
  { id: 't9', date: '2026-01-15', desc: '印花到期清零', amount: -80, type: 'expire', source: '系統' },
  { id: 't10', date: '2026-01-10', desc: '赤柱廣場 百佳 消費', amount: +32, type: 'earn', source: '掃碼' },
  { id: 't11', date: '2026-01-05', desc: '新年幸運大抽獎獎勵', amount: +100, type: 'earn', source: '抽獎' },
];

export default function StampPage() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const [tab, setTab] = useState('all');

  const filtered = transactions.filter((t) => {
    if (tab === 'all') return true;
    if (tab === 'earn') return t.type === 'earn';
    if (tab === 'redeem') return t.type === 'redeem';
    if (tab === 'expire') return t.type === 'expire';
    return true;
  });

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Balance Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${PRIMARY}, #004D36)`,
          padding: '28px 20px 32px', color: '#fff', textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 13, opacity: 0.7 }}>{t('customerApp.myStampBalance')}</div>
        <div style={{ fontSize: 48, fontWeight: 800, color: GOLD, marginTop: 4 }}>2,580</div>
        <div style={{ fontSize: 14, opacity: 0.8, marginTop: 4 }}>{t('customerApp.stampsUnit')}</div>

        {/* Tier Progress */}
        <div
          style={{
            background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '12px 16px',
            marginTop: 20, textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
            <span>🥇 {t('customerApp.goldTier')}</span>
            <span>💎 {t('customerApp.platinumTier')}</span>
          </div>
          <ProgressBar
            percent={64.5}
            style={{
              '--fill-color': GOLD,
              '--track-color': 'rgba(255,255,255,0.2)',
              '--track-width': '8px',
            } as any}
          />
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6, textAlign: 'center' }}>
            {t('customerApp.needMoreToUpgrade', { stamps: '1,420' })}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div
        style={{
          display: 'flex', margin: '-16px 16px 0', position: 'relative', zIndex: 1,
          background: '#fff', borderRadius: 12, padding: '14px 0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        {[
          { label: t('customerApp.monthlyEarned'), value: '+320', color: PRIMARY },
          { label: t('customerApp.monthlyUsed'), value: '-150', color: '#E65100' },
          { label: t('customerApp.expiringSoon'), value: '200', color: '#C62828' },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', borderRight: i < 2 ? '1px solid #f0f0f0' : 'none' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Transaction Tabs */}
      <div style={{ padding: '16px 16px 0' }}>
        <Tabs activeKey={tab} onChange={setTab} style={{ '--active-line-color': PRIMARY, '--active-title-color': PRIMARY } as any}>
          <Tabs.Tab title={t('customerApp.filterAll')} key="all" />
          <Tabs.Tab title={t('customerApp.filterEarn')} key="earn" />
          <Tabs.Tab title={t('customerApp.filterUse')} key="redeem" />
          <Tabs.Tab title={t('customerApp.filterExpire')} key="expire" />
        </Tabs>
      </div>

      {/* Transaction List */}
      <div style={{ padding: '0 16px 16px' }}>
        <List style={{ '--border-top': 'none' } as any}>
          {filtered.map((tx) => (
            <List.Item
              key={tx.id}
              onClick={() => navigate(`/stamp/${tx.id}`)}
              description={
                <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                  <Tag
                    color={tx.type === 'earn' ? 'success' : tx.type === 'redeem' ? 'warning' : 'default'}
                    fill="outline"
                    style={{ '--border-radius': '4px', fontSize: 10 } as any}
                  >
                    {tx.source}
                  </Tag>
                  <span style={{ fontSize: 12, color: '#bbb' }}>{tx.date}</span>
                </div>
              }
              extra={
                <span
                  style={{
                    fontSize: 18, fontWeight: 700,
                    color: tx.type === 'earn' ? PRIMARY : tx.type === 'expire' ? '#999' : '#E65100',
                  }}
                >
                  {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                </span>
              }
            >
              {tx.desc}
            </List.Item>
          ))}
        </List>
      </div>
    </div>
  );
}
