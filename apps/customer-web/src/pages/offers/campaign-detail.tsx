import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NavBar, Card, List, Tag, Button, Divider, Toast, Image, Swiper, Modal, ProgressBar } from 'antd-mobile';
import { HeartOutline, HeartFill, ShareOutline, ClockCircleOutline, LocationFill, GiftOutline } from 'antd-mobile-icons';

const PRIMARY = '#00694B';

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

const campaignData: Record<string, Campaign> = {
  c1: {
    id: 'c1',
    title: '新春印花三倍賞',
    mall: '又一城 Festival Walk',
    date: '2026.01.15 - 2026.02.28',
    dateRange: { start: '2026-01-15', end: '2026-02-28' },
    type: '印花加倍',
    color: '#C62828',
    image: 'https://images.unsplash.com/photo-1549451371-64aa98a6f660?w=800&q=80',
    desc: '農曆新年期間所有消費可獲三倍印花獎賞',
    fullDesc: '農曆新年期間於又一城購物，所有消費均可獲得三倍印花獎賞！無論是年貨採購、新衣添置還是賀年美食，每一筆消費都能讓您更快累積印花，輕鬆升級會員等級。金卡及以上會員更可享額外獎賞！',
    rules: [
      '活動期間於又一城任何商戶消費即可享三倍印花',
      '每筆消費最少滿HK$50方可參加',
      '印花將於消費後48小時內存入帳戶',
      '每位會員每日最多可獲取3,000印花',
      '本活動不可與其他印花加倍活動同時使用',
      '金卡及以上會員可享額外10%印花獎勵',
      '領展保留最終決定權及解釋權',
    ],
    howTo: [
      { step: '於又一城商戶消費後保留收據', icon: '🧾' },
      { step: '打開 Link Mall App 點擊「掃碼」', icon: '📱' },
      { step: '掃描收據上的二維碼', icon: '📷' },
      { step: '系統自動計算三倍印花並存入帳戶', icon: '✨' },
    ],
    rewards: [
      { name: 'HK$50 美食券', stamps: 500, quota: 1000, remaining: 234 },
      { name: '免費泊車3小時', stamps: 300, quota: 500, remaining: 89 },
      { name: '限量版利是封套裝', stamps: 200, quota: 2000, remaining: 567 },
    ],
    participating: 12580,
    maxParticipants: 0,
    merchants: ['全線商戶適用'],
    tags: ['新春限定', '三倍印花', '限時優惠'],
    isJoined: true,
  },
  c2: {
    id: 'c2',
    title: '春日美食節',
    mall: '又一城 Festival Walk',
    date: '2026.02.01 - 2026.03.31',
    dateRange: { start: '2026-02-01', end: '2026-03-31' },
    type: '餐飲優惠',
    color: '#E65100',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    desc: '指定餐廳消費享額外印花及折扣優惠',
    fullDesc: '春暖花開的季節，與親友一同品嚐又一城的精選美食！活動期間於指定餐廳消費，每筆滿HK$100即可獲得額外50印花，部分餐廳更提供會員專屬9折優惠。',
    rules: [
      '適用於又一城指定餐飲商戶（見下方列表）',
      '每筆消費滿HK$100可獲額外50印花',
      '每位會員每日最多可獲3次額外印花',
      '需於付款前出示會員QR碼',
      '部分餐廳提供會員專屬9折優惠',
      '不可與其他優惠同時使用',
    ],
    howTo: [
      { step: '前往指定參與餐廳', icon: '🍽️' },
      { step: '消費前出示會員QR碼', icon: '📱' },
      { step: '付款後掃描收據獲取印花', icon: '🧾' },
      { step: '享受美食並累積印花', icon: '🎉' },
    ],
    rewards: [
      { name: '免費甜品一份', stamps: 150, quota: 800, remaining: 456 },
      { name: 'HK$100 餐飲現金券', stamps: 800, quota: 300, remaining: 123 },
    ],
    participating: 5680,
    maxParticipants: 10000,
    merchants: ['Pacific Coffee', 'Starbucks', "Dan Ryan's Chicago Grill", 'Triple O\'s', 'PizzaExpress', 'Pepper Lunch', 'Genki Sushi', 'Tamjai Yunnan Mixian'],
    tags: ['餐飲', '額外印花', '會員優惠'],
    isJoined: false,
  },
  c3: {
    id: 'c3',
    title: '會員生日禮遇',
    mall: '全線商場',
    date: '全年適用',
    dateRange: { start: '2026-01-01', end: '2026-12-31' },
    type: '生日優惠',
    color: '#7B1FA2',
    image: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=800&q=80',
    desc: '生日月份專屬雙倍印花及神秘禮物',
    fullDesc: '領展會員尊享生日禮遇！在您的生日月份，所有消費均可獲得雙倍印花。金卡及以上會員更可親臨客戶服務中心領取精美生日禮物一份！',
    rules: [
      '適用於會員生日當月整個月份',
      '所有消費自動享有雙倍印花',
      '金卡/白金/鑽石會員可領取生日禮物',
      '生日禮物需於生日月份內領取',
      '每位會員每年只可享用一次',
    ],
    howTo: [
      { step: '確保會員資料中的生日日期正確', icon: '📝' },
      { step: '生日月份消費自動享雙倍印花', icon: '✨' },
      { step: '金卡以上會員前往客服中心', icon: '🎁' },
      { step: '出示會員QR碼領取生日禮物', icon: '🎂' },
    ],
    rewards: [
      { name: '生日驚喜禮盒（金卡）', stamps: 0, quota: 999, remaining: 999 },
      { name: '生日豪華禮盒（白金）', stamps: 0, quota: 999, remaining: 999 },
      { name: '生日尊貴禮盒（鑽石）', stamps: 0, quota: 999, remaining: 999 },
    ],
    participating: 28900,
    maxParticipants: 0,
    merchants: ['全線商戶適用'],
    tags: ['生日', '雙倍印花', '免費禮物'],
    isJoined: true,
  },
  c4: {
    id: 'c4',
    title: '週末快閃：UNIQLO 額外印花',
    mall: '又一城 Festival Walk',
    date: '2026.02.08 - 2026.02.09',
    dateRange: { start: '2026-02-08', end: '2026-02-09' },
    type: '快閃活動',
    color: '#D32F2F',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
    desc: '本週末限定！UNIQLO 消費額外獲50印花',
    fullDesc: '本週末於又一城UNIQLO消費，除基本印花外，每筆消費滿HK$300更可額外獲得50印花！數量有限，先到先得。',
    rules: [
      '僅限2026年2月8日至9日',
      '每筆消費滿HK$300可獲額外50印花',
      '每位會員限享3次',
      '需出示會員QR碼',
      '名額有限，額滿即止',
    ],
    howTo: [
      { step: '前往又一城 UNIQLO', icon: '👕' },
      { step: '選購滿HK$300商品', icon: '🛒' },
      { step: '付款時出示會員QR碼', icon: '📱' },
      { step: '掃描收據領取額外印花', icon: '✨' },
    ],
    rewards: [],
    participating: 890,
    maxParticipants: 2000,
    merchants: ['UNIQLO (L1)'],
    tags: ['快閃', '限時', 'UNIQLO'],
    isJoined: false,
  },
};

