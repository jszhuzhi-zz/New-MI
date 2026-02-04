import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, InputNumber, Select, Space, Typography, Tag, message, Popconfirm, Switch, Row, Col, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ToolOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';
import { useAppStore } from '../../store/app';

const { Title } = Typography;

interface RiskRuleRow {
  id: string;
  name: { 'zh-CN': string; 'zh-TW': string; en: string };
  type: string;
  action: string;
  priority: number;
  conditions: string;
  applyMethod: string;
  triggeredCount: number;
  applicableProjects: string[];
  status: 'active' | 'inactive';
}

const mockRules: RiskRuleRow[] = [
  { id: 'rr-01', name: { 'zh-CN': '高频交易检测', 'zh-TW': '高頻交易檢測', en: 'High Frequency Detection' }, type: 'velocity', action: 'flag', priority: 1, conditions: '>10 transactions in 30 min', applyMethod: 'rule-based', triggeredCount: 45, applicableProjects: ['All'], status: 'active' },
  { id: 'rr-02', name: { 'zh-CN': '大额交易拦截', 'zh-TW': '大額交易攔截', en: 'Large Amount Block' }, type: 'amount', action: 'block', priority: 2, conditions: 'Single txn > HK$50,000', applyMethod: 'rule-based', triggeredCount: 12, applicableProjects: ['All'], status: 'active' },
  { id: 'rr-03', name: { 'zh-CN': '重复收据检测', 'zh-TW': '重複收據檢測', en: 'Duplicate Receipt Detection' }, type: 'pattern', action: 'flag', priority: 3, conditions: 'Same receipt hash within 24h', applyMethod: 'rule-based', triggeredCount: 28, applicableProjects: ['All'], status: 'active' },
  { id: 'rr-04', name: { 'zh-CN': '异地登录检测', 'zh-TW': '異地登錄檢測', en: 'Geolocation Anomaly' }, type: 'geolocation', action: 'notify-staff', priority: 4, conditions: 'Login from >100km away within 1h', applyMethod: 'rule-based', triggeredCount: 8, applicableProjects: ['All'], status: 'active' },
  { id: 'rr-05', name: { 'zh-CN': '设备指纹异常', 'zh-TW': '設備指紋異常', en: 'Device Fingerprint Anomaly' }, type: 'device', action: 'flag', priority: 5, conditions: 'Same device for >3 accounts', applyMethod: 'rule-based', triggeredCount: 15, applicableProjects: ['All'], status: 'active' },
  { id: 'rr-06', name: { 'zh-CN': '深夜交易检测', 'zh-TW': '深夜交易檢測', en: 'Late Night Transaction' }, type: 'time', action: 'flag', priority: 6, conditions: 'Transactions between 00:00-05:00', applyMethod: 'rule-based', triggeredCount: 32, applicableProjects: ['T Town', 'LOHAS Park'], status: 'inactive' },
  { id: 'rr-07', name: { 'zh-CN': '黑名单自动拦截', 'zh-TW': '黑名單自動攔截', en: 'Blacklist Auto Block' }, type: 'pattern', action: 'block', priority: 0, conditions: 'Member on blacklist', applyMethod: 'blacklist', triggeredCount: 5, applicableProjects: ['All'], status: 'active' },
];

const typeColors: Record<string, string> = { velocity: 'blue', amount: 'orange', pattern: 'purple', geolocation: 'cyan', device: 'green', time: 'gold' };
const actionColors: Record<string, string> = { flag: 'orange', block: 'red', 'suspend-member': 'volcano', 'notify-staff': 'blue', escalate: 'purple' };

const RuleManagement: React.FC = () => {
  const { t, locale } = useLocale();
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const langKey = locale as 'zh-CN' | 'zh-TW' | 'en';

  useEffect(() => {
    setBreadcrumbs([
      { title: t('riskControl.riskControl'), path: '/risk-control/workbench' },
      { title: t('riskControl.ruleManagement') },
    ]);
  }, [setBreadcrumbs, t]);

  const columns: ColumnsType<RiskRuleRow> = [
    { title: '#', dataIndex: 'priority', key: 'priority', width: 50, sorter: (a, b) => a.priority - b.priority },
    { title: t('riskControl.riskRule'), key: 'name', render: (_, r) => <strong>{r.name[langKey]}</strong> },
    { title: 'Type', dataIndex: 'type', key: 'type', width: 110, render: (v: string) => <Tag color={typeColors[v]}>{v}</Tag> },
    { title: 'Action', dataIndex: 'action', key: 'action', width: 120, render: (v: string) => <Tag color={actionColors[v]}>{v}</Tag> },
    { title: 'Conditions', dataIndex: 'conditions', key: 'conditions', ellipsis: true },
    { title: 'Method', dataIndex: 'applyMethod', key: 'applyMethod', width: 100, render: (v: string) => <Tag>{v}</Tag> },
    { title: 'Triggered', dataIndex: 'triggeredCount', key: 'triggeredCount', width: 90, sorter: (a, b) => a.triggeredCount - b.triggeredCount },
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
        <Title level={4} style={{ margin: 0 }}><ToolOutlined style={{ marginRight: 8 }} />{t('riskControl.ruleManagement')}</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalVisible(true); }}>{t('common.add')}</Button>
      </div>

      <Card><Table columns={columns} dataSource={mockRules} rowKey="id" pagination={false} scroll={{ x: 1100 }} /></Card>

      <Modal title={t('common.add') + ' ' + t('riskControl.riskRule')} open={modalVisible} onOk={async () => { try { await form.validateFields(); message.success(t('common.success')); setModalVisible(false); } catch {} }} onCancel={() => setModalVisible(false)} width={640} okText={t('common.save')} cancelText={t('common.cancel')}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Name (CN)" name="nameZhCN" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Name (EN)" name="nameEn" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Type" name="type" rules={[{ required: true }]}>
                <Select options={Object.keys(typeColors).map((k) => ({ label: k, value: k }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Action" name="action" rules={[{ required: true }]}>
                <Select options={Object.keys(actionColors).map((k) => ({ label: k, value: k }))} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Apply Method" name="applyMethod" rules={[{ required: true }]}>
            <Select options={[{ label: 'Rule-Based', value: 'rule-based' }, { label: 'Blacklist', value: 'blacklist' }, { label: 'Whitelist', value: 'whitelist' }]} />
          </Form.Item>
          <Form.Item label="Priority" name="priority" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="Conditions Description" name="conditions"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RuleManagement;
