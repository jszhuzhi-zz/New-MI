import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Space, Input, Select, DatePicker, Button, Typography } from 'antd';
import { SearchOutlined, ExportOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';
import { useAppStore } from '../../store/app';

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface StampChangeRow {
  id: string;
  memberId: string;
  memberName: string;
  cardNo: string;
  changeType: string;
  field: string;
  oldValue: string;
  newValue: string;
  reason: string;
  operatorId: string;
  operatorType: 'system' | 'staff' | 'member';
  project: string;
  createdAt: string;
}

const mockChanges: StampChangeRow[] = [
  { id: 'SC001', memberId: 'M001', memberName: 'Chan Tai Man', cardNo: 'LR000000001234', changeType: 'stamp', field: 'balance', oldValue: '2200', newValue: '2450', reason: 'Purchase earning - Receipt #R20260203001', operatorId: 'SYS', operatorType: 'system', project: 'T Town', createdAt: '2026-02-03 14:32:15' },
  { id: 'SC002', memberId: 'M002', memberName: 'Wong Siu Ming', cardNo: 'LR000000001235', changeType: 'tier', field: 'tierId', oldValue: 'Gold', newValue: 'Platinum', reason: 'Tier upgrade - Lifetime stamps threshold met', operatorId: 'SYS', operatorType: 'system', project: 'LOHAS Park', createdAt: '2026-02-03 00:05:00' },
  { id: 'SC003', memberId: 'M003', memberName: 'Li Ka Yan', cardNo: 'LR000000001236', changeType: 'stamp', field: 'balance', oldValue: '830', newValue: '780', reason: 'Redemption - Coupon exchange', operatorId: 'STF-042', operatorType: 'staff', project: 'Temple Mall', createdAt: '2026-02-02 16:45:22' },
  { id: 'SC004', memberId: 'M004', memberName: 'Cheung Mei Ling', cardNo: 'LR000000001237', changeType: 'stamp', field: 'balance', oldValue: '15200', newValue: '15600', reason: 'Campaign bonus - CNY Double Stamps', operatorId: 'SYS', operatorType: 'system', project: 'Maritime Bay', createdAt: '2026-02-02 11:20:08' },
  { id: 'SC005', memberId: 'M005', memberName: 'Ng Wai Kit', cardNo: 'LR000000001238', changeType: 'status', field: 'status', oldValue: 'active', newValue: 'suspended', reason: 'Risk control - Suspicious activity', operatorId: 'ADM-001', operatorType: 'staff', project: 'TKO Gateway', createdAt: '2026-02-01 09:15:33' },
  { id: 'SC006', memberId: 'M006', memberName: 'Lam Hoi Yee', cardNo: 'LR000000001239', changeType: 'stamp', field: 'balance', oldValue: '3400', newValue: '3200', reason: 'Stamp adjustment - Refund correction', operatorId: 'ADM-003', operatorType: 'staff', project: 'Stanley Plaza', createdAt: '2026-01-31 15:08:45' },
  { id: 'SC007', memberId: 'M001', memberName: 'Chan Tai Man', cardNo: 'LR000000001234', changeType: 'tag', field: 'tags', oldValue: '[]', newValue: '["vip-2026"]', reason: 'Auto-tag by campaign rule', operatorId: 'SYS', operatorType: 'system', project: 'T Town', createdAt: '2026-01-30 00:01:00' },
  { id: 'SC008', memberId: 'M008', memberName: 'Ho Wing Sze', cardNo: 'LR000000001241', changeType: 'stamp', field: 'balance', oldValue: '3900', newValue: '4100', reason: 'Receipt scan earning - #R20260129002', operatorId: 'SYS', operatorType: 'system', project: 'T Town', createdAt: '2026-01-29 18:22:11' },
];

const StampChangeRecords: React.FC = () => {
  const { t } = useLocale();
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | undefined>();

  useEffect(() => {
    setBreadcrumbs([
      { title: t('member.memberManagement'), path: '/member/cards' },
      { title: t('stamp.stampChangeRecord') },
    ]);
  }, [setBreadcrumbs, t]);

  const filtered = mockChanges.filter((r) => {
    const matchesSearch = !searchText ||
      r.memberName.toLowerCase().includes(searchText.toLowerCase()) ||
      r.cardNo.includes(searchText);
    const matchesType = !typeFilter || r.changeType === typeFilter;
    return matchesSearch && matchesType;
  });

  const changeTypeColors: Record<string, string> = {
    stamp: 'gold',
    tier: 'purple',
    status: 'red',
    tag: 'blue',
    profile: 'green',
    label: 'cyan',
  };

  const operatorTypeColors: Record<string, string> = {
    system: 'blue',
    staff: 'green',
    member: 'orange',
  };

  const columns: ColumnsType<StampChangeRow> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: t('member.memberCardNo'), dataIndex: 'cardNo', key: 'cardNo', width: 160, render: (v: string) => <span style={{ fontFamily: 'monospace' }}>{v}</span> },
    { title: t('member.displayName'), dataIndex: 'memberName', key: 'memberName', width: 130 },
    {
      title: 'Change Type', dataIndex: 'changeType', key: 'changeType', width: 100,
      render: (type: string) => <Tag color={changeTypeColors[type]}>{type}</Tag>,
    },
    { title: 'Field', dataIndex: 'field', key: 'field', width: 90 },
    { title: 'Old Value', dataIndex: 'oldValue', key: 'oldValue', width: 100, ellipsis: true },
    { title: 'New Value', dataIndex: 'newValue', key: 'newValue', width: 100, ellipsis: true },
    { title: 'Reason', dataIndex: 'reason', key: 'reason', ellipsis: true },
    {
      title: 'Operator', dataIndex: 'operatorType', key: 'operatorType', width: 90,
      render: (type: string) => <Tag color={operatorTypeColors[type]}>{type}</Tag>,
    },
    { title: t('organization.project'), dataIndex: 'project', key: 'project', width: 110 },
    { title: t('common.createdAt'), dataIndex: 'createdAt', key: 'createdAt', width: 170, sorter: (a, b) => a.createdAt.localeCompare(b.createdAt), defaultSortOrder: 'descend' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>{t('stamp.stampChangeRecord')}</Title>
        <Button icon={<ExportOutlined />}>{t('common.export')}</Button>
      </div>

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            placeholder={t('member.memberSearch')}
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 240 }}
            allowClear
          />
          <Select
            placeholder="Change Type"
            value={typeFilter}
            onChange={setTypeFilter}
            style={{ width: 140 }}
            allowClear
            options={[
              { label: 'Stamp', value: 'stamp' },
              { label: 'Tier', value: 'tier' },
              { label: 'Status', value: 'status' },
              { label: 'Tag', value: 'tag' },
              { label: 'Profile', value: 'profile' },
            ]}
          />
          <RangePicker />
          <Button icon={<ReloadOutlined />} onClick={() => { setSearchText(''); setTypeFilter(undefined); }}>
            {t('common.reset')}
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          pagination={{ total: filtered.length, pageSize: 10, showTotal: (total) => t('common.total', { total }), showSizeChanger: true }}
          scroll={{ x: 1500 }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default StampChangeRecords;
