/**
 * i18n helper for Vue 3 Composition API using @link-reit/i18n.
 * Provides reactive translation based on the current locale from Pinia store.
 */
import { computed } from 'vue';
import { t as translate, createTranslator, type Locale } from '@link-reit/i18n';
import { useAppStore } from '@/store/app';

/**
 * Composable for translations in Vue components.
 * Usage:
 *   const { t, locale } = useI18n();
 *   t('member.stampBalance') // reactive, re-computes when locale changes
 *
 *   const { t } = useI18n('stamp'); // scoped
 *   t('balance') // resolves to 'stamp.balance'
 */
export function useI18n(scope?: string) {
  const appStore = useAppStore();

  const locale = computed<Locale>(() => appStore.locale);

  function t(key: string, params?: Record<string, string | number>): string {
    const fullKey = scope ? `${scope}.${key}` : key;
    return translate(locale.value, fullKey, params);
  }

  /** Get text from a MultiLangText object based on current locale */
  function ml(text: { 'zh-CN': string; 'zh-TW': string; en: string } | undefined | null): string {
    if (!text) return '';
    return text[locale.value] || text['zh-TW'] || text.en || '';
  }

  return {
    t,
    ml,
    locale,
  };
}

/** Standalone translate function (non-reactive, for imperative use) */
export function getTranslation(key: string, params?: Record<string, string | number>): string {
  const locale = (uni.getStorageSync('locale') as Locale) || 'zh-TW';
  return translate(locale, key, params);
}

/** Get value from MultiLangText (non-reactive) */
export function getMultiLangText(text: { 'zh-CN': string; 'zh-TW': string; en: string } | undefined | null): string {
  if (!text) return '';
  const locale = (uni.getStorageSync('locale') as Locale) || 'zh-TW';
  return text[locale] || text['zh-TW'] || text.en || '';
}

export { type Locale };
