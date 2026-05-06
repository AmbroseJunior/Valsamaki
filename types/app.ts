export interface Coordinates {
  lat: number
  lng: number
  accuracy?: number
}

export interface UserPreferences {
  reason_for_visit: 'tourist' | 'local' | 'business' | 'researcher'
  interests: string[]
  dietary_preference: 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian' | 'gluten_free'
  activity_level: 'low' | 'moderate' | 'high'
  travel_radius_km: number
  language: 'en' | 'el' | 'de' | 'fr' | 'ru'
}

export interface WeatherData {
  temp: number
  feels_like: number
  description: string
  icon: string
  humidity: number
  wind_speed: number
  city: string
}

export interface AirQualityData {
  aqi: number
  pm25: number
  pm10: number
  location: string
  category: 'good' | 'moderate' | 'unhealthy' | 'hazardous'
}

export interface NearbyEntity {
  id: string
  type: 'business' | 'event'
  name: string
  lat: number
  lng: number
  distance_km: number
  category: string
}

export type EntityType = 'business' | 'event' | 'producer'
export type InteractionAction = 'view' | 'save' | 'click' | 'rsvp' | 'share'
export type AITask = 'chat' | 'recommend' | 'voice_setup' | 'knowledge_query' | 'trend_analysis'
