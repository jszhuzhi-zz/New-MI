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

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { locale, t } = useLocale();
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

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
      message.success(t('auth.loginSuccess'));
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
      message.success(t('auth.loginSuccess'));
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
    message.success(t('auth.sendCode'));
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
            label: t('auth.accountLogin'),
            children: (
              <Form
                size="large"
                onFinish={handleAccountLogin}
                autoComplete="off"
                initialValues={{ username: 'merchant', password: '123456' }}
              >
                <Form.Item
                  name="username"
                  rules={[{ required: true, message: t('auth.usernameRequired') }]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder={t('auth.username')}
                  />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[{ required: true, message: t('auth.passwordRequired') }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder={t('auth.password')}
                  />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} block>
                    {t('auth.login')}
                  </Button>
                </Form.Item>
              </Form>
            ),
          },
          {
            key: 'sms',
            label: t('auth.smsLogin'),
            children: (
              <Form size="large" onFinish={handleSmsLogin} autoComplete="off">
                <Form.Item
                  name="phone"
                  rules={[{ required: true, message: t('auth.phoneRequired') }]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder={t('auth.phone')}
                    maxLength={11}
                  />
                </Form.Item>
                <Form.Item
                  name="code"
                  rules={[{ required: true, message: t('auth.codeRequired') }]}
                >
                  <Space.Compact style={{ width: '100%' }}>
                    <Input
                      prefix={<SafetyCertificateOutlined />}
                      placeholder={t('auth.smsCode')}
                      maxLength={6}
                    />
                    <Button
                      disabled={countdown > 0}
                      onClick={handleSendCode}
                      style={{ width: 130 }}
                    >
                      {countdown > 0
                        ? t('auth.codeSent', { s: String(countdown) })
                        : t('auth.sendOtp')}
                    </Button>
                  </Space.Compact>
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} block>
                    {t('auth.login')}
                  </Button>
                </Form.Item>
              </Form>
            ),
          },
        ]}
      />
      <div style={{ textAlign: 'center' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {t('auth.demoHint')}
        </Text>
      </div>
    </Card>
  );
};

export default Login;
