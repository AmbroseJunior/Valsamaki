import { logger } from '@/lib/logger'
import { validateLatLng } from '@/lib/security'
import type { WeatherData, AirQualityData } from '@/types/app'

const WEATHER_KEY = process.env.OPENWEATHERMAP_API_KEY

export async function getWeather(lat: number, lng: number): Promise<WeatherData | null> {
  if (!WEATHER_KEY) {
    logger.warn('OPENWEATHERMAP_API_KEY not set — returning mock weather')
    return mockWeather()
  }

  // OWASP A10 — validate coords before embedding in external API URL
  const coords = validateLatLng(lat, lng)
  if (!coords) return mockWeather()

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lng}&appid=${WEATHER_KEY}&units=metric`
    const res = await fetch(url, { next: { revalidate: 1800 } })
    if (!res.ok) throw new Error(`Weather API ${res.status}`)

    const data = await res.json()
    return {
      temp: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      wind_speed: data.wind.speed,
      city: data.name,
    }
  } catch (err) {
    logger.error('getWeather failed', err)
    return mockWeather()
  }
}

export async function getAirQuality(lat: number, lng: number): Promise<AirQualityData | null> {
  const coords = validateLatLng(lat, lng)
  if (!coords) return null

  try {
    const url = `https://api.openaq.org/v3/locations?coordinates=${coords.lat},${coords.lng}&radius=25000&limit=1&order_by=distance`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error(`OpenAQ API ${res.status}`)

    const data = await res.json()
    const loc = data.results?.[0]
    if (!loc) return null

    const pm25 = loc.sensors?.find((s: Record<string, unknown>) => s.parameter === 'pm25')?.lastValue ?? 0
    const pm10 = loc.sensors?.find((s: Record<string, unknown>) => s.parameter === 'pm10')?.lastValue ?? 0
    const aqi = estimateAQI(pm25)

    return {
      aqi,
      pm25,
      pm10,
      location: loc.name,
      category: aqiCategory(aqi),
    }
  } catch (err) {
    logger.warn('getAirQuality failed', err)
    return null
  }
}


function mockWeather(): WeatherData {
  return {
    temp: 24,
    feels_like: 22,
    description: 'Clear sky',
    icon: '01d',
    humidity: 55,
    wind_speed: 3.2,
    city: 'Heraklion',
  }
}

function estimateAQI(pm25: number): number {
  if (pm25 <= 12) return Math.round((50 / 12) * pm25)
  if (pm25 <= 35.4) return Math.round(50 + ((100 - 50) / (35.4 - 12.1)) * (pm25 - 12.1))
  if (pm25 <= 55.4) return Math.round(100 + ((150 - 100) / (55.4 - 35.5)) * (pm25 - 35.5))
  return Math.round(150 + ((200 - 150) / (150.4 - 55.5)) * (pm25 - 55.5))
}

function aqiCategory(aqi: number): AirQualityData['category'] {
  if (aqi <= 50) return 'good'
  if (aqi <= 100) return 'moderate'
  if (aqi <= 200) return 'unhealthy'
  return 'hazardous'
}
