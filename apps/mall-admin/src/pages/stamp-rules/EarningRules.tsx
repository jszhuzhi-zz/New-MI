import React, { useState } from 'react';
import { Card, Typography, Table, Tag, Button, Space, Modal, Form, Input, InputNumber, Select, DatePicker, Switch, Row, Col, Divider, message } from 'antd';
import { PlusOutlined, EditOutlined, CopyOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface EarningRuleItem {
  key: string;
  id: string;
  name: string;
  type: string;
  spendingPerStamp: number;
  currency: string;
  maxPerTransaction: number | null;
  maxPerDay: number | null;
  tierIds: string[];
  merchantCategories: string[];
  priority: number;
  status: string;
  validFrom: string;
  validTo: string;
}

const mockRules: EarningRuleItem[] = [
  { key: '1', id: 'er-001', name: '标准消费积分', type: 'standard', spendingPerStamp: 10, currency: 'HKD', maxPerTransaction: 500, maxPerDay: 1000, tierIds: ['all'], merchantCategories: ['all'], priority: 1, status: 'active', validFrom: '2024-01-01', validTo: '2024-12-31' },
  { key: '2', id: 'er-002', name: 'Gold等级倍率', type: 'tier-multiplier', spendingPerStamp: 5, currency: 'HKD', maxPerTransaction: 800, maxPerDay: 2000, tierIds: ['gold', 'platinum'], merchantCategories: ['all'], priority: 2, status: 'active', validFrom: '2024-01-01', validTo: '2024-12-31' },
  { key: '3', id: 'er-003', name: '餐饮品类加成', type: 'category-bonus', spendingPerStamp: 8, currency: 'HKD', maxPerTransaction: 300, maxPerDay: null, tierIds: ['all'], merchantCategories: ['food-beverage'], priority: 3, status: 'active', validFrom: '2024-01-01', validTo: '2024-06-30' },
  { key: '4', id: 'er-004', name: '春节双倍积分', type: 'campaign-bonus', spendingPerStamp: 5, currency: 'HKD', maxPerTransaction: 1000, maxPerDay: 3000, tierIds: ['all'], merchantCategories: ['all'], priority: 10, status: 'active', validFrom: '2024-01-20', validTo: '2024-02-15' },
];

const EarningRules: React.FC = () => {
  const { t } = useLocale();
  const [editModal, setEditModal] = useState(false);
  const [form] = Form.useForm();

  const typeLabels: Record<string, string> = {
    standard: t('common.details') === '详情' ? '标准规则' : 'Standard',
    'tier-multiplier': t('common.details') === '详情' ? '等级倍率' : 'Tier Multiplier',
    'category-bonus': t('common.details') === '详情' ? '品类加成' : 'Category Bonus',
    'campaign-bonus': t('common.details') === '详情' ? '活动加成' : 'Campaign Bonus',
  };

  const typeColors: Record<string, string> = {
    standard: 'blue',
    'tier-multiplier': 'purple',
    'category-bonus': 'cyan',
    'campaign-bonus': 'orange',
  };

  const columns: ColumnsType<EarningRuleItem> = [
    { title: t('common.details') === '详情' ? '优先级' : 'Priority', dataIndex: 'priority', key: 'priority', width: 80, sorter: (a, b) => a.priority - b.priority },
    { title: t('common.details') === '详情' ? '规则名称' : 'Rule Name', dataIndex: 'name', key: 'name', width: 160, render: (text) => <Text strong>{text}</Text> },
    {
      title: t('common.details') === '详情' ? '类型' : 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => <Tag color={typeColors[type]}>{typeLabels[type]}</Tag>,
    },
    {
      title: t('common.details') === '详情' ? '每印花消费' : 'Spending/Stamp',
      dataIndex: 'spendingPerStamp',
      key: 'spendingPerStamp',
      width: 130,
      render: (v: number, record) => `${record.currency} ${v}`,
    },
    {
      title: t('common.details') === '详情' ? '单笔上限' : 'Max/TXN',
      dataIndex: 'maxPerTransaction',
      key: 'maxPerTransaction',
      width: 100,
      render: (v: number | null) => v ? v.toLocaleString() : '-',
    },
    {
      title: t('common.details') === '详情' ? '日上限' : 'Max/Day',
      dataIndex: 'maxPerDay',
      key: 'maxPerDay',
      width: 100,
      render: (v: number | null) => v ? v.toLocaleString() : '-',
    },
    {
      title: t('common.details') === '详情' ? '适用等级' : 'Tiers',
      dataIndex: 'tierIds',
      key: 'tierIds',
      width: 140,
      render: (tiers: string[]) => tiers.includes('all') ? <Tag>All</Tag> : tiers.map((t) => <Tag key={t}>{t}</Tag>),
    },
    {
      title: t('common.details') === '详情' ? '有效期' : 'Validity',
      key: 'validity',
      width: 200,
      render: (_, record) => `${record.validFrom} ~ ${record.validTo}`,
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
      width: 120,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => { form.setFieldsValue(record); setEditModal(true); }} />
          <Button type="link" size="small" icon={<CopyOutlined />} onClick={() => message.info('Rule duplicated')} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>
          {t('common.details') === '详情' ? '消费积分规则' : t('common.details') === '詳情' ? '消費積分規則' : 'Consumption Earning Rules'}
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setEditModal(true); }}>
          {t('common.add')}
        </Button>
      </div>

      <Card>
        <Table columns={columns} dataSource={mockRules} scroll={{ x: 1400 }} pagination={false} />
      </Card>

      <Modal
        title={t('common.details') === '详情' ? '消费积分规则' : 'Earning Rule'}
        open={editModal}
        onCancel={() => setEditModal(false)}
        onOk={() => { form.validateFields().then(() => { message.success(t('common.success')); setEditModal(false); }); }}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label={t('common.details') === '详情' ? '规则名称' : 'Rule Name'} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="type" label={t('common.details') === '详情' ? '类型' : 'Type'} rules={[{ required: true }]}>
                <Select options={Object.entries(typeLabels).map(([value, label]) => ({ value, label }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priority" label={t('common.details') === '详情' ? '优先级' : 'Priority'}>
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="spendingPerStamp" label={t('common.details') === '详情' ? '每印花消费(HKD)' : 'HKD per Stamp'} rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="maxPerTransaction" label={t('common.details') === '详情' ? '单笔上限' : 'Max/Transaction'}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="maxPerDay" label={t('common.details') === '详情' ? '日上限' : 'Max/Day'}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="tierIds" label={t('common.details') === '详情' ? '适用等级' : 'Applicable Tiers'}>
            <Select mode="multiple" options={[{ value: 'all', label: 'All' }, { value: 'green', label: 'Green' }, { value: 'silver', label: 'Silver' }, { value: 'gold', label: 'Gold' }, { value: 'platinum', label: 'Platinum' }]} />
          </Form.Item>
          <Form.Item name="merchantCategories" label={t('common.details') === '详情' ? '适用品类' : 'Merchant Categories'}>
            <Select mode="multiple" options={[{ value: 'all', label: 'All' }, { value: 'food-beverage', label: t('merchant.foodBeverage') }, { value: 'fashion', label: t('merchant.fashion') }, { value: 'beauty', label: t('merchant.beauty') }]} />
          </Form.Item>
          <Form.Item name="status" label={t('common.status')}>
            <Select options={[{ value: 'active', label: t('common.active') }, { value: 'inactive', label: t('common.inactive') }]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EarningRules;
