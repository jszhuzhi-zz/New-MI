import React, { useState } from 'react';
import { Card, Typography, Table, Tag, Button, Space, Modal, Form, Input, InputNumber, Select, Row, Col, Alert, Descriptions, message } from 'antd';
import { PlusOutlined, EditOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';

const { Title, Text } = Typography;

interface UpperLimitRule {
  key: string;
  id: string;
  type: string;
  limit: number;
  tierOverrides: { tier: string; limit: number }[];
  currentUsage: number;
  status: string;
}

const mockRules: UpperLimitRule[] = [
  { key: '1', id: 'ul-001', type: 'per-transaction', limit: 500, tierOverrides: [{ tier: 'Gold', limit: 800 }, { tier: 'Platinum', limit: 1000 }], currentUsage: 0, status: 'active' },
  { key: '2', id: 'ul-002', type: 'daily', limit: 1000, tierOverrides: [{ tier: 'Gold', limit: 2000 }, { tier: 'Platinum', limit: 3000 }], currentUsage: 0, status: 'active' },
  { key: '3', id: 'ul-003', type: 'monthly', limit: 15000, tierOverrides: [{ tier: 'Gold', limit: 25000 }, { tier: 'Platinum', limit: 50000 }], currentUsage: 312500, status: 'active' },
  { key: '4', id: 'ul-004', type: 'annual', limit: 150000, tierOverrides: [], currentUsage: 502500, status: 'active' },
  { key: '5', id: 'ul-005', type: 'lifetime', limit: 1000000, tierOverrides: [], currentUsage: 502500, status: 'active' },
];

const UpperLimitRules: React.FC = () => {
  const { t } = useLocale();
  const [editModal, setEditModal] = useState(false);
  const [form] = Form.useForm();

  const typeLabels: Record<string, string> = {
    'per-transaction': t('common.details') === '详情' ? '单笔上限' : 'Per Transaction',
    daily: t('common.details') === '详情' ? '日上限' : 'Daily',
    monthly: t('common.details') === '详情' ? '月上限' : 'Monthly',
    annual: t('common.details') === '详情' ? '年上限' : 'Annual',
    lifetime: t('common.details') === '详情' ? '终身上限' : 'Lifetime',
  };

  const columns: ColumnsType<UpperLimitRule> = [
    {
      title: t('common.details') === '详情' ? '类型' : 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 140,
      render: (type: string) => <Tag color="blue">{typeLabels[type]}</Tag>,
    },
    {
      title: t('common.details') === '详情' ? '默认上限' : 'Default Limit',
      dataIndex: 'limit',
      key: 'limit',
      width: 130,
      render: (v: number) => <Text strong>{v.toLocaleString()}</Text>,
    },
    {
      title: t('common.details') === '详情' ? '等级覆盖' : 'Tier Overrides',
      dataIndex: 'tierOverrides',
      key: 'tierOverrides',
      render: (overrides: UpperLimitRule['tierOverrides']) =>
        overrides.length > 0 ? (
          <Space wrap>
            {overrides.map((o) => (
              <Tag key={o.tier} color="purple">{o.tier}: {o.limit.toLocaleString()}</Tag>
            ))}
          </Space>
        ) : <Text type="secondary">-</Text>,
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => <Tag color={status === 'active' ? 'green' : 'default'}>{status}</Tag>,
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button type="link" icon={<EditOutlined />} onClick={() => { form.setFieldsValue({ ...record, tierOverridesStr: record.tierOverrides.map((o) => `${o.tier}:${o.limit}`).join(', ') }); setEditModal(true); }}>
          {t('common.edit')}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <Title level={4}>
            {t('common.details') === '详情' ? '积分上限规则' : t('common.details') === '詳情' ? '積分上限規則' : 'Upper Limit Rules'}
          </Title>
          <Text type="secondary">
            {t('common.details') === '详情'
              ? '项目级积分上限，包括每次/每日/每月/每年/终身上限，支持按等级差异化配置'
              : 'Project-level stamp caps including per-transaction, daily, monthly, annual, and lifetime limits with tier-specific overrides'}
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setEditModal(true); }}>{t('common.add')}</Button>
      </div>

      <Alert type="info" showIcon icon={<InfoCircleOutlined />}
        message={t('common.details') === '详情' ? '积分上限规则按项目级别生效，支持为不同等级设置差异化上限' : 'Upper limit rules apply at project level, supporting per-stamp-event and frequency caps with tier-specific overrides'}
        style={{ marginBottom: 16 }}
      />

      <Card>
        <Table columns={columns} dataSource={mockRules} pagination={false} />
      </Card>

      <Modal
        title={t('stamp.upperLimitRule')}
        open={editModal}
        onCancel={() => setEditModal(false)}
        onOk={() => { form.validateFields().then(() => { message.success(t('common.success')); setEditModal(false); }); }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="type" label={t('common.details') === '详情' ? '类型' : 'Type'} rules={[{ required: true }]}>
            <Select options={Object.entries(typeLabels).map(([value, label]) => ({ value, label }))} />
          </Form.Item>
          <Form.Item name="limit" label={t('common.details') === '详情' ? '默认上限' : 'Default Limit'} rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={1} step={100} />
          </Form.Item>
          <Descriptions title={t('common.details') === '详情' ? '等级差异化上限' : 'Tier Overrides'} size="small" style={{ marginBottom: 16 }} />
          <Row gutter={16}>
            <Col span={12}><Form.Item label="Green"><InputNumber style={{ width: '100%' }} placeholder="Same as default" /></Form.Item></Col>
            <Col span={12}><Form.Item label="Silver"><InputNumber style={{ width: '100%' }} placeholder="Same as default" /></Form.Item></Col>
            <Col span={12}><Form.Item label="Gold"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Platinum"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Form.Item name="status" label={t('common.status')}>
            <Select options={[{ value: 'active', label: t('common.active') }, { value: 'inactive', label: t('common.inactive') }]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UpperLimitRules;
