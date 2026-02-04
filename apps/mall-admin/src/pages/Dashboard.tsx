import React from 'react';
import { Card, Row, Col, Statistic, Typography, Table, Tag, Space, Progress, List, Alert } from 'antd';
import {
  TeamOutlined,
  GiftOutlined,
  RiseOutlined,
  WarningOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';
import { useLocale } from '../hooks/useLocale';
import { useAuthStore } from '../store/auth';

const { Title, Text } = Typography;

/** Mock data for dashboard */
const stampTrend = [
  { date: '01/20', earned: 4200, redeemed: 1800 },
  { date: '01/21', earned: 3800, redeemed: 2100 },
  { date: '01/22', earned: 5100, redeemed: 1600 },
  { date: '01/23', earned: 4600, redeemed: 2400 },
  { date: '01/24', earned: 6200, redeemed: 2800 },
  { date: '01/25', earned: 7800, redeemed: 3200 },
  { date: '01/26', earned: 5500, redeemed: 2100 },
];

const tierDistribution = [
  { name: 'Green', value: 12840, color: '#52c41a' },
  { name: 'Silver', value: 5620, color: '#8c8c8c' },
  { name: 'Gold', value: 2180, color: '#faad14' },
  { name: 'Platinum', value: 860, color: '#722ed1' },
];

const topCampaigns = [
  { name: 'Double Stamps Weekend', stamps: 15800, members: 2340, status: 'active' },
  { name: 'CNY Lucky Draw', stamps: 12400, members: 1890, status: 'active' },
  { name: 'New Member Welcome', stamps: 8600, members: 560, status: 'active' },
  { name: 'Birthday Special', stamps: 5200, members: 320, status: 'active' },
];

const recentAlerts = [
  { id: '1', type: 'abnormal-stamp', member: 'M-20241234', detail: '单日积分异常: 获取 580 stamps, 超过日上限', level: 'high', time: '10 min ago' },
  { id: '2', type: 'duplicate-receipt', member: 'M-20241567', detail: '疑似重复小票提交 (收据号: R-2024-8821)', level: 'medium', time: '25 min ago' },
  { id: '3', type: 'velocity-breach', member: 'M-20240089', detail: '1小时内提交 8 次积分请求', level: 'high', time: '1 hour ago' },
];

const stampSourceBreakdown = [
  { source: '小票扫描', count: 4520 },
  { source: '人工录入', count: 1280 },
  { source: '活动赠送', count: 2340 },
  { source: '自动同步', count: 890 },
  { source: '客服台', count: 560 },
];

const Dashboard: React.FC = () => {
  const { t } = useLocale();
  const user = useAuthStore((s) => s.user);

  const riskLevelColor: Record<string, string> = {
    low: 'green',
    medium: 'orange',
    high: 'red',
    critical: 'magenta',
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ marginBottom: 4 }}>
          {user?.projectName} - {t('common.details') === '详情' ? '工作台' : t('common.details') === '詳情' ? '工作台' : 'Dashboard'}
        </Title>
        <Text type="secondary">
          {t('common.details') === '详情'
            ? '商场会员运营数据概览'
            : t('common.details') === '詳情'
            ? '商場會員運營數據概覽'
            : 'Mall membership operations overview'}
        </Text>
      </div>

      {/* Key metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('common.details') === '详情' ? '会员总数' : t('common.details') === '詳情' ? '會員總數' : 'Total Members'}
              value={21500}
              prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
              suffix={
                <Text type="success" style={{ fontSize: 14 }}>
                  <ArrowUpOutlined /> 3.2%
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('common.details') === '详情' ? '今日积分发放' : t('common.details') === '詳情' ? '今日積分發放' : "Today's Stamps Issued"}
              value={5580}
              prefix={<GiftOutlined style={{ color: '#52c41a' }} />}
              suffix={
                <Text type="success" style={{ fontSize: 14 }}>
                  <ArrowUpOutlined /> 12.5%
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('common.details') === '详情' ? '进行中活动' : t('common.details') === '詳情' ? '進行中活動' : 'Active Campaigns'}
              value={4}
              prefix={<ThunderboltOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('common.details') === '详情' ? '风控预警' : t('common.details') === '詳情' ? '風控預警' : 'Risk Alerts'}
              value={3}
              prefix={<WarningOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Risk alerts */}
      {recentAlerts.length > 0 && (
        <Alert
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          message={
            t('common.details') === '详情'
              ? `${recentAlerts.length} 条待处理风控预警`
              : t('common.details') === '詳情'
              ? `${recentAlerts.length} 條待處理風控預警`
              : `${recentAlerts.length} pending risk alerts`
          }
          description={
            <List
              size="small"
              dataSource={recentAlerts}
              renderItem={(item) => (
                <List.Item>
                  <Space>
                    <Tag color={riskLevelColor[item.level]}>{item.level.toUpperCase()}</Tag>
                    <Text strong>{item.member}</Text>
                    <Text type="secondary">{item.detail}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{item.time}</Text>
                  </Space>
                </List.Item>
              )}
            />
          }
          style={{ marginBottom: 24 }}
          closable
        />
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Stamp trend chart */}
        <Col xs={24} lg={16}>
          <Card
            title={
              t('common.details') === '详情' ? '积分发放趋势（近7天）' :
              t('common.details') === '詳情' ? '積分發放趨勢（近7天）' :
              'Stamp Trend (Last 7 Days)'
            }
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stampTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="earned" stackId="1" stroke="#1890ff" fill="#1890ff" fillOpacity={0.3} name={t('stamp.earn')} />
                <Area type="monotone" dataKey="redeemed" stackId="2" stroke="#52c41a" fill="#52c41a" fillOpacity={0.3} name={t('stamp.redeem')} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Tier distribution */}
        <Col xs={24} lg={8}>
          <Card
            title={
              t('common.details') === '详情' ? '会员等级分布' :
              t('common.details') === '詳情' ? '會員等級分佈' :
              'Tier Distribution'
            }
          >
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={tierDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  nameKey="name"
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {tierDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 16 }}>
              {tierDistribution.map((tier) => (
                <div key={tier.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Space>
                    <div style={{ width: 12, height: 12, borderRadius: 2, background: tier.color }} />
                    <Text>{tier.name}</Text>
                  </Space>
                  <Text strong>{tier.value.toLocaleString()}</Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Stamp source breakdown */}
        <Col xs={24} lg={12}>
          <Card
            title={
              t('common.details') === '详情' ? '积分来源分布' :
              t('common.details') === '詳情' ? '積分來源分佈' :
              'Stamp Source Breakdown'
            }
          >
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stampSourceBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="source" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#1890ff" barSize={20} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Active campaigns */}
        <Col xs={24} lg={12}>
          <Card
            title={
              t('common.details') === '详情' ? '活跃活动' :
              t('common.details') === '詳情' ? '活躍活動' :
              'Active Campaigns'
            }
          >
            <Table
              dataSource={topCampaigns}
              pagination={false}
              size="small"
              rowKey="name"
              columns={[
                {
                  title: t('common.details') === '详情' ? '活动名称' : t('common.details') === '詳情' ? '活動名稱' : 'Campaign',
                  dataIndex: 'name',
                  key: 'name',
                },
                {
                  title: t('common.details') === '详情' ? '发放积分' : t('common.details') === '詳情' ? '發放積分' : 'Stamps',
                  dataIndex: 'stamps',
                  key: 'stamps',
                  render: (v: number) => v.toLocaleString(),
                },
                {
                  title: t('common.details') === '详情' ? '参与人数' : t('common.details') === '詳情' ? '參與人數' : 'Members',
                  dataIndex: 'members',
                  key: 'members',
                  render: (v: number) => v.toLocaleString(),
                },
                {
                  title: t('common.status'),
                  dataIndex: 'status',
                  key: 'status',
                  render: () => <Tag color="green">{t('campaign.active')}</Tag>,
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Today's performance */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={8}>
          <Card size="small" title={t('common.details') === '详情' ? '今日新注册' : t('common.details') === '詳情' ? '今日新註冊' : "Today's Registrations"}>
            <Statistic value={48} suffix={t('common.details') === '详情' ? '人' : t('common.details') === '詳情' ? '人' : ''} />
            <Progress percent={72} size="small" strokeColor="#52c41a" style={{ marginTop: 8 }} />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {t('common.details') === '详情' ? '日目标完成率 72%' : t('common.details') === '詳情' ? '日目標完成率 72%' : 'Daily target: 72%'}
            </Text>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card size="small" title={t('common.details') === '详情' ? '今日积分审核' : t('common.details') === '詳情' ? '今日積分審核' : "Today's Stamp Reviews"}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>{t('stamp.approved')}</Text><Text strong style={{ color: '#52c41a' }}>156</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>{t('stamp.pending')}</Text><Text strong style={{ color: '#faad14' }}>23</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>{t('stamp.rejected')}</Text><Text strong style={{ color: '#ff4d4f' }}>8</Text>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card size="small" title={t('common.details') === '详情' ? '本月积分到期预警' : t('common.details') === '詳情' ? '本月積分到期預警' : 'Stamps Expiring This Month'}>
            <Statistic value={12580} valueStyle={{ color: '#faad14' }} prefix={<WarningOutlined />} />
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
              {t('common.details') === '详情' ? '涉及 3,240 名会员' : t('common.details') === '詳情' ? '涉及 3,240 名會員' : 'Affecting 3,240 members'}
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
