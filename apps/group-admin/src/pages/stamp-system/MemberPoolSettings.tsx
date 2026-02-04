import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Select, InputNumber, Button, Space, Typography, Descriptions, Divider, Row, Col, message, Switch, Table, Tag } from 'antd';
import { SaveOutlined, EditOutlined, CreditCardOutlined } from '@ant-design/icons';
import { useLocale } from '../../hooks/useLocale';
import { useAppStore } from '../../store/app';

const { Title, Text } = Typography;

const mockPoolSettings = {
  prefix: 'LR',
  length: 12,
  type: 'sequential' as const,
  startNumber: 1000,
  checkDigitEnabled: true,
  physicalCardEnabled: true,
  physicalCardPrefix: 'LRC',
  qrCodeEnabled: true,
  barcodeEnabled: true,
  autoIssueOnRegistration: true,
  maxCardsPerMember: 3,
  cardExpiryMonths: 0, // 0 = no expiry
  replacementPolicy: 'transfer-balance',
};

const mockRecentCards = [
  { cardNo: 'LR000000001241', memberName: 'Ho Wing Sze', issuedAt: '2026-02-03', status: 'active', type: 'digital' },
  { cardNo: 'LR000000001240', memberName: 'Yip Chi Hung', issuedAt: '2026-01-08', status: 'expired', type: 'digital' },
  { cardNo: 'LR000000001239', memberName: 'Lam Hoi Yee', issuedAt: '2025-12-14', status: 'active', type: 'physical' },
  { cardNo: 'LR000000001238', memberName: 'Ng Wai Kit', issuedAt: '2025-09-22', status: 'suspended', type: 'digital' },
  { cardNo: 'LR000000001237', memberName: 'Cheung Mei Ling', issuedAt: '2025-08-05', status: 'active', type: 'physical' },
];

const MemberPoolSettings: React.FC = () => {
  const { t } = useLocale();
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs);
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    setBreadcrumbs([
      { title: t('stamp.stampSystem'), path: '/stamp-system/pool-settings' },
      { title: t('member.memberCard') },
    ]);
  }, [setBreadcrumbs, t]);

  const handleSave = async () => {
    try {
      await form.validateFields();
      message.success(t('common.success'));
      setEditing(false);
    } catch { /* validation */ }
  };

  const cardColumns = [
    { title: t('member.memberCardNo'), dataIndex: 'cardNo', key: 'cardNo', render: (v: string) => <span style={{ fontFamily: 'monospace' }}>{v}</span> },
    { title: t('member.displayName'), dataIndex: 'memberName', key: 'memberName' },
    { title: 'Type', dataIndex: 'type', key: 'type', render: (v: string) => <Tag color={v === 'physical' ? 'blue' : 'green'}>{v}</Tag> },
    { title: t('common.status'), dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={v === 'active' ? 'green' : v === 'suspended' ? 'red' : 'default'}>{v}</Tag> },
    { title: 'Issued At', dataIndex: 'issuedAt', key: 'issuedAt' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          <CreditCardOutlined style={{ marginRight: 8 }} />
          {t('member.memberCard')} - Pool Settings
        </Title>
        {!editing ? (
          <Button type="primary" icon={<EditOutlined />} onClick={() => setEditing(true)}>{t('common.edit')}</Button>
        ) : (
          <Space>
            <Button onClick={() => setEditing(false)}>{t('common.cancel')}</Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>{t('common.save')}</Button>
          </Space>
        )}
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="Card Generation Rules">
            {!editing ? (
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Prefix">{mockPoolSettings.prefix}</Descriptions.Item>
                <Descriptions.Item label="Length">{mockPoolSettings.length}</Descriptions.Item>
                <Descriptions.Item label="Generation Type">{mockPoolSettings.type}</Descriptions.Item>
                <Descriptions.Item label="Start Number">{mockPoolSettings.startNumber}</Descriptions.Item>
                <Descriptions.Item label="Check Digit">{mockPoolSettings.checkDigitEnabled ? t('common.yes') : t('common.no')}</Descriptions.Item>
                <Descriptions.Item label="Auto Issue">{mockPoolSettings.autoIssueOnRegistration ? t('common.yes') : t('common.no')}</Descriptions.Item>
                <Descriptions.Item label="Max Cards/Member">{mockPoolSettings.maxCardsPerMember}</Descriptions.Item>
                <Descriptions.Item label="Card Expiry">{mockPoolSettings.cardExpiryMonths === 0 ? 'No Expiry' : `${mockPoolSettings.cardExpiryMonths} months`}</Descriptions.Item>
                <Descriptions.Item label="Physical Card">{mockPoolSettings.physicalCardEnabled ? t('common.yes') : t('common.no')}</Descriptions.Item>
                <Descriptions.Item label="Physical Prefix">{mockPoolSettings.physicalCardPrefix}</Descriptions.Item>
                <Descriptions.Item label="QR Code">{mockPoolSettings.qrCodeEnabled ? t('common.yes') : t('common.no')}</Descriptions.Item>
                <Descriptions.Item label="Barcode">{mockPoolSettings.barcodeEnabled ? t('common.yes') : t('common.no')}</Descriptions.Item>
                <Descriptions.Item label="Replacement Policy" span={2}>{mockPoolSettings.replacementPolicy}</Descriptions.Item>
              </Descriptions>
            ) : (
              <Form form={form} layout="vertical" initialValues={mockPoolSettings}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Card Number Prefix" name="prefix" rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Card Number Length" name="length" rules={[{ required: true }]}>
                      <InputNumber min={8} max={20} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Generation Type" name="type">
                      <Select options={[{ label: 'Sequential', value: 'sequential' }, { label: 'Random', value: 'random' }]} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Start Number" name="startNumber">
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={8}><Form.Item label="Check Digit" name="checkDigitEnabled" valuePropName="checked"><Switch /></Form.Item></Col>
                  <Col span={8}><Form.Item label="QR Code" name="qrCodeEnabled" valuePropName="checked"><Switch /></Form.Item></Col>
                  <Col span={8}><Form.Item label="Barcode" name="barcodeEnabled" valuePropName="checked"><Switch /></Form.Item></Col>
                </Row>
                <Row gutter={16}>
                  <Col span={8}><Form.Item label="Physical Card" name="physicalCardEnabled" valuePropName="checked"><Switch /></Form.Item></Col>
                  <Col span={8}><Form.Item label="Auto Issue" name="autoIssueOnRegistration" valuePropName="checked"><Switch /></Form.Item></Col>
                  <Col span={8}><Form.Item label="Max Cards/Member" name="maxCardsPerMember"><InputNumber min={1} max={10} style={{ width: '100%' }} /></Form.Item></Col>
                </Row>
                <Form.Item label="Replacement Policy" name="replacementPolicy">
                  <Select options={[{ label: 'Transfer Balance', value: 'transfer-balance' }, { label: 'Reset Balance', value: 'reset-balance' }, { label: 'Keep Both', value: 'keep-both' }]} />
                </Form.Item>
              </Form>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Recently Issued Cards">
            <Table columns={cardColumns} dataSource={mockRecentCards} rowKey="cardNo" pagination={false} size="small" />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MemberPoolSettings;
