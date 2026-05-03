import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const form = await request.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No audio file' }, { status: 400 })

    const whisperClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY ?? process.env.DEEPSEEK_API_KEY ?? '',
    })

    const transcription = await whisperClient.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language: 'el',
      prompt: 'This audio may contain a Cretan Greek accent. Common patterns include ts for ks, vowel dropping in unstressed syllables, and Greek-English code-switching.',
    })

    return NextResponse.json({ text: transcription.text })
  } catch {
    return NextResponse.json({ error: 'Transcription failed', text: '' }, { status: 500 })
  }
}
