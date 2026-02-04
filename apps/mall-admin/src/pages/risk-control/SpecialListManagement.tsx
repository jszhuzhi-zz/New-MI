import React, { useState } from 'react';
import { Card, Table, Typography, Tag, Space, Button, Input, Select, Row, Col, Modal, Form, DatePicker, Tabs, Popconfirm, message } from 'antd';
import { PlusOutlined, DeleteOutlined, SearchOutlined, UserOutlined, StopOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface SpecialListItem {
  key: string;
  id: string;
  memberId: string;
  memberCardNo: string;
  memberName: string;
  listType: 'whitelist' | 'blacklist';
  reason: string;
  addedBy: string;
  addedAt: string;
  expiresAt: string | null;
}

const mockItems: SpecialListItem[] = [
  { key: '1', id: 'SL-001', memberId: 'M-100', memberCardNo: 'MC-20240100', memberName: 'VIP Customer A', listType: 'whitelist', reason: '集团高层指定VIP客户，跳过风控', addedBy: '张经理', addedAt: '2024-01-01', expiresAt: null },
  { key: '2', id: 'SL-002', memberId: 'M-101', memberCardNo: 'MC-20240101', memberName: 'Partner B', listType: 'whitelist', reason: '合作方指定测试账号', addedBy: '李管理员', addedAt: '2024-01-10', expiresAt: '2024-06-30' },
  { key: '3', id: 'SL-003', memberId: 'M-012', memberCardNo: 'MC-20240012', memberName: '孙七', listType: 'blacklist', reason: '确认多次提交虚假小票', addedBy: '风控管理员', addedAt: '2024-01-22', expiresAt: null },
  { key: '4', id: 'SL-004', memberId: 'M-056', memberCardNo: 'MC-20240056', memberName: '刘九', listType: 'blacklist', reason: '同一设备注册多个账号刷积分', addedBy: '风控管理员', addedAt: '2024-01-25', expiresAt: '2024-07-25' },
  { key: '5', id: 'SL-005', memberId: 'M-200', memberCardNo: 'MC-20240200', memberName: 'Fraud User X', listType: 'blacklist', reason: '已确认欺诈行为，永久封禁', addedBy: '系统', addedAt: '2024-01-15', expiresAt: null },
  { key: '6', id: 'SL-006', memberId: 'M-150', memberCardNo: 'MC-20240150', memberName: 'Staff C', listType: 'whitelist', reason: '内部测试人员', addedBy: '张经理', addedAt: '2024-01-05', expiresAt: '2024-03-31' },
];

const SpecialListManagement: React.FC = () => {
  const { t } = useLocale();
  const [addModal, setAddModal] = useState(false);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('all');

  const columns: ColumnsType<SpecialListItem> = [
    { title: t('member.memberCardNo'), dataIndex: 'memberCardNo', key: 'memberCardNo', width: 140, render: (text) => <Text strong>{text}</Text> },
    { title: t('member.displayName'), dataIndex: 'memberName', key: 'memberName', width: 140 },
    {
      title: t('common.details') === '详情' ? '名单类型' : 'List Type',
      dataIndex: 'listType',
      key: 'listType',
      width: 100,
      render: (type: string) => (
        type === 'whitelist'
          ? <Tag color="green" icon={<CheckCircleOutlined />}>{t('member.whitelist')}</Tag>
          : <Tag color="red" icon={<StopOutlined />}>{t('member.blacklist')}</Tag>
      ),
    },
    {
      title: t('common.details') === '详情' ? '原因' : 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
    },
    { title: t('common.details') === '详情' ? '添加人' : 'Added By', dataIndex: 'addedBy', key: 'addedBy', width: 120 },
    { title: t('common.details') === '详情' ? '添加时间' : 'Added At', dataIndex: 'addedAt', key: 'addedAt', width: 110 },
    {
      title: t('common.details') === '详情' ? '过期时间' : 'Expires At',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      width: 110,
      render: (v: string | null) => v || <Text type="secondary">{t('common.details') === '详情' ? '永久' : 'Permanent'}</Text>,
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Popconfirm title={t('common.details') === '详情' ? '确认移除?' : 'Remove from list?'} onConfirm={() => message.success(t('common.success'))}>
          <Button type="link" danger icon={<DeleteOutlined />}>{t('common.delete')}</Button>
        </Popconfirm>
      ),
    },
  ];

  const getFilteredData = () => {
    if (activeTab === 'whitelist') return mockItems.filter((i) => i.listType === 'whitelist');
    if (activeTab === 'blacklist') return mockItems.filter((i) => i.listType === 'blacklist');
    return mockItems;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>{t('member.specialListManagement')}</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setAddModal(true); }}>
          {t('common.add')}
        </Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}><Input placeholder={t('member.memberSearch')} prefix={<SearchOutlined />} allowClear /></Col>
          <Col xs={24} md={4}>
            <Select placeholder={t('common.details') === '详情' ? '名单类型' : 'List Type'} style={{ width: '100%' }} allowClear
              options={[{ value: 'whitelist', label: t('member.whitelist') }, { value: 'blacklist', label: t('member.blacklist') }]} />
          </Col>
          <Col xs={24} md={4}><Button type="primary" icon={<SearchOutlined />}>{t('common.search')}</Button></Col>
        </Row>
      </Card>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
          { key: 'all', label: `${t('common.all')} (${mockItems.length})` },
          { key: 'whitelist', label: <Space><CheckCircleOutlined />{t('member.whitelist')} ({mockItems.filter((i) => i.listType === 'whitelist').length})</Space> },
          { key: 'blacklist', label: <Space><StopOutlined />{t('member.blacklist')} ({mockItems.filter((i) => i.listType === 'blacklist').length})</Space> },
        ]} />
        <Table columns={columns} dataSource={getFilteredData()} pagination={{ pageSize: 10, showTotal: (total) => t('common.total', { total }) }} />
      </Card>

      <Modal
        title={t('common.details') === '详情' ? '添加到特殊名单' : 'Add to Special List'}
        open={addModal}
        onCancel={() => setAddModal(false)}
        onOk={() => { form.validateFields().then(() => { message.success(t('common.success')); setAddModal(false); }); }}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="memberCardNo" label={t('member.memberCardNo')} rules={[{ required: true }]}>
            <Input placeholder="MC-XXXXXXXX" prefix={<UserOutlined />} />
          </Form.Item>
          <Form.Item name="listType" label={t('common.details') === '详情' ? '名单类型' : 'List Type'} rules={[{ required: true }]}>
            <Select options={[{ value: 'whitelist', label: t('member.whitelist') }, { value: 'blacklist', label: t('member.blacklist') }]} />
          </Form.Item>
          <Form.Item name="reason" label={t('common.details') === '详情' ? '原因' : 'Reason'} rules={[{ required: true }]}>
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item name="expiresAt" label={t('common.details') === '详情' ? '过期时间 (留空为永久)' : 'Expires At (empty = permanent)'}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SpecialListManagement;
