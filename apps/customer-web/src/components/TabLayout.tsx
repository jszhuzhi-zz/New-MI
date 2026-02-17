import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../locales';
import { useSettingsStore } from '../store/settings';

interface TabItem {
  key: string;
  title: string;
  icon: (active: boolean, primaryColor: string) => React.ReactNode;
  isCenter?: boolean;
}

// Custom SVG Icons for better design - accept primaryColor as prop
const HomeIcon = ({ active, primaryColor }: { active: boolean; primaryColor: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V10.5Z"
      stroke={active ? primaryColor : '#999'}
      strokeWidth="2"
      fill={active ? `${primaryColor}20` : 'none'}
    />
    <path
      d="M9 21V14H15V21"
      stroke={active ? primaryColor : '#999'}
      strokeWidth="2"
    />
  </svg>
);

const StampIcon = ({ active, primaryColor }: { active: boolean; primaryColor: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke={active ? primaryColor : '#999'}
      strokeWidth="2"
      fill={active ? `${primaryColor}20` : 'none'}
    />
    <path
      d="M12 7V12L15 15"
      stroke={active ? primaryColor : '#999'}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="12" cy="12" r="2" fill={active ? primaryColor : '#999'} />
  </svg>
);

const ScanIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="7" height="7" rx="1" stroke="#fff" strokeWidth="2" />
    <rect x="14" y="3" width="7" height="7" rx="1" stroke="#fff" strokeWidth="2" />
    <rect x="3" y="14" width="7" height="7" rx="1" stroke="#fff" strokeWidth="2" />
    <rect x="14" y="14" width="7" height="7" rx="1" stroke="#fff" strokeWidth="2" />
    <line x1="1" y1="12" x2="23" y2="12" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const OffersIcon = ({ active, primaryColor }: { active: boolean; primaryColor: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M20 12V22H4V12"
      stroke={active ? primaryColor : '#999'}
      strokeWidth="2"
      fill={active ? `${primaryColor}20` : 'none'}
    />
    <path
      d="M22 7H2V12H22V7Z"
      stroke={active ? primaryColor : '#999'}
      strokeWidth="2"
      fill={active ? `${primaryColor}20` : 'none'}
    />
    <path
      d="M12 22V7"
      stroke={active ? primaryColor : '#999'}
      strokeWidth="2"
    />
    <path
      d="M12 7C12 5.5 10.5 2 8 2C5.5 2 5 4 5 5C5 7 7 7 12 7"
      stroke={active ? primaryColor : '#999'}
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M12 7C12 5.5 13.5 2 16 2C18.5 2 19 4 19 5C19 7 17 7 12 7"
      stroke={active ? primaryColor : '#999'}
      strokeWidth="2"
      fill="none"
    />
  </svg>
);

const ProfileIcon = ({ active, primaryColor }: { active: boolean; primaryColor: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle
      cx="12"
      cy="8"
      r="4"
      stroke={active ? primaryColor : '#999'}
      strokeWidth="2"
      fill={active ? `${primaryColor}20` : 'none'}
    />
    <path
      d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20"
      stroke={active ? primaryColor : '#999'}
      strokeWidth="2"
      strokeLinecap="round"
      fill={active ? `${primaryColor}20` : 'none'}
    />
  </svg>
);

const TabLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { getThemeColors } = useSettingsStore();
  const colors = getThemeColors();

  const tabs: TabItem[] = [
    { key: '/', title: t('common.home'), icon: (active, primaryColor) => <HomeIcon active={active} primaryColor={primaryColor} /> },
    { key: '/stamp', title: t('common.stamp'), icon: (active, primaryColor) => <StampIcon active={active} primaryColor={primaryColor} /> },
    { key: '/scan', title: t('common.scan'), icon: () => <ScanIcon />, isCenter: true },
    { key: '/offers', title: t('common.offers'), icon: (active, primaryColor) => <OffersIcon active={active} primaryColor={primaryColor} /> },
    { key: '/profile', title: t('common.profile'), icon: (active, primaryColor) => <ProfileIcon active={active} primaryColor={primaryColor} /> },
  ];

  const isActive = (key: string) => {
    if (key === '/') return location.pathname === '/';
    return location.pathname.startsWith(key);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ flex: 1, paddingBottom: 64 }}>
        <Outlet />
      </div>

      {/* Fixed Bottom Tab Bar */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 56,
          background: '#fff',
          borderTop: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          paddingBottom: 'env(safe-area-inset-bottom)',
          zIndex: 100,
          boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
        }}
      >
        {tabs.map((tab) => {
          const active = isActive(tab.key);

          if (tab.isCenter) {
            return (
              <div
                key={tab.key}
                onClick={() => navigate(tab.key)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  marginTop: -20,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 12px ${colors.primary}66`,
                  }}
                >
                  {tab.icon(true, colors.primary)}
                </div>
                <span style={{
                  fontSize: 10,
                  marginTop: 2,
                  color: colors.primary,
                  fontWeight: 500,
                }}>
                  {tab.title}
                </span>
              </div>
            );
          }

          return (
            <div
              key={tab.key}
              onClick={() => navigate(tab.key)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '6px 12px',
              }}
            >
              {tab.icon(active, colors.primary)}
              <span
                style={{
                  fontSize: 10,
                  marginTop: 2,
                  color: active ? colors.primary : '#999',
                  fontWeight: active ? 500 : 400,
                }}
              >
                {tab.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TabLayout;
