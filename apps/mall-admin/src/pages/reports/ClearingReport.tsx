import React from 'react';
import { Card, Typography, Table, Row, Col, Statistic, DatePicker, Button, Space, Select, Tag } from 'antd';
import { DownloadOutlined, BarChartOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface ClearingRow {
  key: string;
  period: string;
  totalCleared: number;
  membersAffected: number;
  consumptionStamps: number;
  campaignStamps: number;
  bonusStamps: number;
  avgPerMember: number;
}

const mockData: ClearingRow[] = [
  { key: '1', period: '2024-01', totalCleared: 45200, membersAffected: 3240, consumptionStamps: 28000, campaignStamps: 12000, bonusStamps: 5200, avgPerMember: 13.9 },
  { key: '2', period: '2023-12', totalCleared: 128000, membersAffected: 8500, consumptionStamps: 82000, campaignStamps: 32000, bonusStamps: 14000, avgPerMember: 15.1 },
  { key: '3', period: '2023-11', totalCleared: 38600, membersAffected: 2800, consumptionStamps: 24000, campaignStamps: 10000, bonusStamps: 4600, avgPerMember: 13.8 },
  { key: '4', period: '2023-10', totalCleared: 42100, membersAffected: 3100, consumptionStamps: 26500, campaignStamps: 11000, bonusStamps: 4600, avgPerMember: 13.6 },
  { key: '5', period: '2023-09', totalCleared: 35800, membersAffected: 2600, consumptionStamps: 22000, campaignStamps: 9500, bonusStamps: 4300, avgPerMember: 13.8 },
  { key: '6', period: '2023-08', totalCleared: 51200, membersAffected: 3800, consumptionStamps: 32000, campaignStamps: 13500, bonusStamps: 5700, avgPerMember: 13.5 },
];

const chartData = mockData.map((d) => ({
  period: d.period,
  consumption: d.consumptionStamps,
  campaign: d.campaignStamps,
  bonus: d.bonusStamps,
  members: d.membersAffected,
})).reverse();

const ClearingReport: React.FC = () => {
  const { t } = useLocale();

  const totalCleared = mockData.reduce((s, d) => s + d.totalCleared, 0);
  const totalMembers = mockData.reduce((s, d) => s + d.membersAffected, 0);

  const columns: ColumnsType<ClearingRow> = [
    { title: t('common.details') === '详情' ? '周期' : 'Period', dataIndex: 'period', key: 'period', width: 100 },
    {
      title: t('common.details') === '详情' ? '清零总量' : 'Total Cleared',
      dataIndex: 'totalCleared',
      key: 'totalCleared',
      width: 120,
      render: (v: number) => <Text strong>{v.toLocaleString()}</Text>,
      sorter: (a, b) => a.totalCleared - b.totalCleared,
    },
    {
      title: t('common.details') === '详情' ? '影响会员数' : 'Members Affected',
      dataIndex: 'membersAffected',
      key: 'membersAffected',
      width: 130,
      render: (v: number) => v.toLocaleString(),
    },
    {
      title: t('common.details') === '详情' ? '消费积分' : 'Consumption',
      dataIndex: 'consumptionStamps',
      key: 'consumptionStamps',
      width: 120,
      render: (v: number) => <Tag color="blue">{v.toLocaleString()}</Tag>,
    },
    {
      title: t('common.details') === '详情' ? '活动积分' : 'Campaign',
      dataIndex: 'campaignStamps',
      key: 'campaignStamps',
      width: 110,
      render: (v: number) => <Tag color="purple">{v.toLocaleString()}</Tag>,
    },
    {
      title: t('common.details') === '详情' ? '赠送积分' : 'Bonus',
      dataIndex: 'bonusStamps',
      key: 'bonusStamps',
      width: 100,
      render: (v: number) => <Tag color="green">{v.toLocaleString()}</Tag>,
    },
    {
      title: t('common.details') === '详情' ? '人均清零' : 'Avg/Member',
      dataIndex: 'avgPerMember',
      key: 'avgPerMember',
      width: 110,
      render: (v: number) => v.toFixed(1),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>{t('stamp.clearingReport')}</Title>
        <Space>
          <RangePicker picker="month" />
          <Button type="primary" icon={<DownloadOutlined />}>{t('report.exportReport')}</Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic title={t('common.details') === '详情' ? '总清零积分' : 'Total Cleared'} value={totalCleared} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic title={t('common.details') === '详情' ? '总影响会员' : 'Total Members'} value={totalMembers} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic title={t('common.details') === '详情' ? '本月清零' : 'This Month'} value={mockData[0].totalCleared} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic title={t('common.details') === '详情' ? '本月影响会员' : 'This Month Members'} value={mockData[0].membersAffected} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={14}>
          <Card title={t('common.details') === '详情' ? '清零趋势（按类别）' : 'Clearing Trend by Category'}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="consumption" name={t('common.details') === '详情' ? '消费积分' : 'Consumption'} fill="#1890ff" stackId="a" />
                <Bar dataKey="campaign" name={t('campaign.campaign')} fill="#722ed1" stackId="a" />
                <Bar dataKey="bonus" name={t('stamp.bonus')} fill="#52c41a" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title={t('common.details') === '详情' ? '影响会员数趋势' : 'Affected Members Trend'}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="members" name={t('common.details') === '详情' ? '会员数' : 'Members'} stroke="#1890ff" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Card title={t('common.details') === '详情' ? '清零明细' : 'Clearing Details'}>
        <Table
          columns={columns}
          dataSource={mockData}
          pagination={false}
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0}><Text strong>{t('common.details') === '详情' ? '合计' : 'Total'}</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={1}><Text strong>{totalCleared.toLocaleString()}</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={2}><Text strong>{totalMembers.toLocaleString()}</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={3}><Text strong>{mockData.reduce((s, d) => s + d.consumptionStamps, 0).toLocaleString()}</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={4}><Text strong>{mockData.reduce((s, d) => s + d.campaignStamps, 0).toLocaleString()}</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={5}><Text strong>{mockData.reduce((s, d) => s + d.bonusStamps, 0).toLocaleString()}</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={6}><Text strong>{(totalCleared / totalMembers).toFixed(1)}</Text></Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      </Card>
    </div>
  );
};

export default ClearingReport;
