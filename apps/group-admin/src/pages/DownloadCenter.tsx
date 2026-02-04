import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Space, Select, Typography, Progress, Tooltip, message } from 'antd';
import { DownloadOutlined, ReloadOutlined, FileExcelOutlined, FilePdfOutlined, FileTextOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../hooks/useLocale';
import { useAppStore } from '../store/app';

const { Title } = Typography;

interface DownloadRow {
  id: string;
  reportType: string;
  reportName: string;
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  fileFormat: 'xlsx' | 'csv' | 'pdf';
  fileSize: string | null;
  expiresAt: string | null;
}

const mockDownloads: DownloadRow[] = [
  { id: 'dl-01', reportType: 'clearing', reportName: 'Stamp Clearing Report - Jan 2026', requestedBy: 'Group Admin', requestedAt: '2026-02-04 10:30', status: 'completed', progress: 100, fileFormat: 'xlsx', fileSize: '2.4 MB', expiresAt: '2026-02-11' },
  { id: 'dl-02', reportType: 'member', reportName: 'Member Card List - All Projects', requestedBy: 'Group Admin', requestedAt: '2026-02-04 09:15', status: 'completed', progress: 100, fileFormat: 'csv', fileSize: '15.8 MB', expiresAt: '2026-02-11' },
  { id: 'dl-03', reportType: 'stamp-transaction', reportName: 'Stamp Transactions - Feb 2026', requestedBy: 'Group Admin', requestedAt: '2026-02-04 08:45', status: 'processing', progress: 65, fileFormat: 'xlsx', fileSize: null, expiresAt: null },
  { id: 'dl-04', reportType: 'risk-report', reportName: 'Risk Control Monthly Summary', requestedBy: 'Admin', requestedAt: '2026-02-03 16:20', status: 'completed', progress: 100, fileFormat: 'pdf', fileSize: '890 KB', expiresAt: '2026-02-10' },
  { id: 'dl-05', reportType: 'operation-log', reportName: 'Operation Log Export - Jan 2026', requestedBy: 'Admin', requestedAt: '2026-02-03 14:00', status: 'completed', progress: 100, fileFormat: 'csv', fileSize: '5.2 MB', expiresAt: '2026-02-10' },
  { id: 'dl-06', reportType: 'clearing', reportName: 'Stamp Clearing Report - Dec 2025', requestedBy: 'Group Admin', requestedAt: '2026-01-15 11:30', status: 'completed', progress: 100, fileFormat: 'xlsx', fileSize: '3.1 MB', expiresAt: '2026-01-22' },
  { id: 'dl-07', reportType: 'stamp-analysis', reportName: 'Stamp Analysis Report - Q4 2025', requestedBy: 'Admin', requestedAt: '2026-01-10 09:00', status: 'failed', progress: 0, fileFormat: 'xlsx', fileSize: null, expiresAt: null },
  { id: 'dl-08', reportType: 'member', reportName: 'Abnormal Member Report', requestedBy: 'Admin', requestedAt: '2026-02-04 11:00', status: 'pending', progress: 0, fileFormat: 'xlsx', fileSize: null, expiresAt: null },
];

const formatIcons: Record<string, React.ReactNode> = {
  xlsx: <FileExcelOutlined style={{ color: '#52c41a' }} />,
  csv: <FileTextOutlined style={{ color: '#1677ff' }} />,
  pdf: <FilePdfOutlined style={{ color: '#ff4d4f' }} />,
};

const DownloadCenter: React.FC = () => {
  const { t } = useLocale();
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  useEffect(() => {
    setBreadcrumbs([{ title: t('report.downloadCenter') }]);
  }, [setBreadcrumbs, t]);

  const filtered = mockDownloads.filter((r) => !statusFilter || r.status === statusFilter);

  const statusColors: Record<string, string> = { pending: 'default', processing: 'blue', completed: 'green', failed: 'red' };

  const columns: ColumnsType<DownloadRow> = [
    {
      title: 'Report', key: 'reportName',
      render: (_, r) => (
        <Space>
          {formatIcons[r.fileFormat]}
          <span>{r.reportName}</span>
        </Space>
      ),
    },
    { title: 'Type', dataIndex: 'reportType', key: 'reportType', width: 140, render: (v: string) => <Tag>{v}</Tag> },
    { title: 'Requested By', dataIndex: 'requestedBy', key: 'requestedBy', width: 120 },
    { title: 'Requested At', dataIndex: 'requestedAt', key: 'requestedAt', width: 160, sorter: (a, b) => a.requestedAt.localeCompare(b.requestedAt), defaultSortOrder: 'descend' },
    {
      title: t('common.status'), key: 'status', width: 130,
      render: (_, r) => {
        if (r.status === 'processing') {
          return <Progress percent={r.progress} size="small" status="active" style={{ width: 80 }} />;
        }
        return <Tag color={statusColors[r.status]}>{r.status}</Tag>;
      },
    },
    { title: 'Format', dataIndex: 'fileFormat', key: 'fileFormat', width: 80, render: (v: string) => <Tag>{v.toUpperCase()}</Tag> },
    { title: 'Size', dataIndex: 'fileSize', key: 'fileSize', width: 100, render: (v: string | null) => v || '-' },
    {
      title: 'Expires', dataIndex: 'expiresAt', key: 'expiresAt', width: 120,
      render: (v: string | null) => v ? (
        <Tooltip title={v}>
          <Space><ClockCircleOutlined />{v}</Space>
        </Tooltip>
      ) : '-',
    },
    {
      title: t('common.actions'), key: 'actions', width: 100,
      render: (_, r) => {
        if (r.status === 'completed') {
          return <Button type="primary" size="small" icon={<DownloadOutlined />} onClick={() => message.info('Download started')}>{t('common.download')}</Button>;
        }
        if (r.status === 'failed') {
          return <Button size="small" icon={<ReloadOutlined />} onClick={() => message.info('Retry queued')}>Retry</Button>;
        }
        return <span style={{ color: '#999' }}>-</span>;
      },
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}><DownloadOutlined style={{ marginRight: 8 }} />{t('report.downloadCenter')}</Title>
        <Space>
          <Select placeholder={t('common.status')} value={statusFilter} onChange={setStatusFilter} style={{ width: 140 }} allowClear options={[{ label: t('common.pending'), value: 'pending' }, { label: 'Processing', value: 'processing' }, { label: 'Completed', value: 'completed' }, { label: 'Failed', value: 'failed' }]} />
          <Button icon={<ReloadOutlined />}>{t('common.reset')}</Button>
        </Space>
      </div>

      <Card>
        <Table columns={columns} dataSource={filtered} rowKey="id" pagination={{ total: filtered.length, pageSize: 10, showTotal: (total) => t('common.total', { total }), showSizeChanger: true }} scroll={{ x: 1200 }} />
      </Card>
    </div>
  );
};

export default DownloadCenter;
