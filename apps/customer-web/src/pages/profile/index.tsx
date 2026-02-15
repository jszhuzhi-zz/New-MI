import React from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Badge, Avatar, Dialog, Toast } from 'antd-mobile';
import {
  RightOutline,
} from 'antd-mobile-icons';
import { useAuthStore } from '../../store/auth';

const PRIMARY = '#00694B';
const GOLD = '#C4A962';

const menuItems = [
  { label: '編輯資料', icon: '✏️', path: '/profile/edit', badge: 0 },
  { label: '我的等級', icon: '🏆', path: '/tier', badge: 0 },
  { label: '印花商城', icon: '🎁', path: '/gifts', badge: 0 },
  { label: '消息中心', icon: '🔔', path: '', badge: 3 },
  { label: '收藏商鋪', icon: '❤️', path: '', badge: 0 },
  { label: '語言設置', icon: '🌐', path: '/settings', badge: 0 },
  { label: '意見反饋', icon: '💬', path: '', badge: 0 },
  { label: '關於我們', icon: '📋', path: '', badge: 0 },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    Dialog.confirm({
      content: '確定要退出登入嗎？',
      confirmText: '確定',
      cancelText: '取消',
      onConfirm: () => {
        logout();
        Toast.show({ content: '已退出登入', icon: 'success' });
      },
    });
  };

  const handleMenuClick = (item: typeof menuItems[0]) => {
    if (item.path) {
      navigate(item.path);
    } else {
      Toast.show({ content: '功能開發中', icon: 'fail' });
    }
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', paddingBottom: 60 }}>
      {/* Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${PRIMARY} 0%, #004D36 100%)`,
          padding: '28px 20px 24px',
          color: '#fff',
        }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
          onClick={() => navigate('/profile/edit')}
        >
          <Avatar
            src={user?.avatar || undefined}
            style={{
              '--size': '64px',
              '--border-radius': '32px',
              background: GOLD,
              fontSize: 28,
            } as React.CSSProperties}
          >
            {user?.name?.charAt(0) || '陳'}
          </Avatar>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{user?.name || '陳小明'}</div>
            <div
              style={{
                display: 'inline-block',
                background: GOLD,
                color: '#fff',
                padding: '2px 10px',
                borderRadius: 10,
                fontSize: 12,
                marginTop: 4,
              }}
            >
              {user?.tierName || 'Gold 金卡會員'}
            </div>
          </div>
          <RightOutline style={{ fontSize: 18, opacity: 0.6 }} />
        </div>

        {/* Stats Row */}
        <div
          style={{
            display: 'flex',
            marginTop: 20,
            background: 'rgba(255,255,255,0.12)',
            borderRadius: 12,
            padding: '14px 0',
          }}
        >
          {[
            { label: '印花', value: (user?.stampBalance || 2580).toLocaleString(), path: '/stamp' },
            { label: '優惠券', value: '5', path: '/offers' },
            { label: '禮品', value: '🎁', path: '/gifts' },
          ].map((stat, i) => (
            <div
              key={i}
              onClick={() => stat.path && navigate(stat.path)}
              style={{
                flex: 1,
                textAlign: 'center',
                borderRight: i < 2 ? '1px solid rgba(255,255,255,0.2)' : 'none',
                cursor: stat.path ? 'pointer' : 'default',
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 700 }}>{stat.value}</div>
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Menu List */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden' }}>
          <List style={{ '--border-top': 'none', '--border-bottom': 'none' } as React.CSSProperties}>
            {menuItems.map((item) => (
              <List.Item
                key={item.label}
                prefix={<span style={{ fontSize: 20 }}>{item.icon}</span>}
                onClick={() => handleMenuClick(item)}
                arrow={<RightOutline />}
                extra={
                  item.badge > 0 ? (
                    <Badge content={item.badge} style={{ '--right': '4px', '--top': '4px' } as React.CSSProperties} />
                  ) : undefined
                }
              >
                {item.label}
              </List.Item>
            ))}
          </List>
        </div>
      </div>

      {/* Logout */}
      <div style={{ padding: '16px' }}>
        <div
          onClick={handleLogout}
          style={{
            background: '#fff',
            borderRadius: 12,
            padding: '14px',
            textAlign: 'center',
            color: '#ff4d4f',
            fontSize: 15,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          退出登入
        </div>
      </div>

      {/* Version */}
      <div style={{ textAlign: 'center', padding: '8px 0 16px', color: '#ccc', fontSize: 12 }}>
        Link Mall v2.0.0
      </div>
    </div>
  );
}
