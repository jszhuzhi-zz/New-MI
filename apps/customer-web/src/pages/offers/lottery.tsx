import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Dialog, Toast, Card, Tag, List, ProgressBar, Popup } from 'antd-mobile';
import { LeftOutline, GiftOutline } from 'antd-mobile-icons';
import { useSettingsStore, type Locale } from '../../store/settings';
import { useAuthStore } from '../../store/auth';

const PRIMARY = '#00694B';
const GOLD = '#C4A962';

// Multilingual labels
const labels: Record<string, Record<Locale, string>> = {
  back: { 'zh-TW': '返回', 'zh-CN': '返回', en: 'Back' },
  lotteryDetails: { 'zh-TW': '抽獎詳情', 'zh-CN': '抽奖详情', en: 'Lottery Details' },
  grandPrize: { 'zh-TW': '頭獎', 'zh-CN': '头奖', en: 'Grand Prize' },
  secondPrize: { 'zh-TW': '二獎', 'zh-CN': '二奖', en: '2nd Prize' },
  thirdPrize: { 'zh-TW': '三獎', 'zh-CN': '三奖', en: '3rd Prize' },
  consolationPrize: { 'zh-TW': '安慰獎', 'zh-CN': '安慰奖', en: 'Consolation' },
  myStamps: { 'zh-TW': '我的印花', 'zh-CN': '我的印花', en: 'My Stamps' },
  stampCost: { 'zh-TW': '每次消耗', 'zh-CN': '每次消耗', en: 'Cost per draw' },
  stamps: { 'zh-TW': '印花', 'zh-CN': '印花', en: 'stamps' },
  remaining: { 'zh-TW': '剩餘', 'zh-CN': '剩余', en: 'Remaining' },
  times: { 'zh-TW': '次', 'zh-CN': '次', en: 'times' },
  drawNow: { 'zh-TW': '立即抽獎', 'zh-CN': '立即抽奖', en: 'Draw Now' },
  drawing: { 'zh-TW': '抽獎中...', 'zh-CN': '抽奖中...', en: 'Drawing...' },
  notEnoughStamps: { 'zh-TW': '印花不足', 'zh-CN': '印花不足', en: 'Not enough stamps' },
  needMoreStamps: { 'zh-TW': '需要更多印花', 'zh-CN': '需要更多印花', en: 'Need more stamps' },
  drawHistory: { 'zh-TW': '抽獎記錄', 'zh-CN': '抽奖记录', en: 'Draw History' },
  noHistory: { 'zh-TW': '暫無抽獎記錄', 'zh-CN': '暂无抽奖记录', en: 'No draw history yet' },
  howItWorks: { 'zh-TW': '抽獎說明', 'zh-CN': '抽奖说明', en: 'How It Works' },
  spendStamps: { 'zh-TW': '消耗印花抽獎', 'zh-CN': '消耗印花抽奖', en: 'Spend stamps to draw' },
  unlimitedDraws: { 'zh-TW': '印花充足時不限抽獎次數', 'zh-CN': '印花充足时不限抽奖次数', en: 'Unlimited draws with enough stamps' },
  validPeriod: { 'zh-TW': '有效期', 'zh-CN': '有效期', en: 'Valid Period' },
  congratulations: { 'zh-TW': '恭喜你！', 'zh-CN': '恭喜你！', en: 'Congratulations!' },
  youWon: { 'zh-TW': '你獲得了', 'zh-CN': '你获得了', en: 'You won' },
  tryAgain: { 'zh-TW': '再來一次', 'zh-CN': '再来一次', en: 'Try Again' },
  viewPrize: { 'zh-TW': '查看獎品', 'zh-CN': '查看奖品', en: 'View Prize' },
  terms: { 'zh-TW': '條款及細則', 'zh-CN': '条款及细则', en: 'Terms & Conditions' },
  prizePool: { 'zh-TW': '獎品池', 'zh-CN': '奖品池', en: 'Prize Pool' },
  probability: { 'zh-TW': '中獎率', 'zh-CN': '中奖率', en: 'Probability' },
  loginRequired: { 'zh-TW': '請先登入', 'zh-CN': '请先登录', en: 'Please login first' },
  loginToDraw: { 'zh-TW': '登入後即可參與抽獎', 'zh-CN': '登录后即可参与抽奖', en: 'Login to participate in lottery' },
  login: { 'zh-TW': '立即登入', 'zh-CN': '立即登录', en: 'Login Now' },
};

