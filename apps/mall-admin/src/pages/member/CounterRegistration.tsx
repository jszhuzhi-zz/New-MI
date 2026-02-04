import React, { useState } from 'react';
import { Card, Typography, Tabs, Form, Input, Button, Select, DatePicker, Row, Col, message, Table, Tag, Space, Divider, Descriptions, Result } from 'antd';
import { UserAddOutlined, SearchOutlined, EditOutlined, PhoneOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons';
import { useLocale } from '../../hooks/useLocale';

const { Title, Text } = Typography;

const CounterRegistration: React.FC = () => {
  const { t } = useLocale();
  const [registerForm] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('register');
  const [searchResult, setSearchResult] = useState<Record<string, unknown> | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const handleRegister = async (values: Record<string, unknown>) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    message.success(t('common.success'));
    setRegisterSuccess(true);
    setTimeout(() => {
      setRegisterSuccess(false);
      registerForm.resetFields();
    }, 3000);
  };

  const handleSearch = async () => {
    const values = searchForm.getFieldsValue();
    if (!values.query) {
      message.warning(t('common.details') === '详情' ? '请输入手机号或会员卡号' : 'Please enter phone or card number');
      return;
    }
    // Simulate API search
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSearchResult({
      memberCardNo: 'MC-20240001',
      displayName: 'Alice Wong',
      phone: '+852 9123 4567',
      email: 'alice@email.com',
      tier: 'Gold',
      stampBalance: 2450,
      status: 'active',
      registeredAt: '2024-01-15',
    });
  };

  const recentRegistrations = [
    { key: '1', cardNo: 'MC-20240020', name: '张三', phone: '+852 6111 2222', time: '今天 14:30', operator: '李客服' },
    { key: '2', cardNo: 'MC-20240019', name: '李四', phone: '+852 6333 4444', time: '今天 13:15', operator: '王客服' },
    { key: '3', cardNo: 'MC-20240018', name: '王五', phone: '+86 139 0000 5555', time: '今天 11:00', operator: '李客服' },
    { key: '4', cardNo: 'MC-20240017', name: 'John Smith', phone: '+852 9555 6666', time: '昨天 16:45', operator: '张客服' },
  ];

  return (
    <div>
      <Title level={4}>{t('member.counterRegistration')}</Title>
      <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
        {t('common.details') === '详情'
          ? '客服台会员管理：注册新会员、查询会员信息、编辑会员资料'
          : t('common.details') === '詳情'
          ? '客服台會員管理：註冊新會員、查詢會員資訊、編輯會員資料'
          : 'Counter member management: register, lookup, and edit members at the service counter'}
      </Text>

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'register',
                  label: (
                    <Space><UserAddOutlined />{t('common.details') === '详情' ? '新会员注册' : t('common.details') === '詳情' ? '新會員註冊' : 'Register New Member'}</Space>
                  ),
                  children: registerSuccess ? (
                    <Result
                      status="success"
                      title={t('common.success')}
                      subTitle={t('common.details') === '详情' ? '会员注册成功！已分配会员卡号' : 'Member registered successfully!'}
                    />
                  ) : (
                    <Form form={registerForm} layout="vertical" onFinish={handleRegister}>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item name="lastName" label={t('member.lastName')} rules={[{ required: true }]}>
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="firstName" label={t('member.firstName')} rules={[{ required: true }]}>
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="phone" label={t('member.phone')} rules={[{ required: true }]}>
                            <Input prefix={<PhoneOutlined />} placeholder="+852 XXXX XXXX" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="email" label={t('member.email')}>
                            <Input prefix={<MailOutlined />} />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="gender" label={t('member.gender')}>
                            <Select
                              options={[
                                { value: 'male', label: t('member.male') },
                                { value: 'female', label: t('member.female') },
                                { value: 'other', label: t('member.other') },
                                { value: 'prefer-not-to-say', label: t('member.preferNotToSay') },
                              ]}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="dateOfBirth" label={t('member.dateOfBirth')}>
                            <DatePicker style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="idType" label={t('common.details') === '详情' ? '证件类型' : 'ID Type'}>
                            <Select
                              options={[
                                { value: 'hkid', label: t('member.hkid') },
                                { value: 'passport', label: t('member.passport') },
                                { value: 'other', label: t('member.other') },
                              ]}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="idNumber" label={t('common.details') === '详情' ? '证件号码' : 'ID Number'}>
                            <Input prefix={<IdcardOutlined />} />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="preferredLocale" label={t('common.details') === '详情' ? '语言偏好' : 'Language'}>
                            <Select
                              defaultValue="zh-TW"
                              options={[
                                { value: 'zh-CN', label: '简体中文' },
                                { value: 'zh-TW', label: '繁體中文' },
                                { value: 'en', label: 'English' },
                              ]}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Divider />
                      <Form.Item>
                        <Space>
                          <Button type="primary" htmlType="submit" icon={<UserAddOutlined />}>
                            {t('common.details') === '详情' ? '注册会员' : t('common.details') === '詳情' ? '註冊會員' : 'Register Member'}
                          </Button>
                          <Button onClick={() => registerForm.resetFields()}>{t('common.reset')}</Button>
                        </Space>
                      </Form.Item>
                    </Form>
                  ),
                },
                {
                  key: 'lookup',
                  label: (
                    <Space><SearchOutlined />{t('common.details') === '详情' ? '会员查询' : t('common.details') === '詳情' ? '會員查詢' : 'Member Lookup'}</Space>
                  ),
                  children: (
                    <div>
                      <Form form={searchForm} layout="inline" style={{ marginBottom: 24 }}>
                        <Form.Item name="query" style={{ flex: 1 }}>
                          <Input
                            placeholder={t('common.details') === '详情' ? '输入手机号、会员卡号或姓名' : 'Enter phone, card number, or name'}
                            prefix={<SearchOutlined />}
                            onPressEnter={handleSearch}
                          />
                        </Form.Item>
                        <Form.Item>
                          <Button type="primary" onClick={handleSearch}>{t('common.search')}</Button>
                        </Form.Item>
                      </Form>

                      {searchResult && (
                        <Card size="small">
                          <Descriptions column={2} bordered size="small">
                            <Descriptions.Item label={t('member.memberCardNo')}>{searchResult.memberCardNo as string}</Descriptions.Item>
                            <Descriptions.Item label={t('member.displayName')}>{searchResult.displayName as string}</Descriptions.Item>
                            <Descriptions.Item label={t('member.phone')}>{searchResult.phone as string}</Descriptions.Item>
                            <Descriptions.Item label={t('member.email')}>{searchResult.email as string}</Descriptions.Item>
                            <Descriptions.Item label={t('member.memberTier')}>
                              <Tag color="gold">{searchResult.tier as string}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label={t('member.stampBalance')}>
                              <Text strong>{(searchResult.stampBalance as number).toLocaleString()}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label={t('common.status')}>
                              <Tag color="green">{searchResult.status as string}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label={t('common.createdAt')}>{searchResult.registeredAt as string}</Descriptions.Item>
                          </Descriptions>
                          <div style={{ marginTop: 16, textAlign: 'right' }}>
                            <Button type="primary" icon={<EditOutlined />}>
                              {t('common.edit')}
                            </Button>
                          </div>
                        </Card>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'edit',
                  label: (
                    <Space><EditOutlined />{t('common.details') === '详情' ? '信息编辑' : t('common.details') === '詳情' ? '資訊編輯' : 'Edit Info'}</Space>
                  ),
                  children: (
                    <Form layout="vertical">
                      <Form.Item label={t('common.details') === '详情' ? '选择会员' : 'Select Member'}>
                        <Input.Search
                          placeholder={t('common.details') === '详情' ? '搜索会员' : 'Search member'}
                          enterButton
                        />
                      </Form.Item>
                      <Text type="secondary">
                        {t('common.details') === '详情'
                          ? '请先搜索选择要编辑的会员'
                          : 'Please search and select a member to edit'}
                      </Text>
                    </Form>
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={t('common.details') === '详情' ? '近期注册' : t('common.details') === '詳情' ? '近期註冊' : 'Recent Registrations'}
            size="small"
          >
            <Table
              size="small"
              dataSource={recentRegistrations}
              pagination={false}
              columns={[
                { title: t('member.memberCardNo'), dataIndex: 'cardNo', key: 'cardNo', width: 130 },
                { title: t('member.displayName'), dataIndex: 'name', key: 'name' },
                { title: t('common.details') === '详情' ? '时间' : 'Time', dataIndex: 'time', key: 'time', width: 100 },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CounterRegistration;
