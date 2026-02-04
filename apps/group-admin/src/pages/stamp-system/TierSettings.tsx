import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, InputNumber, Select, Space, Typography, Tag, message, Popconfirm, ColorPicker, List } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TrophyOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';
import { useAppStore } from '../../store/app';
import MemberTierTag from '../../components/MemberTierTag';

const { Title } = Typography;

interface TierRow {
  id: string;
  name: { 'zh-CN': string; 'zh-TW': string; en: string };
  code: string;
  level: number;
  minStamps: number;
  memberCount: number;
  color: string;
  benefits: { type: string; name: string; value: string }[];
  status: 'active' | 'inactive';
}

const mockTiers: TierRow[] = [
  {
    id: 'tier-01', name: { 'zh-CN': '铜卡', 'zh-TW': '銅卡', en: 'Bronze' }, code: 'BRONZE', level: 1, minStamps: 0, memberCount: 85200, color: '#cd7f32', status: 'active',
    benefits: [{ type: 'stamp-multiplier', name: 'Base Earning', value: '1x' }],
  },
  {
    id: 'tier-02', name: { 'zh-CN': '银卡', 'zh-TW': '銀卡', en: 'Silver' }, code: 'SILVER', level: 2, minStamps: 2000, memberCount: 42300, color: '#c0c0c0', status: 'active',
    benefits: [{ type: 'stamp-multiplier', name: 'Earning Multiplier', value: '1.2x' }, { type: 'free-parking', name: 'Free Parking', value: '2hrs' }],
  },
  {
    id: 'tier-03', name: { 'zh-CN': '金卡', 'zh-TW': '金卡', en: 'Gold' }, code: 'GOLD', level: 3, minStamps: 8000, memberCount: 28100, color: '#ffd700', status: 'active',
    benefits: [{ type: 'stamp-multiplier', name: 'Earning Multiplier', value: '1.5x' }, { type: 'free-parking', name: 'Free Parking', value: '3hrs' }, { type: 'discount', name: 'Partner Discount', value: '5%' }],
  },
  {
    id: 'tier-04', name: { 'zh-CN': '白金卡', 'zh-TW': '白金卡', en: 'Platinum' }, code: 'PLATINUM', level: 4, minStamps: 25000, memberCount: 6800, color: '#e5e4e2', status: 'active',
    benefits: [{ type: 'stamp-multiplier', name: 'Earning Multiplier', value: '2x' }, { type: 'free-parking', name: 'Free Parking', value: '4hrs' }, { type: 'discount', name: 'Partner Discount', value: '10%' }, { type: 'lounge-access', name: 'Lounge Access', value: 'VIP Lounge' }],
  },
  {
    id: 'tier-05', name: { 'zh-CN': '钻石卡', 'zh-TW': '鑽石卡', en: 'Diamond' }, code: 'DIAMOND', level: 5, minStamps: 60000, memberCount: 1100, color: '#b9f2ff', status: 'active',
    benefits: [{ type: 'stamp-multiplier', name: 'Earning Multiplier', value: '3x' }, { type: 'free-parking', name: 'Free Parking', value: 'Unlimited' }, { type: 'discount', name: 'Partner Discount', value: '15%' }, { type: 'lounge-access', name: 'Lounge Access', value: 'All VIP Areas' }, { type: 'priority-service', name: 'Priority Service', value: 'Dedicated Concierge' }],
  },
];

const TierSettings: React.FC = () => {
  const { t, locale } = useLocale();
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTier, setEditingTier] = useState<TierRow | null>(null);
  const [form] = Form.useForm();

  const langKey = locale as 'zh-CN' | 'zh-TW' | 'en';

  useEffect(() => {
    setBreadcrumbs([
      { title: t('stamp.stampSystem'), path: '/stamp-system/pool-settings' },
      { title: t('member.tierManagement') },
    ]);
  }, [setBreadcrumbs, t]);

  const handleEdit = (tier: TierRow) => {
    setEditingTier(tier);
    form.setFieldsValue({
      nameZhCN: tier.name['zh-CN'],
      nameZhTW: tier.name['zh-TW'],
      nameEn: tier.name.en,
      code: tier.code,
      level: tier.level,
      minStamps: tier.minStamps,
    });
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingTier(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      await form.validateFields();
      message.success(t('common.success'));
      setModalVisible(false);
    } catch { /* validation */ }
  };

  const handleDelete = (id: string) => {
    message.success(t('common.success'));
  };

  const columns: ColumnsType<TierRow> = [
    { title: 'Level', dataIndex: 'level', key: 'level', width: 70, sorter: (a, b) => a.level - b.level },
    {
      title: t('member.memberTier'), key: 'name', width: 150,
      render: (_, r) => <MemberTierTag tier={r.name[langKey]} level={r.level} color={r.color} />,
    },
    { title: 'Code', dataIndex: 'code', key: 'code', width: 100 },
    {
      title: 'Min Stamps', dataIndex: 'minStamps', key: 'minStamps', width: 120,
      render: (v: number) => v.toLocaleString(),
      sorter: (a, b) => a.minStamps - b.minStamps,
    },
    {
      title: t('member.member'), dataIndex: 'memberCount', key: 'memberCount', width: 110,
      render: (v: number) => v.toLocaleString(),
      sorter: (a, b) => a.memberCount - b.memberCount,
    },
    {
      title: t('member.tierBenefit'), key: 'benefits',
      render: (_, r) => (
        <Space wrap>
          {r.benefits.map((b, i) => (
            <Tag key={i} color="blue">{b.name}: {b.value}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: t('common.status'), dataIndex: 'status', key: 'status', width: 90,
      render: (v: string) => <Tag color={v === 'active' ? 'green' : 'default'}>{v === 'active' ? t('common.active') : t('common.inactive')}</Tag>,
    },
    {
      title: t('common.actions'), key: 'actions', width: 120,
      render: (_, r) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} size="small" onClick={() => handleEdit(r)} />
          <Popconfirm title={t('common.confirm') + '?'} onConfirm={() => handleDelete(r.id)}>
            <Button type="link" icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          <TrophyOutlined style={{ marginRight: 8 }} />
          {t('member.tierManagement')}
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          {t('common.add')} Tier
        </Button>
      </div>

      <Card>
        <Table columns={columns} dataSource={mockTiers} rowKey="id" pagination={false} scroll={{ x: 1000 }} />
      </Card>

      <Modal
        title={editingTier ? t('common.edit') + ' Tier' : t('common.add') + ' Tier'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Name (CN)" name="nameZhCN" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Name (TW)" name="nameZhTW" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Name (EN)" name="nameEn" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Code" name="code" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Level" name="level" rules={[{ required: true }]}><InputNumber min={1} max={10} style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="Minimum Stamps Required" name="minStamps" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TierSettings;
