export interface Coordinates {
  lat: number
  lng: number
  accuracy?: number
}

export type Motivation = 'eat_well' | 'health_science' | 'recovering' | 'better_habits' | 'cretan_diet'
export type Improvement = 'energy' | 'digestion' | 'inflammation' | 'heart_health' | 'mental_clarity' | 'healthy_ageing' | 'therapy'
export type Feeling = 'tired' | 'bloated' | 'frequent_colds' | 'stressed' | 'joint_pain' | 'feeling_good'
export type DietChoice = 'plant_based' | 'vegetarian' | 'pescetarian' | 'keto' | 'omnivore' | 'avoid_dairy' | 'avoid_gluten' | 'other'

export interface UserPreferences {
  // Q1 — What brings you here? (max 2)
  motivations?: Motivation[]
  // Q2 — What would you most like to improve? (max 3)
  improvements?: Improvement[]
  // Q3 — How have you been feeling recently? (all that apply)
  current_feelings?: Feeling[]
  // Q4 — How would you describe your current diet?
  diet?: DietChoice[]
  diet_other?: string
  language?: string
}

export interface WeatherData {
  temp: number
  feels_like: number
  temp_min: number
  temp_max: number
  description: string
  icon: string
  humidity: number
  wind_speed: number
  wind_deg: number
  pressure: number
  visibility: number
  clouds: number
  sunrise: number
  sunset: number
  city: string
  country: string
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
