import React from 'react';
import { Outlet } from 'react-router-dom';
import { Layout, Typography, Space } from 'antd';
import LocaleSwitcher from '../components/LocaleSwitcher';

const { Content } = Layout;
const { Title, Text } = Typography;

const AuthLayout: React.FC = () => {
  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 16,
          right: 24,
          zIndex: 10,
        }}
      >
        <LocaleSwitcher />
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
            borderRadius: 12,
            padding: '40px 32px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1890ff, #722ed1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Title level={3} style={{ color: '#fff', margin: 0 }}>LR</Title>
            </div>
            <Title level={4} style={{ marginBottom: 4 }}>Link REIT</Title>
            <Text type="secondary">Mall Admin Portal / 商场管理端</Text>
          </div>

          <Outlet />

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              &copy; {new Date().getFullYear()} Link Real Estate Investment Trust
            </Text>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default AuthLayout;
