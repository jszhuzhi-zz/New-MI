import { useCallback } from 'react';
import { t as translate, createTranslator, type Locale } from '@link-reit/i18n';
import { useAppStore } from '../store/app';

/** Hook for i18n translations in mall admin portal */
export function useLocale() {
  const locale = useAppStore((state) => state.locale);
  const setLocale = useAppStore((state) => state.setLocale);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      return translate(locale, key, params);
    },
    [locale]
  );

  const scopedT = useCallback(
    (scope: string) => {
      return createTranslator(locale, scope);
    },
    [locale]
  );

  const localeLabel: Record<Locale, string> = {
    'zh-CN': '简体中文',
    'zh-TW': '繁體中文',
    en: 'English',
  };

  return {
    locale,
    setLocale,
    t,
    scopedT,
    localeLabel,
  };
}
