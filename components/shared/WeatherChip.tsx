'use client'

import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WeatherData } from '@/types/app'

function windDirection(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return dirs[Math.round(deg / 45) % 8]
}

function fmtTime(unix: number): string {
  return new Date(unix * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function WeatherChip() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchWeather = (lat?: number, lng?: number) => {
      const params = lat && lng ? `?lat=${lat}&lng=${lng}` : ''
      fetch(`/api/weather${params}`)
        .then((r) => r.ok ? r.json() : null)
        .then((d) => d && setWeather(d))
        .catch(() => {})
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(),
        { timeout: 5000 }
      )
    } else {
      fetchWeather()
    }
  }, [])

  // Close panel on outside click
  useEffect(() => {
    if (!expanded) return
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setExpanded(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [expanded])

  if (!weather || dismissed) return null

  const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`
  const isDay = weather.icon.endsWith('d')

  return (
    <div
      ref={panelRef}
      className="fixed top-[calc(var(--nav-height)+8px)] right-3 z-40 select-none"
    >
      {/* Compact chip */}
      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] shadow-[var(--shadow-md)] text-sm hover:border-[var(--highlight)] transition-colors"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={iconUrl} alt={weather.description} width={28} height={28} className="-my-1.5 -ml-1" />
          <span className="font-bold text-[var(--color-foreground)]">{weather.temp}°C</span>
          <span className="text-[var(--color-muted-foreground)] text-xs capitalize hidden sm:block">{weather.description}</span>
          <span className="text-[var(--color-muted-foreground)] text-xs">· {weather.city}</span>
        </button>
      )}

      {/* Expanded card */}
      {expanded && (
        <div className={cn(
          'w-72 rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-lg)] overflow-hidden',
          'bg-[var(--color-card)]'
        )}>
          {/* Header */}
          <div
            className="relative px-4 pt-4 pb-3"
            style={{
              background: isDay
                ? 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 60%, #93c5fd 100%)'
                : 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)',
            }}
          >
            <button
              onClick={() => setExpanded(false)}
              className="absolute top-3 right-3 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="h-3.5 w-3.5 text-white" />
            </button>

            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={iconUrl} alt={weather.description} width={64} height={64} className="-my-2 drop-shadow" />
              <div>
                <p className="text-4xl font-bold text-white leading-none">{weather.temp}°<span className="text-2xl">C</span></p>
                <p className="text-white/90 text-sm capitalize mt-0.5">{weather.description}</p>
                <p className="text-white/70 text-xs mt-0.5">{weather.city}, {weather.country}</p>
              </div>
            </div>

            {/* High / Low */}
            <div className="flex gap-4 mt-3">
              <span className="text-xs text-white/80">↑ {weather.temp_max}° High</span>
              <span className="text-xs text-white/80">↓ {weather.temp_min}° Low</span>
              <span className="text-xs text-white/80">Feels {weather.feels_like}°</span>
            </div>
          </div>

          {/* Detail grid */}
          <div className="grid grid-cols-3 divide-x divide-[var(--color-border)] border-b border-[var(--color-border)]">
            {[
              { icon: '💧', label: 'Humidity', value: `${weather.humidity}%` },
              { icon: '💨', label: 'Wind', value: `${weather.wind_speed} m/s ${windDirection(weather.wind_deg)}` },
              { icon: '☁️', label: 'Cloud', value: `${weather.clouds}%` },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex flex-col items-center gap-0.5 py-3 px-2 text-center">
                <span className="text-base leading-none">{icon}</span>
                <p className="text-[11px] font-bold text-[var(--color-foreground)] mt-1">{value}</p>
                <p className="text-[9px] text-[var(--color-muted-foreground)] uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 divide-x divide-[var(--color-border)] border-b border-[var(--color-border)]">
            {[
              { icon: '🔭', label: 'Visibility', value: `${weather.visibility} km` },
              { icon: '📊', label: 'Pressure', value: `${weather.pressure} hPa` },
              { icon: '🌡️', label: 'Feels like', value: `${weather.feels_like}°C` },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex flex-col items-center gap-0.5 py-3 px-2 text-center">
                <span className="text-base leading-none">{icon}</span>
                <p className="text-[11px] font-bold text-[var(--color-foreground)] mt-1">{value}</p>
                <p className="text-[9px] text-[var(--color-muted-foreground)] uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>

          {/* Sunrise / Sunset */}
          <div className="flex items-center justify-around px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-xl">🌅</span>
              <div>
                <p className="text-[10px] text-[var(--color-muted-foreground)] uppercase tracking-wide">Sunrise</p>
                <p className="text-xs font-bold text-[var(--color-foreground)]">{fmtTime(weather.sunrise)}</p>
              </div>
            </div>
            <div className="w-px h-8 bg-[var(--color-border)]" />
            <div className="flex items-center gap-2 text-sm">
              <span className="text-xl">🌇</span>
              <div>
                <p className="text-[10px] text-[var(--color-muted-foreground)] uppercase tracking-wide">Sunset</p>
                <p className="text-xs font-bold text-[var(--color-foreground)]">{fmtTime(weather.sunset)}</p>
              </div>
            </div>
          </div>

          {/* Dismiss */}
          <div className="border-t border-[var(--color-border)] px-4 py-2 flex justify-end">
            <button
              onClick={() => { setExpanded(false); setDismissed(true) }}
              className="text-[10px] text-[var(--color-muted-foreground)] hover:text-[var(--color-destructive)] transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
