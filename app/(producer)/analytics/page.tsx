import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RoleGate } from '@/components/shared/RoleGate'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, Heart, MousePointerClick, Ticket } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Analytics' }

async function AnalyticsDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('owner_id', user.id)

  const businessIds = (businesses ?? []).map((b) => b.id)

  const { data: interactions } = businessIds.length > 0
    ? await supabase
        .from('user_interactions')
        .select('entity_id, action, created_at')
        .in('entity_id', businessIds)
        .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString())
    : { data: [] }

  const stats = {
    views: (interactions ?? []).filter((i) => i.action === 'view').length,
    saves: (interactions ?? []).filter((i) => i.action === 'save').length,
    clicks: (interactions ?? []).filter((i) => i.action === 'click').length,
    rsvps: (interactions ?? []).filter((i) => i.action === 'rsvp').length,
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Views', value: stats.views, icon: Eye, color: 'var(--color-secondary)' },
          { label: 'Saves', value: stats.saves, icon: Heart, color: 'var(--color-terra)' },
          { label: 'Clicks', value: stats.clicks, icon: MousePointerClick, color: 'var(--color-primary)' },
          { label: 'RSVPs', value: stats.rsvps, icon: Ticket, color: 'var(--color-honey)' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-[var(--radius)] flex items-center justify-center" style={{ background: `${color}20` }}>
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">{label} · 30d</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Your Listings</CardTitle></CardHeader>
        <CardContent>
          {businesses?.length === 0 ? (
            <p className="text-sm text-[var(--color-muted-foreground)]">No businesses yet.</p>
          ) : (
            <div className="space-y-2">
              {businesses?.map((biz) => {
                const bizInteractions = (interactions ?? []).filter((i) => i.entity_id === biz.id)
                return (
                  <div key={biz.id} className="flex items-center justify-between p-3 rounded-[var(--radius)] border border-[var(--color-border)]">
                    <span className="font-medium text-sm">{biz.name}</span>
                    <div className="flex gap-2">
                      <Badge variant="muted">{bizInteractions.filter((i) => i.action === 'view').length} views</Badge>
                      <Badge variant="outline">{bizInteractions.filter((i) => i.action === 'save').length} saves</Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-center text-[var(--color-muted-foreground)]">Powered By Valsamaki 2026</p>
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <div className="max-w-[var(--max-content-width)] mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Business Analytics</h1>
        <p className="text-sm text-[var(--color-muted-foreground)] mt-1">Last 30 days performance</p>
      </div>
      <RoleGate allow={['producer', 'admin']}>
        <AnalyticsDashboard />
      </RoleGate>
    </div>
  )
}
