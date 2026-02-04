import React, { useState } from 'react';
import {
  Card, Table, Button, Tag, Space, Modal, Typography, Popconfirm,
  Badge, Row, Col, Statistic, Descriptions, Progress,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined,
  PauseCircleOutlined, EyeOutlined, NodeIndexOutlined,
  UserOutlined, CheckCircleOutlined, CloseCircleOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const MemberJourneys: React.FC = () => {
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedJourney, setSelectedJourney] = useState<any>(null);

  const mockJourneys = [
    {
      key: '1', name: '新会员入门旅程', description: '引导新会员完成首次消费和APP功能探索',
      entryTrigger: '新会员注册', steps: 5,
      totalEntered: 8530, currentlyActive: 2340, completed: 5120, dropped: 1070,
      completionRate: 60.0, status: 'active',
      createdAt: '2026-01-15',
    },
    {
      key: '2', name: '沉默会员挽回旅程', description: '多阶段唤醒沉默超过30天的会员',
      entryTrigger: '沉默超30天', steps: 4,
      totalEntered: 3200, currentlyActive: 890, completed: 1560, dropped: 750,
      completionRate: 48.8, status: 'active',
      createdAt: '2026-01-20',
    },
    {
      key: '3', name: '升级激励旅程', description: '鼓励即将达到升级标准的会员完成消费目标',
      entryTrigger: '距升级差20%印花', steps: 3,
      totalEntered: 1250, currentlyActive: 680, completed: 380, dropped: 190,
      completionRate: 30.4, status: 'active',
      createdAt: '2026-01-25',
    },
  ];

  const columns = [
    {
      title: '旅程名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <Space direction="vertical" size={0}>
          <Text strong>{name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.description}</Text>
        </Space>
      ),
    },
    {
      title: '入口触发',
      dataIndex: 'entryTrigger',
      key: 'entryTrigger',
      render: (trigger: string) => <Tag color="blue">{trigger}</Tag>,
    },
    {
      title: '步骤数',
      dataIndex: 'steps',
      key: 'steps',
      render: (steps: number) => <Text>{steps}步</Text>,
    },
    {
      title: '总进入',
      dataIndex: 'totalEntered',
      key: 'totalEntered',
      render: (count: number) => count.toLocaleString(),
    },
    {
      title: '进行中',
      dataIndex: 'currentlyActive',
      key: 'currentlyActive',
      render: (count: number) => <Tag color="processing">{count.toLocaleString()}</Tag>,
    },
    {
      title: '完成率',
      dataIndex: 'completionRate',
      key: 'completionRate',
      render: (rate: number) => (
        <Progress percent={rate} size="small" style={{ width: 100 }}
          strokeColor={rate > 50 ? '#52c41a' : rate > 30 ? '#1890ff' : '#faad14'}
        />
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge status={status === 'active' ? 'success' : status === 'paused' ? 'warning' : 'default'}
          text={status === 'active' ? '运行中' : status === 'paused' ? '已暂停' : '草稿'} />
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />}
            onClick={() => { setSelectedJourney(record); setDetailVisible(true); }}>
            详情
          </Button>
          {record.status === 'active' ? (
            <Button type="link" size="small" icon={<PauseCircleOutlined />}>暂停</Button>
          ) : (
            <Button type="link" size="small" icon={<PlayCircleOutlined />}>启动</Button>
          )}
          <Button type="link" size="small" icon={<EditOutlined />} />
          <Popconfirm title="确定删除此旅程？">
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="活跃旅程" value={mockJourneys.filter(j => j.status === 'active').length}
              prefix={<NodeIndexOutlined />} suffix="条" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="旅程中会员" value={mockJourneys.reduce((s, j) => s + j.currentlyActive, 0)}
              prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="已完成会员" value={mockJourneys.reduce((s, j) => s + j.completed, 0)}
              prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="平均完成率"
              value={(mockJourneys.reduce((s, j) => s + j.completionRate, 0) / mockJourneys.length).toFixed(1)}
              suffix="%" />
          </Card>
        </Col>
      </Row>

      <Card
        title={<Title level={4} style={{ margin: 0 }}>会员旅程</Title>}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            新建旅程
          </Button>
        }
      >
        <Table columns={columns} dataSource={mockJourneys} pagination={false} />
      </Card>

      <Modal
        title={selectedJourney?.name}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        width={800}
        footer={null}
      >
        {selectedJourney && (
          <>
            <Paragraph type="secondary">{selectedJourney.description}</Paragraph>

            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}><Statistic title="总进入" value={selectedJourney.totalEntered} /></Col>
              <Col span={6}><Statistic title="进行中" value={selectedJourney.currentlyActive} /></Col>
              <Col span={6}><Statistic title="已完成" value={selectedJourney.completed} valueStyle={{ color: '#52c41a' }} /></Col>
              <Col span={6}><Statistic title="已流失" value={selectedJourney.dropped} valueStyle={{ color: '#ff4d4f' }} /></Col>
            </Row>

            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="入口触发">{selectedJourney.entryTrigger}</Descriptions.Item>
              <Descriptions.Item label="步骤数">{selectedJourney.steps}步</Descriptions.Item>
              <Descriptions.Item label="完成率">{selectedJourney.completionRate}%</Descriptions.Item>
              <Descriptions.Item label="创建时间">{selectedJourney.createdAt}</Descriptions.Item>
            </Descriptions>

            <Title level={5} style={{ marginTop: 16 }}>旅程步骤</Title>
            <Paragraph type="secondary">
              (旅程可视化编辑器将在完整版中提供，支持拖拽编排步骤流程)
            </Paragraph>

            <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 8, textAlign: 'center' }}>
              <Space direction="vertical" align="center">
                <Tag color="blue" style={{ padding: '4px 16px' }}>注册</Tag>
                <Text type="secondary">↓ 立即</Text>
                <Tag color="green" style={{ padding: '4px 16px' }}>发送欢迎推送 + 新人券</Tag>
                <Text type="secondary">↓ 等待3天</Text>
                <Tag color="orange" style={{ padding: '4px 16px' }}>检查是否已消费？</Tag>
                <Space>
                  <Text type="secondary">是 → </Text>
                  <Tag color="green">发送感谢推送</Tag>
                  <Text type="secondary">否 → </Text>
                  <Tag color="red">发送催促消费短信</Tag>
                </Space>
                <Text type="secondary">↓ 等待7天</Text>
                <Tag color="purple" style={{ padding: '4px 16px' }}>最终效果评估</Tag>
              </Space>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default MemberJourneys;
