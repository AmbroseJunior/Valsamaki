import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SUPPORTED_LOCALES } from '@/lib/i18n/locales'

export async function POST(req: NextRequest) {
  const body = await req.json() as { locale?: string }
  const locale = body?.locale

  if (!locale || !SUPPORTED_LOCALES.includes(locale as typeof SUPPORTED_LOCALES[number])) {
    return NextResponse.json({ error: 'Invalid locale' }, { status: 400 })
  }

  const res = NextResponse.json({ locale })
  res.cookies.set('locale', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    httpOnly: false,
  })
  return res
}
