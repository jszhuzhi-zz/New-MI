import { useCallback } from 'react';
import { useAuthStore, type MerchantUser } from '../store/auth';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const loginAction = useAuthStore((s) => s.login);
  const logoutAction = useAuthStore((s) => s.logout);

  const login = useCallback(
    (user: MerchantUser, token: string) => {
      loginAction(user, token);
    },
    [loginAction]
  );

  const logout = useCallback(() => {
    logoutAction();
  }, [logoutAction]);

  const hasPermission = useCallback(
    (permission: string) => {
      if (!user) return false;
      return user.permissions.includes(permission) || user.role === 'shop_manager';
    },
    [user]
  );

  const isManager = useCallback(() => {
    return user?.role === 'shop_manager';
  }, [user]);

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    hasPermission,
    isManager,
  };
}
