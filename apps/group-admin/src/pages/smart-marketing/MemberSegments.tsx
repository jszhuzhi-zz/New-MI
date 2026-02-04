import React, { useState } from 'react';
import {
  Card, Table, Button, Tag, Space, Modal, Form, Input, Select, Switch,
  Typography, Popconfirm, Badge, Row, Col, Statistic, Divider,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SyncOutlined,
  TeamOutlined, FilterOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const MemberSegments: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const mockSegments = [
    {
      key: '1', name: '高价值活跃会员', description: '近90天消费>$5000 且 月活跃>4次',
      isDynamic: true, memberCount: 12580, rules: 2, ruleLogic: 'and',
      status: 'active', lastRefreshed: '2026-02-03 08:00',
    },
    {
      key: '2', name: '价格敏感型会员', description: '优惠券使用率>50% 或 主要在促销期消费',
      isDynamic: true, memberCount: 23456, rules: 3, ruleLogic: 'or',
      status: 'active', lastRefreshed: '2026-02-03 08:00',
    },
    {
      key: '3', name: '餐饮高频消费', description: '近30天餐饮类消费>3次',
      isDynamic: true, memberCount: 18920, rules: 2, ruleLogic: 'and',
      status: 'active', lastRefreshed: '2026-02-03 08:00',
    },
    {
      key: '4', name: '新注册未消费', description: '注册>7天但无任何印花获取记录',
      isDynamic: true, memberCount: 8430, rules: 2, ruleLogic: 'and',
      status: 'active', lastRefreshed: '2026-02-03 08:00',
    },
    {
      key: '5', name: '流失风险会员', description: '活跃度连续下降 且 等级>银卡',
      isDynamic: true, memberCount: 5670, rules: 3, ruleLogic: 'and',
      status: 'active', lastRefreshed: '2026-02-03 08:00',
    },
    {
      key: '6', name: 'VIP白金以上', description: '白金卡及钻石卡会员',
      isDynamic: true, memberCount: 3250, rules: 1, ruleLogic: 'and',
      status: 'active', lastRefreshed: '2026-02-03 08:00',
    },
    {
      key: '7', name: '周末购物偏好', description: '70%以上消费发生在周末',
      isDynamic: true, memberCount: 15680, rules: 1, ruleLogic: 'and',
      status: 'active', lastRefreshed: '2026-02-02 08:00',
    },
  ];

  const totalMembers = mockSegments.reduce((sum, s) => sum + s.memberCount, 0);

  const columns = [
    {
      title: '分群名称',
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
      title: '类型',
      dataIndex: 'isDynamic',
      key: 'isDynamic',
      render: (isDynamic: boolean) => (
        isDynamic ? <Tag color="blue">动态分群</Tag> : <Tag>静态分群</Tag>
      ),
    },
    {
      title: '规则',
      key: 'rules',
      render: (_: any, record: any) => (
        <Text>{record.rules}个条件 <Tag>{record.ruleLogic === 'and' ? 'AND' : 'OR'}</Tag></Text>
      ),
    },
    {
      title: '会员数',
      dataIndex: 'memberCount',
      key: 'memberCount',
      render: (count: number) => <Text strong>{count.toLocaleString()}</Text>,
      sorter: (a: any, b: any) => a.memberCount - b.memberCount,
    },
    {
      title: '占比',
      key: 'percentage',
      render: (_: any, record: any) => {
        const pct = ((record.memberCount / 82500) * 100).toFixed(1);
        return <Text>{pct}%</Text>;
      },
    },
    {
      title: '最后刷新',
      dataIndex: 'lastRefreshed',
      key: 'lastRefreshed',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge status={status === 'active' ? 'success' : 'default'} text={status === 'active' ? '活跃' : '停用'} />
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" size="small" icon={<TeamOutlined />}>查看会员</Button>
          <Button type="link" size="small" icon={<SyncOutlined />}>刷新</Button>
          <Button type="link" size="small" icon={<EditOutlined />} />
          <Popconfirm title="确定删除此分群？">
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
          <Card><Statistic title="总分群数" value={mockSegments.length} prefix={<FilterOutlined />} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="动态分群" value={mockSegments.filter(s => s.isDynamic).length} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="覆盖会员总数" value={totalMembers.toLocaleString()} prefix={<TeamOutlined />} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="总会员基数" value="82,500" /></Card>
        </Col>
      </Row>

      <Card
        title={<Title level={4} style={{ margin: 0 }}>会员分群</Title>}
        extra={
          <Space>
            <Button icon={<SyncOutlined />}>全部刷新</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
              新建分群
            </Button>
          </Space>
        }
      >
        <Table columns={columns} dataSource={mockSegments} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title="创建会员分群"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={720}
        okText="创建"
      >
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="name" label="分群名称" rules={[{ required: true }]}>
                <Input placeholder="例如：高价值活跃会员" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="isDynamic" label="分群类型" initialValue={true}>
                <Select>
                  <Option value={true}>动态分群（自动更新）</Option>
                  <Option value={false}>静态分群（手动管理）</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="描述分群规则和用途" />
          </Form.Item>

          <Divider>分群规则</Divider>

          <Form.Item name="ruleLogic" label="条件关系" initialValue="and">
            <Select>
              <Option value="and">所有条件都满足 (AND)</Option>
              <Option value="or">满足任一条件 (OR)</Option>
            </Select>
          </Form.Item>

          <Form.Item label="条件 1">
            <Space>
              <Select placeholder="类别" style={{ width: 120 }}>
                <Option value="transactional">交易</Option>
                <Option value="behavioral">行为</Option>
                <Option value="demographic">属性</Option>
                <Option value="engagement">参与</Option>
              </Select>
              <Select placeholder="字段" style={{ width: 160 }}>
                <Option value="total_spending">累计消费</Option>
                <Option value="visit_frequency">到访频率</Option>
                <Option value="stamp_balance">印花余额</Option>
                <Option value="tier">会员等级</Option>
                <Option value="registration_days">注册天数</Option>
              </Select>
              <Select placeholder="运算" style={{ width: 100 }}>
                <Option value="gt">大于</Option>
                <Option value="lt">小于</Option>
                <Option value="eq">等于</Option>
                <Option value="in">属于</Option>
              </Select>
              <Input placeholder="值" style={{ width: 100 }} />
            </Space>
          </Form.Item>

          <Button type="dashed" block icon={<PlusOutlined />}>添加条件</Button>
        </Form>
      </Modal>
    </div>
  );
};

export default MemberSegments;
