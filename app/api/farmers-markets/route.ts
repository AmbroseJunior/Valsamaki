import { NextResponse } from 'next/server'
import { FARMERS_MARKETS } from '@/lib/data/farmersMarkets'

export const revalidate = 86400

export async function GET() {
  return NextResponse.json(FARMERS_MARKETS)
}
