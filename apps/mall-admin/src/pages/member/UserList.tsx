import React, { useState } from 'react';
import { Card, Table, Input, Button, Space, Tag, Typography, DatePicker, Select, Row, Col, Drawer, Descriptions, Avatar, Tabs } from 'antd';
import { SearchOutlined, ExportOutlined, UserOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface UserRecord {
  key: string;
  id: string;
  phone: string;
  email: string;
  displayName: string;
  registrationSource: string;
  registeredAt: string;
  lastActiveAt: string;
  status: string;
  isMember: boolean;
  locale: string;
}

const mockUsers: UserRecord[] = [
  { key: '1', id: 'U-20240001', phone: '+852 9123 4567', email: 'alice.wong@email.com', displayName: 'Alice Wong', registrationSource: 'customer-app', registeredAt: '2024-01-15 10:30', lastActiveAt: '2024-01-26 14:20', status: 'active', isMember: true, locale: 'zh-TW' },
  { key: '2', id: 'U-20240002', phone: '+852 6234 5678', email: 'bob.li@email.com', displayName: 'Bob Li', registrationSource: 'wechat-mini-program', registeredAt: '2024-01-16 09:15', lastActiveAt: '2024-01-25 18:45', status: 'active', isMember: true, locale: 'zh-CN' },
  { key: '3', id: 'U-20240003', phone: '+852 9345 6789', email: 'carol.chan@email.com', displayName: 'Carol Chan', registrationSource: 'web', registeredAt: '2024-01-18 14:00', lastActiveAt: '2024-01-24 11:30', status: 'active', isMember: false, locale: 'en' },
  { key: '4', id: 'U-20240004', phone: '+852 6456 7890', email: 'david.lam@email.com', displayName: 'David Lam', registrationSource: 'counter', registeredAt: '2024-01-20 16:30', lastActiveAt: '2024-01-26 09:00', status: 'pending-verification', isMember: false, locale: 'zh-TW' },
  { key: '5', id: 'U-20240005', phone: '+852 9567 8901', email: 'eva.ng@email.com', displayName: 'Eva Ng', registrationSource: 'customer-app', registeredAt: '2024-01-21 11:45', lastActiveAt: '2024-01-23 20:15', status: 'suspended', isMember: true, locale: 'zh-CN' },
  { key: '6', id: 'U-20240006', phone: '+86 138 0000 1234', email: 'frank.zhao@email.com', displayName: 'Frank Zhao', registrationSource: 'wechat-mini-program', registeredAt: '2024-01-22 08:20', lastActiveAt: '2024-01-26 16:40', status: 'active', isMember: true, locale: 'zh-CN' },
  { key: '7', id: 'U-20240007', phone: '+852 6789 0123', email: 'grace.ho@email.com', displayName: 'Grace Ho', registrationSource: 'customer-app', registeredAt: '2024-01-23 13:50', lastActiveAt: '2024-01-25 22:10', status: 'active', isMember: true, locale: 'zh-TW' },
  { key: '8', id: 'U-20240008', phone: '+852 9890 1234', email: 'henry.yip@email.com', displayName: 'Henry Yip', registrationSource: 'import', registeredAt: '2024-01-10 00:00', lastActiveAt: '2024-01-20 15:30', status: 'inactive', isMember: true, locale: 'en' },
];

const UserList: React.FC = () => {
  const { t } = useLocale();
  const [searchText, setSearchText] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const statusColors: Record<string, string> = {
    active: 'green',
    inactive: 'default',
    suspended: 'red',
    'pending-verification': 'orange',
  };

  const sourceLabels: Record<string, string> = {
    'customer-app': 'Customer App',
    'wechat-mini-program': 'WeChat Mini Program',
    web: 'Web',
    counter: t('stamp.counter'),
    import: t('common.import'),
    migration: 'Migration',
  };

  const columns: ColumnsType<UserRecord> = [
    {
      title: t('common.details') === '详情' ? '用户ID' : t('common.details') === '詳情' ? '用戶ID' : 'User ID',
      dataIndex: 'id',
      key: 'id',
      width: 130,
      render: (text) => <Text copyable={{ text }}>{text}</Text>,
    },
    {
      title: t('member.displayName'),
      dataIndex: 'displayName',
      key: 'displayName',
      render: (text) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
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
      title: t('member.email'),
      dataIndex: 'email',
      key: 'email',
      width: 200,
      ellipsis: true,
    },
    {
      title: t('member.registrationSource'),
      dataIndex: 'registrationSource',
      key: 'registrationSource',
      width: 160,
      render: (source: string) => <Tag>{sourceLabels[source] || source}</Tag>,
    },
    {
      title: t('common.details') === '详情' ? '是否会员' : t('common.details') === '詳情' ? '是否會員' : 'Is Member',
      dataIndex: 'isMember',
      key: 'isMember',
      width: 100,
      render: (isMember: boolean) =>
        isMember ? <Tag color="blue">{t('common.yes')}</Tag> : <Tag>{t('common.no')}</Tag>,
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => <Tag color={statusColors[status]}>{status}</Tag>,
    },
    {
      title: t('common.createdAt'),
      dataIndex: 'registeredAt',
      key: 'registeredAt',
      width: 160,
      sorter: true,
    },
    {
      title: t('member.lastActive'),
      dataIndex: 'lastActiveAt',
      key: 'lastActiveAt',
      width: 160,
      sorter: true,
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedUser(record);
            setDrawerVisible(true);
          }}
        >
          {t('common.details')}
        </Button>
      ),
    },
  ];

  const filteredUsers = mockUsers.filter(
    (u) =>
      u.displayName.toLowerCase().includes(searchText.toLowerCase()) ||
      u.phone.includes(searchText) ||
      u.email.toLowerCase().includes(searchText.toLowerCase()) ||
      u.id.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div>
      <Title level={4}>
        {t('common.details') === '详情' ? '用户列表' : t('common.details') === '詳情' ? '用戶列表' : 'User List'}
      </Title>

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
          <Col xs={24} md={6}>
            <Select
              placeholder={t('member.registrationSource')}
              style={{ width: '100%' }}
              allowClear
              options={[
                { value: 'customer-app', label: 'Customer App' },
                { value: 'wechat-mini-program', label: 'WeChat Mini Program' },
                { value: 'web', label: 'Web' },
                { value: 'counter', label: t('stamp.counter') },
                { value: 'import', label: t('common.import') },
              ]}
            />
          </Col>
          <Col xs={24} md={6}>
            <RangePicker style={{ width: '100%' }} placeholder={[t('common.details') === '详情' ? '开始日期' : 'Start', t('common.details') === '详情' ? '结束日期' : 'End']} />
          </Col>
          <Col xs={24} md={4}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />}>{t('common.search')}</Button>
              <Button icon={<ReloadOutlined />}>{t('common.reset')}</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card
        extra={
          <Button icon={<ExportOutlined />}>{t('common.export')}</Button>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredUsers}
          scroll={{ x: 1400 }}
          pagination={{
            total: filteredUsers.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => t('common.total', { total }),
          }}
        />
      </Card>

      <Drawer
        title={t('common.details') === '详情' ? '用户详情' : t('common.details') === '詳情' ? '用戶詳情' : 'User Details'}
        width={640}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {selectedUser && (
          <Tabs
            items={[
              {
                key: 'basic',
                label: t('common.details') === '详情' ? '基本信息' : t('common.details') === '詳情' ? '基本資訊' : 'Basic Info',
                children: (
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label={t('common.details') === '详情' ? '用户ID' : 'User ID'}>{selectedUser.id}</Descriptions.Item>
                    <Descriptions.Item label={t('member.displayName')}>{selectedUser.displayName}</Descriptions.Item>
                    <Descriptions.Item label={t('member.phone')}>{selectedUser.phone}</Descriptions.Item>
                    <Descriptions.Item label={t('member.email')}>{selectedUser.email}</Descriptions.Item>
                    <Descriptions.Item label={t('member.registrationSource')}>
                      {sourceLabels[selectedUser.registrationSource]}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('common.details') === '详情' ? '语言偏好' : 'Locale'}>{selectedUser.locale}</Descriptions.Item>
                    <Descriptions.Item label={t('common.status')}>
                      <Tag color={statusColors[selectedUser.status]}>{selectedUser.status}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label={t('common.details') === '详情' ? '是否会员' : 'Is Member'}>
                      {selectedUser.isMember ? <Tag color="blue">{t('common.yes')}</Tag> : t('common.no')}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('common.createdAt')}>{selectedUser.registeredAt}</Descriptions.Item>
                    <Descriptions.Item label={t('member.lastActive')}>{selectedUser.lastActiveAt}</Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: 'member',
                label: t('common.details') === '详情' ? '会员信息' : t('common.details') === '詳情' ? '會員資訊' : 'Member Info',
                children: selectedUser.isMember ? (
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label={t('member.memberCardNo')}>MC-{selectedUser.id.replace('U-', '')}</Descriptions.Item>
                    <Descriptions.Item label={t('member.memberTier')}>
                      <Tag color="gold">Gold</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label={t('member.stampBalance')}>2,450</Descriptions.Item>
                    <Descriptions.Item label={t('member.lifetimeStamps')}>8,920</Descriptions.Item>
                    <Descriptions.Item label={t('member.memberTag')}>
                      <Space>
                        <Tag color="blue">VIP</Tag>
                        <Tag color="green">Frequent Shopper</Tag>
                      </Space>
                    </Descriptions.Item>
                  </Descriptions>
                ) : (
                  <Text type="secondary">
                    {t('common.details') === '详情' ? '该用户未注册为会员' : 'User is not a member'}
                  </Text>
                ),
              },
            ]}
          />
        )}
      </Drawer>
    </div>
  );
};

export default UserList;
