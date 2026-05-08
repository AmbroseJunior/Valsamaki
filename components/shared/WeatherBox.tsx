'use client'

import { useState, useEffect } from 'react'
import { MapPin } from 'lucide-react'
import type { WeatherData } from '@/types/app'

export function WeatherBox() {
  const [weather, setWeather] = useState<WeatherData | null>(null)

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

  if (!weather) return null

  const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`
  const isDay = weather.icon.endsWith('d')

  return (
    <div
      className="fixed right-3 z-20 w-[148px] rounded-[var(--radius-xl)] border border-[var(--color-border)] overflow-hidden shadow-[var(--shadow-lg)] bg-[var(--color-card)]"
      style={{ top: 'calc(var(--nav-height) + 10px)' }}
    >
      {/* Gradient header */}
      <div
        className="px-3 py-2.5 flex items-center gap-2"
        style={{
          background: isDay
            ? 'linear-gradient(135deg,#2563eb 0%,#60a5fa 100%)'
            : 'linear-gradient(135deg,#0f172a 0%,#1e40af 100%)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={iconUrl} alt={weather.description} width={40} height={40} className="-my-1 drop-shadow" />
        <div className="min-w-0">
          <p className="text-2xl font-bold text-white leading-none">{weather.temp}°C</p>
          <p className="text-white/75 text-[10px] capitalize truncate mt-0.5">{weather.description}</p>
        </div>
      </div>

      {/* Location + stats */}
      <div className="px-3 py-2 space-y-1.5">
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3 shrink-0 text-[var(--color-muted-foreground)]" />
          <span className="text-xs font-semibold text-[var(--color-foreground)] truncate">{weather.city}</span>
        </div>
        <div className="grid grid-cols-2 gap-x-1 gap-y-1 text-[10px] text-[var(--color-muted-foreground)]">
          <span>↑ {weather.temp_max}°</span>
          <span>↓ {weather.temp_min}°</span>
          <span>💧 {weather.humidity}%</span>
          <span>💨 {weather.wind_speed} m/s</span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-[var(--color-muted-foreground)] border-t border-[var(--color-border)] pt-1.5">
          <span>🌅 {new Date(weather.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span>🌇 {new Date(weather.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  )
}
