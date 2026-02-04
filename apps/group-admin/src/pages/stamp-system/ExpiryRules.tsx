import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, InputNumber, Select, Space, Typography, Tag, message, Popconfirm, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';
import { useAppStore } from '../../store/app';

const { Title } = Typography;

interface ExpiryRuleRow {
  id: string;
  name: { 'zh-CN': string; 'zh-TW': string; en: string };
  type: string;
  expiryMonths: number | null;
  annualDate: string | null;
  notificationDays: number[];
  applicableProjects: string[];
  status: 'active' | 'inactive';
}

const mockExpiryRules: ExpiryRuleRow[] = [
  { id: 'exp-01', name: { 'zh-CN': '12个月固定清零', 'zh-TW': '12個月固定清零', en: '12-Month Fixed Expiry' }, type: 'fixed-period', expiryMonths: 12, annualDate: null, notificationDays: [30, 7, 1], applicableProjects: ['All'], status: 'active' },
  { id: 'exp-02', name: { 'zh-CN': '年度清零 (12月31日)', 'zh-TW': '年度清零 (12月31日)', en: 'Annual Clearing (Dec 31)' }, type: 'annual', expiryMonths: null, annualDate: '12-31', notificationDays: [60, 30, 7], applicableProjects: ['T Town', 'LOHAS Park'], status: 'active' },
  { id: 'exp-03', name: { 'zh-CN': '24个月滚动制', 'zh-TW': '24個月滾動制', en: '24-Month Rolling' }, type: 'rolling', expiryMonths: 24, annualDate: null, notificationDays: [30, 14], applicableProjects: ['Temple Mall'], status: 'active' },
  { id: 'exp-04', name: { 'zh-CN': '钻石卡永不过期', 'zh-TW': '鑽石卡永不過期', en: 'Diamond Never Expires' }, type: 'never', expiryMonths: null, annualDate: null, notificationDays: [], applicableProjects: ['All'], status: 'active' },
];

const typeColors: Record<string, string> = { 'fixed-period': 'blue', annual: 'orange', rolling: 'purple', never: 'green' };
const typeLabels: Record<string, string> = { 'fixed-period': 'Fixed Period', annual: 'Annual', rolling: 'Rolling', never: 'Never Expires' };

const ExpiryRules: React.FC = () => {
  const { t, locale } = useLocale();
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const langKey = locale as 'zh-CN' | 'zh-TW' | 'en';

  useEffect(() => {
    setBreadcrumbs([
      { title: t('stamp.stampSystem'), path: '/stamp-system/pool-settings' },
      { title: t('stamp.expiryRule') },
    ]);
  }, [setBreadcrumbs, t]);

  const columns: ColumnsType<ExpiryRuleRow> = [
    { title: t('stamp.expiryRule'), key: 'name', render: (_, r) => <strong>{r.name[langKey]}</strong> },
    { title: 'Type', dataIndex: 'type', key: 'type', width: 130, render: (v: string) => <Tag color={typeColors[v]}>{typeLabels[v]}</Tag> },
    { title: 'Expiry Months', dataIndex: 'expiryMonths', key: 'expiryMonths', width: 120, render: (v: number | null) => v ? `${v} months` : '-' },
    { title: 'Annual Date', dataIndex: 'annualDate', key: 'annualDate', width: 110, render: (v: string | null) => v || '-' },
    { title: 'Notification (days before)', dataIndex: 'notificationDays', key: 'notificationDays', width: 200, render: (v: number[]) => v.length > 0 ? <Space>{v.map((d) => <Tag key={d}>{d}d</Tag>)}</Space> : '-' },
    { title: t('organization.project'), dataIndex: 'applicableProjects', key: 'applicableProjects', width: 180, render: (v: string[]) => <Space wrap>{v.map((p) => <Tag key={p}>{p}</Tag>)}</Space> },
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
        <Title level={4} style={{ margin: 0 }}><ClockCircleOutlined style={{ marginRight: 8 }} />{t('stamp.expiryRule')}</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalVisible(true); }}>{t('common.add')}</Button>
      </div>

      <Card><Table columns={columns} dataSource={mockExpiryRules} rowKey="id" pagination={false} scroll={{ x: 1200 }} /></Card>

      <Modal title={t('common.add') + ' ' + t('stamp.expiryRule')} open={modalVisible} onOk={async () => { try { await form.validateFields(); message.success(t('common.success')); setModalVisible(false); } catch {} }} onCancel={() => setModalVisible(false)} width={600} okText={t('common.save')} cancelText={t('common.cancel')}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Name (CN)" name="nameZhCN" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Name (EN)" name="nameEn" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Type" name="type" rules={[{ required: true }]}>
            <Select options={Object.entries(typeLabels).map(([k, v]) => ({ label: v, value: k }))} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item label="Expiry Months" name="expiryMonths"><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Annual Date (MM-DD)" name="annualDate"><Input placeholder="12-31" /></Form.Item></Col>
          </Row>
          <Form.Item label="Notification Days Before Expiry" name="notificationDays">
            <Select mode="tags" placeholder="e.g. 30, 7, 1" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExpiryRules;
