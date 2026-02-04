import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Select, Button, Row, Col, Descriptions, Divider, Space, message, Typography, Switch } from 'antd';
import { SaveOutlined, EditOutlined } from '@ant-design/icons';
import { useLocale } from '../../hooks/useLocale';
import { useAppStore } from '../../store/app';
import DataSyncIndicator from '../../components/DataSyncIndicator';

const { Title } = Typography;

// Mock group data
const mockGroupData = {
  id: 'group-001',
  name: { 'zh-CN': '领展集团', 'zh-TW': '領展集團', en: 'Link REIT Group' },
  code: 'LINKREIT',
  logo: '',
  status: 'active' as const,
  contactEmail: 'admin@linkreit.com',
  contactPhone: '+852 2175 1800',
  address: {
    'zh-CN': '香港九龙湾宏泰道23号',
    'zh-TW': '香港九龍灣宏泰道23號',
    en: '23 Tai Yau Street, San Po Kong, Kowloon, Hong Kong',
  },
  stampMode: 'hybrid' as const,
  settings: {
    defaultLocale: 'zh-TW' as const,
    supportedLocales: ['zh-CN', 'zh-TW', 'en'] as const,
    currency: 'HKD',
    timezone: 'Asia/Hong_Kong',
    memberCardRule: { prefix: 'LR', length: 12, type: 'sequential' as const },
    dataSyncMode: 'group-sync' as const,
  },
};

const GroupManagement: React.FC = () => {
  const { t, locale } = useLocale();
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs);
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    setBreadcrumbs([
      { title: t('organization.architecture'), path: '/organization/group' },
      { title: t('organization.groupManagement') },
    ]);
  }, [setBreadcrumbs, t]);

  const handleSave = async () => {
    try {
      await form.validateFields();
      message.success(t('common.success'));
      setEditing(false);
    } catch {
      // validation failed
    }
  };

  const langKey = locale as keyof typeof mockGroupData.name;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          {t('organization.groupManagement')}
        </Title>
        <Space>
          <DataSyncIndicator mode={mockGroupData.settings.dataSyncMode} lastSyncAt="2026-02-04 08:30" />
          {!editing ? (
            <Button type="primary" icon={<EditOutlined />} onClick={() => setEditing(true)}>
              {t('common.edit')}
            </Button>
          ) : (
            <Space>
              <Button onClick={() => setEditing(false)}>{t('common.cancel')}</Button>
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                {t('common.save')}
              </Button>
            </Space>
          )}
        </Space>
      </div>

      {!editing ? (
        <Card>
          <Descriptions column={{ xs: 1, sm: 2 }} bordered>
            <Descriptions.Item label={t('organization.group') + ' ID'}>
              {mockGroupData.id}
            </Descriptions.Item>
            <Descriptions.Item label={t('organization.group') + ' Code'}>
              {mockGroupData.code}
            </Descriptions.Item>
            <Descriptions.Item label={t('organization.group') + ' Name (CN)'}>
              {mockGroupData.name['zh-CN']}
            </Descriptions.Item>
            <Descriptions.Item label={t('organization.group') + ' Name (TW)'}>
              {mockGroupData.name['zh-TW']}
            </Descriptions.Item>
            <Descriptions.Item label={t('organization.group') + ' Name (EN)'}>
              {mockGroupData.name.en}
            </Descriptions.Item>
            <Descriptions.Item label={t('common.status')}>
              <span style={{ color: '#52c41a' }}>{t('common.active')}</span>
            </Descriptions.Item>
            <Descriptions.Item label={t('member.email')}>
              {mockGroupData.contactEmail}
            </Descriptions.Item>
            <Descriptions.Item label={t('member.phone')}>
              {mockGroupData.contactPhone}
            </Descriptions.Item>
            <Descriptions.Item label="Stamp Mode" span={2}>
              {mockGroupData.stampMode}
            </Descriptions.Item>
            <Descriptions.Item label="Currency">
              {mockGroupData.settings.currency}
            </Descriptions.Item>
            <Descriptions.Item label="Timezone">
              {mockGroupData.settings.timezone}
            </Descriptions.Item>
            <Descriptions.Item label={t('member.memberCardNo') + ' Prefix'}>
              {mockGroupData.settings.memberCardRule.prefix}
            </Descriptions.Item>
            <Descriptions.Item label={t('member.memberCardNo') + ' Length'}>
              {mockGroupData.settings.memberCardRule.length}
            </Descriptions.Item>
            <Descriptions.Item label={t('system.dataSyncMode')} span={2}>
              <DataSyncIndicator mode={mockGroupData.settings.dataSyncMode} />
            </Descriptions.Item>
          </Descriptions>
        </Card>
      ) : (
        <Card>
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              nameZhCN: mockGroupData.name['zh-CN'],
              nameZhTW: mockGroupData.name['zh-TW'],
              nameEn: mockGroupData.name.en,
              code: mockGroupData.code,
              contactEmail: mockGroupData.contactEmail,
              contactPhone: mockGroupData.contactPhone,
              currency: mockGroupData.settings.currency,
              timezone: mockGroupData.settings.timezone,
              stampMode: mockGroupData.stampMode,
              cardPrefix: mockGroupData.settings.memberCardRule.prefix,
              cardLength: mockGroupData.settings.memberCardRule.length,
            }}
          >
            <Divider orientation="left">{t('organization.group') + ' Info'}</Divider>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Name (CN)" name="nameZhCN" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Name (TW)" name="nameZhTW" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Name (EN)" name="nameEn" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label={t('member.email')} name="contactEmail" rules={[{ required: true, type: 'email' }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label={t('member.phone')} name="contactPhone" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Code" name="code" rules={[{ required: true }]}>
                  <Input disabled />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">{t('system.systemSettings')}</Divider>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Stamp Mode" name="stampMode">
                  <Select
                    options={[
                      { label: 'Earn & Burn', value: 'earn-and-burn' },
                      { label: 'Tier Based', value: 'tier-based' },
                      { label: 'Hybrid', value: 'hybrid' },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Currency" name="currency">
                  <Select
                    options={[
                      { label: 'HKD', value: 'HKD' },
                      { label: 'CNY', value: 'CNY' },
                      { label: 'USD', value: 'USD' },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Timezone" name="timezone">
                  <Select
                    options={[
                      { label: 'Asia/Hong_Kong', value: 'Asia/Hong_Kong' },
                      { label: 'Asia/Shanghai', value: 'Asia/Shanghai' },
                      { label: 'Asia/Singapore', value: 'Asia/Singapore' },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Card Prefix" name="cardPrefix">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Card Length" name="cardLength">
                  <Input type="number" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      )}
    </div>
  );
};

export default GroupManagement;
