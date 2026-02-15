import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar, List, Radio, Card } from 'antd-mobile';
import { CheckCircleFill } from 'antd-mobile-icons';
import { useSettingsStore, type Locale, type Theme, themeConfigs } from '../../store/settings';
import { useTranslation } from '../../locales';

const languages: { value: Locale; label: string; native: string }[] = [
  { value: 'zh-TW', label: '繁體中文', native: '繁體中文' },
  { value: 'zh-CN', label: '简体中文', native: '简体中文' },
  { value: 'en', label: 'English', native: 'English' },
];

const themes: { value: Theme; labelKey: string }[] = [
  { value: 'green', labelKey: 'settings.greenTheme' },
  { value: 'blue', labelKey: 'settings.blueTheme' },
  { value: 'purple', labelKey: 'settings.purpleTheme' },
  { value: 'gold', labelKey: 'settings.goldTheme' },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { locale, theme, setLocale, setTheme, getThemeColors } = useSettingsStore();
  const colors = getThemeColors();

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <NavBar
        onBack={() => navigate(-1)}
        style={{
          '--height': '44px',
          background: colors.primary,
          color: '#fff',
        } as React.CSSProperties}
      >
        {t('settings.title')}
      </NavBar>

      {/* Language Settings */}
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#666', marginBottom: 8, paddingLeft: 4 }}>
          {t('settings.languageSettings')}
        </div>
        <Card style={{ borderRadius: 12 }}>
          <List style={{ '--border-top': 'none', '--border-bottom': 'none' } as React.CSSProperties}>
            {languages.map((lang) => (
              <List.Item
                key={lang.value}
                onClick={() => setLocale(lang.value)}
                extra={
                  locale === lang.value ? (
                    <CheckCircleFill color={colors.primary} fontSize={20} />
                  ) : null
                }
                style={{
                  '--active-background-color': `${colors.primary}10`,
                } as React.CSSProperties}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: locale === lang.value ? 600 : 400 }}>
                    {lang.native}
                  </span>
                </div>
              </List.Item>
            ))}
          </List>
        </Card>
      </div>

      {/* Theme Settings */}
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#666', marginBottom: 8, paddingLeft: 4 }}>
          {t('settings.themeSettings')}
        </div>
        <Card style={{ borderRadius: 12 }}>
          <div style={{ padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {themes.map((themeItem) => {
                const themeColors = themeConfigs[themeItem.value];
                const isActive = theme === themeItem.value;
                return (
                  <div
                    key={themeItem.value}
                    onClick={() => setTheme(themeItem.value)}
                    style={{
                      padding: 16,
                      borderRadius: 12,
                      border: isActive ? `2px solid ${themeColors.primary}` : '2px solid #eee',
                      background: isActive ? `${themeColors.primary}10` : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 12,
                    }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        background: `linear-gradient(135deg, ${themeColors.primaryLight} 0%, ${themeColors.primary} 50%, ${themeColors.primaryDark} 100%)`,
                      }} />
                      {isActive && <CheckCircleFill color={themeColors.primary} fontSize={18} />}
                    </div>
                    <div style={{
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? themeColors.primary : '#333',
                    }}>
                      {t(themeItem.labelKey as any)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Preview */}
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#666', marginBottom: 8, paddingLeft: 4 }}>
          Preview / 預覽
        </div>
        <Card style={{ borderRadius: 12 }}>
          <div style={{ padding: 16 }}>
            <div style={{
              padding: 16,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
              color: '#fff',
            }}>
              <div style={{ fontSize: 14, opacity: 0.9 }}>{t('home.hello')}，{t('home.member')}</div>
              <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>2,580</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>{t('home.availableStamps')}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <div style={{
                flex: 1,
                padding: '12px 8px',
                background: `${colors.primary}10`,
                borderRadius: 8,
                textAlign: 'center',
              }}>
                <div style={{ color: colors.primary, fontWeight: 600 }}>{t('common.scan')}</div>
              </div>
              <div style={{
                flex: 1,
                padding: '12px 8px',
                background: `${colors.primary}10`,
                borderRadius: 8,
                textAlign: 'center',
              }}>
                <div style={{ color: colors.primary, fontWeight: 600 }}>{t('common.offers')}</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
