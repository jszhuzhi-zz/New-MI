import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar, Card, Button, Tag, Toast, Dialog, Tabs, SearchBar, Grid } from 'antd-mobile';
import { GiftOutline, RightOutline } from 'antd-mobile-icons';
import { useAuthStore } from '../../store/auth';
import { useLocale } from '../../hooks/useLocale';

const PRIMARY = '#00694B';
const GOLD = '#C4A962';

interface Gift {
  id: string;
  name: string;
  nameTW: string;
  stamps: number;
  category: string;
  image: string;
  description: string;
  stock: number;
  popular?: boolean;
}

const gifts: Gift[] = [
  { id: 'g1', name: 'HK$50 Mall Voucher', nameTW: 'HK$50商場禮券', stamps: 500, category: '禮券', image: '🎟️', description: '可於商場內任何商戶使用', stock: 100 },
  { id: 'g2', name: 'HK$100 Mall Voucher', nameTW: 'HK$100商場禮券', stamps: 950, category: '禮券', image: '🎫', description: '可於商場內任何商戶使用', stock: 50, popular: true },
  { id: 'g3', name: 'Premium Coffee Set', nameTW: '精品咖啡套裝', stamps: 800, category: '生活', image: '☕', description: '精選咖啡豆禮盒裝', stock: 30 },
  { id: 'g4', name: 'Eco Shopping Bag', nameTW: '環保購物袋', stamps: 200, category: '生活', image: '🛍️', description: '時尚環保購物袋', stock: 200 },
  { id: 'g5', name: 'Movie Ticket x2', nameTW: '電影戲票兩張', stamps: 600, category: '娛樂', image: '🎬', description: '指定影院電影票兩張', stock: 80, popular: true },
  { id: 'g6', name: 'Spa Voucher', nameTW: 'SPA體驗券', stamps: 1500, category: '體驗', image: '💆', description: '60分鐘水療體驗', stock: 20 },
  { id: 'g7', name: 'Dining Voucher HK$200', nameTW: 'HK$200餐飲券', stamps: 1800, category: '餐飲', image: '🍽️', description: '指定餐廳消費抵用', stock: 40 },
  { id: 'g8', name: 'Fitness Class Pass', nameTW: '健身課程體驗', stamps: 1000, category: '體驗', image: '🏋️', description: '一週無限次健身體驗', stock: 25 },
  { id: 'g9', name: 'Designer Umbrella', nameTW: '設計師雨傘', stamps: 350, category: '生活', image: '☂️', description: '時尚折疊雨傘', stock: 150 },
  { id: 'g10', name: 'Parking Coupon x5', nameTW: '泊車券五張', stamps: 400, category: '服務', image: '🅿️', description: '商場免費泊車三小時', stock: 300, popular: true },
];

