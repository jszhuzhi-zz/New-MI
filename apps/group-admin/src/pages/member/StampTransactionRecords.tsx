import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Space, Input, Select, DatePicker, Button, Typography, Tooltip } from 'antd';
import { SearchOutlined, ExportOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';
import { useAppStore } from '../../store/app';

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface TransactionRow {
  id: string;
  referenceNo: string;
  memberId: string;
  memberName: string;
  cardNo: string;
  type: string;
  amount: number;
  balanceAfter: number;
  source: string;
  status: string;
  project: string;
  merchant?: string;
  operatorType: string;
  createdAt: string;
}

const mockTransactions: TransactionRow[] = [
  { id: 'TXN001', referenceNo: 'REF20260204001', memberId: 'M001', memberName: 'Chan Tai Man', cardNo: 'LR000000001234', type: 'earn', amount: 250, balanceAfter: 2450, source: 'receipt-scan', status: 'completed', project: 'T Town', merchant: 'UNIQLO', operatorType: 'system', createdAt: '2026-02-04 10:15:32' },
  { id: 'TXN002', referenceNo: 'REF20260204002', memberId: 'M002', memberName: 'Wong Siu Ming', cardNo: 'LR000000001235', type: 'earn', amount: 520, balanceAfter: 8920, source: 'receipt-scan', status: 'completed', project: 'LOHAS Park', merchant: 'Taste', operatorType: 'system', createdAt: '2026-02-04 09:48:11' },
  { id: 'TXN003', referenceNo: 'REF20260204003', memberId: 'M003', memberName: 'Li Ka Yan', cardNo: 'LR000000001236', type: 'redeem', amount: -50, balanceAfter: 780, source: 'counter', status: 'completed', project: 'Temple Mall', operatorType: 'staff', createdAt: '2026-02-04 09:22:45' },
  { id: 'TXN004', referenceNo: 'REF20260203004', memberId: 'M004', memberName: 'Cheung Mei Ling', cardNo: 'LR000000001237', type: 'bonus', amount: 400, balanceAfter: 15600, source: 'campaign', status: 'completed', project: 'Maritime Bay', operatorType: 'system', createdAt: '2026-02-03 22:00:00' },
  { id: 'TXN005', referenceNo: 'REF20260203005', memberId: 'M005', memberName: 'Ng Wai Kit', cardNo: 'LR000000001238', type: 'earn', amount: 85, balanceAfter: 205, source: 'receipt-scan', status: 'pending', project: 'TKO Gateway', merchant: 'McDonald\'s', operatorType: 'system', createdAt: '2026-02-03 18:33:20' },
  { id: 'TXN006', referenceNo: 'REF20260203006', memberId: 'M006', memberName: 'Lam Hoi Yee', cardNo: 'LR000000001239', type: 'adjust', amount: -200, balanceAfter: 3200, source: 'system-adjust', status: 'completed', project: 'Stanley Plaza', operatorType: 'staff', createdAt: '2026-02-03 15:12:08' },
  { id: 'TXN007', referenceNo: 'REF20260203007', memberId: 'M007', memberName: 'Yip Chi Hung', cardNo: 'LR000000001240', type: 'expire', amount: -180, balanceAfter: 0, source: 'system-adjust', status: 'completed', project: 'Lok Fu Place', operatorType: 'system', createdAt: '2026-02-03 00:01:00' },
  { id: 'TXN008', referenceNo: 'REF20260202008', memberId: 'M008', memberName: 'Ho Wing Sze', cardNo: 'LR000000001241', type: 'earn', amount: 200, balanceAfter: 4100, source: 'manual-entry', status: 'approved', project: 'T Town', merchant: 'IKEA', operatorType: 'staff', createdAt: '2026-02-02 14:08:55' },
  { id: 'TXN009', referenceNo: 'REF20260202009', memberId: 'M001', memberName: 'Chan Tai Man', cardNo: 'LR000000001234', type: 'refund', amount: 150, balanceAfter: 2200, source: 'counter', status: 'completed', project: 'T Town', operatorType: 'staff', createdAt: '2026-02-02 11:45:30' },
];

const StampTransactionRecords: React.FC = () => {
  const { t } = useLocale();
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  useEffect(() => {
    setBreadcrumbs([
      { title: t('member.memberManagement'), path: '/member/cards' },
      { title: t('stamp.stampTransactionRecord') },
    ]);
  }, [setBreadcrumbs, t]);

  const filtered = mockTransactions.filter((r) => {
    const matchesSearch = !searchText ||
      r.memberName.toLowerCase().includes(searchText.toLowerCase()) ||
      r.cardNo.includes(searchText) ||
      r.referenceNo.includes(searchText);
    const matchesType = !typeFilter || r.type === typeFilter;
    const matchesStatus = !statusFilter || r.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const typeColors: Record<string, string> = { earn: 'green', redeem: 'blue', bonus: 'purple', adjust: 'orange', expire: 'default', transfer: 'cyan', refund: 'gold' };
  const statusColors: Record<string, string> = { pending: 'orange', approved: 'blue', rejected: 'red', completed: 'green', cancelled: 'default', expired: 'default' };

  const columns: ColumnsType<TransactionRow> = [
    { title: 'Reference', dataIndex: 'referenceNo', key: 'referenceNo', width: 170, render: (v: string) => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{v}</span> },
    { title: t('member.memberCardNo'), dataIndex: 'cardNo', key: 'cardNo', width: 160, render: (v: string) => <span style={{ fontFamily: 'monospace' }}>{v}</span> },
    { title: t('member.displayName'), dataIndex: 'memberName', key: 'memberName', width: 130 },
    {
      title: 'Type', dataIndex: 'type', key: 'type', width: 90,
      render: (type: string) => <Tag color={typeColors[type]}>{t(`stamp.${type}`)}</Tag>,
    },
    {
      title: t('stamp.stamp'), dataIndex: 'amount', key: 'amount', width: 100,
      render: (val: number) => (
        <span style={{ color: val >= 0 ? '#52c41a' : '#ff4d4f', fontWeight: 600 }}>
          {val >= 0 ? '+' : ''}{val}
        </span>
      ),
      sorter: (a, b) => a.amount - b.amount,
    },
    { title: 'Balance After', dataIndex: 'balanceAfter', key: 'balanceAfter', width: 110, render: (v: number) => v.toLocaleString() },
    {
      title: 'Source', dataIndex: 'source', key: 'source', width: 120,
      render: (source: string) => {
        const sourceMap: Record<string, string> = { 'receipt-scan': t('stamp.receiptScan'), 'manual-entry': t('stamp.manualEntry'), 'auto-sync': t('stamp.autoSync'), campaign: t('campaign.campaign'), 'system-adjust': t('stamp.adjust'), counter: t('stamp.counter') };
        return <Tag>{sourceMap[source] || source}</Tag>;
      },
    },
    {
      title: t('common.status'), dataIndex: 'status', key: 'status', width: 100,
      render: (status: string) => <Tag color={statusColors[status]}>{t(`stamp.${status}`) || status}</Tag>,
    },
    { title: t('organization.project'), dataIndex: 'project', key: 'project', width: 110 },
    { title: t('merchant.merchant'), dataIndex: 'merchant', key: 'merchant', width: 110, render: (v: string) => v || '-' },
    { title: t('common.createdAt'), dataIndex: 'createdAt', key: 'createdAt', width: 170, sorter: (a, b) => a.createdAt.localeCompare(b.createdAt), defaultSortOrder: 'descend' },
    {
      title: t('common.actions'), key: 'actions', width: 80, fixed: 'right',
      render: () => <Button type="link" icon={<EyeOutlined />} size="small">{t('common.details')}</Button>,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>{t('stamp.stampTransactionRecord')}</Title>
        <Button icon={<ExportOutlined />}>{t('common.export')}</Button>
      </div>

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input placeholder={t('common.search')} prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 260 }} allowClear />
          <Select
            placeholder="Type"
            value={typeFilter}
            onChange={setTypeFilter}
            style={{ width: 120 }}
            allowClear
            options={[
              { label: t('stamp.earn'), value: 'earn' },
              { label: t('stamp.redeem'), value: 'redeem' },
              { label: t('stamp.bonus'), value: 'bonus' },
              { label: t('stamp.adjust'), value: 'adjust' },
              { label: t('stamp.expire'), value: 'expire' },
              { label: t('stamp.refund'), value: 'refund' },
            ]}
          />
          <Select
            placeholder={t('common.status')}
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 130 }}
            allowClear
            options={[
              { label: t('stamp.pending'), value: 'pending' },
              { label: t('stamp.approved'), value: 'approved' },
              { label: t('stamp.completed'), value: 'completed' },
              { label: t('stamp.rejected'), value: 'rejected' },
            ]}
          />
          <RangePicker />
          <Button icon={<ReloadOutlined />} onClick={() => { setSearchText(''); setTypeFilter(undefined); setStatusFilter(undefined); }}>{t('common.reset')}</Button>
        </Space>

        <Table columns={columns} dataSource={filtered} rowKey="id" pagination={{ total: filtered.length, pageSize: 10, showTotal: (total) => t('common.total', { total }), showSizeChanger: true }} scroll={{ x: 1600 }} size="middle" />
      </Card>
    </div>
  );
};

export default StampTransactionRecords;
