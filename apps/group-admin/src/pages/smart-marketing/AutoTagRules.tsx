import React, { useState } from 'react';
import {
  Card, Table, Button, Tag, Space, Modal, Form, Input, Select, Switch,
  Tooltip, Typography, Popconfirm, Badge, Divider, Row, Col,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined,
  TagsOutlined, QuestionCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const AutoTagRules: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const mockRules = [
    {
      key: '1', name: '高价值会员', description: '近90天消费超过$5000的会员',
      conditions: 2, conditionLogic: 'and', tagName: '高价值',
      evaluationFrequency: 'daily', autoRemove: true,
      membersTagged: 3580, status: 'active', lastEvaluated: '2026-02-03 08:00',
    },
    {
      key: '2', name: '餐饮爱好者', description: '70%以上消费在餐饮类别',
      conditions: 1, conditionLogic: 'and', tagName: '餐饮偏好',
      evaluationFrequency: 'weekly', autoRemove: true,
      membersTagged: 12450, status: 'active', lastEvaluated: '2026-02-01 02:00',
    },
    {
      key: '3', name: '沉默用户', description: '超过30天无任何活动',
      conditions: 3, conditionLogic: 'and', tagName: '沉默用户',
      evaluationFrequency: 'daily', autoRemove: true,
      membersTagged: 5670, status: 'active', lastEvaluated: '2026-02-03 08:00',
    },
    {
      key: '4', name: '印花囤积者', description: '印花余额超过500且近30天未兑换',
      conditions: 2, conditionLogic: 'and', tagName: '待激活印花',
      evaluationFrequency: 'daily', autoRemove: true,
      membersTagged: 890, status: 'active', lastEvaluated: '2026-02-03 08:00',
    },
    {
      key: '5', name: '新会员7天内', description: '注册7天内的新会员',
      conditions: 1, conditionLogic: 'and', tagName: '新会员',
      evaluationFrequency: 'realtime', autoRemove: true,
      membersTagged: 2340, status: 'active', lastEvaluated: '实时',
    },
  ];

  const conditionCategories = [
    { value: 'demographic', label: '人口属性' },
    { value: 'behavioral', label: '行为特征' },
    { value: 'transactional', label: '交易相关' },
    { value: 'engagement', label: '参与度' },
    { value: 'lifecycle', label: '生命周期' },
  ];

  const columns = [
    {
      title: '规则名称',
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
      title: '标签',
      dataIndex: 'tagName',
      key: 'tagName',
      render: (tag: string) => <Tag color="blue"><TagsOutlined /> {tag}</Tag>,
    },
    {
      title: '条件',
      key: 'conditions',
      render: (_: any, record: any) => (
        <Text>{record.conditions}个条件 ({record.conditionLogic === 'and' ? '且' : '或'})</Text>
      ),
    },
    {
      title: '评估频率',
      dataIndex: 'evaluationFrequency',
      key: 'evaluationFrequency',
      render: (freq: string) => {
        const labels: Record<string, string> = {
          realtime: '实时', hourly: '每小时', daily: '每天', weekly: '每周',
        };
        const colors: Record<string, string> = {
          realtime: 'red', hourly: 'orange', daily: 'blue', weekly: 'green',
        };
        return <Tag color={colors[freq]}>{labels[freq]}</Tag>;
      },
    },
    {
      title: '已标记会员',
      dataIndex: 'membersTagged',
      key: 'membersTagged',
      render: (count: number) => <Text strong>{count.toLocaleString()}</Text>,
    },
    {
      title: '自动移除',
      dataIndex: 'autoRemove',
      key: 'autoRemove',
      render: (v: boolean) => v ? <Tag color="green">是</Tag> : <Tag>否</Tag>,
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
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="手动执行">
            <Button type="link" size="small" icon={<PlayCircleOutlined />} />
          </Tooltip>
          <Button type="link" size="small" icon={<EditOutlined />} />
          <Popconfirm title="确定删除此规则？">
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={<Title level={4} style={{ margin: 0 }}>自动打标签规则</Title>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
            新建规则
          </Button>
        }
      >
        <Table columns={columns} dataSource={mockRules} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title="创建自动打标签规则"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={720}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="规则名称" rules={[{ required: true }]}>
                <Input placeholder="例如：高价值会员自动标记" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tagName" label="应用标签" rules={[{ required: true }]}>
                <Select placeholder="选择或创建标签">
                  <Option value="high-value">高价值</Option>
                  <Option value="food-lover">餐饮偏好</Option>
                  <Option value="inactive">沉默用户</Option>
                  <Option value="new-member">新会员</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="规则描述">
            <Input.TextArea rows={2} placeholder="描述规则的用途和条件" />
          </Form.Item>

          <Divider>条件设置</Divider>

          <Form.Item name="conditionLogic" label="条件关系" initialValue="and">
            <Select>
              <Option value="and">所有条件都满足 (AND)</Option>
              <Option value="or">满足任一条件 (OR)</Option>
            </Select>
          </Form.Item>

          <Form.Item label={<span>条件 1 <Tooltip title="选择条件类别和具体字段"><QuestionCircleOutlined /></Tooltip></span>}>
            <Space>
              <Select placeholder="条件类别" style={{ width: 140 }}>
                {conditionCategories.map(c => <Option key={c.value} value={c.value}>{c.label}</Option>)}
              </Select>
              <Select placeholder="字段" style={{ width: 160 }}>
                <Option value="total_spending_90d">近90天消费金额</Option>
                <Option value="visit_count_30d">近30天到访次数</Option>
                <Option value="days_since_last_activity">距上次活动天数</Option>
              </Select>
              <Select placeholder="运算符" style={{ width: 120 }}>
                <Option value="greater_than">大于</Option>
                <Option value="less_than">小于</Option>
                <Option value="equals">等于</Option>
                <Option value="between">介于</Option>
              </Select>
              <Input placeholder="值" style={{ width: 120 }} />
            </Space>
          </Form.Item>

          <Divider>执行设置</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="evaluationFrequency" label="评估频率" initialValue="daily">
                <Select>
                  <Option value="realtime">实时</Option>
                  <Option value="hourly">每小时</Option>
                  <Option value="daily">每天</Option>
                  <Option value="weekly">每周</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="autoRemove" label="条件不满足时自动移除标签" valuePropName="checked" initialValue={true}>
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default AutoTagRules;
