import { useCallback } from 'react';
import { t as translate, createTranslator, type Locale } from '@link-reit/i18n';
import { useAppStore } from '../store/app';
import { useAuthStore } from '../store/auth';

export function useLocale() {
  const appLocale = useAppStore((s) => s.locale);
  const authLocale = useAuthStore((s) => s.locale);
  const setAppLocale = useAppStore((s) => s.setLocale);
  const setAuthLocale = useAuthStore((s) => s.setLocale);

  // Prefer app store locale, fallback to auth store
  const locale: Locale = appLocale || authLocale || 'zh-CN';

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

  const setLocale = useCallback(
    (newLocale: Locale) => {
      setAppLocale(newLocale);
      setAuthLocale(newLocale);
    },
    [setAppLocale, setAuthLocale]
  );

  return {
    locale,
    t,
    scopedT,
    setLocale,
  };
}
