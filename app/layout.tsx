import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale } from 'next-intl/server'
import { Providers } from './providers'
import { Navbar } from '@/components/shared/Navbar'
import { BottomNav } from '@/components/shared/BottomNav'
import { OfflineBanner } from '@/components/shared/OfflineBanner'
import '@/styles/tokens.css'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'greek'], variable: '--font-sans' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-display' })

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
  themeColor: '#5C7A3E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head />
      <body className="bg-[var(--color-background)] text-[var(--color-foreground)] font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <OfflineBanner />
            <Navbar />
            <main className="min-h-screen pt-[var(--nav-height)] pb-[var(--bottom-nav-height)] md:pb-0">
              {children}
            </main>
            <BottomNav />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
