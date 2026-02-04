import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Tag, Space, Input, Select, Typography, Modal, Form, Radio, message, Descriptions, Progress } from 'antd';
import { SearchOutlined, ExclamationCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';
import { useAppStore } from '../../store/app';
import RiskLevelTag from '../../components/RiskLevelTag';
import type { RiskLevel } from '@link-reit/types';

const { Title } = Typography;
const { TextArea } = Input;

interface AbnormalMemberRow {
  id: string;
  memberId: string;
  memberName: string;
  cardNo: string;
  project: string;
  reason: string;
  riskScore: number;
  riskLevel: RiskLevel;
  previousViolations: number;
  stampBalance: number;
  status: 'pending' | 'cleared' | 'suspended' | 'banned';
  flaggedAt: string;
}

const mockAbnormalMembers: AbnormalMemberRow[] = [
  { id: 'AM001', memberId: 'M01340', memberName: 'Liu Qiang', cardNo: 'LR000000003001', project: 'Stanley Plaza', reason: 'Linked to previously banned account via phone number', riskScore: 92, riskLevel: 'critical', previousViolations: 3, stampBalance: 450, status: 'pending', flaggedAt: '2026-02-03 14:22' },
  { id: 'AM002', memberId: 'M00892', memberName: 'Zhang Wei', cardNo: 'LR000000002001', project: 'T Town', reason: 'Multiple velocity breaches in past 7 days', riskScore: 85, riskLevel: 'high', previousViolations: 2, stampBalance: 5200, status: 'pending', flaggedAt: '2026-02-04 09:15' },
  { id: 'AM003', memberId: 'M01102', memberName: 'Chen Jie', cardNo: 'LR000000002003', project: 'Temple Mall', reason: 'Consistently high anomaly scores on transactions', riskScore: 72, riskLevel: 'high', previousViolations: 1, stampBalance: 3800, status: 'pending', flaggedAt: '2026-02-04 07:30' },
  { id: 'AM004', memberId: 'M00556', memberName: 'Huang Mei', cardNo: 'LR000000003004', project: 'LOHAS Park', reason: 'Multiple accounts registered with same ID document', riskScore: 68, riskLevel: 'medium', previousViolations: 0, stampBalance: 1200, status: 'cleared', flaggedAt: '2026-02-02 11:45' },
  { id: 'AM005', memberId: 'M01445', memberName: 'Wu Tao', cardNo: 'LR000000003005', project: 'TKO Gateway', reason: 'Bot-like activity pattern detected', riskScore: 60, riskLevel: 'medium', previousViolations: 1, stampBalance: 890, status: 'suspended', flaggedAt: '2026-02-01 16:33' },
];

const AbnormalMemberReview: React.FC = () => {
  const { t } = useLocale();
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [searchText, setSearchText] = useState('');
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<AbnormalMemberRow | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    setBreadcrumbs([
      { title: t('riskControl.riskControl'), path: '/risk-control/workbench' },
      { title: t('riskControl.abnormalMemberReview') },
    ]);
  }, [setBreadcrumbs, t]);

  const filtered = mockAbnormalMembers.filter((r) => {
    const matchesSearch = !searchText || r.memberName.toLowerCase().includes(searchText.toLowerCase()) || r.cardNo.includes(searchText);
    const matchesStatus = !statusFilter || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors: Record<string, string> = { pending: 'orange', cleared: 'green', suspended: 'red', banned: '#cf1322' };

  const columns: ColumnsType<AbnormalMemberRow> = [
    { title: t('member.displayName'), dataIndex: 'memberName', key: 'memberName', width: 130 },
    { title: t('member.memberCardNo'), dataIndex: 'cardNo', key: 'cardNo', width: 160, render: (v: string) => <span style={{ fontFamily: 'monospace' }}>{v}</span> },
    { title: t('riskControl.riskLevel'), dataIndex: 'riskLevel', key: 'riskLevel', width: 100, render: (level: RiskLevel) => <RiskLevelTag level={level} /> },
    {
      title: 'Risk Score', dataIndex: 'riskScore', key: 'riskScore', width: 120,
      sorter: (a, b) => a.riskScore - b.riskScore,
      render: (v: number) => <Progress percent={v} size="small" strokeColor={v >= 80 ? '#cf1322' : v >= 60 ? '#ff4d4f' : '#faad14'} format={(p) => `${p}`} style={{ width: 80 }} />,
    },
    { title: 'Reason', dataIndex: 'reason', key: 'reason', ellipsis: true },
    { title: 'Past Violations', dataIndex: 'previousViolations', key: 'previousViolations', width: 120, render: (v: number) => v > 0 ? <Tag color="red">{v}</Tag> : <Tag>0</Tag> },
    { title: t('member.stampBalance'), dataIndex: 'stampBalance', key: 'stampBalance', width: 110, render: (v: number) => v.toLocaleString() },
    { title: t('organization.project'), dataIndex: 'project', key: 'project', width: 120 },
    { title: t('common.status'), dataIndex: 'status', key: 'status', width: 100, render: (v: string) => <Tag color={statusColors[v]}>{v}</Tag> },
    { title: 'Flagged At', dataIndex: 'flaggedAt', key: 'flaggedAt', width: 160 },
    {
      title: t('common.actions'), key: 'actions', width: 100, fixed: 'right',
      render: (_, r) => r.status === 'pending' ? (
        <Button type="primary" size="small" onClick={() => { setSelectedMember(r); form.resetFields(); setReviewModalVisible(true); }}>Review</Button>
      ) : <span style={{ color: '#999' }}>-</span>,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}><ExclamationCircleOutlined style={{ marginRight: 8 }} />{t('riskControl.abnormalMemberReview')}</Title>
      </div>

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input placeholder={t('common.search')} prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 240 }} allowClear />
          <Select placeholder={t('common.status')} value={statusFilter} onChange={setStatusFilter} style={{ width: 140 }} allowClear options={[{ label: t('common.pending'), value: 'pending' }, { label: 'Cleared', value: 'cleared' }, { label: 'Suspended', value: 'suspended' }, { label: 'Banned', value: 'banned' }]} />
          <Button icon={<ReloadOutlined />} onClick={() => { setSearchText(''); setStatusFilter(undefined); }}>{t('common.reset')}</Button>
        </Space>
        <Table columns={columns} dataSource={filtered} rowKey="id" pagination={{ total: filtered.length, pageSize: 10, showTotal: (total) => t('common.total', { total }) }} scroll={{ x: 1500 }} size="middle" />
      </Card>

      <Modal title={t('riskControl.abnormalMemberReview')} open={reviewModalVisible} onOk={async () => { try { await form.validateFields(); message.success(t('common.success')); setReviewModalVisible(false); } catch {} }} onCancel={() => setReviewModalVisible(false)} width={640} okText={t('common.submit')} cancelText={t('common.cancel')}>
        {selectedMember && (
          <>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label={t('member.displayName')}>{selectedMember.memberName}</Descriptions.Item>
              <Descriptions.Item label={t('member.memberCardNo')}>{selectedMember.cardNo}</Descriptions.Item>
              <Descriptions.Item label={t('riskControl.riskLevel')}><RiskLevelTag level={selectedMember.riskLevel} /></Descriptions.Item>
              <Descriptions.Item label="Risk Score">{selectedMember.riskScore}</Descriptions.Item>
              <Descriptions.Item label="Reason" span={2}>{selectedMember.reason}</Descriptions.Item>
              <Descriptions.Item label="Past Violations">{selectedMember.previousViolations}</Descriptions.Item>
              <Descriptions.Item label={t('member.stampBalance')}>{selectedMember.stampBalance}</Descriptions.Item>
            </Descriptions>
            <Form form={form} layout="vertical">
              <Form.Item label="Action" name="action" rules={[{ required: true }]}>
                <Radio.Group>
                  <Radio.Button value="cleared">Clear</Radio.Button>
                  <Radio.Button value="suspended" style={{ color: '#ff4d4f' }}>Suspend</Radio.Button>
                  <Radio.Button value="banned" style={{ color: '#cf1322' }}>Ban</Radio.Button>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Review Note" name="note" rules={[{ required: true }]}>
                <TextArea rows={3} />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default AbnormalMemberReview;
