import React from 'react';
import { Layout, Typography, Space } from 'antd';
import { Outlet } from 'react-router-dom';
import LocaleSwitcher from '../components/LocaleSwitcher';
import { useLocale } from '../hooks/useLocale';

const { Content } = Layout;
const { Title, Text } = Typography;

const AuthLayout: React.FC = () => {
  const { t } = useLocale();

  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #001529 0%, #003a70 50%, #0050a0 100%)',
      }}
    >
      <div style={{ position: 'absolute', top: 16, right: 24 }}>
        <LocaleSwitcher compact />
      </div>
      <Content
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px 24px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 420,
            background: '#fff',
            borderRadius: 8,
            padding: '40px 32px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <Title
              level={3}
              style={{ marginBottom: 8, color: '#001529' }}
            >
              Link REIT
            </Title>
            <Text type="secondary" style={{ fontSize: 14 }}>
              {t('organization.groupManagement')}
            </Text>
          </div>
          <Outlet />
        </div>
      </Content>
      <div style={{ textAlign: 'center', padding: '16px 0', color: 'rgba(255,255,255,0.45)' }}>
        <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
          &copy; {new Date().getFullYear()} Link REIT. All rights reserved.
        </Text>
      </div>
    </Layout>
  );
};

export default AuthLayout;
