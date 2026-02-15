import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import { useAuth } from './hooks/useAuth';

// Lazy-loaded pages
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Organization
const GroupManagement = lazy(() => import('./pages/organization/GroupManagement'));
const ArchitectureConfig = lazy(() => import('./pages/organization/ArchitectureConfig'));
const ProjectList = lazy(() => import('./pages/organization/ProjectList'));

// Member
const MemberCardList = lazy(() => import('./pages/member/MemberCardList'));
const StampAnalysis = lazy(() => import('./pages/member/StampAnalysis'));
const StampChangeRecords = lazy(() => import('./pages/member/StampChangeRecords'));
const StampTransactionRecords = lazy(() => import('./pages/member/StampTransactionRecords'));

// Stamp System
const MemberPoolSettings = lazy(() => import('./pages/stamp-system/MemberPoolSettings'));
const TierSettings = lazy(() => import('./pages/stamp-system/TierSettings'));
const LabelConfig = lazy(() => import('./pages/stamp-system/LabelConfig'));
const StampInfo = lazy(() => import('./pages/stamp-system/StampInfo'));
const EarningRules = lazy(() => import('./pages/stamp-system/EarningRules'));
const ExpiryRules = lazy(() => import('./pages/stamp-system/ExpiryRules'));
const UpperLimitRules = lazy(() => import('./pages/stamp-system/UpperLimitRules'));

// Risk Control
const Workbench = lazy(() => import('./pages/risk-control/Workbench'));
const StampAnomalyReview = lazy(() => import('./pages/risk-control/StampAnomalyReview'));
const AbnormalMemberReview = lazy(() => import('./pages/risk-control/AbnormalMemberReview'));
const RuleManagement = lazy(() => import('./pages/risk-control/RuleManagement'));
const SpecialListManagement = lazy(() => import('./pages/risk-control/SpecialListManagement'));

// Reports & Utilities
const ClearingReport = lazy(() => import('./pages/reports/ClearingReport'));
const DownloadCenter = lazy(() => import('./pages/DownloadCenter'));
const OperationLog = lazy(() => import('./pages/OperationLog'));

// Operations
const MallManagement = lazy(() => import('./pages/operations/MallManagement'));
const MerchantManagement = lazy(() => import('./pages/operations/MerchantManagement'));
const GiftManagement = lazy(() => import('./pages/operations/GiftManagement'));
const QRCodeManagement = lazy(() => import('./pages/operations/QRCodeManagement'));

const PageLoading: React.FC = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
    <Spin size="large" />
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
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

          {/* Organization */}
          <Route path="/organization/group" element={<GroupManagement />} />
          <Route path="/organization/architecture" element={<ArchitectureConfig />} />
          <Route path="/organization/projects" element={<ProjectList />} />

          {/* Member */}
          <Route path="/member/cards" element={<MemberCardList />} />
          <Route path="/member/stamp-analysis" element={<StampAnalysis />} />
          <Route path="/member/stamp-changes" element={<StampChangeRecords />} />
          <Route path="/member/stamp-transactions" element={<StampTransactionRecords />} />

          {/* Stamp System */}
          <Route path="/stamp-system/pool-settings" element={<MemberPoolSettings />} />
          <Route path="/stamp-system/tier-settings" element={<TierSettings />} />
          <Route path="/stamp-system/label-config" element={<LabelConfig />} />
          <Route path="/stamp-system/stamp-info" element={<StampInfo />} />
          <Route path="/stamp-system/earning-rules" element={<EarningRules />} />
          <Route path="/stamp-system/expiry-rules" element={<ExpiryRules />} />
          <Route path="/stamp-system/upper-limit-rules" element={<UpperLimitRules />} />

          {/* Risk Control */}
          <Route path="/risk-control/workbench" element={<Workbench />} />
          <Route path="/risk-control/stamp-anomaly" element={<StampAnomalyReview />} />
          <Route path="/risk-control/abnormal-members" element={<AbnormalMemberReview />} />
          <Route path="/risk-control/rules" element={<RuleManagement />} />
          <Route path="/risk-control/special-list" element={<SpecialListManagement />} />

          {/* Reports */}
          <Route path="/reports/clearing" element={<ClearingReport />} />
          <Route path="/downloads" element={<DownloadCenter />} />
          <Route path="/operation-log" element={<OperationLog />} />

          {/* Operations */}
          <Route path="/operations/malls" element={<MallManagement />} />
          <Route path="/operations/merchants" element={<MerchantManagement />} />
          <Route path="/operations/gifts" element={<GiftManagement />} />
          <Route path="/operations/qrcodes" element={<QRCodeManagement />} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;
