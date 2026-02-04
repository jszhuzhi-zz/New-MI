import { useCallback } from 'react';
import { useAppStore, Locale, translations, t } from '../store/app';

/**
 * Hook for locale management and translation.
 * Provides current locale, translation function, and locale switching.
 */
export function useLocale() {
  const locale = useAppStore((s) => s.locale);
  const setLocale = useAppStore((s) => s.setLocale);

  const translate = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let text = translations[key]?.[locale] || key;

      // Simple parameter interpolation: {{paramName}}
      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          text = text.replace(`{{${paramKey}}}`, String(paramValue));
        });
      }

      return text;
    },
    [locale]
  );

  const switchLocale = useCallback(
    (newLocale: Locale) => {
      setLocale(newLocale);
    },
    [setLocale]
  );

  const localeOptions: { value: Locale; label: string; nativeLabel: string }[] = [
    { value: 'zh-TW', label: 'Traditional Chinese', nativeLabel: '繁體中文' },
    { value: 'zh-CN', label: 'Simplified Chinese', nativeLabel: '简体中文' },
    { value: 'en', label: 'English', nativeLabel: 'English' },
  ];

  const currentLocaleName = localeOptions.find((o) => o.value === locale)?.nativeLabel || locale;

  return {
    locale,
    t: translate,
    setLocale: switchLocale,
    localeOptions,
    currentLocaleName,
  };
}

export default useLocale;
