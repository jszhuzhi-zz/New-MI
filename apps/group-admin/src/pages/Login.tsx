import React, { useState } from 'react';
import { Form, Input, Button, Divider, Space, Tabs, message, Typography } from 'antd';
import { UserOutlined, LockOutlined, MobileOutlined, WindowsOutlined, SafetyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLocale } from '../hooks/useLocale';
import type { AuthUser } from '../store/auth';

const { Text } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [smsLoading, setSmsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLocale();

  const handlePasswordLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockUser: AuthUser = {
        id: 'group-admin-001',
        username: values.username,
        email: 'admin@linkreit.com',
        displayName: 'Group Admin',
        roles: ['super-admin'],
        permissions: ['*'],
        entityType: 'group',
        entityId: 'group-001',
      };
      login(mockUser, 'mock-jwt-token-group-admin');
      message.success(t('auth.loginSuccess'));
      navigate('/dashboard');
    } catch {
      message.error(t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSmsLogin = async (values: { phone: string; code: string }) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockUser: AuthUser = {
        id: 'group-admin-002',
        username: values.phone,
        email: 'admin@linkreit.com',
        displayName: 'Group Admin',
        roles: ['super-admin'],
        permissions: ['*'],
        entityType: 'group',
        entityId: 'group-001',
      };
      login(mockUser, 'mock-jwt-token-group-admin-sms');
      message.success(t('auth.loginSuccess'));
      navigate('/dashboard');
    } catch {
      message.error(t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleM365Login = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const mockUser: AuthUser = {
        id: 'group-admin-003',
        username: 'admin@linkreit.onmicrosoft.com',
        email: 'admin@linkreit.onmicrosoft.com',
        displayName: 'M365 Admin',
        roles: ['super-admin'],
        permissions: ['*'],
        entityType: 'group',
        entityId: 'group-001',
      };
      login(mockUser, 'mock-jwt-token-group-admin-m365');
      message.success(t('auth.loginSuccess'));
      navigate('/dashboard');
    } catch {
      message.error(t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSendSmsCode = () => {
    setSmsLoading(true);
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setSmsLoading(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const tabItems = [
    {
      key: 'password',
      label: t('auth.password'),
      children: (
        <Form onFinish={handlePasswordLogin} size="large" layout="vertical">
          <Form.Item
            name="username"
            rules={[{ required: true, message: t('auth.username') }]}
          >
            <Input prefix={<UserOutlined />} placeholder={t('auth.username')} />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: t('auth.password') }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder={t('auth.password')} />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <a>{t('auth.forgotPassword')}</a>
            </Space>
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
      label: t('auth.smsCode'),
      children: (
        <Form onFinish={handleSmsLogin} size="large" layout="vertical">
          <Form.Item
            name="phone"
            rules={[{ required: true, message: t('member.phone') }]}
          >
            <Input prefix={<MobileOutlined />} placeholder={t('member.phone')} />
          </Form.Item>
          <Form.Item
            name="code"
            rules={[{ required: true, message: t('auth.smsCode') }]}
          >
            <Input
              prefix={<SafetyOutlined />}
              placeholder={t('auth.smsCode')}
              suffix={
                <Button
                  type="link"
                  size="small"
                  disabled={countdown > 0}
                  loading={smsLoading && countdown === 0}
                  onClick={handleSendSmsCode}
                >
                  {countdown > 0 ? `${countdown}s` : t('auth.sendCode')}
                </Button>
              }
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
  ];

  return (
    <div>
      <Tabs items={tabItems} centered />
      <Divider plain>
        <Text type="secondary" style={{ fontSize: 12 }}>
          OR
        </Text>
      </Divider>
      <Button
        icon={<WindowsOutlined />}
        onClick={handleM365Login}
        loading={loading}
        block
        size="large"
        style={{ marginBottom: 8 }}
      >
        {t('auth.m365Login')}
      </Button>
    </div>
  );
};

export default Login;
