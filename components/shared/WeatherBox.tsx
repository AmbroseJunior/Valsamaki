'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, X } from 'lucide-react'
import type { WeatherData } from '@/types/app'

function fmtTime(unix: number) {
  return new Date(unix * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function WeatherBox() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [expanded, setExpanded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function fetchWeather(lat?: number, lng?: number) {
      const qs = lat != null && lng != null ? `?lat=${lat}&lng=${lng}` : ''
      fetch(`/api/weather${qs}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => { if (d) setWeather(d) })
        .catch(() => {})
    }
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(),
        { timeout: 6000, maximumAge: 300_000 },
      )
    } else {
      fetchWeather()
    }
  }, [])

  // Close panel on outside click
  useEffect(() => {
    if (!expanded) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setExpanded(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [expanded])

  if (!weather) return null

  const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`
  const isDay = weather.icon.endsWith('d')

  return (
    <div
      ref={ref}
      className="fixed right-3 z-20"
      style={{ top: 'calc(var(--nav-height) + 8px)' }}
    >
      {/* ── Compact chip — always visible ── */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1 pl-1 pr-2.5 py-1 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] shadow-[var(--shadow-md)] hover:border-[var(--highlight)] transition-colors"
        aria-label="Show weather details"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={iconUrl} alt={weather.description} width={26} height={26} className="-my-0.5" />
        <span className="text-xs font-bold text-[var(--color-foreground)] tabular-nums">{weather.temp}°</span>
      </button>

      {/* ── Expanded details panel ── */}
      {expanded && (
        <div className="absolute right-0 top-[calc(100%+6px)] w-52 rounded-[var(--radius-xl)] border border-[var(--color-border)] overflow-hidden shadow-[var(--shadow-xl,var(--shadow-lg))] bg-[var(--color-card)]">

          {/* Gradient header */}
          <div
            className="px-3 py-3 flex items-center gap-2"
            style={{
              background: isDay
                ? 'linear-gradient(135deg,#2563eb 0%,#60a5fa 100%)'
                : 'linear-gradient(135deg,#0f172a 0%,#1e40af 100%)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={iconUrl} alt={weather.description} width={46} height={46} className="-my-1 drop-shadow" />
            <div className="flex-1 min-w-0">
              <p className="text-[1.6rem] font-bold text-white leading-none">{weather.temp}°C</p>
              <p className="text-white/75 text-[10px] capitalize truncate mt-0.5">{weather.description}</p>
              <p className="text-white/50 text-[10px] mt-0.5">
                ↑{weather.temp_max}° ↓{weather.temp_min}° · feels {weather.feels_like}°
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(false) }}
              className="shrink-0 self-start p-1 rounded-full bg-white/20 hover:bg-white/35 transition-colors"
              aria-label="Close weather"
            >
              <X className="h-3 w-3 text-white" />
            </button>
          </div>

          {/* Location row */}
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[var(--color-border)]">
            <MapPin className="h-3 w-3 text-[var(--color-muted-foreground)] shrink-0" />
            <span className="text-xs font-semibold text-[var(--color-foreground)] truncate">
              {weather.city}, {weather.country}
            </span>
          </div>

          {/* Stats grid 2×2 */}
          <div className="grid grid-cols-2 divide-x divide-[var(--color-border)] border-b border-[var(--color-border)]">
            {[
              { emoji: '💧', label: 'Humidity',   value: `${weather.humidity}%` },
              { emoji: '💨', label: 'Wind',        value: `${weather.wind_speed} m/s` },
              { emoji: '☁️', label: 'Cloud',       value: `${weather.clouds}%` },
              { emoji: '📊', label: 'Pressure',    value: `${weather.pressure} hPa` },
            ].map(({ emoji, label, value }, i) => (
              <div
                key={label}
                className={`flex flex-col items-center gap-0.5 py-2.5 px-2 text-center${i >= 2 ? ' border-t border-[var(--color-border)]' : ''}`}
              >
                <span className="text-base leading-none">{emoji}</span>
                <p className="text-[10px] font-bold text-[var(--color-foreground)] mt-0.5">{value}</p>
                <p className="text-[8px] text-[var(--color-muted-foreground)] uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>

          {/* Sunrise / Sunset */}
          <div className="flex items-center justify-around px-3 py-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-lg">🌅</span>
              <div>
                <p className="text-[8px] text-[var(--color-muted-foreground)] uppercase tracking-wide">Sunrise</p>
                <p className="text-[11px] font-bold text-[var(--color-foreground)]">{fmtTime(weather.sunrise)}</p>
              </div>
            </div>
            <div className="w-px h-6 bg-[var(--color-border)]" />
            <div className="flex items-center gap-1.5">
              <span className="text-lg">🌇</span>
              <div>
                <p className="text-[8px] text-[var(--color-muted-foreground)] uppercase tracking-wide">Sunset</p>
                <p className="text-[11px] font-bold text-[var(--color-foreground)]">{fmtTime(weather.sunset)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
