import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, InputNumber, Space, Typography, Tag, message, Popconfirm, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';
import { useAppStore } from '../../store/app';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

interface StampInfoRow {
  id: string;
  name: { 'zh-CN': string; 'zh-TW': string; en: string };
  description: { 'zh-CN': string; 'zh-TW': string; en: string };
  displayOrder: number;
  status: 'active' | 'inactive';
}

const mockStampInfos: StampInfoRow[] = [
  { id: 'si-01', name: { 'zh-CN': '印花获取规则', 'zh-TW': '印花獲取規則', en: 'Stamp Earning Rules' }, description: { 'zh-CN': '每消费HK$1可获得1个印花，部分商户提供双倍印花', 'zh-TW': '每消費HK$1可獲得1個印花，部分商戶提供雙倍印花', en: 'Earn 1 stamp for every HK$1 spent. Selected merchants offer double stamps.' }, displayOrder: 1, status: 'active' },
  { id: 'si-02', name: { 'zh-CN': '印花有效期', 'zh-TW': '印花有效期', en: 'Stamp Validity' }, description: { 'zh-CN': '印花自获取之日起12个月内有效，过期后将自动清零', 'zh-TW': '印花自獲取之日起12個月內有效，過期後將自動清零', en: 'Stamps are valid for 12 months from the date of earning. Expired stamps will be automatically cleared.' }, displayOrder: 2, status: 'active' },
  { id: 'si-03', name: { 'zh-CN': '印花兑换', 'zh-TW': '印花兌換', en: 'Stamp Redemption' }, description: { 'zh-CN': '印花可在会员中心兑换优惠券、礼品和停车优惠', 'zh-TW': '印花可在會員中心兌換優惠券、禮品和停車優惠', en: 'Stamps can be redeemed for coupons, gifts, and parking benefits at the Member Center.' }, displayOrder: 3, status: 'active' },
  { id: 'si-04', name: { 'zh-CN': '等级升级', 'zh-TW': '等級升級', en: 'Tier Upgrade' }, description: { 'zh-CN': '根据累计印花数量自动升级会员等级，享受更多专属权益', 'zh-TW': '根據累計印花數量自動升級會員等級，享受更多專屬權益', en: 'Member tier is automatically upgraded based on lifetime stamps earned, unlocking more exclusive benefits.' }, displayOrder: 4, status: 'active' },
  { id: 'si-05', name: { 'zh-CN': '特殊活动印花', 'zh-TW': '特殊活動印花', en: 'Special Campaign Stamps' }, description: { 'zh-CN': '节假日和特殊活动期间可获得额外印花奖励', 'zh-TW': '節假日和特殊活動期間可獲得額外印花獎勵', en: 'Earn bonus stamps during holidays and special campaign periods.' }, displayOrder: 5, status: 'inactive' },
];

const StampInfo: React.FC = () => {
  const { t, locale } = useLocale();
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<StampInfoRow | null>(null);
  const [form] = Form.useForm();

  const langKey = locale as 'zh-CN' | 'zh-TW' | 'en';

  useEffect(() => {
    setBreadcrumbs([
      { title: t('stamp.stampSystem'), path: '/stamp-system/pool-settings' },
      { title: t('stamp.stampInfo') },
    ]);
  }, [setBreadcrumbs, t]);

  const columns: ColumnsType<StampInfoRow> = [
    { title: '#', dataIndex: 'displayOrder', key: 'displayOrder', width: 60, sorter: (a, b) => a.displayOrder - b.displayOrder },
    { title: t('stamp.stampInfo'), key: 'name', width: 200, render: (_, r) => <strong>{r.name[langKey]}</strong> },
    { title: 'Description', key: 'description', render: (_, r) => <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 0 }}>{r.description[langKey]}</Paragraph> },
    { title: t('common.status'), dataIndex: 'status', key: 'status', width: 90, render: (v: string) => <Tag color={v === 'active' ? 'green' : 'default'}>{v === 'active' ? t('common.active') : t('common.inactive')}</Tag> },
    {
      title: t('common.actions'), key: 'actions', width: 150,
      render: (_, r) => (
        <Space>
          <Button type="link" icon={<ArrowUpOutlined />} size="small" disabled={r.displayOrder === 1} onClick={() => message.info('Move up')} />
          <Button type="link" icon={<ArrowDownOutlined />} size="small" onClick={() => message.info('Move down')} />
          <Button type="link" icon={<EditOutlined />} size="small" onClick={() => { setEditingItem(r); form.setFieldsValue({ nameZhCN: r.name['zh-CN'], nameZhTW: r.name['zh-TW'], nameEn: r.name.en, descZhCN: r.description['zh-CN'], descZhTW: r.description['zh-TW'], descEn: r.description.en, displayOrder: r.displayOrder }); setModalVisible(true); }} />
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
        <Title level={4} style={{ margin: 0 }}><InfoCircleOutlined style={{ marginRight: 8 }} />{t('stamp.stampInfo')}</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingItem(null); form.resetFields(); setModalVisible(true); }}>{t('common.add')}</Button>
      </div>

      <Card>
        <Table columns={columns} dataSource={mockStampInfos} rowKey="id" pagination={false} />
      </Card>

      <Modal title={editingItem ? t('common.edit') : t('common.add')} open={modalVisible} onOk={async () => { try { await form.validateFields(); message.success(t('common.success')); setModalVisible(false); } catch {} }} onCancel={() => setModalVisible(false)} width={640} okText={t('common.save')} cancelText={t('common.cancel')}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Title (CN)" name="nameZhCN" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Title (TW)" name="nameZhTW" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Title (EN)" name="nameEn" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Description (CN)" name="descZhCN" rules={[{ required: true }]}><TextArea rows={2} /></Form.Item>
          <Form.Item label="Description (TW)" name="descZhTW" rules={[{ required: true }]}><TextArea rows={2} /></Form.Item>
          <Form.Item label="Description (EN)" name="descEn" rules={[{ required: true }]}><TextArea rows={2} /></Form.Item>
          <Form.Item label="Display Order" name="displayOrder"><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StampInfo;
