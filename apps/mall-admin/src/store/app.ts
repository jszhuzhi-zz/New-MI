import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale } from '@link-reit/i18n';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createdAt: string;
}

interface AppState {
  /** Current locale */
  locale: Locale;
  /** Sidebar collapsed state */
  sidebarCollapsed: boolean;
  /** Current selected menu key */
  selectedMenuKey: string;
  /** Open menu keys (for sub-menus) */
  openMenuKeys: string[];
  /** Notifications */
  notifications: Notification[];
  /** Unread count */
  unreadCount: number;
  /** Current project context */
  currentProjectId: string | null;
  currentProjectName: string | null;

  setLocale: (locale: Locale) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSelectedMenuKey: (key: string) => void;
  setOpenMenuKeys: (keys: string[]) => void;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  setCurrentProject: (projectId: string, projectName: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      locale: 'zh-CN',
      sidebarCollapsed: false,
      selectedMenuKey: 'dashboard',
      openMenuKeys: ['member'],
      notifications: [
        {
          id: '1',
          title: '新的风控预警',
          message: '检测到3笔异常印花交易，请及时处理',
          type: 'warning',
          read: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: '积分清零提醒',
          message: '本月底将有 12,580 个会员的积分到期清零',
          type: 'info',
          read: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '3',
          title: '系统维护通知',
          message: '系统将于今晚 22:00-23:00 进行例行维护',
          type: 'info',
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
      unreadCount: 2,
      currentProjectId: null,
      currentProjectName: null,

      setLocale: (locale) => set({ locale }),

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      setSelectedMenuKey: (key) => set({ selectedMenuKey: key }),

      setOpenMenuKeys: (keys) => set({ openMenuKeys: keys }),

      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + (notification.read ? 0 : 1),
        })),

      markNotificationRead: (id) =>
        set((state) => {
          const notifications = state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          );
          const unreadCount = notifications.filter((n) => !n.read).length;
          return { notifications, unreadCount };
        }),

      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        })),

      setCurrentProject: (projectId, projectName) =>
        set({ currentProjectId: projectId, currentProjectName: projectName }),
    }),
    {
      name: 'mall-admin-app',
      partialize: (state) => ({
        locale: state.locale,
        sidebarCollapsed: state.sidebarCollapsed,
        currentProjectId: state.currentProjectId,
        currentProjectName: state.currentProjectName,
      }),
    }
  )
);
