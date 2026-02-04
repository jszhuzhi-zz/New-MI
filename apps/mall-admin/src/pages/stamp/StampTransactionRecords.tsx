import React from 'react';
import { Card, Table, Typography, Tag, Space, Button, Input, Select, Row, Col, DatePicker, Statistic } from 'antd';
import { SearchOutlined, ExportOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface TransactionRecord {
  key: string;
  id: string;
  referenceNo: string;
  memberCardNo: string;
  memberName: string;
  type: string;
  amount: number;
  balanceAfter: number;
  source: string;
  merchantName: string;
  receiptId: string;
  campaignName: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

const mockTransactions: TransactionRecord[] = [
  { key: '1', id: 'TXN-2024-001', referenceNo: 'REF-001', memberCardNo: 'MC-20240001', memberName: 'Alice Wong', type: 'earn', amount: 120, balanceAfter: 2450, source: 'receipt-scan', merchantName: 'UNIQLO', receiptId: 'R-0826', campaignName: '-', status: 'completed', expiresAt: '2025-01-26', createdAt: '2024-01-26 14:35' },
  { key: '2', id: 'TXN-2024-002', referenceNo: 'REF-002', memberCardNo: 'MC-20240002', memberName: 'Bob Li', type: 'redeem', amount: -50, balanceAfter: 5680, source: 'counter', merchantName: '-', receiptId: '-', campaignName: '-', status: 'completed', expiresAt: '-', createdAt: '2024-01-26 13:20' },
  { key: '3', id: 'TXN-2024-003', referenceNo: 'REF-003', memberCardNo: 'MC-20240006', memberName: 'Frank Zhao', type: 'bonus', amount: 250, balanceAfter: 1560, source: 'campaign', merchantName: '-', receiptId: '-', campaignName: 'Double Stamps Weekend', status: 'completed', expiresAt: '2025-01-26', createdAt: '2024-01-26 11:00' },
  { key: '4', id: 'TXN-2024-004', referenceNo: 'REF-004', memberCardNo: 'MC-20240007', memberName: 'Grace Ho', type: 'earn', amount: 45, balanceAfter: 4100, source: 'manual-entry', merchantName: 'Watson', receiptId: 'R-0829', campaignName: '-', status: 'completed', expiresAt: '2025-01-26', createdAt: '2024-01-26 10:20' },
  { key: '5', id: 'TXN-2024-005', referenceNo: 'REF-005', memberCardNo: 'MC-20240003', memberName: 'Carol Chan', type: 'expire', amount: -580, balanceAfter: 890, source: 'system-adjust', merchantName: '-', receiptId: '-', campaignName: '-', status: 'completed', expiresAt: '-', createdAt: '2024-01-24 00:01' },
  { key: '6', id: 'TXN-2024-006', referenceNo: 'REF-006', memberCardNo: 'MC-20240004', memberName: 'David Lam', type: 'earn', amount: 30, balanceAfter: 120, source: 'counter', merchantName: 'McDonald\'s', receiptId: 'R-0831', campaignName: '-', status: 'pending', expiresAt: '2025-01-26', createdAt: '2024-01-26 15:10' },
  { key: '7', id: 'TXN-2024-007', referenceNo: 'REF-007', memberCardNo: 'MC-20240002', memberName: 'Bob Li', type: 'adjust', amount: 100, balanceAfter: 5780, source: 'system-adjust', merchantName: '-', receiptId: '-', campaignName: '-', status: 'completed', expiresAt: '2025-01-25', createdAt: '2024-01-25 16:00' },
  { key: '8', id: 'TXN-2024-008', referenceNo: 'REF-008', memberCardNo: 'MC-20240005', memberName: 'Eva Ng', type: 'earn', amount: 85, balanceAfter: 3200, source: 'receipt-scan', merchantName: 'Zara', receiptId: 'R-0825', campaignName: 'CNY Lucky Draw', status: 'rejected', expiresAt: '-', createdAt: '2024-01-25 14:30' },
];

const StampTransactionRecords: React.FC = () => {
  const { t } = useLocale();

  const typeColors: Record<string, string> = {
    earn: 'green',
    redeem: 'blue',
    bonus: 'purple',
    adjust: 'orange',
    expire: 'red',
    transfer: 'cyan',
    refund: 'gold',
  };

  const typeLabels: Record<string, string> = {
    earn: t('stamp.earn'),
    redeem: t('stamp.redeem'),
    bonus: t('stamp.bonus'),
    adjust: t('stamp.adjust'),
    expire: t('stamp.expire'),
    transfer: t('stamp.transfer'),
    refund: t('stamp.refund'),
  };

  const statusColors: Record<string, string> = {
    pending: 'orange',
    approved: 'cyan',
    rejected: 'red',
    completed: 'green',
    cancelled: 'default',
    expired: 'default',
  };

  const columns: ColumnsType<TransactionRecord> = [
    { title: t('common.details') === '详情' ? '交易ID' : 'TXN ID', dataIndex: 'id', key: 'id', width: 140 },
    { title: t('member.memberCardNo'), dataIndex: 'memberCardNo', key: 'memberCardNo', width: 140 },
    { title: t('member.displayName'), dataIndex: 'memberName', key: 'memberName', width: 120 },
    {
      title: t('common.details') === '详情' ? '类型' : 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 90,
      render: (type: string) => <Tag color={typeColors[type]}>{typeLabels[type]}</Tag>,
      filters: Object.entries(typeLabels).map(([value, text]) => ({ text, value })),
    },
    {
      title: t('common.details') === '详情' ? '数量' : 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
      render: (v: number) => (
        <Text strong style={{ color: v >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {v >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(v)}
        </Text>
      ),
      sorter: true,
    },
    {
      title: t('common.details') === '详情' ? '交易后余额' : 'Balance After',
      dataIndex: 'balanceAfter',
      key: 'balanceAfter',
      width: 120,
      render: (v: number) => v.toLocaleString(),
    },
    {
      title: t('common.details') === '详情' ? '来源' : 'Source',
      dataIndex: 'source',
      key: 'source',
      width: 110,
      render: (source: string) => {
        const labels: Record<string, string> = {
          'receipt-scan': t('stamp.receiptScan'),
          'manual-entry': t('stamp.manualEntry'),
          'auto-sync': t('stamp.autoSync'),
          counter: t('stamp.counter'),
          campaign: t('campaign.campaign'),
          'system-adjust': t('common.details') === '详情' ? '系统调整' : 'System Adjust',
        };
        return labels[source] || source;
      },
    },
    { title: t('merchant.merchant'), dataIndex: 'merchantName', key: 'merchantName', width: 120 },
    {
      title: t('common.details') === '详情' ? '活动' : 'Campaign',
      dataIndex: 'campaignName',
      key: 'campaignName',
      width: 160,
      render: (v: string) => v === '-' ? '-' : <Tag color="purple">{v}</Tag>,
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => <Tag color={statusColors[status]}>{status}</Tag>,
    },
    {
      title: t('common.details') === '详情' ? '到期日' : 'Expires',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      width: 110,
    },
    {
      title: t('common.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      sorter: true,
    },
  ];

  const totalEarned = mockTransactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalSpent = mockTransactions.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div>
      <Title level={4}>{t('stamp.stampTransactionRecord')}</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic title={t('common.details') === '详情' ? '总交易数' : 'Total Transactions'} value={mockTransactions.length} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic title={t('common.details') === '详情' ? '总发放' : 'Total Earned'} value={totalEarned} valueStyle={{ color: '#52c41a' }} prefix={<ArrowUpOutlined />} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic title={t('common.details') === '详情' ? '总消耗' : 'Total Spent'} value={totalSpent} valueStyle={{ color: '#ff4d4f' }} prefix={<ArrowDownOutlined />} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic title={t('common.details') === '详情' ? '净变动' : 'Net Change'} value={totalEarned - totalSpent} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <Input placeholder={t('member.memberSearch')} prefix={<SearchOutlined />} allowClear />
          </Col>
          <Col xs={24} md={4}>
            <Select
              placeholder={t('common.details') === '详情' ? '交易类型' : 'Type'}
              style={{ width: '100%' }}
              allowClear
              options={Object.entries(typeLabels).map(([value, label]) => ({ value, label }))}
            />
          </Col>
          <Col xs={24} md={4}>
            <Select
              placeholder={t('common.status')}
              style={{ width: '100%' }}
              allowClear
              options={[
                { value: 'completed', label: t('stamp.completed') },
                { value: 'pending', label: t('stamp.pending') },
                { value: 'rejected', label: t('stamp.rejected') },
              ]}
            />
          </Col>
          <Col xs={24} md={6}>
            <RangePicker style={{ width: '100%' }} />
          </Col>
          <Col xs={24} md={4}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />}>{t('common.search')}</Button>
              <Button icon={<ExportOutlined />}>{t('common.export')}</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={mockTransactions}
          scroll={{ x: 1700 }}
          pagination={{
            total: mockTransactions.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => t('common.total', { total }),
          }}
        />
      </Card>
    </div>
  );
};

export default StampTransactionRecords;
