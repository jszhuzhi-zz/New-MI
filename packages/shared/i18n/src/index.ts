import zhCN from './locales/zh-CN';
import zhTW from './locales/zh-TW';
import en from './locales/en';

export type Locale = 'zh-CN' | 'zh-TW' | 'en';

export interface TranslationMap {
  [key: string]: string | TranslationMap;
}

const locales: Record<Locale, TranslationMap> = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  en,
};

/** Get nested value from translation map */
function getNestedValue(obj: TranslationMap, path: string): string | undefined {
  const keys = path.split('.');
  let current: TranslationMap | string = obj;
  for (const key of keys) {
    if (typeof current === 'string' || current === undefined) return undefined;
    current = current[key] as TranslationMap | string;
  }
  return typeof current === 'string' ? current : undefined;
}

/** Translate function */
export function t(locale: Locale, key: string, params?: Record<string, string | number>): string {
  const translations = locales[locale];
  let text = getNestedValue(translations, key);

  if (!text) {
    // Fallback to en
    text = getNestedValue(locales.en, key);
  }

  if (!text) return key;

  // Replace params
  if (params) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
    }
  }

  return text;
}

/** Create a scoped translator */
export function createTranslator(locale: Locale, scope?: string) {
  return (key: string, params?: Record<string, string | number>) => {
    const fullKey = scope ? `${scope}.${key}` : key;
    return t(locale, fullKey, params);
  };
}

export { zhCN, zhTW, en };
export default locales;
