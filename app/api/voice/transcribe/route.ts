import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/security'

// OWASP A07 — 10 transcriptions per user per minute
const RATE_LIMIT = { limit: 10, windowMs: 60_000 }
// OWASP A04 — 10 MB max audio upload
const MAX_FILE_BYTES = 10 * 1024 * 1024
const ALLOWED_MIME_TYPES = new Set([
  'audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav',
  'audio/ogg', 'audio/flac', 'audio/x-m4a',
])

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const rl = rateLimit(`transcribe:${user.id}`, RATE_LIMIT.limit, RATE_LIMIT.windowMs)
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) } }
      )
    }

    const form = await request.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No audio file' }, { status: 400 })

    // OWASP A04 — validate MIME type (allowlist) and file size
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Unsupported audio format' }, { status: 415 })
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: 'Audio file too large (max 10 MB)' }, { status: 413 })
    }

    const whisperClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY ?? process.env.DEEPSEEK_API_KEY ?? '',
    })

    const transcription = await whisperClient.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language: 'el',
      prompt: 'This audio may contain a Cretan Greek accent.',
    })

    return NextResponse.json({ text: transcription.text })
  } catch {
    return NextResponse.json({ error: 'Transcription failed', text: '' }, { status: 500 })
  }
}
