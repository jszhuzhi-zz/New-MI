import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar, Tabs, Card, Empty, Dialog, Toast, Image, Tag } from 'antd-mobile';
import { HeartFill } from 'antd-mobile-icons';
import { useTranslation } from '../../locales';
import { useSettingsStore } from '../../store/settings';

interface FavoriteMerchant {
  id: string;
  name: string;
  category: string;
  logo: string;
  floor: string;
}

interface FavoriteCampaign {
  id: string;
  title: string;
  image: string;
  validUntil: string;
  stampMultiplier?: number;
}

const mockMerchants: FavoriteMerchant[] = [
  {
    id: '1',
    name: 'Starbucks',
    category: 'F&B',
    logo: 'https://logo.clearbit.com/starbucks.com',
    floor: 'G/F',
  },
  {
    id: '2',
    name: 'UNIQLO',
    category: 'Fashion',
    logo: 'https://logo.clearbit.com/uniqlo.com',
    floor: '2/F',
  },
  {
    id: '3',
    name: 'Apple Store',
    category: 'Electronics',
    logo: 'https://logo.clearbit.com/apple.com',
    floor: '1/F',
  },
];

const mockCampaigns: FavoriteCampaign[] = [
  {
    id: '1',
    title: 'Double Stamps Weekend',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400',
    validUntil: '2026-02-28',
    stampMultiplier: 2,
  },
  {
    id: '2',
    title: 'Chinese New Year Special',
    image: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=400',
    validUntil: '2026-02-15',
  },
];

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { t, locale } = useTranslation();
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();
  const [activeTab, setActiveTab] = useState('merchants');
  const [merchants, setMerchants] = useState<FavoriteMerchant[]>(mockMerchants);
  const [campaigns, setCampaigns] = useState<FavoriteCampaign[]>(mockCampaigns);

  const removeMerchant = async (id: string) => {
    const result = await Dialog.confirm({
      content: locale === 'en' ? 'Remove from favorites?' : '確定取消收藏？',
      confirmText: t('common.confirm'),
      cancelText: t('common.cancel'),
    });
    if (result) {
      setMerchants((prev) => prev.filter((m) => m.id !== id));
      Toast.show({ content: locale === 'en' ? 'Removed' : '已取消收藏', icon: 'success' });
    }
  };

  const removeCampaign = async (id: string) => {
    const result = await Dialog.confirm({
      content: locale === 'en' ? 'Remove from favorites?' : '確定取消收藏？',
      confirmText: t('common.confirm'),
      cancelText: t('common.cancel'),
    });
    if (result) {
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      Toast.show({ content: locale === 'en' ? 'Removed' : '已取消收藏', icon: 'success' });
    }
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <NavBar onBack={() => navigate(-1)} style={{ background: '#fff' }}>
        {t('favorites.title')}
      </NavBar>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        style={{ background: '#fff' }}
      >
        <Tabs.Tab title={t('favorites.merchants')} key="merchants" />
        <Tabs.Tab title={t('favorites.campaigns')} key="campaigns" />
      </Tabs>

      <div style={{ padding: 16 }}>
        {activeTab === 'merchants' && (
          <>
            {merchants.length === 0 ? (
              <Empty
                description={t('favorites.noFavorites')}
                style={{ padding: '60px 0' }}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {merchants.map((merchant) => (
                  <Card
                    key={merchant.id}
                    onClick={() => navigate(`/mall/merchant/${merchant.id}`)}
                    style={{ borderRadius: 12 }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                      }}
                    >
                      <Image
                        src={merchant.logo}
                        width={56}
                        height={56}
                        fit="contain"
                        style={{ borderRadius: 8, background: '#f5f5f5' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 16 }}>
                          {merchant.name}
                        </div>
                        <div
                          style={{
                            color: '#666',
                            fontSize: 13,
                            marginTop: 4,
                          }}
                        >
                          {merchant.category} · {merchant.floor}
                        </div>
                      </div>
                      <HeartFill
                        style={{ color: '#ff4d4f', fontSize: 24 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeMerchant(merchant.id);
                        }}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'campaigns' && (
          <>
            {campaigns.length === 0 ? (
              <Empty
                description={t('favorites.noFavorites')}
                style={{ padding: '60px 0' }}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {campaigns.map((campaign) => (
                  <Card
                    key={campaign.id}
                    onClick={() => navigate(`/offers/campaign/${campaign.id}`)}
                    style={{ borderRadius: 12, overflow: 'hidden', padding: 0 }}
                  >
                    <Image
                      src={campaign.image}
                      width="100%"
                      height={140}
                      fit="cover"
                    />
                    <div style={{ padding: 12 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 15 }}>
                            {campaign.title}
                          </div>
                          <div
                            style={{
                              color: '#666',
                              fontSize: 12,
                              marginTop: 4,
                            }}
                          >
                            {locale === 'en' ? 'Valid until' : '有效期至'}: {campaign.validUntil}
                          </div>
                          {campaign.stampMultiplier && (
                            <Tag
                              color="primary"
                              style={{
                                marginTop: 8,
                                background: colors.primary,
                              }}
                            >
                              {campaign.stampMultiplier}x {locale === 'en' ? 'Stamps' : '印花'}
                            </Tag>
                          )}
                        </div>
                        <HeartFill
                          style={{ color: '#ff4d4f', fontSize: 24 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCampaign(campaign.id);
                          }}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
