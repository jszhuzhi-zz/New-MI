import React from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Badge, Avatar, Dialog, Toast, Button } from 'antd-mobile';
import { RightOutline, SetOutline } from 'antd-mobile-icons';
import { useAuthStore } from '../../store/auth';
import { useSettingsStore, type Locale } from '../../store/settings';
import { useTranslation } from '../../locales';

const GOLD = '#C4A962';

// Multilingual labels for login prompt
const labels: Record<string, Record<Locale, string>> = {
  loginTitle: { 'zh-TW': '登入會員', 'zh-CN': '登录会员', en: 'Login' },
  loginDesc: { 'zh-TW': '登入後享受專屬會員權益', 'zh-CN': '登录后享受专属会员权益', en: 'Login to enjoy member benefits' },
  loginBtn: { 'zh-TW': '立即登入', 'zh-CN': '立即登录', en: 'Login Now' },
  registerBtn: { 'zh-TW': '新會員註冊', 'zh-CN': '新会员注册', en: 'Register' },
  benefits: { 'zh-TW': '會員權益', 'zh-CN': '会员权益', en: 'Member Benefits' },
  benefit1: { 'zh-TW': '消費賺取印花獎賞', 'zh-CN': '消费赚取印花奖赏', en: 'Earn stamps on purchases' },
  benefit2: { 'zh-TW': '專屬優惠及活動', 'zh-CN': '专属优惠及活动', en: 'Exclusive offers & events' },
  benefit3: { 'zh-TW': '生日雙倍印花', 'zh-CN': '生日双倍印花', en: 'Birthday double stamps' },
  benefit4: { 'zh-TW': '免費泊車優惠', 'zh-CN': '免费泊车优惠', en: 'Free parking benefits' },
};

// Custom SVG Icons
const EditIcon = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M16.474 5.408l2.118 2.117m-.756-3.982L12.109 9.27a2.118 2.118 0 00-.58 1.082L11 13l2.648-.53c.41-.082.786-.283 1.082-.579l5.727-5.727a1.853 1.853 0 10-2.621-2.621z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 15v3a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h3" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TrophyIcon = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M12 15a6 6 0 006-6V4H6v5a6 6 0 006 6z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 4H4a2 2 0 00-2 2v1a4 4 0 004 4M18 4h2a2 2 0 012 2v1a4 4 0 01-4 4M12 15v3M8 21h8M10 18h4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BellIcon = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M18 8A6 6 0 106 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const HeartIcon = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LanguageIcon = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8"/>
    <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke={color} strokeWidth="1.8"/>
  </svg>
);

const PaletteIcon = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-1 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9z" stroke={color} strokeWidth="1.8"/>
    <circle cx="6.5" cy="11.5" r="1.5" fill={color}/>
    <circle cx="9.5" cy="7.5" r="1.5" fill={color}/>
    <circle cx="14.5" cy="7.5" r="1.5" fill={color}/>
    <circle cx="17.5" cy="11.5" r="1.5" fill={color}/>
  </svg>
);

