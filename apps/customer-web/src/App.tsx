import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd-mobile';
import zhTW from 'antd-mobile/es/locales/zh-TW';
import TabLayout from './components/TabLayout';
import Home from './pages/home';
import StampPage from './pages/stamp';
import StampDetail from './pages/stamp/detail';
import ScanPage from './pages/scan';
import OffersPage from './pages/offers';
import CampaignDetail from './pages/offers/campaign-detail';
import CouponDetail from './pages/offers/coupon-detail';
import ProfilePage from './pages/profile';
import TierPage from './pages/profile/tier';
import SettingsPage from './pages/profile/settings';
import MallDirectory from './pages/mall/directory';
import MerchantDetail from './pages/mall/merchant-detail';
import CheckInPage from './pages/checkin';
import { useAuthStore } from './store/auth';

const globalStyles = `
  .adm-tab-bar {
    --adm-color-primary: #00694B !important;
  }
  .adm-tabs-tab-active {
    color: #00694B !important;
  }
  .adm-tabs-tab-line {
    background: #00694B !important;
  }
  .adm-button-primary {
    --background-color: #00694B !important;
    --border-color: #00694B !important;
  }
  .adm-pull-to-refresh-head-content {
    color: #00694B !important;
  }
  .link-page {
    min-height: 100vh;
    background: #F5F5F5;
    padding-bottom: env(safe-area-inset-bottom);
  }
  .link-page-with-tabs {
    padding-bottom: 50px;
  }
  .link-nav-bar {
    background: #00694B !important;
    color: #fff !important;
    --height: 45px;
  }
  .link-nav-bar .adm-nav-bar-back-arrow,
  .link-nav-bar .adm-nav-bar-title,
  .link-nav-bar .adm-nav-bar-right {
    color: #fff !important;
  }
  .link-card {
    border-radius: 12px;
    overflow: hidden;
  }
  .link-section {
    padding: 12px 16px;
  }
  .link-section-title {
    font-size: 17px;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .link-section-title .more {
    font-size: 13px;
    font-weight: 400;
    color: #999;
  }
  .gold-text {
    color: #C4A962;
  }
  .green-text {
    color: #00694B;
  }
  .green-bg {
    background: #00694B;
  }
  .gold-bg {
    background: #C4A962;
  }
`;

export default function App() {
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);

  // Auto-login for demo
  useEffect(() => {
    if (!useAuthStore.getState().token) {
      setToken('demo-token-2026');
      setUser({
        id: 'member_001',
        name: '陳小明',
        nameEn: 'Chan Siu Ming',
        phone: '+852 9123 4567',
        email: 'siuming@example.com',
        cardNo: 'LM-2024-0088',
        tier: 'gold',
        tierName: '金卡會員',
        stampBalance: 2580,
        avatar: null,
      });
    }
  }, []);

  return (
    <ConfigProvider locale={zhTW}>
      <style>{globalStyles}</style>
      <BrowserRouter>
        <Routes>
          <Route element={<TabLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/stamp" element={<StampPage />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route path="/stamp/:id" element={<StampDetail />} />
          <Route path="/campaign/:id" element={<CampaignDetail />} />
          <Route path="/coupon/:id" element={<CouponDetail />} />
          <Route path="/tier" element={<TierPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/mall" element={<MallDirectory />} />
          <Route path="/merchant/:id" element={<MerchantDetail />} />
          <Route path="/checkin" element={<CheckInPage />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}
