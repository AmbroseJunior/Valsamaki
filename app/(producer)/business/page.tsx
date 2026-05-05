'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { validateUrl, validatePhone } from '@/lib/security'
import { RoleGate } from '@/components/shared/RoleGate'
import { BusinessProfile } from '@/components/producers/BusinessProfile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import { useRole } from '@/hooks/useRole'
import { Plus, Clock, CheckCircle2 } from 'lucide-react'
import type { BusinessRow } from '@/types/database'

function BusinessManager() {
  const { userId } = useRole()
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', category: '', address: '', phone: '', website: '' })
  const [formError, setFormError] = useState('')
  const supabase = createClient()
  const queryClient = useQueryClient()

  const { data: businesses, isLoading } = useQuery({
    queryKey: ['my-businesses', userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<BusinessRow[]> => {
      if (!userId) return []
      const { data } = await supabase.from('businesses').select('*').eq('owner_id', userId).order('created_at', { ascending: false })
      return (data ?? []) as BusinessRow[]
    },
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Not authenticated')

      // OWASP A03 — validate all fields before sending to DB
      if (!form.name.trim() || form.name.length > 100) throw new Error('Name must be 1–100 characters')
      if (form.description.length > 1000) throw new Error('Description must be under 1000 characters')
      if (!form.category.trim()) throw new Error('Category is required')
      if (form.address.length > 200) throw new Error('Address must be under 200 characters')

      const phone = form.phone ? validatePhone(form.phone) : null
      if (form.phone && !phone) throw new Error('Invalid phone number format')

      // OWASP A10 — reject javascript: / data: / non-http(s) URLs
      const website = form.website ? validateUrl(form.website) : null
      if (form.website && !website) throw new Error('Website must be a valid https:// URL')

      const { error } = await supabase.from('businesses').insert({
        owner_id: userId,
        name: form.name.trim().slice(0, 100),
        description: form.description.trim().slice(0, 1000) || null,
        category: form.category.trim(),
        address: form.address.trim().slice(0, 200) || null,
        phone: phone ?? null,
        website: website ?? null,
        images: [],
        tags: [],
        is_active: false, // requires admin approval before appearing on map
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-businesses'] })
      setCreating(false)
      setFormError('')
      setForm({ name: '', description: '', category: '', address: '', phone: '', website: '' })
    },
    onError: (err: unknown) => {
      setFormError(err instanceof Error ? err.message : 'Failed to create listing')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('businesses').delete().eq('id', id).eq('owner_id', userId!)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-businesses'] }),
  })

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--color-muted-foreground)]">{businesses?.length ?? 0} listing{businesses?.length !== 1 ? 's' : ''}</p>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Business
        </Button>
      </div>

      {creating && (
        <Card>
          <CardHeader><CardTitle className="text-base">New Business Listing</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {(['name', 'description', 'category', 'address', 'phone', 'website'] as const).map((field) => (
              <div key={field} className="space-y-1">
                <Label className="capitalize">{field}</Label>
                <Input value={form[field]} onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))} placeholder={field} />
              </div>
            ))}
            {formError && (
              <p className="text-xs text-[var(--color-destructive)]">{formError}</p>
            )}
            <div className="flex gap-2">
              <Button onClick={() => createMutation.mutate()} disabled={!form.name || !form.category || createMutation.isPending}>
                {createMutation.isPending ? 'Saving…' : 'Create Listing'}
              </Button>
              <Button variant="ghost" onClick={() => { setCreating(false); setFormError('') }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {businesses?.map((biz) => (
        <div key={biz.id} className="space-y-1.5">
          <div className={cn(
            'flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full w-fit',
            biz.is_active
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
          )}>
            {biz.is_active
              ? <><CheckCircle2 className="h-3 w-3" /> Approved — visible on map</>
              : <><Clock className="h-3 w-3" /> Pending approval</>
            }
          </div>
          <BusinessProfile
            business={biz}
            isOwner
            onDelete={() => deleteMutation.mutate(biz.id)}
          />
        </div>
      ))}

      {businesses?.length === 0 && !creating && (
        <div className="text-center py-16 text-[var(--color-muted-foreground)]">
          <p className="text-4xl mb-3">🏪</p>
          <p>You have no business listings yet.</p>
          <Button size="sm" className="mt-4" onClick={() => setCreating(true)}>Add your first business</Button>
        </div>
      )}
    </div>
  )
}

export default function BusinessPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">My Businesses</h1>
        <p className="text-sm text-[var(--color-muted-foreground)] mt-1">Manage your producer listings</p>
      </div>
      <RoleGate allow={['producer', 'admin']}>
        <BusinessManager />
      </RoleGate>
    </div>
  )
}