const ChatIcon = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const InfoIcon = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8"/>
    <path d="M12 16v-4M12 8h.01" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CarIcon = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M19 17h1c.6 0 1-.4 1-1v-3c0-.6-.4-1-1-1h-1l-3-5c-.3-.6-1-1-1.6-1H8.6c-.6 0-1.3.4-1.6 1l-3 5H3c-.6 0-1 .4-1 1v3c0 .6.4 1 1 1h1" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="7" cy="17" r="2" stroke={color} strokeWidth="1.5"/>
    <circle cx="17" cy="17" r="2" stroke={color} strokeWidth="1.5"/>
    <path d="M5 12l2-4h10l2 4" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export default function ProfilePage() {
  const navigate = useNavigate();
  const { t, locale } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();

  const tl = (key: string) => labels[key]?.[locale] || labels[key]?.['zh-TW'] || key;

  const menuItems = [
    { label: t('profile.editProfile'), icon: <EditIcon color={colors.primary} />, path: '/profile/edit', badge: 0, requireAuth: true },
    { label: t('profile.stampHistory'), icon: <TrophyIcon color={colors.primary} />, path: '/tier', badge: 0, requireAuth: true },
    { label: t('parking.title'), icon: <CarIcon color={colors.primary} />, path: '/parking', badge: 0, requireAuth: true },
    { label: t('messages.title'), icon: <BellIcon color={colors.primary} />, path: '/messages', badge: 3, requireAuth: true },
    { label: t('favorites.title'), icon: <HeartIcon color={colors.primary} />, path: '/favorites', badge: 0, requireAuth: true },
    { label: t('settings.languageSettings'), icon: <LanguageIcon color={colors.primary} />, path: '/settings', badge: 0, requireAuth: false },
    { label: t('settings.themeSettings'), icon: <PaletteIcon color={colors.primary} />, path: '/settings', badge: 0, requireAuth: false },
    { label: t('support.aiService'), icon: <ChatIcon color={colors.primary} />, path: '/support', badge: 0, requireAuth: true },
    { label: t('profile.about'), icon: <InfoIcon color={colors.primary} />, path: '', badge: 0, requireAuth: false },
  ];

  const handleLogout = () => {
    Dialog.confirm({
      content: t('profile.logoutConfirm'),
      confirmText: t('common.confirm'),
      cancelText: t('common.cancel'),
      onConfirm: () => {
        logout();
        Toast.show({ content: t('profile.logoutSuccess'), icon: 'success' });
        navigate('/');
      },
    });
  };

  const handleMenuClick = (item: typeof menuItems[0]) => {
    if (item.path) {
      navigate(item.path);
    } else {
      Toast.show({ content: t('profile.featureInDev'), icon: 'fail' });
    }
  };

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div style={{ background: '#f5f5f5', minHeight: '100vh', paddingBottom: 60 }}>
        {/* Header */}
        <div
          style={{
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
            padding: '28px 20px 24px',
            color: '#fff',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <SetOutline
              fontSize={22}
              onClick={() => navigate('/settings')}
              style={{ cursor: 'pointer', opacity: 0.9 }}
            />
          </div>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
            onClick={() => navigate('/login')}
          >
            <Avatar
              style={{
                '--size': '64px',
                '--border-radius': '32px',
                background: 'rgba(255,255,255,0.2)',
                fontSize: 28,
              } as React.CSSProperties}
            >
              👤
            </Avatar>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{tl('loginTitle')}</div>
              <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>{tl('loginDesc')}</div>
            </div>
            <RightOutline style={{ fontSize: 18, opacity: 0.6 }} />
          </div>
        </div>

        {/* Login Buttons */}
        <div style={{ padding: '16px' }}>
          <Button
            block
            color="primary"
            onClick={() => navigate('/login')}
            style={{ '--background-color': colors.primary, borderRadius: 12, height: 48, fontSize: 16, marginBottom: 12 } as React.CSSProperties}
          >
            {tl('loginBtn')}
          </Button>
          <Button
            block
            onClick={() => navigate('/login')}
            style={{ '--border-color': colors.primary, '--text-color': colors.primary, borderRadius: 12, height: 48, fontSize: 16 } as React.CSSProperties}
          >
            {tl('registerBtn')}
          </Button>
        </div>

        {/* Member Benefits */}
        <div style={{ padding: '0 16px' }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>{tl('benefits')}</div>
          <div style={{ background: '#fff', borderRadius: 12, padding: 16 }}>
            {[
              { icon: '🎁', text: tl('benefit1') },
              { icon: '🎉', text: tl('benefit2') },
              { icon: '🎂', text: tl('benefit3') },
              { icon: '🚗', text: tl('benefit4') },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 0',
                  borderBottom: idx < 3 ? '1px solid #f0f0f0' : 'none',
                }}
              >
                <span style={{ fontSize: 24 }}>{item.icon}</span>
                <span style={{ fontSize: 14, color: '#333' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div style={{ padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden' }}>
            <List style={{ '--border-top': 'none', '--border-bottom': 'none' } as React.CSSProperties}>
              {menuItems.filter(item => !item.requireAuth).map((item, idx) => (
                <List.Item
                  key={idx}
                  prefix={<span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>}
                  onClick={() => handleMenuClick(item)}
                  arrow={<RightOutline />}
                >
                  {item.label}
                </List.Item>
              ))}
            </List>
          </div>
        </div>

        {/* Version */}
        <div style={{ textAlign: 'center', padding: '8px 0 16px', color: '#ccc', fontSize: 12 }}>
          Link Mall v2.0.0
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', paddingBottom: 60 }}>
      {/* Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
          padding: '28px 20px 24px',
          color: '#fff',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <SetOutline
            fontSize={22}
            onClick={() => navigate('/settings')}
            style={{ cursor: 'pointer', opacity: 0.9 }}
          />
        </div>
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
            {user?.name?.charAt(0) || t('profile.defaultName').charAt(0)}
          </Avatar>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{user?.name || t('profile.defaultName')}</div>
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
              {user?.tierName || t('profile.goldMember')}
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
            { label: t('common.stamp'), value: (user?.stampBalance || 0).toLocaleString(), path: '/stamp' },
            { label: t('offers.myCoupons'), value: '5', path: '/offers' },
          ].map((stat, i) => (
            <div
              key={i}
              onClick={() => stat.path && navigate(stat.path)}
              style={{
                flex: 1,
                textAlign: 'center',
                borderRight: i < 1 ? '1px solid rgba(255,255,255,0.2)' : 'none',
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
            {menuItems.map((item, idx) => (
              <List.Item
                key={idx}
                prefix={<span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>}
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
          {t('profile.logout')}
        </div>
      </div>

      {/* Version */}
      <div style={{ textAlign: 'center', padding: '8px 0 16px', color: '#ccc', fontSize: 12 }}>
        Link Mall v2.0.0
      </div>
    </div>
  );
}
