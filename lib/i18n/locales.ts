export const SUPPORTED_LOCALES = ['en', 'el', 'es', 'fr', 'de', 'it', 'nl', 'ru', 'zh', 'ar', 'pt'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  el: 'Ελληνικά',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  nl: 'Nederlands',
  ru: 'Русский',
  zh: '中文',
  ar: 'العربية',
  pt: 'Português',
}

export const LOCALE_FLAGS: Record<Locale, string> = {
  en: '🇬🇧',
  el: '🇬🇷',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
  it: '🇮🇹',
  nl: '🇳🇱',
  ru: '🇷🇺',
  zh: '🇨🇳',
  ar: '🇸🇦',
  pt: '🇵🇹',
}
