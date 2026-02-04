import React, { useState } from 'react';
import { Card, Table, Typography, Tag, Space, Button, Input, Select, Row, Col, DatePicker, Modal, Form, Descriptions, Steps, Radio, message, Badge, Tabs } from 'antd';
import { SearchOutlined, CheckOutlined, CloseOutlined, EyeOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface AnomalyItem {
  key: string;
  id: string;
  alertId: string;
  memberCardNo: string;
  memberName: string;
  transactionId: string;
  anomalyType: string;
  anomalyScore: number;
  stampAmount: number;
  spendingAmount: number;
  merchantName: string;
  receiptNo: string;
  level: string;
  status: string;
  flagReason: string;
  createdAt: string;
}

const mockAnomalies: AnomalyItem[] = [
  { key: '1', id: 'SA-001', alertId: 'ALT-001', memberCardNo: 'MC-20240005', memberName: 'Eva Ng', transactionId: 'TXN-2024-005', anomalyType: 'amount-anomaly', anomalyScore: 92, stampAmount: 580, spendingAmount: 5800, merchantName: 'Chow Tai Fook', receiptNo: 'R-2024-0830', level: 'high', status: 'pending', flagReason: '单日积分获取 580，超过日上限 500', createdAt: '2024-01-26 14:30' },
  { key: '2', id: 'SA-002', alertId: 'ALT-002', memberCardNo: 'MC-20240012', memberName: '孙七', transactionId: 'TXN-2024-010', anomalyType: 'duplicate-receipt', anomalyScore: 85, stampAmount: 120, spendingAmount: 1200, merchantName: 'UNIQLO', receiptNo: 'R-2024-8821', level: 'medium', status: 'pending', flagReason: '收据号 R-2024-8821 在系统中已存在', createdAt: '2024-01-26 13:15' },
  { key: '3', id: 'SA-003', alertId: 'ALT-003', memberCardNo: 'MC-20240089', memberName: 'Unknown User', transactionId: 'TXN-2024-015', anomalyType: 'velocity-breach', anomalyScore: 78, stampAmount: 45, spendingAmount: 450, merchantName: 'McDonald\'s', receiptNo: 'R-2024-0900', level: 'high', status: 'pending', flagReason: '1小时内提交 8 次积分请求', createdAt: '2024-01-26 12:00' },
  { key: '4', id: 'SA-004', alertId: 'ALT-004', memberCardNo: 'MC-20240034', memberName: 'John Doe', transactionId: 'TXN-2024-020', anomalyType: 'amount-anomaly', anomalyScore: 95, stampAmount: 2800, spendingAmount: 28000, merchantName: 'Apple Store', receiptNo: 'R-2024-0850', level: 'critical', status: 'under-review', flagReason: '单笔交易 HKD 28,000，超过正常范围', createdAt: '2024-01-26 10:00' },
  { key: '5', id: 'SA-005', alertId: 'ALT-005', memberCardNo: 'MC-20240056', memberName: '刘九', transactionId: 'TXN-2024-025', anomalyType: 'suspicious-transaction', anomalyScore: 65, stampAmount: 200, spendingAmount: 2000, merchantName: 'Zara', receiptNo: 'R-2024-0860', level: 'medium', status: 'reviewed', flagReason: '连续3天在同一商户大额消费', createdAt: '2024-01-25 16:40' },
];

const StampAnomalyReview: React.FC = () => {
  const { t } = useLocale();
  const [reviewModal, setReviewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AnomalyItem | null>(null);
  const [reviewForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('all');

  const levelColors: Record<string, string> = { low: 'green', medium: 'orange', high: 'red', critical: 'magenta' };
  const statusColors: Record<string, string> = { pending: 'orange', 'under-review': 'blue', reviewed: 'green', dismissed: 'default' };

  const pendingCount = mockAnomalies.filter((a) => a.status === 'pending').length;

  const handleReview = () => {
    reviewForm.validateFields().then((values) => {
      message.success(values.action === 'approve' ? t('stamp.approved') : t('stamp.rejected'));
      setReviewModal(false);
    });
  };

  const columns: ColumnsType<AnomalyItem> = [
    { title: t('common.details') === '详情' ? '预警ID' : 'Alert ID', dataIndex: 'alertId', key: 'alertId', width: 100 },
    { title: t('member.memberCardNo'), dataIndex: 'memberCardNo', key: 'memberCardNo', width: 140 },
    { title: t('member.displayName'), dataIndex: 'memberName', key: 'memberName', width: 120 },
    {
      title: t('common.details') === '详情' ? '异常类型' : 'Anomaly Type',
      dataIndex: 'anomalyType',
      key: 'anomalyType',
      width: 130,
      render: (type: string) => {
        const labels: Record<string, string> = {
          'amount-anomaly': t('common.details') === '详情' ? '金额异常' : 'Amount',
          'duplicate-receipt': t('common.details') === '详情' ? '重复小票' : 'Duplicate Receipt',
          'velocity-breach': t('common.details') === '详情' ? '频率异常' : 'Velocity',
          'suspicious-transaction': t('common.details') === '详情' ? '可疑交易' : 'Suspicious',
        };
        return <Tag>{labels[type] || type}</Tag>;
      },
    },
    {
      title: t('common.details') === '详情' ? '异常评分' : 'Score',
      dataIndex: 'anomalyScore',
      key: 'anomalyScore',
      width: 90,
      render: (score: number) => (
        <Text strong style={{ color: score >= 90 ? '#ff4d4f' : score >= 70 ? '#faad14' : '#52c41a' }}>{score}</Text>
      ),
      sorter: (a, b) => a.anomalyScore - b.anomalyScore,
    },
    {
      title: t('common.details') === '详情' ? '积分数' : 'Stamps',
      dataIndex: 'stampAmount',
      key: 'stampAmount',
      width: 80,
      render: (v: number) => v.toLocaleString(),
    },
    {
      title: t('riskControl.riskLevel'),
      dataIndex: 'level',
      key: 'level',
      width: 90,
      render: (level: string) => <Tag color={levelColors[level]}>{level.toUpperCase()}</Tag>,
    },
    {
      title: t('common.details') === '详情' ? '标记原因' : 'Reason',
      dataIndex: 'flagReason',
      key: 'flagReason',
      ellipsis: true,
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => <Tag color={statusColors[status]}>{status}</Tag>,
    },
    { title: t('common.createdAt'), dataIndex: 'createdAt', key: 'createdAt', width: 160, sorter: true },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          icon={record.status === 'pending' ? <ExclamationCircleOutlined /> : <EyeOutlined />}
          onClick={() => { setSelectedItem(record); setReviewModal(true); reviewForm.resetFields(); }}
        >
          {record.status === 'pending' ? (t('common.details') === '详情' ? '审核' : 'Review') : t('common.details')}
        </Button>
      ),
    },
  ];

  const getFilteredData = () => {
    if (activeTab === 'pending') return mockAnomalies.filter((a) => a.status === 'pending');
    if (activeTab === 'reviewed') return mockAnomalies.filter((a) => a.status === 'reviewed');
    return mockAnomalies;
  };

  return (
    <div>
      <Title level={4}>{t('riskControl.stampAnomalyReview')}</Title>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}><Input placeholder={t('member.memberSearch')} prefix={<SearchOutlined />} allowClear /></Col>
          <Col xs={24} md={4}>
            <Select placeholder={t('riskControl.riskLevel')} style={{ width: '100%' }} allowClear
              options={[{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }, { value: 'critical', label: 'Critical' }]}
            />
          </Col>
          <Col xs={24} md={6}><RangePicker style={{ width: '100%' }} /></Col>
          <Col xs={24} md={4}><Button type="primary" icon={<SearchOutlined />}>{t('common.search')}</Button></Col>
        </Row>
      </Card>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
          { key: 'all', label: t('common.all') },
          { key: 'pending', label: <Badge count={pendingCount} offset={[10, 0]}>{t('stamp.pending')}</Badge> },
          { key: 'reviewed', label: t('common.details') === '详情' ? '已审核' : 'Reviewed' },
        ]} />
        <Table columns={columns} dataSource={getFilteredData()} scroll={{ x: 1600 }} pagination={{ pageSize: 10, showTotal: (total) => t('common.total', { total }) }} />
      </Card>

      <Modal
        title={t('riskControl.stampAnomalyReview')}
        open={reviewModal}
        onCancel={() => setReviewModal(false)}
        width={700}
        footer={
          selectedItem?.status === 'pending'
            ? [
                <Button key="reject" danger onClick={() => { reviewForm.setFieldsValue({ action: 'reject' }); handleReview(); }}>{t('stamp.rejected')}</Button>,
                <Button key="hold" onClick={() => { reviewForm.setFieldsValue({ action: 'hold' }); handleReview(); }}>{t('common.details') === '详情' ? '暂挂' : 'Hold'}</Button>,
                <Button key="approve" type="primary" onClick={() => { reviewForm.setFieldsValue({ action: 'approve' }); handleReview(); }}>{t('stamp.approved')}</Button>,
              ]
            : [<Button key="close" onClick={() => setReviewModal(false)}>{t('common.cancel')}</Button>]
        }
      >
        {selectedItem && (
          <>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label={t('member.memberCardNo')}>{selectedItem.memberCardNo}</Descriptions.Item>
              <Descriptions.Item label={t('member.displayName')}>{selectedItem.memberName}</Descriptions.Item>
              <Descriptions.Item label={t('common.details') === '详情' ? '交易ID' : 'TXN ID'}>{selectedItem.transactionId}</Descriptions.Item>
              <Descriptions.Item label={t('common.details') === '详情' ? '收据号' : 'Receipt'}>{selectedItem.receiptNo}</Descriptions.Item>
              <Descriptions.Item label={t('common.details') === '详情' ? '消费金额' : 'Spending'}>HKD {selectedItem.spendingAmount.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label={t('common.details') === '详情' ? '积分数' : 'Stamps'}>{selectedItem.stampAmount}</Descriptions.Item>
              <Descriptions.Item label={t('common.details') === '详情' ? '异常评分' : 'Score'}><Text strong style={{ color: selectedItem.anomalyScore >= 90 ? '#ff4d4f' : '#faad14' }}>{selectedItem.anomalyScore}</Text></Descriptions.Item>
              <Descriptions.Item label={t('riskControl.riskLevel')}><Tag color={levelColors[selectedItem.level]}>{selectedItem.level.toUpperCase()}</Tag></Descriptions.Item>
              <Descriptions.Item label={t('common.details') === '详情' ? '标记原因' : 'Flag Reason'} span={2}>{selectedItem.flagReason}</Descriptions.Item>
            </Descriptions>

            {selectedItem.status === 'pending' && (
              <Form form={reviewForm} layout="vertical">
                <Form.Item name="action" label={t('common.details') === '详情' ? '审核操作' : 'Review Action'}>
                  <Radio.Group>
                    <Radio value="approve">{t('stamp.approved')}</Radio>
                    <Radio value="reject">{t('stamp.rejected')}</Radio>
                    <Radio value="hold">{t('common.details') === '详情' ? '暂挂' : 'Hold'}</Radio>
                  </Radio.Group>
                </Form.Item>
                <Form.Item name="comment" label={t('common.details') === '详情' ? '审核意见' : 'Review Comment'}>
                  <TextArea rows={3} />
                </Form.Item>
              </Form>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default StampAnomalyReview;
