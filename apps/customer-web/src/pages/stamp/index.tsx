import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, List, Tag, ProgressBar, Button } from 'antd-mobile';
import { useLocale } from '../../hooks/useLocale';
import { useAuthStore } from '../../store/auth';
import { useSettingsStore } from '../../store/settings';

const GOLD = '#C4A962';

// Sample transactions data - in real app this would come from API
const sampleTransactions = [
  { id: 't1', date: '2026-02-03', desc: { 'zh-TW': '又一城 Pacific Coffee 消費', 'zh-CN': '又一城 Pacific Coffee 消费', en: 'Festival Walk Pacific Coffee' }, amount: +25, type: 'earn', source: { 'zh-TW': '掃碼', 'zh-CN': '扫码', en: 'Scan' } },
  { id: 't2', date: '2026-02-02', desc: { 'zh-TW': '兌換: 星巴克 HK$50 優惠券', 'zh-CN': '兑换: 星巴克 HK$50 优惠券', en: 'Redeem: Starbucks HK$50 Coupon' }, amount: -200, type: 'redeem', source: { 'zh-TW': '兌換', 'zh-CN': '兑换', en: 'Redeem' } },
  { id: 't3', date: '2026-02-01', desc: { 'zh-TW': '新春三倍印花活動獎勵', 'zh-CN': '新春三倍印花活动奖励', en: 'CNY Triple Stamps Bonus' }, amount: +150, type: 'earn', source: { 'zh-TW': '活動', 'zh-CN': '活动', en: 'Event' } },
  { id: 't4', date: '2026-01-30', desc: { 'zh-TW': 'T Town UNIQLO 消費', 'zh-CN': 'T Town UNIQLO 消费', en: 'T Town UNIQLO' }, amount: +45, type: 'earn', source: { 'zh-TW': '掃碼', 'zh-CN': '扫码', en: 'Scan' } },
  { id: 't5', date: '2026-01-28', desc: { 'zh-TW': '又一城 Page One 消費', 'zh-CN': '又一城 Page One 消费', en: 'Festival Walk Page One' }, amount: +18, type: 'earn', source: { 'zh-TW': '掃碼', 'zh-CN': '扫码', en: 'Scan' } },
  { id: 't6', date: '2026-01-25', desc: { 'zh-TW': '兌換: 免費泊車3小時', 'zh-CN': '兑换: 免费泊车3小时', en: 'Redeem: 3 Hours Free Parking' }, amount: -100, type: 'redeem', source: { 'zh-TW': '兌換', 'zh-CN': '兑换', en: 'Redeem' } },
  { id: 't7', date: '2026-01-22', desc: { 'zh-TW': '會員生日雙倍印花獎勵', 'zh-CN': '会员生日双倍印花奖励', en: 'Birthday Double Stamps Bonus' }, amount: +60, type: 'earn', source: { 'zh-TW': '活動', 'zh-CN': '活动', en: 'Event' } },
  { id: 't8', date: '2026-01-20', desc: { 'zh-TW': '九龍城廣場 大家樂 消費', 'zh-CN': '九龙城广场 大家乐 消费', en: 'Kowloon City Plaza Cafe de Coral' }, amount: +12, type: 'earn', source: { 'zh-TW': '掃碼', 'zh-CN': '扫码', en: 'Scan' } },
  { id: 't9', date: '2026-01-15', desc: { 'zh-TW': '印花到期清零', 'zh-CN': '印花到期清零', en: 'Stamps Expired' }, amount: -80, type: 'expire', source: { 'zh-TW': '系統', 'zh-CN': '系统', en: 'System' } },
  { id: 't10', date: '2026-01-10', desc: { 'zh-TW': '赤柱廣場 百佳 消費', 'zh-CN': '赤柱广场 百佳 消费', en: 'Stanley Plaza PARKnSHOP' }, amount: +32, type: 'earn', source: { 'zh-TW': '掃碼', 'zh-CN': '扫码', en: 'Scan' } },
  { id: 't11', date: '2026-01-05', desc: { 'zh-TW': '新年幸運大抽獎獎勵', 'zh-CN': '新年幸运大抽奖奖励', en: 'New Year Lucky Draw Bonus' }, amount: +100, type: 'earn', source: { 'zh-TW': '抽獎', 'zh-CN': '抽奖', en: 'Draw' } },
  { id: 't12', date: '2026-01-01', desc: { 'zh-TW': '新會員註冊獎勵', 'zh-CN': '新会员注册奖励', en: 'New Member Registration Bonus' }, amount: +1000, type: 'earn', source: { 'zh-TW': '註冊', 'zh-CN': '注册', en: 'Register' } },
];

