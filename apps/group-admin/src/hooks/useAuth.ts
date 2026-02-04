import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, type AuthUser } from '../store/auth';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const loginAction = useAuthStore((s) => s.login);
  const logoutAction = useAuthStore((s) => s.logout);

  const login = useCallback(
    (user: AuthUser, token: string) => {
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
      return user.permissions.includes(permission) || user.roles.includes('super-admin');
    },
    [user]
  );

  const hasRole = useCallback(
    (role: string) => {
      if (!user) return false;
      return user.roles.includes(role);
    },
    [user]
  );

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    hasPermission,
    hasRole,
  };
}
