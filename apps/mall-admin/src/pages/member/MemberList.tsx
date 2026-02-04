import React, { useState } from 'react';
import { Card, Table, Input, Button, Space, Tag, Typography, Select, Row, Col, Modal, Form, Drawer, Descriptions, Tabs, Badge, Avatar, Tooltip } from 'antd';
import { SearchOutlined, EditOutlined, EyeOutlined, ExportOutlined, UserOutlined, GiftOutlined, CrownOutlined, TagOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';

const { Title, Text } = Typography;

interface MemberRecord {
  key: string;
  memberCardNo: string;
  displayName: string;
  phone: string;
  email: string;
  tier: string;
  tierColor: string;
  stampBalance: number;
  lifetimeStamps: number;
  tags: string[];
  labels: string[];
  status: string;
  registeredAt: string;
  lastActiveAt: string;
  registrationSource: string;
  gifts: number;
  rewards: number;
}

const mockMembers: MemberRecord[] = [
  { key: '1', memberCardNo: 'MC-20240001', displayName: 'Alice Wong', phone: '+852 9123 4567', email: 'alice@email.com', tier: 'Gold', tierColor: '#faad14', stampBalance: 2450, lifetimeStamps: 8920, tags: ['VIP', 'Frequent'], labels: ['CNY Campaign'], status: 'active', registeredAt: '2024-01-15', lastActiveAt: '2024-01-26', registrationSource: 'customer-app', gifts: 3, rewards: 5 },
  { key: '2', memberCardNo: 'MC-20240002', displayName: 'Bob Li', phone: '+852 6234 5678', email: 'bob@email.com', tier: 'Platinum', tierColor: '#722ed1', stampBalance: 5680, lifetimeStamps: 22350, tags: ['VIP', 'Loyal'], labels: ['Top Spender'], status: 'active', registeredAt: '2023-06-20', lastActiveAt: '2024-01-26', registrationSource: 'wechat-mini-program', gifts: 8, rewards: 12 },
  { key: '3', memberCardNo: 'MC-20240003', displayName: 'Carol Chan', phone: '+852 9345 6789', email: 'carol@email.com', tier: 'Silver', tierColor: '#8c8c8c', stampBalance: 890, lifetimeStamps: 3450, tags: ['Regular'], labels: [], status: 'active', registeredAt: '2024-01-18', lastActiveAt: '2024-01-24', registrationSource: 'web', gifts: 1, rewards: 2 },
  { key: '4', memberCardNo: 'MC-20240004', displayName: 'David Lam', phone: '+852 6456 7890', email: 'david@email.com', tier: 'Green', tierColor: '#52c41a', stampBalance: 120, lifetimeStamps: 560, tags: ['New'], labels: ['Welcome Gift'], status: 'active', registeredAt: '2024-01-20', lastActiveAt: '2024-01-26', registrationSource: 'counter', gifts: 1, rewards: 0 },
  { key: '5', memberCardNo: 'MC-20240005', displayName: 'Eva Ng', phone: '+852 9567 8901', email: 'eva@email.com', tier: 'Gold', tierColor: '#faad14', stampBalance: 3200, lifetimeStamps: 12800, tags: ['VIP'], labels: ['Birthday Month'], status: 'suspended', registeredAt: '2023-03-10', lastActiveAt: '2024-01-23', registrationSource: 'customer-app', gifts: 5, rewards: 8 },
  { key: '6', memberCardNo: 'MC-20240006', displayName: 'Frank Zhao', phone: '+86 138 0000 1234', email: 'frank@email.com', tier: 'Silver', tierColor: '#8c8c8c', stampBalance: 1560, lifetimeStamps: 6780, tags: ['Mainland'], labels: [], status: 'active', registeredAt: '2023-11-05', lastActiveAt: '2024-01-26', registrationSource: 'wechat-mini-program', gifts: 2, rewards: 3 },
  { key: '7', memberCardNo: 'MC-20240007', displayName: 'Grace Ho', phone: '+852 6789 0123', email: 'grace@email.com', tier: 'Gold', tierColor: '#faad14', stampBalance: 4100, lifetimeStamps: 15600, tags: ['VIP', 'Frequent'], labels: ['Staff Referral'], status: 'active', registeredAt: '2023-08-15', lastActiveAt: '2024-01-25', registrationSource: 'customer-app', gifts: 6, rewards: 9 },
  { key: '8', memberCardNo: 'MC-20240008', displayName: 'Henry Yip', phone: '+852 9890 1234', email: 'henry@email.com', tier: 'Green', tierColor: '#52c41a', stampBalance: 0, lifetimeStamps: 2100, tags: ['Inactive'], labels: [], status: 'inactive', registeredAt: '2023-01-10', lastActiveAt: '2024-01-20', registrationSource: 'import', gifts: 0, rewards: 1 },
];

const MemberList: React.FC = () => {
  const { t } = useLocale();
  const [searchText, setSearchText] = useState('');
  const [selectedMember, setSelectedMember] = useState<MemberRecord | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();

  const columns: ColumnsType<MemberRecord> = [
    {
      title: t('member.memberCardNo'),
      dataIndex: 'memberCardNo',
      key: 'memberCardNo',
      width: 140,
      fixed: 'left',
      render: (text) => <Text copyable={{ text }} strong>{text}</Text>,
    },
    {
      title: t('member.displayName'),
      dataIndex: 'displayName',
      key: 'displayName',
      width: 140,
      render: (text, record) => (
        <Space>
          <Avatar size="small" style={{ backgroundColor: record.tierColor }}>{text[0]}</Avatar>
          {text}
        </Space>
      ),
    },
    {
      title: t('member.phone'),
      dataIndex: 'phone',
      key: 'phone',
      width: 160,
    },
    {
      title: t('member.memberTier'),
      dataIndex: 'tier',
      key: 'tier',
      width: 110,
      render: (tier: string, record) => (
        <Tag color={record.tierColor} icon={<CrownOutlined />}>{tier}</Tag>
      ),
      filters: [
        { text: 'Green', value: 'Green' },
        { text: 'Silver', value: 'Silver' },
        { text: 'Gold', value: 'Gold' },
        { text: 'Platinum', value: 'Platinum' },
      ],
    },
    {
      title: t('member.stampBalance'),
      dataIndex: 'stampBalance',
      key: 'stampBalance',
      width: 120,
      sorter: true,
      render: (v: number) => <Text strong>{v.toLocaleString()}</Text>,
    },
    {
      title: t('member.lifetimeStamps'),
      dataIndex: 'lifetimeStamps',
      key: 'lifetimeStamps',
      width: 120,
      sorter: true,
      render: (v: number) => v.toLocaleString(),
    },
    {
      title: t('member.memberTag'),
      dataIndex: 'tags',
      key: 'tags',
      width: 180,
      render: (tags: string[]) => (
        <Space size={[0, 4]} wrap>
          {tags.map((tag) => (
            <Tag key={tag} color="blue">{tag}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: t('common.details') === '详情' ? '礼品/奖励' : 'Gifts/Rewards',
      key: 'giftsRewards',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title={t('common.details') === '详情' ? '礼品' : 'Gifts'}>
            <Badge count={record.gifts} size="small"><GiftOutlined style={{ fontSize: 16 }} /></Badge>
          </Tooltip>
          <Tooltip title={t('common.details') === '详情' ? '奖励' : 'Rewards'}>
            <Badge count={record.rewards} size="small" color="#52c41a"><CrownOutlined style={{ fontSize: 16 }} /></Badge>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const colors: Record<string, string> = { active: 'green', inactive: 'default', suspended: 'red' };
        return <Tag color={colors[status]}>{status}</Tag>;
      },
      filters: [
        { text: t('common.active'), value: 'active' },
        { text: t('common.inactive'), value: 'inactive' },
        { text: t('riskControl.suspend'), value: 'suspended' },
      ],
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedMember(record);
              setDrawerVisible(true);
            }}
          />
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedMember(record);
              editForm.setFieldsValue(record);
              setEditModalVisible(true);
            }}
          />
        </Space>
      ),
    },
  ];

  const filteredMembers = mockMembers.filter(
    (m) =>
      m.displayName.toLowerCase().includes(searchText.toLowerCase()) ||
      m.memberCardNo.toLowerCase().includes(searchText.toLowerCase()) ||
      m.phone.includes(searchText)
  );

  return (
    <div>
      <Title level={4}>{t('member.memberList')}</Title>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Input
              placeholder={t('member.memberSearch')}
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} md={4}>
            <Select
              placeholder={t('member.memberTier')}
              style={{ width: '100%' }}
              allowClear
              options={[
                { value: 'Green', label: 'Green' },
                { value: 'Silver', label: 'Silver' },
                { value: 'Gold', label: 'Gold' },
                { value: 'Platinum', label: 'Platinum' },
              ]}
            />
          </Col>
          <Col xs={24} md={4}>
            <Select
              placeholder={t('common.status')}
              style={{ width: '100%' }}
              allowClear
              options={[
                { value: 'active', label: t('common.active') },
                { value: 'inactive', label: t('common.inactive') },
                { value: 'suspended', label: t('riskControl.suspend') },
              ]}
            />
          </Col>
          <Col xs={24} md={4}>
            <Select
              placeholder={t('member.memberTag')}
              style={{ width: '100%' }}
              mode="multiple"
              allowClear
              options={[
                { value: 'VIP', label: 'VIP' },
                { value: 'Frequent', label: 'Frequent' },
                { value: 'New', label: 'New' },
                { value: 'Mainland', label: 'Mainland' },
              ]}
            />
          </Col>
          <Col xs={24} md={4}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />}>{t('common.search')}</Button>
              <Button icon={<ExportOutlined />}>{t('common.export')}</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredMembers}
          scroll={{ x: 1600 }}
          pagination={{
            total: filteredMembers.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => t('common.total', { total }),
          }}
        />
      </Card>

      {/* Member detail drawer */}
      <Drawer
        title={t('member.memberProfile')}
        width={720}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {selectedMember && (
          <Tabs
            items={[
              {
                key: 'profile',
                label: t('member.memberProfile'),
                children: (
                  <Descriptions column={2} bordered size="small">
                    <Descriptions.Item label={t('member.memberCardNo')} span={2}>{selectedMember.memberCardNo}</Descriptions.Item>
                    <Descriptions.Item label={t('member.displayName')}>{selectedMember.displayName}</Descriptions.Item>
                    <Descriptions.Item label={t('member.memberTier')}>
                      <Tag color={selectedMember.tierColor}>{selectedMember.tier}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label={t('member.phone')}>{selectedMember.phone}</Descriptions.Item>
                    <Descriptions.Item label={t('member.email')}>{selectedMember.email}</Descriptions.Item>
                    <Descriptions.Item label={t('member.stampBalance')}>
                      <Text strong style={{ color: '#1890ff' }}>{selectedMember.stampBalance.toLocaleString()}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label={t('member.lifetimeStamps')}>{selectedMember.lifetimeStamps.toLocaleString()}</Descriptions.Item>
                    <Descriptions.Item label={t('common.status')}>
                      <Tag color={selectedMember.status === 'active' ? 'green' : 'red'}>{selectedMember.status}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label={t('member.registrationSource')}>{selectedMember.registrationSource}</Descriptions.Item>
                    <Descriptions.Item label={t('common.createdAt')}>{selectedMember.registeredAt}</Descriptions.Item>
                    <Descriptions.Item label={t('member.lastActive')}>{selectedMember.lastActiveAt}</Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: 'tags',
                label: t('member.memberTag'),
                children: (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>{t('member.memberTag')}</Text>
                    <Space wrap>
                      {selectedMember.tags.map((tag) => <Tag key={tag} color="blue">{tag}</Tag>)}
                    </Space>
                    <Text strong style={{ marginTop: 16 }}>{t('member.memberLabel')}</Text>
                    <Space wrap>
                      {selectedMember.labels.length > 0
                        ? selectedMember.labels.map((label) => <Tag key={label} color="purple" icon={<TagOutlined />}>{label}</Tag>)
                        : <Text type="secondary">{t('common.noData')}</Text>}
                    </Space>
                  </Space>
                ),
              },
              {
                key: 'stamps',
                label: t('stamp.stampHistory'),
                children: (
                  <Table
                    size="small"
                    dataSource={[
                      { key: '1', date: '2024-01-26', type: 'earn', amount: 120, source: 'Receipt Scan', ref: 'TXN-001' },
                      { key: '2', date: '2024-01-25', type: 'bonus', amount: 50, source: 'CNY Campaign', ref: 'TXN-002' },
                      { key: '3', date: '2024-01-24', type: 'redeem', amount: -200, source: 'Gift Redemption', ref: 'TXN-003' },
                      { key: '4', date: '2024-01-23', type: 'earn', amount: 85, source: 'Receipt Scan', ref: 'TXN-004' },
                    ]}
                    columns={[
                      { title: t('common.details') === '详情' ? '日期' : 'Date', dataIndex: 'date', key: 'date' },
                      { title: t('common.details') === '详情' ? '类型' : 'Type', dataIndex: 'type', key: 'type', render: (type: string) => <Tag color={type === 'redeem' ? 'red' : 'green'}>{type}</Tag> },
                      { title: t('common.details') === '详情' ? '数量' : 'Amount', dataIndex: 'amount', key: 'amount', render: (v: number) => <Text type={v < 0 ? 'danger' : 'success'}>{v > 0 ? `+${v}` : v}</Text> },
                      { title: t('common.details') === '详情' ? '来源' : 'Source', dataIndex: 'source', key: 'source' },
                    ]}
                    pagination={false}
                  />
                ),
              },
            ]}
          />
        )}
      </Drawer>

      {/* Edit member modal */}
      <Modal
        title={t('common.edit') + ' ' + t('member.member')}
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={() => {
          editForm.validateFields().then(() => {
            setEditModalVisible(false);
          });
        }}
        width={600}
      >
        <Form form={editForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="displayName" label={t('member.displayName')} rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label={t('member.phone')} rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label={t('member.email')}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tier" label={t('member.memberTier')}>
                <Select
                  options={[
                    { value: 'Green', label: 'Green' },
                    { value: 'Silver', label: 'Silver' },
                    { value: 'Gold', label: 'Gold' },
                    { value: 'Platinum', label: 'Platinum' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label={t('common.status')}>
                <Select
                  options={[
                    { value: 'active', label: t('common.active') },
                    { value: 'inactive', label: t('common.inactive') },
                    { value: 'suspended', label: t('riskControl.suspend') },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tags" label={t('member.memberTag')}>
                <Select mode="tags" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default MemberList;
