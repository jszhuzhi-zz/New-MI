import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NavBar, Card, Empty, Image } from 'antd-mobile';
import { useSettingsStore, type Locale } from '../../store/settings';
import { useTranslation } from '../../locales';

interface NewsData {
  id: string;
  title: Record<Locale, string>;
  content: Record<Locale, string>;
  date: string;
  image: string;
}

const newsData: NewsData[] = [
  {
    id: 'n1',
    title: { 'zh-TW': '領展商場推出全新環保倡議', 'zh-CN': '领展商场推出全新环保倡议', en: 'Link REIT Launches New Green Initiative' },
    content: {
      'zh-TW': '領展今日宣布推出全新環保倡議計劃，致力於減少商場碳排放並推廣可持續發展。該計劃包括安裝太陽能板、推行電動車充電設施、以及鼓勵商戶採用環保包裝。\n\n會員參與環保活動更可獲得額外印花獎賞，包括自備購物袋、參與回收計劃等。我們期待與您一起共建綠色未來！',
      'zh-CN': '领展今日宣布推出全新环保倡议计划，致力于减少商场碳排放并推广可持续发展。该计划包括安装太阳能板、推行电动车充电设施、以及鼓励商户采用环保包装。\n\n会员参与环保活动更可获得额外印花奖赏，包括自备购物袋、参与回收计划等。我们期待与您一起共建绿色未来！',
      en: 'Link REIT today announced a new green initiative program, committed to reducing mall carbon emissions and promoting sustainable development. The program includes installing solar panels, implementing EV charging facilities, and encouraging merchants to use eco-friendly packaging.\n\nMembers can earn extra stamp rewards by participating in green activities, including bringing your own shopping bags and joining recycling programs. We look forward to building a greener future with you!'
    },
    date: '2026-02-15',
    image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80'
  },
  {
    id: 'n2',
    title: { 'zh-TW': '全新餐飲品牌進駐屯門市廣場', 'zh-CN': '全新餐饮品牌进驻屯门市广场', en: 'New F&B Brands Open at Tuen Mun Town Plaza' },
    content: {
      'zh-TW': '屯門市廣場迎來多間全新餐飲品牌，包括米芝蓮推介餐廳及人氣甜品店。新店鋪位於商場L2層美食區，提供多元化的餐飲選擇。\n\n開幕期間更有限定優惠，消費滿HK$100即可獲贈限量紀念品！印花會員更可享額外1.5倍印花獎賞。',
      'zh-CN': '屯门市广场迎来多间全新餐饮品牌，包括米其林推介餐厅及人气甜品店。新店铺位于商场L2层美食区，提供多元化的餐饮选择。\n\n开幕期间更有限定优惠，消费满HK$100即可获赠限量纪念品！印花会员更可享额外1.5倍印花奖赏。',
      en: 'Tuen Mun Town Plaza welcomes several new F&B brands, including Michelin-recommended restaurants and popular dessert shops. The new stores are located in the L2 food zone, offering diverse dining options.\n\nEnjoy special opening promotions with free limited-edition gifts when you spend HK$100 or more! Stamp members can also earn 1.5x bonus stamps.'
    },
    date: '2026-02-10',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'
  },
  {
    id: 'n3',
    title: { 'zh-TW': '春季時裝展即將開幕', 'zh-CN': '春季时装展即将开幕', en: 'Spring Fashion Show Coming Soon' },
    content: {
      'zh-TW': '一年一度的春季時裝展將於3月初在又一城盛大舉行！屆時將展出多個國際及本地設計師的最新系列，並有模特兒走秀表演。\n\n活動期間購買指定品牌可獲雙倍印花，VIP會員更可優先入場及獲贈精美禮品包。立即登記參加，名額有限，先到先得！',
      'zh-CN': '一年一度的春季时装展将于3月初在又一城盛大举行！届时将展出多个国际及本地设计师的最新系列，并有模特走秀表演。\n\n活动期间购买指定品牌可获双倍印花，VIP会员更可优先入场及获赠精美礼品包。立即登记参加，名额有限，先到先得！',
      en: 'The annual Spring Fashion Show will be held at Festival Walk in early March! The event will showcase the latest collections from international and local designers, along with model runway shows.\n\nEarn double stamps on selected brands during the event. VIP members enjoy priority entry and complimentary gift bags. Register now - limited spots available!'
    },
    date: '2026-02-08',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'
  },
];

export default function NewsDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { locale } = useTranslation();
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();

  const labels = useMemo(() => ({
    newsDetail: { 'zh-TW': '消息詳情', 'zh-CN': '消息详情', en: 'News Detail' },
    notFound: { 'zh-TW': '找不到該消息', 'zh-CN': '找不到该消息', en: 'News not found' },
  }), []);

  const news = newsData.find((n) => n.id === id);

  if (!news) {
    return (
      <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
        <NavBar onBack={() => navigate(-1)} style={{ background: '#fff' }}>
          {labels.newsDetail[locale]}
        </NavBar>
        <div style={{ padding: 40 }}>
          <Empty description={labels.notFound[locale]} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <NavBar onBack={() => navigate(-1)} style={{ background: '#fff' }}>
        {labels.newsDetail[locale]}
      </NavBar>

      {/* Hero Image */}
      <Image
        src={news.image}
        fit="cover"
        style={{ width: '100%', height: 200 }}
      />

      {/* Content */}
      <div style={{ padding: 16 }}>
        <Card style={{ borderRadius: 12 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#333', marginBottom: 8 }}>
            {news.title[locale]}
          </div>
          <div style={{ fontSize: 13, color: '#999', marginBottom: 16 }}>
            {news.date}
          </div>
          <div style={{
            fontSize: 15,
            color: '#333',
            lineHeight: 1.8,
            whiteSpace: 'pre-line',
          }}>
            {news.content[locale]}
          </div>
        </Card>
      </div>
    </div>
  );
}
