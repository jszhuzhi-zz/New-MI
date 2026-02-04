import React, { useEffect } from 'react';
import { Card, Col, Row, Statistic, Table, Tag, Typography, Space } from 'antd';
import {
  TeamOutlined,
  ProjectOutlined,
  StarOutlined,
  AlertOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useLocale } from '../hooks/useLocale';
import { useAppStore } from '../store/app';
import RiskLevelTag from '../components/RiskLevelTag';
import type { RiskLevel } from '@link-reit/types';

const { Title } = Typography;

// Mock data
const memberTrend = [
  { date: '2025-07', value: 125000 },
  { date: '2025-08', value: 131000 },
  { date: '2025-09', value: 138000 },
  { date: '2025-10', value: 142000 },
  { date: '2025-11', value: 149000 },
  { date: '2025-12', value: 156000 },
  { date: '2026-01', value: 163500 },
];

const stampTrend = [
  { date: '2025-07', earned: 45200, redeemed: 32100 },
  { date: '2025-08', earned: 48300, redeemed: 33800 },
  { date: '2025-09', earned: 51000, redeemed: 35200 },
  { date: '2025-10', earned: 47800, redeemed: 36400 },
  { date: '2025-11', earned: 55200, redeemed: 38900 },
  { date: '2025-12', earned: 62100, redeemed: 42300 },
  { date: '2026-01', earned: 58400, redeemed: 40100 },
];

const tierDistribution = [
  { name: 'Bronze', value: 85200, color: '#cd7f32' },
  { name: 'Silver', value: 42300, color: '#c0c0c0' },
  { name: 'Gold', value: 28100, color: '#ffd700' },
  { name: 'Platinum', value: 6800, color: '#b0b0b0' },
  { name: 'Diamond', value: 1100, color: '#b9f2ff' },
];

const projectPerformance = [
  { name: 'T Town', members: 32500, stamps: 18200 },
  { name: 'LOHAS Park', members: 28100, stamps: 15600 },
  { name: 'Temple Mall', members: 24300, stamps: 13400 },
  { name: 'Maritime Bay', members: 21800, stamps: 11900 },
  { name: 'TKO Gateway', members: 19500, stamps: 10800 },
  { name: 'Stanley Plaza', members: 16200, stamps: 9100 },
];

const recentAlerts = [
  {
    id: '1',
    title: 'Abnormal stamp earning - Member M00892',
    level: 'high' as RiskLevel,
    project: 'T Town',
    time: '2026-02-04 09:15',
    status: 'pending',
  },
  {
    id: '2',
    title: 'Duplicate receipt detected - TXN#20260204001',
    level: 'medium' as RiskLevel,
    project: 'LOHAS Park',
    time: '2026-02-04 08:42',
    status: 'pending',
  },
  {
    id: '3',
    title: 'Velocity breach - Member M01245',
    level: 'critical' as RiskLevel,
    project: 'Temple Mall',
    time: '2026-02-04 07:30',
    status: 'under-review',
  },
  {
    id: '4',
    title: 'Amount anomaly - Transaction over threshold',
    level: 'medium' as RiskLevel,
    project: 'Maritime Bay',
    time: '2026-02-03 22:18',
    status: 'resolved',
  },
  {
    id: '5',
    title: 'Suspicious device pattern - Member M00533',
    level: 'low' as RiskLevel,
    project: 'TKO Gateway',
    time: '2026-02-03 18:05',
    status: 'resolved',
  },
];

const Dashboard: React.FC = () => {
  const { t } = useLocale();
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs);

  useEffect(() => {
    setBreadcrumbs([{ title: 'Dashboard' }]);
  }, [setBreadcrumbs]);

  const alertColumns = [
    {
      title: t('riskControl.riskAlert'),
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: t('riskControl.riskLevel'),
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level: RiskLevel) => <RiskLevelTag level={level} />,
    },
    {
      title: t('organization.project'),
      dataIndex: 'project',
      key: 'project',
      width: 120,
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          pending: 'orange',
          'under-review': 'blue',
          resolved: 'green',
        };
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: t('common.createdAt'),
      dataIndex: 'time',
      key: 'time',
      width: 160,
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>
        {t('organization.groupManagement')} - Dashboard
      </Title>

      {/* Metrics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title={t('member.member') + ' ' + t('common.total').replace('{total}', '')}
              value={163500}
              prefix={<TeamOutlined style={{ color: '#1677ff' }} />}
              suffix={
                <span style={{ fontSize: 14, color: '#52c41a' }}>
                  <ArrowUpOutlined /> 4.8%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title={t('organization.projectList')}
              value={12}
              prefix={<ProjectOutlined style={{ color: '#722ed1' }} />}
              suffix={
                <span style={{ fontSize: 14, color: '#52c41a' }}>
                  <ArrowUpOutlined /> 2
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title={t('stamp.stampEarning')}
              value={58400}
              prefix={<StarOutlined style={{ color: '#faad14' }} />}
              suffix={
                <span style={{ fontSize: 14, color: '#ff4d4f' }}>
                  <ArrowDownOutlined /> 5.9%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title={t('riskControl.riskAlert')}
              value={7}
              prefix={<AlertOutlined style={{ color: '#ff4d4f' }} />}
              suffix={
                <span style={{ fontSize: 14, color: '#ff4d4f' }}>
                  3 {t('common.pending')}
                </span>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card title={t('member.member') + ' & ' + t('stamp.stamp') + ' Trends'}>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={stampTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="earned"
                  stroke="#1677ff"
                  strokeWidth={2}
                  name={t('stamp.earn')}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="redeemed"
                  stroke="#ff4d4f"
                  strokeWidth={2}
                  name={t('stamp.redeem')}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={t('member.memberTier') + ' Distribution'}>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={tierDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {tierDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => value.toLocaleString()} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Project Performance & Alerts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={t('organization.projectList') + ' Performance'}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={projectPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="members" fill="#1677ff" name={t('member.member')} />
                <Bar dataKey="stamps" fill="#faad14" name={t('stamp.stamp')} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={t('riskControl.riskAlert')}>
            <Table
              columns={alertColumns}
              dataSource={recentAlerts}
              rowKey="id"
              size="small"
              pagination={false}
              scroll={{ y: 280 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
