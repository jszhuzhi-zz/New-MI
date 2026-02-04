import React, { useState } from 'react';
import { Card, Typography, Table, Tag, Button, Space, Modal, Form, Input, InputNumber, Select, DatePicker, Row, Col, Switch, Progress, message } from 'antd';
import { PlusOutlined, EditOutlined, CopyOutlined, BarChartOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface CampaignRuleItem {
  key: string;
  id: string;
  name: string;
  campaignName: string;
  type: string;
  value: number;
  maxBudget: number;
  usedBudget: number;
  supportsClearAccumulation: boolean;
  conditions: string[];
  validFrom: string;
  validTo: string;
  status: string;
}

const mockRules: CampaignRuleItem[] = [
  { key: '1', id: 'cr-001', name: '双倍积分周末', campaignName: 'Double Stamps Weekend', type: 'multiplier', value: 2, maxBudget: 50000, usedBudget: 15800, supportsClearAccumulation: true, conditions: ['周六日', '所有商户'], validFrom: '2024-01-01', validTo: '2024-03-31', status: 'active' },
  { key: '2', id: 'cr-002', name: '春节红包积分', campaignName: 'CNY Lucky Draw', type: 'bonus', value: 50, maxBudget: 100000, usedBudget: 12400, supportsClearAccumulation: true, conditions: ['最低消费 HKD 500', '仅限餐饮'], validFrom: '2024-01-20', validTo: '2024-02-15', status: 'active' },
  { key: '3', id: 'cr-003', name: '新会员欢迎', campaignName: 'New Member Welcome', type: 'fixed', value: 100, maxBudget: 20000, usedBudget: 8600, supportsClearAccumulation: false, conditions: ['仅新会员', '注册后7天内'], validFrom: '2024-01-01', validTo: '2024-12-31', status: 'active' },
  { key: '4', id: 'cr-004', name: '生日特别积分', campaignName: 'Birthday Special', type: 'multiplier', value: 3, maxBudget: 30000, usedBudget: 5200, supportsClearAccumulation: false, conditions: ['生日月', 'Gold及以上'], validFrom: '2024-01-01', validTo: '2024-12-31', status: 'active' },
  { key: '5', id: 'cr-005', name: '周年庆三倍', campaignName: 'Anniversary Triple', type: 'multiplier', value: 3, maxBudget: 80000, usedBudget: 0, supportsClearAccumulation: true, conditions: ['所有商户', '所有等级'], validFrom: '2024-06-01', validTo: '2024-06-30', status: 'inactive' },
];

const CampaignStampRules: React.FC = () => {
  const { t } = useLocale();
  const [editModal, setEditModal] = useState(false);
  const [form] = Form.useForm();

  const typeLabels: Record<string, string> = {
    multiplier: t('common.details') === '详情' ? '倍数' : 'Multiplier',
    bonus: t('common.details') === '详情' ? '额外赠送' : 'Bonus',
    fixed: t('common.details') === '详情' ? '固定积分' : 'Fixed',
  };

  const typeColors: Record<string, string> = {
    multiplier: 'purple',
    bonus: 'orange',
    fixed: 'blue',
  };

  const columns: ColumnsType<CampaignRuleItem> = [
    { title: t('common.details') === '详情' ? '规则名称' : 'Rule Name', dataIndex: 'name', key: 'name', width: 160, render: (text) => <Text strong>{text}</Text> },
    { title: t('campaign.campaign'), dataIndex: 'campaignName', key: 'campaignName', width: 180 },
    {
      title: t('common.details') === '详情' ? '类型' : 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => <Tag color={typeColors[type]}>{typeLabels[type]}</Tag>,
    },
    {
      title: t('common.details') === '详情' ? '值' : 'Value',
      dataIndex: 'value',
      key: 'value',
      width: 80,
      render: (v: number, record) => record.type === 'multiplier' ? `${v}x` : `+${v}`,
    },
    {
      title: t('common.details') === '详情' ? '预算使用' : 'Budget',
      key: 'budget',
      width: 200,
      render: (_, record) => (
        <div>
          <Progress
            percent={Math.round((record.usedBudget / record.maxBudget) * 100)}
            size="small"
            strokeColor={record.usedBudget / record.maxBudget > 0.8 ? '#ff4d4f' : '#1890ff'}
          />
          <Text style={{ fontSize: 12 }}>{record.usedBudget.toLocaleString()} / {record.maxBudget.toLocaleString()}</Text>
        </div>
      ),
    },
    {
      title: t('common.details') === '详情' ? '支持清零累积' : 'Clear/Accum.',
      dataIndex: 'supportsClearAccumulation',
      key: 'supportsClearAccumulation',
      width: 110,
      render: (v: boolean) => v ? <Tag color="green">{t('common.yes')}</Tag> : <Tag>{t('common.no')}</Tag>,
    },
    {
      title: t('common.details') === '详情' ? '条件' : 'Conditions',
      dataIndex: 'conditions',
      key: 'conditions',
      width: 200,
      render: (conditions: string[]) => conditions.map((c, i) => <Tag key={i}>{c}</Tag>),
    },
    {
      title: t('common.details') === '详情' ? '有效期' : 'Validity',
      key: 'validity',
      width: 190,
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
          {t('common.details') === '详情' ? '消费积分活动规则' : t('common.details') === '詳情' ? '消費積分活動規則' : 'Campaign Stamp Rules'}
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setEditModal(true); }}>{t('common.add')}</Button>
      </div>

      <Card>
        <Table columns={columns} dataSource={mockRules} scroll={{ x: 1800 }} pagination={{ pageSize: 10, showTotal: (total) => t('common.total', { total }) }} />
      </Card>

      <Modal
        title={t('stamp.campaignRule')}
        open={editModal}
        onCancel={() => setEditModal(false)}
        onOk={() => { form.validateFields().then(() => { message.success(t('common.success')); setEditModal(false); }); }}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label={t('common.details') === '详情' ? '规则名称' : 'Rule Name'} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="campaignName" label={t('campaign.campaign')} rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="type" label={t('common.details') === '详情' ? '类型' : 'Type'} rules={[{ required: true }]}>
                <Select options={Object.entries(typeLabels).map(([value, label]) => ({ value, label }))} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="value" label={t('common.details') === '详情' ? '值' : 'Value'} rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="maxBudget" label={t('common.details') === '详情' ? '最大预算' : 'Max Budget'}>
                <InputNumber style={{ width: '100%' }} min={0} step={10000} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="supportsClearAccumulation" label={t('common.details') === '详情' ? '支持清零累积' : 'Support Clearing/Accumulation'} valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="status" label={t('common.status')}>
            <Select options={[{ value: 'active', label: t('common.active') }, { value: 'inactive', label: t('common.inactive') }]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CampaignStampRules;