export default function GiftsPage() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const stampBalance = user?.stampBalance || 0;

  const categories = [
    { key: 'all', label: t('customerApp.categoryAll') },
    { key: '禮券', label: t('customerApp.categoryVoucher') },
    { key: '生活', label: t('customerApp.categoryLife') },
    { key: '娛樂', label: t('customerApp.categoryEntertainment') },
    { key: '體驗', label: t('customerApp.categoryExperience') },
    { key: '餐飲', label: t('customerApp.categoryDining') },
    { key: '服務', label: t('customerApp.categoryService') },
  ];

  const filteredGifts = gifts.filter(g => {
    const matchCategory = activeTab === 'all' || g.category === activeTab;
    const matchSearch = !searchText ||
      g.name.toLowerCase().includes(searchText.toLowerCase()) ||
      g.nameTW.includes(searchText);
    return matchCategory && matchSearch;
  });

  const handleRedeem = async (gift: Gift) => {
    if (stampBalance < gift.stamps) {
      Toast.show({ icon: 'fail', content: t('customerApp.insufficientStamps') });
      return;
    }

    const confirmed = await Dialog.confirm({
      title: t('customerApp.confirmRedeem'),
      content: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{gift.image}</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{gift.nameTW}</div>
          <div style={{ color: '#999', marginBottom: 12 }}>{gift.description}</div>
          <div style={{ color: GOLD, fontWeight: 600 }}>
            {t('customerApp.consume')} {gift.stamps} {t('customerApp.stamps')}
          </div>
        </div>
      ),
      confirmText: t('customerApp.confirmRedeem'),
      cancelText: t('common.cancel'),
    });

    if (confirmed) {
      setRedeeming(gift.id);
      await new Promise(resolve => setTimeout(resolve, 1500));

      setUser({
        ...user,
        stampBalance: stampBalance - gift.stamps,
      });

      setRedeeming(null);

      Dialog.alert({
        title: t('customerApp.redeemSuccess'),
        content: (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <div style={{ marginBottom: 8 }}>{t('customerApp.youHaveRedeemed')}</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: PRIMARY }}>{gift.nameTW}</div>
            <div style={{ marginTop: 12, fontSize: 13, color: '#999' }}>
              {t('customerApp.viewInCoupons')}
            </div>
          </div>
        ),
        confirmText: t('customerApp.viewCoupons'),
        onConfirm: () => navigate('/offers'),
      });
    }
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <NavBar
        onBack={() => navigate(-1)}
        style={{
          '--height': '44px',
          background: PRIMARY,
          color: '#fff',
        } as React.CSSProperties}
        right={
          <div
            onClick={() => navigate('/stamp')}
            style={{
              fontSize: 12,
              background: 'rgba(255,255,255,0.2)',
              padding: '4px 10px',
              borderRadius: 12,
              cursor: 'pointer',
            }}
          >
            <span style={{ color: GOLD, fontWeight: 600 }}>{stampBalance.toLocaleString()}</span>
            <span style={{ marginLeft: 2 }}>{t('customerApp.stamps')}</span>
          </div>
        }
      >
        {t('customerApp.stampMall')}
      </NavBar>

      {/* Search */}
      <div style={{ padding: '16px 16px 12px' }}>
        <SearchBar
          placeholder={t('customerApp.searchGifts')}
          value={searchText}
          onChange={setSearchText}
          style={{
            '--background': '#fff',
            '--border-radius': '20px',
          } as React.CSSProperties}
        />
      </div>

      {/* Category Tabs */}
      <div style={{
        padding: '0 16px',
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        paddingBottom: 12,
      }}>
        {categories.map(cat => (
          <div
            key={cat.key}
            onClick={() => setActiveTab(cat.key)}
            style={{
              padding: '6px 14px',
              borderRadius: 16,
              fontSize: 13,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              background: activeTab === cat.key ? PRIMARY : '#fff',
              color: activeTab === cat.key ? '#fff' : '#666',
              fontWeight: activeTab === cat.key ? 600 : 400,
            }}
          >
            {cat.label}
          </div>
        ))}
      </div>

      {/* Popular Section */}
      {activeTab === 'all' && !searchText && (
        <div style={{ padding: '0 16px 12px' }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🔥</span> {t('customerApp.hotRedemption')}
          </div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {gifts.filter(g => g.popular).map(gift => (
              <div
                key={gift.id}
                onClick={() => handleRedeem(gift)}
                style={{
                  minWidth: 140,
                  background: '#fff',
                  borderRadius: 12,
                  padding: 12,
                  textAlign: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 6 }}>{gift.image}</div>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{gift.nameTW}</div>
                <Tag color="warning" fill="outline" style={{ fontSize: 11 }}>
                  {gift.stamps} {t('customerApp.stamps')}
                </Tag>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gift List */}
      <div style={{ padding: '0 16px 24px' }}>
        <Grid columns={2} gap={12}>
          {filteredGifts.map(gift => (
            <Grid.Item key={gift.id}>
              <Card
                style={{
                  borderRadius: 12,
                  overflow: 'hidden',
                  opacity: stampBalance < gift.stamps ? 0.6 : 1,
                }}
              >
                <div style={{ textAlign: 'center', padding: '16px 8px 8px' }}>
                  <div style={{ fontSize: 48, marginBottom: 8 }}>{gift.image}</div>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 500,
                    marginBottom: 4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {gift.nameTW}
                  </div>
                  <div style={{ fontSize: 11, color: '#999', marginBottom: 8 }}>
                    {gift.description}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0 0',
                    borderTop: '1px solid #f0f0f0',
                  }}>
                    <div style={{ color: GOLD, fontWeight: 600, fontSize: 14 }}>
                      {gift.stamps} <span style={{ fontSize: 11, fontWeight: 400 }}>{t('customerApp.stamps')}</span>
                    </div>
                    <Button
                      size="mini"
                      color="primary"
                      loading={redeeming === gift.id}
                      disabled={stampBalance < gift.stamps}
                      onClick={() => handleRedeem(gift)}
                      style={{
                        '--background-color': stampBalance >= gift.stamps ? PRIMARY : '#ccc',
                        '--border-color': stampBalance >= gift.stamps ? PRIMARY : '#ccc',
                        fontSize: 12,
                        padding: '4px 10px',
                      } as React.CSSProperties}
                    >
                      {stampBalance < gift.stamps ? t('customerApp.insufficient') : t('customerApp.redeemNow')}
                    </Button>
                  </div>
                  {gift.stock <= 30 && (
                    <div style={{
                      marginTop: 6,
                      fontSize: 10,
                      color: '#ff4d4f'
                    }}>
                      {t('customerApp.onlyLeft', { count: gift.stock })}
                    </div>
                  )}
                </div>
              </Card>
            </Grid.Item>
          ))}
        </Grid>

        {filteredGifts.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            <GiftOutline fontSize={48} />
            <div style={{ marginTop: 12 }}>{t('customerApp.noMatchingGifts')}</div>
          </div>
        )}
      </div>
    </div>
  );
}
