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
  myChances: { 'zh-TW': '我的抽獎次數', 'zh-CN': '我的抽奖次数', en: 'My Draw Chances' },
  remaining: { 'zh-TW': '剩餘', 'zh-CN': '剩余', en: 'Remaining' },
  times: { 'zh-TW': '次', 'zh-CN': '次', en: 'times' },
  drawNow: { 'zh-TW': '立即抽獎', 'zh-CN': '立即抽奖', en: 'Draw Now' },
  drawing: { 'zh-TW': '抽獎中...', 'zh-CN': '抽奖中...', en: 'Drawing...' },
  noChances: { 'zh-TW': '沒有抽獎機會', 'zh-CN': '没有抽奖机会', en: 'No chances left' },
  drawHistory: { 'zh-TW': '抽獎記錄', 'zh-CN': '抽奖记录', en: 'Draw History' },
  noHistory: { 'zh-TW': '暫無抽獎記錄', 'zh-CN': '暂无抽奖记录', en: 'No draw history yet' },
  howToGetChances: { 'zh-TW': '如何獲得抽獎機會', 'zh-CN': '如何获得抽奖机会', en: 'How to Get Chances' },
  spendToEarn: { 'zh-TW': '消費滿 HK$300 獲得 1 次', 'zh-CN': '消费满 HK$300 获得 1 次', en: 'Spend HK$300 to earn 1 chance' },
  maxChances: { 'zh-TW': '每人最多 5 次機會', 'zh-CN': '每人最多 5 次机会', en: 'Max 5 chances per person' },
  validPeriod: { 'zh-TW': '有效期', 'zh-CN': '有效期', en: 'Valid Period' },
  congratulations: { 'zh-TW': '恭喜你！', 'zh-CN': '恭喜你！', en: 'Congratulations!' },
  youWon: { 'zh-TW': '你獲得了', 'zh-CN': '你获得了', en: 'You won' },
  tryAgain: { 'zh-TW': '再來一次', 'zh-CN': '再来一次', en: 'Try Again' },
  viewPrize: { 'zh-TW': '查看獎品', 'zh-CN': '查看奖品', en: 'View Prize' },
  terms: { 'zh-TW': '條款及細則', 'zh-CN': '条款及细则', en: 'Terms & Conditions' },
  prizePool: { 'zh-TW': '獎品池', 'zh-CN': '奖品池', en: 'Prize Pool' },
  probability: { 'zh-TW': '中獎率', 'zh-CN': '中奖率', en: 'Probability' },
};

interface LotteryData {
  id: string;
  title: Record<Locale, string>;
  desc: Record<Locale, string>;
  endDate: string;
  color: string;
  prizes: {
    level: string;
    name: Record<Locale, string>;
    value: string;
    probability: number;
    icon: string;
  }[];
}

const lotteriesData: Record<string, LotteryData> = {
  ld1: {
    id: 'ld1',
    title: { 'zh-TW': '新年幸運大抽獎', 'zh-CN': '新年幸运大抽奖', en: 'New Year Lucky Draw' },
    desc: { 'zh-TW': '消費滿HK$300即可參加，贏取豐富大獎！', 'zh-CN': '消费满HK$300即可参加，赢取丰富大奖！', en: 'Spend HK$300 to join and win amazing prizes!' },
    endDate: '2026-03-15',
    color: '#C62828',
    prizes: [
      { level: 'grandPrize', name: { 'zh-TW': '日本來回機票 + 酒店', 'zh-CN': '日本来回机票 + 酒店', en: 'Japan Round Trip + Hotel' }, value: 'HK$15,000', probability: 0.1, icon: '✈️' },
      { level: 'secondPrize', name: { 'zh-TW': 'Apple iPad Air', 'zh-CN': 'Apple iPad Air', en: 'Apple iPad Air' }, value: 'HK$5,000', probability: 0.5, icon: '📱' },
      { level: 'thirdPrize', name: { 'zh-TW': '商場現金券 HK$500', 'zh-CN': '商场现金券 HK$500', en: 'Mall Voucher HK$500' }, value: 'HK$500', probability: 5, icon: '🎟️' },
      { level: 'consolationPrize', name: { 'zh-TW': '100 印花', 'zh-CN': '100 印花', en: '100 Stamps' }, value: '100 Stamps', probability: 94.4, icon: '⭐' },
    ],
  },
  ld2: {
    id: 'ld2',
    title: { 'zh-TW': '春日驚喜扭蛋機', 'zh-CN': '春日惊喜扭蛋机', en: 'Spring Surprise Gacha' },
    desc: { 'zh-TW': '每次消費可獲得扭蛋機會，最高贏取5,000印花！', 'zh-CN': '每次消费可获得扭蛋机会，最高赢取5,000印花！', en: 'Every purchase gives you a gacha chance. Win up to 5,000 stamps!' },
    endDate: '2026-04-30',
    color: '#6A1B9A',
    prizes: [
      { level: 'grandPrize', name: { 'zh-TW': '5,000 印花', 'zh-CN': '5,000 印花', en: '5,000 Stamps' }, value: '5,000', probability: 0.5, icon: '🌟' },
      { level: 'secondPrize', name: { 'zh-TW': '1,000 印花', 'zh-CN': '1,000 印花', en: '1,000 Stamps' }, value: '1,000', probability: 2, icon: '✨' },
      { level: 'thirdPrize', name: { 'zh-TW': '500 印花', 'zh-CN': '500 印花', en: '500 Stamps' }, value: '500', probability: 10, icon: '💫' },
      { level: 'consolationPrize', name: { 'zh-TW': '50 印花', 'zh-CN': '50 印花', en: '50 Stamps' }, value: '50', probability: 87.5, icon: '⭐' },
    ],
  },
};

