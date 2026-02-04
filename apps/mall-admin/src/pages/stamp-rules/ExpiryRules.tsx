import React, { useState } from 'react';
import { Card, Typography, Table, Tag, Button, Space, Modal, Form, Input, InputNumber, Select, Row, Col, Alert, message } from 'antd';
import { PlusOutlined, EditOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';

const { Title, Text } = Typography;

interface ExpiryRuleItem {
  key: string;
  id: string;
  name: string;
  type: string;
  expiryMonths: number | null;
  annualExpiryDate: string | null;
  notificationDays: number[];
  stampsAffected: number;
  membersAffected: number;
  status: string;
}

const mockRules: ExpiryRuleItem[] = [
  { key: '1', id: 'exp-001', name: '标准积分清零 (12个月)', type: 'fixed-period', expiryMonths: 12, annualExpiryDate: null, notificationDays: [30, 7, 1], stampsAffected: 45200, membersAffected: 3240, status: 'active' },
  { key: '2', id: 'exp-002', name: '年度清零 (12月31日)', type: 'annual', expiryMonths: null, annualExpiryDate: '12-31', notificationDays: [60, 30, 7], stampsAffected: 128000, membersAffected: 8500, status: 'inactive' },
  { key: '3', id: 'exp-003', name: '活动积分 (6个月)', type: 'fixed-period', expiryMonths: 6, annualExpiryDate: null, notificationDays: [14, 3], stampsAffected: 12800, membersAffected: 1560, status: 'active' },
];

const ExpiryRules: React.FC = () => {
  const { t } = useLocale();
  const [editModal, setEditModal] = useState(false);
  const [form] = Form.useForm();

  const typeLabels: Record<string, string> = {
    'fixed-period': t('common.details') === '详情' ? '固定周期' : 'Fixed Period',
    annual: t('common.details') === '详情' ? '年度清零' : 'Annual Clearing',
    rolling: t('common.details') === '详情' ? '滚动制' : 'Rolling',
    never: t('common.details') === '详情' ? '永不过期' : 'Never',
  };

  const columns: ColumnsType<ExpiryRuleItem> = [
    { title: t('common.details') === '详情' ? '规则名称' : 'Rule Name', dataIndex: 'name', key: 'name', width: 220, render: (text) => <Text strong>{text}</Text> },
    {
      title: t('common.details') === '详情' ? '类型' : 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => <Tag color="blue">{typeLabels[type]}</Tag>,
    },
    {
      title: t('common.details') === '详情' ? '清零周期' : 'Period',
      key: 'period',
      width: 140,
      render: (_, record) => {
        if (record.type === 'fixed-period') return `${record.expiryMonths} ${t('common.details') === '详情' ? '个月' : 'months'}`;
        if (record.type === 'annual') return record.annualExpiryDate;
        return '-';
      },
    },
    {
      title: t('common.details') === '详情' ? '通知天数' : 'Notification Days',
      dataIndex: 'notificationDays',
      key: 'notificationDays',
      width: 180,
      render: (days: number[]) => days.map((d) => <Tag key={d}>{d}d</Tag>),
    },
    {
      title: t('common.details') === '详情' ? '影响积分数' : 'Stamps Affected',
      dataIndex: 'stampsAffected',
      key: 'stampsAffected',
      width: 120,
      render: (v: number) => <Text type="warning">{v.toLocaleString()}</Text>,
    },
    {
      title: t('common.details') === '详情' ? '影响会员数' : 'Members Affected',
      dataIndex: 'membersAffected',
      key: 'membersAffected',
      width: 120,
      render: (v: number) => v.toLocaleString(),
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
      width: 80,
      render: (_, record) => (
        <Button type="link" icon={<EditOutlined />} onClick={() => { form.setFieldsValue(record); setEditModal(true); }}>
          {t('common.edit')}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>
          {t('common.details') === '详情' ? '积分清零规则' : t('common.details') === '詳情' ? '積分清零規則' : 'Stamp Expiry Rules'}
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setEditModal(true); }}>{t('common.add')}</Button>
      </div>

      <Alert type="warning" showIcon icon={<InfoCircleOutlined />}
        message={t('common.details') === '详情' ? '本月即将清零: 45,200 积分 (3,240 名会员)' : '45,200 stamps expiring this month (3,240 members)'}
        style={{ marginBottom: 16 }}
      />

      <Card>
        <Table columns={columns} dataSource={mockRules} pagination={false} />
      </Card>

      <Modal
        title={t('stamp.expiryRule')}
        open={editModal}
        onCancel={() => setEditModal(false)}
        onOk={() => { form.validateFields().then(() => { message.success(t('common.success')); setEditModal(false); }); }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label={t('common.details') === '详情' ? '规则名称' : 'Rule Name'} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="type" label={t('common.details') === '详情' ? '类型' : 'Type'} rules={[{ required: true }]}>
            <Select options={Object.entries(typeLabels).map(([value, label]) => ({ value, label }))} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="expiryMonths" label={t('common.details') === '详情' ? '过期月数' : 'Expiry Months'}>
                <InputNumber style={{ width: '100%' }} min={1} max={60} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="annualExpiryDate" label={t('common.details') === '详情' ? '年度清零日期' : 'Annual Date'}>
                <Input placeholder="MM-DD" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="notificationDays" label={t('common.details') === '详情' ? '提前通知天数' : 'Notification Days'}>
            <Select mode="tags" tokenSeparators={[',']} placeholder="e.g. 30, 7, 1" />
          </Form.Item>
          <Form.Item name="status" label={t('common.status')}>
            <Select options={[{ value: 'active', label: t('common.active') }, { value: 'inactive', label: t('common.inactive') }]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExpiryRules;