interface LotteryData {
  id: string;
  title: Record<Locale, string>;
  desc: Record<Locale, string>;
  endDate: string;
  color: string;
  stampCost: number; // Stamps required per draw
  prizes: {
    level: string;
    name: Record<Locale, string>;
    value: string;
    probability: number;
    icon: string;
    stampReward?: number; // For stamp rewards
  }[];
}

const lotteriesData: Record<string, LotteryData> = {
  ld1: {
    id: 'ld1',
    title: { 'zh-TW': '印花幸運轉盤', 'zh-CN': '印花幸运转盘', en: 'Lucky Stamp Wheel' },
    desc: { 'zh-TW': '消耗100印花抽獎，贏取豐富獎品！', 'zh-CN': '消耗100印花抽奖，赢取丰富奖品！', en: 'Spend 100 stamps to draw and win prizes!' },
    endDate: '2026-06-30',
    color: '#C62828',
    stampCost: 100,
    prizes: [
      { level: 'grandPrize', name: { 'zh-TW': '商場現金券 HK$500', 'zh-CN': '商场现金券 HK$500', en: 'Mall Voucher HK$500' }, value: 'HK$500', probability: 1, icon: '🎟️' },
      { level: 'secondPrize', name: { 'zh-TW': '商場現金券 HK$100', 'zh-CN': '商场现金券 HK$100', en: 'Mall Voucher HK$100' }, value: 'HK$100', probability: 5, icon: '💳' },
      { level: 'thirdPrize', name: { 'zh-TW': '200 印花', 'zh-CN': '200 印花', en: '200 Stamps' }, value: '200', probability: 15, icon: '✨', stampReward: 200 },
      { level: 'consolationPrize', name: { 'zh-TW': '50 印花', 'zh-CN': '50 印花', en: '50 Stamps' }, value: '50', probability: 79, icon: '⭐', stampReward: 50 },
    ],
  },
  ld2: {
    id: 'ld2',
    title: { 'zh-TW': '新春黃金大抽獎', 'zh-CN': '新春黄金大抽奖', en: 'Spring Golden Draw' },
    desc: { 'zh-TW': '消耗500印花抽大獎！獎品更豐富！', 'zh-CN': '消耗500印花抽大奖！奖品更丰富！', en: 'Spend 500 stamps for bigger prizes!' },
    endDate: '2026-04-30',
    color: '#6A1B9A',
    stampCost: 500,
    prizes: [
      { level: 'grandPrize', name: { 'zh-TW': 'Apple iPad Air', 'zh-CN': 'Apple iPad Air', en: 'Apple iPad Air' }, value: 'HK$5,000', probability: 0.5, icon: '📱' },
      { level: 'secondPrize', name: { 'zh-TW': '商場現金券 HK$1,000', 'zh-CN': '商场现金券 HK$1,000', en: 'Mall Voucher HK$1,000' }, value: 'HK$1,000', probability: 3, icon: '🎟️' },
      { level: 'thirdPrize', name: { 'zh-TW': '1,000 印花', 'zh-CN': '1,000 印花', en: '1,000 Stamps' }, value: '1,000', probability: 15, icon: '🌟', stampReward: 1000 },
      { level: 'consolationPrize', name: { 'zh-TW': '200 印花', 'zh-CN': '200 印花', en: '200 Stamps' }, value: '200', probability: 81.5, icon: '✨', stampReward: 200 },
    ],
  },
  ld3: {
    id: 'ld3',
    title: { 'zh-TW': '週年慶鑽石抽獎', 'zh-CN': '周年庆钻石抽奖', en: 'Anniversary Diamond Draw' },
    desc: { 'zh-TW': '消耗1000印花贏取終極豪禮！', 'zh-CN': '消耗1000印花赢取终极豪礼！', en: 'Spend 1000 stamps for ultimate prizes!' },
    endDate: '2026-12-31',
    color: '#00695C',
    stampCost: 1000,
    prizes: [
      { level: 'grandPrize', name: { 'zh-TW': '日本來回機票 + 酒店', 'zh-CN': '日本来回机票 + 酒店', en: 'Japan Round Trip + Hotel' }, value: 'HK$15,000', probability: 1, icon: '✈️' },
      { level: 'secondPrize', name: { 'zh-TW': 'Apple iPhone 16', 'zh-CN': 'Apple iPhone 16', en: 'Apple iPhone 16' }, value: 'HK$8,000', probability: 2, icon: '📱' },
      { level: 'thirdPrize', name: { 'zh-TW': '商場現金券 HK$2,000', 'zh-CN': '商场现金券 HK$2,000', en: 'Mall Voucher HK$2,000' }, value: 'HK$2,000', probability: 5, icon: '🎟️' },
      { level: 'consolationPrize', name: { 'zh-TW': '500 印花', 'zh-CN': '500 印花', en: '500 Stamps' }, value: '500', probability: 92, icon: '⭐', stampReward: 500 },
    ],
  },
};

