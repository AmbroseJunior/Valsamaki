import type { Metadata, Viewport } from 'next'
import { Nunito_Sans, Varela_Round } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale } from 'next-intl/server'
import { Providers } from './providers'
import { Navbar } from '@/components/shared/Navbar'
import { BottomNav } from '@/components/shared/BottomNav'
import { OfflineBanner } from '@/components/shared/OfflineBanner'
import { WeatherBox } from '@/components/shared/WeatherBox'
import { FloatingChatbot } from '@/components/ai/FloatingChatbot'
import { WelcomeFlow } from '@/components/shared/WelcomeFlow'
import '@/styles/tokens.css'
import './globals.css'

const nunitoSans = Nunito_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  display: 'swap',
  adjustFontFallback: false,
})
const varelaRound = Varela_Round({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'Valsamaki — Crete', template: '%s | Valsamaki' },
  description: 'Discover authentic Cretan producers, events, and the Mediterranean diet with AI-powered local guidance.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Valsamaki' },
  keywords: ['Crete', 'Cretan food', 'Mediterranean diet', 'local producers', 'events', 'Heraklion'],
  authors: [{ name: 'Valsamaki' }],
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#FCDA06',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} className={`${nunitoSans.variable} ${varelaRound.variable}`} suppressHydrationWarning>
      <head />
      <body className="bg-[var(--color-background)] text-[var(--color-foreground)] font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <WelcomeFlow />
            <OfflineBanner />
            <Navbar />
            <main className="min-h-screen pt-[var(--nav-height)] pb-[var(--bottom-nav-height)] md:pb-0">
              {children}
            </main>
            <BottomNav />
            <WeatherBox />
            <FloatingChatbot />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
