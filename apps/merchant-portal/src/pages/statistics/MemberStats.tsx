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
  Progress,
} from 'antd';
import {
  PieChartOutlined,
  TeamOutlined,
  UserAddOutlined,
  ReloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const labels: Record<string, Record<string, string>> = {
  title: { 'zh-CN': '会员统计', 'zh-TW': '會員統計', en: 'Member Statistics' },
  uniqueVisitors: { 'zh-CN': '独立到访会员', 'zh-TW': '獨立到訪會員', en: 'Unique Visitors' },
  newMembers: { 'zh-CN': '新会员', 'zh-TW': '新會員', en: 'New Members' },
  returningMembers: { 'zh-CN': '回访会员', 'zh-TW': '回訪會員', en: 'Returning Members' },
  returnRate: { 'zh-CN': '回访率', 'zh-TW': '回訪率', en: 'Return Rate' },
  memberTierDist: { 'zh-CN': '到访会员等级分布', 'zh-TW': '到訪會員等級分布', en: 'Visitor Tier Distribution' },
  visitTrend: { 'zh-CN': '到访趋势', 'zh-TW': '到訪趨勢', en: 'Visit Trends' },
  newVsReturning: { 'zh-CN': '新会员 vs 回访会员', 'zh-TW': '新會員 vs 回訪會員', en: 'New vs Returning Members' },
  topMembers: { 'zh-CN': '高价值会员 (本店)', 'zh-TW': '高價值會員 (本店)', en: 'Top Members (This Shop)' },
  compared: { 'zh-CN': '较上月', 'zh-TW': '較上月', en: 'vs last month' },
  daily: { 'zh-CN': '按日', 'zh-TW': '按日', en: 'Daily' },
  weekly: { 'zh-CN': '按周', 'zh-TW': '按週', en: 'Weekly' },
  monthly: { 'zh-CN': '按月', 'zh-TW': '按月', en: 'Monthly' },
  member: { 'zh-CN': '会员', 'zh-TW': '會員', en: 'Member' },
  tier: { 'zh-CN': '等级', 'zh-TW': '等級', en: 'Tier' },
  visits: { 'zh-CN': '到访次数', 'zh-TW': '到訪次數', en: 'Visits' },
  totalSpend: { 'zh-CN': '总消费', 'zh-TW': '總消費', en: 'Total Spend' },
  lastVisit: { 'zh-CN': '最近到访', 'zh-TW': '最近到訪', en: 'Last Visit' },
  bronze: { 'zh-CN': '铜卡', 'zh-TW': '銅卡', en: 'Bronze' },
  silver: { 'zh-CN': '银卡', 'zh-TW': '銀卡', en: 'Silver' },
  gold: { 'zh-CN': '金卡', 'zh-TW': '金卡', en: 'Gold' },
  platinum: { 'zh-CN': '铂金卡', 'zh-TW': '鉑金卡', en: 'Platinum' },
  diamond: { 'zh-CN': '钻石卡', 'zh-TW': '鑽石卡', en: 'Diamond' },
  newMember: { 'zh-CN': '新会员', 'zh-TW': '新會員', en: 'New' },
  returning: { 'zh-CN': '回访', 'zh-TW': '回訪', en: 'Returning' },
};

const tierDistData = [
  { name: 'Bronze', value: 35, color: '#cd7f32' },
  { name: 'Silver', value: 28, color: '#c0c0c0' },
  { name: 'Gold', value: 22, color: '#ffd700' },
  { name: 'Platinum', value: 10, color: '#e5e4e2' },
  { name: 'Diamond', value: 5, color: '#b9f2ff' },
];

const visitTrendData = [
  { date: '01/14', newMembers: 3, returning: 18 },
  { date: '01/15', newMembers: 5, returning: 22 },
  { date: '01/16', newMembers: 2, returning: 15 },
  { date: '01/17', newMembers: 6, returning: 28 },
  { date: '01/18', newMembers: 8, returning: 34 },
  { date: '01/19', newMembers: 10, returning: 38 },
  { date: '01/20', newMembers: 4, returning: 26 },
];

interface TopMember {
  key: string;
  name: string;
  memberNo: string;
  tier: string;
  visits: number;
  totalSpend: number;
  lastVisit: string;
}

const topMembers: TopMember[] = [
  { key: '1', name: '刘敏', memberNo: 'LR20240089', tier: 'diamond', visits: 24, totalSpend: 38500, lastVisit: '2025-01-19' },
  { key: '2', name: '周雪', memberNo: 'LR20240118', tier: 'platinum', visits: 18, totalSpend: 26800, lastVisit: '2025-01-18' },
  { key: '3', name: '张丽', memberNo: 'LR20240045', tier: 'gold', visits: 15, totalSpend: 19200, lastVisit: '2025-01-19' },
  { key: '4', name: '王小明', memberNo: 'LR20240001', tier: 'gold', visits: 12, totalSpend: 15600, lastVisit: '2025-01-20' },
  { key: '5', name: '陈大海', memberNo: 'LR20240023', tier: 'silver', visits: 10, totalSpend: 12800, lastVisit: '2025-01-20' },
];

const tierColors: Record<string, string> = {
  bronze: '#cd7f32',
  silver: '#c0c0c0',
  gold: '#ffd700',
  platinum: '#e5e4e2',
  diamond: '#b9f2ff',
};

const MemberStats: React.FC = () => {
  const { locale } = useLocale();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const getLabel = (key: string) => labels[key]?.[locale] || labels[key]?.en || key;

  const topMemberColumns: ColumnsType<TopMember> = [
    {
      title: getLabel('member'),
      key: 'member',
      render: (_, record) => (
        <div>
          <Text strong>{record.name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.memberNo}</Text>
        </div>
      ),
    },
    {
      title: getLabel('tier'),
      dataIndex: 'tier',
      key: 'tier',
      width: 100,
      render: (tier: string) => (
        <Tag color={tierColors[tier]} icon={<CrownOutlined />}>
          {getLabel(tier)}
        </Tag>
      ),
    },
    {
      title: getLabel('visits'),
      dataIndex: 'visits',
      key: 'visits',
      width: 80,
      align: 'center',
      sorter: (a, b) => a.visits - b.visits,
    },
    {
      title: getLabel('totalSpend'),
      dataIndex: 'totalSpend',
      key: 'totalSpend',
      width: 130,
      align: 'right',
      render: (val) => `HK$ ${val.toLocaleString()}`,
      sorter: (a, b) => a.totalSpend - b.totalSpend,
    },
    {
      title: getLabel('lastVisit'),
      dataIndex: 'lastVisit',
      key: 'lastVisit',
      width: 120,
    },
  ];

  return (
    <div>
      <Title level={4}>
        <PieChartOutlined style={{ marginRight: 8 }} />
        {getLabel('title')}
      </Title>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic
              title={getLabel('uniqueVisitors')}
              value={186}
              prefix={<TeamOutlined />}
              valueStyle={{ fontSize: 20 }}
            />
            <Text style={{ fontSize: 12, color: '#52c41a' }}>
              <ArrowUpOutlined /> 12.5% {getLabel('compared')}
            </Text>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic
              title={getLabel('newMembers')}
              value={38}
              prefix={<UserAddOutlined />}
              valueStyle={{ fontSize: 20, color: '#52c41a' }}
            />
            <Text style={{ fontSize: 12, color: '#52c41a' }}>
              <ArrowUpOutlined /> 18.2% {getLabel('compared')}
            </Text>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic
              title={getLabel('returningMembers')}
              value={148}
              prefix={<ReloadOutlined />}
              valueStyle={{ fontSize: 20 }}
            />
            <Text style={{ fontSize: 12, color: '#cf1322' }}>
              <ArrowDownOutlined /> 3.1% {getLabel('compared')}
            </Text>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic
              title={getLabel('returnRate')}
              value={79.6}
              suffix="%"
              valueStyle={{ fontSize: 20 }}
            />
            <Progress percent={79.6} showInfo={false} strokeColor="#1890ff" />
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
        {/* Tier Distribution */}
        <Col xs={24} lg={8}>
          <Card
            title={getLabel('memberTierDist')}
            bordered={false}
            style={{ borderRadius: 8, height: '100%' }}
          >
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={tierDistData.map((d) => ({
                    ...d,
                    name: getLabel(d.name.toLowerCase()),
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {tierDistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Visit Trend - New vs Returning */}
        <Col xs={24} lg={16}>
          <Card
            title={getLabel('newVsReturning')}
            bordered={false}
            style={{ borderRadius: 8 }}
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={visitTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="newMembers"
                  name={getLabel('newMember')}
                  fill="#52c41a"
                  stackId="a"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="returning"
                  name={getLabel('returning')}
                  fill="#1890ff"
                  stackId="a"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Top Members */}
        <Col xs={24}>
          <Card
            title={
              <Space>
                <CrownOutlined />
                {getLabel('topMembers')}
              </Space>
            }
            bordered={false}
            style={{ borderRadius: 8 }}
          >
            <Table
              columns={topMemberColumns}
              dataSource={topMembers}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MemberStats;
