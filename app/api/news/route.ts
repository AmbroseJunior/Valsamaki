import { NextResponse } from 'next/server'
import { getCretanNews } from '@/lib/api/external'

export const revalidate = 3600

export async function GET() {
  const articles = await getCretanNews()
  return NextResponse.json(articles)
}
