import React, { useState } from 'react';
import { Card, Table, Typography, Tag, Space, Select, DatePicker, Input, Button, Row, Col, Descriptions, Modal } from 'antd';
import { SearchOutlined, EyeOutlined, ExportOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface AccountRecord {
  key: string;
  id: string;
  memberId: string;
  memberName: string;
  memberCardNo: string;
  action: 'open' | 'close' | 'suspend' | 'reactivate';
  reason: string;
  previousStatus: string;
  newStatus: string;
  operatorId: string;
  operatorName: string;
  createdAt: string;
}

const mockRecords: AccountRecord[] = [
  { key: '1', id: 'AR-001', memberId: 'M-001', memberName: 'Alice Wong', memberCardNo: 'MC-20240001', action: 'open', reason: '客服台新会员注册', previousStatus: '-', newStatus: 'active', operatorId: 'S-001', operatorName: '李客服', createdAt: '2024-01-26 14:30:00' },
  { key: '2', id: 'AR-002', memberId: 'M-005', memberName: 'Eva Ng', memberCardNo: 'MC-20240005', action: 'suspend', reason: '风控预警：异常交易行为', previousStatus: 'active', newStatus: 'suspended', operatorId: 'S-002', operatorName: '系统自动', createdAt: '2024-01-25 11:20:00' },
  { key: '3', id: 'AR-003', memberId: 'M-008', memberName: 'Henry Yip', memberCardNo: 'MC-20240008', action: 'close', reason: '会员主动申请注销', previousStatus: 'active', newStatus: 'inactive', operatorId: 'S-003', operatorName: '王客服', createdAt: '2024-01-24 16:45:00' },
  { key: '4', id: 'AR-004', memberId: 'M-010', memberName: '赵六', memberCardNo: 'MC-20240010', action: 'reactivate', reason: '会员申请重新激活', previousStatus: 'inactive', newStatus: 'active', operatorId: 'S-001', operatorName: '李客服', createdAt: '2024-01-23 09:15:00' },
  { key: '5', id: 'AR-005', memberId: 'M-012', memberName: '孙七', memberCardNo: 'MC-20240012', action: 'suspend', reason: '连续3次提交虚假小票', previousStatus: 'active', newStatus: 'suspended', operatorId: 'S-004', operatorName: '风控管理员', createdAt: '2024-01-22 14:00:00' },
  { key: '6', id: 'AR-006', memberId: 'M-015', memberName: 'Mary Lee', memberCardNo: 'MC-20240015', action: 'open', reason: '网页注册', previousStatus: '-', newStatus: 'active', operatorId: 'SYSTEM', operatorName: '系统', createdAt: '2024-01-21 10:30:00' },
  { key: '7', id: 'AR-007', memberId: 'M-020', memberName: '周八', memberCardNo: 'MC-20240020', action: 'open', reason: '微信小程序注册', previousStatus: '-', newStatus: 'active', operatorId: 'SYSTEM', operatorName: '系统', createdAt: '2024-01-20 18:20:00' },
  { key: '8', id: 'AR-008', memberId: 'M-005', memberName: 'Eva Ng', memberCardNo: 'MC-20240005', action: 'reactivate', reason: '风控审核通过，恢复账号', previousStatus: 'suspended', newStatus: 'active', operatorId: 'S-004', operatorName: '风控管理员', createdAt: '2024-01-26 16:00:00' },
];

const AccountRecords: React.FC = () => {
  const { t } = useLocale();
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AccountRecord | null>(null);

  const actionColors: Record<string, string> = {
    open: 'green',
    close: 'default',
    suspend: 'red',
    reactivate: 'blue',
  };

  const actionLabels: Record<string, Record<string, string>> = {
    open: { 'zh-CN': '开户', 'zh-TW': '開戶', en: 'Open' },
    close: { 'zh-CN': '关户', 'zh-TW': '關戶', en: 'Close' },
    suspend: { 'zh-CN': '暂停', 'zh-TW': '暫停', en: 'Suspend' },
    reactivate: { 'zh-CN': '恢复', 'zh-TW': '恢復', en: 'Reactivate' },
  };

  const getActionLabel = (action: string) => {
    const labels = actionLabels[action];
    if (t('common.details') === '详情') return labels?.['zh-CN'] || action;
    if (t('common.details') === '詳情') return labels?.['zh-TW'] || action;
    return labels?.en || action;
  };

  const columns: ColumnsType<AccountRecord> = [
    {
      title: t('common.details') === '详情' ? '记录ID' : 'Record ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: t('member.memberCardNo'),
      dataIndex: 'memberCardNo',
      key: 'memberCardNo',
      width: 140,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: t('member.displayName'),
      dataIndex: 'memberName',
      key: 'memberName',
      width: 130,
    },
    {
      title: t('common.details') === '详情' ? '操作类型' : 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 100,
      render: (action: string) => (
        <Tag color={actionColors[action]}>{getActionLabel(action)}</Tag>
      ),
      filters: [
        { text: getActionLabel('open'), value: 'open' },
        { text: getActionLabel('close'), value: 'close' },
        { text: getActionLabel('suspend'), value: 'suspend' },
        { text: getActionLabel('reactivate'), value: 'reactivate' },
      ],
    },
    {
      title: t('common.details') === '详情' ? '原状态' : 'Previous',
      dataIndex: 'previousStatus',
      key: 'previousStatus',
      width: 100,
      render: (status: string) => status === '-' ? '-' : <Tag>{status}</Tag>,
    },
    {
      title: t('common.details') === '详情' ? '新状态' : 'New',
      dataIndex: 'newStatus',
      key: 'newStatus',
      width: 100,
      render: (status: string) => {
        const colors: Record<string, string> = { active: 'green', inactive: 'default', suspended: 'red' };
        return <Tag color={colors[status]}>{status}</Tag>;
      },
    },
    {
      title: t('common.details') === '详情' ? '原因' : 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      width: 250,
      ellipsis: true,
    },
    {
      title: t('common.details') === '详情' ? '操作人' : 'Operator',
      dataIndex: 'operatorName',
      key: 'operatorName',
      width: 120,
    },
    {
      title: t('common.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      sorter: true,
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedRecord(record);
            setDetailVisible(true);
          }}
        />
      ),
    },
  ];

  return (
    <div>
      <Title level={4}>{t('member.openCloseRecord')}</Title>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <Input placeholder={t('member.memberSearch')} prefix={<SearchOutlined />} allowClear />
          </Col>
          <Col xs={24} md={4}>
            <Select
              placeholder={t('common.details') === '详情' ? '操作类型' : 'Action Type'}
              style={{ width: '100%' }}
              allowClear
              options={[
                { value: 'open', label: getActionLabel('open') },
                { value: 'close', label: getActionLabel('close') },
                { value: 'suspend', label: getActionLabel('suspend') },
                { value: 'reactivate', label: getActionLabel('reactivate') },
              ]}
            />
          </Col>
          <Col xs={24} md={8}>
            <RangePicker style={{ width: '100%' }} />
          </Col>
          <Col xs={24} md={6}>
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
          dataSource={mockRecords}
          scroll={{ x: 1400 }}
          pagination={{
            total: mockRecords.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => t('common.total', { total }),
          }}
        />
      </Card>

      <Modal
        title={t('common.details') === '详情' ? '记录详情' : 'Record Details'}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={600}
      >
        {selectedRecord && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label={t('common.details') === '详情' ? '记录ID' : 'Record ID'}>{selectedRecord.id}</Descriptions.Item>
            <Descriptions.Item label={t('member.memberCardNo')}>{selectedRecord.memberCardNo}</Descriptions.Item>
            <Descriptions.Item label={t('member.displayName')}>{selectedRecord.memberName}</Descriptions.Item>
            <Descriptions.Item label={t('common.details') === '详情' ? '操作类型' : 'Action'}>
              <Tag color={actionColors[selectedRecord.action]}>{getActionLabel(selectedRecord.action)}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('common.details') === '详情' ? '原状态' : 'Previous Status'}>{selectedRecord.previousStatus}</Descriptions.Item>
            <Descriptions.Item label={t('common.details') === '详情' ? '新状态' : 'New Status'}>{selectedRecord.newStatus}</Descriptions.Item>
            <Descriptions.Item label={t('common.details') === '详情' ? '原因' : 'Reason'}>{selectedRecord.reason}</Descriptions.Item>
            <Descriptions.Item label={t('common.details') === '详情' ? '操作人' : 'Operator'}>{selectedRecord.operatorName}</Descriptions.Item>
            <Descriptions.Item label={t('common.createdAt')}>{selectedRecord.createdAt}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default AccountRecords;
