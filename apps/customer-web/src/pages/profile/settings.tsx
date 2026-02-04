import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar, Card, Radio, Button, Toast } from 'antd-mobile';
import { useAuthStore, Locale } from '../../store/auth';

const PRIMARY = '#00694B';

export default function SettingsPage() {
  const navigate = useNavigate();
  const locale = useAuthStore((s) => s.locale);
  const setLocale = useAuthStore((s) => s.setLocale);

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <NavBar onBack={() => navigate(-1)} style={{ background: '#fff' }}>語言設置</NavBar>
      <div style={{ padding: 16 }}>
        <Card title="選擇語言 / Language">
          <Radio.Group
            value={locale}
            onChange={(val) => setLocale(val as Locale)}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '8px 0' }}>
              <Radio value="zh-TW" style={{ '--icon-size': '22px', '--font-size': '16px' } as any}>
                繁體中文 (香港)
              </Radio>
              <Radio value="zh-CN" style={{ '--icon-size': '22px', '--font-size': '16px' } as any}>
                简体中文
              </Radio>
              <Radio value="en" style={{ '--icon-size': '22px', '--font-size': '16px' } as any}>
                English
              </Radio>
            </div>
          </Radio.Group>
        </Card>
        <Button
          block color="primary" size="large"
          style={{ marginTop: 24, '--background-color': PRIMARY, borderRadius: 12, fontWeight: 600 } as any}
          onClick={() => { Toast.show('語言已更新'); navigate(-1); }}
        >
          保存
        </Button>
      </div>
    </div>
  );
}
