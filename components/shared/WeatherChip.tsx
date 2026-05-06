'use client'

import { useState, useEffect } from 'react'
import type { WeatherData } from '@/types/app'

export function WeatherChip() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [dismissed, setDismissed] = useState(false)

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

  if (!weather || dismissed) return null

  const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}.png`

  return (
    <div className="fixed top-[calc(var(--nav-height)+8px)] right-3 z-40 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] shadow-[var(--shadow-md)] text-sm select-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={iconUrl} alt={weather.description} width={24} height={24} className="-my-1" />
      <span className="font-bold text-[var(--color-foreground)]">{weather.temp}°C</span>
      <span className="text-[var(--color-muted-foreground)] text-xs hidden lg:block capitalize">{weather.description}</span>
      <span className="text-[var(--color-muted-foreground)] text-xs">· {weather.city}</span>
      <button
        onClick={() => setDismissed(true)}
        className="ml-1 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] leading-none"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  )
}
