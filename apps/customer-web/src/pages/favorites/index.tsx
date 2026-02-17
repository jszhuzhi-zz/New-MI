import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar, Tabs, Card, Empty, Dialog, Toast, Image, Tag } from 'antd-mobile';
import { HeartFill } from 'antd-mobile-icons';
import { useTranslation } from '../../locales';
import { useSettingsStore, type Locale } from '../../store/settings';

interface MerchantData {
  id: string;
  name: string;
  category: Record<Locale, string>;
  logo: string;
  floor: string;
}

interface CampaignData {
  id: string;
  title: Record<Locale, string>;
  image: string;
  validUntil: string;
  stampMultiplier?: number;
}

const merchantsData: MerchantData[] = [
  {
    id: '1',
    name: 'Starbucks',
    category: { 'zh-TW': '餐飲', 'zh-CN': '餐饮', en: 'F&B' },
    logo: 'https://logo.clearbit.com/starbucks.com',
    floor: 'G/F',
  },
  {
    id: '2',
    name: 'UNIQLO',
    category: { 'zh-TW': '時裝', 'zh-CN': '时装', en: 'Fashion' },
    logo: 'https://logo.clearbit.com/uniqlo.com',
    floor: '2/F',
  },
  {
    id: '3',
    name: 'Apple Store',
    category: { 'zh-TW': '電子產品', 'zh-CN': '电子产品', en: 'Electronics' },
    logo: 'https://logo.clearbit.com/apple.com',
    floor: '1/F',
  },
  {
    id: '4',
    name: 'H&M',
    category: { 'zh-TW': '時裝', 'zh-CN': '时装', en: 'Fashion' },
    logo: 'https://logo.clearbit.com/hm.com',
    floor: '3/F',
  },
];

const campaignsData: CampaignData[] = [
  {
    id: 'c1',
    title: { 'zh-TW': '新春印花三倍賞', 'zh-CN': '新春印花三倍赏', en: 'Triple Stamps for CNY' },
    image: 'https://images.unsplash.com/photo-1549451371-64aa98a6f660?w=400',
    validUntil: '2026-02-28',
    stampMultiplier: 3,
  },
  {
    id: 'c2',
    title: { 'zh-TW': '春日美食節', 'zh-CN': '春日美食节', en: 'Spring Food Festival' },
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
    validUntil: '2026-03-31',
  },
  {
    id: 'c3',
    title: { 'zh-TW': '會員生日禮遇', 'zh-CN': '会员生日礼遇', en: 'Birthday Rewards' },
    image: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=400',
    validUntil: '2026-12-31',
    stampMultiplier: 2,
  },
];

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { t, locale } = useTranslation();
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();
  const [activeTab, setActiveTab] = useState('merchants');
  const [deletedMerchantIds, setDeletedMerchantIds] = useState<string[]>([]);
  const [deletedCampaignIds, setDeletedCampaignIds] = useState<string[]>([]);

  const merchants = useMemo(() => {
    return merchantsData
      .filter((m) => !deletedMerchantIds.includes(m.id))
      .map((m) => ({
        id: m.id,
        name: m.name,
        category: m.category[locale],
        logo: m.logo,
        floor: m.floor,
      }));
  }, [locale, deletedMerchantIds]);

  const campaigns = useMemo(() => {
    return campaignsData
      .filter((c) => !deletedCampaignIds.includes(c.id))
      .map((c) => ({
        id: c.id,
        title: c.title[locale],
        image: c.image,
        validUntil: c.validUntil,
        stampMultiplier: c.stampMultiplier,
      }));
  }, [locale, deletedCampaignIds]);

  const confirmRemoveText = {
    'zh-TW': '確定取消收藏？',
    'zh-CN': '确定取消收藏？',
    en: 'Remove from favorites?',
  }[locale];

  const removedText = {
    'zh-TW': '已取消收藏',
    'zh-CN': '已取消收藏',
    en: 'Removed',
  }[locale];

  const validUntilText = {
    'zh-TW': '有效期至',
    'zh-CN': '有效期至',
    en: 'Valid until',
  }[locale];

  const stampsText = {
    'zh-TW': '印花',
    'zh-CN': '印花',
    en: 'Stamps',
  }[locale];

  const removeMerchant = async (id: string) => {
    const result = await Dialog.confirm({
      content: confirmRemoveText,
      confirmText: t('common.confirm'),
      cancelText: t('common.cancel'),
    });
    if (result) {
      setDeletedMerchantIds((prev) => [...prev, id]);
      Toast.show({ content: removedText, icon: 'success' });
    }
  };

  const removeCampaign = async (id: string) => {
    const result = await Dialog.confirm({
      content: confirmRemoveText,
      confirmText: t('common.confirm'),
      cancelText: t('common.cancel'),
    });
    if (result) {
      setDeletedCampaignIds((prev) => [...prev, id]);
      Toast.show({ content: removedText, icon: 'success' });
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
                    onClick={() => navigate(`/campaign/${campaign.id}`)}
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
                            {validUntilText}: {campaign.validUntil}
                          </div>
                          {campaign.stampMultiplier && (
                            <Tag
                              color="primary"
                              style={{
                                marginTop: 8,
                                background: colors.primary,
                              }}
                            >
                              {campaign.stampMultiplier}x {stampsText}
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
