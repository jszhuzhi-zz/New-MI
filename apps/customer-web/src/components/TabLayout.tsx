import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { TabBar } from 'antd-mobile';
import {
  AppOutline,
  StarOutline,
  ScanCodeOutline,
  GiftOutline,
  UserOutline,
} from 'antd-mobile-icons';

const tabs = [
  { key: '/', title: '首頁', icon: <AppOutline /> },
  { key: '/stamp', title: '印花', icon: <StarOutline /> },
  { key: '/scan', title: '掃碼', icon: <ScanCodeOutline /> },
  { key: '/offers', title: '優惠', icon: <GiftOutline /> },
  { key: '/profile', title: '我的', icon: <UserOutline /> },
];

const TabLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Outlet />
      </div>
      <TabBar
        activeKey={location.pathname}
        onChange={(key) => navigate(key)}
        style={{
          borderTop: '1px solid #eee',
          background: '#fff',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {tabs.map((tab) => (
          <TabBar.Item key={tab.key} icon={tab.icon} title={tab.title} />
        ))}
      </TabBar>
    </div>
  );
};

export default TabLayout;
