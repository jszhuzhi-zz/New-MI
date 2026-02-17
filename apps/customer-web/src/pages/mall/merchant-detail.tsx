import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NavBar, Card, List, Tag, Button, Divider, Empty } from 'antd-mobile';
import { merchants, getMallById } from '../../data/malls';
import { useSettingsStore, type Locale } from '../../store/settings';
import { useTranslation } from '../../locales';

const GOLD = '#C4A962';

export default function MerchantDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t, locale } = useTranslation();
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();

  // Find merchant by id
  const merchant = merchants.find((m) => m.id === id);
  const mall = merchant ? getMallById(merchant.mallId) : null;

  const labels = useMemo(() => ({
    merchantDetail: { 'zh-TW': '商戶詳情', 'zh-CN': '商户详情', en: 'Merchant Details' },
    notFound: { 'zh-TW': '找不到該商戶', 'zh-CN': '找不到该商户', en: 'Merchant not found' },
    welcome: { 'zh-TW': '歡迎光臨', 'zh-CN': '欢迎光临', en: 'Welcome to' },
    locatedAt: { 'zh-TW': '，位於', 'zh-CN': '，位于', en: ', located at' },
    floor: { 'zh-TW': '層', 'zh-CN': '层', en: 'Floor' },
    earnBonus: { 'zh-TW': '消費可享', 'zh-CN': '消费可享', en: 'Earn' },
    timesStamp: { 'zh-TW': '倍印花獎賞！', 'zh-CN': '倍印花奖赏！', en: 'x stamp rewards!' },
    mall: { 'zh-TW': '所屬商場', 'zh-CN': '所属商场', en: 'Mall' },
    location: { 'zh-TW': '位置', 'zh-CN': '位置', en: 'Location' },
    hours: { 'zh-TW': '營業時間', 'zh-CN': '营业时间', en: 'Hours' },
    phone: { 'zh-TW': '聯絡電話', 'zh-CN': '联系电话', en: 'Phone' },
    stampReward: { 'zh-TW': '印花獎賞', 'zh-CN': '印花奖赏', en: 'Stamp Reward' },
    stamps: { 'zh-TW': '印花', 'zh-CN': '印花', en: 'Stamps' },
    notApplicable: { 'zh-TW': '不適用', 'zh-CN': '不适用', en: 'N/A' },
    scanForStamp: { 'zh-TW': '掃碼換印花', 'zh-CN': '扫码换印花', en: 'Scan for Stamps' },
    addToFavorites: { 'zh-TW': '收藏商戶', 'zh-CN': '收藏商户', en: 'Add to Favorites' },
  }), []);

  if (!merchant || !mall) {
    return (
      <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
        <NavBar onBack={() => navigate(-1)} style={{ background: '#fff' }}>
          {labels.merchantDetail[locale]}
        </NavBar>
        <div style={{ padding: 40 }}>
          <Empty description={labels.notFound[locale]} />
        </div>
      </div>
    );
  }

  // Get localized names
  const merchantName = locale === 'en' ? merchant.name : (merchant.nameTW || merchant.name);
  const mallName = locale === 'en' ? mall.nameEN : mall.nameTW;

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <NavBar onBack={() => navigate(-1)} style={{ background: '#fff' }}>
        {labels.merchantDetail[locale]}
      </NavBar>

      {/* Hero */}
      <div
        style={{
          height: 160,
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#fff',
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 8 }}>🏪</div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>{merchantName}</div>
        {locale !== 'en' && merchant.nameTW && (
          <div style={{ fontSize: 14, opacity: 0.7, marginTop: 2 }}>{merchant.name}</div>
        )}
      </div>

      {/* Tags */}
      <div style={{ padding: '12px 16px 0', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <Tag color="primary" fill="outline" style={{ '--border-color': colors.primary, '--text-color': colors.primary } as React.CSSProperties}>
          {merchant.category}
        </Tag>
        {merchant.stampMultiplier > 0 && (
          <Tag style={{ '--background-color': `${GOLD}22`, '--text-color': GOLD } as React.CSSProperties}>
            {labels.stamps[locale]} x{merchant.stampMultiplier}
          </Tag>
        )}
        {merchant.tags.slice(0, 4).map((tag: string) => (
          <Tag key={tag} style={{ '--background-color': '#f0f0f0', '--text-color': '#666' } as React.CSSProperties}>
            {tag}
          </Tag>
        ))}
      </div>

      {/* Info */}
      <div style={{ padding: 16 }}>
        <Card style={{ borderRadius: 12 }}>
          <div style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 12 }}>
            {labels.welcome[locale]} {merchantName}{labels.locatedAt[locale]} {mallName} {merchant.floor} - {merchant.unit}。
            {merchant.stampMultiplier > 1 && (
              <span style={{ color: GOLD }}> {labels.earnBonus[locale]} {merchant.stampMultiplier} {labels.timesStamp[locale]}</span>
            )}
          </div>
          <Divider />
          <List style={{ '--border-top': 'none', '--border-bottom': 'none' } as React.CSSProperties}>
            <List.Item extra={`${mallName}`}>{labels.mall[locale]}</List.Item>
            <List.Item extra={`${merchant.floor} - ${merchant.unit}`}>{labels.location[locale]}</List.Item>
            <List.Item extra={merchant.hours || '10:00 - 22:00'}>{labels.hours[locale]}</List.Item>
            <List.Item extra={merchant.phone || '-'}>{labels.phone[locale]}</List.Item>
            <List.Item extra={merchant.stampMultiplier > 0 ? `${merchant.stampMultiplier}x ${labels.stamps[locale]}` : labels.notApplicable[locale]}>
              {labels.stampReward[locale]}
            </List.Item>
          </List>
        </Card>
      </div>

      {/* Actions */}
      <div style={{ padding: '0 16px 32px', display: 'flex', gap: 12 }}>
        <Button
          block
          color="primary"
          style={{
            '--background-color': colors.primary,
            '--border-color': colors.primary,
            borderRadius: 12,
            fontWeight: 600,
          } as React.CSSProperties}
          onClick={() => navigate('/scan')}
        >
          {labels.scanForStamp[locale]}
        </Button>
        <Button
          block
          fill="outline"
          style={{
            '--border-color': colors.primary,
            '--text-color': colors.primary,
            borderRadius: 12,
            fontWeight: 600,
          } as React.CSSProperties}
        >
          {labels.addToFavorites[locale]}
        </Button>
      </div>
    </div>
  );
}
