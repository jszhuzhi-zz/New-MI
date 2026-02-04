import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, theme as antdTheme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import zhTW from 'antd/locale/zh_TW';
import enUS from 'antd/locale/en_US';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/zh-tw';

import App from './App';
import { useAppStore } from './store/app';

// Set default dayjs locale
dayjs.locale('zh-cn');

const antdLocaleMap = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  en: enUS,
} as const;

const AppWithConfig: React.FC = () => {
  const locale = useAppStore((s) => s.locale);
  const themeMode = useAppStore((s) => s.theme);

  // Update dayjs locale when app locale changes
  React.useEffect(() => {
    if (locale === 'zh-CN') dayjs.locale('zh-cn');
    else if (locale === 'zh-TW') dayjs.locale('zh-tw');
    else dayjs.locale('en');
  }, [locale]);

  return (
    <ConfigProvider
      locale={antdLocaleMap[locale] || zhCN}
      theme={{
        algorithm: themeMode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif",
        },
        components: {
          Layout: {
            headerBg: '#ffffff',
            siderBg: '#ffffff',
          },
        },
      }}
    >
      <App />
    </ConfigProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppWithConfig />
  </React.StrictMode>
);
