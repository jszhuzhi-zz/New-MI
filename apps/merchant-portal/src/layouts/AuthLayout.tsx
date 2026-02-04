import React from 'react';
import { Layout, Typography, Space, theme } from 'antd';
import { ShopOutlined } from '@ant-design/icons';
import { Outlet } from 'react-router-dom';
import LocaleSwitcher from '../components/LocaleSwitcher';
import { useLocale } from '../hooks/useLocale';

const { Content, Footer } = Layout;
const { Title, Text } = Typography;

const labels: Record<string, Record<string, string>> = {
  title: { 'zh-CN': '商户管理端', 'zh-TW': '商戶管理端', en: 'Merchant Portal' },
  subtitle: {
    'zh-CN': '领展会员系统 - 店铺员工工作台',
    'zh-TW': '領展會員系統 - 店鋪員工工作台',
    en: 'Link REIT Membership - Shop Staff Workstation',
  },
  copyright: {
    'zh-CN': '领展资产管理有限公司',
    'zh-TW': '領展資產管理有限公司',
    en: 'Link Asset Management Limited',
  },
};

const AuthLayout: React.FC = () => {
  const { locale } = useLocale();
  const { token: themeToken } = theme.useToken();

  const getLabel = (key: string) => labels[key]?.[locale] || labels[key]?.en || key;

  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${themeToken.colorPrimaryBg} 0%, #f0f5ff 50%, ${themeToken.colorPrimaryBgHover} 100%)`,
      }}
    >
      <div style={{ position: 'absolute', top: 16, right: 24 }}>
        <LocaleSwitcher />
      </div>

      <Content
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Space direction="vertical" align="center" size={4}>
            <ShopOutlined
              style={{
                fontSize: 48,
                color: themeToken.colorPrimary,
                marginBottom: 8,
              }}
            />
            <Title level={2} style={{ margin: 0, color: themeToken.colorPrimary }}>
              {getLabel('title')}
            </Title>
            <Text type="secondary">{getLabel('subtitle')}</Text>
          </Space>
        </div>

        <Outlet />
      </Content>

      <Footer style={{ textAlign: 'center', background: 'transparent', padding: '12px 24px' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          &copy; {new Date().getFullYear()} {getLabel('copyright')}
        </Text>
      </Footer>
    </Layout>
  );
};

export default AuthLayout;
