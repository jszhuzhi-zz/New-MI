import React, { useState } from 'react';
import { Card, Table, Typography, Tag, Space, Button, Input, Select, Row, Col, Modal, Form, Descriptions, Radio, Progress, message } from 'antd';
import { SearchOutlined, EyeOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface AbnormalMember {
  key: string;
  id: string;
  memberId: string;
  memberCardNo: string;
  memberName: string;
  reason: string;
  riskScore: number;
  previousViolations: number;
  totalFlaggedTransactions: number;
  status: string;
  reviewNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

const mockMembers: AbnormalMember[] = [
  { key: '1', id: 'AMR-001', memberId: 'M-005', memberCardNo: 'MC-20240005', memberName: 'Eva Ng', reason: '多次提交异常积分请求，风控评分持续偏高', riskScore: 88, previousViolations: 3, totalFlaggedTransactions: 8, status: 'pending', createdAt: '2024-01-26 11:00' },
  { key: '2', id: 'AMR-002', memberId: 'M-012', memberCardNo: 'MC-20240012', memberName: '孙七', reason: '连续提交虚假小票，3次被拒', riskScore: 92, previousViolations: 5, totalFlaggedTransactions: 12, status: 'pending', createdAt: '2024-01-25 16:30' },
  { key: '3', id: 'AMR-003', memberId: 'M-089', memberCardNo: 'MC-20240089', memberName: 'Suspicious User', reason: '异常频率请求，疑似机器人行为', riskScore: 95, previousViolations: 0, totalFlaggedTransactions: 15, status: 'pending', createdAt: '2024-01-26 12:15' },
  { key: '4', id: 'AMR-004', memberId: 'M-034', memberCardNo: 'MC-20240034', memberName: 'John Doe', reason: '单笔大额交易，需核实身份', riskScore: 72, previousViolations: 1, totalFlaggedTransactions: 3, status: 'cleared', reviewNote: '已电话核实，交易属实', reviewedBy: '张经理', reviewedAt: '2024-01-26 14:00', createdAt: '2024-01-25 10:00' },
  { key: '5', id: 'AMR-005', memberId: 'M-056', memberCardNo: 'MC-20240056', memberName: '刘九', reason: '同一设备注册多个账号', riskScore: 80, previousViolations: 2, totalFlaggedTransactions: 6, status: 'suspended', reviewNote: '确认为刷积分行为，已暂停账号', reviewedBy: '风控管理员', reviewedAt: '2024-01-25 18:00', createdAt: '2024-01-24 09:30' },
];

const AbnormalMemberReview: React.FC = () => {
  const { t } = useLocale();
  const [reviewModal, setReviewModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<AbnormalMember | null>(null);
  const [reviewForm] = Form.useForm();

  const statusColors: Record<string, string> = { pending: 'orange', cleared: 'green', suspended: 'red', banned: 'magenta' };
  const statusLabels: Record<string, string> = {
    pending: t('common.pending'),
    cleared: t('common.details') === '详情' ? '已清除' : 'Cleared',
    suspended: t('riskControl.suspend'),
    banned: t('common.details') === '详情' ? '已封禁' : 'Banned',
  };

  const columns: ColumnsType<AbnormalMember> = [
    { title: t('member.memberCardNo'), dataIndex: 'memberCardNo', key: 'memberCardNo', width: 140 },
    { title: t('member.displayName'), dataIndex: 'memberName', key: 'memberName', width: 130 },
    {
      title: t('common.details') === '详情' ? '风险评分' : 'Risk Score',
      dataIndex: 'riskScore',
      key: 'riskScore',
      width: 120,
      render: (score: number) => (
        <Space>
          <Progress type="circle" percent={score} size={36} strokeColor={score >= 90 ? '#ff4d4f' : score >= 70 ? '#faad14' : '#52c41a'} format={(p) => p} />
        </Space>
      ),
      sorter: (a, b) => a.riskScore - b.riskScore,
    },
    {
      title: t('common.details') === '详情' ? '历史违规' : 'Violations',
      dataIndex: 'previousViolations',
      key: 'previousViolations',
      width: 100,
      render: (v: number) => <Text type={v >= 3 ? 'danger' : undefined}>{v}</Text>,
    },
    {
      title: t('common.details') === '详情' ? '标记交易数' : 'Flagged TXNs',
      dataIndex: 'totalFlaggedTransactions',
      key: 'totalFlaggedTransactions',
      width: 110,
    },
    {
      title: t('common.details') === '详情' ? '异常原因' : 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>,
    },
    { title: t('common.createdAt'), dataIndex: 'createdAt', key: 'createdAt', width: 160, sorter: true },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button type="link" icon={record.status === 'pending' ? <ExclamationCircleOutlined /> : <EyeOutlined />}
          onClick={() => { setSelectedMember(record); setReviewModal(true); reviewForm.resetFields(); }}>
          {record.status === 'pending' ? (t('common.details') === '详情' ? '审核' : 'Review') : t('common.details')}
        </Button>
      ),
    },
  ];

  const handleReview = () => {
    reviewForm.validateFields().then((values) => {
      message.success(t('common.success'));
      setReviewModal(false);
    });
  };

  return (
    <div>
      <Title level={4}>{t('riskControl.abnormalMemberReview')}</Title>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}><Input placeholder={t('member.memberSearch')} prefix={<SearchOutlined />} allowClear /></Col>
          <Col xs={24} md={4}>
            <Select placeholder={t('common.status')} style={{ width: '100%' }} allowClear
              options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))} />
          </Col>
          <Col xs={24} md={4}><Button type="primary" icon={<SearchOutlined />}>{t('common.search')}</Button></Col>
        </Row>
      </Card>

      <Card>
        <Table columns={columns} dataSource={mockMembers} scroll={{ x: 1400 }} pagination={{ pageSize: 10, showTotal: (total) => t('common.total', { total }) }} />
      </Card>

      <Modal
        title={t('riskControl.abnormalMemberReview')}
        open={reviewModal}
        onCancel={() => setReviewModal(false)}
        width={640}
        footer={
          selectedMember?.status === 'pending'
            ? [
                <Button key="cancel" onClick={() => setReviewModal(false)}>{t('common.cancel')}</Button>,
                <Button key="submit" type="primary" onClick={handleReview}>{t('common.submit')}</Button>,
              ]
            : [<Button key="close" onClick={() => setReviewModal(false)}>{t('common.cancel')}</Button>]
        }
      >
        {selectedMember && (
          <>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label={t('member.memberCardNo')}>{selectedMember.memberCardNo}</Descriptions.Item>
              <Descriptions.Item label={t('member.displayName')}>{selectedMember.memberName}</Descriptions.Item>
              <Descriptions.Item label={t('common.details') === '详情' ? '风险评分' : 'Risk Score'}>
                <Text strong style={{ color: selectedMember.riskScore >= 90 ? '#ff4d4f' : '#faad14' }}>{selectedMember.riskScore}</Text>
              </Descriptions.Item>
              <Descriptions.Item label={t('common.details') === '详情' ? '历史违规' : 'Violations'}>{selectedMember.previousViolations}</Descriptions.Item>
              <Descriptions.Item label={t('common.details') === '详情' ? '异常原因' : 'Reason'} span={2}>{selectedMember.reason}</Descriptions.Item>
              {selectedMember.reviewNote && (
                <Descriptions.Item label={t('common.details') === '详情' ? '审核意见' : 'Review Note'} span={2}>{selectedMember.reviewNote}</Descriptions.Item>
              )}
            </Descriptions>

            {selectedMember.status === 'pending' && (
              <Form form={reviewForm} layout="vertical">
                <Form.Item name="action" label={t('common.details') === '详情' ? '处理方式' : 'Action'} rules={[{ required: true }]}>
                  <Radio.Group>
                    <Radio value="cleared">{t('common.details') === '详情' ? '清除标记' : 'Clear'}</Radio>
                    <Radio value="suspended">{t('riskControl.suspend')}</Radio>
                    <Radio value="banned">{t('common.details') === '详情' ? '封禁' : 'Ban'}</Radio>
                  </Radio.Group>
                </Form.Item>
                <Form.Item name="reviewNote" label={t('common.details') === '详情' ? '审核备注' : 'Review Note'} rules={[{ required: true }]}>
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

export default AbnormalMemberReview;
