import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body?.itinerary) {
    return NextResponse.json({ error: 'Missing itinerary' }, { status: 400 })
  }

  const { itinerary, days, interests, diet, style } = body

  // Save to Supabase
  const { data: saved, error: dbErr } = await supabase
    .from('itineraries')
    .insert({
      user_id: user.id,
      title: itinerary.title ?? 'My Crete Itinerary',
      tagline: itinerary.tagline ?? null,
      days_count: days ?? itinerary.days?.length ?? 1,
      interests: interests ?? [],
      diet: diet ?? 'none',
      style: style ?? 'balanced',
      data: itinerary,
    })
    .select('id')
    .single()

  if (dbErr) {
    console.error('[save-itinerary] DB error:', dbErr.message)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }

  // Email via Resend (graceful fallback if key missing)
  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    const emailHtml = buildEmailHtml(itinerary, user.email ?? '')
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: 'Valsamaki <itinerary@valsamaki.com>',
          to: [user.email!],
          subject: `🌿 Your Crete Itinerary: ${itinerary.title}`,
          html: emailHtml,
        }),
      })
    } catch (err) {
      console.error('[save-itinerary] Email error:', err)
    }
  }

  return NextResponse.json({ id: saved.id })
}

function buildEmailHtml(itinerary: Record<string, unknown>, email: string): string {
  const days = Array.isArray(itinerary.days) ? itinerary.days : []
  const title = String(itinerary.title ?? 'Your Crete Itinerary')
  const tagline = String(itinerary.tagline ?? '')

  const dayBlocks = days.map((d: Record<string, unknown>) => {
    const morning = d.morning as Record<string, unknown> | undefined
    const afternoon = d.afternoon as Record<string, unknown> | undefined
    const evening = d.evening as Record<string, unknown> | undefined
    return `
      <div style="margin-bottom:20px;padding:16px;border-radius:12px;background:#f9f7f4;border-left:4px solid #c8a96b;">
        <h3 style="margin:0 0 8px;color:#2d2418;font-size:16px;">Day ${d.day} — ${d.theme}</h3>
        ${morning ? `<p style="margin:4px 0;font-size:14px;color:#555;">☀️ <strong>Morning:</strong> ${morning.emoji} ${morning.activity} · ${morning.location} (${morning.duration})</p>` : ''}
        ${afternoon ? `<p style="margin:4px 0;font-size:14px;color:#555;">🌤 <strong>Afternoon:</strong> ${afternoon.emoji} ${afternoon.activity} · ${afternoon.location} (${afternoon.duration})</p>` : ''}
        ${evening ? `<p style="margin:4px 0;font-size:14px;color:#555;">🌙 <strong>Evening:</strong> ${evening.emoji} ${evening.activity} · ${evening.location} (${evening.duration})</p>` : ''}
      </div>`
  }).join('')

  const tips = Array.isArray(itinerary.packingTips)
    ? (itinerary.packingTips as string[]).map((t: string) => `<li style="margin-bottom:6px;font-size:14px;color:#555;">${t}</li>`).join('')
    : ''

  const phrase = itinerary.localPhrase as Record<string, unknown> | undefined

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:'Helvetica Neue',Arial,sans-serif;background:#faf9f6;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:28px;">
      <p style="font-size:28px;margin:0;">🫒</p>
      <h1 style="font-size:24px;color:#2d2418;margin:8px 0 4px;">${title}</h1>
      <p style="font-size:14px;color:#888;margin:0;">${tagline}</p>
    </div>
    ${dayBlocks}
    ${tips ? `
    <div style="margin-bottom:20px;padding:16px;border-radius:12px;background:#f0ece4;">
      <h3 style="margin:0 0 10px;color:#2d2418;font-size:14px;text-transform:uppercase;letter-spacing:1px;">🎒 Packing Tips</h3>
      <ul style="margin:0;padding-left:20px;">${tips}</ul>
    </div>` : ''}
    ${phrase ? `
    <div style="margin-bottom:20px;padding:16px;border-radius:12px;background:#fff8ec;text-align:center;">
      <p style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px;">🗣️ Greek Phrase of the Trip</p>
      <p style="font-size:22px;font-weight:bold;color:#c8a96b;margin:0 0 4px;">${phrase.greek}</p>
      <p style="font-size:13px;color:#888;font-style:italic;margin:0 0 4px;">"${phrase.pronunciation}"</p>
      <p style="font-size:13px;color:#555;margin:0;">${phrase.meaning}</p>
    </div>` : ''}
    <div style="text-align:center;margin-top:28px;padding-top:20px;border-top:1px solid #e8e2d8;">
      <p style="font-size:12px;color:#aaa;margin:0;">Generated by <strong>Valsamaki</strong> · Connecting Crete, one producer at a time 🫒</p>
      <p style="font-size:11px;color:#ccc;margin:4px 0 0;">Sent to ${email}</p>
    </div>
  </div>
</body>
</html>`
}
