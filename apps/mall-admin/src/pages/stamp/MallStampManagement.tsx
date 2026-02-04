import React, { useState } from 'react';
import { Card, Table, Typography, Tag, Space, Button, Input, Select, Row, Col, DatePicker, Modal, Form, InputNumber, Upload, Descriptions, Steps, message, Tabs, Badge } from 'antd';
import { SearchOutlined, PlusOutlined, CheckOutlined, CloseOutlined, EyeOutlined, UploadOutlined, InboxOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface StampSubmission {
  key: string;
  id: string;
  memberCardNo: string;
  memberName: string;
  amount: number;
  spendingAmount: number;
  currency: string;
  source: string;
  receiptNo: string;
  merchantName: string;
  status: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  receiptImage?: string;
}

const mockSubmissions: StampSubmission[] = [
  { key: '1', id: 'STS-001', memberCardNo: 'MC-20240001', memberName: 'Alice Wong', amount: 120, spendingAmount: 1200, currency: 'HKD', source: 'receipt-scan', receiptNo: 'R-2024-0826', merchantName: 'UNIQLO', status: 'pending', submittedAt: '2024-01-26 14:30' },
  { key: '2', id: 'STS-002', memberCardNo: 'MC-20240002', memberName: 'Bob Li', amount: 85, spendingAmount: 850, currency: 'HKD', source: 'counter', receiptNo: 'R-2024-0827', merchantName: 'Pacific Coffee', status: 'pending', submittedAt: '2024-01-26 13:15' },
  { key: '3', id: 'STS-003', memberCardNo: 'MC-20240006', memberName: 'Frank Zhao', amount: 250, spendingAmount: 2500, currency: 'HKD', source: 'receipt-scan', receiptNo: 'R-2024-0828', merchantName: 'Apple Store', status: 'approved', submittedAt: '2024-01-26 11:00', reviewedBy: '张经理', reviewedAt: '2024-01-26 11:30' },
  { key: '4', id: 'STS-004', memberCardNo: 'MC-20240007', memberName: 'Grace Ho', amount: 45, spendingAmount: 450, currency: 'HKD', source: 'manual-entry', receiptNo: 'R-2024-0829', merchantName: 'Watson', status: 'approved', submittedAt: '2024-01-26 10:20', reviewedBy: '李客服', reviewedAt: '2024-01-26 10:45' },
  { key: '5', id: 'STS-005', memberCardNo: 'MC-20240003', memberName: 'Carol Chan', amount: 580, spendingAmount: 5800, currency: 'HKD', source: 'receipt-scan', receiptNo: 'R-2024-0830', merchantName: 'Chow Tai Fook', status: 'rejected', submittedAt: '2024-01-25 16:40', reviewedBy: '风控系统', reviewedAt: '2024-01-25 16:41' },
  { key: '6', id: 'STS-006', memberCardNo: 'MC-20240004', memberName: 'David Lam', amount: 30, spendingAmount: 300, currency: 'HKD', source: 'counter', receiptNo: 'R-2024-0831', merchantName: 'McDonald\'s', status: 'pending', submittedAt: '2024-01-26 15:10' },
];

const MallStampManagement: React.FC = () => {
  const { t } = useLocale();
  const [reviewModal, setReviewModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<StampSubmission | null>(null);
  const [reviewForm] = Form.useForm();
  const [addForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('all');

  const pendingCount = mockSubmissions.filter((s) => s.status === 'pending').length;

  const statusColors: Record<string, string> = {
    pending: 'orange',
    approved: 'green',
    rejected: 'red',
    completed: 'blue',
  };

  const handleReview = (action: 'approve' | 'reject') => {
    reviewForm.validateFields().then(() => {
      message.success(action === 'approve' ? t('stamp.approved') : t('stamp.rejected'));
      setReviewModal(false);
    });
  };

  const handleAddStamp = () => {
    addForm.validateFields().then(() => {
      message.success(t('common.success'));
      setAddModal(false);
      addForm.resetFields();
    });
  };

  const columns: ColumnsType<StampSubmission> = [
    {
      title: t('common.details') === '详情' ? '提交ID' : 'Submission ID',
      dataIndex: 'id',
      key: 'id',
      width: 110,
    },
    {
      title: t('member.memberCardNo'),
      dataIndex: 'memberCardNo',
      key: 'memberCardNo',
      width: 140,
    },
    {
      title: t('member.displayName'),
      dataIndex: 'memberName',
      key: 'memberName',
      width: 130,
    },
    {
      title: t('common.details') === '详情' ? '消费金额' : 'Spending',
      dataIndex: 'spendingAmount',
      key: 'spendingAmount',
      width: 120,
      render: (v: number, record) => `${record.currency} ${v.toLocaleString()}`,
    },
    {
      title: t('common.details') === '详情' ? '积分数' : 'Stamps',
      dataIndex: 'amount',
      key: 'amount',
      width: 90,
      render: (v: number) => <Text strong style={{ color: '#1890ff' }}>{v}</Text>,
    },
    {
      title: t('common.details') === '详情' ? '商户' : 'Merchant',
      dataIndex: 'merchantName',
      key: 'merchantName',
      width: 130,
    },
    {
      title: t('common.details') === '详情' ? '收据号' : 'Receipt No.',
      dataIndex: 'receiptNo',
      key: 'receiptNo',
      width: 140,
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
          counter: t('stamp.counter'),
          'auto-sync': t('stamp.autoSync'),
        };
        return <Tag>{labels[source] || source}</Tag>;
      },
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => <Tag color={statusColors[status]}>{status}</Tag>,
    },
    {
      title: t('common.details') === '详情' ? '提交时间' : 'Submitted',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      width: 160,
      sorter: true,
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedSubmission(record);
              setReviewModal(true);
            }}
          />
          {record.status === 'pending' && (
            <>
              <Button
                type="link"
                size="small"
                style={{ color: '#52c41a' }}
                icon={<CheckOutlined />}
                onClick={() => {
                  setSelectedSubmission(record);
                  setReviewModal(true);
                }}
              />
              <Button
                type="link"
                size="small"
                danger
                icon={<CloseOutlined />}
                onClick={() => {
                  setSelectedSubmission(record);
                  setReviewModal(true);
                }}
              />
            </>
          )}
        </Space>
      ),
    },
  ];

  const getFilteredData = () => {
    if (activeTab === 'pending') return mockSubmissions.filter((s) => s.status === 'pending');
    if (activeTab === 'approved') return mockSubmissions.filter((s) => s.status === 'approved');
    if (activeTab === 'rejected') return mockSubmissions.filter((s) => s.status === 'rejected');
    return mockSubmissions;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <Title level={4} style={{ marginBottom: 4 }}>
            {t('common.details') === '详情' ? '商场台积分' : t('common.details') === '詳情' ? '商場台積分' : 'Mall Stamp Processing'}
          </Title>
          <Text type="secondary">
            {t('common.details') === '详情'
              ? '处理商场级积分：将用户消费转换为积分，需要工作人员审批'
              : 'Process stamps at mall level: convert spending to stamps with staff approval'}
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModal(true)}>
          {t('common.details') === '详情' ? '手动录入积分' : 'Manual Entry'}
        </Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <Input placeholder={t('member.memberSearch')} prefix={<SearchOutlined />} allowClear />
          </Col>
          <Col xs={24} md={4}>
            <Select placeholder={t('common.details') === '详情' ? '来源' : 'Source'} style={{ width: '100%' }} allowClear
              options={[
                { value: 'receipt-scan', label: t('stamp.receiptScan') },
                { value: 'manual-entry', label: t('stamp.manualEntry') },
                { value: 'counter', label: t('stamp.counter') },
              ]}
            />
          </Col>
          <Col xs={24} md={8}>
            <RangePicker style={{ width: '100%' }} />
          </Col>
          <Col xs={24} md={6}>
            <Button type="primary" icon={<SearchOutlined />}>{t('common.search')}</Button>
          </Col>
        </Row>
      </Card>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: 'all', label: t('common.all') },
            { key: 'pending', label: <Badge count={pendingCount} offset={[10, 0]}>{t('stamp.pending')}</Badge> },
            { key: 'approved', label: t('stamp.approved') },
            { key: 'rejected', label: t('stamp.rejected') },
          ]}
        />
        <Table
          columns={columns}
          dataSource={getFilteredData()}
          scroll={{ x: 1500 }}
          pagination={{
            total: getFilteredData().length,
            pageSize: 10,
            showTotal: (total) => t('common.total', { total }),
          }}
        />
      </Card>

      {/* Review Modal */}
      <Modal
        title={t('common.details') === '详情' ? '积分审核' : 'Stamp Review'}
        open={reviewModal}
        onCancel={() => setReviewModal(false)}
        width={640}
        footer={
          selectedSubmission?.status === 'pending'
            ? [
                <Button key="reject" danger onClick={() => handleReview('reject')}>{t('stamp.rejected')}</Button>,
                <Button key="approve" type="primary" onClick={() => handleReview('approve')}>{t('stamp.approved')}</Button>,
              ]
            : [<Button key="close" onClick={() => setReviewModal(false)}>{t('common.cancel')}</Button>]
        }
      >
        {selectedSubmission && (
          <>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label={t('member.memberCardNo')}>{selectedSubmission.memberCardNo}</Descriptions.Item>
              <Descriptions.Item label={t('member.displayName')}>{selectedSubmission.memberName}</Descriptions.Item>
              <Descriptions.Item label={t('common.details') === '详情' ? '消费金额' : 'Spending'}>{selectedSubmission.currency} {selectedSubmission.spendingAmount.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label={t('common.details') === '详情' ? '积分数' : 'Stamps'}><Text strong>{selectedSubmission.amount}</Text></Descriptions.Item>
              <Descriptions.Item label={t('common.details') === '详情' ? '商户' : 'Merchant'}>{selectedSubmission.merchantName}</Descriptions.Item>
              <Descriptions.Item label={t('common.details') === '详情' ? '收据号' : 'Receipt'}>{selectedSubmission.receiptNo}</Descriptions.Item>
              <Descriptions.Item label={t('common.status')}>
                <Tag color={statusColors[selectedSubmission.status]}>{selectedSubmission.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('common.details') === '详情' ? '提交时间' : 'Submitted'}>{selectedSubmission.submittedAt}</Descriptions.Item>
            </Descriptions>

            <Steps
              size="small"
              current={selectedSubmission.status === 'pending' ? 1 : 2}
              items={[
                { title: t('common.details') === '详情' ? '提交' : 'Submitted' },
                { title: t('common.details') === '详情' ? '审核中' : 'Under Review' },
                { title: selectedSubmission.status === 'approved' ? t('stamp.approved') : selectedSubmission.status === 'rejected' ? t('stamp.rejected') : t('stamp.pending') },
              ]}
              style={{ marginBottom: 16 }}
            />

            {selectedSubmission.status === 'pending' && (
              <Form form={reviewForm} layout="vertical">
                <Form.Item name="comment" label={t('common.details') === '详情' ? '审核意见' : 'Review Comment'}>
                  <TextArea rows={3} />
                </Form.Item>
              </Form>
            )}
          </>
        )}
      </Modal>

      {/* Manual entry modal */}
      <Modal
        title={t('common.details') === '详情' ? '手动录入积分' : 'Manual Stamp Entry'}
        open={addModal}
        onCancel={() => { setAddModal(false); addForm.resetFields(); }}
        onOk={handleAddStamp}
        width={600}
      >
        <Form form={addForm} layout="vertical">
          <Form.Item name="memberCardNo" label={t('member.memberCardNo')} rules={[{ required: true }]}>
            <Input placeholder="MC-XXXXXXXX" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="spendingAmount" label={t('common.details') === '详情' ? '消费金额' : 'Spending Amount'} rules={[{ required: true }]}>
                <InputNumber prefix="HKD" style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="stampAmount" label={t('common.details') === '详情' ? '积分数' : 'Stamp Amount'} rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="merchantName" label={t('common.details') === '详情' ? '商户名称' : 'Merchant'} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="receiptNo" label={t('common.details') === '详情' ? '收据号' : 'Receipt No.'} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="receipt" label={t('common.details') === '详情' ? '收据图片' : 'Receipt Image'}>
            <Upload.Dragger maxCount={1}>
              <p className="ant-upload-drag-icon"><InboxOutlined /></p>
              <p>{t('common.upload')}</p>
            </Upload.Dragger>
          </Form.Item>
          <Form.Item name="reason" label={t('common.details') === '详情' ? '备注' : 'Remarks'}>
            <TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MallStampManagement;
