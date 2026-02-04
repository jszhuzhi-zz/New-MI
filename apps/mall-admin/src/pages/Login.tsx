import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Divider, message } from 'antd';
import { UserOutlined, LockOutlined, WindowsOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { useLocale } from '../hooks/useLocale';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { t } = useLocale();
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const handleLogin = async (values: { username: string; password: string; remember: boolean }) => {
    setLoading(true);
    try {
      // Simulate API login
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockUser = {
        id: 'mall-user-001',
        username: values.username,
        displayName: '张经理',
        email: 'zhang@linkreit.com',
        phone: '+852 9876 5432',
        avatar: undefined,
        projectId: 'proj-t-town',
        projectName: 'T Town',
        groupId: 'link-reit-group',
        roleIds: ['mall-admin'],
        roleName: '商场管理员',
        permissions: ['*'],
        lastLoginAt: new Date().toISOString(),
      };

      login(mockUser, 'mock-jwt-token-mall', 'mock-refresh-token-mall');
      message.success(t('auth.loginSuccess'));
      navigate('/');
    } catch {
      message.error(t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleM365Login = () => {
    message.info('M365 AD SSO login - redirecting...');
  };

  return (
    <Form
      name="mall-admin-login"
      onFinish={handleLogin}
      initialValues={{ remember: true }}
      size="large"
    >
      <Form.Item
        name="username"
        rules={[{ required: true, message: t('auth.username') }]}
      >
        <Input
          prefix={<UserOutlined />}
          placeholder={t('auth.username')}
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[{ required: true, message: t('auth.password') }]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder={t('auth.password')}
        />
      </Form.Item>

      <Form.Item>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>{t('auth.rememberMe')}</Checkbox>
          </Form.Item>
          <a href="#">{t('auth.forgotPassword')}</a>
        </div>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          {t('auth.login')}
        </Button>
      </Form.Item>

      <Divider plain style={{ margin: '16px 0', fontSize: 12, color: '#999' }}>OR</Divider>

      <Button
        icon={<WindowsOutlined />}
        block
        onClick={handleM365Login}
        style={{ marginBottom: 8 }}
      >
        {t('auth.m365Login')}
      </Button>
    </Form>
  );
};

export default Login;
