import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import { useAuthStore } from './store/auth';

// Lazy-loaded pages
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Member pages
const UserList = lazy(() => import('./pages/member/UserList'));
const MemberList = lazy(() => import('./pages/member/MemberList'));
const CounterRegistration = lazy(() => import('./pages/member/CounterRegistration'));
const AccountRecords = lazy(() => import('./pages/member/AccountRecords'));

// Stamp pages
const MallStampManagement = lazy(() => import('./pages/stamp/MallStampManagement'));
const StampChangeRecords = lazy(() => import('./pages/stamp/StampChangeRecords'));
const StampTransactionRecords = lazy(() => import('./pages/stamp/StampTransactionRecords'));
const StampAllocation = lazy(() => import('./pages/stamp/StampAllocation'));

// Stamp rules pages
const MemberPoolSettings = lazy(() => import('./pages/stamp-rules/MemberPoolSettings'));
const TierSettings = lazy(() => import('./pages/stamp-rules/TierSettings'));
const LabelConfig = lazy(() => import('./pages/stamp-rules/LabelConfig'));
const StampInfo = lazy(() => import('./pages/stamp-rules/StampInfo'));
const EarningRules = lazy(() => import('./pages/stamp-rules/EarningRules'));
const ExpiryRules = lazy(() => import('./pages/stamp-rules/ExpiryRules'));
const UpperLimitRules = lazy(() => import('./pages/stamp-rules/UpperLimitRules'));
const CampaignStampRules = lazy(() => import('./pages/stamp-rules/CampaignStampRules'));
const OnlineActivityRules = lazy(() => import('./pages/stamp-rules/OnlineActivityRules'));

// Risk control pages
const Workbench = lazy(() => import('./pages/risk-control/Workbench'));
const StampAnomalyReview = lazy(() => import('./pages/risk-control/StampAnomalyReview'));
const AbnormalMemberReview = lazy(() => import('./pages/risk-control/AbnormalMemberReview'));
const RuleManagement = lazy(() => import('./pages/risk-control/RuleManagement'));
const SpecialListManagement = lazy(() => import('./pages/risk-control/SpecialListManagement'));

// Report & utility pages
const ClearingReport = lazy(() => import('./pages/reports/ClearingReport'));
const DownloadCenter = lazy(() => import('./pages/DownloadCenter'));
const OperationLog = lazy(() => import('./pages/OperationLog'));

const Loading: React.FC = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 300 }}>
    <Spin size="large" />
  </div>
);

/** Protected route wrapper */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected mall admin routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />

          {/* Member management */}
          <Route path="/member/users" element={<UserList />} />
          <Route path="/member/list" element={<MemberList />} />
          <Route path="/member/counter" element={<CounterRegistration />} />
          <Route path="/member/account-records" element={<AccountRecords />} />

          {/* Stamp management */}
          <Route path="/stamp/mall" element={<MallStampManagement />} />
          <Route path="/stamp/change-records" element={<StampChangeRecords />} />
          <Route path="/stamp/transaction-records" element={<StampTransactionRecords />} />
          <Route path="/stamp/allocation" element={<StampAllocation />} />

          {/* Stamp rules */}
          <Route path="/stamp-rules/member-pool" element={<MemberPoolSettings />} />
          <Route path="/stamp-rules/tier" element={<TierSettings />} />
          <Route path="/stamp-rules/label" element={<LabelConfig />} />
          <Route path="/stamp-rules/stamp-info" element={<StampInfo />} />
          <Route path="/stamp-rules/earning" element={<EarningRules />} />
          <Route path="/stamp-rules/expiry" element={<ExpiryRules />} />
          <Route path="/stamp-rules/upper-limit" element={<UpperLimitRules />} />
          <Route path="/stamp-rules/campaign" element={<CampaignStampRules />} />
          <Route path="/stamp-rules/online-activity" element={<OnlineActivityRules />} />

          {/* Risk control */}
          <Route path="/risk-control/workbench" element={<Workbench />} />
          <Route path="/risk-control/stamp-anomaly" element={<StampAnomalyReview />} />
          <Route path="/risk-control/abnormal-member" element={<AbnormalMemberReview />} />
          <Route path="/risk-control/rules" element={<RuleManagement />} />
          <Route path="/risk-control/special-list" element={<SpecialListManagement />} />

          {/* Reports */}
          <Route path="/reports/clearing" element={<ClearingReport />} />

          {/* Utilities */}
          <Route path="/download-center" element={<DownloadCenter />} />
          <Route path="/operation-log" element={<OperationLog />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;
