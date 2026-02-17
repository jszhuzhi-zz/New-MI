import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import { useAuthStore } from './store/auth';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import IssueStamp from './pages/stamp/IssueStamp';
import TransactionRecords from './pages/stamp/TransactionRecords';
import ScanLookup from './pages/member/ScanLookup';
import PhoneLookup from './pages/member/PhoneLookup';
import CouponVerification from './pages/coupon/CouponVerification';
import TransactionStats from './pages/statistics/TransactionStats';
import MemberStats from './pages/statistics/MemberStats';
import ShopInfo from './pages/settings/ShopInfo';
import StaffManagement from './pages/settings/StaffManagement';
import OfferList from './pages/offers/OfferList';
import OfferForm from './pages/offers/OfferForm';
import MemberManagement from './pages/mall/MemberManagement';
import MemberTags from './pages/mall/MemberTags';
import CampaignManagement from './pages/mall/CampaignManagement';
import CouponManagement from './pages/mall/CouponManagement';
import MallManagement from './pages/mall/MallManagement';

// Auth guard component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route
          element={
            <PublicRoute>
              <AuthLayout />
            </PublicRoute>
          }
        >
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Stamp Management */}
          <Route path="/stamp/issue" element={<IssueStamp />} />
          <Route path="/stamp/transactions" element={<TransactionRecords />} />

          {/* Member Lookup */}
          <Route path="/member/scan" element={<ScanLookup />} />
          <Route path="/member/phone" element={<PhoneLookup />} />

          {/* Coupon Verification */}
          <Route path="/coupon/verification" element={<CouponVerification />} />

          {/* Offer Management */}
          <Route path="/offers" element={<OfferList />} />
          <Route path="/offers/create" element={<OfferForm />} />
          <Route path="/offers/edit/:id" element={<OfferForm />} />

          {/* Statistics */}
          <Route path="/statistics/transactions" element={<TransactionStats />} />
          <Route path="/statistics/members" element={<MemberStats />} />

          {/* Settings */}
          <Route path="/settings/shop" element={<ShopInfo />} />
          <Route path="/settings/staff" element={<StaffManagement />} />

          {/* Mall Management */}
          <Route path="/mall/members" element={<MemberManagement />} />
          <Route path="/mall/tags" element={<MemberTags />} />
          <Route path="/mall/campaigns" element={<CampaignManagement />} />
          <Route path="/mall/coupons" element={<CouponManagement />} />
          <Route path="/mall/management" element={<MallManagement />} />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
