import React from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Progress, Space, Typography } from 'antd';
import {
  RobotOutlined,
  TagsOutlined,
  ThunderboltOutlined,
  NodeIndexOutlined,
  MessageOutlined,
  RiseOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

const SmartMarketingDashboard: React.FC = () => {
  const summaryData = {
    activeAutoTagRules: 12,
    activeTriggers: 8,
    activeJourneys: 3,
    todayTriggerExecutions: 1523,
    weeklyMessagesSent: 15840,
    conversionRate: 12.5,
  };

  const topTriggers = [
    { key: '1', name: '新会员欢迎系列', type: 'event', executions: 523, conversionRate: 28.5, status: 'active' },
    { key: '2', name: '沉默会员唤醒', type: 'condition', executions: 312, conversionRate: 15.2, status: 'active' },
    { key: '3', name: '生日印花翻倍', type: 'lifecycle', executions: 189, conversionRate: 45.8, status: 'active' },
    { key: '4', name: '印花即将过期提醒', type: 'event', executions: 856, conversionRate: 22.3, status: 'active' },
    { key: '5', name: '升级祝贺奖励', type: 'event', executions: 98, conversionRate: 62.1, status: 'active' },
  ];

  const segmentDistribution = [
    { key: '1', name: '高价值活跃会员', memberCount: 12580, percentage: 15.2 },
    { key: '2', name: '价格敏感型', memberCount: 23456, percentage: 28.4 },
    { key: '3', name: '餐饮偏好', memberCount: 18920, percentage: 22.9 },
    { key: '4', name: '新注册未消费', memberCount: 8430, percentage: 10.2 },
    { key: '5', name: '流失风险', memberCount: 5670, percentage: 6.9 },
    { key: '6', name: '其他', memberCount: 13444, percentage: 16.4 },
  ];

  const triggerColumns = [
    { title: '触发器名称', dataIndex: 'name', key: 'name' },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const colors: Record<string, string> = {
          event: 'blue', condition: 'orange', lifecycle: 'purple', schedule: 'green',
        };
        const labels: Record<string, string> = {
          event: '事件触发', condition: '条件触发', lifecycle: '生命周期', schedule: '定时触发',
        };
        return <Tag color={colors[type]}>{labels[type]}</Tag>;
      },
    },
    { title: '执行次数', dataIndex: 'executions', key: 'executions' },
    {
      title: '转化率',
      dataIndex: 'conversionRate',
      key: 'conversionRate',
      render: (rate: number) => <span style={{ color: rate > 20 ? '#52c41a' : '#1890ff' }}>{rate}%</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: () => <Tag color="green">运行中</Tag>,
    },
  ];

  const segmentColumns = [
    { title: '分群名称', dataIndex: 'name', key: 'name' },
    {
      title: '会员数',
      dataIndex: 'memberCount',
      key: 'memberCount',
      render: (count: number) => count.toLocaleString(),
    },
    {
      title: '占比',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (pct: number) => <Progress percent={pct} size="small" style={{ width: 120 }} />,
    },
  ];

  return (
    <div>
      <Title level={4}>智能营销概览</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={4}>
          <Card>
            <Statistic title="自动标签规则" value={summaryData.activeAutoTagRules} prefix={<TagsOutlined />} suffix="条运行中" />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="营销触发器" value={summaryData.activeTriggers} prefix={<ThunderboltOutlined />} suffix="条运行中" />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="会员旅程" value={summaryData.activeJourneys} prefix={<NodeIndexOutlined />} suffix="条运行中" />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="今日触发执行" value={summaryData.todayTriggerExecutions} prefix={<RobotOutlined />} suffix="次" />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="本周消息发送" value={summaryData.weeklyMessagesSent} prefix={<MessageOutlined />} suffix="条" />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="整体转化率" value={summaryData.conversionRate} prefix={<RiseOutlined />} suffix="%" valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={14}>
          <Card title="Top 营销触发器" style={{ marginBottom: 16 }}>
            <Table columns={triggerColumns} dataSource={topTriggers} pagination={false} size="small" />
          </Card>
        </Col>
        <Col span={10}>
          <Card title="会员分群分布" style={{ marginBottom: 16 }}>
            <Table columns={segmentColumns} dataSource={segmentDistribution} pagination={false} size="small" />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SmartMarketingDashboard;
