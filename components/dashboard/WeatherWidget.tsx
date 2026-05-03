import { getWeather } from '@/lib/api/external'
import { Cloud, Droplets, Wind } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface WeatherWidgetProps {
  lat?: number
  lng?: number
}

const HERAKLION = { lat: 35.3387, lng: 25.1442 }

export async function WeatherWidget({ lat = HERAKLION.lat, lng = HERAKLION.lng }: WeatherWidgetProps) {
  const weather = await getWeather(lat, lng)

  if (!weather) {
    return (
      <Card className="p-4">
        <p className="text-sm text-[var(--color-muted-foreground)]">Weather unavailable</p>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <img
          src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
          alt={weather.description}
          width={56}
          height={56}
          className="shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold text-2xl">{weather.temp}°C</p>
          <p className="text-sm text-[var(--color-muted-foreground)] capitalize">{weather.description}</p>
          <p className="text-xs text-[var(--color-muted-foreground)]">{weather.city}</p>
        </div>
        <div className="flex flex-col gap-1 text-xs text-[var(--color-muted-foreground)] shrink-0">
          <span className="flex items-center gap-1">
            <Droplets className="h-3 w-3" /> {weather.humidity}%
          </span>
          <span className="flex items-center gap-1">
            <Wind className="h-3 w-3" /> {weather.wind_speed} m/s
          </span>
          <span className="flex items-center gap-1">
            <Cloud className="h-3 w-3" /> {weather.feels_like}° feels
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
