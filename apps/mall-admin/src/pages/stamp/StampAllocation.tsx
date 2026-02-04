import React, { useState } from 'react';
import { Card, Table, Typography, Tag, Space, Button, Input, Select, Row, Col, Statistic, Progress, Modal, Form, InputNumber, Divider } from 'antd';
import { PieChartOutlined, EditOutlined, HistoryOutlined, SyncOutlined } from '@ant-design/icons';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';

const { Title, Text } = Typography;

interface AllocationItem {
  key: string;
  category: string;
  categoryName: string;
  allocated: number;
  used: number;
  remaining: number;
  percentage: number;
  color: string;
  lastUpdated: string;
}

const mockAllocations: AllocationItem[] = [
  { key: '1', category: 'consumption', categoryName: '消费积分', allocated: 500000, used: 312500, remaining: 187500, percentage: 62.5, color: '#1890ff', lastUpdated: '2024-01-26' },
  { key: '2', category: 'campaign', categoryName: '活动积分', allocated: 200000, used: 98000, remaining: 102000, percentage: 49.0, color: '#722ed1', lastUpdated: '2024-01-26' },
  { key: '3', category: 'bonus', categoryName: '赠送积分', allocated: 100000, used: 45000, remaining: 55000, percentage: 45.0, color: '#52c41a', lastUpdated: '2024-01-25' },
  { key: '4', category: 'adjustment', categoryName: '调整积分', allocated: 50000, used: 12800, remaining: 37200, percentage: 25.6, color: '#faad14', lastUpdated: '2024-01-24' },
  { key: '5', category: 'online-activity', categoryName: '线上活跃积分', allocated: 80000, used: 34200, remaining: 45800, percentage: 42.8, color: '#13c2c2', lastUpdated: '2024-01-26' },
];

const monthlyTrend = [
  { month: '2024-07', consumption: 42000, campaign: 12000, bonus: 5000, online: 4500 },
  { month: '2024-08', consumption: 45000, campaign: 15000, bonus: 6000, online: 5200 },
  { month: '2024-09', consumption: 38000, campaign: 8000, bonus: 4500, online: 4800 },
  { month: '2024-10', consumption: 52000, campaign: 18000, bonus: 7000, online: 6100 },
  { month: '2024-11', consumption: 48000, campaign: 22000, bonus: 5500, online: 5800 },
  { month: '2024-12', consumption: 55000, campaign: 25000, bonus: 8000, online: 7500 },
  { month: '2025-01', consumption: 32500, campaign: 9800, bonus: 4500, online: 3420 },
];