// Get user's lottery history from localStorage
const getUserLotteryHistory = () => {
  try {
    return JSON.parse(localStorage.getItem('lotteryHistory') || '{}');
  } catch {
    return {};
  }
};

// Save lottery history to localStorage
const saveLotteryHistory = (lotteryId: string, historyEntry: { date: string; prize: string; name: Record<Locale, string> }) => {
  const history = getUserLotteryHistory();
  if (!history[lotteryId]) {
    history[lotteryId] = [];
  }
  history[lotteryId].unshift(historyEntry);
  localStorage.setItem('lotteryHistory', JSON.stringify(history));
  return history;
};

export default function LotteryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const locale = useSettingsStore((s) => s.locale);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [isDrawing, setIsDrawing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [wonPrize, setWonPrize] = useState<LotteryData['prizes'][0] | null>(null);
  const [lotteryHistory, setLotteryHistory] = useState(getUserLotteryHistory);
  const [showTerms, setShowTerms] = useState(false);

  const t = (key: string) => labels[key]?.[locale] || labels[key]?.['zh-TW'] || key;

  const lottery = lotteriesData[id || 'ld1'];
  const stampBalance = user?.stampBalance || 0;
  const hasEnoughStamps = stampBalance >= (lottery?.stampCost || 0);
  const currentHistory = lotteryHistory[id || 'ld1'] || [];

  const localizedPrizes = useMemo(() => lottery?.prizes.map(p => ({
    ...p,
    levelName: t(p.level),
    localizedName: p.name[locale],
  })) || [], [lottery?.prizes, locale, t]);

  const localizedHistory = useMemo(() => currentHistory.map((h: { date: string; prize: string; name: Record<Locale, string> }) => ({
    ...h,
    localizedName: h.name[locale],
  })), [currentHistory, locale]);

  // Simulate lottery draw with weighted probability
  const doDraw = useCallback(() => {
    const random = Math.random() * 100;
    let cumulative = 0;
    for (const prize of lottery.prizes) {
      cumulative += prize.probability;
      if (random <= cumulative) {
        return prize;
      }
    }
    return lottery.prizes[lottery.prizes.length - 1];
  }, [lottery.prizes]);

  const handleDraw = async () => {
    if (!isAuthenticated) {
      Toast.show({ content: t('loginRequired'), icon: 'fail' });
      return;
    }

    if (!hasEnoughStamps) {
      Toast.show({ content: `${t('notEnoughStamps')} - ${t('needMoreStamps')} ${lottery.stampCost - stampBalance} ${t('stamps')}`, icon: 'fail' });
      return;
    }

    setIsDrawing(true);

    // First, deduct the stamp cost
    const newStampBalance = stampBalance - lottery.stampCost;
    setUser({
      ...user,
      stampBalance: newStampBalance,
    });

    // Simulate animation delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    const prize = doDraw();
    setWonPrize(prize);
    setIsDrawing(false);
    setShowResult(true);

    // Save to history
    const historyEntry = { date: new Date().toISOString().split('T')[0], prize: prize.level, name: prize.name };
    const updatedHistory = saveLotteryHistory(id || 'ld1', historyEntry);
    setLotteryHistory(updatedHistory);

    // If won stamps, add to user balance
    if (prize.stampReward) {
      setUser({
        ...user,
        stampBalance: newStampBalance + prize.stampReward,
      });
      Toast.show({ content: `+${prize.stampReward} ${t('stamps')}`, icon: 'success' });
    }
  };

  if (!lottery) {
    return <div style={{ padding: 20, textAlign: 'center' }}>Lottery not found</div>;
  }

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', paddingBottom: 100 }}>
      {/* Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${lottery.color} 0%, ${lottery.color}CC 100%)`,
          padding: '16px 16px 100px',
          color: '#fff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <LeftOutline fontSize={20} onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} />
          <span style={{ fontSize: 17, fontWeight: 600 }}>{t('lotteryDetails')}</span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{lottery.title[locale]}</div>
          <div style={{ fontSize: 14, opacity: 0.9 }}>{lottery.desc[locale]}</div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
            {t('validPeriod')}: {lottery.endDate}
          </div>
        </div>
      </div>

      {/* Draw Section */}
      <div style={{ margin: '-80px 16px 0', position: 'relative', zIndex: 1 }}>
        <Card style={{ borderRadius: 16, padding: 20 }}>
          {/* Lottery Wheel Animation */}
          <div style={{
            width: 200, height: 200, margin: '0 auto 20px',
            borderRadius: '50%',
            background: isDrawing
              ? `conic-gradient(${lottery.color}, ${GOLD}, ${lottery.color}, ${GOLD}, ${lottery.color})`
              : `linear-gradient(135deg, ${lottery.color}20, ${GOLD}20)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: isDrawing ? 'spin 0.5s linear infinite' : 'none',
            border: `4px solid ${lottery.color}`,
            boxShadow: isDrawing ? `0 0 30px ${lottery.color}80` : '0 4px 20px rgba(0,0,0,0.1)',
          }}>
            <div style={{
              width: 150, height: 150,
              borderRadius: '50%',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}>
              <div style={{ fontSize: 40 }}>{isDrawing ? '🎰' : '🎁'}</div>
              <div style={{ fontSize: 14, color: '#666', marginTop: 8 }}>
                {isDrawing ? t('drawing') : t('drawNow')}
              </div>
            </div>
          </div>

          {/* Stamp Balance and Cost Display */}
          <div style={{
            display: 'flex',
            gap: 12,
            marginBottom: 16,
          }}>
            <div style={{
              flex: 1,
              background: `${lottery.color}10`,
              borderRadius: 12,
              padding: 16,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 12, color: '#666' }}>{t('myStamps')}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: hasEnoughStamps ? lottery.color : '#ff4d4f' }}>
                {isAuthenticated ? stampBalance.toLocaleString() : '--'}
              </div>
            </div>
            <div style={{
              flex: 1,
              background: `${GOLD}20`,
              borderRadius: 12,
              padding: 16,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 12, color: '#666' }}>{t('stampCost')}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: GOLD }}>
                {lottery.stampCost.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Progress indicator */}
          {isAuthenticated && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: '#666' }}>{t('stamps')}</span>
                <span style={{ fontSize: 12, color: hasEnoughStamps ? '#52c41a' : '#ff4d4f' }}>
                  {hasEnoughStamps ? '✓' : `${t('needMoreStamps')} ${lottery.stampCost - stampBalance}`}
                </span>
              </div>
              <ProgressBar
                percent={Math.min((stampBalance / lottery.stampCost) * 100, 100)}
                style={{
                  '--fill-color': hasEnoughStamps ? '#52c41a' : '#ff4d4f',
                  '--track-color': '#e0e0e0',
                  '--track-width': '8px',
                } as React.CSSProperties}
              />
            </div>
          )}

          {/* Draw Button */}
          {isAuthenticated ? (
            <Button
              block
              color="primary"
              size="large"
              onClick={handleDraw}
              disabled={!hasEnoughStamps || isDrawing}
              style={{
                '--background-color': hasEnoughStamps ? lottery.color : '#ccc',
                '--border-color': hasEnoughStamps ? lottery.color : '#ccc',
                borderRadius: 12,
                height: 50,
                fontSize: 17,
                fontWeight: 600,
              } as React.CSSProperties}
            >
              {isDrawing ? t('drawing') : hasEnoughStamps ? `${t('drawNow')} (-${lottery.stampCost} ${t('stamps')})` : t('notEnoughStamps')}
            </Button>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>{t('loginToDraw')}</div>
              <Button
                block
                color="primary"
                size="large"
                onClick={() => navigate('/login')}
                style={{
                  '--background-color': lottery.color,
                  borderRadius: 12,
                  height: 50,
                  fontSize: 17,
                  fontWeight: 600,
                } as React.CSSProperties}
              >
                {t('login')}
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Prize Pool */}
      <div style={{ padding: '16px' }}>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>{t('prizePool')}</div>
        <Card style={{ borderRadius: 12 }}>
          {localizedPrizes.map((prize, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: idx < localizedPrizes.length - 1 ? '1px solid #f0f0f0' : 'none',
              }}
            >
              <div style={{
                width: 48, height: 48,
                borderRadius: 12,
                background: idx === 0 ? `linear-gradient(135deg, ${GOLD}, #FFD700)` : '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                marginRight: 12,
              }}>
                {prize.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Tag
                    color={idx === 0 ? 'warning' : idx === 1 ? 'primary' : idx === 2 ? 'success' : 'default'}
                    style={{ fontSize: 10 }}
                  >
                    {prize.levelName}
                  </Tag>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{prize.localizedName}</span>
                </div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                  {t('probability')}: {prize.probability}%
                </div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: lottery.color }}>
                {prize.value}
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* How It Works */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>{t('howItWorks')}</div>
        <Card style={{ borderRadius: 12 }}>
          <List style={{ '--border-top': 'none', '--border-bottom': 'none' }}>
            <List.Item prefix={<span style={{ fontSize: 20 }}>🎫</span>}>{t('spendStamps')}: {lottery.stampCost} {t('stamps')}</List.Item>
            <List.Item prefix={<span style={{ fontSize: 20 }}>♾️</span>}>{t('unlimitedDraws')}</List.Item>
          </List>
        </Card>
      </div>

      {/* Draw History */}
      {localizedHistory.length > 0 && (
        <div style={{ padding: '16px' }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>{t('drawHistory')}</div>
          <Card style={{ borderRadius: 12 }}>
            {localizedHistory.map((h, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: idx < localizedHistory.length - 1 ? '1px solid #f0f0f0' : 'none',
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{h.localizedName}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>{h.date}</div>
                </div>
                <Tag color={h.prize === 'grandPrize' ? 'warning' : h.prize === 'secondPrize' ? 'primary' : 'default'}>
                  {t(h.prize)}
                </Tag>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* Terms Link */}
      <div style={{ padding: '0 16px 16px', textAlign: 'center' }}>
        <span
          onClick={() => setShowTerms(true)}
          style={{ fontSize: 13, color: PRIMARY, cursor: 'pointer' }}
        >
          {t('terms')}
        </span>
      </div>

      {/* Result Popup */}
      <Popup
        visible={showResult}
        onMaskClick={() => setShowResult(false)}
        bodyStyle={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
      >
        <div style={{ padding: 32, textAlign: 'center' }}>
          <div style={{
            width: 120, height: 120,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${lottery.color}20, ${GOLD}20)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 60,
            margin: '0 auto 20px',
          }}>
            {wonPrize?.icon || '🎁'}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: lottery.color, marginBottom: 8 }}>
            {t('congratulations')}
          </div>
          <div style={{ fontSize: 16, color: '#333', marginBottom: 4 }}>{t('youWon')}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: GOLD, marginBottom: 8 }}>
            {wonPrize?.name[locale]}
          </div>
          <Tag color={wonPrize?.level === 'grandPrize' ? 'warning' : wonPrize?.level === 'secondPrize' ? 'primary' : 'default'}>
            {wonPrize ? t(wonPrize.level) : ''}
          </Tag>

          <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
            <Button
              block
              onClick={() => setShowResult(false)}
              style={{ '--border-color': lottery.color, '--text-color': lottery.color, borderRadius: 12 } as React.CSSProperties}
            >
              {hasEnoughStamps ? t('tryAgain') : t('back')}
            </Button>
            <Button
              block
              color="primary"
              onClick={() => { setShowResult(false); navigate('/offers'); }}
              style={{ '--background-color': lottery.color, borderRadius: 12 } as React.CSSProperties}
            >
              {t('viewPrize')}
            </Button>
          </div>
        </div>
      </Popup>

      {/* Terms Popup */}
      <Popup
        visible={showTerms}
        onMaskClick={() => setShowTerms(false)}
        bodyStyle={{ borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70vh', overflow: 'auto' }}
      >
        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>{t('terms')}</div>
          <div style={{ fontSize: 14, color: '#666', lineHeight: 1.8 }}>
            {locale === 'en' ? (
              <>
                <p>1. This promotion is organized by Link REIT.</p>
                <p>2. Each member can participate up to 5 times during the promotion period.</p>
                <p>3. Spend HK$300 or above to earn 1 draw chance.</p>
                <p>4. Prizes must be redeemed within 30 days of winning.</p>
                <p>5. Prizes cannot be exchanged for cash or other items.</p>
                <p>6. Link REIT reserves the right to modify or terminate this promotion at any time.</p>
                <p>7. In case of dispute, the decision of Link REIT shall be final.</p>
              </>
            ) : locale === 'zh-CN' ? (
              <>
                <p>1. 本推广活动由领展房产基金主办。</p>
                <p>2. 推广期内每位会员最多可参加5次。</p>
                <p>3. 消费满HK$300即可获得1次抽奖机会。</p>
                <p>4. 奖品须于中奖后30天内领取。</p>
                <p>5. 奖品不可兑换现金或其他物品。</p>
                <p>6. 领展房产基金保留随时修改或终止此推广活动的权利。</p>
                <p>7. 如有任何争议，领展房产基金保留最终决定权。</p>
              </>
            ) : (
              <>
                <p>1. 本推廣活動由領展房產基金主辦。</p>
                <p>2. 推廣期內每位會員最多可參加5次。</p>
                <p>3. 消費滿HK$300即可獲得1次抽獎機會。</p>
                <p>4. 獎品須於中獎後30天內領取。</p>
                <p>5. 獎品不可兌換現金或其他物品。</p>
                <p>6. 領展房產基金保留隨時修改或終止此推廣活動的權利。</p>
                <p>7. 如有任何爭議，領展房產基金保留最終決定權。</p>
              </>
            )}
          </div>
        </div>
      </Popup>

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
