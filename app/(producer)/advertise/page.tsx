'use client'

import { useState } from 'react'
import { RoleGate } from '@/components/shared/RoleGate'
import { VoiceInput } from '@/components/ai/VoiceInput'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Mic, Sparkles, CheckCircle2 } from 'lucide-react'

interface ParsedListing {
  name?: string
  description?: string
  category?: string
  tags?: string[]
}

function VoiceSetupTool() {
  const [transcript, setTranscript] = useState('')
  const [parsed, setParsed] = useState<ParsedListing | null>(null)
  const [processing, setProcessing] = useState(false)

  async function processTranript(text: string) {
    setTranscript(text)
    setProcessing(true)
    try {
      const res = await fetch('/api/ai/voice-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text }),
      })
      const data = await res.json()
      setParsed(data.listing ?? null)
    } catch {
      // Graceful failure — user can type manually
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-[var(--color-primary)] border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-[var(--color-primary)]" />
            Voice Listing Setup
          </CardTitle>
          <CardDescription>
            Describe your business in Greek or English — our AI (Cretan accent aware) will structure it for you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-[var(--color-muted)] rounded-[var(--radius)]">
            <VoiceInput onTranscript={processTranript} disabled={processing} />
            <span className="text-sm text-[var(--color-muted-foreground)]">
              {transcript ? transcript : 'Press the mic and describe your business…'}
            </span>
          </div>

          {processing && (
            <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
              <LoadingSpinner size="sm" />
              <span>AI is processing your description…</span>
            </div>
          )}

          {parsed && (
            <div className="space-y-3 p-4 bg-[var(--color-card)] border border-[var(--color-border)] rounded-[var(--radius)]">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-success)]">
                <CheckCircle2 className="h-4 w-4" />
                AI extracted your listing — review and edit:
              </p>
              {(['name', 'description', 'category'] as const).map((field) => (
                <div key={field} className="space-y-1">
                  <Label className="capitalize">{field}</Label>
                  <Input
                    value={parsed[field] ?? ''}
                    onChange={(e) => setParsed((p) => ({ ...p, [field]: e.target.value }))}
                  />
                </div>
              ))}
              <Button className="w-full gap-2">
                <Sparkles className="h-4 w-4" /> Save to My Listings
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Promote Your Business</CardTitle>
          <CardDescription>Boost your listing visibility in search and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { tier: 'Basic', price: 'Free', features: ['Listed in search', 'Map marker', 'Basic profile'] },
              { tier: 'Featured', price: '€29/mo', features: ['Everything in Basic', 'Priority in recommendations', 'Highlighted on map'] },
              { tier: 'Premium', price: '€79/mo', features: ['Everything in Featured', 'Analytics dashboard', 'Direct chat badge'] },
            ].map(({ tier, price, features }) => (
              <Card key={tier} className={tier === 'Featured' ? 'border-[var(--color-primary)] border-2' : ''}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{tier}</CardTitle>
                  <p className="text-xl font-bold text-[var(--color-primary)]">{price}</p>
                </CardHeader>
                <CardContent className="space-y-1">
                  {features.map((f) => (
                    <p key={f} className="text-xs text-[var(--color-muted-foreground)] flex gap-1">
                      <span>✓</span>{f}
                    </p>
                  ))}
                  <Button size="sm" className="w-full mt-3" variant={tier === 'Featured' ? 'default' : 'outline'}>
                    Choose {tier}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdvertisePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Advertise & Promote</h1>
        <p className="text-sm text-[var(--color-muted-foreground)] mt-1">Set up your listing with voice or promote with targeted placement</p>
      </div>
      <RoleGate allow={['producer', 'admin']}>
        <VoiceSetupTool />
      </RoleGate>
    </div>
  )
}
