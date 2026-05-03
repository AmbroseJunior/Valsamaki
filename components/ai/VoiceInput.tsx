'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Loader2 } from 'lucide-react'

interface VoiceInputProps {
  onTranscript: (text: string) => void
  disabled?: boolean
}

export function VoiceInput({ onTranscript, disabled }: VoiceInputProps) {
  const [recording, setRecording] = useState(false)
  const [processing, setProcessing] = useState(false)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      chunksRef.current = []

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        setProcessing(true)
        try {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
          const form = new FormData()
          form.append('file', blob, 'recording.webm')
          form.append('model', 'whisper-1')
          form.append('language', 'el')

          const res = await fetch('/api/voice/transcribe', { method: 'POST', body: form })
          const data = await res.json()
          if (data.text) onTranscript(data.text)
        } finally {
          setProcessing(false)
        }
      }

      mediaRef.current = recorder
      recorder.start()
      setRecording(true)
    } catch {
      // Microphone permission denied or unavailable
    }
  }

  function stopRecording() {
    mediaRef.current?.stop()
    mediaRef.current = null
    setRecording(false)
  }

  if (processing) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Loader2 className="h-5 w-5 animate-spin" />
      </Button>
    )
  }

  return (
    <Button
      variant={recording ? 'destructive' : 'ghost'}
      size="icon"
      onClick={recording ? stopRecording : startRecording}
      disabled={disabled}
      aria-label={recording ? 'Stop recording' : 'Start voice input'}
    >
      {recording ? <MicOff className="h-5 w-5 animate-pulse" /> : <Mic className="h-5 w-5" />}
    </Button>
  )
}
