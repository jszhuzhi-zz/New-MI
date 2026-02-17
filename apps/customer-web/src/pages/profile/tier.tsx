import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar, Card, ProgressBar } from 'antd-mobile';
import { CheckCircleFill } from 'antd-mobile-icons';
import { useSettingsStore, type Locale } from '../../store/settings';
import { useTranslation } from '../../locales';

const GOLD = '#C4A962';

interface TierData {
  name: Record<Locale, string>;
  icon: string;
  requiredStamps: number;
  color: string;
  benefits: Record<Locale, string>[];
}

const tiersData: TierData[] = [
  {
    name: { 'zh-TW': '標準', 'zh-CN': '标准', en: 'Standard' },
    icon: '🥉',
    requiredStamps: 0,
    color: '#9E9E9E',
    benefits: [
      { 'zh-TW': '基本印花獲取（每HK$10 = 1印花）', 'zh-CN': '基本印花获取（每HK$10 = 1印花）', en: 'Basic stamp earning (HK$10 = 1 stamp)' },
      { 'zh-TW': '生日月份印花獎賞', 'zh-CN': '生日月份印花奖赏', en: 'Birthday month stamp rewards' },
      { 'zh-TW': '電子優惠券', 'zh-CN': '电子优惠券', en: 'Digital coupons' },
    ],
  },
  {
    name: { 'zh-TW': '銀卡', 'zh-CN': '银卡', en: 'Silver' },
    icon: '🥈',
    requiredStamps: 500,
    color: '#78909C',
    benefits: [
      { 'zh-TW': '印花獲取 1.2 倍', 'zh-CN': '印花获取 1.2 倍', en: '1.2x stamp earning' },
      { 'zh-TW': '生日月份雙倍印花', 'zh-CN': '生日月份双倍印花', en: 'Double stamps in birthday month' },
      { 'zh-TW': '優先參加活動', 'zh-CN': '优先参加活动', en: 'Priority event access' },
      { 'zh-TW': '每月免費泊車1次', 'zh-CN': '每月免费停车1次', en: '1 free parking per month' },
    ],
  },
  {
    name: { 'zh-TW': '金卡', 'zh-CN': '金卡', en: 'Gold' },
    icon: '🥇',
    requiredStamps: 2000,
    color: GOLD,
    benefits: [
      { 'zh-TW': '印花獲取 1.5 倍', 'zh-CN': '印花获取 1.5 倍', en: '1.5x stamp earning' },
      { 'zh-TW': '生日月份三倍印花', 'zh-CN': '生日月份三倍印花', en: 'Triple stamps in birthday month' },
      { 'zh-TW': '專屬活動邀請', 'zh-CN': '专属活动邀请', en: 'Exclusive event invitations' },
      { 'zh-TW': '每月免費泊車2次', 'zh-CN': '每月免费停车2次', en: '2 free parking per month' },
      { 'zh-TW': '季度禮品贈送', 'zh-CN': '季度礼品赠送', en: 'Quarterly gifts' },
    ],
  },
  {
    name: { 'zh-TW': '白金', 'zh-CN': '白金', en: 'Platinum' },
    icon: '💎',
    requiredStamps: 4000,
    color: '#5C6BC0',
    benefits: [
      { 'zh-TW': '印花獲取 2 倍', 'zh-CN': '印花获取 2 倍', en: '2x stamp earning' },
      { 'zh-TW': '生日月份三倍印花', 'zh-CN': '生日月份三倍印花', en: 'Triple stamps in birthday month' },
      { 'zh-TW': 'VIP專屬活動', 'zh-CN': 'VIP专属活动', en: 'VIP exclusive events' },
      { 'zh-TW': '每月免費泊車4次', 'zh-CN': '每月免费停车4次', en: '4 free parking per month' },
      { 'zh-TW': '季度禮品贈送', 'zh-CN': '季度礼品赠送', en: 'Quarterly gifts' },
      { 'zh-TW': '專屬客服通道', 'zh-CN': '专属客服通道', en: 'Dedicated customer service' },
    ],
  },
  {
    name: { 'zh-TW': '鑽石', 'zh-CN': '钻石', en: 'Diamond' },
    icon: '👑',
    requiredStamps: 8000,
    color: '#AB47BC',
    benefits: [
      { 'zh-TW': '印花獲取 3 倍', 'zh-CN': '印花获取 3 倍', en: '3x stamp earning' },
      { 'zh-TW': '全年生日禮遇', 'zh-CN': '全年生日礼遇', en: 'Year-round birthday privileges' },
      { 'zh-TW': '至尊VIP活動', 'zh-CN': '至尊VIP活动', en: 'Premium VIP events' },
      { 'zh-TW': '無限免費泊車', 'zh-CN': '无限免费停车', en: 'Unlimited free parking' },
      { 'zh-TW': '每月精選禮品', 'zh-CN': '每月精选礼品', en: 'Monthly premium gifts' },
      { 'zh-TW': '專屬客服經理', 'zh-CN': '专属客服经理', en: 'Personal account manager' },
      { 'zh-TW': '貴賓室使用權', 'zh-CN': '贵宾室使用权', en: 'VIP lounge access' },
    ],
  },
];

