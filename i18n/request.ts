import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'
import { SUPPORTED_LOCALES } from '@/lib/i18n/locales'
import type { Locale } from '@/lib/i18n/locales'

export type { Locale }
export { SUPPORTED_LOCALES }

function resolveLocale(raw: string | undefined): Locale {
  if (!raw) return 'el'
  const lang = raw.split('-')[0].toLowerCase()
  return SUPPORTED_LOCALES.includes(lang as Locale) ? (lang as Locale) : 'el'
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const locale = resolveLocale(cookieStore.get('locale')?.value)

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
