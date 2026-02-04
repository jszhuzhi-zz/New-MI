import { useCallback } from 'react';
import { t as translate, Locale } from '@link-reit/i18n';
import { useAuthStore } from '../store/auth';

export function useLocale() {
  const locale = useAuthStore((s) => s.locale);
  const setLocale = useAuthStore((s) => s.setLocale);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(locale, key, params),
    [locale],
  );

  return { t, locale, setLocale };
}
