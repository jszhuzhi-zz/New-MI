import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MallUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  phone?: string;
  avatar?: string;
  /** The project/mall this user manages */
  projectId: string;
  projectName: string;
  groupId: string;
  roleIds: string[];
  roleName: string;
  permissions: string[];
  lastLoginAt?: string;
}

interface AuthState {
  user: MallUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;

  login: (user: MallUser, token: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<MallUser>) => void;
  setLoading: (loading: boolean) => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      loading: false,

      login: (user, token, refreshToken) =>
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
          loading: false,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          loading: false,
        }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      setLoading: (loading) => set({ loading }),

      hasPermission: (permission) => {
        const { user } = get();
        if (!user) return false;
        return user.permissions.includes(permission) || user.permissions.includes('*');
      },
    }),
    {
      name: 'mall-admin-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