export default function StampPage() {
  const navigate = useNavigate();
  const { t, locale } = useLocale();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();
  const [tab, setTab] = useState('all');

  // Derive locale-specific transactions
  const transactions = useMemo(() =>
    isAuthenticated ? sampleTransactions.map(tx => ({
      ...tx,
      desc: tx.desc[locale] || tx.desc['zh-TW'],
      source: tx.source[locale] || tx.source['zh-TW'],
    })) : [],
    [locale, isAuthenticated]
  );

  // Get stamp balance from user or show 0
  const stampBalance = user?.stampBalance || 0;

  const filtered = transactions.filter((t) => {
    if (tab === 'all') return true;
    if (tab === 'earn') return t.type === 'earn';
    if (tab === 'redeem') return t.type === 'redeem';
    if (tab === 'expire') return t.type === 'expire';
    return true;
  });

  // Calculate tier progress (need 4000 stamps for platinum)
  const tierProgress = Math.min((stampBalance / 4000) * 100, 100);
  const needMore = Math.max(4000 - stampBalance, 0);

  // Calculate monthly stats from transactions
  const monthlyEarned = transactions.filter(t => t.type === 'earn').reduce((sum, t) => sum + t.amount, 0);
  const monthlyUsed = Math.abs(transactions.filter(t => t.type === 'redeem').reduce((sum, t) => sum + t.amount, 0));
  const expiringSoon = 200; // In real app, calculate from actual data

  // Multilingual labels for login prompt
  const loginLabels = {
    title: { 'zh-TW': '登入查看印花', 'zh-CN': '登录查看印花', en: 'Login to View Stamps' },
    subtitle: { 'zh-TW': '登入會員帳戶以查看您的印花餘額及交易記錄', 'zh-CN': '登录会员账户以查看您的印花余额及交易记录', en: 'Sign in to view your stamp balance and transaction history' },
    login: { 'zh-TW': '登入 / 註冊', 'zh-CN': '登录 / 注册', en: 'Login / Register' },
    benefits: { 'zh-TW': '會員福利', 'zh-CN': '会员福利', en: 'Member Benefits' },
    benefit1: { 'zh-TW': '消費賺取印花', 'zh-CN': '消费赚取印花', en: 'Earn stamps on purchases' },
    benefit2: { 'zh-TW': '兌換精選禮品', 'zh-CN': '兑换精选礼品', en: 'Redeem exclusive gifts' },
    benefit3: { 'zh-TW': '專屬會員優惠', 'zh-CN': '专属会员优惠', en: 'Member-exclusive offers' },
    noRecords: { 'zh-TW': '暫無交易記錄', 'zh-CN': '暂无交易记录', en: 'No transaction records yet' },
  };

  // Show login prompt for guests
  if (!isAuthenticated) {
    return (
      <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
        {/* Header */}
        <div
          style={{
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
            padding: '28px 20px 80px', color: '#fff', textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 700 }}>{loginLabels.title[locale]}</div>
          <div style={{ fontSize: 13, opacity: 0.8, marginTop: 8 }}>{loginLabels.subtitle[locale]}</div>
        </div>

        {/* Login Card */}
        <div style={{ margin: '-50px 16px 0', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              background: '#fff', borderRadius: 16, padding: 24,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 60, marginBottom: 16 }}>⭐</div>
            <Button
              block
              color="primary"
              size="large"
              onClick={() => navigate('/login')}
              style={{
                '--background-color': colors.primary,
                '--border-color': colors.primary,
                borderRadius: 12,
                height: 48,
                fontSize: 16,
                fontWeight: 600,
              } as React.CSSProperties}
            >
              {loginLabels.login[locale]}
            </Button>
          </div>
        </div>

        {/* Benefits Section */}
        <div style={{ padding: 16, marginTop: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#333', marginBottom: 12 }}>
            {loginLabels.benefits[locale]}
          </div>
          <div style={{ background: '#fff', borderRadius: 12, padding: 16 }}>
            {[
              { icon: '🛍️', text: loginLabels.benefit1[locale] },
              { icon: '🎁', text: loginLabels.benefit2[locale] },
              { icon: '🎯', text: loginLabels.benefit3[locale] },
            ].map((benefit, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 0',
                  borderBottom: idx < 2 ? '1px solid #f0f0f0' : 'none',
                }}
              >
                <span style={{ fontSize: 24 }}>{benefit.icon}</span>
                <span style={{ fontSize: 14, color: '#333' }}>{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Balance Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
          padding: '28px 20px 32px', color: '#fff', textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 13, opacity: 0.7 }}>{t('customerApp.myStampBalance')}</div>
        <div style={{ fontSize: 48, fontWeight: 800, color: GOLD, marginTop: 4 }}>{stampBalance.toLocaleString()}</div>
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
            percent={tierProgress}
            style={{
              '--fill-color': GOLD,
              '--track-color': 'rgba(255,255,255,0.2)',
              '--track-width': '8px',
            } as any}
          />
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6, textAlign: 'center' }}>
            {t('customerApp.needMoreToUpgrade', { stamps: needMore.toLocaleString() })}
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
          { label: t('customerApp.monthlyEarned'), value: `+${monthlyEarned}`, color: colors.primary },
          { label: t('customerApp.monthlyUsed'), value: `-${monthlyUsed}`, color: '#E65100' },
          { label: t('customerApp.expiringSoon'), value: expiringSoon.toString(), color: '#C62828' },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', borderRight: i < 2 ? '1px solid #f0f0f0' : 'none' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Transaction Tabs */}
      <div style={{ padding: '16px 16px 0' }}>
        <Tabs activeKey={tab} onChange={setTab} style={{ '--active-line-color': colors.primary, '--active-title-color': colors.primary } as React.CSSProperties}>
          <Tabs.Tab title={t('customerApp.filterAll')} key="all" />
          <Tabs.Tab title={t('customerApp.filterEarn')} key="earn" />
          <Tabs.Tab title={t('customerApp.filterUse')} key="redeem" />
          <Tabs.Tab title={t('customerApp.filterExpire')} key="expire" />
        </Tabs>
      </div>

      {/* Transaction List */}
      <div style={{ padding: '0 16px 16px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            {loginLabels.noRecords[locale]}
          </div>
        ) : (
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
                      color: tx.type === 'earn' ? colors.primary : tx.type === 'expire' ? '#999' : '#E65100',
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
        )}
      </div>
    </div>
  );
}
