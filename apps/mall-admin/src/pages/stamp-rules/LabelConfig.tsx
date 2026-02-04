import React, { useState } from 'react';
import { Card, Typography, Table, Tag, Button, Space, Modal, Form, Input, Select, ColorPicker, Row, Col, Popconfirm, message, Alert } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TagOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';

const { Title, Text } = Typography;

interface LabelItem {
  key: string;
  id: string;
  nameZhCN: string;
  nameZhTW: string;
  nameEn: string;
  category: string;
  color: string;
  memberCount: number;
  purpose: string;
  status: string;
  createdAt: string;
}

const mockLabels: LabelItem[] = [
  { key: '1', id: 'lbl-001', nameZhCN: 'CNY活动', nameZhTW: 'CNY活動', nameEn: 'CNY Campaign', category: 'campaign', color: '#f50', memberCount: 1250, purpose: '追踪春节活动参与会员，便于后续分析活动效果', status: 'active', createdAt: '2024-01-01' },
  { key: '2', id: 'lbl-002', nameZhCN: '高消费用户', nameZhTW: '高消費用戶', nameEn: 'High Spender', category: 'segment', color: '#faad14', memberCount: 860, purpose: '月消费超过 HKD 5,000 的会员，用于精准营销', status: 'active', createdAt: '2023-12-15' },
  { key: '3', id: 'lbl-003', nameZhCN: '生日月', nameZhTW: '生日月', nameEn: 'Birthday Month', category: 'lifecycle', color: '#eb2f96', memberCount: 320, purpose: '当月生日会员，触发生日优惠推送', status: 'active', createdAt: '2023-11-01' },
  { key: '4', id: 'lbl-004', nameZhCN: '员工推荐', nameZhTW: '員工推薦', nameEn: 'Staff Referral', category: 'acquisition', color: '#1890ff', memberCount: 450, purpose: '通过员工推荐注册的会员，评估推荐计划效果', status: 'active', createdAt: '2023-10-01' },
  { key: '5', id: 'lbl-005', nameZhCN: '沉睡用户', nameZhTW: '沉睡用戶', nameEn: 'Dormant', category: 'lifecycle', color: '#8c8c8c', memberCount: 2100, purpose: '30天未活跃会员，用于唤醒营销', status: 'active', createdAt: '2023-09-15' },
  { key: '6', id: 'lbl-006', nameZhCN: '内地游客', nameZhTW: '內地遊客', nameEn: 'Mainland Tourist', category: 'segment', color: '#13c2c2', memberCount: 1680, purpose: '来自内地的会员，分析跨境消费行为', status: 'active', createdAt: '2023-08-01' },
];

const LabelConfig: React.FC = () => {
  const { t } = useLocale();
  const [editModal, setEditModal] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<LabelItem | null>(null);
  const [form] = Form.useForm();

  const categoryOptions = [
    { value: 'campaign', label: t('common.details') === '详情' ? '活动' : 'Campaign' },
    { value: 'segment', label: t('common.details') === '详情' ? '细分' : 'Segment' },
    { value: 'lifecycle', label: t('common.details') === '详情' ? '生命周期' : 'Lifecycle' },
    { value: 'acquisition', label: t('common.details') === '详情' ? '获客' : 'Acquisition' },
    { value: 'behavior', label: t('common.details') === '详情' ? '行为' : 'Behavior' },
    { value: 'custom', label: t('common.details') === '详情' ? '自定义' : 'Custom' },
  ];

  const columns: ColumnsType<LabelItem> = [
    {
      title: t('common.details') === '详情' ? '标签' : 'Label',
      key: 'name',
      width: 160,
      render: (_, record) => (
        <Tag color={record.color} icon={<TagOutlined />}>{record.nameZhCN}</Tag>
      ),
    },
    {
      title: t('common.details') === '详情' ? '英文名' : 'English',
      dataIndex: 'nameEn',
      key: 'nameEn',
      width: 140,
    },
    {
      title: t('common.details') === '详情' ? '分类' : 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (cat: string) => {
        const option = categoryOptions.find((o) => o.value === cat);
        return <Tag>{option?.label || cat}</Tag>;
      },
      filters: categoryOptions.map((o) => ({ text: o.label, value: o.value })),
    },
    {
      title: t('common.details') === '详情' ? '用途说明' : 'Purpose',
      dataIndex: 'purpose',
      key: 'purpose',
      ellipsis: true,
    },
    {
      title: t('common.details') === '详情' ? '标记会员数' : 'Members Tagged',
      dataIndex: 'memberCount',
      key: 'memberCount',
      width: 120,
      render: (v: number) => v.toLocaleString(),
      sorter: (a, b) => a.memberCount - b.memberCount,
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => <Tag color={status === 'active' ? 'green' : 'default'}>{status}</Tag>,
    },
    {
      title: t('common.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 140,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedLabel(record);
              form.setFieldsValue(record);
              setEditModal(true);
            }}
          />
          <Popconfirm
            title={t('common.delete') + '?'}
            onConfirm={() => message.success(t('common.success'))}
          >
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
          <Title level={4}>{t('member.labelConfig')}</Title>
          <Text type="secondary">
            {t('common.details') === '详情'
              ? '标签配置用于方便后续营销活动分析与追踪'
              : 'Label configuration for easy post-campaign analysis and tracking'}
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setSelectedLabel(null);
            form.resetFields();
            setEditModal(true);
          }}
        >
          {t('common.add')}
        </Button>
      </div>

      <Alert
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        message={t('common.details') === '详情' ? '标签用于方便后续活动分析/追踪，可以为不同营销活动、会员细分等场景创建标签' : 'Labels help with post-campaign analysis and tracking across different marketing campaigns and member segments'}
        style={{ marginBottom: 16 }}
      />

      <Card>
        <Table
          columns={columns}
          dataSource={mockLabels}
          pagination={{
            total: mockLabels.length,
            pageSize: 10,
            showTotal: (total) => t('common.total', { total }),
          }}
        />
      </Card>

      <Modal
        title={selectedLabel ? t('common.edit') : t('common.add')}
        open={editModal}
        onCancel={() => setEditModal(false)}
        onOk={() => {
          form.validateFields().then(() => {
            message.success(t('common.success'));
            setEditModal(false);
          });
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="nameZhCN" label={t('common.details') === '详情' ? '名称(简体)' : 'Name (CN)'} rules={[{ required: true }]}>
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
          <Form.Item name="category" label={t('common.details') === '详情' ? '分类' : 'Category'} rules={[{ required: true }]}>
            <Select options={categoryOptions} />
          </Form.Item>
          <Form.Item name="color" label={t('common.details') === '详情' ? '颜色' : 'Color'}>
            <Input type="color" style={{ width: 60, height: 32 }} />
          </Form.Item>
          <Form.Item name="purpose" label={t('common.details') === '详情' ? '用途说明' : 'Purpose'} rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder={t('common.details') === '详情' ? '描述此标签的用途，便于后续分析追踪' : 'Describe the purpose for post-campaign analysis/tracking'} />
          </Form.Item>
          <Form.Item name="status" label={t('common.status')}>
            <Select
              options={[
                { value: 'active', label: t('common.active') },
                { value: 'inactive', label: t('common.inactive') },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LabelConfig;
