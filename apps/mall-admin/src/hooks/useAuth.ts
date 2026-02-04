import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { useAuthStore } from '../store/auth';
import { useLocale } from './useLocale';

/** Hook for authentication in mall admin portal */
export function useAuth() {
  const { user, token, isAuthenticated, loading, login, logout, setLoading, hasPermission } =
    useAuthStore();
  const navigate = useNavigate();
  const { t } = useLocale();

  const handleLogin = useCallback(
    async (username: string, password: string) => {
      setLoading(true);
      try {
        // Simulate API call - replace with actual API
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock mall admin user
        const mockUser = {
          id: 'mall-user-001',
          username,
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
      } catch (error) {
        message.error(t('auth.loginFailed'));
      } finally {
        setLoading(false);
      }
    },
    [login, navigate, setLoading, t]
  );

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  return {
    user,
    token,
    isAuthenticated,
    loading,
    login: handleLogin,
    logout: handleLogout,
    hasPermission,
  };
}
