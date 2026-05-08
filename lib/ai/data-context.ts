import { EXPERIENCES } from '@/lib/data/experiences'
import { SCRAPED_EXPERIENCES } from '@/lib/data/scrapedExperiences'
import { FARMERS_MARKETS } from '@/lib/data/farmersMarkets'
import { SCRAPED_PLACES } from '@/lib/data/scrapedPlaces'

export function buildDataFileContext(): string {
  const allExperiences = [...EXPERIENCES, ...SCRAPED_EXPERIENCES]

  const expLines = allExperiences.map(
    (e) => `• ${e.title} [${e.category}] — ${e.location}. ${e.shortDescription} Health: ${e.healthBenefits.join(', ')}.${e.price ? ` Price: ${e.price}.` : ''}`
  )

  const marketLines = FARMERS_MARKETS.map(
    (m) => `• ${m.nameEn} — ${m.area}, every ${m.day}, ${m.hours}`
  )

  const placeLines = SCRAPED_PLACES.slice(0, 20).map(
    (p) => `• ${p.title} [${p.category}] — ${p.region}. ${p.subtitle}`
  )

  return [
    `== CRETE DIRECTORY (${allExperiences.length} experiences, ${FARMERS_MARKETS.length} markets, ${SCRAPED_PLACES.length} sights) ==`,
    '',
    'EXPERIENCES & ACTIVITIES:',
    ...expLines,
    '',
    'WEEKLY FARMERS MARKETS:',
    ...marketLines,
    '',
    'TOURIST SIGHTS & PLACES:',
    ...placeLines,
    '',
    '== END DIRECTORY ==',
  ].join('\n')
}
