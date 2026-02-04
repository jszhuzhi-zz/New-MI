import { useCallback, useMemo } from 'react';
import { useAuthStore, MemberProfile, RegisterData } from '../store/auth';

/**
 * Hook for authentication state and actions.
 * Wraps the auth Zustand store with convenience methods.
 */
export function useAuth() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  const loginWithOtp = useAuthStore((s) => s.loginWithOtp);
  const loginWithWechat = useAuthStore((s) => s.loginWithWechat);
  const loginWithApple = useAuthStore((s) => s.loginWithApple);
  const register = useAuthStore((s) => s.register);
  const logout = useAuthStore((s) => s.logout);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const requestOtp = useAuthStore((s) => s.requestOtp);
  const resetPassword = useAuthStore((s) => s.resetPassword);

  const memberDisplayName = useMemo(() => {
    if (!user) return '';
    return user.displayName || `${user.lastName || ''}${user.firstName || ''}`.trim() || user.phone;
  }, [user]);

  const tierColor = useMemo(() => {
    if (!user) return '#00694B';
    const tierColors: Record<string, string> = {
      green: '#00694B',
      silver: '#9E9E9E',
      gold: '#C4A962',
      platinum: '#424242',
      diamond: '#7B1FA2',
    };
    return tierColors[user.tier] || '#00694B';
  }, [user]);

  const tierDisplayName = useMemo(() => {
    if (!user) return '';
    return user.tierNameZh;
  }, [user]);

  const formattedCardNumber = useMemo(() => {
    if (!user) return '';
    return user.cardNumber;
  }, [user]);

  const formattedPhone = useMemo(() => {
    if (!user) return '';
    return `${user.phoneCountryCode} ${user.phone}`;
  }, [user]);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  return {
    // State
    isAuthenticated,
    isLoading,
    user,
    token,

    // Derived
    memberDisplayName,
    tierColor,
    tierDisplayName,
    formattedCardNumber,
    formattedPhone,

    // Actions
    loginWithOtp,
    loginWithWechat,
    loginWithApple,
    register,
    logout: handleLogout,
    updateProfile,
    refreshProfile,
    requestOtp,
    resetPassword,
  };
}

export default useAuth;
