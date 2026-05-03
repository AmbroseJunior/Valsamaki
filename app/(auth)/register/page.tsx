import { redirect } from 'next/navigation'

export default function RegisterPage({ searchParams }: { searchParams: { role?: string } }) {
  const params = new URLSearchParams()
  params.set('tab', 'register')
  if (searchParams.role) params.set('role', searchParams.role)
  redirect(`/login?${params.toString()}`)
}
