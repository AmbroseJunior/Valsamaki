import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// @supabase/ssr v0.6.1 returns SupabaseClient<DB, SchemaName, Schema> (3 params)
// but supabase-js 2.105.1 SupabaseClient has 5 params at different positions.
// Casting to SupabaseClient<Database> (1 param) lets TypeScript compute correct defaults.
function typed<T>(client: T): SupabaseClient<Database> {
  return client as unknown as SupabaseClient<Database>
}

export async function createClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies()

  return typed(createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — cookie setting is a no-op here
          }
        },
      },
    }
  ))
}

export async function createServiceClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies()

  return typed(createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — cookie setting is a no-op
          }
        },
      },
    }
  ))
}
