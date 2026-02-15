import React, { useState } from 'react';
import { Card, Typography, Table, Tag, Button, Space, Modal, Form, Input, InputNumber, ColorPicker, Row, Col, Descriptions, List, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, CrownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';

const { Title, Text } = Typography;

interface TierItem {
  key: string;
  id: string;
  name: string;
  nameZhTW: string;
  nameEn: string;
  code: string;
  level: number;
  minStamps: number;
  color: string;
  memberCount: number;
  benefits: { type: string; name: string; value: string }[];
  status: string;
}

const mockTiers: TierItem[] = [
  { key: '1', id: 'tier-green', name: 'Green', nameZhTW: '綠色', nameEn: 'Green', code: 'GREEN', level: 1, minStamps: 0, color: '#52c41a', memberCount: 12840, benefits: [{ type: 'stamp-multiplier', name: '1x Stamps', value: '1' }], status: 'active' },
  { key: '2', id: 'tier-silver', name: 'Silver', nameZhTW: '銀色', nameEn: 'Silver', code: 'SILVER', level: 2, minStamps: 3000, color: '#8c8c8c', memberCount: 5620, benefits: [{ type: 'stamp-multiplier', name: '1.5x Stamps', value: '1.5' }, { type: 'free-parking', name: '2hr Free Parking', value: '2' }], status: 'active' },
  { key: '3', id: 'tier-gold', name: 'Gold', nameZhTW: '金色', nameEn: 'Gold', code: 'GOLD', level: 3, minStamps: 10000, color: '#faad14', memberCount: 2180, benefits: [{ type: 'stamp-multiplier', name: '2x Stamps', value: '2' }, { type: 'free-parking', name: '3hr Free Parking', value: '3' }, { type: 'lounge-access', name: 'Lounge Access', value: 'true' }], status: 'active' },
  { key: '4', id: 'tier-platinum', name: 'Platinum', nameZhTW: '白金', nameEn: 'Platinum', code: 'PLATINUM', level: 4, minStamps: 30000, color: '#722ed1', memberCount: 860, benefits: [{ type: 'stamp-multiplier', name: '3x Stamps', value: '3' }, { type: 'free-parking', name: '4hr Free Parking', value: '4' }, { type: 'lounge-access', name: 'VIP Lounge', value: 'true' }, { type: 'priority-service', name: 'Priority Service', value: 'true' }], status: 'active' },
];

const TierSettings: React.FC = () => {
  const { t } = useLocale();
  const [editModal, setEditModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<TierItem | null>(null);
  const [form] = Form.useForm();

  const columns: ColumnsType<TierItem> = [
    {
      title: t('common.details') === '详情' ? '等级' : 'Level',
      dataIndex: 'level',
      key: 'level',
      width: 60,
      render: (level: number) => <Text strong>{level}</Text>,
    },
    {
      title: t('common.details') === '详情' ? '名称' : 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 140,
      render: (name: string, record) => (
        <Space>
          <Tag color={record.color} icon={<CrownOutlined />}>{name}</Tag>
        </Space>
      ),
    },
    {
      title: t('common.details') === '详情' ? '编码' : 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 100,
    },
    {
      title: t('common.details') === '详情' ? '最低积分' : 'Min Stamps',
      dataIndex: 'minStamps',
      key: 'minStamps',
      width: 120,
      render: (v: number) => v.toLocaleString(),
    },
    {
      title: t('common.details') === '详情' ? '会员数' : 'Members',
      dataIndex: 'memberCount',
      key: 'memberCount',
      width: 100,
      render: (v: number) => v.toLocaleString(),
    },
    {
      title: t('member.tierBenefit'),
      dataIndex: 'benefits',
      key: 'benefits',
      render: (benefits: TierItem['benefits']) => (
        <Space wrap>
          {benefits.map((b, i) => (
            <Tag key={i} color="blue">{b.name}</Tag>
          ))}
        </Space>
      ),
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
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => {
            setSelectedTier(record);
            form.setFieldsValue(record);
            setEditModal(true);
          }}
        >
          {t('common.edit')}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>
          {t('common.details') === '详情' ? '等级设置' : t('common.details') === '詳情' ? '等級設置' : 'Tier Settings'}
        </Title>
        <Button type="primary" icon={<PlusOutlined />}>
          {t('common.add')}
        </Button>
      </div>

      {/* Tier progression visualization */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '16px 0' }}>
          {mockTiers.map((tier, index) => (
            <React.Fragment key={tier.id}>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: tier.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px',
                  }}
                >
                  <CrownOutlined style={{ fontSize: 24, color: '#fff' }} />
                </div>
                <Text strong>{tier.name}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {tier.minStamps.toLocaleString()} stamps
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {tier.memberCount.toLocaleString()} members
                </Text>
              </div>
              {index < mockTiers.length - 1 && (
                <ArrowUpOutlined style={{ fontSize: 24, color: '#d9d9d9', transform: 'rotate(90deg)' }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </Card>

      <Card>
        <Table columns={columns} dataSource={mockTiers} pagination={false} />
      </Card>

      <Modal
        title={t('common.details') === '详情' ? '编辑等级' : 'Edit Tier'}
        open={editModal}
        onCancel={() => setEditModal(false)}
        onOk={() => {
          form.validateFields().then(() => {
            message.success(t('common.success'));
            setEditModal(false);
          });
        }}
        width={640}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="name" label={t('common.details') === '详情' ? '名称(中文)' : 'Name (CN)'} rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="nameZhTW" label={t('common.details') === '详情' ? '名称(繁体)' : 'Name (TW)'}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="nameEn" label={t('common.details') === '详情' ? '名称(英文)' : 'Name (EN)'}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="code" label={t('common.details') === '详情' ? '编码' : 'Code'} rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="level" label={t('common.details') === '详情' ? '等级序号' : 'Level'} rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="minStamps" label={t('common.details') === '详情' ? '最低积分' : 'Min Stamps'} rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} step={1000} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="status" label={t('common.status')}>
            <Select options={[{ value: 'active', label: t('common.active') }, { value: 'inactive', label: t('common.inactive') }]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TierSettings;
