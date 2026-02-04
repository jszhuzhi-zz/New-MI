import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Tag, Space, Input, Select, Typography, Modal, Form, Radio, message, Descriptions } from 'antd';
import { SearchOutlined, CheckOutlined, CloseOutlined, AuditOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';
import { useAppStore } from '../../store/app';
import RiskLevelTag from '../../components/RiskLevelTag';
import type { RiskLevel } from '@link-reit/types';

const { Title } = Typography;
const { TextArea } = Input;

interface AnomalyRow {
  id: string;
  transactionId: string;
  memberId: string;
  memberName: string;
  cardNo: string;
  project: string;
  anomalyType: string;
  anomalyScore: number;
  stampAmount: number;
  transactionAmount: string;
  level: RiskLevel;
  status: 'pending' | 'reviewed' | 'dismissed';
  createdAt: string;
  details: string;
}

const mockAnomalies: AnomalyRow[] = [
  { id: 'SA001', transactionId: 'TXN-50001', memberId: 'M00892', memberName: 'Zhang Wei', cardNo: 'LR000000002001', project: 'T Town', anomalyType: 'velocity-breach', anomalyScore: 95, stampAmount: 5000, transactionAmount: 'HK$5,000', level: 'critical', status: 'pending', createdAt: '2026-02-04 09:15', details: '5000 stamps earned within 10 minutes across 8 transactions' },
  { id: 'SA002', transactionId: 'TXN-50002', memberId: 'M01245', memberName: 'Li Fang', cardNo: 'LR000000002002', project: 'LOHAS Park', anomalyType: 'duplicate-receipt', anomalyScore: 88, stampAmount: 1200, transactionAmount: 'HK$1,200', level: 'high', status: 'pending', createdAt: '2026-02-04 08:42', details: 'Receipt R20260204001 already submitted 2 hours ago' },
  { id: 'SA003', transactionId: 'TXN-50003', memberId: 'M01102', memberName: 'Chen Jie', cardNo: 'LR000000002003', project: 'Temple Mall', anomalyType: 'amount-anomaly', anomalyScore: 72, stampAmount: 3500, transactionAmount: 'HK$3,500', level: 'high', status: 'pending', createdAt: '2026-02-04 07:30', details: 'Transaction amount is 350% above member average of HK$1,000' },
  { id: 'SA004', transactionId: 'TXN-50004', memberId: 'M00445', memberName: 'Wang Xin', cardNo: 'LR000000002004', project: 'Maritime Bay', anomalyType: 'velocity-breach', anomalyScore: 65, stampAmount: 800, transactionAmount: 'HK$800', level: 'medium', status: 'reviewed', createdAt: '2026-02-03 22:18', details: '15 transactions within 1 hour from same location' },
  { id: 'SA005', transactionId: 'TXN-50005', memberId: 'M00789', memberName: 'Liu Mei', cardNo: 'LR000000002005', project: 'TKO Gateway', anomalyType: 'device-anomaly', anomalyScore: 55, stampAmount: 450, transactionAmount: 'HK$450', level: 'medium', status: 'dismissed', createdAt: '2026-02-03 18:05', details: 'Same device fingerprint used by 3 different member accounts' },
];

const StampAnomalyReview: React.FC = () => {
  const { t } = useLocale();
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [searchText, setSearchText] = useState('');
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyRow | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    setBreadcrumbs([
      { title: t('riskControl.riskControl'), path: '/risk-control/workbench' },
      { title: t('riskControl.stampAnomalyReview') },
    ]);
  }, [setBreadcrumbs, t]);

  const filtered = mockAnomalies.filter((r) => {
    const matchesSearch = !searchText || r.memberName.toLowerCase().includes(searchText.toLowerCase()) || r.cardNo.includes(searchText);
    const matchesStatus = !statusFilter || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleReview = (record: AnomalyRow) => {
    setSelectedAnomaly(record);
    form.resetFields();
    setReviewModalVisible(true);
  };

  const handleReviewSubmit = async () => {
    try {
      await form.validateFields();
      message.success(t('common.success'));
      setReviewModalVisible(false);
    } catch {}
  };

  const statusColors: Record<string, string> = { pending: 'orange', reviewed: 'green', dismissed: 'default' };

  const columns: ColumnsType<AnomalyRow> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: t('riskControl.riskLevel'), dataIndex: 'level', key: 'level', width: 100, render: (level: RiskLevel) => <RiskLevelTag level={level} /> },
    { title: t('member.displayName'), dataIndex: 'memberName', key: 'memberName', width: 120 },
    { title: t('member.memberCardNo'), dataIndex: 'cardNo', key: 'cardNo', width: 160, render: (v: string) => <span style={{ fontFamily: 'monospace' }}>{v}</span> },
    { title: 'Anomaly Type', dataIndex: 'anomalyType', key: 'anomalyType', width: 140, render: (v: string) => <Tag color="red">{v.replace(/-/g, ' ')}</Tag> },
    { title: 'Score', dataIndex: 'anomalyScore', key: 'anomalyScore', width: 80, sorter: (a, b) => a.anomalyScore - b.anomalyScore, render: (v: number) => <span style={{ color: v >= 80 ? '#cf1322' : v >= 60 ? '#ff4d4f' : '#faad14', fontWeight: 600 }}>{v}</span> },
    { title: t('stamp.stamp'), dataIndex: 'stampAmount', key: 'stampAmount', width: 100, render: (v: number) => v.toLocaleString() },
    { title: t('organization.project'), dataIndex: 'project', key: 'project', width: 110 },
    { title: t('common.status'), dataIndex: 'status', key: 'status', width: 100, render: (v: string) => <Tag color={statusColors[v]}>{v}</Tag> },
    { title: t('common.createdAt'), dataIndex: 'createdAt', key: 'createdAt', width: 160 },
    {
      title: t('common.actions'), key: 'actions', width: 100, fixed: 'right',
      render: (_, r) => r.status === 'pending' ? (
        <Button type="primary" size="small" onClick={() => handleReview(r)}>Review</Button>
      ) : <span style={{ color: '#999' }}>-</span>,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}><AuditOutlined style={{ marginRight: 8 }} />{t('riskControl.stampAnomalyReview')}</Title>
      </div>

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input placeholder={t('common.search')} prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 240 }} allowClear />
          <Select placeholder={t('common.status')} value={statusFilter} onChange={setStatusFilter} style={{ width: 140 }} allowClear options={[{ label: t('common.pending'), value: 'pending' }, { label: 'Reviewed', value: 'reviewed' }, { label: 'Dismissed', value: 'dismissed' }]} />
          <Button icon={<ReloadOutlined />} onClick={() => { setSearchText(''); setStatusFilter(undefined); }}>{t('common.reset')}</Button>
        </Space>
        <Table columns={columns} dataSource={filtered} rowKey="id" pagination={{ total: filtered.length, pageSize: 10, showTotal: (total) => t('common.total', { total }) }} scroll={{ x: 1400 }} size="middle" />
      </Card>

      <Modal title={t('riskControl.stampAnomalyReview')} open={reviewModalVisible} onOk={handleReviewSubmit} onCancel={() => setReviewModalVisible(false)} width={640} okText={t('common.submit')} cancelText={t('common.cancel')}>
        {selectedAnomaly && (
          <>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Member">{selectedAnomaly.memberName} ({selectedAnomaly.cardNo})</Descriptions.Item>
              <Descriptions.Item label={t('riskControl.riskLevel')}><RiskLevelTag level={selectedAnomaly.level} /></Descriptions.Item>
              <Descriptions.Item label="Anomaly Type"><Tag color="red">{selectedAnomaly.anomalyType}</Tag></Descriptions.Item>
              <Descriptions.Item label="Score">{selectedAnomaly.anomalyScore}</Descriptions.Item>
              <Descriptions.Item label="Stamps">{selectedAnomaly.stampAmount}</Descriptions.Item>
              <Descriptions.Item label="Amount">{selectedAnomaly.transactionAmount}</Descriptions.Item>
              <Descriptions.Item label="Details" span={2}>{selectedAnomaly.details}</Descriptions.Item>
            </Descriptions>
            <Form form={form} layout="vertical">
              <Form.Item label="Review Action" name="action" rules={[{ required: true }]}>
                <Radio.Group>
                  <Radio.Button value="approve"><CheckOutlined /> Approve</Radio.Button>
                  <Radio.Button value="reject" style={{ borderColor: '#ff4d4f', color: '#ff4d4f' }}><CloseOutlined /> Reject</Radio.Button>
                  <Radio.Button value="hold">Hold</Radio.Button>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Comment" name="comment" rules={[{ required: true }]}>
                <TextArea rows={3} placeholder="Enter review comments..." />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default StampAnomalyReview;
