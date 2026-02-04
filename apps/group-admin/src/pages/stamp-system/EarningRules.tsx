import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, InputNumber, Select, Space, Typography, Tag, message, Popconfirm, Switch, Divider, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CalculatorOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';
import { useAppStore } from '../../store/app';

const { Title } = Typography;

interface EarningRuleRow {
  id: string;
  name: { 'zh-CN': string; 'zh-TW': string; en: string };
  type: string;
  spendingPerStamp: number;
  currency: string;
  maxPerTransaction: number | null;
  maxPerDay: number | null;
  priority: number;
  applicableTiers: string[];
  applicableProjects: string[];
  status: 'active' | 'inactive';
  validFrom: string;
  validTo: string | null;
}

const mockRules: EarningRuleRow[] = [
  { id: 'er-01', name: { 'zh-CN': '标准获取规则', 'zh-TW': '標準獲取規則', en: 'Standard Earning Rule' }, type: 'standard', spendingPerStamp: 1, currency: 'HKD', maxPerTransaction: 5000, maxPerDay: 10000, priority: 1, applicableTiers: ['All'], applicableProjects: ['All'], status: 'active', validFrom: '2025-01-01', validTo: null },
  { id: 'er-02', name: { 'zh-CN': '金卡倍率规则', 'zh-TW': '金卡倍率規則', en: 'Gold Tier Multiplier' }, type: 'tier-multiplier', spendingPerStamp: 0.67, currency: 'HKD', maxPerTransaction: 7500, maxPerDay: 15000, priority: 2, applicableTiers: ['Gold', 'Platinum', 'Diamond'], applicableProjects: ['All'], status: 'active', validFrom: '2025-01-01', validTo: null },
  { id: 'er-03', name: { 'zh-CN': '餐饮类加成', 'zh-TW': '餐飲類加成', en: 'F&B Category Bonus' }, type: 'category-bonus', spendingPerStamp: 0.5, currency: 'HKD', maxPerTransaction: 3000, maxPerDay: 6000, priority: 3, applicableTiers: ['All'], applicableProjects: ['T Town', 'LOHAS Park'], status: 'active', validFrom: '2025-06-01', validTo: '2026-05-31' },
  { id: 'er-04', name: { 'zh-CN': 'CNY双倍印花', 'zh-TW': 'CNY雙倍印花', en: 'CNY Double Stamps' }, type: 'campaign-bonus', spendingPerStamp: 0.5, currency: 'HKD', maxPerTransaction: 10000, maxPerDay: 20000, priority: 4, applicableTiers: ['All'], applicableProjects: ['All'], status: 'active', validFrom: '2026-01-20', validTo: '2026-02-15' },
  { id: 'er-05', name: { 'zh-CN': '钻石卡专属规则', 'zh-TW': '鑽石卡專屬規則', en: 'Diamond Exclusive Rule' }, type: 'tier-multiplier', spendingPerStamp: 0.33, currency: 'HKD', maxPerTransaction: null, maxPerDay: null, priority: 5, applicableTiers: ['Diamond'], applicableProjects: ['All'], status: 'active', validFrom: '2025-01-01', validTo: null },
];

const typeColors: Record<string, string> = { standard: 'blue', 'tier-multiplier': 'purple', 'category-bonus': 'orange', 'campaign-bonus': 'green' };

const EarningRules: React.FC = () => {
  const { t, locale } = useLocale();
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const langKey = locale as 'zh-CN' | 'zh-TW' | 'en';

  useEffect(() => {
    setBreadcrumbs([
      { title: t('stamp.stampSystem'), path: '/stamp-system/pool-settings' },
      { title: t('stamp.earningRule') },
    ]);
  }, [setBreadcrumbs, t]);

  const columns: ColumnsType<EarningRuleRow> = [
    { title: 'Priority', dataIndex: 'priority', key: 'priority', width: 80, sorter: (a, b) => a.priority - b.priority },
    { title: t('stamp.earningRule'), key: 'name', render: (_, r) => <strong>{r.name[langKey]}</strong> },
    { title: 'Type', dataIndex: 'type', key: 'type', width: 140, render: (v: string) => <Tag color={typeColors[v]}>{v}</Tag> },
    { title: 'HKD / Stamp', dataIndex: 'spendingPerStamp', key: 'spendingPerStamp', width: 110, render: (v: number) => `$${v}` },
    { title: 'Max / Txn', dataIndex: 'maxPerTransaction', key: 'maxPerTransaction', width: 100, render: (v: number | null) => v ? v.toLocaleString() : 'No Limit' },
    { title: 'Max / Day', dataIndex: 'maxPerDay', key: 'maxPerDay', width: 100, render: (v: number | null) => v ? v.toLocaleString() : 'No Limit' },
    { title: 'Tiers', dataIndex: 'applicableTiers', key: 'applicableTiers', width: 160, render: (v: string[]) => <Space wrap>{v.map((tier) => <Tag key={tier}>{tier}</Tag>)}</Space> },
    { title: 'Valid Period', key: 'valid', width: 200, render: (_, r) => `${r.validFrom} - ${r.validTo || 'No End'}` },
    { title: t('common.status'), dataIndex: 'status', key: 'status', width: 90, render: (v: string) => <Tag color={v === 'active' ? 'green' : 'default'}>{v === 'active' ? t('common.active') : t('common.inactive')}</Tag> },
    {
      title: t('common.actions'), key: 'actions', width: 120,
      render: (_, r) => (
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
        <Title level={4} style={{ margin: 0 }}><CalculatorOutlined style={{ marginRight: 8 }} />{t('stamp.earningRule')}</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalVisible(true); }}>{t('common.add')}</Button>
      </div>

      <Card><Table columns={columns} dataSource={mockRules} rowKey="id" pagination={false} scroll={{ x: 1400 }} /></Card>

      <Modal title={t('common.add') + ' ' + t('stamp.earningRule')} open={modalVisible} onOk={async () => { try { await form.validateFields(); message.success(t('common.success')); setModalVisible(false); } catch {} }} onCancel={() => setModalVisible(false)} width={640} okText={t('common.save')} cancelText={t('common.cancel')}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Name (CN)" name="nameZhCN" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Name (EN)" name="nameEn" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Type" name="type" rules={[{ required: true }]}>
            <Select options={[
              { label: 'Standard', value: 'standard' }, { label: 'Tier Multiplier', value: 'tier-multiplier' },
              { label: 'Category Bonus', value: 'category-bonus' }, { label: 'Campaign Bonus', value: 'campaign-bonus' },
            ]} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}><Form.Item label="HKD per Stamp" name="spendingPerStamp" rules={[{ required: true }]}><InputNumber min={0.01} step={0.01} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item label="Max / Transaction" name="maxPerTransaction"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item label="Max / Day" name="maxPerDay"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Form.Item label="Priority" name="priority" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EarningRules;
