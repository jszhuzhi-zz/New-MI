import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NavBar, Card, List, Tag, Button, Divider, Toast, Image, Swiper, Modal, ProgressBar } from 'antd-mobile';
import { HeartOutline, HeartFill, SendOutline, ClockCircleOutline, LocationFill, GiftOutline } from 'antd-mobile-icons';
import { useTranslation } from '../../locales';
import { useSettingsStore, type Locale } from '../../store/settings';

const PRIMARY = '#00694B';

interface CampaignData {
  id: string;
  title: Record<Locale, string>;
  mall: Record<Locale, string>;
  date: Record<Locale, string>;
  dateRange: { start: string; end: string };
  type: Record<Locale, string>;
  color: string;
  image: string;
  desc: Record<Locale, string>;
  fullDesc: Record<Locale, string>;
  rules: Record<Locale, string[]>;
  howTo: { step: Record<Locale, string>; icon: string }[];
  rewards: { name: Record<Locale, string>; stamps: number; quota: number; remaining: number }[];
  participating: number;
  maxParticipants: number;
  merchants: string[];
  tags: Record<Locale, string[]>;
  isJoined?: boolean;
}

interface Campaign {
  id: string;
  title: string;
  mall: string;
  date: string;
  dateRange: { start: string; end: string };
  type: string;
  color: string;
  image: string;
  desc: string;
  fullDesc: string;
  rules: string[];
  howTo: { step: string; icon: string }[];
  rewards: { name: string; stamps: number; quota: number; remaining: number }[];
  participating: number;
  maxParticipants: number;
  merchants: string[];
  tags: string[];
  isJoined?: boolean;
}

