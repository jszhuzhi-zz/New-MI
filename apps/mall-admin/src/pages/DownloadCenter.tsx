import React from 'react';
import { Card, Table, Typography, Tag, Space, Button, Progress, Empty } from 'antd';
import { DownloadOutlined, ReloadOutlined, FileExcelOutlined, FilePdfOutlined, FileTextOutlined, ClockCircleOutlined, CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../hooks/useLocale';

const { Title, Text } = Typography;

interface DownloadItem {
  key: string;
  id: string;
  fileName: string;
  fileType: 'xlsx' | 'pdf' | 'csv';
  fileSize: string;
  module: string;
  status: 'completed' | 'processing' | 'failed' | 'queued';
  progress: number;
  requestedBy: string;
  requestedAt: string;
  completedAt: string | null;
  expiresAt: string;
}

const mockDownloads: DownloadItem[] = [
  { key: '1', id: 'DL-001', fileName: '会员列表_2024-01-26.xlsx', fileType: 'xlsx', fileSize: '2.4 MB', module: '会员管理', status: 'completed', progress: 100, requestedBy: '张经理', requestedAt: '2024-01-26 14:30', completedAt: '2024-01-26 14:31', expiresAt: '2024-02-02' },
  { key: '2', id: 'DL-002', fileName: '积分交易记录_2024-01.csv', fileType: 'csv', fileSize: '5.8 MB', module: '积分管理', status: 'completed', progress: 100, requestedBy: '张经理', requestedAt: '2024-01-26 13:00', completedAt: '2024-01-26 13:02', expiresAt: '2024-02-02' },
  { key: '3', id: 'DL-003', fileName: '清零统计报表_2024-01.pdf', fileType: 'pdf', fileSize: '1.2 MB', module: '报表中心', status: 'completed', progress: 100, requestedBy: '张经理', requestedAt: '2024-01-26 11:00', completedAt: '2024-01-26 11:01', expiresAt: '2024-02-02' },
  { key: '4', id: 'DL-004', fileName: '风控预警记录_2024-01.xlsx', fileType: 'xlsx', fileSize: '-', module: '风控中心', status: 'processing', progress: 65, requestedBy: '李管理员', requestedAt: '2024-01-26 15:10', completedAt: null, expiresAt: '-' },
  { key: '5', id: 'DL-005', fileName: '异常用户列表_2024-01.csv', fileType: 'csv', fileSize: '-', module: '风控中心', status: 'queued', progress: 0, requestedBy: '李管理员', requestedAt: '2024-01-26 15:12', completedAt: null, expiresAt: '-' },
  { key: '6', id: 'DL-006', fileName: '操作日志_2024-01.xlsx', fileType: 'xlsx', fileSize: '3.1 MB', module: '操作日志', status: 'completed', progress: 100, requestedBy: '张经理', requestedAt: '2024-01-25 16:00', completedAt: '2024-01-25 16:03', expiresAt: '2024-02-01' },
  { key: '7', id: 'DL-007', fileName: '月度积分报表_2023-12.pdf', fileType: 'pdf', fileSize: '-', module: '报表中心', status: 'failed', progress: 30, requestedBy: '张经理', requestedAt: '2024-01-24 10:00', completedAt: null, expiresAt: '-' },
];

const DownloadCenter: React.FC = () => {
  const { t } = useLocale();

  const fileTypeIcons: Record<string, React.ReactNode> = {
    xlsx: <FileExcelOutlined style={{ color: '#52c41a' }} />,
    pdf: <FilePdfOutlined style={{ color: '#ff4d4f' }} />,
    csv: <FileTextOutlined style={{ color: '#1890ff' }} />,
  };

  const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    completed: { color: 'green', icon: <CheckCircleOutlined />, label: t('stamp.completed') },
    processing: { color: 'blue', icon: <LoadingOutlined />, label: t('common.loading') },
    queued: { color: 'default', icon: <ClockCircleOutlined />, label: t('common.pending') },
    failed: { color: 'red', icon: <ClockCircleOutlined />, label: t('common.error') },
  };

  const columns: ColumnsType<DownloadItem> = [
    {
      title: t('common.details') === '详情' ? '文件名' : 'File Name',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (text, record) => (
        <Space>
          {fileTypeIcons[record.fileType]}
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: t('common.details') === '详情' ? '文件大小' : 'Size',
      dataIndex: 'fileSize',
      key: 'fileSize',
      width: 100,
    },
    {
      title: t('common.details') === '详情' ? '模块' : 'Module',
      dataIndex: 'module',
      key: 'module',
      width: 100,
      render: (text) => <Tag>{text}</Tag>,
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const config = statusConfig[status];
        return (
          <Space>
            <Tag color={config.color} icon={config.icon}>{config.label}</Tag>
          </Space>
        );
      },
    },
    {
      title: t('common.details') === '详情' ? '进度' : 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      width: 150,
      render: (progress: number, record) => (
        record.status === 'processing'
          ? <Progress percent={progress} size="small" />
          : record.status === 'completed'
          ? <Progress percent={100} size="small" />
          : record.status === 'failed'
          ? <Progress percent={progress} size="small" status="exception" />
          : <Progress percent={0} size="small" />
      ),
    },
    {
      title: t('common.details') === '详情' ? '请求人' : 'Requested By',
      dataIndex: 'requestedBy',
      key: 'requestedBy',
      width: 100,
    },
    {
      title: t('common.details') === '详情' ? '请求时间' : 'Requested',
      dataIndex: 'requestedAt',
      key: 'requestedAt',
      width: 160,
    },
    {
      title: t('common.details') === '详情' ? '过期时间' : 'Expires',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      width: 110,
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space>
          {record.status === 'completed' && (
            <Button type="primary" size="small" icon={<DownloadOutlined />}>
              {t('common.download')}
            </Button>
          )}
          {record.status === 'failed' && (
            <Button size="small" icon={<ReloadOutlined />}>
              {t('common.details') === '详情' ? '重试' : 'Retry'}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>{t('report.downloadCenter')}</Title>
        <Button icon={<ReloadOutlined />}>{t('common.details') === '详情' ? '刷新' : 'Refresh'}</Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={mockDownloads}
          pagination={{
            total: mockDownloads.length,
            pageSize: 10,
            showTotal: (total) => t('common.total', { total }),
          }}
        />
      </Card>
    </div>
  );
};

export default DownloadCenter;
