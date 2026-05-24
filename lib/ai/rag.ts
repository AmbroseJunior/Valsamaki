/**
 * RAG — Retrieval-Augmented Generation for the Cretan food knowledge base.
 *
 * Instead of dumping all 228 KB of CSV data into every LLM prompt, this module
 * scores each food item against the user's query and returns only the most
 * relevant sections. Result: smaller prompts, faster responses, sharper answers.
 *
 * HOW IT WORKS
 * 1. CSVs are parsed once and cached in memory on first call.
 * 2. Keywords are extracted from the user query (stop-words stripped).
 * 3. Each food is scored: name matches score highest, then health goals,
 *    bioactive compounds, and nutritional fields.
 * 4. The top-N foods are formatted into a structured knowledge block and
 *    returned to the LLM as its grounding context.
 *
 * TO ADD NEW KNOWLEDGE
 * → Add rows to the CSV files in /data. The RAG will pick them up automatically
 *   (cache resets on server restart / new deployment).
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { logger } from '@/lib/logger'

// ── Types ─────────────────────────────────────────────────────────────────────

interface FoodRow       { food_id: string; name: string; description: string; category: string }
interface CompoundRow   { food_id: string; name: string; description: string }
interface HealthGoalRow { goal_id: string; name: string; description: string }
interface FoodGoalRow   { food_id: string; goal_id: string; evidence_strength: string; notes: string }
interface StudyRow      { food_id: string; title: string; study_type: string; sample_size: string; finding: string; evidence_quality: string; doi: string }
interface NutritionRow  { food_id: string; nutrient: string; significance: string; health_implication: string }
interface FoodDetailRow { food_id: string; flavour_profile: string; preparation: string; historical_use: string }

interface KnowledgeData {
  foods:       FoodRow[]
  compounds:   CompoundRow[]
  healthGoals: HealthGoalRow[]
  foodGoals:   FoodGoalRow[]
  studies:     StudyRow[]
  nutrition:   NutritionRow[]
  foodDetails: FoodDetailRow[]
}

// ── CSV Parser ────────────────────────────────────────────────────────────────

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (const ch of line) {
    if (ch === '"') { inQuotes = !inQuotes }
    else if (ch === ',' && !inQuotes) { result.push(current.trim()); current = '' }
    else { current += ch }
  }
  result.push(current.trim())
  return result
}

function parseCSV<T>(filename: string): T[] {
  try {
    const raw = readFileSync(join(process.cwd(), 'data', filename), 'utf-8')
    const lines = raw.trim().split('\n').filter(Boolean)
    if (lines.length < 2) return []
    const headers = parseCSVLine(lines[0])
    return lines.slice(1).map((line) => {
      const vals = parseCSVLine(line)
      return Object.fromEntries(headers.map((h, i) => [h.trim(), (vals[i] ?? '').trim()])) as unknown as T
    })
  } catch (err) {
    logger.warn(`rag: failed to load ${filename}`, err)
    return []
  }
}

// ── In-Memory Cache ───────────────────────────────────────────────────────────

let _cache: KnowledgeData | null = null

function getData(): KnowledgeData {
  if (_cache) return _cache
  _cache = {
    foods:       parseCSV<FoodRow>('foods.csv'),
    compounds:   parseCSV<CompoundRow>('compounds.csv'),
    healthGoals: parseCSV<HealthGoalRow>('health_goals.csv'),
    foodGoals:   parseCSV<FoodGoalRow>('food_health_goals.csv'),
    studies:     parseCSV<StudyRow>('studies.csv'),
    nutrition:   parseCSV<NutritionRow>('nutrition.csv'),
    foodDetails: parseCSV<FoodDetailRow>('food_details.csv'),
  }
  return _cache
}

// Invalidate the cache (call after updating CSV files in development)
export function invalidateKnowledgeCache(): void {
  _cache = null
}

// ── Keyword Extraction ────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  'the','a','an','is','in','of','and','or','for','to','with','what',
  'how','why','me','i','about','do','does','can','tell','give','show',
  'are','was','were','be','been','being','have','has','had',
])

function extractKeywords(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
}

// ── Relevance Scoring ─────────────────────────────────────────────────────────

function scoreFood(food: FoodRow, keywords: string[], data: KnowledgeData): number {
  if (keywords.length === 0) return 0

  let score = 0
  const nameLower = food.name.toLowerCase()
  const descLower = food.description.toLowerCase()
  const catLower  = food.category.toLowerCase()

  for (const kw of keywords) {
    if (nameLower.includes(kw)) score += 10   // exact name substring — highest weight
    if (descLower.includes(kw)) score += 3
    if (catLower.includes(kw))  score += 2
  }

  // Health goal matches (e.g. "heart", "longevity", "cholesterol")
  for (const fg of data.foodGoals.filter((g) => g.food_id === food.food_id)) {
    const goal = data.healthGoals.find((g) => g.goal_id === fg.goal_id)
    if (!goal) continue
    const goalText = (goal.name + ' ' + goal.description).toLowerCase()
    for (const kw of keywords) {
      if (goalText.includes(kw)) score += 5
    }
  }

  // Bioactive compound matches (e.g. "oleuropein", "polyphenol", "antioxidant")
  for (const c of data.compounds.filter((c) => c.food_id === food.food_id)) {
    const compText = (c.name + ' ' + c.description).toLowerCase()
    for (const kw of keywords) {
      if (compText.includes(kw)) score += 4
    }
  }

  // Nutritional matches (e.g. "vitamin", "omega", "calcium")
  for (const n of data.nutrition.filter((n) => n.food_id === food.food_id)) {
    const nutrText = (n.nutrient + ' ' + n.health_implication).toLowerCase()
    for (const kw of keywords) {
      if (nutrText.includes(kw)) score += 3
    }
  }

  return score
}

// ── Knowledge Block Formatter ─────────────────────────────────────────────────

const EVIDENCE_LABELS: Record<string, string> = {
  '1': 'in vitro / animal only',
  '2': 'small RCT or animal model',
  '3': 'RCT / meta-analysis (strong evidence)',
}

function formatFoodBlock(food: FoodRow, data: KnowledgeData): string {
  const lines: string[] = [`### ${food.name}`, food.description]

  const detail = data.foodDetails.find((d) => d.food_id === food.food_id)
  if (detail) {
    if (detail.flavour_profile) lines.push(`**Flavour profile:** ${detail.flavour_profile}`)
    if (detail.preparation)    lines.push(`**How to use:** ${detail.preparation}`)
    if (detail.historical_use) lines.push(`**Historical use:** ${detail.historical_use}`)
  }

  const fNutrition = data.nutrition.filter((n) => n.food_id === food.food_id)
  if (fNutrition.length) {
    lines.push('**Nutritional highlights:**')
    for (const n of fNutrition) {
      lines.push(`- ${n.nutrient} [${n.significance}]: ${n.health_implication}`)
    }
  }

  const fCompounds = data.compounds.filter((c) => c.food_id === food.food_id)
  if (fCompounds.length) {
    lines.push('**Key bioactive compounds:**')
    for (const c of fCompounds) lines.push(`- ${c.name}: ${c.description}`)
  }

  const fGoals = data.foodGoals.filter((fg) => fg.food_id === food.food_id)
  if (fGoals.length) {
    lines.push('**Evidence-based health effects:**')
    for (const fg of fGoals) {
      const goal    = data.healthGoals.find((g) => g.goal_id === fg.goal_id)
      const label   = goal?.name ?? fg.goal_id
      const evLabel = EVIDENCE_LABELS[fg.evidence_strength] ?? `level ${fg.evidence_strength}`
      lines.push(`- ${label} [${evLabel}]${fg.notes ? ': ' + fg.notes : ''}`)
    }
  }

  const fStudies = data.studies.filter((s) => s.food_id === food.food_id)
  if (fStudies.length) {
    lines.push('**Key studies:**')
    for (const s of fStudies) {
      lines.push(`- "${s.title}" [${s.study_type}, ${s.sample_size}]: ${s.finding} (Evidence: ${s.evidence_quality}; DOI: ${s.doi})`)
    }
  }

  return lines.join('\n')
}

const KNOWLEDGE_HEADER = `## CRETAN FOOD KNOWLEDGE BASE — VERIFIED SCIENTIFIC DATA
Source: peer-reviewed studies, RCTs, and meta-analyses. Evidence quality is explicitly labeled.
Only make health claims that appear in this knowledge base.`

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Retrieve the most relevant food knowledge sections for a given user query.
 * Use this for every chat call — it keeps prompts focused and accurate.
 *
 * @param query      The user's message or topic string
 * @param maxFoods   Max number of food sections to include (default 8)
 */
