import React, { useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Space, Typography, Badge, Progress } from 'antd';
import {
  AlertOutlined,
  ExclamationCircleOutlined,
  StopOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import { useLocale } from '../../hooks/useLocale';
import { useAppStore } from '../../store/app';
import RiskLevelTag from '../../components/RiskLevelTag';
import type { RiskLevel } from '@link-reit/types';

const { Title, Text } = Typography;

const riskDistribution = [
  { level: 'low', count: 45, color: '#52c41a' },
  { level: 'medium', count: 23, color: '#faad14' },
  { level: 'high', count: 8, color: '#ff4d4f' },
  { level: 'critical', count: 2, color: '#cf1322' },
];

const weeklyAlerts = [
  { day: 'Mon', flagged: 12, blocked: 3, resolved: 8 },
  { day: 'Tue', flagged: 15, blocked: 5, resolved: 11 },
  { day: 'Wed', flagged: 8, blocked: 2, resolved: 9 },
  { day: 'Thu', flagged: 18, blocked: 4, resolved: 13 },
  { day: 'Fri', flagged: 22, blocked: 7, resolved: 16 },
  { day: 'Sat', flagged: 28, blocked: 8, resolved: 20 },
  { day: 'Sun', flagged: 14, blocked: 3, resolved: 10 },
];

const pendingAlerts = [
  { id: 'RA001', type: 'abnormal-stamp', level: 'critical' as RiskLevel, title: 'Abnormal stamp earning: 5000 stamps in 10 minutes', member: 'M00892', project: 'T Town', time: '2026-02-04 09:15', status: 'pending' },
  { id: 'RA002', type: 'duplicate-receipt', level: 'high' as RiskLevel, title: 'Duplicate receipt detected for TXN#20260204001', member: 'M01245', project: 'LOHAS Park', time: '2026-02-04 08:42', status: 'pending' },
  { id: 'RA003', type: 'velocity-breach', level: 'high' as RiskLevel, title: 'Velocity breach: 15 transactions in 1 hour', member: 'M01102', project: 'Temple Mall', time: '2026-02-04 07:30', status: 'pending' },
  { id: 'RA004', type: 'amount-anomaly', level: 'medium' as RiskLevel, title: 'Transaction amount 3x above member average', member: 'M00445', project: 'Maritime Bay', time: '2026-02-03 22:18', status: 'under-review' },
  { id: 'RA005', type: 'suspicious-transaction', level: 'medium' as RiskLevel, title: 'Multiple transactions from same device, different members', member: 'M00789', project: 'TKO Gateway', time: '2026-02-03 18:05', status: 'under-review' },
  { id: 'RA006', type: 'member-fraud', level: 'high' as RiskLevel, title: 'Member linked to previously banned account', member: 'M01340', project: 'Stanley Plaza', time: '2026-02-03 14:22', status: 'pending' },
];

const Workbench: React.FC = () => {
  const { t } = useLocale();
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs);

  useEffect(() => {
    setBreadcrumbs([
      { title: t('riskControl.riskControl'), path: '/risk-control/workbench' },
      { title: t('riskControl.workbench') },
    ]);
  }, [setBreadcrumbs, t]);

  const alertColumns = [
    {
      title: t('riskControl.riskLevel'), dataIndex: 'level', key: 'level', width: 100,
      render: (level: RiskLevel) => <RiskLevelTag level={level} />,
      sorter: (a: typeof pendingAlerts[0], b: typeof pendingAlerts[0]) => {
        const order: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
        return order[b.level] - order[a.level];
      },
      defaultSortOrder: 'ascend' as const,
    },
    {
      title: 'Type', dataIndex: 'type', key: 'type', width: 150,
      render: (type: string) => <Tag color="red">{type.replace(/-/g, ' ')}</Tag>,
    },
    { title: t('riskControl.riskAlert'), dataIndex: 'title', key: 'title', ellipsis: true },
    { title: t('member.member'), dataIndex: 'member', key: 'member', width: 100 },
    { title: t('organization.project'), dataIndex: 'project', key: 'project', width: 120 },
    {
      title: t('common.status'), dataIndex: 'status', key: 'status', width: 120,
      render: (status: string) => {
        const map: Record<string, { color: string; text: string }> = {
          pending: { color: 'orange', text: t('common.pending') },
          'under-review': { color: 'blue', text: 'Under Review' },
        };
        const cfg = map[status] || { color: 'default', text: status };
        return <Tag color={cfg.color}>{cfg.text}</Tag>;
      },
    },
    { title: t('common.createdAt'), dataIndex: 'time', key: 'time', width: 160 },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>
        <AlertOutlined style={{ marginRight: 8 }} />
        {t('riskControl.workbench')}
      </Title>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('common.pending') + ' Reviews'}
              value={6}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Today's Flagged"
              value={28}
              prefix={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Auto-Blocked Today"
              value={8}
              prefix={<StopOutlined style={{ color: '#cf1322' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Resolved Today"
              value={20}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={8}>
          <Card title={t('riskControl.riskLevel') + ' Distribution'}>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={riskDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="count" nameKey="level" label={({ level, count }) => `${level}: ${count}`}>
                  {riskDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="Weekly Alert Trend">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weeklyAlerts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="flagged" fill="#ff4d4f" name="Flagged" />
                <Bar dataKey="blocked" fill="#cf1322" name="Blocked" />
                <Bar dataKey="resolved" fill="#52c41a" name="Resolved" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Pending Alerts Table */}
      <Card title={<Space><Badge status="processing" />{t('common.pending') + ' ' + t('riskControl.riskAlert')}</Space>}>
        <Table
          columns={alertColumns}
          dataSource={pendingAlerts}
          rowKey="id"
          pagination={false}
          size="middle"
          scroll={{ x: 1100 }}
        />
      </Card>
    </div>
  );
};

export default Workbench;
