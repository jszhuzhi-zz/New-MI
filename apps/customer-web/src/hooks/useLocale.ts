import { useCallback } from 'react';
import { t as translate, Locale } from '@link-reit/i18n';
import { useSettingsStore } from '../store/settings';

export function useLocale() {
  const locale = useSettingsStore((s) => s.locale) as Locale;
  const setLocale = useSettingsStore((s) => s.setLocale);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(locale, key, params),
    [locale],
  );

  return { t, locale, setLocale };
}
