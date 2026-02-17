import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NavBar, Card, List, Tag, Button, Divider, Toast, Image, Swiper, Modal, ProgressBar } from 'antd-mobile';
import { HeartOutline, HeartFill, SendOutline, ClockCircleOutline, LocationFill, GiftOutline } from 'antd-mobile-icons';

// Custom QR code icon
const QrcodeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
    <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
    <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
    <rect x="14" y="14" width="3" height="3" fill="currentColor"/>
    <rect x="18" y="14" width="3" height="3" fill="currentColor"/>
    <rect x="14" y="18" width="3" height="3" fill="currentColor"/>
    <rect x="18" y="18" width="3" height="3" fill="currentColor"/>
    <rect x="5" y="5" width="3" height="3" fill="currentColor"/>
    <rect x="16" y="5" width="3" height="3" fill="currentColor"/>
    <rect x="5" y="16" width="3" height="3" fill="currentColor"/>
  </svg>
);
import { useTranslation } from '../../locales';
import { useSettingsStore, type Locale } from '../../store/settings';
import { useAuthStore } from '../../store/auth';
import { QRCodeSVG } from 'qrcode.react';

const PRIMARY = '#00694B';

// Helper to get joined campaigns from localStorage (user-specific)
const getJoinedCampaigns = (): Record<string, { code: string; joinedAt: string }> => {
  try {
    return JSON.parse(localStorage.getItem('joinedCampaigns') || '{}');
  } catch {
    return {};
  }
};