const campaignDataSource: Record<string, CampaignData> = {
  c1: {
    id: 'c1',
    title: { 'zh-TW': '新春印花三倍賞', 'zh-CN': '新春印花三倍赏', en: 'Triple Stamps for CNY' },
    mall: { 'zh-TW': '又一城 Festival Walk', 'zh-CN': '又一城 Festival Walk', en: 'Festival Walk' },
    date: { 'zh-TW': '2026.01.15 - 2026.02.28', 'zh-CN': '2026.01.15 - 2026.02.28', en: 'Jan 15 - Feb 28, 2026' },
    dateRange: { start: '2026-01-15', end: '2026-02-28' },
    type: { 'zh-TW': '印花加倍', 'zh-CN': '印花加倍', en: 'Stamp Multiplier' },
    color: '#C62828',
    image: 'https://images.unsplash.com/photo-1549451371-64aa98a6f660?w=800&q=80',
    desc: { 'zh-TW': '農曆新年期間所有消費可獲三倍印花獎賞', 'zh-CN': '农历新年期间所有消费可获三倍印花奖赏', en: 'Earn triple stamps on all purchases during Chinese New Year' },
    fullDesc: { 'zh-TW': '農曆新年期間於又一城購物，所有消費均可獲得三倍印花獎賞！無論是年貨採購、新衣添置還是賀年美食，每一筆消費都能讓您更快累積印花，輕鬆升級會員等級。金卡及以上會員更可享額外獎賞！', 'zh-CN': '农历新年期间于又一城购物，所有消费均可获得三倍印花奖赏！无论是年货采购、新衣添置还是贺年美食，每一笔消费都能让您更快累积印花，轻松升级会员等级。金卡及以上会员更可享额外奖赏！', en: 'Shop at Festival Walk during Chinese New Year and earn triple stamps on all purchases! Whether you\'re shopping for festive goods, new clothes, or delicious food, every purchase helps you accumulate stamps faster and upgrade your membership tier. Gold members and above enjoy extra rewards!' },
    rules: {
      'zh-TW': ['活動期間於又一城任何商戶消費即可享三倍印花', '每筆消費最少滿HK$50方可參加', '印花將於消費後48小時內存入帳戶', '每位會員每日最多可獲取3,000印花', '本活動不可與其他印花加倍活動同時使用', '金卡及以上會員可享額外10%印花獎勵', '領展保留最終決定權及解釋權'],
      'zh-CN': ['活动期间于又一城任何商户消费即可享三倍印花', '每笔消费最少满HK$50方可参加', '印花将于消费后48小时内存入账户', '每位会员每日最多可获取3,000印花', '本活动不可与其他印花加倍活动同时使用', '金卡及以上会员可享额外10%印花奖励', '领展保留最终决定权及解释权'],
      en: ['Earn triple stamps at any merchant in Festival Walk during the campaign', 'Minimum spend of HK$50 per transaction required', 'Stamps will be credited within 48 hours after purchase', 'Maximum 3,000 stamps per member per day', 'Cannot be combined with other stamp multiplier promotions', 'Gold members and above enjoy extra 10% stamp bonus', 'Link reserves the right of final decision and interpretation'],
    },
    howTo: [
      { step: { 'zh-TW': '於又一城商戶消費後保留收據', 'zh-CN': '于又一城商户消费后保留收据', en: 'Keep your receipt after shopping at Festival Walk' }, icon: '🧾' },
      { step: { 'zh-TW': '打開 Link Mall App 點擊「掃碼」', 'zh-CN': '打开 Link Mall App 点击「扫码」', en: 'Open Link Mall App and tap "Scan"' }, icon: '📱' },
      { step: { 'zh-TW': '掃描收據上的二維碼', 'zh-CN': '扫描收据上的二维码', en: 'Scan the QR code on your receipt' }, icon: '📷' },
      { step: { 'zh-TW': '系統自動計算三倍印花並存入帳戶', 'zh-CN': '系统自动计算三倍印花并存入账户', en: 'System automatically calculates and credits triple stamps' }, icon: '✨' },
    ],
    rewards: [
      { name: { 'zh-TW': 'HK$50 美食券', 'zh-CN': 'HK$50 美食券', en: 'HK$50 Food Voucher' }, stamps: 500, quota: 1000, remaining: 234 },
      { name: { 'zh-TW': '免費泊車3小時', 'zh-CN': '免费泊车3小时', en: '3 Hours Free Parking' }, stamps: 300, quota: 500, remaining: 89 },
      { name: { 'zh-TW': '限量版利是封套裝', 'zh-CN': '限量版利是封套装', en: 'Limited Edition Red Packet Set' }, stamps: 200, quota: 2000, remaining: 567 },
    ],
    participating: 12580,
    maxParticipants: 0,
    merchants: ['All Merchants'],
    tags: { 'zh-TW': ['新春限定', '三倍印花', '限時優惠'], 'zh-CN': ['新春限定', '三倍印花', '限时优惠'], en: ['CNY Special', 'Triple Stamps', 'Limited Time'] },
    isJoined: true,
  },
  c2: {
    id: 'c2',
    title: { 'zh-TW': '春日美食節', 'zh-CN': '春日美食节', en: 'Spring Food Festival' },
    mall: { 'zh-TW': '又一城 Festival Walk', 'zh-CN': '又一城 Festival Walk', en: 'Festival Walk' },
    date: { 'zh-TW': '2026.02.01 - 2026.03.31', 'zh-CN': '2026.02.01 - 2026.03.31', en: 'Feb 1 - Mar 31, 2026' },
    dateRange: { start: '2026-02-01', end: '2026-03-31' },
    type: { 'zh-TW': '餐飲優惠', 'zh-CN': '餐饮优惠', en: 'Dining Offers' },
    color: '#E65100',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    desc: { 'zh-TW': '指定餐廳消費享額外印花及折扣優惠', 'zh-CN': '指定餐厅消费享额外印花及折扣优惠', en: 'Earn extra stamps and discounts at selected restaurants' },
    fullDesc: { 'zh-TW': '春暖花開的季節，與親友一同品嚐又一城的精選美食！活動期間於指定餐廳消費，每筆滿HK$100即可獲得額外50印花，部分餐廳更提供會員專屬9折優惠。', 'zh-CN': '春暖花开的季节，与亲友一同品尝又一城的精选美食！活动期间于指定餐厅消费，每笔满HK$100即可获得额外50印花，部分餐厅更提供会员专属9折优惠。', en: 'Enjoy delicious food with friends and family at Festival Walk this spring! Spend HK$100 or more at participating restaurants to earn an extra 50 stamps. Selected restaurants also offer exclusive 10% off for members.' },
    rules: {
      'zh-TW': ['適用於又一城指定餐飲商戶（見下方列表）', '每筆消費滿HK$100可獲額外50印花', '每位會員每日最多可獲3次額外印花', '需於付款前出示會員QR碼', '部分餐廳提供會員專屬9折優惠', '不可與其他優惠同時使用'],
      'zh-CN': ['适用于又一城指定餐饮商户（见下方列表）', '每笔消费满HK$100可获额外50印花', '每位会员每日最多可获3次额外印花', '需于付款前出示会员QR码', '部分餐厅提供会员专属9折优惠', '不可与其他优惠同时使用'],
      en: ['Valid at selected dining outlets in Festival Walk (see list below)', 'Earn extra 50 stamps for every HK$100 spent', 'Maximum 3 extra stamp rewards per member per day', 'Show member QR code before payment', 'Selected restaurants offer exclusive 10% off for members', 'Cannot be combined with other offers'],
    },
    howTo: [
      { step: { 'zh-TW': '前往指定參與餐廳', 'zh-CN': '前往指定参与餐厅', en: 'Visit participating restaurants' }, icon: '🍽️' },
      { step: { 'zh-TW': '消費前出示會員QR碼', 'zh-CN': '消费前出示会员QR码', en: 'Show your member QR code before ordering' }, icon: '📱' },
      { step: { 'zh-TW': '付款後掃描收據獲取印花', 'zh-CN': '付款后扫描收据获取印花', en: 'Scan receipt after payment to earn stamps' }, icon: '🧾' },
      { step: { 'zh-TW': '享受美食並累積印花', 'zh-CN': '享受美食并累积印花', en: 'Enjoy great food and earn stamps' }, icon: '🎉' },
    ],
    rewards: [
      { name: { 'zh-TW': '免費甜品一份', 'zh-CN': '免费甜品一份', en: 'Free Dessert' }, stamps: 150, quota: 800, remaining: 456 },
      { name: { 'zh-TW': 'HK$100 餐飲現金券', 'zh-CN': 'HK$100 餐饮现金券', en: 'HK$100 Dining Voucher' }, stamps: 800, quota: 300, remaining: 123 },
    ],
    participating: 5680,
    maxParticipants: 10000,
    merchants: ['Pacific Coffee', 'Starbucks', "Dan Ryan's Chicago Grill", "Triple O's", 'PizzaExpress', 'Pepper Lunch', 'Genki Sushi', 'Tamjai Yunnan Mixian'],
    tags: { 'zh-TW': ['餐飲', '額外印花', '會員優惠'], 'zh-CN': ['餐饮', '额外印花', '会员优惠'], en: ['Dining', 'Extra Stamps', 'Member Offers'] },
    isJoined: false,
  },
  c3: {
    id: 'c3',
    title: { 'zh-TW': '會員生日禮遇', 'zh-CN': '会员生日礼遇', en: 'Birthday Rewards' },
    mall: { 'zh-TW': '全線商場', 'zh-CN': '全线商场', en: 'All Malls' },
    date: { 'zh-TW': '全年適用', 'zh-CN': '全年适用', en: 'Year-round' },
    dateRange: { start: '2026-01-01', end: '2026-12-31' },
    type: { 'zh-TW': '生日優惠', 'zh-CN': '生日优惠', en: 'Birthday Offer' },
    color: '#7B1FA2',
    image: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=800&q=80',
    desc: { 'zh-TW': '生日月份專屬雙倍印花及神秘禮物', 'zh-CN': '生日月份专属双倍印花及神秘礼物', en: 'Enjoy double stamps and mystery gifts during your birthday month' },
    fullDesc: { 'zh-TW': '領展會員尊享生日禮遇！在您的生日月份，所有消費均可獲得雙倍印花。金卡及以上會員更可親臨客戶服務中心領取精美生日禮物一份！', 'zh-CN': '领展会员尊享生日礼遇！在您的生日月份，所有消费均可获得双倍印花。金卡及以上会员更可亲临客户服务中心领取精美生日礼物一份！', en: 'Link members enjoy exclusive birthday rewards! During your birthday month, earn double stamps on all purchases. Gold members and above can collect a special birthday gift at the Customer Service Centre!' },
    rules: {
      'zh-TW': ['適用於會員生日當月整個月份', '所有消費自動享有雙倍印花', '金卡/白金/鑽石會員可領取生日禮物', '生日禮物需於生日月份內領取', '每位會員每年只可享用一次'],
      'zh-CN': ['适用于会员生日当月整个月份', '所有消费自动享有双倍印花', '金卡/白金/钻石会员可领取生日礼物', '生日礼物需于生日月份内领取', '每位会员每年只可享用一次'],
      en: ['Valid throughout your birthday month', 'All purchases automatically earn double stamps', 'Gold/Platinum/Diamond members can collect birthday gifts', 'Birthday gifts must be collected within your birthday month', 'One-time benefit per member per year'],
    },
    howTo: [
      { step: { 'zh-TW': '確保會員資料中的生日日期正確', 'zh-CN': '确保会员资料中的生日日期正确', en: 'Ensure your birthday is correct in your member profile' }, icon: '📝' },
      { step: { 'zh-TW': '生日月份消費自動享雙倍印花', 'zh-CN': '生日月份消费自动享双倍印花', en: 'Earn double stamps automatically during birthday month' }, icon: '✨' },
      { step: { 'zh-TW': '金卡以上會員前往客服中心', 'zh-CN': '金卡以上会员前往客服中心', en: 'Gold members and above visit Customer Service Centre' }, icon: '🎁' },
      { step: { 'zh-TW': '出示會員QR碼領取生日禮物', 'zh-CN': '出示会员QR码领取生日礼物', en: 'Show member QR code to collect birthday gift' }, icon: '🎂' },
    ],
    rewards: [
      { name: { 'zh-TW': '生日驚喜禮盒（金卡）', 'zh-CN': '生日惊喜礼盒（金卡）', en: 'Birthday Surprise Box (Gold)' }, stamps: 0, quota: 999, remaining: 999 },
      { name: { 'zh-TW': '生日豪華禮盒（白金）', 'zh-CN': '生日豪华礼盒（白金）', en: 'Birthday Deluxe Box (Platinum)' }, stamps: 0, quota: 999, remaining: 999 },
      { name: { 'zh-TW': '生日尊貴禮盒（鑽石）', 'zh-CN': '生日尊贵礼盒（钻石）', en: 'Birthday Premium Box (Diamond)' }, stamps: 0, quota: 999, remaining: 999 },
    ],
    participating: 28900,
    maxParticipants: 0,
    merchants: ['All Merchants'],
    tags: { 'zh-TW': ['生日', '雙倍印花', '免費禮物'], 'zh-CN': ['生日', '双倍印花', '免费礼物'], en: ['Birthday', 'Double Stamps', 'Free Gift'] },
    isJoined: true,
  },
  c4: {
    id: 'c4',
    title: { 'zh-TW': '週末快閃：UNIQLO 額外印花', 'zh-CN': '周末快闪：UNIQLO 额外印花', en: 'Weekend Flash: UNIQLO Extra Stamps' },
    mall: { 'zh-TW': '又一城 Festival Walk', 'zh-CN': '又一城 Festival Walk', en: 'Festival Walk' },
    date: { 'zh-TW': '2026.02.08 - 2026.02.09', 'zh-CN': '2026.02.08 - 2026.02.09', en: 'Feb 8-9, 2026' },
    dateRange: { start: '2026-02-08', end: '2026-02-09' },
    type: { 'zh-TW': '快閃活動', 'zh-CN': '快闪活动', en: 'Flash Event' },
    color: '#D32F2F',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
    desc: { 'zh-TW': '本週末限定！UNIQLO 消費額外獲50印花', 'zh-CN': '本周末限定！UNIQLO 消费额外获50印花', en: 'This weekend only! Earn extra 50 stamps at UNIQLO' },
    fullDesc: { 'zh-TW': '本週末於又一城UNIQLO消費，除基本印花外，每筆消費滿HK$300更可額外獲得50印花！數量有限，先到先得。', 'zh-CN': '本周末于又一城UNIQLO消费，除基本印花外，每笔消费满HK$300更可额外获得50印花！数量有限，先到先得。', en: 'Shop at UNIQLO in Festival Walk this weekend! In addition to regular stamps, spend HK$300 or more to earn an extra 50 stamps! Limited quota, first come first served.' },
    rules: {
      'zh-TW': ['僅限2026年2月8日至9日', '每筆消費滿HK$300可獲額外50印花', '每位會員限享3次', '需出示會員QR碼', '名額有限，額滿即止'],
      'zh-CN': ['仅限2026年2月8日至9日', '每笔消费满HK$300可获额外50印花', '每位会员限享3次', '需出示会员QR码', '名额有限，额满即止'],
      en: ['Valid only on Feb 8-9, 2026', 'Earn extra 50 stamps for every HK$300 spent', 'Maximum 3 times per member', 'Show member QR code at checkout', 'Limited quota, while stocks last'],
    },
    howTo: [
      { step: { 'zh-TW': '前往又一城 UNIQLO', 'zh-CN': '前往又一城 UNIQLO', en: 'Visit UNIQLO at Festival Walk' }, icon: '👕' },
      { step: { 'zh-TW': '選購滿HK$300商品', 'zh-CN': '选购满HK$300商品', en: 'Shop for HK$300 or more' }, icon: '🛒' },
      { step: { 'zh-TW': '付款時出示會員QR碼', 'zh-CN': '付款时出示会员QR码', en: 'Show member QR code at checkout' }, icon: '📱' },
      { step: { 'zh-TW': '掃描收據領取額外印花', 'zh-CN': '扫描收据领取额外印花', en: 'Scan receipt to earn extra stamps' }, icon: '✨' },
    ],
    rewards: [],
    participating: 890,
    maxParticipants: 2000,
    merchants: ['UNIQLO (L1)'],
    tags: { 'zh-TW': ['快閃', '限時', 'UNIQLO'], 'zh-CN': ['快闪', '限时', 'UNIQLO'], en: ['Flash', 'Limited Time', 'UNIQLO'] },
    isJoined: false,
  },
};

