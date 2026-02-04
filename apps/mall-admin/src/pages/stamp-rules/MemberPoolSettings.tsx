import React, { useState } from 'react';
import { Card, Typography, Form, Input, InputNumber, Switch, Select, Button, Space, Row, Col, Divider, Tag, Descriptions, Alert, message } from 'antd';
import { SaveOutlined, ReloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useLocale } from '../../hooks/useLocale';

const { Title, Text, Paragraph } = Typography;

const MemberPoolSettings: React.FC = () => {
  const { t } = useLocale();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await form.validateFields();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success(t('common.success'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={4}>
        {t('common.details') === '详情' ? '会员池设置' : t('common.details') === '詳情' ? '會員池設置' : 'Member Pool Settings'}
      </Title>

      <Alert
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        message={
          t('common.details') === '详情'
            ? '会员池配置决定了本项目的会员管理策略，包括会员编号规则、默认等级、自动标签等'
            : 'Member pool settings define membership strategy including numbering, default tier, and auto-tagging'
        }
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          poolName: 'T Town Member Pool',
          memberCardPrefix: 'TT',
          memberCardLength: 8,
          defaultTier: 'green',
          autoAssignCardNo: true,
          allowDuplicatePhone: false,
          maxMembersPerPool: 100000,
          registrationApproval: false,
          welcomeStamps: 50,
          enableAutoTagging: true,
          dataSync: 'group-sync',
        }}
      >
        <Row gutter={24}>
          <Col xs={24} lg={12}>
            <Card title={t('common.details') === '详情' ? '基础配置' : 'Basic Configuration'} style={{ marginBottom: 16 }}>
              <Form.Item name="poolName" label={t('common.details') === '详情' ? '会员池名称' : 'Pool Name'} rules={[{ required: true }]}>
                <Input />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="memberCardPrefix" label={t('common.details') === '详情' ? '会员卡前缀' : 'Card Prefix'} rules={[{ required: true }]}>
                    <Input maxLength={4} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="memberCardLength" label={t('common.details') === '详情' ? '卡号长度' : 'Card Length'}>
                    <InputNumber style={{ width: '100%' }} min={6} max={16} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="defaultTier" label={t('common.details') === '详情' ? '默认等级' : 'Default Tier'} rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 'green', label: <Space><Tag color="green">Green</Tag></Space> },
                    { value: 'silver', label: <Space><Tag color="default">Silver</Tag></Space> },
                    { value: 'gold', label: <Space><Tag color="gold">Gold</Tag></Space> },
                  ]}
                />
              </Form.Item>

              <Form.Item name="maxMembersPerPool" label={t('common.details') === '详情' ? '最大会员数' : 'Max Members'}>
                <InputNumber style={{ width: '100%' }} min={1000} step={10000} />
              </Form.Item>

              <Form.Item name="welcomeStamps" label={t('common.details') === '详情' ? '注册欢迎积分' : 'Welcome Stamps'}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title={t('common.details') === '详情' ? '规则配置' : 'Rule Configuration'} style={{ marginBottom: 16 }}>
              <Form.Item name="autoAssignCardNo" label={t('common.details') === '详情' ? '自动分配卡号' : 'Auto Assign Card No.'} valuePropName="checked">
                <Switch />
              </Form.Item>

              <Form.Item name="allowDuplicatePhone" label={t('common.details') === '详情' ? '允许重复手机号' : 'Allow Duplicate Phone'} valuePropName="checked">
                <Switch />
              </Form.Item>

              <Form.Item name="registrationApproval" label={t('common.details') === '详情' ? '注册需审批' : 'Registration Approval'} valuePropName="checked">
                <Switch />
              </Form.Item>

              <Form.Item name="enableAutoTagging" label={t('common.details') === '详情' ? '启用自动标签' : 'Enable Auto Tagging'} valuePropName="checked">
                <Switch />
              </Form.Item>

              <Form.Item name="dataSync" label={t('system.dataSyncMode')}>
                <Select
                  options={[
                    { value: 'local', label: t('system.local') },
                    { value: 'group-sync', label: t('system.groupSync') },
                  ]}
                />
              </Form.Item>
            </Card>

            <Card title={t('common.details') === '详情' ? '当前状态' : 'Current Status'} size="small">
              <Descriptions column={1} size="small">
                <Descriptions.Item label={t('common.details') === '详情' ? '当前会员数' : 'Current Members'}>
                  <Text strong>21,500</Text>
                </Descriptions.Item>
                <Descriptions.Item label={t('common.details') === '详情' ? '本月新增' : 'New This Month'}>
                  <Text strong style={{ color: '#52c41a' }}>+486</Text>
                </Descriptions.Item>
                <Descriptions.Item label={t('common.details') === '详情' ? '池使用率' : 'Pool Usage'}>
                  <Text>21.5%</Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>

        <Divider />

        <Space>
          <Button type="primary" icon={<SaveOutlined />} loading={loading} onClick={handleSave}>
            {t('common.save')}
          </Button>
          <Button icon={<ReloadOutlined />} onClick={() => form.resetFields()}>
            {t('common.reset')}
          </Button>
        </Space>
      </Form>
    </div>
  );
};

export default MemberPoolSettings;