// Helper to save joined campaign
const saveJoinedCampaign = (campaignId: string, code: string) => {
  const joined = getJoinedCampaigns();
  joined[campaignId] = { code, joinedAt: new Date().toISOString() };
  localStorage.setItem('joinedCampaigns', JSON.stringify(joined));
};

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
  },
  c5: {
    id: 'c5',
    title: { 'zh-TW': '荷里活廣場春季購物祭', 'zh-CN': '荷里活广场春季购物祭', en: 'Plaza Hollywood Spring Shopping Festival' },
    mall: { 'zh-TW': '荷里活廣場', 'zh-CN': '荷里活广场', en: 'Plaza Hollywood' },
    date: { 'zh-TW': '2026.02.15 - 2026.03.31', 'zh-CN': '2026.02.15 - 2026.03.31', en: 'Feb 15 - Mar 31, 2026' },
    dateRange: { start: '2026-02-15', end: '2026-03-31' },
    type: { 'zh-TW': '購物優惠', 'zh-CN': '购物优惠', en: 'Shopping Offers' },
    color: '#1565C0',
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80',
    desc: { 'zh-TW': '春季購物消費滿額送電子禮券', 'zh-CN': '春季购物消费满额送电子礼券', en: 'Spend and earn e-vouchers during spring shopping' },
    fullDesc: { 'zh-TW': '荷里活廣場春季購物祭現已開始！於活動期間累積消費滿HK$800，即可獲贈HK$50電子購物禮券。累積消費滿HK$2,000更可獲贈HK$150電子購物禮券！同時享有雙倍印花獎賞。', 'zh-CN': '荷里活广场春季购物祭现已开始！于活动期间累积消费满HK$800，即可获赠HK$50电子购物礼券。累积消费满HK$2,000更可获赠HK$150电子购物礼券！同时享有双倍印花奖赏。', en: 'Plaza Hollywood Spring Shopping Festival is now on! Accumulate spending of HK$800 to receive HK$50 e-voucher. Spend HK$2,000 to get HK$150 e-voucher! Plus double stamps on all purchases.' },
    rules: {
      'zh-TW': ['活動期間於荷里活廣場累積消費計算', '每位會員最多可換領3次獎賞', '電子禮券將於登記後24小時內發放', '禮券有效期為發放後30天', '不可與其他換領活動同時使用'],
      'zh-CN': ['活动期间于荷里活广场累积消费计算', '每位会员最多可换领3次奖赏', '电子礼券将于登记后24小时内发放', '礼券有效期为发放后30天', '不可与其他换领活动同时使用'],
      en: ['Calculated based on accumulated spending at Plaza Hollywood', 'Maximum 3 redemptions per member', 'E-vouchers will be issued within 24 hours', 'Vouchers valid for 30 days from issuance', 'Cannot be combined with other redemption offers'],
    },
    howTo: [
      { step: { 'zh-TW': '於荷里活廣場商戶購物', 'zh-CN': '于荷里活广场商户购物', en: 'Shop at Plaza Hollywood merchants' }, icon: '🛍️' },
      { step: { 'zh-TW': '保留所有收據並掃碼累積消費', 'zh-CN': '保留所有收据并扫码累积消费', en: 'Keep receipts and scan to accumulate spending' }, icon: '🧾' },
      { step: { 'zh-TW': '達到指定金額自動獲得獎賞', 'zh-CN': '达到指定金额自动获得奖赏', en: 'Receive rewards when threshold is reached' }, icon: '🎁' },
      { step: { 'zh-TW': '電子禮券可於下次消費使用', 'zh-CN': '电子礼券可于下次消费使用', en: 'Use e-vouchers on your next visit' }, icon: '💳' },
    ],
    rewards: [
      { name: { 'zh-TW': 'HK$50 電子購物禮券', 'zh-CN': 'HK$50 电子购物礼券', en: 'HK$50 E-voucher' }, stamps: 0, quota: 5000, remaining: 3200 },
      { name: { 'zh-TW': 'HK$150 電子購物禮券', 'zh-CN': 'HK$150 电子购物礼券', en: 'HK$150 E-voucher' }, stamps: 0, quota: 2000, remaining: 1450 },
    ],
    participating: 8900,
    maxParticipants: 20000,
    merchants: ['H&M', 'Zara', 'UNIQLO', 'Nike', 'Adidas', 'Muji', 'LOG-ON'],
    tags: { 'zh-TW': ['購物', '電子禮券', '雙倍印花'], 'zh-CN': ['购物', '电子礼券', '双倍印花'], en: ['Shopping', 'E-voucher', 'Double Stamps'] },
  },
  c6: {
    id: 'c6',
    title: { 'zh-TW': '屯門市廣場美食嘉年華', 'zh-CN': '屯门市广场美食嘉年华', en: 'Tuen Mun Town Plaza Food Carnival' },
    mall: { 'zh-TW': '屯門市廣場', 'zh-CN': '屯门市广场', en: 'Tuen Mun Town Plaza' },
    date: { 'zh-TW': '2026.02.01 - 2026.02.28', 'zh-CN': '2026.02.01 - 2026.02.28', en: 'Feb 1 - Feb 28, 2026' },
    dateRange: { start: '2026-02-01', end: '2026-02-28' },
    type: { 'zh-TW': '美食活動', 'zh-CN': '美食活动', en: 'Food Event' },
    color: '#FF6F00',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
    desc: { 'zh-TW': '精選餐廳限定美食及會員專屬優惠', 'zh-CN': '精选餐厅限定美食及会员专属优惠', en: 'Exclusive dishes and member-only offers at selected restaurants' },
    fullDesc: { 'zh-TW': '屯門市廣場美食嘉年華盛大舉行！超過20間參與餐廳推出限定美食，會員消費更可享85折優惠。同時參加集印花活動，有機會贏取豐富獎品！', 'zh-CN': '屯门市广场美食嘉年华盛大举行！超过20间参与餐厅推出限定美食，会员消费更可享85折优惠。同时参加集印花活动，有机会赢取丰富奖品！', en: 'Tuen Mun Town Plaza Food Carnival is here! Over 20 restaurants offer exclusive dishes with 15% off for members. Join the stamp collection for a chance to win prizes!' },
    rules: {
      'zh-TW': ['適用於屯門市廣場指定餐廳', '會員消費可享85折優惠', '每筆消費可獲額外100印花', '集滿指定印花數量可參加抽獎', '優惠不可與其他折扣同時使用'],
      'zh-CN': ['适用于屯门市广场指定餐厅', '会员消费可享85折优惠', '每笔消费可获额外100印花', '集满指定印花数量可参加抽奖', '优惠不可与其他折扣同时使用'],
      en: ['Valid at selected restaurants in Tuen Mun Town Plaza', 'Members enjoy 15% off', 'Earn extra 100 stamps per transaction', 'Collect stamps to join lucky draw', 'Cannot be combined with other discounts'],
    },
    howTo: [
      { step: { 'zh-TW': '瀏覽參與餐廳名單', 'zh-CN': '浏览参与餐厅名单', en: 'Browse participating restaurants' }, icon: '📋' },
      { step: { 'zh-TW': '出示會員QR碼享優惠', 'zh-CN': '出示会员QR码享优惠', en: 'Show member QR code for discount' }, icon: '📱' },
      { step: { 'zh-TW': '掃描收據賺取印花', 'zh-CN': '扫描收据赚取印花', en: 'Scan receipt to earn stamps' }, icon: '🧾' },
      { step: { 'zh-TW': '累積印花參加抽獎', 'zh-CN': '累积印花参加抽奖', en: 'Collect stamps for lucky draw' }, icon: '🎰' },
    ],
    rewards: [
      { name: { 'zh-TW': 'HK$200 餐飲禮券', 'zh-CN': 'HK$200 餐饮礼券', en: 'HK$200 Dining Voucher' }, stamps: 500, quota: 500, remaining: 280 },
      { name: { 'zh-TW': '免費下午茶套餐', 'zh-CN': '免费下午茶套餐', en: 'Free Afternoon Tea Set' }, stamps: 300, quota: 800, remaining: 520 },
    ],
    participating: 6500,
    maxParticipants: 15000,
    merchants: ['大家樂', '牛角', '茶木', 'Pepper Lunch', 'Yoshinoya', 'MOS Burger', 'Starbucks'],
    tags: { 'zh-TW': ['美食', '85折', '抽獎'], 'zh-CN': ['美食', '85折', '抽奖'], en: ['Food', '15% Off', 'Lucky Draw'] },
  },
  c7: {
    id: 'c7',
    title: { 'zh-TW': '大埔超級城親子樂園', 'zh-CN': '大埔超级城亲子乐园', en: 'Tai Po Mega Mall Family Fun' },
    mall: { 'zh-TW': '大埔超級城', 'zh-CN': '大埔超级城', en: 'Tai Po Mega Mall' },
    date: { 'zh-TW': '2026.02.10 - 2026.03.15', 'zh-CN': '2026.02.10 - 2026.03.15', en: 'Feb 10 - Mar 15, 2026' },
    dateRange: { start: '2026-02-10', end: '2026-03-15' },
    type: { 'zh-TW': '親子活動', 'zh-CN': '亲子活动', en: 'Family Event' },
    color: '#43A047',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80',
    desc: { 'zh-TW': '親子消費享三倍印花及免費工作坊', 'zh-CN': '亲子消费享三倍印花及免费工作坊', en: 'Triple stamps on family shopping plus free workshops' },
    fullDesc: { 'zh-TW': '大埔超級城親子樂園活動期間，於指定親子及兒童商戶消費可享三倍印花！更設有免費親子工作坊，包括手工藝、烘焙班等。立即登記參加！', 'zh-CN': '大埔超级城亲子乐园活动期间，于指定亲子及儿童商户消费可享三倍印花！更设有免费亲子工作坊，包括手工艺、烘焙班等。立即登记参加！', en: 'During Tai Po Mega Mall Family Fun, enjoy triple stamps at designated family and kids stores! Free workshops including arts & crafts and baking classes. Register now!' },
    rules: {
      'zh-TW': ['適用於指定親子及兒童商戶', '工作坊需提前預約', '每位會員最多可預約2個工作坊', '12歲以下兒童需由家長陪同', '名額有限，先到先得'],
      'zh-CN': ['适用于指定亲子及儿童商户', '工作坊需提前预约', '每位会员最多可预约2个工作坊', '12岁以下儿童需由家长陪同', '名额有限，先到先得'],
      en: ['Valid at designated family and kids stores', 'Workshop registration required', 'Maximum 2 workshops per member', 'Children under 12 must be accompanied by parents', 'Limited spots, first come first served'],
    },
    howTo: [
      { step: { 'zh-TW': '於App預約免費工作坊', 'zh-CN': '于App预约免费工作坊', en: 'Book free workshops on App' }, icon: '📱' },
      { step: { 'zh-TW': '於指定商戶消費享三倍印花', 'zh-CN': '于指定商户消费享三倍印花', en: 'Earn triple stamps at designated stores' }, icon: '⭐' },
      { step: { 'zh-TW': '參加親子工作坊', 'zh-CN': '参加亲子工作坊', en: 'Attend family workshops' }, icon: '🎨' },
      { step: { 'zh-TW': '完成活動獲額外獎賞', 'zh-CN': '完成活动获额外奖赏', en: 'Complete activities for bonus rewards' }, icon: '🎁' },
    ],
    rewards: [
      { name: { 'zh-TW': '親子玩具禮包', 'zh-CN': '亲子玩具礼包', en: 'Family Toy Gift Pack' }, stamps: 400, quota: 300, remaining: 180 },
      { name: { 'zh-TW': '免費泊車4小時', 'zh-CN': '免费泊车4小时', en: '4 Hours Free Parking' }, stamps: 200, quota: 1000, remaining: 650 },
    ],
    participating: 4200,
    maxParticipants: 8000,
    merchants: ['Toys R Us', 'LEGO', 'Disney Store', 'Mothercare', 'BabyShop'],
    tags: { 'zh-TW': ['親子', '工作坊', '三倍印花'], 'zh-CN': ['亲子', '工作坊', '三倍印花'], en: ['Family', 'Workshop', 'Triple Stamps'] },
  },
  c8: {
    id: 'c8',
    title: { 'zh-TW': '樂富廣場週年慶', 'zh-CN': '乐富广场周年庆', en: 'Lok Fu Place Anniversary' },
    mall: { 'zh-TW': '樂富廣場', 'zh-CN': '乐富广场', en: 'Lok Fu Place' },
    date: { 'zh-TW': '2026.03.01 - 2026.03.31', 'zh-CN': '2026.03.01 - 2026.03.31', en: 'Mar 1 - Mar 31, 2026' },
    dateRange: { start: '2026-03-01', end: '2026-03-31' },
    type: { 'zh-TW': '週年慶', 'zh-CN': '周年庆', en: 'Anniversary' },
    color: '#8E24AA',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80',
    desc: { 'zh-TW': '週年慶期間消費可參加幸運大抽獎', 'zh-CN': '周年庆期间消费可参加幸运大抽奖', en: 'Join lucky draw during anniversary celebration' },
    fullDesc: { 'zh-TW': '樂富廣場週年慶隆重舉行！活動期間消費滿HK$300即可獲得抽獎券一張，大獎包括日本來回機票、Apple產品等！更有全場雙倍印花及限定優惠。', 'zh-CN': '乐富广场周年庆隆重举行！活动期间消费满HK$300即可获得抽奖券一张，大奖包括日本来回机票、Apple产品等！更有全场双倍印花及限定优惠。', en: 'Lok Fu Place Anniversary Celebration! Spend HK$300 to get a lucky draw ticket. Grand prizes include Japan round-trip tickets, Apple products and more! Double stamps mall-wide.' },
    rules: {
      'zh-TW': ['消費滿HK$300可獲抽獎券一張', '每位會員最多可獲10張抽獎券', '抽獎結果將於4月5日公布', '獎品需於指定日期內領取', '領展保留最終決定權'],
      'zh-CN': ['消费满HK$300可获抽奖券一张', '每位会员最多可获10张抽奖券', '抽奖结果将于4月5日公布', '奖品需于指定日期内领取', '领展保留最终决定权'],
      en: ['Spend HK$300 to get one lucky draw ticket', 'Maximum 10 tickets per member', 'Results announced on April 5', 'Prizes must be collected by deadline', 'Link reserves the right of final decision'],
    },
    howTo: [
      { step: { 'zh-TW': '於樂富廣場消費滿HK$300', 'zh-CN': '于乐富广场消费满HK$300', en: 'Spend HK$300 at Lok Fu Place' }, icon: '🛍️' },
      { step: { 'zh-TW': '掃描收據獲取抽獎券', 'zh-CN': '扫描收据获取抽奖券', en: 'Scan receipt to get lucky draw ticket' }, icon: '🎟️' },
      { step: { 'zh-TW': '於App查看抽獎結果', 'zh-CN': '于App查看抽奖结果', en: 'Check results on App' }, icon: '📱' },
      { step: { 'zh-TW': '中獎者前往客服中心領獎', 'zh-CN': '中奖者前往客服中心领奖', en: 'Winners collect prizes at CS Centre' }, icon: '🏆' },
    ],
    rewards: [
      { name: { 'zh-TW': '日本來回機票', 'zh-CN': '日本来回机票', en: 'Japan Round-trip Tickets' }, stamps: 0, quota: 5, remaining: 5 },
      { name: { 'zh-TW': 'iPhone 16 Pro', 'zh-CN': 'iPhone 16 Pro', en: 'iPhone 16 Pro' }, stamps: 0, quota: 10, remaining: 10 },
      { name: { 'zh-TW': 'Apple Watch', 'zh-CN': 'Apple Watch', en: 'Apple Watch' }, stamps: 0, quota: 20, remaining: 20 },
    ],
    participating: 15600,
    maxParticipants: 0,
    merchants: ['All Merchants'],
    tags: { 'zh-TW': ['週年慶', '大抽獎', '雙倍印花'], 'zh-CN': ['周年庆', '大抽奖', '双倍印花'], en: ['Anniversary', 'Lucky Draw', 'Double Stamps'] },
  },
  c9: {
    id: 'c9',
    title: { 'zh-TW': '將軍澳廣場電子產品展', 'zh-CN': '将军澳广场电子产品展', en: 'TKO Gateway Tech Expo' },
    mall: { 'zh-TW': '將軍澳廣場', 'zh-CN': '将军澳广场', en: 'TKO Gateway' },
    date: { 'zh-TW': '2026.02.20 - 2026.03.10', 'zh-CN': '2026.02.20 - 2026.03.10', en: 'Feb 20 - Mar 10, 2026' },
    dateRange: { start: '2026-02-20', end: '2026-03-10' },
    type: { 'zh-TW': '科技展覽', 'zh-CN': '科技展览', en: 'Tech Expo' },
    color: '#00897B',
    image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&q=80',
    desc: { 'zh-TW': '電子產品優惠及會員專屬折扣', 'zh-CN': '电子产品优惠及会员专属折扣', en: 'Tech deals and member-exclusive discounts' },
    fullDesc: { 'zh-TW': '將軍澳廣場電子產品展帶來最新科技產品及獨家優惠！會員購買指定電子產品可享額外9折，更有機會以印花換購限量科技配件。', 'zh-CN': '将军澳广场电子产品展带来最新科技产品及独家优惠！会员购买指定电子产品可享额外9折，更有机会以印花换购限量科技配件。', en: 'TKO Gateway Tech Expo features the latest gadgets and exclusive deals! Members enjoy extra 10% off on selected electronics, plus redeem limited tech accessories with stamps.' },
    rules: {
      'zh-TW': ['適用於指定電子產品商戶', '會員可享額外9折優惠', '限量配件以印花換購', '每位會員最多可換購3件', '優惠不可與其他折扣同時使用'],
      'zh-CN': ['适用于指定电子产品商户', '会员可享额外9折优惠', '限量配件以印花换购', '每位会员最多可换购3件', '优惠不可与其他折扣同时使用'],
      en: ['Valid at designated electronics stores', 'Members enjoy extra 10% off', 'Limited accessories for stamp redemption', 'Maximum 3 items per member', 'Cannot combine with other discounts'],
    },
    howTo: [
      { step: { 'zh-TW': '瀏覽參與商戶及產品', 'zh-CN': '浏览参与商户及产品', en: 'Browse participating stores and products' }, icon: '📋' },
      { step: { 'zh-TW': '出示會員QR碼享折扣', 'zh-CN': '出示会员QR码享折扣', en: 'Show member QR for discount' }, icon: '📱' },
      { step: { 'zh-TW': '掃描收據賺取印花', 'zh-CN': '扫描收据赚取印花', en: 'Scan receipt to earn stamps' }, icon: '🧾' },
      { step: { 'zh-TW': '以印花換購限量配件', 'zh-CN': '以印花换购限量配件', en: 'Redeem accessories with stamps' }, icon: '🎧' },
    ],
    rewards: [
      { name: { 'zh-TW': '無線充電器', 'zh-CN': '无线充电器', en: 'Wireless Charger' }, stamps: 600, quota: 200, remaining: 120 },
      { name: { 'zh-TW': '藍牙耳機', 'zh-CN': '蓝牙耳机', en: 'Bluetooth Earphones' }, stamps: 1000, quota: 100, remaining: 75 },
      { name: { 'zh-TW': '智能手環', 'zh-CN': '智能手环', en: 'Smart Band' }, stamps: 1500, quota: 50, remaining: 38 },
    ],
    participating: 3800,
    maxParticipants: 10000,
    merchants: ['Apple', 'Samsung', 'Sony', 'Bose', 'Dyson', 'Fortress'],
    tags: { 'zh-TW': ['科技', '9折', '限量配件'], 'zh-CN': ['科技', '9折', '限量配件'], en: ['Tech', '10% Off', 'Limited Accessories'] },
  },
  c10: {
    id: 'c10',
    title: { 'zh-TW': '晚間免費泊車優惠', 'zh-CN': '晚间免费泊车优惠', en: 'Evening Free Parking' },
    mall: { 'zh-TW': '又一城 Festival Walk', 'zh-CN': '又一城 Festival Walk', en: 'Festival Walk' },
    date: { 'zh-TW': '長期優惠', 'zh-CN': '长期优惠', en: 'Ongoing Offer' },
    dateRange: { start: '2026-01-01', end: '2026-12-31' },
    type: { 'zh-TW': '泊車優惠', 'zh-CN': '泊车优惠', en: 'Parking Offer' },
    color: '#546E7A',
    image: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&q=80',
    desc: { 'zh-TW': '晚上7時後消費滿HK$100享免費泊車', 'zh-CN': '晚上7时后消费满HK$100享免费泊车', en: 'Free parking after 7pm with HK$100 spend' },
    fullDesc: { 'zh-TW': '又一城推出晚間免費泊車優惠！晚上7時後入場，以指定電子付款方式消費滿HK$100，即可享1小時免費泊車（每日最多3小時）。會員更可享額外泊車優惠！', 'zh-CN': '又一城推出晚间免费泊车优惠！晚上7时后入场，以指定电子付款方式消费满HK$100，即可享1小时免费泊车（每日最多3小时）。会员更可享额外泊车优惠！', en: 'Festival Walk offers evening free parking! Enter after 7pm and spend HK$100 with designated e-payment to enjoy 1 hour free parking (max 3 hours/day). Members enjoy extra parking benefits!' },
    rules: {
      'zh-TW': ['適用於晚上7時至11時59分入場車輛', '需以指定電子付款方式消費', '每HK$100消費可享1小時免費泊車', '每日最多可享3小時免費泊車', '會員可享額外1小時免費泊車'],
      'zh-CN': ['适用于晚上7时至11时59分入场车辆', '需以指定电子付款方式消费', '每HK$100消费可享1小时免费泊车', '每日最多可享3小时免费泊车', '会员可享额外1小时免费泊车'],
      en: ['Valid for vehicles entering 7pm-11:59pm', 'Requires designated e-payment', 'Every HK$100 spend = 1 hour free parking', 'Maximum 3 hours free parking per day', 'Members enjoy extra 1 hour free parking'],
    },
    howTo: [
      { step: { 'zh-TW': '晚上7時後駕車進入停車場', 'zh-CN': '晚上7时后驾车进入停车场', en: 'Enter car park after 7pm' }, icon: '🚗' },
      { step: { 'zh-TW': '於商場消費滿HK$100', 'zh-CN': '于商场消费满HK$100', en: 'Spend HK$100 at the mall' }, icon: '🛍️' },
      { step: { 'zh-TW': '於泊車優惠機登記收據', 'zh-CN': '于泊车优惠机登记收据', en: 'Register receipt at parking kiosk' }, icon: '🖥️' },
      { step: { 'zh-TW': '享受免費泊車', 'zh-CN': '享受免费泊车', en: 'Enjoy free parking' }, icon: '✅' },
    ],
    rewards: [],
    participating: 45000,
    maxParticipants: 0,
    merchants: ['All Merchants'],
    tags: { 'zh-TW': ['泊車', '免費', '晚間優惠'], 'zh-CN': ['泊车', '免费', '晚间优惠'], en: ['Parking', 'Free', 'Evening Offer'] },
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
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const campaignSource = campaignDataSource[id || ''] || defaultCampaignData;
  const [isFavorite, setIsFavorite] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  // Get joined status from localStorage (only for authenticated users)
  const joinedCampaigns = isAuthenticated ? getJoinedCampaigns() : {};
  const joinedData = joinedCampaigns[id || ''];
  const [isJoined, setIsJoined] = useState(isAuthenticated && !!joinedData);
  const [participationCode, setParticipationCode] = useState(joinedData?.code || '');

  // Multilingual labels for login prompt
  const loginLabels = {
    loginRequired: { 'zh-TW': '請先登入', 'zh-CN': '请先登录', en: 'Please Login First' },
    loginToJoin: { 'zh-TW': '登入後即可參與活動', 'zh-CN': '登录后即可参与活动', en: 'Login to participate in this campaign' },
    login: { 'zh-TW': '登入 / 註冊', 'zh-CN': '登录 / 注册', en: 'Login / Register' },
  };

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

  // Generate unique participation code
  const generateParticipationCode = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `LM-${campaign.id.toUpperCase()}-${timestamp}-${random}`;
  };

  const handleJoin = () => {
    // Check authentication first
    if (!isAuthenticated) {
      Modal.confirm({
        title: loginLabels.loginRequired[locale],
        content: loginLabels.loginToJoin[locale],
        confirmText: loginLabels.login[locale],
        cancelText: t('common.cancel'),
        onConfirm: () => {
          // Save redirect path and go to login
          sessionStorage.setItem('redirect_after_login', `/campaign/${id}`);
          navigate('/login');
        },
      });
      return;
    }

    if (isJoined) {
      // If already joined, show QR code
      setShowQRCode(true);
    } else {
      Modal.confirm({
        title: t('campaign.confirmJoin'),
        content: t('campaign.confirmJoinContent', { title: campaign.title }),
        confirmText: t('common.confirm'),
        cancelText: t('common.cancel'),
        onConfirm: () => {
          const code = generateParticipationCode();
          setParticipationCode(code);
          setIsJoined(true);
          // Save to localStorage
          saveJoinedCampaign(id || '', code);
          Toast.show({ content: t('campaign.joinSuccess'), icon: 'success' });
          // Show QR code after a short delay
          setTimeout(() => setShowQRCode(true), 500);
        },
      });
    }
  };

  const handleShowQRCode = () => {
    // Check authentication first
    if (!isAuthenticated) {
      Modal.confirm({
        title: loginLabels.loginRequired[locale],
        content: loginLabels.loginToJoin[locale],
        confirmText: loginLabels.login[locale],
        cancelText: t('common.cancel'),
        onConfirm: () => {
          sessionStorage.setItem('redirect_after_login', `/campaign/${id}`);
          navigate('/login');
        },
      });
      return;
    }
    if (!participationCode) {
      const code = generateParticipationCode();
      setParticipationCode(code);
      saveJoinedCampaign(id || '', code);
    }
    setShowQRCode(true);
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
      }}>
        {!isAuthenticated ? (
          // Guest - show login button
          <Button
            block
            size="large"
            color="primary"
            onClick={handleJoin}
            style={{
              '--background-color': PRIMARY,
              '--border-color': PRIMARY,
              borderRadius: 12,
              fontWeight: 600
            } as React.CSSProperties}
          >
            {loginLabels.login[locale]}
          </Button>
        ) : isJoined ? (
          // Authenticated and joined - show credential button
          <Button
            block
            size="large"
            color="primary"
            onClick={handleShowQRCode}
            style={{
              '--background-color': PRIMARY,
              '--border-color': PRIMARY,
              borderRadius: 12,
              fontWeight: 600,
            } as React.CSSProperties}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <QrcodeIcon />
              {t('campaign.showCredential')}
            </span>
          </Button>
        ) : (
          // Authenticated but not joined - show join button
          <Button
            block
            size="large"
            color="primary"
            onClick={handleJoin}
            style={{
              '--background-color': PRIMARY,
              '--border-color': PRIMARY,
              borderRadius: 12,
              fontWeight: 600
            } as React.CSSProperties}
          >
            {t('campaign.joinNow')}
          </Button>
        )}
      </div>

      {/* QR Code Modal */}
      <Modal
        visible={showQRCode}
        onClose={() => setShowQRCode(false)}
        title={t('campaign.participationCredential')}
        content={
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              background: '#fff',
              padding: 20,
              borderRadius: 16,
              display: 'inline-block',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }}>
              <QRCodeSVG
                value={JSON.stringify({
                  type: 'campaign_participation',
                  campaignId: campaign.id,
                  campaignTitle: campaign.title,
                  code: participationCode,
                  validUntil: campaign.dateRange.end,
                })}
                size={200}
                level="H"
                includeMargin
                fgColor={PRIMARY}
              />
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>{campaign.title}</div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{t('campaign.credentialCode')}: {participationCode}</div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{t('campaign.validUntil')}: {campaign.dateRange.end}</div>
            </div>
            <div style={{
              marginTop: 16,
              padding: '10px 16px',
              background: '#f5f5f5',
              borderRadius: 8,
              fontSize: 12,
              color: '#666',
            }}>
              {t('campaign.credentialTip')}
            </div>
          </div>
        }
        closeOnAction
        actions={[
          {
            key: 'close',
            text: t('common.confirm'),
            primary: true,
          },
        ]}
      />
    </div>
  );
}
