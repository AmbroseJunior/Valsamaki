import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4'

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

    const { message } = await req.json() as { message: string }

    const { data: profile } = await supabase
      .from('profiles')
      .select('preferences, location_lat, location_lng')
      .eq('id', user.id)
      .single()

    const { data: memory } = await supabase
      .from('ai_memory')
      .select('role, content')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    const client = new OpenAI({
      apiKey: Deno.env.get('DEEPSEEK_API_KEY'),
      baseURL: 'https://api.deepseek.com/v1',
    })

    const historyMessages = (memory ?? []).reverse().map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    const response = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `You are Valsamaki, an expert on Crete, Mediterranean diet, and local producers.
User preferences: ${JSON.stringify(profile?.preferences)}.
Always ground your answers in the local context first.`,
        },
        ...historyMessages,
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    })

    const reply = response.choices[0]?.message?.content ?? 'No response generated.'
    const sessionId = `edge_${Date.now()}`

    await supabase.from('ai_memory').insert([
      { user_id: user.id, session_id: sessionId, role: 'user', content: message },
      { user_id: user.id, session_id: sessionId, role: 'assistant', content: reply },
    ])

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
