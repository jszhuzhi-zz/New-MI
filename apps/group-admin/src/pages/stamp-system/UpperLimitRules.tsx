import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, InputNumber, Select, Space, Typography, Tag, message, Popconfirm, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, VerticalAlignTopOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';
import { useAppStore } from '../../store/app';

const { Title } = Typography;

interface UpperLimitRow {
  id: string;
  project: string;
  type: string;
  limit: number;
  tierOverrides: { tier: string; limit: number }[];
  status: 'active' | 'inactive';
}

const mockLimits: UpperLimitRow[] = [
  { id: 'ul-01', project: 'All', type: 'per-transaction', limit: 5000, tierOverrides: [{ tier: 'Diamond', limit: 15000 }, { tier: 'Platinum', limit: 10000 }], status: 'active' },
  { id: 'ul-02', project: 'All', type: 'daily', limit: 10000, tierOverrides: [{ tier: 'Diamond', limit: 30000 }, { tier: 'Platinum', limit: 20000 }], status: 'active' },
  { id: 'ul-03', project: 'All', type: 'monthly', limit: 100000, tierOverrides: [{ tier: 'Diamond', limit: 300000 }], status: 'active' },
  { id: 'ul-04', project: 'All', type: 'annual', limit: 1000000, tierOverrides: [], status: 'active' },
  { id: 'ul-05', project: 'T Town', type: 'per-transaction', limit: 8000, tierOverrides: [], status: 'active' },
  { id: 'ul-06', project: 'All', type: 'lifetime', limit: 0, tierOverrides: [], status: 'inactive' },
];

const typeColors: Record<string, string> = { 'per-transaction': 'blue', daily: 'green', monthly: 'orange', annual: 'purple', lifetime: 'red' };

const UpperLimitRules: React.FC = () => {
  const { t } = useLocale();
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    setBreadcrumbs([
      { title: t('stamp.stampSystem'), path: '/stamp-system/pool-settings' },
      { title: t('stamp.upperLimitRule') },
    ]);
  }, [setBreadcrumbs, t]);

  const columns: ColumnsType<UpperLimitRow> = [
    { title: t('organization.project'), dataIndex: 'project', key: 'project', width: 120 },
    { title: 'Type', dataIndex: 'type', key: 'type', width: 140, render: (v: string) => <Tag color={typeColors[v]}>{v.replace('-', ' ').toUpperCase()}</Tag> },
    { title: 'Limit', dataIndex: 'limit', key: 'limit', width: 120, render: (v: number) => v === 0 ? 'No Limit' : v.toLocaleString(), sorter: (a, b) => a.limit - b.limit },
    {
      title: 'Tier Overrides', key: 'tierOverrides',
      render: (_, r) => r.tierOverrides.length > 0 ? (
        <Space wrap>
          {r.tierOverrides.map((to, i) => (
            <Tag key={i} color="purple">{to.tier}: {to.limit.toLocaleString()}</Tag>
          ))}
        </Space>
      ) : <span style={{ color: '#999' }}>-</span>,
    },
    { title: t('common.status'), dataIndex: 'status', key: 'status', width: 90, render: (v: string) => <Tag color={v === 'active' ? 'green' : 'default'}>{v === 'active' ? t('common.active') : t('common.inactive')}</Tag> },
    {
      title: t('common.actions'), key: 'actions', width: 120,
      render: () => (
        <Space>
          <Button type="link" icon={<EditOutlined />} size="small" onClick={() => { form.resetFields(); setModalVisible(true); }} />
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
        <Title level={4} style={{ margin: 0 }}><VerticalAlignTopOutlined style={{ marginRight: 8 }} />{t('stamp.upperLimitRule')}</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalVisible(true); }}>{t('common.add')}</Button>
      </div>

      <Card><Table columns={columns} dataSource={mockLimits} rowKey="id" pagination={false} scroll={{ x: 900 }} /></Card>

      <Modal title={t('common.add') + ' ' + t('stamp.upperLimitRule')} open={modalVisible} onOk={async () => { try { await form.validateFields(); message.success(t('common.success')); setModalVisible(false); } catch {} }} onCancel={() => setModalVisible(false)} width={600} okText={t('common.save')} cancelText={t('common.cancel')}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Type" name="type" rules={[{ required: true }]}>
            <Select options={Object.entries(typeColors).map(([k]) => ({ label: k.replace('-', ' ').toUpperCase(), value: k }))} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item label="Limit (stamps)" name="limit" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item label={t('organization.project')} name="project"><Select options={[{ label: 'All', value: 'All' }, { label: 'T Town', value: 'T Town' }, { label: 'LOHAS Park', value: 'LOHAS Park' }]} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default UpperLimitRules;
