import React from 'react';
import { Card, Typography, Row, Col, Statistic, Tag, Table, Space, List, Button, Badge, Timeline, Alert } from 'antd';
import { WarningOutlined, SafetyCertificateOutlined, StopOutlined, ExclamationCircleOutlined, CheckCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '../../hooks/useLocale';

const { Title, Text } = Typography;

const riskDistribution = [
  { name: 'Low', value: 45, color: '#52c41a' },
  { name: 'Medium', value: 28, color: '#faad14' },
  { name: 'High', value: 18, color: '#ff7a45' },
  { name: 'Critical', value: 9, color: '#ff4d4f' },
];

const alertTrend = [
  { date: '01/20', alerts: 12, blocked: 3 },
  { date: '01/21', alerts: 8, blocked: 2 },
  { date: '01/22', alerts: 15, blocked: 5 },
  { date: '01/23', alerts: 10, blocked: 4 },
  { date: '01/24', alerts: 22, blocked: 8 },
  { date: '01/25', alerts: 18, blocked: 6 },
  { date: '01/26', alerts: 14, blocked: 3 },
];

const recentAlerts = [
  { id: '1', type: 'abnormal-stamp', member: 'MC-20240005', memberName: 'Eva Ng', level: 'high', title: '单日积分获取异常', detail: '24小时内获取 580 stamps，超过日上限', time: '10 min ago', status: 'pending' },
  { id: '2', type: 'duplicate-receipt', member: 'MC-20240012', memberName: '孙七', level: 'medium', title: '重复小票', detail: '收据号 R-2024-8821 已被使用过', time: '25 min ago', status: 'pending' },
  { id: '3', type: 'velocity-breach', member: 'MC-20240089', memberName: 'Unknown', level: 'high', title: '频率异常', detail: '1小时内提交 8 次积分请求', time: '1 hour ago', status: 'pending' },
  { id: '4', type: 'amount-anomaly', member: 'MC-20240034', memberName: 'John', level: 'critical', title: '金额异常', detail: '单笔交易 HKD 28,000，超过正常范围', time: '2 hours ago', status: 'under-review' },
  { id: '5', type: 'suspicious-transaction', member: 'MC-20240056', memberName: '刘九', level: 'medium', title: '可疑交易', detail: '连续3天在同一商户大额消费', time: '3 hours ago', status: 'resolved' },
];

const Workbench: React.FC = () => {
  const { t } = useLocale();
  const navigate = useNavigate();

  const levelColors: Record<string, string> = {
    low: 'green',
    medium: 'orange',
    high: 'red',
    critical: 'magenta',
  };

  const statusColors: Record<string, string> = {
    pending: 'orange',
    'under-review': 'blue',
    resolved: 'green',
    escalated: 'red',
  };

  return (
    <div>
      <Title level={4}>{t('riskControl.workbench')}</Title>

      {/* Key metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title={t('common.details') === '详情' ? '待处理异常' : 'Pending Anomalies'}
              value={3}
              prefix={<WarningOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title={t('common.details') === '详情' ? '今日标记交易' : "Today's Flagged"}
              value={14}
              prefix={<ExclamationCircleOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title={t('common.details') === '详情' ? '今日自动拦截' : "Today's Auto-blocked"}
              value={3}
              prefix={<StopOutlined style={{ color: '#ff4d4f' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title={t('common.details') === '详情' ? '活跃规则' : 'Active Rules'}
              value={12}
              prefix={<SafetyCertificateOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Risk level distribution */}
        <Col xs={24} lg={8}>
          <Card title={t('common.details') === '详情' ? '风险等级分布' : 'Risk Level Distribution'}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={riskDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" nameKey="name" label>
                  {riskDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 8 }}>
              {riskDistribution.map((item) => (
                <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Space><div style={{ width: 10, height: 10, borderRadius: 2, background: item.color }} /><Text>{item.name}</Text></Space>
                  <Text strong>{item.value}</Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Alert trend */}
        <Col xs={24} lg={16}>
          <Card title={t('common.details') === '详情' ? '预警趋势 (近7天)' : 'Alert Trend (7 Days)'}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={alertTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="alerts" name={t('common.details') === '详情' ? '预警' : 'Alerts'} stroke="#faad14" strokeWidth={2} />
                <Line type="monotone" dataKey="blocked" name={t('common.details') === '详情' ? '拦截' : 'Blocked'} stroke="#ff4d4f" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Recent alerts */}
      <Card
        title={t('common.details') === '详情' ? '最近预警' : 'Recent Alerts'}
        extra={<Button type="link" onClick={() => navigate('/risk-control/stamp-anomaly')}>{t('common.details') === '详情' ? '查看全部' : 'View All'} <ArrowRightOutlined /></Button>}
      >
        <Table
          dataSource={recentAlerts}
          rowKey="id"
          pagination={false}
          columns={[
            {
              title: t('riskControl.riskLevel'),
              dataIndex: 'level',
              key: 'level',
              width: 100,
              render: (level: string) => <Tag color={levelColors[level]}>{level.toUpperCase()}</Tag>,
            },
            { title: t('member.memberCardNo'), dataIndex: 'member', key: 'member', width: 140 },
            { title: t('common.details') === '详情' ? '类型' : 'Type', dataIndex: 'title', key: 'title', width: 160 },
            { title: t('common.details') === '详情' ? '详情' : 'Detail', dataIndex: 'detail', key: 'detail', ellipsis: true },
            {
              title: t('common.status'),
              dataIndex: 'status',
              key: 'status',
              width: 100,
              render: (status: string) => <Tag color={statusColors[status]}>{status}</Tag>,
            },
            { title: t('common.details') === '详情' ? '时间' : 'Time', dataIndex: 'time', key: 'time', width: 110 },
          ]}
        />
      </Card>
    </div>
  );
};

export default Workbench;
