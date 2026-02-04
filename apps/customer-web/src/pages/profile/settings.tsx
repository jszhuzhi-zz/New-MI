import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar, Radio, Button, Toast, Card, Space } from 'antd-mobile';
import { useAuthStore, Locale } from '../../store/auth';

const PRIMARY = '#00694B';

const languages = [
  { value: 'zh-TW' as Locale, label: '繁體中文', desc: 'Traditional Chinese' },
  { value: 'zh-CN' as Locale, label: '简体中文', desc: 'Simplified Chinese' },
  { value: 'en' as Locale, label: 'English', desc: 'English' },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const currentLocale = useAuthStore((s) => s.locale);
  const setLocale = useAuthStore((s) => s.setLocale);
  const [selected, setSelected] = useState<Locale>(currentLocale);

  const handleSave = () => {
    setLocale(selected);
    Toast.show({ content: '語言設置已更新', icon: 'success' });
    navigate(-1);
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <NavBar onBack={() => navigate(-1)} style={{ background: '#fff' }}>語言設置</NavBar>

      <div style={{ padding: 16 }}>
        <Card style={{ borderRadius: 12 }}>
          <Radio.Group
            value={selected}
            onChange={(val) => setSelected(val as Locale)}
          >
            <Space direction="vertical" block style={{ '--gap': '0px' } as React.CSSProperties}>
              {languages.map((lang) => (
                <div
                  key={lang.value}
                  style={{
                    padding: '14px 0',
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 500, color: '#333' }}>{lang.label}</div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{lang.desc}</div>
                  </div>
                  <Radio
                    value={lang.value}
                    style={{
                      '--icon-size': '22px',
                      '--font-size': '16px',
                    } as React.CSSProperties}
                  />
                </div>
              ))}
            </Space>
          </Radio.Group>
        </Card>

        <Button
          block
          color="primary"
          size="large"
          onClick={handleSave}
          style={{
            marginTop: 24,
            '--background-color': PRIMARY,
            '--border-color': PRIMARY,
            borderRadius: 12,
            fontWeight: 600,
          } as React.CSSProperties}
        >
          儲存
        </Button>
      </div>
    </div>
  );
}
