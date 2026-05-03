import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SUPPORTED = ['en', 'el']

export async function POST(req: NextRequest) {
  const { locale } = await req.json() as { locale?: string }
  if (!locale || !SUPPORTED.includes(locale)) {
    return NextResponse.json({ error: 'Invalid locale' }, { status: 400 })
  }

  const res = NextResponse.json({ locale })
  res.cookies.set('locale', locale, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
  return res
}
