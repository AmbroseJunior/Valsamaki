'use client'

import { useState, useEffect } from 'react'
import { MapPin, Droplets, Wind, Eye, Gauge, Thermometer } from 'lucide-react'
import type { WeatherData } from '@/types/app'

function windDir(deg: number) {
  return ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(deg / 45) % 8]
}

function fmtTime(unix: number) {
  return new Date(unix * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function WeatherCard() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    function fetchWeather(lat?: number, lng?: number) {
      const qs = lat != null && lng != null ? `?lat=${lat}&lng=${lng}` : ''
      fetch(`/api/weather${qs}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => { if (d) setWeather(d) })
        .catch(() => {})
        .finally(() => setLoading(false))
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

  if (loading) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] overflow-hidden animate-pulse">
        <div className="h-28 bg-[var(--color-muted)]" />
        <div className="grid grid-cols-3 gap-px bg-[var(--color-border)] border-t border-[var(--color-border)]">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 bg-[var(--color-card)]" />
          ))}
        </div>
      </div>
    )
  }

  if (!weather) return null

  const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`
  const isDay = weather.icon.endsWith('d')

  const stats = [
    { emoji: '💧', label: 'Humidity',    value: `${weather.humidity}%`,                          Icon: Droplets },
    { emoji: '💨', label: 'Wind',        value: `${weather.wind_speed} m/s ${windDir(weather.wind_deg)}`, Icon: Wind },
    { emoji: '🔭', label: 'Visibility',  value: `${weather.visibility} km`,                      Icon: Eye },
    { emoji: '📊', label: 'Pressure',    value: `${weather.pressure} hPa`,                       Icon: Gauge },
    { emoji: '☁️', label: 'Cloud Cover', value: `${weather.clouds}%`,                            Icon: null },
    { emoji: '🌡️', label: 'Feels Like',  value: `${weather.feels_like}°C`,                       Icon: Thermometer },
  ]

  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] overflow-hidden bg-[var(--color-card)] shadow-[var(--shadow-sm)]">

      {/* ── Hero header ── */}
      <div
        className="px-5 py-5"
        style={{
          background: isDay
            ? 'linear-gradient(135deg,#2563eb 0%,#3b82f6 50%,#93c5fd 100%)'
            : 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#1e40af 100%)',
        }}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Temp + icon */}
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={iconUrl} alt={weather.description} width={72} height={72} className="-my-2 drop-shadow-lg" />
            <div>
              <p className="text-5xl font-bold text-white leading-none">
                {weather.temp}°<span className="text-3xl font-semibold">C</span>
              </p>
              <p className="text-white/90 text-sm capitalize mt-1">{weather.description}</p>
              <p className="text-white/60 text-xs mt-0.5">
                ↑ {weather.temp_max}°&nbsp;&nbsp;↓ {weather.temp_min}°&nbsp;&nbsp;Feels {weather.feels_like}°
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="text-right shrink-0">
            <div className="flex items-center gap-1 text-white/80 text-xs justify-end">
              <MapPin className="h-3 w-3" />
              <span className="font-semibold">{weather.city}</span>
            </div>
            <p className="text-white/50 text-xs mt-0.5">{weather.country}</p>
          </div>
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-3 divide-x divide-[var(--color-border)] border-b border-[var(--color-border)]">
        {stats.slice(0, 3).map(({ emoji, label, value }) => (
          <div key={label} className="flex flex-col items-center gap-0.5 py-3 px-2 text-center">
            <span className="text-xl leading-none">{emoji}</span>
            <p className="text-[11px] font-bold text-[var(--color-foreground)] mt-1">{value}</p>
            <p className="text-[9px] text-[var(--color-muted-foreground)] uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 divide-x divide-[var(--color-border)] border-b border-[var(--color-border)]">
        {stats.slice(3).map(({ emoji, label, value }) => (
          <div key={label} className="flex flex-col items-center gap-0.5 py-3 px-2 text-center">
            <span className="text-xl leading-none">{emoji}</span>
            <p className="text-[11px] font-bold text-[var(--color-foreground)] mt-1">{value}</p>
            <p className="text-[9px] text-[var(--color-muted-foreground)] uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Sunrise / Sunset ── */}
      <div className="flex items-center justify-around px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌅</span>
          <div>
            <p className="text-[10px] text-[var(--color-muted-foreground)] uppercase tracking-widest">Sunrise</p>
            <p className="text-sm font-bold text-[var(--color-foreground)]">{fmtTime(weather.sunrise)}</p>
          </div>
        </div>
        <div className="w-px h-8 bg-[var(--color-border)]" />
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌇</span>
          <div>
            <p className="text-[10px] text-[var(--color-muted-foreground)] uppercase tracking-widest">Sunset</p>
            <p className="text-sm font-bold text-[var(--color-foreground)]">{fmtTime(weather.sunset)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
