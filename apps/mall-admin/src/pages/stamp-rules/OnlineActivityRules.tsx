import React, { useState } from 'react';
import { Card, Typography, Table, Tag, Button, Space, Modal, Form, InputNumber, Select, Row, Col, Divider, message } from 'antd';
import { PlusOutlined, EditOutlined, CrownOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLocale } from '../../hooks/useLocale';

const { Title, Text } = Typography;

interface OnlineRuleTierConfig {
  tier: string;
  tierColor: string;
  signIn: number;
  purchase: number;
  referral: number;
  review: number;
  eventParticipation: number;
  dailyLimitSignIn: number;
  dailyLimitPurchase: number;
  dailyLimitReferral: number;
}

const mockTierRules: OnlineRuleTierConfig[] = [
  { tier: 'Green', tierColor: '#52c41a', signIn: 1, purchase: 5, referral: 20, review: 3, eventParticipation: 10, dailyLimitSignIn: 1, dailyLimitPurchase: 50, dailyLimitReferral: 3 },
  { tier: 'Silver', tierColor: '#8c8c8c', signIn: 2, purchase: 8, referral: 30, review: 5, eventParticipation: 15, dailyLimitSignIn: 2, dailyLimitPurchase: 80, dailyLimitReferral: 5 },
  { tier: 'Gold', tierColor: '#faad14', signIn: 3, purchase: 12, referral: 50, review: 8, eventParticipation: 25, dailyLimitSignIn: 3, dailyLimitPurchase: 120, dailyLimitReferral: 8 },
  { tier: 'Platinum', tierColor: '#722ed1', signIn: 5, purchase: 20, referral: 80, review: 15, eventParticipation: 40, dailyLimitSignIn: 5, dailyLimitPurchase: 200, dailyLimitReferral: 10 },
];

const OnlineActivityRules: React.FC = () => {
  const { t } = useLocale();
  const [editModal, setEditModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<OnlineRuleTierConfig | null>(null);
  const [form] = Form.useForm();

  const activityTypes = [
    { key: 'signIn', label: t('common.details') === '详情' ? '每日签到' : 'Daily Sign-in', labelKey: 'signIn' },
    { key: 'purchase', label: t('common.details') === '详情' ? '消费' : 'Purchase', labelKey: 'purchase' },
    { key: 'referral', label: t('common.details') === '详情' ? '推荐好友' : 'Referral', labelKey: 'referral' },
    { key: 'review', label: t('common.details') === '详情' ? '评价' : 'Review', labelKey: 'review' },
    { key: 'eventParticipation', label: t('common.details') === '详情' ? '活动参与' : 'Event Participation', labelKey: 'eventParticipation' },
  ];

  const columns: ColumnsType<OnlineRuleTierConfig> = [
    {
      title: t('member.memberTier'),
      dataIndex: 'tier',
      key: 'tier',
      width: 120,
      fixed: 'left',
      render: (tier: string, record) => (
        <Tag color={record.tierColor} icon={<CrownOutlined />}>{tier}</Tag>
      ),
    },
    {
      title: t('common.details') === '详情' ? '每日签到' : 'Sign-in',
      dataIndex: 'signIn',
      key: 'signIn',
      width: 100,
      render: (v: number) => <Text>{v} {t('stamp.stamp')}</Text>,
    },
    {
      title: t('common.details') === '详情' ? '消费' : 'Purchase',
      dataIndex: 'purchase',
      key: 'purchase',
      width: 100,
      render: (v: number) => <Text>{v} {t('stamp.stamp')}</Text>,
    },
    {
      title: t('common.details') === '详情' ? '推荐好友' : 'Referral',
      dataIndex: 'referral',
      key: 'referral',
      width: 100,
      render: (v: number) => <Text>{v} {t('stamp.stamp')}</Text>,
    },
    {
      title: t('common.details') === '详情' ? '评价' : 'Review',
      dataIndex: 'review',
      key: 'review',
      width: 100,
      render: (v: number) => <Text>{v} {t('stamp.stamp')}</Text>,
    },
    {
      title: t('common.details') === '详情' ? '活动参与' : 'Event',
      dataIndex: 'eventParticipation',
      key: 'eventParticipation',
      width: 100,
      render: (v: number) => <Text>{v} {t('stamp.stamp')}</Text>,
    },
    {
      title: t('common.details') === '详情' ? '签到日限' : 'Sign-in Daily Limit',
      dataIndex: 'dailyLimitSignIn',
      key: 'dailyLimitSignIn',
      width: 120,
      render: (v: number) => <Tag>{v}/day</Tag>,
    },
    {
      title: t('common.details') === '详情' ? '消费日限' : 'Purchase Daily Limit',
      dataIndex: 'dailyLimitPurchase',
      key: 'dailyLimitPurchase',
      width: 120,
      render: (v: number) => <Tag>{v}/day</Tag>,
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button type="link" icon={<EditOutlined />} onClick={() => {
          setSelectedTier(record);
          form.setFieldsValue(record);
          setEditModal(true);
        }}>
          {t('common.edit')}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Title level={4}>
        {t('common.details') === '详情' ? '线上活跃积分规则' : t('common.details') === '詳情' ? '線上活躍積分規則' : 'Online Activity Stamp Rules'}
      </Title>
      <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
        {t('common.details') === '详情'
          ? '按会员等级配置不同的线上活跃积分奖励'
          : 'Configure different online activity stamp rewards per tier'}
      </Text>

      <Card>
        <Table columns={columns} dataSource={mockTierRules} scroll={{ x: 1200 }} pagination={false} />
      </Card>

      <Modal
        title={`${t('common.edit')} - ${selectedTier?.tier || ''} ${t('stamp.onlineActivityRule')}`}
        open={editModal}
        onCancel={() => setEditModal(false)}
        onOk={() => { form.validateFields().then(() => { message.success(t('common.success')); setEditModal(false); }); }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Divider orientation="left">{t('common.details') === '详情' ? '每次行为积分' : 'Stamps Per Action'}</Divider>
          <Row gutter={16}>
            {activityTypes.map((at) => (
              <Col span={12} key={at.key}>
                <Form.Item name={at.key} label={at.label}>
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
            ))}
          </Row>
          <Divider orientation="left">{t('common.details') === '详情' ? '每日上限' : 'Daily Limits'}</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="dailyLimitSignIn" label={t('common.details') === '详情' ? '签到日限' : 'Sign-in Limit'}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="dailyLimitPurchase" label={t('common.details') === '详情' ? '消费日限' : 'Purchase Limit'}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="dailyLimitReferral" label={t('common.details') === '详情' ? '推荐日限' : 'Referral Limit'}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default OnlineActivityRules;