const StampAllocation: React.FC = () => {
  const { t } = useLocale();
  const [editModal, setEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AllocationItem | null>(null);
  const [editForm] = Form.useForm();

  const totalAllocated = mockAllocations.reduce((s, a) => s + a.allocated, 0);
  const totalUsed = mockAllocations.reduce((s, a) => s + a.used, 0);
  const totalRemaining = mockAllocations.reduce((s, a) => s + a.remaining, 0);

  const pieData = mockAllocations.map((a) => ({
    name: a.categoryName,
    value: a.used,
    color: a.color,
  }));

  const columns: ColumnsType<AllocationItem> = [
    {
      title: t('common.details') === '详情' ? '类别' : 'Category',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 140,
      render: (name: string, record) => (
        <Space>
          <div style={{ width: 12, height: 12, borderRadius: 2, background: record.color }} />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: t('common.details') === '详情' ? '分配额度' : 'Allocated',
      dataIndex: 'allocated',
      key: 'allocated',
      width: 130,
      render: (v: number) => v.toLocaleString(),
      sorter: (a, b) => a.allocated - b.allocated,
    },
    {
      title: t('common.details') === '详情' ? '已使用' : 'Used',
      dataIndex: 'used',
      key: 'used',
      width: 120,
      render: (v: number) => v.toLocaleString(),
      sorter: (a, b) => a.used - b.used,
    },
    {
      title: t('common.details') === '详情' ? '剩余' : 'Remaining',
      dataIndex: 'remaining',
      key: 'remaining',
      width: 120,
      render: (v: number) => <Text type={v < 10000 ? 'danger' : undefined}>{v.toLocaleString()}</Text>,
    },
    {
      title: t('common.details') === '详情' ? '使用率' : 'Usage',
      dataIndex: 'percentage',
      key: 'percentage',
      width: 200,
      render: (v: number) => (
        <Progress
          percent={v}
          size="small"
          strokeColor={v > 80 ? '#ff4d4f' : v > 60 ? '#faad14' : '#52c41a'}
          format={(p) => `${p?.toFixed(1)}%`}
        />
      ),
    },
    {
      title: t('common.updatedAt'),
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      width: 120,
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedItem(record);
              editForm.setFieldsValue({ allocated: record.allocated });
              setEditModal(true);
            }}
          >
            {t('common.edit')}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4}>
        {t('common.details') === '详情' ? '积分库间分摊' : t('common.details') === '詳情' ? '積分庫間分攤' : 'Stamp Allocation'}
      </Title>

      {/* Summary stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={8}>
          <Card size="small">
            <Statistic title={t('common.details') === '详情' ? '总分配额度' : 'Total Allocated'} value={totalAllocated} suffix={t('stamp.stamp')} />
          </Card>
        </Col>
        <Col xs={8}>
          <Card size="small">
            <Statistic title={t('common.details') === '详情' ? '已使用' : 'Total Used'} value={totalUsed} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col xs={8}>
          <Card size="small">
            <Statistic title={t('common.details') === '详情' ? '剩余' : 'Remaining'} value={totalRemaining} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Pie chart */}
        <Col xs={24} lg={8}>
          <Card title={t('common.details') === '详情' ? '分摊占比' : 'Allocation Distribution'} size="small">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                  label={(entry) => entry.name}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => value.toLocaleString()} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Monthly trend */}
        <Col xs={24} lg={16}>
          <Card title={t('common.details') === '详情' ? '月度分摊趋势' : 'Monthly Trend'} size="small">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="consumption" name={t('common.details') === '详情' ? '消费' : 'Consumption'} fill="#1890ff" stackId="a" />
                <Bar dataKey="campaign" name={t('campaign.campaign')} fill="#722ed1" stackId="a" />
                <Bar dataKey="bonus" name={t('stamp.bonus')} fill="#52c41a" stackId="a" />
                <Bar dataKey="online" name={t('common.details') === '详情' ? '线上活跃' : 'Online'} fill="#13c2c2" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Allocation table */}
      <Card
        title={t('common.details') === '详情' ? '分摊明细' : 'Allocation Details'}
        extra={
          <Space>
            <Button icon={<SyncOutlined />}>{t('common.details') === '详情' ? '刷新' : 'Refresh'}</Button>
            <Button icon={<HistoryOutlined />}>{t('common.details') === '详情' ? '历史记录' : 'History'}</Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={mockAllocations}
          pagination={false}
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0}><Text strong>{t('common.details') === '详情' ? '合计' : 'Total'}</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={1}><Text strong>{totalAllocated.toLocaleString()}</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={2}><Text strong>{totalUsed.toLocaleString()}</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={3}><Text strong>{totalRemaining.toLocaleString()}</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={4}>
                <Progress percent={Number(((totalUsed / totalAllocated) * 100).toFixed(1))} size="small" />
              </Table.Summary.Cell>
              <Table.Summary.Cell index={5} colSpan={2} />
            </Table.Summary.Row>
          )}
        />
      </Card>

      {/* Edit allocation modal */}
      <Modal
        title={t('common.details') === '详情' ? '修改分配额度' : 'Edit Allocation'}
        open={editModal}
        onCancel={() => setEditModal(false)}
        onOk={() => {
          editForm.validateFields().then(() => setEditModal(false));
        }}
      >
        {selectedItem && (
          <Form form={editForm} layout="vertical">
            <Form.Item label={t('common.details') === '详情' ? '类别' : 'Category'}>
              <Text strong>{selectedItem.categoryName}</Text>
            </Form.Item>
            <Form.Item label={t('common.details') === '详情' ? '当前已使用' : 'Currently Used'}>
              <Text>{selectedItem.used.toLocaleString()}</Text>
            </Form.Item>
            <Form.Item name="allocated" label={t('common.details') === '详情' ? '新分配额度' : 'New Allocation'} rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} min={selectedItem.used} step={10000} />
            </Form.Item>
            <Form.Item name="reason" label={t('common.details') === '详情' ? '调整原因' : 'Reason'}>
              <Input.TextArea rows={2} />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default StampAllocation;