// User's lottery data (in real app, this would come from API)
const getUserLotteryData = () => ({
  ld1: { chances: 3, maxChances: 5, history: [
    { date: '2026-02-15', prize: 'consolationPrize', name: { 'zh-TW': '100 印花', 'zh-CN': '100 印花', en: '100 Stamps' } },
    { date: '2026-02-10', prize: 'thirdPrize', name: { 'zh-TW': '商場現金券 HK$500', 'zh-CN': '商场现金券 HK$500', en: 'Mall Voucher HK$500' } },
  ]},
  ld2: { chances: 3, maxChances: 3, history: [] },
});

export default function LotteryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const locale = useSettingsStore((s) => s.locale);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [isDrawing, setIsDrawing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [wonPrize, setWonPrize] = useState<typeof lottery.prizes[0] | null>(null);
  const [userLotteryData, setUserLotteryData] = useState(getUserLotteryData);
  const [showTerms, setShowTerms] = useState(false);

  const t = (key: string) => labels[key]?.[locale] || labels[key]?.['zh-TW'] || key;

  const lottery = lotteriesData[id || 'ld1'];
  const userData = userLotteryData[id as keyof typeof userLotteryData] || { chances: 0, maxChances: 5, history: [] };

  const localizedPrizes = useMemo(() => lottery.prizes.map(p => ({
    ...p,
    levelName: t(p.level),
    name: p.name[locale],
  })), [lottery.prizes, locale, t]);

  const localizedHistory = useMemo(() => userData.history.map(h => ({
    ...h,
    name: h.name[locale],
  })), [userData.history, locale]);

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
    if (userData.chances <= 0) {
      Toast.show({ content: t('noChances'), icon: 'fail' });
      return;
    }

    setIsDrawing(true);

    // Simulate animation delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    const prize = doDraw();
    setWonPrize(prize);
    setIsDrawing(false);
    setShowResult(true);

    // Update user data
    setUserLotteryData(prev => ({
      ...prev,
      [id as string]: {
        ...prev[id as keyof typeof prev],
        chances: prev[id as keyof typeof prev].chances - 1,
        history: [
          { date: new Date().toISOString().split('T')[0], prize: prize.level, name: prize.name },
          ...prev[id as keyof typeof prev].history,
        ],
      },
    }));

    // If won stamps, add to user balance
    if (prize.level === 'consolationPrize' || prize.level === 'thirdPrize') {
      const stampAmount = parseInt(prize.value.replace(/[^0-9]/g, '')) || 0;
      if (stampAmount > 0 && user) {
        setUser({
          ...user,
          stampBalance: (user.stampBalance || 0) + stampAmount,
        });
      }
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

          {/* Chances Display */}
          <div style={{
            background: `${lottery.color}10`,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 13, color: '#666' }}>{t('myChances')}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: lottery.color }}>
              {userData.chances} <span style={{ fontSize: 14, fontWeight: 400 }}>/ {userData.maxChances}</span>
            </div>
            <ProgressBar
              percent={(userData.chances / userData.maxChances) * 100}
              style={{
                '--fill-color': lottery.color,
                '--track-color': '#e0e0e0',
                '--track-width': '8px',
                marginTop: 12,
              } as React.CSSProperties}
            />
          </div>

          {/* Draw Button */}
          <Button
            block
            color="primary"
            size="large"
            onClick={handleDraw}
            disabled={userData.chances <= 0 || isDrawing}
            style={{
              '--background-color': userData.chances > 0 ? lottery.color : '#ccc',
              '--border-color': userData.chances > 0 ? lottery.color : '#ccc',
              borderRadius: 12,
              height: 50,
              fontSize: 17,
              fontWeight: 600,
            } as React.CSSProperties}
          >
            {isDrawing ? t('drawing') : userData.chances > 0 ? t('drawNow') : t('noChances')}
          </Button>
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
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{prize.name}</span>
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

      {/* How to Get Chances */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>{t('howToGetChances')}</div>
        <Card style={{ borderRadius: 12 }}>
          <List style={{ '--border-top': 'none', '--border-bottom': 'none' }}>
            <List.Item prefix={<span style={{ fontSize: 20 }}>💰</span>}>{t('spendToEarn')}</List.Item>
            <List.Item prefix={<span style={{ fontSize: 20 }}>🎯</span>}>{t('maxChances')}</List.Item>
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
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{h.name}</div>
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
              {userData.chances > 0 ? t('tryAgain') : t('back')}
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
