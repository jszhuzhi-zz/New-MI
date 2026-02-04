import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Select, DatePicker, Space, Typography, Table, Tag } from 'antd';
import { StarOutlined, RiseOutlined, FallOutlined, SwapOutlined } from '@ant-design/icons';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, AreaChart, Area,
} from 'recharts';
import { useLocale } from '../../hooks/useLocale';
import { useAppStore } from '../../store/app';
import StampBadge from '../../components/StampBadge';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const stampTrend = [
  { month: '2025-08', earned: 48300, redeemed: 33800, expired: 2100, net: 12400 },
  { month: '2025-09', earned: 51000, redeemed: 35200, expired: 1800, net: 14000 },
  { month: '2025-10', earned: 47800, redeemed: 36400, expired: 2400, net: 9000 },
  { month: '2025-11', earned: 55200, redeemed: 38900, expired: 1500, net: 14800 },
  { month: '2025-12', earned: 62100, redeemed: 42300, expired: 3200, net: 16600 },
  { month: '2026-01', earned: 58400, redeemed: 40100, expired: 2800, net: 15500 },
];

const projectBreakdown = [
  { project: 'T Town', earned: 18200, redeemed: 12400, balance: 142000 },
  { project: 'LOHAS Park', earned: 15600, redeemed: 10800, balance: 118000 },
  { project: 'Temple Mall', earned: 13400, redeemed: 9200, balance: 95000 },
  { project: 'Maritime Bay', earned: 11900, redeemed: 8100, balance: 82000 },
  { project: 'TKO Gateway', earned: 10800, redeemed: 7400, balance: 73000 },
  { project: 'Stanley Plaza', earned: 9100, redeemed: 6200, balance: 58000 },
];

const tierStampDistribution = [
  { tier: 'Diamond', avgBalance: 15200, avgMonthlyEarn: 3400, members: 1100 },
  { tier: 'Platinum', avgBalance: 8600, avgMonthlyEarn: 1800, members: 6800 },
  { tier: 'Gold', avgBalance: 3800, avgMonthlyEarn: 920, members: 28100 },
  { tier: 'Silver', avgBalance: 1200, avgMonthlyEarn: 380, members: 42300 },
  { tier: 'Bronze', avgBalance: 280, avgMonthlyEarn: 85, members: 85200 },
];

const StampAnalysis: React.FC = () => {
  const { t } = useLocale();
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs);
  const [projectFilter, setProjectFilter] = useState<string>('all');

  useEffect(() => {
    setBreadcrumbs([
      { title: t('member.memberManagement'), path: '/member/cards' },
      { title: t('stamp.stampBalance') },
    ]);
  }, [setBreadcrumbs, t]);

  const projectColumns = [
    { title: t('organization.project'), dataIndex: 'project', key: 'project' },
    { title: t('stamp.earn'), dataIndex: 'earned', key: 'earned', render: (v: number) => v.toLocaleString(), sorter: (a: any, b: any) => a.earned - b.earned },
    { title: t('stamp.redeem'), dataIndex: 'redeemed', key: 'redeemed', render: (v: number) => v.toLocaleString(), sorter: (a: any, b: any) => a.redeemed - b.redeemed },
    { title: t('stamp.stampBalance'), dataIndex: 'balance', key: 'balance', render: (v: number) => <StampBadge count={v} size="small" />, sorter: (a: any, b: any) => a.balance - b.balance },
  ];

  const tierColumns = [
    { title: t('member.memberTier'), dataIndex: 'tier', key: 'tier' },
    { title: t('member.member'), dataIndex: 'members', key: 'members', render: (v: number) => v.toLocaleString() },
    { title: 'Avg Balance', dataIndex: 'avgBalance', key: 'avgBalance', render: (v: number) => v.toLocaleString() },
    { title: 'Avg Monthly Earn', dataIndex: 'avgMonthlyEarn', key: 'avgMonthlyEarn', render: (v: number) => v.toLocaleString() },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          {t('stamp.stampBalance')} - {t('stamp.stampHistory')}
        </Title>
        <Space>
          <Select
            value={projectFilter}
            onChange={setProjectFilter}
            style={{ width: 160 }}
            options={[
              { label: t('common.all'), value: 'all' },
              ...projectBreakdown.map((p) => ({ label: p.project, value: p.project })),
            ]}
          />
          <RangePicker />
        </Space>
      </div>

      {/* Summary Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('stamp.earn') + ' (This Month)'}
              value={58400}
              prefix={<RiseOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('stamp.redeem') + ' (This Month)'}
              value={40100}
              prefix={<FallOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('stamp.expire') + ' (This Month)'}
              value={2800}
              prefix={<SwapOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Net Stamps"
              value={15500}
              prefix={<StarOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Trend Chart */}
      <Card title={t('stamp.stamp') + ' Trend'} style={{ marginBottom: 24 }}>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={stampTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="earned" stackId="1" stroke="#52c41a" fill="#b7eb8f" name={t('stamp.earn')} />
            <Area type="monotone" dataKey="redeemed" stackId="2" stroke="#1677ff" fill="#91caff" name={t('stamp.redeem')} />
            <Area type="monotone" dataKey="expired" stackId="3" stroke="#faad14" fill="#ffe58f" name={t('stamp.expire')} />
            <Line type="monotone" dataKey="net" stroke="#722ed1" strokeWidth={2} name="Net" dot={{ r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Breakdown Tables */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={t('organization.project') + ' Breakdown'}>
            <Table
              columns={projectColumns}
              dataSource={projectBreakdown}
              rowKey="project"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={t('member.memberTier') + ' Distribution'}>
            <Table
              columns={tierColumns}
              dataSource={tierStampDistribution}
              rowKey="tier"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StampAnalysis;