export function retrieveRelevantKnowledge(query: string, maxFoods = 8): string {
  const data     = getData()
  const keywords = extractKeywords(query)

  let selectedFoods: FoodRow[]

  if (keywords.length === 0) {
    // Generic query — show a broad overview
    selectedFoods = data.foods.slice(0, maxFoods)
  } else {
    const scored = data.foods
      .map((f) => ({ food: f, score: scoreFood(f, keywords, data) }))
      .sort((a, b) => b.score - a.score)

    const relevant = scored.filter((s) => s.score > 0)
    selectedFoods = (relevant.length > 0 ? relevant : scored)
      .slice(0, maxFoods)
      .map((s) => s.food)
  }

  const goalDefs = ['### Health Goal Definitions',
    ...data.healthGoals.map((g) => `- **${g.name}**: ${g.description}`),
  ].join('\n')

  return [
    KNOWLEDGE_HEADER,
    ...selectedFoods.map((f) => formatFoodBlock(f, data)),
    goalDefs,
  ].join('\n\n')
}

/**
 * Return the complete knowledge base (all foods).
 * Use only for product scanning, batch indexing, or admin exports.
 * Prefer retrieveRelevantKnowledge() for chat calls.
 */
export function buildFullKnowledgeBlock(): string {
  const data = getData()
  return [
    KNOWLEDGE_HEADER,
    ...data.foods.map((f) => formatFoodBlock(f, data)),
  ].join('\n\n')
}
