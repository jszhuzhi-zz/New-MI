import React from 'react';
import { Dropdown, Button, Space } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import type { Locale } from '@link-reit/i18n';
import { useLocale } from '../hooks/useLocale';

const localeLabels: Record<Locale, string> = {
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  en: 'English',
};

const localeShortLabels: Record<Locale, string> = {
  'zh-CN': '简体',
  'zh-TW': '繁體',
  en: 'EN',
};

interface LocaleSwitcherProps {
  compact?: boolean;
}

const LocaleSwitcher: React.FC<LocaleSwitcherProps> = ({ compact = false }) => {
  const { locale, setLocale } = useLocale();

  const items = (Object.keys(localeLabels) as Locale[]).map((key) => ({
    key,
    label: localeLabels[key],
    onClick: () => setLocale(key),
  }));

  return (
    <Dropdown menu={{ items, selectedKeys: [locale] }} trigger={['click']}>
      <Button type="text" size={compact ? 'small' : 'middle'}>
        <Space>
          <GlobalOutlined />
          {compact ? localeShortLabels[locale] : localeLabels[locale]}
        </Space>
      </Button>
    </Dropdown>
  );
};

export default LocaleSwitcher;
