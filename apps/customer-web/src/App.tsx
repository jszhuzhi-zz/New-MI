import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
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
import LotteryDetail from './pages/offers/lottery';
import ProfilePage from './pages/profile';
import TierPage from './pages/profile/tier';
import SettingsPage from './pages/settings';
import ProfileEditPage from './pages/profile/edit';
import MallDirectory from './pages/mall/directory';
import MerchantDetail from './pages/mall/merchant-detail';
import CheckInPage from './pages/checkin';
import LoginPage from './pages/auth/login';
import GiftsPage from './pages/gifts';
import AICustomerServicePage from './pages/support/ai-customer-service';
import MessagesPage from './pages/messages';
import FavoritesPage from './pages/favorites';
import ParkingPage from './pages/parking';
import NewsDetail from './pages/news/detail';
import { useAuthStore } from './store/auth';
import { useSettingsStore } from './store/settings';

// Dynamic theme styles - re-renders when theme changes
function ThemeStyles() {
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();

  const styles = `
    .adm-tab-bar {
      --adm-color-primary: ${colors.primary} !important;
    }
    .adm-tabs-tab-active {
      color: ${colors.primary} !important;
    }
    .adm-tabs-tab-line {
      background: ${colors.primary} !important;
    }
    .adm-button-primary {
      --background-color: ${colors.primary} !important;
      --border-color: ${colors.primary} !important;
    }
    .adm-pull-to-refresh-head-content {
      color: ${colors.primary} !important;
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
      background: ${colors.primary} !important;
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
    .theme-text {
      color: ${colors.primary};
    }
    .theme-bg {
      background: ${colors.primary};
    }
    .gold-bg {
      background: #C4A962;
    }
  `;

  return <style>{styles}</style>;
}

// Handle SPA redirect from 404.html
function RedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const redirectPath = sessionStorage.getItem('redirect_path');
    if (redirectPath && location.pathname === '/') {
      sessionStorage.removeItem('redirect_path');
      navigate(redirectPath, { replace: true });
    }
  }, [navigate, location]);

  return null;
}

// Auth Guard - Redirect to login if not authenticated
function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    // Save the intended destination for redirect after login
    sessionStorage.setItem('redirect_after_login', location.pathname);
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Protected Route wrapper
function ProtectedRoute({ element }: { element: React.ReactElement }) {
  return <AuthGuard>{element}</AuthGuard>;
}

export default function App() {
  return (
    <ConfigProvider locale={zhTW}>
      <ThemeStyles />
      <BrowserRouter>
        <RedirectHandler />
        <Routes>
          {/* Public routes - can browse freely */}
          <Route element={<TabLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/stamp" element={<StampPage />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Public detail pages */}
          <Route path="/campaign/:id" element={<CampaignDetail />} />
          <Route path="/mall" element={<MallDirectory />} />
          <Route path="/merchant/:id" element={<MerchantDetail />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Member-only routes - require authentication */}
          <Route path="/stamp/:id" element={<ProtectedRoute element={<StampDetail />} />} />
          <Route path="/coupon/:id" element={<ProtectedRoute element={<CouponDetail />} />} />
          <Route path="/lottery/:id" element={<ProtectedRoute element={<LotteryDetail />} />} />
          <Route path="/tier" element={<ProtectedRoute element={<TierPage />} />} />
          <Route path="/profile/edit" element={<ProtectedRoute element={<ProfileEditPage />} />} />
          <Route path="/checkin" element={<ProtectedRoute element={<CheckInPage />} />} />
          <Route path="/gifts" element={<ProtectedRoute element={<GiftsPage />} />} />
          <Route path="/support" element={<ProtectedRoute element={<AICustomerServicePage />} />} />
          <Route path="/messages" element={<ProtectedRoute element={<MessagesPage />} />} />
          <Route path="/favorites" element={<ProtectedRoute element={<FavoritesPage />} />} />
          <Route path="/parking" element={<ProtectedRoute element={<ParkingPage />} />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}
