import React, { useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Badge, Space, Typography, Popover, List, Button, Tag } from 'antd';
import {
  TeamOutlined,
  GiftOutlined,
  SettingOutlined,
  SafetyCertificateOutlined,
  BarChartOutlined,
  DownloadOutlined,
  FileTextOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  KeyOutlined,
  ScanOutlined,
  CustomerServiceOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import LocaleSwitcher from '../components/LocaleSwitcher';
import { useAppStore } from '../store/app';
import { useAuthStore } from '../store/auth';
import { useLocale } from '../hooks/useLocale';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

/** CRM项目层 Sidebar menu structure */
const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLocale();

  const {
    sidebarCollapsed,
    toggleSidebar,
    selectedMenuKey,
    setSelectedMenuKey,
    openMenuKeys,
    setOpenMenuKeys,
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
  } = useAppStore();

  const { user } = useAuthStore();
  const logout = useAuthStore((s) => s.logout);

  const menuItems: MenuProps['items'] = useMemo(
    () => [
      {
        key: 'dashboard',
        icon: <DashboardOutlined />,
        label: t('common.details') === '详情' ? '工作台' : t('common.details') === '詳情' ? '工作台' : 'Dashboard',
      },
      {
        key: 'member',
        icon: <TeamOutlined />,
        label: t('member.memberManagement'),
        children: [
          { key: 'member-user-list', label: t('common.details') === '详情' ? '用户列表' : t('common.details') === '詳情' ? '用戶列表' : 'User List' },
          { key: 'member-list', label: t('member.memberList') },
          { key: 'member-counter', label: t('member.counterRegistration') },
          { key: 'member-account-records', label: t('member.openCloseRecord') },
        ],
      },
      {
        key: 'stamp',
        icon: <GiftOutlined />,
        label: t('common.details') === '详情' ? '积分管理' : t('common.details') === '詳情' ? '積分管理' : 'Stamp Management',
        children: [
          { key: 'stamp-mall', label: t('common.details') === '详情' ? '商场台积分' : t('common.details') === '詳情' ? '商場台積分' : 'Mall Stamp Processing' },
          { key: 'stamp-change-records', label: t('stamp.stampChangeRecord') },
          { key: 'stamp-transaction-records', label: t('stamp.stampTransactionRecord') },
          { key: 'stamp-allocation', label: t('common.details') === '详情' ? '积分库间分摊' : t('common.details') === '詳情' ? '積分庫間分攤' : 'Stamp Allocation' },
        ],
      },
      {
        key: 'stamp-rules',
        icon: <SettingOutlined />,
        label: t('common.details') === '详情' ? '会员积分规则' : t('common.details') === '詳情' ? '會員積分規則' : 'Stamp Rules',
        children: [
          { key: 'rules-member-pool', label: t('common.details') === '详情' ? '会员池设置' : t('common.details') === '詳情' ? '會員池設置' : 'Member Pool Settings' },
          { key: 'rules-tier', label: t('common.details') === '详情' ? '等级设置' : t('common.details') === '詳情' ? '等級設置' : 'Tier Settings' },
          { key: 'rules-label', label: t('member.labelConfig') },
          { key: 'rules-stamp-info', label: t('stamp.stampInfo') },
          { key: 'rules-earning', label: t('common.details') === '详情' ? '消费积分规则' : t('common.details') === '詳情' ? '消費積分規則' : 'Earning Rules' },
          { key: 'rules-expiry', label: t('common.details') === '详情' ? '积分清零规则' : t('common.details') === '詳情' ? '積分清零規則' : 'Expiry Rules' },
          { key: 'rules-upper-limit', label: t('common.details') === '详情' ? '积分上限规则' : t('common.details') === '詳情' ? '積分上限規則' : 'Upper Limit Rules' },
          { key: 'rules-campaign', label: t('common.details') === '详情' ? '消费积分活动规则' : t('common.details') === '詳情' ? '消費積分活動規則' : 'Campaign Stamp Rules' },
          { key: 'rules-online-activity', label: t('common.details') === '详情' ? '线上活跃积分规则' : t('common.details') === '詳情' ? '線上活躍積分規則' : 'Online Activity Rules' },
        ],
      },
      {
        key: 'risk-control',
        icon: <SafetyCertificateOutlined />,
        label: t('riskControl.riskControl'),
        children: [
          { key: 'risk-workbench', label: t('riskControl.workbench') },
          { key: 'risk-stamp-anomaly', label: t('riskControl.stampAnomalyReview') },
          { key: 'risk-abnormal-member', label: t('riskControl.abnormalMemberReview') },
          { key: 'risk-rules', label: t('riskControl.ruleManagement') },
          { key: 'risk-special-list', label: t('riskControl.specialListManagement') },
        ],
      },
      {
        key: 'reports',
        icon: <BarChartOutlined />,
        label: t('report.reportCenter'),
        children: [
          { key: 'report-clearing', label: t('stamp.clearingReport') },
        ],
      },
      {
        key: 'download-center',
        icon: <DownloadOutlined />,
        label: t('report.downloadCenter'),
      },
      {
        key: 'operation-log',
        icon: <FileTextOutlined />,
        label: t('report.operationLog'),
      },
      {
        key: 'service',
        icon: <CustomerServiceOutlined />,
        label: t('common.details') === '详情' ? '服务中心' : t('common.details') === '詳情' ? '服務中心' : 'Service Center',
        children: [
          { key: 'service-scan-verify', icon: <ScanOutlined />, label: t('common.details') === '详情' ? '扫码核销' : t('common.details') === '詳情' ? '掃碼核銷' : 'Scan & Verify' },
        ],
      },
    ],
    [t]
  );

  const menuKeyToPath: Record<string, string> = {
    dashboard: '/',
    'member-user-list': '/member/users',
    'member-list': '/member/list',
    'member-counter': '/member/counter',
    'member-account-records': '/member/account-records',
    'stamp-mall': '/stamp/mall',
    'stamp-change-records': '/stamp/change-records',
    'stamp-transaction-records': '/stamp/transaction-records',
    'stamp-allocation': '/stamp/allocation',
    'rules-member-pool': '/stamp-rules/member-pool',
    'rules-tier': '/stamp-rules/tier',
    'rules-label': '/stamp-rules/label',
    'rules-stamp-info': '/stamp-rules/stamp-info',
    'rules-earning': '/stamp-rules/earning',
    'rules-expiry': '/stamp-rules/expiry',
    'rules-upper-limit': '/stamp-rules/upper-limit',
    'rules-campaign': '/stamp-rules/campaign',
    'rules-online-activity': '/stamp-rules/online-activity',
    'risk-workbench': '/risk-control/workbench',
    'risk-stamp-anomaly': '/risk-control/stamp-anomaly',
    'risk-abnormal-member': '/risk-control/abnormal-member',
    'risk-rules': '/risk-control/rules',
    'risk-special-list': '/risk-control/special-list',
    'report-clearing': '/reports/clearing',
    'download-center': '/download-center',
    'operation-log': '/operation-log',
    'service-scan-verify': '/service/scan-verify',
  };

  const pathToMenuKey = useMemo(() => {
    const reversed: Record<string, string> = {};
    for (const [key, path] of Object.entries(menuKeyToPath)) {
      reversed[path] = key;
    }
    return reversed;
  }, []);

  const currentKey = pathToMenuKey[location.pathname] || 'dashboard';

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    setSelectedMenuKey(key);
    const path = menuKeyToPath[key];
    if (path) {
      navigate(path);
    }
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('common.details') === '详情' ? '个人信息' : t('common.details') === '詳情' ? '個人資訊' : 'Profile',
    },
    {
      key: 'change-password',
      icon: <KeyOutlined />,
      label: t('auth.changePassword'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('auth.logout'),
      danger: true,
    },
  ];

  const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      logout();
      navigate('/login');
    }
  };

  const notificationContent = (
    <div style={{ width: 360 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text strong>
          {t('common.details') === '详情' ? '通知' : t('common.details') === '詳情' ? '通知' : 'Notifications'}
        </Text>
        <Button type="link" size="small" onClick={markAllNotificationsRead}>
          {t('common.details') === '详情' ? '全部已读' : t('common.details') === '詳情' ? '全部已讀' : 'Mark All Read'}
        </Button>
      </div>
      <List
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item
            onClick={() => markNotificationRead(item.id)}
            style={{
              cursor: 'pointer',
              backgroundColor: item.read ? 'transparent' : '#f0f5ff',
              padding: '8px 12px',
              borderRadius: 4,
            }}
          >
            <List.Item.Meta
              title={
                <Space>
                  <Text strong={!item.read}>{item.title}</Text>
                  {item.type === 'warning' && <Tag color="orange">!</Tag>}
                </Space>
              }
              description={
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{item.message}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {new Date(item.createdAt).toLocaleString()}
                  </Text>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={sidebarCollapsed}
        width={260}
        theme="dark"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 16px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {sidebarCollapsed ? (
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>LR</Text>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 700, display: 'block' }}>
                Link REIT
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>
                {t('common.details') === '详情' ? '商场管理端' : t('common.details') === '詳情' ? '商場管理端' : 'Mall Admin Portal'}
              </Text>
            </div>
          )}
        </div>

        {!sidebarCollapsed && user && (
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.85)',
            }}
          >
            <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11 }}>
              {t('common.details') === '详情' ? '当前项目' : t('common.details') === '詳情' ? '當前項目' : 'Current Project'}
            </Text>
            <div style={{ fontWeight: 600, color: '#fff', fontSize: 14 }}>{user.projectName}</div>
          </div>
        )}

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[currentKey]}
          openKeys={openMenuKeys}
          onOpenChange={setOpenMenuKeys}
          onClick={handleMenuClick}
          items={menuItems}
          style={{ borderRight: 0 }}
        />
      </Sider>

      <Layout style={{ marginLeft: sidebarCollapsed ? 80 : 260, transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            position: 'sticky',
            top: 0,
            zIndex: 99,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {React.createElement(sidebarCollapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              onClick: toggleSidebar,
              style: { fontSize: 18, cursor: 'pointer' },
            })}
          </div>

          <Space size={16}>
            <LocaleSwitcher />

            <Popover content={notificationContent} trigger="click" placement="bottomRight">
              <Badge count={unreadCount} size="small">
                <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
              </Badge>
            </Popover>

            <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                <Text>{user?.displayName}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ margin: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
