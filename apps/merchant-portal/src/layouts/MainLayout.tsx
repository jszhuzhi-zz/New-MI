import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Typography, theme, Drawer, Grid } from 'antd';
import {
  HomeOutlined,
  GiftOutlined,
  SendOutlined,
  UnorderedListOutlined,
  TeamOutlined,
  ScanOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  SettingOutlined,
  ShopOutlined,
  UserSwitchOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TagsOutlined,
  PlusCircleOutlined,
  FileTextOutlined,
  CrownOutlined,
  ApartmentOutlined,
  UsergroupAddOutlined,
  NotificationOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import type { MenuProps } from 'antd';
import LocaleSwitcher from '../components/LocaleSwitcher';
import { useAuth } from '../hooks/useAuth';
import { useLocale } from '../hooks/useLocale';
import { useAppStore } from '../store/app';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuLabels: Record<string, Record<string, string>> = {
  dashboard: { 'zh-CN': '首页', 'zh-TW': '首頁', en: 'Dashboard' },
  stampMgmt: { 'zh-CN': '印花管理', 'zh-TW': '印花管理', en: 'Stamp Management' },
  issueStamps: { 'zh-CN': '发放印花', 'zh-TW': '發放印花', en: 'Issue Stamps' },
  transactionRecords: { 'zh-CN': '印花交易记录', 'zh-TW': '印花交易記錄', en: 'Transaction Records' },
  memberLookup: { 'zh-CN': '会员查询', 'zh-TW': '會員查詢', en: 'Member Lookup' },
  scanQR: { 'zh-CN': '扫码查询', 'zh-TW': '掃碼查詢', en: 'Scan QR' },
  phoneSearch: { 'zh-CN': '手机号查询', 'zh-TW': '手機號查詢', en: 'Phone Search' },
  couponVerification: { 'zh-CN': '优惠券核销', 'zh-TW': '優惠券核銷', en: 'Coupon Verification' },
  offerMgmt: { 'zh-CN': '优惠活动', 'zh-TW': '優惠活動', en: 'Offer Management' },
  offerList: { 'zh-CN': '我的优惠', 'zh-TW': '我的優惠', en: 'My Offers' },
  createOffer: { 'zh-CN': '发布优惠', 'zh-TW': '發布優惠', en: 'Create Offer' },
  statistics: { 'zh-CN': '数据统计', 'zh-TW': '數據統計', en: 'Statistics' },
  transactionStats: { 'zh-CN': '交易统计', 'zh-TW': '交易統計', en: 'Transaction Stats' },
  memberStats: { 'zh-CN': '会员统计', 'zh-TW': '會員統計', en: 'Member Stats' },
  settings: { 'zh-CN': '设置', 'zh-TW': '設置', en: 'Settings' },
  shopInfo: { 'zh-CN': '店铺信息', 'zh-TW': '店鋪信息', en: 'Shop Info' },
  staffMgmt: { 'zh-CN': '员工管理', 'zh-TW': '員工管理', en: 'Staff Management' },
  logout: { 'zh-CN': '退出登录', 'zh-TW': '退出登錄', en: 'Logout' },
  profile: { 'zh-CN': '个人信息', 'zh-TW': '個人信息', en: 'Profile' },
  mallMgmt: { 'zh-CN': '商场管理', 'zh-TW': '商場管理', en: 'Mall Management' },
  memberMgmt: { 'zh-CN': '会员管理', 'zh-TW': '會員管理', en: 'Member Management' },
  memberTags: { 'zh-CN': '会员标签', 'zh-TW': '會員標籤', en: 'Member Tags' },
  campaignMgmt: { 'zh-CN': '活动配置', 'zh-TW': '活動配置', en: 'Campaign Config' },
  couponMgmt: { 'zh-CN': '优惠券配置', 'zh-TW': '優惠券配置', en: 'Coupon Config' },
  mallConfig: { 'zh-CN': '商场配置', 'zh-TW': '商場配置', en: 'Mall Config' },
};

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { locale } = useLocale();
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const { token: themeToken } = theme.useToken();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const getLabel = (key: string) => menuLabels[key]?.[locale] || menuLabels[key]?.en || key;

  const menuItems: MenuProps['items'] = [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: getLabel('dashboard'),
    },
    {
      key: '/stamp',
      icon: <GiftOutlined />,
      label: getLabel('stampMgmt'),
      children: [
        {
          key: '/stamp/issue',
          icon: <SendOutlined />,
          label: getLabel('issueStamps'),
        },
        {
          key: '/stamp/transactions',
          icon: <UnorderedListOutlined />,
          label: getLabel('transactionRecords'),
        },
      ],
    },
    {
      key: '/member',
      icon: <TeamOutlined />,
      label: getLabel('memberLookup'),
      children: [
        {
          key: '/member/scan',
          icon: <ScanOutlined />,
          label: getLabel('scanQR'),
        },
        {
          key: '/member/phone',
          icon: <PhoneOutlined />,
          label: getLabel('phoneSearch'),
        },
      ],
    },
    {
      key: '/coupon/verification',
      icon: <CheckCircleOutlined />,
      label: getLabel('couponVerification'),
    },
    {
      key: '/offer-mgmt',
      icon: <TagsOutlined />,
      label: getLabel('offerMgmt'),
      children: [
        {
          key: '/offers',
          icon: <FileTextOutlined />,
          label: getLabel('offerList'),
        },
        {
          key: '/offers/create',
          icon: <PlusCircleOutlined />,
          label: getLabel('createOffer'),
        },
      ],
    },
    {
      key: '/statistics',
      icon: <BarChartOutlined />,
      label: getLabel('statistics'),
      children: [
        {
          key: '/statistics/transactions',
          icon: <LineChartOutlined />,
          label: getLabel('transactionStats'),
        },
        {
          key: '/statistics/members',
          icon: <PieChartOutlined />,
          label: getLabel('memberStats'),
        },
      ],
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: getLabel('settings'),
      children: [
        {
          key: '/settings/shop',
          icon: <ShopOutlined />,
          label: getLabel('shopInfo'),
        },
        {
          key: '/settings/staff',
          icon: <UserSwitchOutlined />,
          label: getLabel('staffMgmt'),
        },
      ],
    },
    { type: 'divider' as const },
    {
      key: '/mall',
      icon: <CrownOutlined />,
      label: getLabel('mallMgmt'),
      children: [
        {
          key: '/mall/members',
          icon: <UsergroupAddOutlined />,
          label: getLabel('memberMgmt'),
        },
        {
          key: '/mall/tags',
          icon: <TagsOutlined />,
          label: getLabel('memberTags'),
        },
        {
          key: '/mall/campaigns',
          icon: <NotificationOutlined />,
          label: getLabel('campaignMgmt'),
        },
        {
          key: '/mall/coupons',
          icon: <GiftOutlined />,
          label: getLabel('couponMgmt'),
        },
        {
          key: '/mall/management',
          icon: <ApartmentOutlined />,
          label: getLabel('mallConfig'),
        },
      ],
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: getLabel('profile'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: getLabel('logout'),
      danger: true,
    },
  ];

  const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      logout();
      navigate('/login');
    }
  };

  // Determine selected and open keys from current path
  const selectedKey = location.pathname;
  const openKeys = location.pathname.split('/').reduce<string[]>((acc, _, index, arr) => {
    if (index > 0 && index < arr.length - 1) {
      acc.push('/' + arr.slice(1, index + 1).join('/'));
    }
    return acc;
  }, []);

  const siderContent = (
    <>
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 16px',
          borderBottom: `1px solid ${themeToken.colorBorderSecondary}`,
        }}
      >
        <ShopOutlined style={{ fontSize: 24, color: themeToken.colorPrimary }} />
        {(!collapsed || isMobile) && (
          <Text
            strong
            style={{
              marginLeft: 12,
              fontSize: 16,
              whiteSpace: 'nowrap',
              color: themeToken.colorPrimary,
            }}
          >
            {locale === 'en' ? 'Merchant Portal' : '商户端'}
          </Text>
        )}
      </div>

      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        defaultOpenKeys={openKeys}
        items={menuItems}
        onClick={(info) => {
          handleMenuClick(info);
          if (isMobile && !collapsed) {
            toggleSidebar();
          }
        }}
        style={{ borderRight: 0, paddingTop: 8 }}
      />
    </>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {isMobile ? (
        <Drawer
          placement="left"
          open={!collapsed}
          onClose={toggleSidebar}
          width={260}
          styles={{ body: { padding: 0 } }}
          closable={false}
        >
          {siderContent}
        </Drawer>
      ) : (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={240}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            background: themeToken.colorBgContainer,
            borderRight: `1px solid ${themeToken.colorBorderSecondary}`,
          }}
        >
          {siderContent}
        </Sider>
      )}

      <Layout style={{ marginLeft: isMobile ? 0 : (collapsed ? 80 : 240), transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            padding: isMobile ? '0 12px' : '0 24px',
            background: themeToken.colorBgContainer,
            borderBottom: `1px solid ${themeToken.colorBorderSecondary}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          <Space>
            {React.createElement(
              isMobile ? (collapsed ? MenuUnfoldOutlined : MenuFoldOutlined) : (collapsed ? MenuUnfoldOutlined : MenuFoldOutlined),
              {
                style: { fontSize: 18, cursor: 'pointer' },
                onClick: toggleSidebar,
              }
            )}
            {user && !isMobile && (
              <Text type="secondary" style={{ marginLeft: 12 }}>
                <ShopOutlined style={{ marginRight: 4 }} />
                {user.shopName}
                <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                  ({user.mallName})
                </Text>
              </Text>
            )}
          </Space>

          <Space size={isMobile ? 'small' : 'middle'}>
            <LocaleSwitcher compact />
            <Dropdown
              menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
              trigger={['click']}
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  src={user?.avatar}
                  style={{ backgroundColor: themeToken.colorPrimary }}
                />
                {!isMobile && <Text>{user?.displayName}</Text>}
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            margin: isMobile ? 12 : 24,
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
