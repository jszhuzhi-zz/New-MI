import React, { useState } from 'react';
import { Card, Form, Input, Button, Tabs, message, Space, Typography } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLocale } from '../hooks/useLocale';
import type { MerchantUser } from '../store/auth';

const { Text } = Typography;

const labels: Record<string, Record<string, string>> = {
  accountLogin: { 'zh-CN': '账号登录', 'zh-TW': '賬號登錄', en: 'Account Login' },
  smsLogin: { 'zh-CN': '短信登录', 'zh-TW': '短信登錄', en: 'SMS Login' },
  username: { 'zh-CN': '用户名', 'zh-TW': '用戶名', en: 'Username' },
  password: { 'zh-CN': '密码', 'zh-TW': '密碼', en: 'Password' },
  phone: { 'zh-CN': '手机号', 'zh-TW': '手機號', en: 'Phone Number' },
  smsCode: { 'zh-CN': '验证码', 'zh-TW': '驗證碼', en: 'SMS Code' },
  sendCode: { 'zh-CN': '获取验证码', 'zh-TW': '獲取驗證碼', en: 'Send Code' },
  codeSent: { 'zh-CN': '{s}秒后重发', 'zh-TW': '{s}秒後重發', en: 'Resend in {s}s' },
  login: { 'zh-CN': '登录', 'zh-TW': '登錄', en: 'Login' },
  loginSuccess: { 'zh-CN': '登录成功', 'zh-TW': '登錄成功', en: 'Login successful' },
  usernameRequired: { 'zh-CN': '请输入用户名', 'zh-TW': '請輸入用戶名', en: 'Please enter username' },
  passwordRequired: { 'zh-CN': '请输入密码', 'zh-TW': '請輸入密碼', en: 'Please enter password' },
  phoneRequired: { 'zh-CN': '请输入手机号', 'zh-TW': '請輸入手機號', en: 'Please enter phone' },
  codeRequired: { 'zh-CN': '请输入验证码', 'zh-TW': '請輸入驗證碼', en: 'Please enter code' },
  demoHint: {
    'zh-CN': '演示账号: merchant / 123456',
    'zh-TW': '演示賬號: merchant / 123456',
    en: 'Demo: merchant / 123456',
  },
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { locale } = useLocale();
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const getLabel = (key: string) => labels[key]?.[locale] || labels[key]?.en || key;

  const mockUser: MerchantUser = {
    id: 'merchant-001',
    username: 'merchant',
    displayName: locale === 'en' ? 'Zhang Wei' : '张伟',
    phone: '13800138001',
    role: 'shop_manager',
    permissions: ['stamp:issue', 'stamp:void', 'member:lookup', 'coupon:redeem', 'staff:manage'],
    shopId: 'shop-001',
    shopName: locale === 'zh-TW' ? '優品生活館' : locale === 'en' ? 'Premium Living' : '优品生活馆',
    mallId: 'mall-001',
    mallName: locale === 'zh-TW' ? '樂富廣場' : locale === 'en' ? 'Lok Fu Place' : '乐富广场',
  };

  const handleAccountLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      login(mockUser, 'mock-merchant-token-' + Date.now());
      message.success(getLabel('loginSuccess'));
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSmsLogin = async (values: { phone: string; code: string }) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      login(mockUser, 'mock-merchant-token-' + Date.now());
      message.success(getLabel('loginSuccess'));
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    message.success(locale === 'en' ? 'Code sent' : '验证码已发送');
  };

  return (
    <Card
      style={{
        width: 400,
        maxWidth: '100%',
        borderRadius: 12,
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
      }}
    >
      <Tabs
        centered
        items={[
          {
            key: 'account',
            label: getLabel('accountLogin'),
            children: (
              <Form
                size="large"
                onFinish={handleAccountLogin}
                autoComplete="off"
                initialValues={{ username: 'merchant', password: '123456' }}
              >
                <Form.Item
                  name="username"
                  rules={[{ required: true, message: getLabel('usernameRequired') }]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder={getLabel('username')}
                  />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[{ required: true, message: getLabel('passwordRequired') }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder={getLabel('password')}
                  />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} block>
                    {getLabel('login')}
                  </Button>
                </Form.Item>
              </Form>
            ),
          },
          {
            key: 'sms',
            label: getLabel('smsLogin'),
            children: (
              <Form size="large" onFinish={handleSmsLogin} autoComplete="off">
                <Form.Item
                  name="phone"
                  rules={[{ required: true, message: getLabel('phoneRequired') }]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder={getLabel('phone')}
                    maxLength={11}
                  />
                </Form.Item>
                <Form.Item
                  name="code"
                  rules={[{ required: true, message: getLabel('codeRequired') }]}
                >
                  <Space.Compact style={{ width: '100%' }}>
                    <Input
                      prefix={<SafetyCertificateOutlined />}
                      placeholder={getLabel('smsCode')}
                      maxLength={6}
                    />
                    <Button
                      disabled={countdown > 0}
                      onClick={handleSendCode}
                      style={{ width: 130 }}
                    >
                      {countdown > 0
                        ? getLabel('codeSent').replace('{s}', String(countdown))
                        : getLabel('sendCode')}
                    </Button>
                  </Space.Compact>
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} block>
                    {getLabel('login')}
                  </Button>
                </Form.Item>
              </Form>
            ),
          },
        ]}
      />
      <div style={{ textAlign: 'center' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {getLabel('demoHint')}
        </Text>
      </div>
    </Card>
  );
};

export default Login;
