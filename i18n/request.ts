import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

const SUPPORTED_LOCALES = ['en', 'el'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

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
