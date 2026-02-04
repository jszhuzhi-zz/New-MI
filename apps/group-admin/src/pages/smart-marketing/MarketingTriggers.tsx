import React, { useState } from 'react';
import {
  Card, Table, Button, Tag, Space, Modal, Form, Input, Select,
  Typography, Popconfirm, Badge, Tabs, Row, Col, Divider, InputNumber,
  Steps, Switch,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined,
  PauseCircleOutlined, BarChartOutlined, ThunderboltOutlined,
  ClockCircleOutlined, AimOutlined, HeartOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const MarketingTriggers: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();

  const mockTriggers = [
    {
      key: '1', name: '新会员欢迎礼', type: 'event', eventType: 'member_registered',
      actions: ['send_push', 'grant_coupon'], cooldown: 0, maxPerMember: 1,
      totalTriggered: 5230, conversionRate: 28.5, status: 'active',
      lastTriggered: '2026-02-03 15:32',
    },
    {
      key: '2', name: '沉默会员唤醒 (30天)', type: 'condition', eventType: 'member_inactive',
      actions: ['send_push', 'send_sms', 'grant_stamps'], cooldown: 720, maxPerMember: 3,
      totalTriggered: 3120, conversionRate: 15.2, status: 'active',
      lastTriggered: '2026-02-03 08:00',
    },
    {
      key: '3', name: '生日印花双倍', type: 'lifecycle', eventType: 'member_birthday',
      actions: ['send_push', 'send_sms'], cooldown: 0, maxPerMember: 1,
      totalTriggered: 1890, conversionRate: 45.8, status: 'active',
      lastTriggered: '2026-02-03 00:01',
    },
    {
      key: '4', name: '印花到期前7天提醒', type: 'event', eventType: 'stamp_about_to_expire',
      actions: ['send_push', 'send_in_app_message'], cooldown: 1440, maxPerMember: 5,
      totalTriggered: 8560, conversionRate: 22.3, status: 'active',
      lastTriggered: '2026-02-03 09:00',
    },
    {
      key: '5', name: '等级升级祝贺', type: 'event', eventType: 'member_tier_upgraded',
      actions: ['send_push', 'grant_coupon', 'grant_stamps'], cooldown: 0, maxPerMember: 10,
      totalTriggered: 980, conversionRate: 62.1, status: 'active',
      lastTriggered: '2026-02-02 18:45',
    },
    {
      key: '6', name: '周末推送精选活动', type: 'schedule', eventType: '-',
      actions: ['send_push'], cooldown: 0, maxPerMember: null,
      totalTriggered: 42000, conversionRate: 8.5, status: 'active',
      lastTriggered: '2026-02-01 10:00',
    },
    {
      key: '7', name: '流失预警 - 高价值会员', type: 'condition', eventType: 'member_at_risk',
      actions: ['send_sms', 'grant_coupon', 'create_task'], cooldown: 4320, maxPerMember: 2,
      totalTriggered: 450, conversionRate: 35.2, status: 'active',
      lastTriggered: '2026-02-03 06:00',
    },
  ];

  const eventTypes = [
    { value: 'member_registered', label: '新会员注册', icon: <HeartOutlined /> },
    { value: 'member_first_purchase', label: '首次消费' },
    { value: 'member_stamp_earned', label: '获取印花' },
    { value: 'member_stamp_redeemed', label: '兑换印花' },
    { value: 'member_tier_upgraded', label: '等级升级' },
    { value: 'member_tier_downgraded', label: '等级降级' },
    { value: 'member_birthday', label: '会员生日' },
    { value: 'member_anniversary', label: '注册周年' },
    { value: 'member_inactive', label: '会员沉默' },
    { value: 'member_at_risk', label: '流失风险' },
    { value: 'member_reactivated', label: '会员回归' },
    { value: 'stamp_about_to_expire', label: '印花即将过期' },
    { value: 'coupon_about_to_expire', label: '优惠券即将过期' },
    { value: 'receipt_submitted', label: '提交小票' },
    { value: 'location_entered', label: '进入商场(地理围栏)' },
  ];

  const actionTypes = [
    { value: 'send_push', label: '发送推送通知' },
    { value: 'send_sms', label: '发送短信' },
    { value: 'send_email', label: '发送邮件' },
    { value: 'send_in_app_message', label: '应用内消息' },
    { value: 'send_wechat_template', label: '微信模板消息' },
    { value: 'grant_stamps', label: '赠送印花' },
    { value: 'grant_coupon', label: '发放优惠券' },
    { value: 'add_tag', label: '添加标签' },
    { value: 'remove_tag', label: '移除标签' },
    { value: 'upgrade_tier', label: '升级等级' },
    { value: 'create_task', label: '创建客服任务' },
    { value: 'trigger_webhook', label: '触发Webhook' },
  ];

  const columns = [
    {
      title: '触发器名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const config: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
          event: { color: 'blue', label: '事件触发', icon: <ThunderboltOutlined /> },
          schedule: { color: 'green', label: '定时触发', icon: <ClockCircleOutlined /> },
          condition: { color: 'orange', label: '条件触发', icon: <AimOutlined /> },
          lifecycle: { color: 'purple', label: '生命周期', icon: <HeartOutlined /> },
        };
        const c = config[type];
        return <Tag icon={c.icon} color={c.color}>{c.label}</Tag>;
      },
    },
    {
      title: '触发事件',
      dataIndex: 'eventType',
      key: 'eventType',
      render: (type: string) => {
        const found = eventTypes.find(e => e.value === type);
        return found ? found.label : type;
      },
    },
    {
      title: '动作',
      dataIndex: 'actions',
      key: 'actions',
      render: (actions: string[]) => (
        <Space wrap>
          {actions.map(a => {
            const found = actionTypes.find(at => at.value === a);
            return <Tag key={a} style={{ fontSize: 11 }}>{found?.label || a}</Tag>;
          })}
        </Space>
      ),
    },
    {
      title: '触发次数',
      dataIndex: 'totalTriggered',
      key: 'totalTriggered',
      render: (count: number) => count.toLocaleString(),
      sorter: (a: any, b: any) => a.totalTriggered - b.totalTriggered,
    },
    {
      title: '转化率',
      dataIndex: 'conversionRate',
      key: 'conversionRate',
      render: (rate: number) => (
        <Text style={{ color: rate > 20 ? '#52c41a' : rate > 10 ? '#1890ff' : '#faad14' }}>{rate}%</Text>
      ),
      sorter: (a: any, b: any) => a.conversionRate - b.conversionRate,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge status={status === 'active' ? 'success' : 'default'} text={status === 'active' ? '运行中' : '已停用'} />
      ),
    },
    {
      title: '操作',
      key: 'actions_col',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" size="small" icon={<BarChartOutlined />}>统计</Button>
          {record.status === 'active' ? (
            <Button type="link" size="small" icon={<PauseCircleOutlined />}>停用</Button>
          ) : (
            <Button type="link" size="small" icon={<PlayCircleOutlined />}>启用</Button>
          )}
          <Button type="link" size="small" icon={<EditOutlined />} />
          <Popconfirm title="确定删除此触发器？">
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const steps = [
    { title: '基本信息', description: '名称和类型' },
    { title: '触发条件', description: '事件或条件配置' },
    { title: '执行动作', description: '触发后执行的动作' },
    { title: '受众和控制', description: '目标人群和频率控制' },
  ];

  return (
    <div>
      <Card
        title={<Title level={4} style={{ margin: 0 }}>营销触发器</Title>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setModalVisible(true); setCurrentStep(0); }}>
            新建触发器
          </Button>
        }
      >
        <Tabs
          items={[
            { key: 'all', label: '全部', children: <Table columns={columns} dataSource={mockTriggers} /> },
            { key: 'event', label: '事件触发', children: <Table columns={columns} dataSource={mockTriggers.filter(t => t.type === 'event')} /> },
            { key: 'schedule', label: '定时触发', children: <Table columns={columns} dataSource={mockTriggers.filter(t => t.type === 'schedule')} /> },
            { key: 'condition', label: '条件触发', children: <Table columns={columns} dataSource={mockTriggers.filter(t => t.type === 'condition')} /> },
            { key: 'lifecycle', label: '生命周期', children: <Table columns={columns} dataSource={mockTriggers.filter(t => t.type === 'lifecycle')} /> },
          ]}
        />
      </Card>

      <Modal
        title="创建营销触发器"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={800}
        footer={[
          currentStep > 0 && <Button key="prev" onClick={() => setCurrentStep(s => s - 1)}>上一步</Button>,
          currentStep < 3 && <Button key="next" type="primary" onClick={() => setCurrentStep(s => s + 1)}>下一步</Button>,
          currentStep === 3 && <Button key="submit" type="primary" onClick={() => form.submit()}>创建触发器</Button>,
        ]}
      >
        <Steps current={currentStep} items={steps} style={{ marginBottom: 24 }} size="small" />

        <Form form={form} layout="vertical">
          {currentStep === 0 && (
            <>
              <Form.Item name="name" label="触发器名称" rules={[{ required: true }]}>
                <Input placeholder="例如：新会员欢迎礼" />
              </Form.Item>
              <Form.Item name="type" label="触发类型" rules={[{ required: true }]}>
                <Select placeholder="选择触发类型">
                  <Option value="event">事件触发 - 会员产生特定行为时触发</Option>
                  <Option value="schedule">定时触发 - 按设定时间定期触发</Option>
                  <Option value="condition">条件触发 - 满足数据条件时触发</Option>
                  <Option value="lifecycle">生命周期触发 - 会员生命周期里程碑触发</Option>
                </Select>
              </Form.Item>
              <Form.Item name="description" label="描述">
                <Input.TextArea rows={2} />
              </Form.Item>
            </>
          )}

          {currentStep === 1 && (
            <>
              <Form.Item name="eventType" label="触发事件" rules={[{ required: true }]}>
                <Select placeholder="选择触发事件">
                  {eventTypes.map(e => <Option key={e.value} value={e.value}>{e.label}</Option>)}
                </Select>
              </Form.Item>
              <Form.Item name="delayMinutes" label="延迟执行（分钟）" initialValue={0}>
                <InputNumber min={0} max={43200} style={{ width: '100%' }} />
              </Form.Item>
            </>
          )}

          {currentStep === 2 && (
            <>
              <Form.Item name="actions" label="执行动作（可多选）" rules={[{ required: true }]}>
                <Select mode="multiple" placeholder="选择要执行的动作">
                  {actionTypes.map(a => <Option key={a.value} value={a.value}>{a.label}</Option>)}
                </Select>
              </Form.Item>
            </>
          )}

          {currentStep === 3 && (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="cooldownMinutes" label="冷却时间（分钟）" initialValue={0}>
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="maxTriggersPerMember" label="每位会员最多触发次数">
                    <InputNumber min={1} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="enableABTest" label="启用A/B测试" valuePropName="checked">
                <Switch />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default MarketingTriggers;
