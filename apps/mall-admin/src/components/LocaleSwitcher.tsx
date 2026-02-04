import React from 'react';
import { Dropdown, Button } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { Locale } from '@link-reit/i18n';
import { useLocale } from '../hooks/useLocale';

const localeOptions: { key: Locale; label: string }[] = [
  { key: 'zh-CN', label: '简体中文' },
  { key: 'zh-TW', label: '繁體中文' },
  { key: 'en', label: 'English' },
];

const LocaleSwitcher: React.FC = () => {
  const { locale, setLocale, localeLabel } = useLocale();

  const menuItems: MenuProps['items'] = localeOptions.map((opt) => ({
    key: opt.key,
    label: opt.label,
    style: opt.key === locale ? { fontWeight: 600, color: '#1890ff' } : undefined,
  }));

  const handleClick: MenuProps['onClick'] = ({ key }) => {
    setLocale(key as Locale);
  };

  return (
    <Dropdown menu={{ items: menuItems, onClick: handleClick }} placement="bottomRight">
      <Button type="text" icon={<GlobalOutlined />} style={{ color: 'inherit' }}>
        {localeLabel[locale]}
      </Button>
    </Dropdown>
  );
};

export default LocaleSwitcher;
