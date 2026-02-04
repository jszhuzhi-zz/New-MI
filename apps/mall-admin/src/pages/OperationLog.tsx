import React from 'react';
import { Card, Table, Typography, Tag, Space, Button, Input, Select, Row, Col, DatePicker } from 'antd';
import { SearchOutlined, ExportOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../hooks/useLocale';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface LogEntry {
  key: string;
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  entityType: string;
  entityId: string;
  description: string;
  ipAddress: string;
  status: string;
  createdAt: string;
}

const mockLogs: LogEntry[] = [
  { key: '1', id: 'LOG-001', userId: 'mall-user-001', userName: '张经理', action: 'approve', module: '积分管理', entityType: 'stamp-transaction', entityId: 'STS-001', description: '审核通过积分提交 STS-001 (Alice Wong, 120 stamps)', ipAddress: '192.168.1.100', status: 'success', createdAt: '2024-01-26 14:35:00' },
  { key: '2', id: 'LOG-002', userId: 'mall-user-001', userName: '张经理', action: 'update', module: '会员管理', entityType: 'member', entityId: 'MC-20240004', description: '修改会员信息 MC-20240004 (David Lam) 手机号', ipAddress: '192.168.1.100', status: 'success', createdAt: '2024-01-26 14:20:00' },
  { key: '3', id: 'LOG-003', userId: 'mall-user-002', userName: '李客服', action: 'create', module: '会员管理', entityType: 'member', entityId: 'MC-20240020', description: '客服台注册新会员 MC-20240020', ipAddress: '192.168.1.101', status: 'success', createdAt: '2024-01-26 14:00:00' },
  { key: '4', id: 'LOG-004', userId: 'mall-user-001', userName: '张经理', action: 'reject', module: '积分管理', entityType: 'stamp-transaction', entityId: 'STS-005', description: '拒绝积分提交 STS-005 (Carol Chan) - 风控系统标记', ipAddress: '192.168.1.100', status: 'success', createdAt: '2024-01-25 16:45:00' },
  { key: '5', id: 'LOG-005', userId: 'SYSTEM', userName: '系统', action: 'suspend', module: '风控中心', entityType: 'member', entityId: 'MC-20240005', description: '自动暂停会员 MC-20240005 (Eva Ng) - 风控预警触发', ipAddress: '-', status: 'success', createdAt: '2024-01-25 11:20:00' },
  { key: '6', id: 'LOG-006', userId: 'mall-user-001', userName: '张经理', action: 'update', module: '积分规则', entityType: 'earning-rule', entityId: 'er-004', description: '更新消费积分活动规则 "春节双倍积分" 有效期', ipAddress: '192.168.1.100', status: 'success', createdAt: '2024-01-25 10:00:00' },
  { key: '7', id: 'LOG-007', userId: 'mall-user-003', userName: '风控管理员', action: 'add', module: '风控中心', entityType: 'special-list', entityId: 'SL-003', description: '将会员 MC-20240012 (孙七) 加入黑名单', ipAddress: '192.168.1.102', status: 'success', createdAt: '2024-01-22 14:00:00' },
  { key: '8', id: 'LOG-008', userId: 'mall-user-001', userName: '张经理', action: 'export', module: '报表中心', entityType: 'report', entityId: 'clearing-2024-01', description: '导出清零统计报表 2024-01', ipAddress: '192.168.1.100', status: 'success', createdAt: '2024-01-26 11:00:00' },
  { key: '9', id: 'LOG-009', userId: 'mall-user-002', userName: '李客服', action: 'manual-stamp', module: '积分管理', entityType: 'stamp-transaction', entityId: 'STS-006', description: '手动录入积分 STS-006 (David Lam, 30 stamps)', ipAddress: '192.168.1.101', status: 'success', createdAt: '2024-01-26 15:10:00' },
  { key: '10', id: 'LOG-010', userId: 'mall-user-001', userName: '张经理', action: 'login', module: '认证', entityType: 'session', entityId: '-', description: '管理员登录', ipAddress: '192.168.1.100', status: 'success', createdAt: '2024-01-26 09:00:00' },
];

const OperationLog: React.FC = () => {
  const { t } = useLocale();

  const actionColors: Record<string, string> = {
    create: 'green',
    update: 'blue',
    delete: 'red',
    approve: 'cyan',
    reject: 'orange',
    suspend: 'magenta',
    export: 'purple',
    login: 'default',
    add: 'green',
    'manual-stamp': 'geekblue',
  };

  const moduleColors: Record<string, string> = {
    '会员管理': 'blue',
    '积分管理': 'green',
    '积分规则': 'purple',
    '风控中心': 'red',
    '报表中心': 'cyan',
    '认证': 'default',
  };

  const columns: ColumnsType<LogEntry> = [
    { title: t('common.details') === '详情' ? '日志ID' : 'Log ID', dataIndex: 'id', key: 'id', width: 100 },
    {
      title: t('common.details') === '详情' ? '操作人' : 'Operator',
      dataIndex: 'userName',
      key: 'userName',
      width: 110,
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: t('common.details') === '详情' ? '操作' : 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 110,
      render: (action: string) => <Tag color={actionColors[action]}>{action}</Tag>,
    },
    {
      title: t('common.details') === '详情' ? '模块' : 'Module',
      dataIndex: 'module',
      key: 'module',
      width: 100,
      render: (module: string) => <Tag color={moduleColors[module]}>{module}</Tag>,
      filters: Object.keys(moduleColors).map((k) => ({ text: k, value: k })),
    },
    {
      title: t('common.details') === '详情' ? '描述' : 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'IP',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 130,
      render: (ip: string) => <Text code>{ip}</Text>,
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => <Tag color={status === 'success' ? 'green' : 'red'}>{status}</Tag>,
    },
    {
      title: t('common.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      sorter: true,
    },
  ];

  return (
    <div>
      <Title level={4}>{t('report.operationLog')}</Title>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <Input placeholder={t('common.details') === '详情' ? '搜索操作人/描述' : 'Search operator/description'} prefix={<SearchOutlined />} allowClear />
          </Col>
          <Col xs={24} md={4}>
            <Select
              placeholder={t('common.details') === '详情' ? '模块' : 'Module'}
              style={{ width: '100%' }}
              allowClear
              options={Object.keys(moduleColors).map((k) => ({ value: k, label: k }))}
            />
          </Col>
          <Col xs={24} md={4}>
            <Select
              placeholder={t('common.details') === '详情' ? '操作类型' : 'Action'}
              style={{ width: '100%' }}
              allowClear
              options={Object.keys(actionColors).map((k) => ({ value: k, label: k }))}
            />
          </Col>
          <Col xs={24} md={6}>
            <RangePicker style={{ width: '100%' }} showTime />
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
          dataSource={mockLogs}
          scroll={{ x: 1300 }}
          pagination={{
            total: mockLogs.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => t('common.total', { total }),
          }}
        />
      </Card>
    </div>
  );
};

export default OperationLog;
