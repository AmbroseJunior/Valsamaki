import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response('Unauthorized', { status: 401 })

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) return new Response('Unauthorized', { status: 401 })

    const { lat, lng } = await req.json() as { lat: number; lng: number }

    await supabase
      .from('profiles')
      .update({ location_lat: lat, location_lng: lng, last_seen_at: new Date().toISOString() })
      .eq('id', user.id)

    const latDelta = 10 / 111
    const lngDelta = 10 / (111 * Math.cos((lat * Math.PI) / 180))

    const [{ data: businesses }, { data: events }] = await Promise.all([
      supabase
        .from('businesses')
        .select('id, name, category, lat, lng')
        .eq('is_active', true)
        .gte('lat', lat - latDelta)
        .lte('lat', lat + latDelta)
        .gte('lng', lng - lngDelta)
        .lte('lng', lng + lngDelta)
        .limit(20),
      supabase
        .from('events')
        .select('id, title, category, event_date, lat, lng')
        .eq('is_active', true)
        .gte('event_date', new Date().toISOString())
        .gte('lat', lat - latDelta)
        .lte('lat', lat + latDelta)
        .gte('lng', lng - lngDelta)
        .lte('lng', lng + lngDelta)
        .limit(20),
    ])

    return new Response(
      JSON.stringify({ businesses: businesses ?? [], events: events ?? [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
