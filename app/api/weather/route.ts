import { NextResponse } from 'next/server'
import { getWeather } from '@/lib/api/external'

export const revalidate = 1800

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const lat = parseFloat(searchParams.get('lat') ?? '35.3387')
  const lng = parseFloat(searchParams.get('lng') ?? '25.1442')
  const weather = await getWeather(
    isFinite(lat) ? lat : 35.3387,
    isFinite(lng) ? lng : 25.1442,
  )
  return NextResponse.json(weather)
}