const currentTierIndex = 2; // Gold

export default function TierPage() {
  const navigate = useNavigate();
  const { t, locale } = useTranslation();
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();

  const tiers = useMemo(() => {
    return tiersData.map((tier) => ({
      ...tier,
      localizedName: tier.name[locale],
      localizedBenefits: tier.benefits.map((b) => b[locale]),
    }));
  }, [locale]);

  const tierLabels = {
    myTier: { 'zh-TW': '我的等級', 'zh-CN': '我的等级', en: 'My Tier' },
    currentTier: { 'zh-TW': '當前會員等級', 'zh-CN': '当前会员等级', en: 'Current Member Tier' },
    currentLabel: { 'zh-TW': '目前等級', 'zh-CN': '目前等级', en: 'Current' },
    allTiers: { 'zh-TW': '全部等級', 'zh-CN': '全部等级', en: 'All Tiers' },
    benefits: { 'zh-TW': '會員權益', 'zh-CN': '会员权益', en: 'Benefits' },
    baseLevel: { 'zh-TW': '基礎等級', 'zh-CN': '基础等级', en: 'Base Tier' },
    requiredStamps: { 'zh-TW': '需累計', 'zh-CN': '需累计', en: 'Requires' },
    stamps: { 'zh-TW': '印花', 'zh-CN': '印花', en: 'stamps' },
    accumulated: { 'zh-TW': '累計印花', 'zh-CN': '累计印花', en: 'Accumulated' },
    needMore: { 'zh-TW': '距離升級還需', 'zh-CN': '距离升级还需', en: 'Need more' },
    toUpgrade: { 'zh-TW': '', 'zh-CN': '', en: 'to upgrade' },
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <NavBar onBack={() => navigate(-1)} style={{ background: '#fff' }}>
        {tierLabels.myTier[locale]}
      </NavBar>

      {/* Current Tier */}
      <div
        style={{
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
          padding: '24px 20px 32px',
          color: '#fff',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 48 }}>{tiers[currentTierIndex].icon}</div>
        <div style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>
          {tiers[currentTierIndex].localizedName}
        </div>
        <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>{tierLabels.currentTier[locale]}</div>

        {/* Progress to next */}
        <div
          style={{
            background: 'rgba(255,255,255,0.12)',
            borderRadius: 12,
            padding: '14px 16px',
            marginTop: 20,
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
            <span>{tiers[currentTierIndex].icon} {tiers[currentTierIndex].localizedName}</span>
            <span>{tiers[currentTierIndex + 1].icon} {tiers[currentTierIndex + 1].localizedName}</span>
          </div>
          <ProgressBar
            percent={64.5}
            style={{
              '--fill-color': GOLD,
              '--track-color': 'rgba(255,255,255,0.2)',
              '--track-width': '8px',
            } as React.CSSProperties}
          />
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8, textAlign: 'center' }}>
            {tierLabels.accumulated[locale]} 2,580 / 4,000 · {tierLabels.needMore[locale]} <span style={{ color: GOLD, fontWeight: 700 }}>1,420</span> {tierLabels.stamps[locale]} {tierLabels.toUpgrade[locale]}
          </div>
        </div>
      </div>

      {/* All Tiers */}
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#333', marginBottom: 12 }}>
          {tierLabels.allTiers[locale]}
        </div>
        {tiers.map((tier, i) => {
          const isCurrent = i === currentTierIndex;
          const isAchieved = i <= currentTierIndex;
          return (
            <Card
              key={i}
              style={{
                marginBottom: 12,
                borderRadius: 12,
                border: isCurrent ? `2px solid ${GOLD}` : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 32 }}>{tier.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 17, fontWeight: 700, color: '#333' }}>
                      {tier.localizedName}
                    </span>
                    {isCurrent && (
                      <span
                        style={{
                          background: GOLD,
                          color: '#fff',
                          padding: '1px 8px',
                          borderRadius: 8,
                          fontSize: 11,
                        }}
                      >
                        {tierLabels.currentLabel[locale]}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                    {tier.requiredStamps === 0
                      ? tierLabels.baseLevel[locale]
                      : `${tierLabels.requiredStamps[locale]} ${tier.requiredStamps.toLocaleString()} ${tierLabels.stamps[locale]}`}
                  </div>
                </div>
                {isAchieved && <CheckCircleFill style={{ color: colors.primary, fontSize: 20 }} />}
              </div>

              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#666', marginBottom: 6 }}>
                  {tierLabels.benefits[locale]}
                </div>
                {tier.localizedBenefits.map((benefit, j) => (
                  <div
                    key={j}
                    style={{
                      fontSize: 13,
                      color: '#666',
                      marginBottom: 4,
                      display: 'flex',
                      gap: 6,
                      alignItems: 'flex-start',
                    }}
                  >
                    <span style={{ color: isAchieved ? colors.primary : '#ccc' }}>✓</span>
                    <span style={{ color: isAchieved ? '#333' : '#999' }}>{benefit}</span>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
