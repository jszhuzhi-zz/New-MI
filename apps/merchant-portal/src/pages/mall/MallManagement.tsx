import React, { useState } from 'react';
import {
  Card, Table, Button, Input, Space, Tag, Modal, Form, Select,
  message, Tooltip, Badge, Statistic, Row, Col, Tabs, Avatar, Switch, Popconfirm
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined, UserOutlined,
  ShopOutlined, SearchOutlined, KeyOutlined, TeamOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';

interface Mall {
  id: string;
  name: string;
  nameTW: string;
  nameEN: string;
  region: string;
  address: string;
  merchantCount: number;
  memberCount: number;
  status: 'active' | 'inactive';
  managerName: string;
  managerPhone: string;
}

interface AdminUser {
  id: string;
  username: string;
  displayName: string;
  role: 'super_admin' | 'mall_admin' | 'mall_viewer';
  email: string;
  phone: string;
  assignedMalls: string[];
  permissions: string[];
  status: 'active' | 'disabled';
  lastLogin: string;
  createdAt: string;
}

const mockMalls: Mall[] = [
  { id: '1', name: '荃灣廣場', nameTW: '荃灣廣場', nameEN: 'Tsuen Wan Plaza', region: '新界', address: '荃灣青山公路荃灣段123號', merchantCount: 156, memberCount: 45600, status: 'active', managerName: '陳大明', managerPhone: '852-91234567' },
  { id: '2', name: '樂富廣場', nameTW: '樂富廣場', nameEN: 'Lok Fu Plaza', region: '九龍', address: '九龍樂富聯合道198號', merchantCount: 120, memberCount: 38200, status: 'active', managerName: '李小華', managerPhone: '852-92345678' },
  { id: '3', name: '又一城', nameTW: '又一城', nameEN: 'Festival Walk', region: '九龍', address: '九龍塘達之路80號', merchantCount: 200, memberCount: 68500, status: 'active', managerName: '王志強', managerPhone: '852-93456789' },
  { id: '4', name: 'T.O.P', nameTW: 'T.O.P', nameEN: 'T.O.P This is Our Place', region: '九龍', address: '旺角彌敦道700號', merchantCount: 80, memberCount: 25800, status: 'active', managerName: '張美玲', managerPhone: '852-94567890' },
  { id: '5', name: '赤柱廣場', nameTW: '赤柱廣場', nameEN: 'Stanley Plaza', region: '港島', address: '赤柱赤柱大街23號', merchantCount: 45, memberCount: 12300, status: 'inactive', managerName: '劉建國', managerPhone: '852-95678901' },
];

const mockAdminUsers: AdminUser[] = [
  { id: '1', username: 'admin', displayName: '系統管理員', role: 'super_admin', email: 'admin@linkreit.com', phone: '852-90001111', assignedMalls: [], permissions: ['all'], status: 'active', lastLogin: '2026-02-17 09:30', createdAt: '2024-01-01' },
  { id: '2', username: 'mall_admin1', displayName: '陳大明', role: 'mall_admin', email: 'chen@linkreit.com', phone: '852-91234567', assignedMalls: ['荃灣廣場', '樂富廣場'], permissions: ['member:view', 'member:edit', 'campaign:create', 'coupon:create'], status: 'active', lastLogin: '2026-02-17 10:15', createdAt: '2024-03-15' },
  { id: '3', username: 'mall_admin2', displayName: '王志強', role: 'mall_admin', email: 'wang@linkreit.com', phone: '852-93456789', assignedMalls: ['又一城', 'T.O.P'], permissions: ['member:view', 'member:edit', 'campaign:create', 'coupon:create', 'stats:view'], status: 'active', lastLogin: '2026-02-16 16:45', createdAt: '2024-05-20' },
  { id: '4', username: 'viewer1', displayName: '李小華', role: 'mall_viewer', email: 'li@linkreit.com', phone: '852-92345678', assignedMalls: ['樂富廣場'], permissions: ['member:view', 'stats:view'], status: 'active', lastLogin: '2026-02-15 14:20', createdAt: '2024-08-10' },
  { id: '5', username: 'mall_admin3', displayName: '張美玲', role: 'mall_admin', email: 'zhang@linkreit.com', phone: '852-94567890', assignedMalls: ['T.O.P'], permissions: ['member:view', 'campaign:create'], status: 'disabled', lastLogin: '2026-01-20 11:00', createdAt: '2025-01-15' },
];

const allPermissions = [
  { key: 'member:view', label: { 'zh-TW': '查看會員', 'zh-CN': '查看会员', en: 'View Members' } },
  { key: 'member:edit', label: { 'zh-TW': '編輯會員', 'zh-CN': '编辑会员', en: 'Edit Members' } },
  { key: 'campaign:create', label: { 'zh-TW': '創建活動', 'zh-CN': '创建活动', en: 'Create Campaigns' } },
  { key: 'campaign:edit', label: { 'zh-TW': '編輯活動', 'zh-CN': '编辑活动', en: 'Edit Campaigns' } },
  { key: 'coupon:create', label: { 'zh-TW': '創建優惠券', 'zh-CN': '创建优惠券', en: 'Create Coupons' } },
  { key: 'coupon:edit', label: { 'zh-TW': '編輯優惠券', 'zh-CN': '编辑优惠券', en: 'Edit Coupons' } },
  { key: 'stats:view', label: { 'zh-TW': '查看統計', 'zh-CN': '查看统计', en: 'View Statistics' } },
  { key: 'merchant:manage', label: { 'zh-TW': '管理商戶', 'zh-CN': '管理商户', en: 'Manage Merchants' } },
];

export default function MallManagement() {
  const { locale } = useLocale();
  const [activeTab, setActiveTab] = useState('malls');
  const [isMallModalVisible, setIsMallModalVisible] = useState(false);
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [editingMall, setEditingMall] = useState<Mall | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [searchText, setSearchText] = useState('');
  const [mallForm] = Form.useForm();
  const [userForm] = Form.useForm();

  const labels: Record<string, Record<string, string>> = {
    title: { 'zh-TW': '商場管理', 'zh-CN': '商场管理', en: 'Mall Management' },
    malls: { 'zh-TW': '商場列表', 'zh-CN': '商场列表', en: 'Mall List' },
    admins: { 'zh-TW': '管理員', 'zh-CN': '管理员', en: 'Administrators' },
    addMall: { 'zh-TW': '新增商場', 'zh-CN': '新增商场', en: 'Add Mall' },
    editMall: { 'zh-TW': '編輯商場', 'zh-CN': '编辑商场', en: 'Edit Mall' },
    addUser: { 'zh-TW': '新增管理員', 'zh-CN': '新增管理员', en: 'Add Admin' },
    editUser: { 'zh-TW': '編輯管理員', 'zh-CN': '编辑管理员', en: 'Edit Admin' },
    mallName: { 'zh-TW': '商場名稱', 'zh-CN': '商场名称', en: 'Mall Name' },
    region: { 'zh-TW': '區域', 'zh-CN': '区域', en: 'Region' },
    address: { 'zh-TW': '地址', 'zh-CN': '地址', en: 'Address' },
    merchantCount: { 'zh-TW': '商戶數', 'zh-CN': '商户数', en: 'Merchants' },
    memberCount: { 'zh-TW': '會員數', 'zh-CN': '会员数', en: 'Members' },
    manager: { 'zh-TW': '負責人', 'zh-CN': '负责人', en: 'Manager' },
    status: { 'zh-TW': '狀態', 'zh-CN': '状态', en: 'Status' },
    active: { 'zh-TW': '營運中', 'zh-CN': '营运中', en: 'Active' },
    inactive: { 'zh-TW': '停用', 'zh-CN': '停用', en: 'Inactive' },
    username: { 'zh-TW': '用戶名', 'zh-CN': '用户名', en: 'Username' },
    displayName: { 'zh-TW': '顯示名稱', 'zh-CN': '显示名称', en: 'Display Name' },
    email: { 'zh-TW': '電郵', 'zh-CN': '邮箱', en: 'Email' },
    phone: { 'zh-TW': '電話', 'zh-CN': '电话', en: 'Phone' },
    role: { 'zh-TW': '角色', 'zh-CN': '角色', en: 'Role' },
    super_admin: { 'zh-TW': '超級管理員', 'zh-CN': '超级管理员', en: 'Super Admin' },
    mall_admin: { 'zh-TW': '商場管理員', 'zh-CN': '商场管理员', en: 'Mall Admin' },
    mall_viewer: { 'zh-TW': '商場查看員', 'zh-CN': '商场查看员', en: 'Mall Viewer' },
    assignedMalls: { 'zh-TW': '負責商場', 'zh-CN': '负责商场', en: 'Assigned Malls' },
    permissions: { 'zh-TW': '權限', 'zh-CN': '权限', en: 'Permissions' },
    lastLogin: { 'zh-TW': '最後登入', 'zh-CN': '最后登录', en: 'Last Login' },
    actions: { 'zh-TW': '操作', 'zh-CN': '操作', en: 'Actions' },
    save: { 'zh-TW': '保存', 'zh-CN': '保存', en: 'Save' },
    cancel: { 'zh-TW': '取消', 'zh-CN': '取消', en: 'Cancel' },
    resetPassword: { 'zh-TW': '重置密碼', 'zh-CN': '重置密码', en: 'Reset Password' },
    saveSuccess: { 'zh-TW': '保存成功', 'zh-CN': '保存成功', en: 'Saved successfully' },
    totalMalls: { 'zh-TW': '總商場數', 'zh-CN': '总商场数', en: 'Total Malls' },
    totalMerchants: { 'zh-TW': '總商戶數', 'zh-CN': '总商户数', en: 'Total Merchants' },
    totalMembers: { 'zh-TW': '總會員數', 'zh-CN': '总会员数', en: 'Total Members' },
    totalAdmins: { 'zh-TW': '總管理員', 'zh-CN': '总管理员', en: 'Total Admins' },
    search: { 'zh-TW': '搜索', 'zh-CN': '搜索', en: 'Search' },
    enabled: { 'zh-TW': '啟用', 'zh-CN': '启用', en: 'Enabled' },
    disabled: { 'zh-TW': '停用', 'zh-CN': '停用', en: 'Disabled' },
    password: { 'zh-TW': '密碼', 'zh-CN': '密码', en: 'Password' },
    confirmDisable: { 'zh-TW': '確定停用此用戶？', 'zh-CN': '确定停用此用户？', en: 'Disable this user?' },
  };

  const tl = (key: string) => labels[key]?.[locale] || labels[key]?.['zh-TW'] || key;

  const handleAddMall = () => {
    setEditingMall(null);
    mallForm.resetFields();
    setIsMallModalVisible(true);
  };

  const handleEditMall = (mall: Mall) => {
    setEditingMall(mall);
    mallForm.setFieldsValue(mall);
    setIsMallModalVisible(true);
  };

  const handleSaveMall = () => {
    mallForm.validateFields().then(values => {
      console.log('Saving mall:', values);
      message.success(tl('saveSuccess'));
      setIsMallModalVisible(false);
    });
  };

  const handleAddUser = () => {
    setEditingUser(null);
    userForm.resetFields();
    setIsUserModalVisible(true);
  };

  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user);
    userForm.setFieldsValue(user);
    setIsUserModalVisible(true);
  };

  const handleSaveUser = () => {
    userForm.validateFields().then(values => {
      console.log('Saving user:', values);
      message.success(tl('saveSuccess'));
      setIsUserModalVisible(false);
    });
  };

  const mallColumns: ColumnsType<Mall> = [
    {
      title: tl('mallName'),
      key: 'name',
      width: 180,
      render: (_, record) => (
        <Space>
          <Avatar style={{ background: '#00694B' }} icon={<ShopOutlined />} />
          <div>
            <div style={{ fontWeight: 600 }}>{record.nameTW}</div>
            <div style={{ fontSize: 12, color: '#999' }}>{record.nameEN}</div>
          </div>
        </Space>
      ),
    },
    {
      title: tl('region'),
      dataIndex: 'region',
      key: 'region',
      width: 80,
      render: (region) => <Tag>{region}</Tag>,
    },
    {
      title: tl('address'),
      dataIndex: 'address',
      key: 'address',
      width: 200,
      ellipsis: true,
    },
    {
      title: tl('merchantCount'),
      dataIndex: 'merchantCount',
      key: 'merchantCount',
      width: 100,
      render: (count) => count.toLocaleString(),
    },
    {
      title: tl('memberCount'),
      dataIndex: 'memberCount',
      key: 'memberCount',
      width: 100,
      render: (count) => count.toLocaleString(),
    },
    {
      title: tl('manager'),
      key: 'manager',
      width: 140,
      render: (_, record) => (
        <div>
          <div>{record.managerName}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{record.managerPhone}</div>
        </div>
      ),
    },
    {
      title: tl('status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Badge
          status={status === 'active' ? 'success' : 'default'}
          text={tl(status)}
        />
      ),
    },
    {
      title: tl('actions'),
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title={tl('editMall')}>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditMall(record)}
            />
          </Tooltip>
          <Tooltip title={tl('permissions')}>
            <Button type="text" icon={<SettingOutlined />} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const userColumns: ColumnsType<AdminUser> = [
    {
      title: tl('displayName'),
      key: 'displayName',
      width: 150,
      render: (_, record) => (
        <Space>
          <Avatar style={{ background: record.role === 'super_admin' ? '#ff4d4f' : '#1890ff' }}>
            {record.displayName.charAt(0)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600 }}>{record.displayName}</div>
            <div style={{ fontSize: 12, color: '#999' }}>{record.username}</div>
          </div>
        </Space>
      ),
    },
    {
      title: tl('role'),
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role) => {
        const colors: Record<string, string> = {
          super_admin: 'red',
          mall_admin: 'blue',
          mall_viewer: 'green',
        };
        return <Tag color={colors[role]}>{tl(role)}</Tag>;
      },
    },
    {
      title: tl('assignedMalls'),
      dataIndex: 'assignedMalls',
      key: 'assignedMalls',
      width: 180,
      render: (malls: string[]) => (
        malls.length > 0 ? (
          <Tooltip title={malls.join(', ')}>
            <span>{malls[0]}{malls.length > 1 && ` +${malls.length - 1}`}</span>
          </Tooltip>
        ) : (
          <Tag color="gold">{locale === 'en' ? 'All Malls' : '全部商場'}</Tag>
        )
      ),
    },
    {
      title: tl('email'),
      dataIndex: 'email',
      key: 'email',
      width: 180,
    },
    {
      title: tl('status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Badge
          status={status === 'active' ? 'success' : 'error'}
          text={tl(status === 'active' ? 'enabled' : 'disabled')}
        />
      ),
    },
    {
      title: tl('lastLogin'),
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 150,
    },
    {
      title: tl('actions'),
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title={tl('editUser')}>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditUser(record)}
            />
          </Tooltip>
          <Tooltip title={tl('resetPassword')}>
            <Button type="text" icon={<KeyOutlined />} />
          </Tooltip>
          {record.status === 'active' && record.role !== 'super_admin' && (
            <Popconfirm title={tl('confirmDisable')}>
              <Tooltip title={tl('disabled')}>
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const totalMerchants = mockMalls.reduce((sum, m) => sum + m.merchantCount, 0);
  const totalMembers = mockMalls.reduce((sum, m) => sum + m.memberCount, 0);

  return (
    <div>
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title={tl('totalMalls')}
              value={mockMalls.length}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#00694B' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title={tl('totalMerchants')}
              value={totalMerchants}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title={tl('totalMembers')}
              value={totalMembers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title={tl('totalAdmins')}
              value={mockAdminUsers.length}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarExtraContent={
            activeTab === 'malls' ? (
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddMall}>
                {tl('addMall')}
              </Button>
            ) : (
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddUser}>
                {tl('addUser')}
              </Button>
            )
          }
          items={[
            {
              key: 'malls',
              label: (
                <Space>
                  <ShopOutlined />
                  {tl('malls')}
                </Space>
              ),
              children: (
                <Table
                  columns={mallColumns}
                  dataSource={mockMalls}
                  rowKey="id"
                  scroll={{ x: 1000 }}
                  pagination={{ pageSize: 10 }}
                />
              ),
            },
            {
              key: 'admins',
              label: (
                <Space>
                  <TeamOutlined />
                  {tl('admins')}
                </Space>
              ),
              children: (
                <Table
                  columns={userColumns}
                  dataSource={mockAdminUsers}
                  rowKey="id"
                  scroll={{ x: 1000 }}
                  pagination={{ pageSize: 10 }}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Mall Modal */}
      <Modal
        title={editingMall ? tl('editMall') : tl('addMall')}
        open={isMallModalVisible}
        onCancel={() => setIsMallModalVisible(false)}
        onOk={handleSaveMall}
        okText={tl('save')}
        cancelText={tl('cancel')}
        width={600}
      >
        <Form form={mallForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="nameTW" label={tl('mallName') + ' (繁體)'} rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="nameEN" label={tl('mallName') + ' (EN)'} rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="region" label={tl('region')} rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="港島">港島</Select.Option>
                  <Select.Option value="九龍">九龍</Select.Option>
                  <Select.Option value="新界">新界</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="address" label={tl('address')} rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="managerName" label={tl('manager')}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="managerPhone" label={tl('phone')}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="status" label={tl('status')}>
            <Select>
              <Select.Option value="active">{tl('active')}</Select.Option>
              <Select.Option value="inactive">{tl('inactive')}</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* User Modal */}
      <Modal
        title={editingUser ? tl('editUser') : tl('addUser')}
        open={isUserModalVisible}
        onCancel={() => setIsUserModalVisible(false)}
        onOk={handleSaveUser}
        okText={tl('save')}
        cancelText={tl('cancel')}
        width={700}
      >
        <Form form={userForm} layout="vertical">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="username" label={tl('username')} rules={[{ required: true }]}>
                <Input disabled={!!editingUser} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="displayName" label={tl('displayName')} rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="role" label={tl('role')} rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="mall_admin">{tl('mall_admin')}</Select.Option>
                  <Select.Option value="mall_viewer">{tl('mall_viewer')}</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="email" label={tl('email')} rules={[{ required: true, type: 'email' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label={tl('phone')}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          {!editingUser && (
            <Form.Item name="password" label={tl('password')} rules={[{ required: true }]}>
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="assignedMalls" label={tl('assignedMalls')}>
            <Select mode="multiple" placeholder={locale === 'en' ? 'Leave empty for all malls' : '留空表示所有商場'}>
              {mockMalls.map(mall => (
                <Select.Option key={mall.id} value={mall.nameTW}>{mall.nameTW}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="permissions" label={tl('permissions')}>
            <Select mode="multiple">
              {allPermissions.map(perm => (
                <Select.Option key={perm.key} value={perm.key}>
                  {perm.label[locale] || perm.label['zh-TW']}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
