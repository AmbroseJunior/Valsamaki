// Central security utilities — OWASP Top 10 mitigations

// ── Rate limiting (in-memory per serverless instance) ─────────────────────
// Not perfect across distributed instances but meaningful for burst protection.
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfterMs: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, retryAfterMs: 0 }
  }

  entry.count += 1
  if (entry.count > limit) {
    return { ok: false, retryAfterMs: entry.resetAt - now }
  }

  return { ok: true, retryAfterMs: 0 }
}

// ── Input validation ──────────────────────────────────────────────────────

export function validateString(
  value: unknown,
  { maxLength, minLength = 0 }: { maxLength: number; minLength?: number }
): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (trimmed.length < minLength || trimmed.length > maxLength) return null
  return trimmed
}

// OWASP A03 — validate lat/lng are real geographic coordinates
export function validateLatLng(
  lat: unknown,
  lng: unknown
): { lat: number; lng: number } | null {
  if (typeof lat !== 'number' || typeof lng !== 'number') return null
  if (!isFinite(lat) || !isFinite(lng)) return null
  if (lat < -90 || lat > 90) return null
  if (lng < -180 || lng > 180) return null
  return { lat, lng }
}

// OWASP A03 — allowlist-only URL validation (blocks javascript:, data:, etc.)
export function validateUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  try {
    const url = new URL(trimmed)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
    return trimmed
  } catch {
    return null
  }
}

// OWASP A01 — safe redirect: only allow relative paths, block protocol-relative & open redirects
export function safeRedirectPath(next: unknown, fallback = '/dashboard'): string {
  if (typeof next !== 'string') return fallback
  const decoded = decodeURIComponent(next)
  // Must start with / but not // (protocol-relative) or /\\ (IE bypass)
  if (!decoded.startsWith('/') || decoded.startsWith('//') || decoded.startsWith('/\\')) return fallback
  // Block javascript: and data: embedded after path chars
  if (/javascript:/i.test(decoded) || /data:/i.test(decoded)) return fallback
  return decoded
}

// Basic phone: digits, spaces, +, -, (, ) only — max 20 chars
export function validatePhone(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  if (trimmed.length > 20) return null
  if (!/^[+\d\s\-().]+$/.test(trimmed)) return null
  return trimmed
}

// ── Security response headers (OWASP A05) ─────────────────────────────────
export function applySecurityHeaders(headers: Headers): void {
  // Prevent MIME-type sniffing
  headers.set('X-Content-Type-Options', 'nosniff')
  // Block framing (clickjacking)
  headers.set('X-Frame-Options', 'SAMEORIGIN')
  // Enforce HTTPS
  headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  // Control referrer info
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  // Restrict browser features
  headers.set('Permissions-Policy', 'camera=(), microphone=(self), geolocation=(self), payment=()')
  // Content Security Policy
  // unsafe-inline needed for Next.js hydration styles; unsafe-eval needed for Leaflet worker
  headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openweathermap.org https://openweathermap.org https://api.openaq.org https://newsapi.org https://api.deepseek.com https://generativelanguage.googleapis.com",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join('; ')
  )
}
