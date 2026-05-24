import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data } = await supabase.rpc('get_waitlist_count')
  return NextResponse.json({ count: Number(data ?? 0) })
}
