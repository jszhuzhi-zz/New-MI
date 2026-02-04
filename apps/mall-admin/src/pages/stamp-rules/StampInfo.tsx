import React, { useState } from 'react';
import { Card, Typography, Table, Button, Space, Modal, Form, Input, InputNumber, Switch, Tag, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface StampInfoItem {
  key: string;
  id: string;
  nameZhCN: string;
  nameZhTW: string;
  nameEn: string;
  descriptionZhCN: string;
  descriptionZhTW: string;
  descriptionEn: string;
  displayOrder: number;
  status: string;
}

const mockItems: StampInfoItem[] = [
  { key: '1', id: 'si-001', nameZhCN: '积分获取规则', nameZhTW: '積分獲取規則', nameEn: 'Stamp Earning Rules', descriptionZhCN: '每消费 HKD 10 可获得 1 印花积分。', descriptionZhTW: '每消費 HKD 10 可獲得 1 印花積分。', descriptionEn: 'Earn 1 stamp for every HKD 10 spent.', displayOrder: 1, status: 'active' },
  { key: '2', id: 'si-002', nameZhCN: '积分有效期', nameZhTW: '積分有效期', nameEn: 'Stamp Validity', descriptionZhCN: '积分自获取之日起 12 个月内有效。过期积分将自动清零。', descriptionZhTW: '積分自獲取之日起 12 個月內有效。過期積分將自動清零。', descriptionEn: 'Stamps are valid for 12 months from the date of earning. Expired stamps will be cleared automatically.', displayOrder: 2, status: 'active' },
  { key: '3', id: 'si-003', nameZhCN: '积分兑换', nameZhTW: '積分兌換', nameEn: 'Stamp Redemption', descriptionZhCN: '积分可用于兑换礼品、停车券及商场优惠。', descriptionZhTW: '積分可用於兌換禮品、停車券及商場優惠。', descriptionEn: 'Stamps can be used to redeem gifts, parking vouchers, and mall offers.', displayOrder: 3, status: 'active' },
  { key: '4', id: 'si-004', nameZhCN: '等级提升', nameZhTW: '等級提升', nameEn: 'Tier Upgrade', descriptionZhCN: '累计达到指定积分即可自动升级会员等级，享受更多权益。', descriptionZhTW: '累計達到指定積分即可自動升級會員等級，享受更多權益。', descriptionEn: 'Reach specified stamp thresholds to automatically upgrade tier and enjoy more benefits.', displayOrder: 4, status: 'active' },
  { key: '5', id: 'si-005', nameZhCN: '特殊说明', nameZhTW: '特殊說明', nameEn: 'Special Notes', descriptionZhCN: '部分商户可能不参与积分计划。详情请咨询客服台。', descriptionZhTW: '部分商戶可能不參與積分計劃。詳情請諮詢客服台。', descriptionEn: 'Some merchants may not participate in the stamp program. Please check with the service counter.', displayOrder: 5, status: 'active' },
];

const StampInfo: React.FC = () => {
  const { t } = useLocale();
  const [editModal, setEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StampInfoItem | null>(null);
  const [form] = Form.useForm();

  const columns: ColumnsType<StampInfoItem> = [
    {
      title: t('common.details') === '详情' ? '排序' : 'Order',
      dataIndex: 'displayOrder',
      key: 'displayOrder',
      width: 80,
      sorter: (a, b) => a.displayOrder - b.displayOrder,
    },
    {
      title: t('common.details') === '详情' ? '名称(中文)' : 'Name (CN)',
      dataIndex: 'nameZhCN',
      key: 'nameZhCN',
      width: 150,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: t('common.details') === '详情' ? '名称(英文)' : 'Name (EN)',
      dataIndex: 'nameEn',
      key: 'nameEn',
      width: 160,
    },
    {
      title: t('common.details') === '详情' ? '描述' : 'Description',
      dataIndex: 'descriptionZhCN',
      key: 'description',
      ellipsis: true,
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
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => {
            setSelectedItem(record);
            form.setFieldsValue(record);
            setEditModal(true);
          }} />
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
        <Title level={4}>{t('stamp.stampInfo')}</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setSelectedItem(null); form.resetFields(); setEditModal(true); }}>
          {t('common.add')}
        </Button>
      </div>

      <Card>
        <Table columns={columns} dataSource={mockItems} pagination={false} />
      </Card>

      <Modal
        title={selectedItem ? t('common.edit') + ' ' + t('stamp.stampInfo') : t('common.add') + ' ' + t('stamp.stampInfo')}
        open={editModal}
        onCancel={() => setEditModal(false)}
        onOk={() => { form.validateFields().then(() => { message.success(t('common.success')); setEditModal(false); }); }}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item label={t('common.details') === '详情' ? '名称' : 'Name'}>
            <Space.Compact style={{ width: '100%' }}>
              <Form.Item name="nameZhCN" noStyle rules={[{ required: true }]}><Input placeholder="简体中文" style={{ width: '33%' }} /></Form.Item>
              <Form.Item name="nameZhTW" noStyle><Input placeholder="繁體中文" style={{ width: '33%' }} /></Form.Item>
              <Form.Item name="nameEn" noStyle><Input placeholder="English" style={{ width: '34%' }} /></Form.Item>
            </Space.Compact>
          </Form.Item>
          <Form.Item name="descriptionZhCN" label={t('common.details') === '详情' ? '描述(简体)' : 'Description (CN)'} rules={[{ required: true }]}>
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item name="descriptionZhTW" label={t('common.details') === '详情' ? '描述(繁体)' : 'Description (TW)'}>
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item name="descriptionEn" label={t('common.details') === '详情' ? '描述(英文)' : 'Description (EN)'}>
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item name="displayOrder" label={t('common.details') === '详情' ? '排序' : 'Display Order'}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StampInfo;
