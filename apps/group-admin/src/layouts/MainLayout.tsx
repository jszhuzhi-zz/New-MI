import React, { useMemo } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Space, Breadcrumb, Button, Typography } from 'antd';
import {
  ApartmentOutlined,
  TeamOutlined,
  StarOutlined,
  SafetyCertificateOutlined,
  BarChartOutlined,
  DownloadOutlined,
  FileTextOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  DashboardOutlined,
  BankOutlined,
  ProjectOutlined,
  CreditCardOutlined,
  LineChartOutlined,
  SwapOutlined,
  TransactionOutlined,
  GoldOutlined,
  TrophyOutlined,
  TagsOutlined,
  InfoCircleOutlined,
  CalculatorOutlined,
  ClockCircleOutlined,
  VerticalAlignTopOutlined,
  AlertOutlined,
  AuditOutlined,
  ExclamationCircleOutlined,
  ToolOutlined,
  UnorderedListOutlined,
  ShopOutlined,
  GiftOutlined,
  QrcodeOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/app';
import { useAuth } from '../hooks/useAuth';
import { useLocale } from '../hooks/useLocale';
import LocaleSwitcher from '../components/LocaleSwitcher';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

type MenuItem = Required<MenuProps>['items'][number];

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLocale();
  const { user, logout } = useAuth();
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const breadcrumbs = useAppStore((s) => s.breadcrumbs);

  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: t('report.reportCenter').replace(t('report.report'), '') || 'Dashboard',
      },
      {
        key: '/organization',
        icon: <ApartmentOutlined />,
        label: t('organization.architecture'),
        children: [
          {
            key: '/organization/group',
            icon: <BankOutlined />,
            label: t('organization.groupManagement'),
          },
          {
            key: '/organization/architecture',
            icon: <ApartmentOutlined />,
            label: t('organization.architectureConfig'),
          },
          {
            key: '/organization/projects',
            icon: <ProjectOutlined />,
            label: t('organization.projectList'),
          },
        ],
      },
      {
        key: '/member',
        icon: <TeamOutlined />,
        label: t('member.memberManagement'),
        children: [
          {
            key: '/member/cards',
            icon: <CreditCardOutlined />,
            label: t('member.memberCard') + t('common.all').replace(t('common.all'), ''),
          },
          {
            key: '/member/stamp-analysis',
            icon: <LineChartOutlined />,
            label: t('stamp.stampBalance'),
          },
          {
            key: '/member/stamp-changes',
            icon: <SwapOutlined />,
            label: t('stamp.stampChangeRecord'),
          },
          {
            key: '/member/stamp-transactions',
            icon: <TransactionOutlined />,
            label: t('stamp.stampTransactionRecord'),
          },
        ],
      },
      {
        key: '/stamp-system',
        icon: <StarOutlined />,
        label: t('stamp.stampSystem'),
        children: [
          {
            key: '/stamp-system/pool-settings',
            icon: <GoldOutlined />,
            label: t('member.memberCard'),
          },
          {
            key: '/stamp-system/tier-settings',
            icon: <TrophyOutlined />,
            label: t('member.tierManagement'),
          },
          {
            key: '/stamp-system/label-config',
            icon: <TagsOutlined />,
            label: t('member.labelConfig'),
          },
          {
            key: '/stamp-system/stamp-info',
            icon: <InfoCircleOutlined />,
            label: t('stamp.stampInfo'),
          },
          {
            key: '/stamp-system/earning-rules',
            icon: <CalculatorOutlined />,
            label: t('stamp.earningRule'),
          },
          {
            key: '/stamp-system/expiry-rules',
            icon: <ClockCircleOutlined />,
            label: t('stamp.expiryRule'),
          },
          {
            key: '/stamp-system/upper-limit-rules',
            icon: <VerticalAlignTopOutlined />,
            label: t('stamp.upperLimitRule'),
          },
        ],
      },
      {
        key: '/operations',
        icon: <ShopOutlined />,
        label: '營運管理',
        children: [
          {
            key: '/operations/malls',
            icon: <BankOutlined />,
            label: '商場管理',
          },
          {
            key: '/operations/merchants',
            icon: <ShopOutlined />,
            label: '商戶管理',
          },
          {
            key: '/operations/gifts',
            icon: <GiftOutlined />,
            label: '禮品管理',
          },
          {
            key: '/operations/qrcodes',
            icon: <QrcodeOutlined />,
            label: '二維碼管理',
          },
        ],
      },
      {
        key: '/risk-control',
        icon: <SafetyCertificateOutlined />,
        label: t('riskControl.riskControl'),
        children: [
          {
            key: '/risk-control/workbench',
            icon: <AlertOutlined />,
            label: t('riskControl.workbench'),
          },
          {
            key: '/risk-control/stamp-anomaly',
            icon: <AuditOutlined />,
            label: t('riskControl.stampAnomalyReview'),
          },
          {
            key: '/risk-control/abnormal-members',
            icon: <ExclamationCircleOutlined />,
            label: t('riskControl.abnormalMemberReview'),
          },
          {
            key: '/risk-control/rules',
            icon: <ToolOutlined />,
            label: t('riskControl.ruleManagement'),
          },
          {
            key: '/risk-control/special-list',
            icon: <UnorderedListOutlined />,
            label: t('riskControl.specialListManagement'),
          },
        ],
      },
      {
        key: '/reports',
        icon: <BarChartOutlined />,
        label: t('report.reportCenter'),
        children: [
          {
            key: '/reports/clearing',
            icon: <BarChartOutlined />,
            label: t('stamp.clearingReport'),
          },
        ],
      },
      {
        key: '/downloads',
        icon: <DownloadOutlined />,
        label: t('report.downloadCenter'),
      },
      {
        key: '/operation-log',
        icon: <FileTextOutlined />,
        label: t('report.operationLog'),
      },
    ],
    [t]
  );

  const userMenuItems: MenuItem[] = [
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('system.systemSettings'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('auth.logout'),
      danger: true,
    },
  ];

  const handleMenuClick = (info: { key: string }) => {
    navigate(info.key);
  };

  const handleUserMenuClick = (info: { key: string }) => {
    if (info.key === 'logout') {
      logout();
      navigate('/login');
    }
  };

  // Resolve selected keys from location
  const selectedKeys = [location.pathname];
  const openKeys = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length > 1) {
      return ['/' + parts[0]];
    }
    return [];
  }, [location.pathname]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={sidebarCollapsed}
        width={260}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
        theme="dark"
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Text
            strong
            style={{
              color: '#fff',
              fontSize: sidebarCollapsed ? 14 : 18,
              whiteSpace: 'nowrap',
            }}
          >
            {sidebarCollapsed ? 'LR' : 'Link REIT Admin'}
          </Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          defaultOpenKeys={openKeys}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout style={{ marginLeft: sidebarCollapsed ? 80 : 260, transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
            position: 'sticky',
            top: 0,
            zIndex: 99,
          }}
        >
          <Space>
            <Button
              type="text"
              icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={toggleSidebar}
              style={{ fontSize: 16 }}
            />
            <Breadcrumb
              items={
                breadcrumbs.length > 0
                  ? breadcrumbs.map((b) => ({
                      title: b.path ? (
                        <a onClick={() => b.path && navigate(b.path)}>{b.title}</a>
                      ) : (
                        b.title
                      ),
                    }))
                  : [{ title: 'Dashboard' }]
              }
            />
          </Space>
          <Space size={16}>
            <LocaleSwitcher compact />
            <Badge count={3} size="small">
              <Button type="text" icon={<BellOutlined />} style={{ fontSize: 16 }} />
            </Badge>
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick,
              }}
              trigger={['click']}
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
                {user?.displayName && (
                  <Text style={{ maxWidth: 120 }} ellipsis>
                    {user.displayName}
                  </Text>
                )}
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content
          style={{
            margin: 24,
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