const defaultCampaign: Campaign = {
  id: 'default',
  title: '活動詳情',
  mall: '全線商場',
  date: '進行中',
  dateRange: { start: '2026-01-01', end: '2026-12-31' },
  type: '活動',
  color: PRIMARY,
  image: '',
  desc: '歡迎參加領展會員活動，享受專屬優惠。',
  fullDesc: '歡迎參加領展會員活動，享受專屬優惠。',
  rules: ['請留意活動相關條款及細則', '領展保留最終決定權'],
  howTo: [
    { step: '前往指定商場參與活動', icon: '🏬' },
    { step: '出示會員QR碼即可參加', icon: '📱' },
  ],
  rewards: [],
  participating: 0,
  maxParticipants: 0,
  merchants: [],
  tags: [],
};

export default function CampaignDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const campaign = campaignData[id || ''] || defaultCampaign;
  const [isFavorite, setIsFavorite] = useState(false);
  const [isJoined, setIsJoined] = useState(campaign.isJoined || false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: campaign.title,
        text: campaign.desc,
        url: window.location.href,
      });
    } else {
      Toast.show({ content: '已複製活動連結', icon: 'success' });
    }
  };

  const handleJoin = () => {
    if (isJoined) {
      Toast.show({ content: '您已參加此活動', icon: 'success' });
    } else {
      Modal.confirm({
        title: '確認參加',
        content: `確定要參加「${campaign.title}」嗎？`,
        confirmText: '確認',
        cancelText: '取消',
        onConfirm: () => {
          setIsJoined(true);
          Toast.show({ content: '成功參加活動！', icon: 'success' });
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
              <ShareOutline fontSize={22} color="#fff" />
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
              已有 <span style={{ color: PRIMARY, fontWeight: 600 }}>{campaign.participating.toLocaleString()}</span> 人參加
            </span>
            {campaign.maxParticipants > 0 && (
              <span style={{ fontSize: 12, color: '#999' }}>
                名額：{campaign.maxParticipants.toLocaleString()}
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
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>活動詳情</div>
          <div style={{ fontSize: 14, color: '#666', lineHeight: 1.8 }}>{campaign.fullDesc}</div>
        </Card>
      </div>

      {/* How to Participate */}
      <div style={{ padding: '0 16px' }}>
        <Card style={{ borderRadius: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>如何參加</div>
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
                <div style={{ fontSize: 12, color: '#999', marginBottom: 2 }}>步驟 {i + 1}</div>
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
              活動獎賞
            </div>
            {campaign.rewards.map((reward, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 0', borderBottom: i < campaign.rewards.length - 1 ? '1px solid #f0f0f0' : 'none'
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>{reward.name}</div>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                    {reward.stamps > 0 ? `${reward.stamps} 印花兌換` : '免費領取'} · 剩餘 {reward.remaining}/{reward.quota}
                  </div>
                </div>
                <Button size="mini" color="primary" fill="outline"
                  style={{ '--border-color': PRIMARY, '--text-color': PRIMARY } as React.CSSProperties}
                  onClick={() => navigate('/offers')}
                >
                  兌換
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
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>適用商戶</div>
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
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>條款及細則</div>
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
          {isJoined ? '✓ 已參加' : '立即參加'}
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
            掃碼
          </Button>
        )}
      </div>
    </div>
  );
}
