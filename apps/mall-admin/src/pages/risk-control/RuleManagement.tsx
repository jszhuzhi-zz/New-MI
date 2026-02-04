import React, { useState } from 'react';
import { Card, Table, Typography, Tag, Space, Button, Modal, Form, Input, InputNumber, Select, Row, Col, Switch, Popconfirm, Divider, Alert, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';

const { Title, Text } = Typography;

interface RiskRule {
  key: string;
  id: string;
  name: string;
  description: string;
  type: string;
  applyMethod: string;
  priority: number;
  conditions: string;
  action: string;
  triggeredCount: number;
  status: string;
  createdAt: string;
}

const mockRules: RiskRule[] = [
  { key: '1', id: 'RR-001', name: '日积分上限检测', description: '检测单日积分获取超过上限', type: 'amount', applyMethod: 'rule-based', priority: 1, conditions: 'daily_stamps > 500', action: 'flag', triggeredCount: 28, status: 'active', createdAt: '2024-01-01' },
  { key: '2', id: 'RR-002', name: '高频提交检测', description: '检测短时间内多次提交积分请求', type: 'velocity', applyMethod: 'rule-based', priority: 2, conditions: 'submissions_per_hour > 5', action: 'block', triggeredCount: 15, status: 'active', createdAt: '2024-01-01' },
  { key: '3', id: 'RR-003', name: '重复小票检测', description: '检测相同收据号重复使用', type: 'pattern', applyMethod: 'rule-based', priority: 3, conditions: 'receipt_duplicate = true', action: 'block', triggeredCount: 42, status: 'active', createdAt: '2024-01-01' },
  { key: '4', id: 'RR-004', name: '大额交易检测', description: '检测单笔消费超过阈值', type: 'amount', applyMethod: 'rule-based', priority: 4, conditions: 'spending > HKD 20,000', action: 'flag', triggeredCount: 8, status: 'active', createdAt: '2024-01-05' },
  { key: '5', id: 'RR-005', name: '黑名单用户拦截', description: '黑名单用户自动拦截所有积分操作', type: 'pattern', applyMethod: 'blacklist', priority: 0, conditions: 'member.listStatus = blacklist', action: 'block', triggeredCount: 5, status: 'active', createdAt: '2024-01-01' },
  { key: '6', id: 'RR-006', name: '白名单用户豁免', description: '白名单用户跳过风控检查', type: 'pattern', applyMethod: 'whitelist', priority: 0, conditions: 'member.listStatus = whitelist', action: 'flag', triggeredCount: 0, status: 'active', createdAt: '2024-01-01' },
  { key: '7', id: 'RR-007', name: '异常时段检测', description: '检测非营业时间的积分请求', type: 'time', applyMethod: 'rule-based', priority: 5, conditions: 'time < 08:00 OR time > 23:00', action: 'flag', triggeredCount: 3, status: 'active', createdAt: '2024-01-10' },
];

const RuleManagement: React.FC = () => {
  const { t } = useLocale();
  const [editModal, setEditModal] = useState(false);
  const [form] = Form.useForm();

  const typeLabels: Record<string, string> = {
    velocity: t('common.details') === '详情' ? '频率' : 'Velocity',
    amount: t('common.details') === '详情' ? '金额' : 'Amount',
    pattern: t('common.details') === '详情' ? '模式' : 'Pattern',
    geolocation: t('common.details') === '详情' ? '地理' : 'Geolocation',
    device: t('common.details') === '详情' ? '设备' : 'Device',
    time: t('common.details') === '详情' ? '时间' : 'Time',
  };

  const actionLabels: Record<string, string> = {
    flag: t('riskControl.flag'),
    block: t('riskControl.block'),
    'suspend-member': t('riskControl.suspend'),
    'notify-staff': t('common.details') === '详情' ? '通知员工' : 'Notify Staff',
    escalate: t('riskControl.escalate'),
  };

  const actionColors: Record<string, string> = {
    flag: 'orange',
    block: 'red',
    'suspend-member': 'magenta',
    'notify-staff': 'blue',
    escalate: 'purple',
  };

  const applyMethodLabels: Record<string, string> = {
    blacklist: t('common.details') === '详情' ? '黑名单' : 'Blacklist',
    whitelist: t('common.details') === '详情' ? '白名单' : 'Whitelist',
    'rule-based': t('common.details') === '详情' ? '规则驱动' : 'Rule-based',
  };

  const applyMethodColors: Record<string, string> = {
    blacklist: 'red',
    whitelist: 'green',
    'rule-based': 'blue',
  };

  const columns: ColumnsType<RiskRule> = [
    { title: t('common.details') === '详情' ? '优先级' : 'Priority', dataIndex: 'priority', key: 'priority', width: 80, sorter: (a, b) => a.priority - b.priority },
    { title: t('common.details') === '详情' ? '规则名称' : 'Rule Name', dataIndex: 'name', key: 'name', width: 160, render: (text) => <Text strong>{text}</Text> },
    {
      title: t('common.details') === '详情' ? '处理方式' : 'Apply Method',
      dataIndex: 'applyMethod',
      key: 'applyMethod',
      width: 110,
      render: (method: string) => <Tag color={applyMethodColors[method]}>{applyMethodLabels[method]}</Tag>,
      filters: Object.entries(applyMethodLabels).map(([value, text]) => ({ text, value })),
    },
    {
      title: t('common.details') === '详情' ? '类型' : 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) => <Tag>{typeLabels[type]}</Tag>,
    },
    {
      title: t('common.details') === '详情' ? '条件' : 'Conditions',
      dataIndex: 'conditions',
      key: 'conditions',
      width: 220,
      render: (text) => <Text code>{text}</Text>,
    },
    {
      title: t('common.details') === '详情' ? '触发动作' : 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 100,
      render: (action: string) => <Tag color={actionColors[action]}>{actionLabels[action]}</Tag>,
    },
    {
      title: t('common.details') === '详情' ? '触发次数' : 'Triggered',
      dataIndex: 'triggeredCount',
      key: 'triggeredCount',
      width: 90,
      render: (v: number) => v,
      sorter: (a, b) => a.triggeredCount - b.triggeredCount,
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
      width: 140,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => { form.setFieldsValue(record); setEditModal(true); }} />
          <Button type="link" size="small" icon={<CopyOutlined />} onClick={() => message.info('Rule duplicated')} />
          <Popconfirm title={t('common.delete') + '?'} onConfirm={() => message.success(t('common.success'))}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <Title level={4}>{t('riskControl.ruleManagement')}</Title>
          <Text type="secondary">
            {t('common.details') === '详情'
              ? '配置风控规则，支持黑名单、白名单、规则驱动三种处理方式'
              : 'Configure risk rules: supports blacklist, whitelist, and rule-based processing methods'}
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setEditModal(true); }}>{t('common.add')}</Button>
      </div>

      <Alert type="info" showIcon icon={<InfoCircleOutlined />}
        message={t('common.details') === '详情' ? '风控规则支持三种顶层处理方式：黑名单（自动拦截）、白名单（自动豁免）、规则驱动（按条件触发）' : 'Risk rules support 3 top-level processing methods: blacklist (auto-block), whitelist (auto-exempt), rule-based (conditional trigger)'}
        style={{ marginBottom: 16 }}
      />

      <Card>
        <Table columns={columns} dataSource={mockRules} scroll={{ x: 1400 }} pagination={false} />
      </Card>

      <Modal
        title={t('riskControl.ruleManagement')}
        open={editModal}
        onCancel={() => setEditModal(false)}
        onOk={() => { form.validateFields().then(() => { message.success(t('common.success')); setEditModal(false); }); }}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label={t('common.details') === '详情' ? '规则名称' : 'Rule Name'} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label={t('common.details') === '详情' ? '描述' : 'Description'}><Input.TextArea rows={2} /></Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="applyMethod" label={t('common.details') === '详情' ? '处理方式' : 'Apply Method'} rules={[{ required: true }]}>
                <Select options={Object.entries(applyMethodLabels).map(([value, label]) => ({ value, label }))} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="type" label={t('common.details') === '详情' ? '规则类型' : 'Rule Type'} rules={[{ required: true }]}>
                <Select options={Object.entries(typeLabels).map(([value, label]) => ({ value, label }))} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="priority" label={t('common.details') === '详情' ? '优先级' : 'Priority'}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
            </Col>
          </Row>
          <Form.Item name="conditions" label={t('common.details') === '详情' ? '条件表达式' : 'Condition Expression'} rules={[{ required: true }]}>
            <Input.TextArea rows={2} placeholder="e.g., daily_stamps > 500" />
          </Form.Item>
          <Form.Item name="action" label={t('common.details') === '详情' ? '触发动作' : 'Trigger Action'} rules={[{ required: true }]}>
            <Select options={Object.entries(actionLabels).map(([value, label]) => ({ value, label }))} />
          </Form.Item>
          <Form.Item name="status" label={t('common.status')}>
            <Select options={[{ value: 'active', label: t('common.active') }, { value: 'inactive', label: t('common.inactive') }]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RuleManagement;
