import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  message,
  Tooltip,
  Avatar,
  Switch,
} from 'antd';
import {
  UserSwitchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  KeyOutlined,
  UserOutlined,
  PhoneOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';

const { Title, Text } = Typography;

const labels: Record<string, Record<string, string>> = {
  title: { 'zh-CN': '员工管理', 'zh-TW': '員工管理', en: 'Staff Management' },
  addStaff: { 'zh-CN': '添加员工', 'zh-TW': '添加員工', en: 'Add Staff' },
  editStaff: { 'zh-CN': '编辑员工', 'zh-TW': '編輯員工', en: 'Edit Staff' },
  name: { 'zh-CN': '姓名', 'zh-TW': '姓名', en: 'Name' },
  phone: { 'zh-CN': '手机号', 'zh-TW': '手機號', en: 'Phone' },
  username: { 'zh-CN': '用户名', 'zh-TW': '用戶名', en: 'Username' },
  role: { 'zh-CN': '角色', 'zh-TW': '角色', en: 'Role' },
  status: { 'zh-CN': '状态', 'zh-TW': '狀態', en: 'Status' },
  lastLogin: { 'zh-CN': '最近登录', 'zh-TW': '最近登錄', en: 'Last Login' },
  actions: { 'zh-CN': '操作', 'zh-TW': '操作', en: 'Actions' },
  manager: { 'zh-CN': '店长', 'zh-TW': '店長', en: 'Manager' },
  staff: { 'zh-CN': '店员', 'zh-TW': '店員', en: 'Staff' },
  active: { 'zh-CN': '在职', 'zh-TW': '在職', en: 'Active' },
  disabled: { 'zh-CN': '已停用', 'zh-TW': '已停用', en: 'Disabled' },
  resetPassword: { 'zh-CN': '重置密码', 'zh-TW': '重置密碼', en: 'Reset Password' },
  deleteConfirm: { 'zh-CN': '确定删除该员工吗？', 'zh-TW': '確定刪除該員工嗎？', en: 'Delete this staff member?' },
  resetConfirm: {
    'zh-CN': '确定重置密码？新密码将发送至员工手机。',
    'zh-TW': '確定重置密碼？新密碼將發送至員工手機。',
    en: 'Reset password? New password will be sent to their phone.',
  },
  save: { 'zh-CN': '保存', 'zh-TW': '保存', en: 'Save' },
  cancel: { 'zh-CN': '取消', 'zh-TW': '取消', en: 'Cancel' },
  nameRequired: { 'zh-CN': '请输入姓名', 'zh-TW': '請輸入姓名', en: 'Please enter name' },
  phoneRequired: { 'zh-CN': '请输入手机号', 'zh-TW': '請輸入手機號', en: 'Please enter phone' },
  usernameRequired: { 'zh-CN': '请输入用户名', 'zh-TW': '請輸入用戶名', en: 'Please enter username' },
  saveSuccess: { 'zh-CN': '保存成功', 'zh-TW': '保存成功', en: 'Saved successfully' },
  deleteSuccess: { 'zh-CN': '删除成功', 'zh-TW': '刪除成功', en: 'Deleted successfully' },
  resetSuccess: { 'zh-CN': '密码已重置', 'zh-TW': '密碼已重置', en: 'Password reset successfully' },
  permissions: { 'zh-CN': '权限', 'zh-TW': '權限', en: 'Permissions' },
  stampIssue: { 'zh-CN': '发放印花', 'zh-TW': '發放印花', en: 'Issue Stamps' },
  stampVoid: { 'zh-CN': '作废印花', 'zh-TW': '作廢印花', en: 'Void Stamps' },
  memberLookup: { 'zh-CN': '会员查询', 'zh-TW': '會員查詢', en: 'Member Lookup' },
  couponRedeem: { 'zh-CN': '优惠券核销', 'zh-TW': '優惠券核銷', en: 'Coupon Redeem' },
  viewStats: { 'zh-CN': '查看统计', 'zh-TW': '查看統計', en: 'View Statistics' },
  enabled: { 'zh-CN': '启用', 'zh-TW': '啟用', en: 'Enabled' },
};

interface StaffMember {
  id: string;
  name: string;
  phone: string;
  username: string;
  role: 'shop_manager' | 'shop_staff';
  status: 'active' | 'disabled';
  lastLogin: string;
  permissions: string[];
}

const mockStaff: StaffMember[] = [
  {
    id: '1',
    name: '张伟',
    phone: '13800138001',
    username: 'zhangwei',
    role: 'shop_manager',
    status: 'active',
    lastLogin: '2025-01-20 14:32',
    permissions: ['stamp:issue', 'stamp:void', 'member:lookup', 'coupon:redeem', 'stats:view'],
  },
  {
    id: '2',
    name: '李娜',
    phone: '13900139002',
    username: 'lina',
    role: 'shop_staff',
    status: 'active',
    lastLogin: '2025-01-20 13:15',
    permissions: ['stamp:issue', 'member:lookup', 'coupon:redeem'],
  },
  {
    id: '3',
    name: '王磊',
    phone: '13700137003',
    username: 'wanglei',
    role: 'shop_staff',
    status: 'active',
    lastLogin: '2025-01-19 17:45',
    permissions: ['stamp:issue', 'member:lookup'],
  },
  {
    id: '4',
    name: '赵芸',
    phone: '13600136004',
    username: 'zhaoyun',
    role: 'shop_staff',
    status: 'disabled',
    lastLogin: '2024-12-15 09:30',
    permissions: ['stamp:issue', 'member:lookup'],
  },
];

const permissionOptions = [
  { key: 'stamp:issue', label: 'stampIssue' },
  { key: 'stamp:void', label: 'stampVoid' },
  { key: 'member:lookup', label: 'memberLookup' },
  { key: 'coupon:redeem', label: 'couponRedeem' },
  { key: 'stats:view', label: 'viewStats' },
];

const StaffManagement: React.FC = () => {
  const { locale } = useLocale();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [form] = Form.useForm();

  const getLabel = (key: string) => labels[key]?.[locale] || labels[key]?.en || key;

  const roleOptions = [
    { label: getLabel('manager'), value: 'shop_manager' },
    { label: getLabel('staff'), value: 'shop_staff' },
  ];

  const handleAdd = () => {
    setEditingStaff(null);
    form.resetFields();
    form.setFieldsValue({ role: 'shop_staff', permissions: ['stamp:issue', 'member:lookup'] });
    setModalVisible(true);
  };

  const handleEdit = (record: StaffMember) => {
    setEditingStaff(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      await form.validateFields();
      await new Promise((resolve) => setTimeout(resolve, 500));
      message.success(getLabel('saveSuccess'));
      setModalVisible(false);
    } catch {
      // validation error
    }
  };

  const handleDelete = async (id: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    message.success(getLabel('deleteSuccess'));
  };

  const handleResetPassword = async (id: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    message.success(getLabel('resetSuccess'));
  };

  const columns: ColumnsType<StaffMember> = [
    {
      title: getLabel('name'),
      key: 'name',
      width: 160,
      render: (_, record) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: record.role === 'shop_manager' ? '#fa8c16' : '#1890ff' }} />
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{record.username}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: getLabel('phone'),
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
    },
    {
      title: getLabel('role'),
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role: string) => (
        <Tag color={role === 'shop_manager' ? 'orange' : 'blue'}>
          {role === 'shop_manager' ? getLabel('manager') : getLabel('staff')}
        </Tag>
      ),
    },
    {
      title: getLabel('permissions'),
      dataIndex: 'permissions',
      key: 'permissions',
      width: 250,
      render: (perms: string[]) => (
        <Space size={[4, 4]} wrap>
          {perms.map((p) => {
            const opt = permissionOptions.find((o) => o.key === p);
            return opt ? (
              <Tag key={p} style={{ fontSize: 11 }}>
                {getLabel(opt.label)}
              </Tag>
            ) : null;
          })}
        </Space>
      ),
    },
    {
      title: getLabel('status'),
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status === 'active' ? getLabel('active') : getLabel('disabled')}
        </Tag>
      ),
    },
    {
      title: getLabel('lastLogin'),
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 150,
    },
    {
      title: getLabel('actions'),
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title={getLabel('editStaff')}>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title={getLabel('resetPassword')}>
            <Popconfirm
              title={getLabel('resetConfirm')}
              onConfirm={() => handleResetPassword(record.id)}
              icon={<ExclamationCircleOutlined style={{ color: '#faad14' }} />}
            >
              <Button type="text" size="small" icon={<KeyOutlined />} />
            </Popconfirm>
          </Tooltip>
          {record.role !== 'shop_manager' && (
            <Tooltip title={locale === 'en' ? 'Delete' : '删除'}>
              <Popconfirm
                title={getLabel('deleteConfirm')}
                onConfirm={() => handleDelete(record.id)}
                okButtonProps={{ danger: true }}
              >
                <Button type="text" size="small" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          <UserSwitchOutlined style={{ marginRight: 8 }} />
          {getLabel('title')}
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          {getLabel('addStaff')}
        </Button>
      </div>

      <Card bordered={false} style={{ borderRadius: 8 }}>
        <Table
          columns={columns}
          dataSource={mockStaff}
          rowKey="id"
          pagination={false}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        open={modalVisible}
        title={editingStaff ? getLabel('editStaff') : getLabel('addStaff')}
        onCancel={() => setModalVisible(false)}
        onOk={handleSave}
        okText={getLabel('save')}
        cancelText={getLabel('cancel')}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label={getLabel('name')}
            rules={[{ required: true, message: getLabel('nameRequired') }]}
          >
            <Input prefix={<UserOutlined />} />
          </Form.Item>
          <Form.Item
            name="phone"
            label={getLabel('phone')}
            rules={[{ required: true, message: getLabel('phoneRequired') }]}
          >
            <Input prefix={<PhoneOutlined />} maxLength={15} />
          </Form.Item>
          <Form.Item
            name="username"
            label={getLabel('username')}
            rules={[{ required: true, message: getLabel('usernameRequired') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="role" label={getLabel('role')}>
            <Select options={roleOptions} />
          </Form.Item>
          <Form.Item name="permissions" label={getLabel('permissions')}>
            <Select
              mode="multiple"
              options={permissionOptions.map((p) => ({
                label: getLabel(p.label),
                value: p.key,
              }))}
            />
          </Form.Item>
          {editingStaff && (
            <Form.Item label={getLabel('enabled')}>
              <Switch defaultChecked={editingStaff.status === 'active'} />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default StaffManagement;
