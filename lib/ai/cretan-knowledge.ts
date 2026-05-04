import { readFileSync } from 'fs'
import { join } from 'path'
import { logger } from '@/lib/logger'

let _cached: string | null = null

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

function parseCSV(filename: string): Record<string, string>[] {
  try {
    const path = join(process.cwd(), 'data', filename)
    const raw = readFileSync(path, 'utf-8')
    const lines = raw.trim().split('\n').filter(Boolean)
    if (lines.length < 2) return []
    const headers = parseCSVLine(lines[0])
    return lines.slice(1).map((line) => {
      const vals = parseCSVLine(line)
      return Object.fromEntries(headers.map((h, i) => [h.trim(), (vals[i] ?? '').trim()]))
    })
  } catch (err) {
    logger.warn(`cretan-knowledge: failed to load ${filename}`, err)
    return []
  }
}

const EVIDENCE_LABELS: Record<string, string> = {
  '1': 'in vitro / animal only',
  '2': 'small RCT or animal model',
  '3': 'RCT / meta-analysis (strong evidence)',
}

export function buildCretanKnowledgeBlock(): string {
  if (_cached) return _cached

  const foods        = parseCSV('foods.csv')
  const compounds    = parseCSV('compounds.csv')
  const healthGoals  = parseCSV('health_goals.csv')
  const foodGoals    = parseCSV('food_health_goals.csv')
  const studies      = parseCSV('studies.csv')

  const goalById = Object.fromEntries(healthGoals.map((g) => [g.goal_id, g.name]))

  const lines: string[] = [
    '## CRETAN FOOD KNOWLEDGE BASE — VERIFIED SCIENTIFIC DATA',
    'Source: peer-reviewed studies, RCTs, and meta-analyses. Evidence quality is explicitly labeled.',
    'Only make health claims supported by this knowledge base.',
    '',
  ]

  for (const food of foods) {
    lines.push(`### ${food.name}`)
    lines.push(food.description)

    const fCompounds = compounds.filter((c) => c.food_id === food.food_id)
    if (fCompounds.length) {
      lines.push('**Key bioactive compounds:**')
      for (const c of fCompounds) {
        lines.push(`- ${c.name}: ${c.description}`)
      }
    }

    const fGoals = foodGoals.filter((fg) => fg.food_id === food.food_id)
    if (fGoals.length) {
      lines.push('**Evidence-based health effects:**')
      for (const fg of fGoals) {
        const goalName = goalById[fg.goal_id] ?? fg.goal_id
        const evLabel  = EVIDENCE_LABELS[fg.evidence_strength] ?? `level ${fg.evidence_strength}`
        lines.push(`- ${goalName} [${evLabel}]${fg.notes ? ': ' + fg.notes : ''}`)
      }
    }

    const fStudies = studies.filter((s) => s.food_id === food.food_id)
    if (fStudies.length) {
      lines.push('**Key studies:**')
      for (const s of fStudies) {
        lines.push(
          `- "${s.title}" [${s.study_type}, ${s.sample_size}]: ${s.finding} (Evidence quality: ${s.evidence_quality}; DOI: ${s.doi})`
        )
      }
    }

    lines.push('')
  }

  lines.push('### Health Goal Definitions')
  for (const g of healthGoals) {
    lines.push(`- **${g.name}**: ${g.description}`)
  }

  _cached = lines.join('\n')
  return _cached
}
