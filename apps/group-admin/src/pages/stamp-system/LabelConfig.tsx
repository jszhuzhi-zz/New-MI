import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Space, Typography, Tag, message, Popconfirm, ColorPicker, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TagsOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';
import { useAppStore } from '../../store/app';

const { Title } = Typography;

interface LabelRow {
  id: string;
  name: { 'zh-CN': string; 'zh-TW': string; en: string };
  color: string;
  category: string;
  memberCount: number;
  project: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

const mockLabels: LabelRow[] = [
  { id: 'lbl-01', name: { 'zh-CN': 'VIP 2026', 'zh-TW': 'VIP 2026', en: 'VIP 2026' }, color: '#f50', category: 'VIP', memberCount: 3200, project: 'All', status: 'active', createdAt: '2026-01-01' },
  { id: 'lbl-02', name: { 'zh-CN': '高消费用户', 'zh-TW': '高消費用戶', en: 'High Spender' }, color: '#722ed1', category: 'Spending', memberCount: 8500, project: 'All', status: 'active', createdAt: '2025-06-15' },
  { id: 'lbl-03', name: { 'zh-CN': '新注册用户', 'zh-TW': '新註冊用戶', en: 'New Member' }, color: '#52c41a', category: 'Lifecycle', memberCount: 12400, project: 'All', status: 'active', createdAt: '2025-01-01' },
  { id: 'lbl-04', name: { 'zh-CN': '餐饮爱好者', 'zh-TW': '餐飲愛好者', en: 'F&B Lover' }, color: '#fa8c16', category: 'Interest', memberCount: 28900, project: 'All', status: 'active', createdAt: '2025-03-20' },
  { id: 'lbl-05', name: { 'zh-CN': '时尚达人', 'zh-TW': '時尚達人', en: 'Fashion Fan' }, color: '#eb2f96', category: 'Interest', memberCount: 15600, project: 'All', status: 'active', createdAt: '2025-03-20' },
  { id: 'lbl-06', name: { 'zh-CN': '沉睡会员', 'zh-TW': '沉睡會員', en: 'Dormant Member' }, color: '#8c8c8c', category: 'Lifecycle', memberCount: 22300, project: 'All', status: 'active', createdAt: '2025-05-10' },
  { id: 'lbl-07', name: { 'zh-CN': '家庭用户', 'zh-TW': '家庭用戶', en: 'Family User' }, color: '#13c2c2', category: 'Profile', memberCount: 19800, project: 'T Town', status: 'active', createdAt: '2025-08-01' },
  { id: 'lbl-08', name: { 'zh-CN': 'CNY活动参与者', 'zh-TW': 'CNY活動參與者', en: 'CNY Campaign Participant' }, color: '#cf1322', category: 'Campaign', memberCount: 45000, project: 'All', status: 'inactive', createdAt: '2025-12-01' },
];

const LabelConfig: React.FC = () => {
  const { t, locale } = useLocale();
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLabel, setEditingLabel] = useState<LabelRow | null>(null);
  const [form] = Form.useForm();

  const langKey = locale as 'zh-CN' | 'zh-TW' | 'en';

  useEffect(() => {
    setBreadcrumbs([
      { title: t('stamp.stampSystem'), path: '/stamp-system/pool-settings' },
      { title: t('member.labelConfig') },
    ]);
  }, [setBreadcrumbs, t]);

  const handleEdit = (label: LabelRow) => {
    setEditingLabel(label);
    form.setFieldsValue({
      nameZhCN: label.name['zh-CN'],
      nameZhTW: label.name['zh-TW'],
      nameEn: label.name.en,
      category: label.category,
    });
    setModalVisible(true);
  };

  const columns: ColumnsType<LabelRow> = [
    {
      title: t('member.memberLabel'), key: 'name',
      render: (_, r) => <Tag color={r.color}>{r.name[langKey]}</Tag>,
    },
    { title: 'Category', dataIndex: 'category', key: 'category', width: 110, render: (v: string) => <Tag>{v}</Tag> },
    { title: t('member.member'), dataIndex: 'memberCount', key: 'memberCount', width: 110, render: (v: number) => v.toLocaleString(), sorter: (a, b) => a.memberCount - b.memberCount },
    { title: t('organization.project'), dataIndex: 'project', key: 'project', width: 110 },
    { title: t('common.status'), dataIndex: 'status', key: 'status', width: 90, render: (v: string) => <Tag color={v === 'active' ? 'green' : 'default'}>{v === 'active' ? t('common.active') : t('common.inactive')}</Tag> },
    { title: t('common.createdAt'), dataIndex: 'createdAt', key: 'createdAt', width: 120, sorter: (a, b) => a.createdAt.localeCompare(b.createdAt) },
    {
      title: t('common.actions'), key: 'actions', width: 120,
      render: (_, r) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} size="small" onClick={() => handleEdit(r)} />
          <Popconfirm title={t('common.confirm') + '?'} onConfirm={() => message.success(t('common.success'))}>
            <Button type="link" icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}><TagsOutlined style={{ marginRight: 8 }} />{t('member.labelConfig')}</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingLabel(null); form.resetFields(); setModalVisible(true); }}>{t('common.add')}</Button>
      </div>

      <Card>
        <Table columns={columns} dataSource={mockLabels} rowKey="id" pagination={{ pageSize: 10, showTotal: (total) => t('common.total', { total }) }} />
      </Card>

      <Modal
        title={editingLabel ? t('common.edit') + ' ' + t('member.memberLabel') : t('common.add') + ' ' + t('member.memberLabel')}
        open={modalVisible} onOk={async () => { try { await form.validateFields(); message.success(t('common.success')); setModalVisible(false); } catch {} }}
        onCancel={() => setModalVisible(false)} okText={t('common.save')} cancelText={t('common.cancel')}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Name (CN)" name="nameZhCN" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Name (TW)" name="nameZhTW" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Name (EN)" name="nameEn" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Category" name="category" rules={[{ required: true }]}>
            <Select options={[
              { label: 'VIP', value: 'VIP' }, { label: 'Spending', value: 'Spending' },
              { label: 'Lifecycle', value: 'Lifecycle' }, { label: 'Interest', value: 'Interest' },
              { label: 'Profile', value: 'Profile' }, { label: 'Campaign', value: 'Campaign' },
            ]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LabelConfig;
