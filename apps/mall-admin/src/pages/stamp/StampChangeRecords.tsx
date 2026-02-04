import React from 'react';
import { Card, Table, Typography, Tag, Space, Button, Input, Select, Row, Col, DatePicker } from 'antd';
import { SearchOutlined, ExportOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface ChangeRecord {
  key: string;
  id: string;
  memberId: string;
  memberCardNo: string;
  memberName: string;
  changeType: string;
  field: string;
  oldValue: string;
  newValue: string;
  reason: string;
  operatorName: string;
  operatorType: string;
  createdAt: string;
}

const mockRecords: ChangeRecord[] = [
  { key: '1', id: 'CHG-001', memberId: 'M-001', memberCardNo: 'MC-20240001', memberName: 'Alice Wong', changeType: 'stamp', field: 'balance', oldValue: '2330', newValue: '2450', reason: '小票扫描积分 +120', operatorName: '系统', operatorType: 'system', createdAt: '2024-01-26 14:35' },
  { key: '2', id: 'CHG-002', memberId: 'M-002', memberCardNo: 'MC-20240002', memberName: 'Bob Li', changeType: 'stamp', field: 'balance', oldValue: '5730', newValue: '5680', reason: '礼品兑换 -50', operatorName: '系统', operatorType: 'system', createdAt: '2024-01-26 13:20' },
  { key: '3', id: 'CHG-003', memberId: 'M-001', memberCardNo: 'MC-20240001', memberName: 'Alice Wong', changeType: 'tier', field: 'tierId', oldValue: 'Silver', newValue: 'Gold', reason: '累计积分达标，自动升级', operatorName: '系统', operatorType: 'system', createdAt: '2024-01-25 00:05' },
  { key: '4', id: 'CHG-004', memberId: 'M-005', memberCardNo: 'MC-20240005', memberName: 'Eva Ng', changeType: 'status', field: 'status', oldValue: 'active', newValue: 'suspended', reason: '风控预警：异常交易行为', operatorName: '风控系统', operatorType: 'system', createdAt: '2024-01-25 11:20' },
  { key: '5', id: 'CHG-005', memberId: 'M-003', memberCardNo: 'MC-20240003', memberName: 'Carol Chan', changeType: 'stamp', field: 'balance', oldValue: '1470', newValue: '890', reason: '积分清零: 580 stamps expired', operatorName: '系统', operatorType: 'system', createdAt: '2024-01-24 00:01' },
  { key: '6', id: 'CHG-006', memberId: 'M-006', memberCardNo: 'MC-20240006', memberName: 'Frank Zhao', changeType: 'stamp', field: 'balance', oldValue: '1310', newValue: '1560', reason: '手工调整 +250 (客服补录)', operatorName: '张经理', operatorType: 'staff', createdAt: '2024-01-23 15:40' },
  { key: '7', id: 'CHG-007', memberId: 'M-007', memberCardNo: 'MC-20240007', memberName: 'Grace Ho', changeType: 'tag', field: 'tags', oldValue: 'VIP', newValue: 'VIP, Frequent', reason: '满足条件自动标记', operatorName: '系统', operatorType: 'system', createdAt: '2024-01-22 10:00' },
  { key: '8', id: 'CHG-008', memberId: 'M-004', memberCardNo: 'MC-20240004', memberName: 'David Lam', changeType: 'profile', field: 'phone', oldValue: '+852 6456 7890', newValue: '+852 6456 8899', reason: '会员本人修改', operatorName: 'David Lam', operatorType: 'member', createdAt: '2024-01-21 20:15' },
];

const StampChangeRecords: React.FC = () => {
  const { t } = useLocale();

  const changeTypeColors: Record<string, string> = {
    stamp: 'blue',
    tier: 'purple',
    status: 'red',
    tag: 'cyan',
    profile: 'green',
    label: 'orange',
  };

  const changeTypeLabels: Record<string, string> = {
    stamp: t('stamp.stamp'),
    tier: t('member.memberTier'),
    status: t('common.status'),
    tag: t('member.memberTag'),
    profile: t('member.memberProfile'),
    label: t('member.memberLabel'),
  };

  const columns: ColumnsType<ChangeRecord> = [
    { title: t('common.details') === '详情' ? '记录ID' : 'ID', dataIndex: 'id', key: 'id', width: 100 },
    { title: t('member.memberCardNo'), dataIndex: 'memberCardNo', key: 'memberCardNo', width: 140 },
    { title: t('member.displayName'), dataIndex: 'memberName', key: 'memberName', width: 120 },
    {
      title: t('common.details') === '详情' ? '变更类型' : 'Change Type',
      dataIndex: 'changeType',
      key: 'changeType',
      width: 100,
      render: (type: string) => <Tag color={changeTypeColors[type]}>{changeTypeLabels[type] || type}</Tag>,
      filters: Object.entries(changeTypeLabels).map(([value, text]) => ({ text, value })),
    },
    {
      title: t('common.details') === '详情' ? '变更字段' : 'Field',
      dataIndex: 'field',
      key: 'field',
      width: 100,
    },
    {
      title: t('common.details') === '详情' ? '原值' : 'Old Value',
      dataIndex: 'oldValue',
      key: 'oldValue',
      width: 120,
      render: (v: string) => <Text type="secondary">{v}</Text>,
    },
    {
      title: t('common.details') === '详情' ? '新值' : 'New Value',
      dataIndex: 'newValue',
      key: 'newValue',
      width: 120,
      render: (v: string) => <Text strong>{v}</Text>,
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
      width: 110,
      render: (name: string, record) => (
        <Space>
          <Tag color={record.operatorType === 'system' ? 'default' : record.operatorType === 'staff' ? 'blue' : 'green'}>
            {record.operatorType}
          </Tag>
          {name}
        </Space>
      ),
    },
    {
      title: t('common.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      sorter: true,
    },
  ];

  return (
    <div>
      <Title level={4}>{t('stamp.stampChangeRecord')}</Title>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <Input placeholder={t('member.memberSearch')} prefix={<SearchOutlined />} allowClear />
          </Col>
          <Col xs={24} md={4}>
            <Select
              placeholder={t('common.details') === '详情' ? '变更类型' : 'Change Type'}
              style={{ width: '100%' }}
              allowClear
              options={Object.entries(changeTypeLabels).map(([value, label]) => ({ value, label }))}
            />
          </Col>
          <Col xs={24} md={4}>
            <Select
              placeholder={t('common.details') === '详情' ? '操作人类型' : 'Operator Type'}
              style={{ width: '100%' }}
              allowClear
              options={[
                { value: 'system', label: t('common.details') === '详情' ? '系统' : 'System' },
                { value: 'staff', label: t('common.details') === '详情' ? '员工' : 'Staff' },
                { value: 'member', label: t('member.member') },
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
          dataSource={mockRecords}
          scroll={{ x: 1500 }}
          pagination={{
            total: mockRecords.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => t('common.total', { total }),
          }}
        />
      </Card>
    </div>
  );
};

export default StampChangeRecords;
