import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Space, Input, Select, DatePicker, Button, Typography, Drawer, Descriptions } from 'antd';
import { SearchOutlined, FileTextOutlined, EyeOutlined, ExportOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../hooks/useLocale';
import { useAppStore } from '../store/app';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface OperationLogRow {
  id: string;
  userId: string;
  userName: string;
  userType: string;
  action: string;
  module: string;
  description: string;
  entityType: string;
  entityId: string;
  ipAddress: string;
  timestamp: string;
  changes: { field: string; oldValue: string; newValue: string }[] | null;
}

const mockLogs: OperationLogRow[] = [
  { id: 'OL001', userId: 'ADM-001', userName: 'Group Admin', userType: 'group', action: 'UPDATE', module: 'Organization', description: 'Updated group settings - changed default locale', entityType: 'group', entityId: 'group-001', ipAddress: '192.168.1.100', timestamp: '2026-02-04 10:45:22', changes: [{ field: 'defaultLocale', oldValue: 'zh-CN', newValue: 'zh-TW' }] },
  { id: 'OL002', userId: 'ADM-001', userName: 'Group Admin', userType: 'group', action: 'CREATE', module: 'Stamp System', description: 'Created new earning rule: CNY Double Stamps', entityType: 'earning-rule', entityId: 'er-04', ipAddress: '192.168.1.100', timestamp: '2026-02-04 09:30:15', changes: null },
  { id: 'OL003', userId: 'ADM-002', userName: 'Risk Manager', userType: 'group', action: 'REVIEW', module: 'Risk Control', description: 'Reviewed stamp anomaly SA001 - Approved', entityType: 'stamp-anomaly', entityId: 'SA001', ipAddress: '192.168.1.101', timestamp: '2026-02-04 09:18:45', changes: [{ field: 'status', oldValue: 'pending', newValue: 'reviewed' }] },
  { id: 'OL004', userId: 'ADM-001', userName: 'Group Admin', userType: 'group', action: 'UPDATE', module: 'Member', description: 'Added member M01340 to blacklist', entityType: 'special-list', entityId: 'sl-04', ipAddress: '192.168.1.100', timestamp: '2026-02-03 14:25:10', changes: [{ field: 'listStatus', oldValue: 'none', newValue: 'blacklist' }] },
  { id: 'OL005', userId: 'SYS', userName: 'System', userType: 'system', action: 'AUTO', module: 'Stamp System', description: 'Auto-cleared 185,000 expired stamps for T Town', entityType: 'stamp-clearing', entityId: 'proj-001', ipAddress: '10.0.0.1', timestamp: '2026-02-01 00:05:00', changes: null },
  { id: 'OL006', userId: 'ADM-003', userName: 'Ops Admin', userType: 'group', action: 'UPDATE', module: 'Stamp System', description: 'Updated tier settings - increased Diamond minimum stamps', entityType: 'tier', entityId: 'tier-05', ipAddress: '192.168.1.102', timestamp: '2026-01-31 16:40:22', changes: [{ field: 'minStamps', oldValue: '50000', newValue: '60000' }] },
  { id: 'OL007', userId: 'ADM-001', userName: 'Group Admin', userType: 'group', action: 'CREATE', module: 'Organization', description: 'Added new project: Maritime Bay Phase 2', entityType: 'project', entityId: 'proj-008', ipAddress: '192.168.1.100', timestamp: '2026-01-30 11:15:33', changes: null },
  { id: 'OL008', userId: 'ADM-002', userName: 'Risk Manager', userType: 'group', action: 'UPDATE', module: 'Risk Control', description: 'Updated risk rule: High Frequency Detection threshold', entityType: 'risk-rule', entityId: 'rr-01', ipAddress: '192.168.1.101', timestamp: '2026-01-29 14:20:18', changes: [{ field: 'conditions', oldValue: '>15 txns in 30 min', newValue: '>10 txns in 30 min' }] },
  { id: 'OL009', userId: 'SYS', userName: 'System', userType: 'system', action: 'AUTO', module: 'Member', description: 'Auto-upgraded 1,200 members from Silver to Gold tier', entityType: 'tier-upgrade', entityId: 'batch-202601', ipAddress: '10.0.0.1', timestamp: '2026-01-01 00:10:00', changes: null },
  { id: 'OL010', userId: 'ADM-001', userName: 'Group Admin', userType: 'group', action: 'EXPORT', module: 'Report', description: 'Exported Stamp Clearing Report - Dec 2025', entityType: 'report-download', entityId: 'dl-06', ipAddress: '192.168.1.100', timestamp: '2026-01-15 11:30:45', changes: null },
];

const actionColors: Record<string, string> = { CREATE: 'green', UPDATE: 'blue', DELETE: 'red', REVIEW: 'purple', AUTO: 'cyan', EXPORT: 'orange' };

const OperationLog: React.FC = () => {
  const { t } = useLocale();
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs);
  const [searchText, setSearchText] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string | undefined>();
  const [actionFilter, setActionFilter] = useState<string | undefined>();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState<OperationLogRow | null>(null);

  useEffect(() => {
    setBreadcrumbs([{ title: t('report.operationLog') }]);
  }, [setBreadcrumbs, t]);

  const filtered = mockLogs.filter((r) => {
    const matchesSearch = !searchText ||
      r.userName.toLowerCase().includes(searchText.toLowerCase()) ||
      r.description.toLowerCase().includes(searchText.toLowerCase()) ||
      r.entityId.toLowerCase().includes(searchText.toLowerCase());
    const matchesModule = !moduleFilter || r.module === moduleFilter;
    const matchesAction = !actionFilter || r.action === actionFilter;
    return matchesSearch && matchesModule && matchesAction;
  });

  const modules = [...new Set(mockLogs.map((l) => l.module))];
  const actions = [...new Set(mockLogs.map((l) => l.action))];

  const handleView = (record: OperationLogRow) => {
    setSelectedLog(record);
    setDrawerVisible(true);
  };

  const columns: ColumnsType<OperationLogRow> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'User', dataIndex: 'userName', key: 'userName', width: 120 },
    { title: 'Action', dataIndex: 'action', key: 'action', width: 90, render: (v: string) => <Tag color={actionColors[v]}>{v}</Tag> },
    { title: 'Module', dataIndex: 'module', key: 'module', width: 130, render: (v: string) => <Tag>{v}</Tag> },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: 'Entity', key: 'entity', width: 140, render: (_, r) => <Text type="secondary" style={{ fontSize: 12 }}>{r.entityType}: {r.entityId}</Text> },
    { title: 'IP Address', dataIndex: 'ipAddress', key: 'ipAddress', width: 130 },
    { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp', width: 170, sorter: (a, b) => a.timestamp.localeCompare(b.timestamp), defaultSortOrder: 'descend' },
    {
      title: t('common.actions'), key: 'actions', width: 80, fixed: 'right',
      render: (_, r) => <Button type="link" icon={<EyeOutlined />} size="small" onClick={() => handleView(r)}>{t('common.details')}</Button>,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}><FileTextOutlined style={{ marginRight: 8 }} />{t('report.operationLog')}</Title>
        <Button icon={<ExportOutlined />}>{t('common.export')}</Button>
      </div>

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input placeholder={t('common.search')} prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 260 }} allowClear />
          <Select placeholder="Module" value={moduleFilter} onChange={setModuleFilter} style={{ width: 150 }} allowClear options={modules.map((m) => ({ label: m, value: m }))} />
          <Select placeholder="Action" value={actionFilter} onChange={setActionFilter} style={{ width: 130 }} allowClear options={actions.map((a) => ({ label: a, value: a }))} />
          <RangePicker />
          <Button icon={<ReloadOutlined />} onClick={() => { setSearchText(''); setModuleFilter(undefined); setActionFilter(undefined); }}>{t('common.reset')}</Button>
        </Space>

        <Table columns={columns} dataSource={filtered} rowKey="id" pagination={{ total: filtered.length, pageSize: 10, showTotal: (total) => t('common.total', { total }), showSizeChanger: true }} scroll={{ x: 1300 }} size="middle" />
      </Card>

      <Drawer
        title={t('report.operationLog') + ' ' + t('common.details')}
        width={560}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {selectedLog && (
          <div>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="ID">{selectedLog.id}</Descriptions.Item>
              <Descriptions.Item label="User">{selectedLog.userName} ({selectedLog.userId})</Descriptions.Item>
              <Descriptions.Item label="Action"><Tag color={actionColors[selectedLog.action]}>{selectedLog.action}</Tag></Descriptions.Item>
              <Descriptions.Item label="Module"><Tag>{selectedLog.module}</Tag></Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>{selectedLog.description}</Descriptions.Item>
              <Descriptions.Item label="Entity Type">{selectedLog.entityType}</Descriptions.Item>
              <Descriptions.Item label="Entity ID">{selectedLog.entityId}</Descriptions.Item>
              <Descriptions.Item label="IP Address">{selectedLog.ipAddress}</Descriptions.Item>
              <Descriptions.Item label="Timestamp">{selectedLog.timestamp}</Descriptions.Item>
            </Descriptions>

            {selectedLog.changes && selectedLog.changes.length > 0 && (
              <Card title="Changes" size="small" style={{ marginTop: 16 }}>
                <Table
                  columns={[
                    { title: 'Field', dataIndex: 'field', key: 'field' },
                    { title: 'Old Value', dataIndex: 'oldValue', key: 'oldValue', render: (v: string) => <Text delete type="danger">{v}</Text> },
                    { title: 'New Value', dataIndex: 'newValue', key: 'newValue', render: (v: string) => <Text type="success">{v}</Text> },
                  ]}
                  dataSource={selectedLog.changes}
                  rowKey="field"
                  pagination={false}
                  size="small"
                />
              </Card>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default OperationLog;
