import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Space, Typography, Tag, Tabs, message, Popconfirm, DatePicker } from 'antd';
import { PlusOutlined, DeleteOutlined, SearchOutlined, UnorderedListOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';
import { useAppStore } from '../../store/app';

const { Title } = Typography;

interface SpecialListRow {
  id: string;
  memberId: string;
  memberName: string;
  cardNo: string;
  listType: 'whitelist' | 'blacklist';
  reason: string;
  addedBy: string;
  addedAt: string;
  expiresAt: string | null;
  project: string;
}

const mockSpecialList: SpecialListRow[] = [
  { id: 'sl-01', memberId: 'M00002', memberName: 'Wong Siu Ming', cardNo: 'LR000000001235', listType: 'whitelist', reason: 'VIP corporate partner - exempt from velocity checks', addedBy: 'Admin', addedAt: '2025-06-15', expiresAt: null, project: 'All' },
  { id: 'sl-02', memberId: 'M00100', memberName: 'Lee Ka Wai', cardNo: 'LR000000004002', listType: 'whitelist', reason: 'Group executive account', addedBy: 'Admin', addedAt: '2025-03-01', expiresAt: null, project: 'All' },
  { id: 'sl-03', memberId: 'M00200', memberName: 'Yau Siu Fung', cardNo: 'LR000000004003', listType: 'whitelist', reason: 'Testing account - QA team', addedBy: 'System', addedAt: '2025-01-01', expiresAt: '2026-12-31', project: 'T Town' },
  { id: 'sl-04', memberId: 'M01340', memberName: 'Liu Qiang', cardNo: 'LR000000003001', listType: 'blacklist', reason: 'Confirmed fraud - multiple fake receipts', addedBy: 'Admin', addedAt: '2026-02-03', expiresAt: null, project: 'All' },
  { id: 'sl-05', memberId: 'M01445', memberName: 'Wu Tao', cardNo: 'LR000000003005', listType: 'blacklist', reason: 'Bot-like activity - automated stamp collection', addedBy: 'Admin', addedAt: '2026-02-01', expiresAt: '2026-08-01', project: 'TKO Gateway' },
  { id: 'sl-06', memberId: 'M01550', memberName: 'Xu Ling', cardNo: 'LR000000004006', listType: 'blacklist', reason: 'Verbal abuse to staff at counter', addedBy: 'Admin', addedAt: '2025-11-20', expiresAt: '2026-05-20', project: 'Temple Mall' },
];

const SpecialListManagement: React.FC = () => {
  const { t } = useLocale();
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs);
  const [activeTab, setActiveTab] = useState<'whitelist' | 'blacklist'>('whitelist');
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    setBreadcrumbs([
      { title: t('riskControl.riskControl'), path: '/risk-control/workbench' },
      { title: t('riskControl.specialListManagement') },
    ]);
  }, [setBreadcrumbs, t]);

  const filtered = mockSpecialList.filter((r) => {
    const matchesTab = r.listType === activeTab;
    const matchesSearch = !searchText || r.memberName.toLowerCase().includes(searchText.toLowerCase()) || r.cardNo.includes(searchText);
    return matchesTab && matchesSearch;
  });

  const columns: ColumnsType<SpecialListRow> = [
    { title: t('member.displayName'), dataIndex: 'memberName', key: 'memberName', width: 130 },
    { title: t('member.memberCardNo'), dataIndex: 'cardNo', key: 'cardNo', width: 160, render: (v: string) => <span style={{ fontFamily: 'monospace' }}>{v}</span> },
    { title: 'Reason', dataIndex: 'reason', key: 'reason', ellipsis: true },
    { title: 'Added By', dataIndex: 'addedBy', key: 'addedBy', width: 100 },
    { title: 'Added At', dataIndex: 'addedAt', key: 'addedAt', width: 120, sorter: (a, b) => a.addedAt.localeCompare(b.addedAt) },
    {
      title: 'Expires', dataIndex: 'expiresAt', key: 'expiresAt', width: 120,
      render: (v: string | null) => v ? <Tag color="orange">{v}</Tag> : <Tag color="default">Never</Tag>,
    },
    { title: t('organization.project'), dataIndex: 'project', key: 'project', width: 110 },
    {
      title: t('common.actions'), key: 'actions', width: 80,
      render: (_, r) => (
        <Popconfirm title={`Remove from ${activeTab}?`} onConfirm={() => message.success(t('common.success'))}>
          <Button type="link" icon={<DeleteOutlined />} size="small" danger />
        </Popconfirm>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'whitelist',
      label: <Space><Tag color="green">{t('member.whitelist')}</Tag><span>{mockSpecialList.filter((r) => r.listType === 'whitelist').length}</span></Space>,
    },
    {
      key: 'blacklist',
      label: <Space><Tag color="red">{t('member.blacklist')}</Tag><span>{mockSpecialList.filter((r) => r.listType === 'blacklist').length}</span></Space>,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}><UnorderedListOutlined style={{ marginRight: 8 }} />{t('riskControl.specialListManagement')}</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); form.setFieldsValue({ listType: activeTab }); setModalVisible(true); }}>{t('common.add')}</Button>
      </div>

      <Card>
        <Tabs activeKey={activeTab} onChange={(k) => setActiveTab(k as 'whitelist' | 'blacklist')} items={tabItems} />
        <Space style={{ marginBottom: 16 }}>
          <Input placeholder={t('common.search')} prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 260 }} allowClear />
          <Button icon={<ReloadOutlined />} onClick={() => setSearchText('')}>{t('common.reset')}</Button>
        </Space>
        <Table columns={columns} dataSource={filtered} rowKey="id" pagination={{ total: filtered.length, pageSize: 10, showTotal: (total) => t('common.total', { total }) }} scroll={{ x: 1000 }} size="middle" />
      </Card>

      <Modal title={t('common.add') + ' to ' + (activeTab === 'whitelist' ? t('member.whitelist') : t('member.blacklist'))} open={modalVisible} onOk={async () => { try { await form.validateFields(); message.success(t('common.success')); setModalVisible(false); } catch {} }} onCancel={() => setModalVisible(false)} okText={t('common.save')} cancelText={t('common.cancel')}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="List Type" name="listType" rules={[{ required: true }]}>
            <Select options={[{ label: t('member.whitelist'), value: 'whitelist' }, { label: t('member.blacklist'), value: 'blacklist' }]} />
          </Form.Item>
          <Form.Item label={t('member.memberCardNo')} name="cardNo" rules={[{ required: true }]}><Input placeholder="LR000000001234" /></Form.Item>
          <Form.Item label="Reason" name="reason" rules={[{ required: true }]}><Input.TextArea rows={2} /></Form.Item>
          <Form.Item label="Expiry Date (optional)" name="expiresAt"><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item label={t('organization.project')} name="project">
            <Select options={[{ label: 'All', value: 'All' }, { label: 'T Town', value: 'T Town' }, { label: 'LOHAS Park', value: 'LOHAS Park' }, { label: 'Temple Mall', value: 'Temple Mall' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SpecialListManagement;
