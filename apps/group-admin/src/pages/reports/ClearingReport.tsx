import React, { useEffect, useState } from 'react';
import { Card, Table, Select, DatePicker, Space, Typography, Row, Col, Statistic, Tag, Button } from 'antd';
import { BarChartOutlined, ExportOutlined, DownloadOutlined } from '@ant-design/icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';
import { useAppStore } from '../../store/app';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface ClearingRow {
  projectId: string;
  projectName: string;
  totalCleared: number;
  membersAffected: number;
  avgClearedPerMember: number;
  clearingType: string;
  period: string;
}

const mockClearingData: ClearingRow[] = [
  { projectId: 'proj-001', projectName: 'T Town', totalCleared: 185000, membersAffected: 8200, avgClearedPerMember: 22.6, clearingType: 'fixed-period', period: '2026-01' },
  { projectId: 'proj-002', projectName: 'LOHAS Park', totalCleared: 142000, membersAffected: 6500, avgClearedPerMember: 21.8, clearingType: 'fixed-period', period: '2026-01' },
  { projectId: 'proj-003', projectName: 'Temple Mall', totalCleared: 98000, membersAffected: 4800, avgClearedPerMember: 20.4, clearingType: 'annual', period: '2026-01' },
  { projectId: 'proj-004', projectName: 'Maritime Bay', totalCleared: 76000, membersAffected: 3900, avgClearedPerMember: 19.5, clearingType: 'fixed-period', period: '2026-01' },
  { projectId: 'proj-005', projectName: 'TKO Gateway', totalCleared: 62000, membersAffected: 3200, avgClearedPerMember: 19.4, clearingType: 'fixed-period', period: '2026-01' },
  { projectId: 'proj-006', projectName: 'Stanley Plaza', totalCleared: 38000, membersAffected: 2100, avgClearedPerMember: 18.1, clearingType: 'rolling', period: '2026-01' },
];

const monthlyClearingTrend = [
  { month: '2025-08', cleared: 420000, members: 22000 },
  { month: '2025-09', cleared: 380000, members: 19500 },
  { month: '2025-10', cleared: 450000, members: 23800 },
  { month: '2025-11', cleared: 390000, members: 20100 },
  { month: '2025-12', cleared: 680000, members: 35200 },
  { month: '2026-01', cleared: 601000, members: 28700 },
];

const clearingByType = [
  { name: 'Fixed Period', value: 463000, color: '#1677ff' },
  { name: 'Annual', value: 98000, color: '#faad14' },
  { name: 'Rolling', value: 38000, color: '#52c41a' },
  { name: 'Manual', value: 2000, color: '#ff4d4f' },
];

const ClearingReport: React.FC = () => {
  const { t } = useLocale();
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs);
  const [projectFilter, setProjectFilter] = useState<string>('all');

  useEffect(() => {
    setBreadcrumbs([
      { title: t('report.reportCenter'), path: '/reports/clearing' },
      { title: t('stamp.clearingReport') },
    ]);
  }, [setBreadcrumbs, t]);

  const totalCleared = mockClearingData.reduce((sum, r) => sum + r.totalCleared, 0);
  const totalMembers = mockClearingData.reduce((sum, r) => sum + r.membersAffected, 0);

  const columns: ColumnsType<ClearingRow> = [
    { title: t('organization.project'), dataIndex: 'projectName', key: 'projectName' },
    { title: t('stamp.stampClearing') + ' Total', dataIndex: 'totalCleared', key: 'totalCleared', render: (v: number) => v.toLocaleString(), sorter: (a, b) => a.totalCleared - b.totalCleared },
    { title: t('member.member') + ' Affected', dataIndex: 'membersAffected', key: 'membersAffected', render: (v: number) => v.toLocaleString(), sorter: (a, b) => a.membersAffected - b.membersAffected },
    { title: 'Avg / Member', dataIndex: 'avgClearedPerMember', key: 'avgClearedPerMember', render: (v: number) => v.toFixed(1) },
    { title: 'Clearing Type', dataIndex: 'clearingType', key: 'clearingType', render: (v: string) => <Tag color={v === 'annual' ? 'orange' : v === 'rolling' ? 'green' : 'blue'}>{v}</Tag> },
    { title: 'Period', dataIndex: 'period', key: 'period' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}><BarChartOutlined style={{ marginRight: 8 }} />{t('stamp.clearingReport')}</Title>
        <Space>
          <Select value={projectFilter} onChange={setProjectFilter} style={{ width: 160 }} options={[{ label: t('common.all'), value: 'all' }, ...mockClearingData.map((p) => ({ label: p.projectName, value: p.projectId }))]} />
          <RangePicker picker="month" />
          <Button icon={<DownloadOutlined />}>{t('common.export')}</Button>
        </Space>
      </div>

      {/* Summary */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Total Stamps Cleared (Jan 2026)" value={totalCleared} valueStyle={{ color: '#ff4d4f' }} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Members Affected" value={totalMembers} valueStyle={{ color: '#faad14' }} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Avg Cleared / Member" value={(totalCleared / totalMembers).toFixed(1)} suffix="stamps" /></Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="Monthly Clearing Trend">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyClearingTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="cleared" fill="#ff4d4f" name="Stamps Cleared" />
                <Bar yAxisId="right" dataKey="members" fill="#1677ff" name="Members Affected" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Clearing by Type">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={clearingByType} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {clearingByType.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => v.toLocaleString()} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Detail Table */}
      <Card title={t('organization.project') + ' Breakdown'}>
        <Table columns={columns} dataSource={mockClearingData} rowKey="projectId" pagination={false} summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0}><strong>Total</strong></Table.Summary.Cell>
            <Table.Summary.Cell index={1}><strong>{totalCleared.toLocaleString()}</strong></Table.Summary.Cell>
            <Table.Summary.Cell index={2}><strong>{totalMembers.toLocaleString()}</strong></Table.Summary.Cell>
            <Table.Summary.Cell index={3}><strong>{(totalCleared / totalMembers).toFixed(1)}</strong></Table.Summary.Cell>
            <Table.Summary.Cell index={4} />
            <Table.Summary.Cell index={5} />
          </Table.Summary.Row>
        )} />
      </Card>
    </div>
  );
};

export default ClearingReport;
