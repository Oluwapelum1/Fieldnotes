// lib/i18n.ts — Locale metadata, RTL detection, and typed message dictionary loader
import type { SupportedLocale } from './config-schema';

export const SUPPORTED_LOCALES: SupportedLocale[] = ['en', 'es', 'de', 'ar', 'ja'];

export interface LocaleMetadata {
  code: SupportedLocale;
  label: string;
  nativeLabel: string;
  dir: 'ltr' | 'rtl';
  langTag: string;
}

export const LOCALE_METADATA: Record<SupportedLocale, LocaleMetadata> = {
  en: { code: 'en', label: 'English', nativeLabel: 'English', dir: 'ltr', langTag: 'en-US' },
  es: { code: 'es', label: 'Spanish', nativeLabel: 'Español', dir: 'ltr', langTag: 'es-ES' },
  de: { code: 'de', label: 'German', nativeLabel: 'Deutsch', dir: 'ltr', langTag: 'de-DE' },
  ar: { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', dir: 'rtl', langTag: 'ar-SA' },
  ja: { code: 'ja', label: 'Japanese', nativeLabel: '日本語', dir: 'ltr', langTag: 'ja-JP' },
};

export function isRtlLocale(locale: string): boolean {
  return locale === 'ar';
}

export function normalizeLocale(raw?: string): SupportedLocale {
  if (raw && (SUPPORTED_LOCALES as string[]).includes(raw)) {
    return raw as SupportedLocale;
  }
  return 'en';
}