const defaultCampaignData: CampaignData = {
  id: 'default',
  title: { 'zh-TW': '活動詳情', 'zh-CN': '活动详情', en: 'Campaign Details' },
  mall: { 'zh-TW': '全線商場', 'zh-CN': '全线商场', en: 'All Malls' },
  date: { 'zh-TW': '進行中', 'zh-CN': '进行中', en: 'Ongoing' },
  dateRange: { start: '2026-01-01', end: '2026-12-31' },
  type: { 'zh-TW': '活動', 'zh-CN': '活动', en: 'Campaign' },
  color: PRIMARY,
  image: '',
  desc: { 'zh-TW': '歡迎參加領展會員活動，享受專屬優惠。', 'zh-CN': '欢迎参加领展会员活动，享受专属优惠。', en: 'Join Link member campaigns and enjoy exclusive offers.' },
  fullDesc: { 'zh-TW': '歡迎參加領展會員活動，享受專屬優惠。', 'zh-CN': '欢迎参加领展会员活动，享受专属优惠。', en: 'Join Link member campaigns and enjoy exclusive offers.' },
  rules: {
    'zh-TW': ['請留意活動相關條款及細則', '領展保留最終決定權'],
    'zh-CN': ['请留意活动相关条款及细则', '领展保留最终决定权'],
    en: ['Please refer to campaign terms and conditions', 'Link reserves the right of final decision'],
  },
  howTo: [
    { step: { 'zh-TW': '前往指定商場參與活動', 'zh-CN': '前往指定商场参与活动', en: 'Visit designated malls to participate' }, icon: '🏬' },
    { step: { 'zh-TW': '出示會員QR碼即可參加', 'zh-CN': '出示会员QR码即可参加', en: 'Show your member QR code to join' }, icon: '📱' },
  ],
  rewards: [],
  participating: 0,
  maxParticipants: 0,
  merchants: [],
  tags: { 'zh-TW': [], 'zh-CN': [], en: [] },
};

