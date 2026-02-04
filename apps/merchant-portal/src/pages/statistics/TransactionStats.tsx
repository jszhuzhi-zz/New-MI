import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Space,
  DatePicker,
  Radio,
  Table,
  Tag,
} from 'antd';
import {
  LineChartOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  GiftOutlined,
  ShoppingCartOutlined,
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
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const labels: Record<string, Record<string, string>> = {
  title: { 'zh-CN': '交易统计', 'zh-TW': '交易統計', en: 'Transaction Statistics' },
  totalRevenue: { 'zh-CN': '总交易额', 'zh-TW': '總交易額', en: 'Total Revenue' },
  totalTransactions: { 'zh-CN': '总交易笔数', 'zh-TW': '總交易筆數', en: 'Total Transactions' },
  totalStampsIssued: { 'zh-CN': '累计发放印花', 'zh-TW': '累計發放印花', en: 'Total Stamps Issued' },
  avgTransaction: { 'zh-CN': '平均客单价', 'zh-TW': '平均客單價', en: 'Avg. Transaction' },
  trend: { 'zh-CN': '交易趋势', 'zh-TW': '交易趨勢', en: 'Transaction Trends' },
  stampTrend: { 'zh-CN': '印花发放趋势', 'zh-TW': '印花發放趨勢', en: 'Stamp Issuance Trends' },
  daily: { 'zh-CN': '按日', 'zh-TW': '按日', en: 'Daily' },
  weekly: { 'zh-CN': '按周', 'zh-TW': '按週', en: 'Weekly' },
  monthly: { 'zh-CN': '按月', 'zh-TW': '按月', en: 'Monthly' },
  revenue: { 'zh-CN': '交易额', 'zh-TW': '交易額', en: 'Revenue' },
  transactions: { 'zh-CN': '交易数', 'zh-TW': '交易數', en: 'Transactions' },
  stamps: { 'zh-CN': '印花数', 'zh-TW': '印花數', en: 'Stamps' },
  compared: { 'zh-CN': '较上月', 'zh-TW': '較上月', en: 'vs last month' },
  topDays: { 'zh-CN': '高峰交易日', 'zh-TW': '高峰交易日', en: 'Peak Transaction Days' },
  date: { 'zh-CN': '日期', 'zh-TW': '日期', en: 'Date' },
  amount: { 'zh-CN': '交易额 (HK$)', 'zh-TW': '交易額 (HK$)', en: 'Revenue (HK$)' },
  count: { 'zh-CN': '交易笔数', 'zh-TW': '交易筆數', en: 'Transactions' },
  stampCount: { 'zh-CN': '发放印花', 'zh-TW': '發放印花', en: 'Stamps Issued' },
};

const dailyData = [
  { date: '01/14', revenue: 12800, transactions: 28, stamps: 128 },
  { date: '01/15', revenue: 15600, transactions: 35, stamps: 156 },
  { date: '01/16', revenue: 11200, transactions: 24, stamps: 112 },
  { date: '01/17', revenue: 18900, transactions: 42, stamps: 189 },
  { date: '01/18', revenue: 22400, transactions: 50, stamps: 224 },
  { date: '01/19', revenue: 25800, transactions: 58, stamps: 258 },
  { date: '01/20', revenue: 19600, transactions: 44, stamps: 196 },
];

const topDays = [
  { key: '1', date: '2025-01-19 (Sun)', amount: 25800, count: 58, stamps: 258 },
  { key: '2', date: '2025-01-18 (Sat)', amount: 22400, count: 50, stamps: 224 },
  { key: '3', date: '2025-01-17 (Fri)', amount: 18900, count: 42, stamps: 189 },
  { key: '4', date: '2025-01-20 (Mon)', amount: 19600, count: 44, stamps: 196 },
  { key: '5', date: '2025-01-15 (Wed)', amount: 15600, count: 35, stamps: 156 },
];

const TransactionStats: React.FC = () => {
  const { locale } = useLocale();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const getLabel = (key: string) => labels[key]?.[locale] || labels[key]?.en || key;

  const topDayColumns: ColumnsType<typeof topDays[0]> = [
    { title: getLabel('date'), dataIndex: 'date', key: 'date' },
    {
      title: getLabel('amount'),
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (val) => `${val.toLocaleString()}`,
      sorter: (a, b) => a.amount - b.amount,
    },
    { title: getLabel('count'), dataIndex: 'count', key: 'count', align: 'center' },
    {
      title: getLabel('stampCount'),
      dataIndex: 'stamps',
      key: 'stamps',
      align: 'center',
      render: (val) => <Text style={{ color: '#1890ff' }}>{val}</Text>,
    },
  ];

  return (
    <div>
      <Title level={4}>
        <LineChartOutlined style={{ marginRight: 8 }} />
        {getLabel('title')}
      </Title>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic
              title={getLabel('totalRevenue')}
              value={126300}
              prefix={<DollarOutlined />}
              suffix="HK$"
              valueStyle={{ fontSize: 20 }}
            />
            <Text style={{ fontSize: 12, color: '#52c41a' }}>
              <ArrowUpOutlined /> 15.2% {getLabel('compared')}
            </Text>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic
              title={getLabel('totalTransactions')}
              value={281}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ fontSize: 20 }}
            />
            <Text style={{ fontSize: 12, color: '#52c41a' }}>
              <ArrowUpOutlined /> 8.6% {getLabel('compared')}
            </Text>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic
              title={getLabel('totalStampsIssued')}
              value={1263}
              prefix={<GiftOutlined />}
              valueStyle={{ fontSize: 20 }}
            />
            <Text style={{ fontSize: 12, color: '#52c41a' }}>
              <ArrowUpOutlined /> 12.1% {getLabel('compared')}
            </Text>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic
              title={getLabel('avgTransaction')}
              value={449.5}
              prefix="HK$"
              precision={1}
              valueStyle={{ fontSize: 20 }}
            />
            <Text style={{ fontSize: 12, color: '#cf1322' }}>
              <ArrowDownOutlined /> 2.3% {getLabel('compared')}
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Filter Controls */}
      <Card bordered={false} style={{ borderRadius: 8, marginBottom: 16 }}>
        <Space>
          <Radio.Group
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            optionType="button"
            buttonStyle="solid"
          >
            <Radio.Button value="daily">{getLabel('daily')}</Radio.Button>
            <Radio.Button value="weekly">{getLabel('weekly')}</Radio.Button>
            <Radio.Button value="monthly">{getLabel('monthly')}</Radio.Button>
          </Radio.Group>
          <RangePicker />
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        {/* Revenue & Transaction Trend */}
        <Col xs={24} lg={12}>
          <Card
            title={getLabel('trend')}
            bordered={false}
            style={{ borderRadius: 8 }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  name={getLabel('revenue')}
                  stroke="#1890ff"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="transactions"
                  name={getLabel('transactions')}
                  stroke="#52c41a"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Stamp Issuance Trend */}
        <Col xs={24} lg={12}>
          <Card
            title={getLabel('stampTrend')}
            bordered={false}
            style={{ borderRadius: 8 }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="stamps"
                  name={getLabel('stamps')}
                  fill="#722ed1"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Peak Days Table */}
        <Col xs={24}>
          <Card
            title={getLabel('topDays')}
            bordered={false}
            style={{ borderRadius: 8 }}
          >
            <Table
              columns={topDayColumns}
              dataSource={topDays}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TransactionStats;
