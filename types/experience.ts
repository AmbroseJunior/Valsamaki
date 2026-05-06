export interface Experience {
  id: string
  title: string
  category: ExperienceCategory
  location: string
  distance?: number
  rating: number
  reviewCount: number
  images: string[]
  description: string
  shortDescription: string
  healthBenefits: string[]
  hours?: string
  price?: string
  tags: string[]
  coordinates: { lat: number; lng: number }
  isFeatured?: boolean
  isNew?: boolean
}

export type ExperienceCategory =
  | 'all'
  | 'organic'
  | 'wellness'
  | 'food_tour'
  | 'active'
  | 'market'

export const CATEGORIES: { value: ExperienceCategory; label: string; emoji: string }[] = [
  { value: 'all',       label: 'All',        emoji: '🌿' },
  { value: 'organic',   label: 'Organic',    emoji: '🌱' },
  { value: 'wellness',  label: 'Wellness',   emoji: '🧘' },
  { value: 'food_tour', label: 'Food Tours', emoji: '🍽️' },
  { value: 'active',    label: 'Active',     emoji: '🏃' },
  { value: 'market',    label: 'Markets',    emoji: '🛒' },
]