export default function CampaignDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const locale = useSettingsStore((s) => s.locale);
  const campaignSource = campaignDataSource[id || ''] || defaultCampaignData;
  const [isFavorite, setIsFavorite] = useState(false);
  const [isJoined, setIsJoined] = useState(campaignSource.isJoined || false);

  // Derive locale-specific campaign data
  const campaign = useMemo<Campaign>(() => ({
    id: campaignSource.id,
    title: campaignSource.title[locale],
    mall: campaignSource.mall[locale],
    date: campaignSource.date[locale],
    dateRange: campaignSource.dateRange,
    type: campaignSource.type[locale],
    color: campaignSource.color,
    image: campaignSource.image,
    desc: campaignSource.desc[locale],
    fullDesc: campaignSource.fullDesc[locale],
    rules: campaignSource.rules[locale],
    howTo: campaignSource.howTo.map(h => ({ step: h.step[locale], icon: h.icon })),
    rewards: campaignSource.rewards.map(r => ({ name: r.name[locale], stamps: r.stamps, quota: r.quota, remaining: r.remaining })),
    participating: campaignSource.participating,
    maxParticipants: campaignSource.maxParticipants,
    merchants: campaignSource.merchants,
    tags: campaignSource.tags[locale],
    isJoined: campaignSource.isJoined,
  }), [campaignSource, locale]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: campaign.title,
        text: campaign.desc,
        url: window.location.href,
      });
    } else {
      Toast.show({ content: t('campaign.linkCopied'), icon: 'success' });
    }
  };

  const handleJoin = () => {
    if (isJoined) {
      Toast.show({ content: t('campaign.alreadyJoined'), icon: 'success' });
    } else {
      Modal.confirm({
        title: t('campaign.confirmJoin'),
        content: t('campaign.confirmJoinContent', { title: campaign.title }),
        confirmText: t('common.confirm'),
        cancelText: t('common.cancel'),
        onConfirm: () => {
          setIsJoined(true);
          Toast.show({ content: t('campaign.joinSuccess'), icon: 'success' });
        },
      });
    }
  };

  const progressPercent = campaign.maxParticipants > 0
    ? Math.min((campaign.participating / campaign.maxParticipants) * 100, 100)
    : 0;

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', paddingBottom: 80 }}>
      <NavBar
        onBack={() => navigate(-1)}
        style={{ background: 'transparent', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}
        right={
          <div style={{ display: 'flex', gap: 16 }}>
            <div onClick={() => setIsFavorite(!isFavorite)}>
              {isFavorite ? <HeartFill fontSize={22} color="#ff4d4f" /> : <HeartOutline fontSize={22} color="#fff" />}
            </div>
            <div onClick={handleShare}>
              <SendOutline fontSize={22} color="#fff" />
            </div>
          </div>
        }
      />

      {/* Hero Banner */}
      <div style={{
        height: 280,
        background: campaign.image
          ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${campaign.image}) center/cover`
          : `linear-gradient(135deg, ${campaign.color} 0%, ${campaign.color}BB 100%)`,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '20px',
      }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {campaign.tags.map((tag, i) => (
            <Tag key={i} style={{ '--background-color': 'rgba(255,255,255,0.25)', '--text-color': '#fff' } as React.CSSProperties}>
              {tag}
            </Tag>
          ))}
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{campaign.title}</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 8, lineHeight: 1.5 }}>{campaign.desc}</div>
      </div>

      {/* Quick Info Bar */}
      <div style={{
        display: 'flex', background: '#fff', padding: '12px 16px',
        borderBottom: '1px solid #f0f0f0', gap: 24
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#666' }}>
          <ClockCircleOutline fontSize={16} color={PRIMARY} />
          <span>{campaign.date}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#666' }}>
          <LocationFill fontSize={16} color={PRIMARY} />
          <span>{campaign.mall}</span>
        </div>
      </div>

      {/* Participation Stats */}
      {(campaign.participating > 0 || campaign.maxParticipants > 0) && (
        <div style={{ padding: '12px 16px', background: '#fff', marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 14, color: '#333' }}>
              {t('campaign.participantsCount', { count: campaign.participating.toLocaleString() })}
            </span>
            {campaign.maxParticipants > 0 && (
              <span style={{ fontSize: 12, color: '#999' }}>
                {t('campaign.quota')}: {campaign.maxParticipants.toLocaleString()}
              </span>
            )}
          </div>
          {campaign.maxParticipants > 0 && (
            <ProgressBar percent={progressPercent} style={{ '--fill-color': PRIMARY, '--track-width': '6px' } as React.CSSProperties} />
          )}
        </div>
      )}

      {/* Campaign Details */}
      <div style={{ padding: 16 }}>
        <Card style={{ borderRadius: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>{t('campaign.details')}</div>
          <div style={{ fontSize: 14, color: '#666', lineHeight: 1.8 }}>{campaign.fullDesc}</div>
        </Card>
      </div>

      {/* How to Participate */}
      <div style={{ padding: '0 16px' }}>
        <Card style={{ borderRadius: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>{t('campaign.howToJoin')}</div>
          {campaign.howTo.map((item, i) => (
            <div key={i} style={{
              display: 'flex', gap: 12, marginBottom: i < campaign.howTo.length - 1 ? 16 : 0,
              alignItems: 'center'
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 22, background: `${PRIMARY}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
              }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: 12, color: '#999', marginBottom: 2 }}>{t('campaign.step')} {i + 1}</div>
                <div style={{ fontSize: 14, color: '#333', fontWeight: 500 }}>{item.step}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Rewards */}
      {campaign.rewards.length > 0 && (
        <div style={{ padding: 16 }}>
          <Card style={{ borderRadius: 12 }}>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <GiftOutline fontSize={18} color={PRIMARY} />
              {t('campaign.rewards')}
            </div>
            {campaign.rewards.map((reward, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 0', borderBottom: i < campaign.rewards.length - 1 ? '1px solid #f0f0f0' : 'none'
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>{reward.name}</div>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                    {reward.stamps > 0 ? t('campaign.stampRedeem', { stamps: reward.stamps }) : t('campaign.freeRedeem')} · {t('campaign.remaining')} {reward.remaining}/{reward.quota}
                  </div>
                </div>
                <Button size="mini" color="primary" fill="outline"
                  style={{ '--border-color': PRIMARY, '--text-color': PRIMARY } as React.CSSProperties}
                  onClick={() => navigate('/offers')}
                >
                  {t('campaign.redeem')}
                </Button>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* Participating Merchants */}
      {campaign.merchants.length > 0 && (
        <div style={{ padding: '0 16px' }}>
          <Card style={{ borderRadius: 12 }}>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>{t('campaign.participatingMerchants')}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {campaign.merchants.map((merchant, i) => (
                <Tag key={i} style={{ '--background-color': '#f5f5f5', '--text-color': '#666' } as React.CSSProperties}>
                  {merchant}
                </Tag>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Terms & Conditions */}
      <div style={{ padding: 16 }}>
        <Card style={{ borderRadius: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>{t('campaign.terms')}</div>
          {campaign.rules.map((rule, i) => (
            <div key={i} style={{ fontSize: 13, color: '#666', marginBottom: 8, display: 'flex', gap: 8, lineHeight: 1.5 }}>
              <span style={{ color: PRIMARY, fontWeight: 600 }}>{i + 1}.</span>
              <span>{rule}</span>
            </div>
          ))}
        </Card>
      </div>

      {/* Fixed Bottom Button */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '12px 16px', background: '#fff', borderTop: '1px solid #f0f0f0',
        display: 'flex', gap: 12
      }}>
        <Button
          block
          size="large"
          color={isJoined ? 'default' : 'primary'}
          onClick={handleJoin}
          style={{
            '--background-color': isJoined ? '#f5f5f5' : PRIMARY,
            '--border-color': isJoined ? '#d9d9d9' : PRIMARY,
            '--text-color': isJoined ? '#999' : '#fff',
            borderRadius: 12,
            fontWeight: 600
          } as React.CSSProperties}
        >
          {isJoined ? `✓ ${t('campaign.joined')}` : t('campaign.joinNow')}
        </Button>
        {!isJoined && (
          <Button
            size="large"
            onClick={() => navigate('/scan')}
            style={{
              '--border-color': PRIMARY,
              '--text-color': PRIMARY,
              borderRadius: 12,
              fontWeight: 600,
              minWidth: 100,
            } as React.CSSProperties}
          >
            {t('common.scan')}
          </Button>
        )}
      </div>
    </div>
  );
}
