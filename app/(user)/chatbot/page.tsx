import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Chatbot } from '@/components/ai/Chatbot'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'AI Assistant' }

export default async function ChatbotPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?message=Sign+up+to+access+this+feature')

  const t = await getTranslations('chatbot')

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-var(--nav-height)-var(--bottom-nav-height))] md:h-[calc(100vh-var(--nav-height))] flex flex-col">
      <div className="px-4 py-4 border-b border-[var(--color-border)]">
        <h1 className="font-display text-xl font-bold">{t('askTitle')}</h1>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          {t('subtitle')}
        </p>
      </div>
      <div className="flex-1 overflow-hidden">
        <Chatbot userId={user.id} />
      </div>
    </div>
  )
}
