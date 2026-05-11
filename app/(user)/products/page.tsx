import { readFileSync } from 'fs'
import { join } from 'path'
import { Sparkles, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Local Products · Valsamaki' }

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') inQuotes = !inQuotes
    else if (ch === ',' && !inQuotes) { result.push(current.trim()); current = '' }
    else current += ch
  }
  result.push(current.trim())
  return result
}

function parseCSV(filename: string): Record<string, string>[] {
  try {
    const raw = readFileSync(join(process.cwd(), 'data', filename), 'utf-8')
    const lines = raw.trim().split('\n').filter(Boolean)
    if (lines.length < 2) return []
    const headers = parseCSVLine(lines[0])
    return lines.slice(1).map(line => {
      const vals = parseCSVLine(line)
      return Object.fromEntries(headers.map((h, i) => [h.trim(), (vals[i] ?? '').trim()]))
    })
  } catch { return [] }
}

const FOOD_EMOJI: Record<string, string> = {
  '1': '🫒',
  '2': '🌿',
  '3': '🍯',
  '4': '🫖',
  '5': '🧀',
  '6': '🥬',
  '7': '🌺',
  '8': '🫘',
  '9': '🍎',
  '10': '🥦',
  '11': '🍃',
  '12': '🌾',
  '13': '🧄',
  '14': '🥑',
  '15': '🫒',
  '16': '🫙',
  '17': '🌱',
  '18': '🍅',
  '19': '🧅',
  '20': '🌿',
  '21': '🍶',
  '22': '🪴',
}

const EVIDENCE: Record<string, { label: string; cls: string }> = {
  '3': {
    label: 'Strong evidence',
    cls: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800',
  },
  '2': {
    label: 'Moderate evidence',
    cls: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
  '1': {
    label: 'Early research',
    cls: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
  },
}

const STATS = [
  { value: '30%', label: 'Reduction in cardiovascular events with an EVOO-enriched Mediterranean diet (PREDIMED trial)', color: 'text-blue-600', border: 'border-blue-200' },
  { value: '521K', label: 'People tracked for 16 years linking daily olive oil to lower all-cause mortality (Zhang et al. 2021)', color: 'text-purple-600', border: 'border-purple-200' },
  { value: '46', label: 'Peer-reviewed studies extracted across 22 Cretan foods — RCTs, meta-analyses, and large cohorts', color: 'text-green-600', border: 'border-green-200' },
]

export default function ProductsPage() {
  const foods       = parseCSV('foods.csv')
  const healthGoals = parseCSV('health_goals.csv')
  const foodGoals   = parseCSV('food_health_goals.csv')
  const compounds   = parseCSV('compounds.csv')
  const uiCopy      = parseCSV('ui_copy.csv')

  const goalById = Object.fromEntries(healthGoals.map(g => [g.goal_id, g.name]))

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[var(--highlight)]/20 to-green-50 dark:to-green-950/30 border-b border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-16">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-[var(--highlight)]" size={20} />
            <span className="text-sm font-semibold text-[var(--color-muted-foreground)]">
              UNESCO Intangible Cultural Heritage
            </span>
          </div>
          <h1 className="font-display font-bold text-3xl md:text-5xl text-[var(--color-foreground)] mb-4 leading-tight">
            The Cretan Diet<br className="hidden md:block" /> & Local Foods
          </h1>
          <p className="text-base md:text-lg text-[var(--color-muted-foreground)] leading-relaxed max-w-2xl">
            Twenty-two iconic Cretan foods — each with health benefits drawn directly from peer-reviewed
            clinical trials, meta-analyses, and large-scale prospective studies.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-16 space-y-16">

        {/* Foods */}
        <section>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-[var(--color-foreground)] mb-2">
            Twenty-Two Iconic Cretan Foods
          </h2>
          <p className="text-[var(--color-muted-foreground)] mb-8">
            Evidence strength is labelled on every health benefit — no marketing, just the science.
          </p>

          <div className="space-y-6">
            {foods.map(food => {
              const fGoals     = foodGoals.filter(fg => fg.food_id === food.food_id)
              const fCompounds = compounds.filter(c  => c.food_id  === food.food_id).slice(0, 4)
              const fCopy      = uiCopy.filter(u     => u.food_id  === food.food_id)[0]

              return (
                <div
                  key={food.food_id}
                  className="bg-[var(--color-card)] border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] p-5 md:p-6 hover:border-[var(--highlight)] transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-5xl flex-shrink-0 leading-none mt-1">
                      {FOOD_EMOJI[food.food_id] ?? '🌿'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-lg text-[var(--color-foreground)] mb-0.5">
                        {food.name}
                      </h3>
                      {food.local_name && (
                        <p className="text-sm text-[var(--highlight)] font-medium mb-2">
                          {food.local_name}
                        </p>
                      )}
                      <p className="text-sm text-[var(--color-muted-foreground)] mb-4 leading-relaxed">
                        {food.description}
                      </p>

                      {/* Evidence-tagged health goals */}
                      {fGoals.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] mb-2">
                            Health Benefits
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {fGoals.map(fg => {
                              const ev = EVIDENCE[fg.evidence_strength] ?? EVIDENCE['1']
                              return (
                                <span
                                  key={fg.goal_id}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${ev.cls}`}
                                >
                                  {goalById[fg.goal_id]}
                                  <span className="opacity-60 text-[10px]">· {ev.label}</span>
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Research highlight */}
                      {fCopy && (
                        <div className="mb-4 p-3 bg-[var(--color-background)] rounded-[var(--radius-lg)] border border-[var(--color-border)]">
                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] mb-1.5">
                            What the Research Says
                          </h4>
                          <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed">
                            {fCopy.description}
                          </p>
                        </div>
                      )}

                      {/* Bioactive compounds */}
                      {fCompounds.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] mb-2">
                            Key Bioactive Compounds
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {fCompounds.map(c => (
                              <span
                                key={c.compound_id}
                                className="px-2.5 py-1 bg-[var(--highlight)]/10 text-[var(--highlight)] rounded-full text-xs font-medium"
                              >
                                {c.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Stats */}
        <section className="p-6 md:p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-[var(--radius-2xl)] border-2 border-blue-200 dark:border-blue-800">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-[var(--color-foreground)] mb-3">
            Research & Evidence
          </h2>
          <p className="text-[var(--color-muted-foreground)] mb-6 leading-relaxed">
            The Cretan diet is one of the most extensively studied dietary patterns in the world.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {STATS.map(s => (
              <div key={s.value} className={`bg-[var(--color-card)] p-5 rounded-[var(--radius-xl)] border ${s.border}`}>
                <div className={`text-4xl font-bold mb-1 ${s.color}`}>{s.value}</div>
                <p className="text-sm text-[var(--color-muted-foreground)]">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--color-muted-foreground)] mt-5">
            Sources: PREDIMED trial · Zhang et al. 2021, BMC Medicine · Peer-reviewed clinical trials and meta-analyses
          </p>
        </section>

        {/* Evidence key */}
        <section className="p-5 bg-[var(--color-card)] rounded-[var(--radius-xl)] border-2 border-[var(--color-border)]">
          <h3 className="font-display font-semibold text-base text-[var(--color-foreground)] mb-3">
            Evidence Key
          </h3>
          <div className="flex flex-wrap gap-3 mb-3">
            {(['3', '2', '1'] as const).map(k => (
              <span key={k} className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${EVIDENCE[k].cls}`}>
                {EVIDENCE[k].label}
              </span>
            ))}
          </div>
          <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed">
            <span className="font-medium">Strong</span> = human RCT or large-scale meta-analysis ·{' '}
            <span className="font-medium">Moderate</span> = small RCT or prospective cohort ·{' '}
            <span className="font-medium">Early research</span> = in vitro or animal model only
          </p>
        </section>

        {/* CTA */}
        <section className="text-center pb-4">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-[var(--color-foreground)] mb-3">
            Start Your Wellness Journey
          </h2>
          <p className="text-[var(--color-muted-foreground)] mb-7 max-w-md mx-auto">
            Discover local producers and experiences that bring these healthy traditions to life
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/explore"
              className="inline-flex items-center justify-center px-7 py-3 bg-[var(--highlight)] text-[var(--highlight-foreground)] rounded-[var(--radius-full)] font-bold hover:opacity-90 transition-opacity"
            >
              Explore Experiences
            </Link>
            <Link
              href="/map"
              className="inline-flex items-center justify-center px-7 py-3 border-2 border-[var(--color-border)] text-[var(--color-foreground)] rounded-[var(--radius-full)] font-bold hover:border-[var(--highlight)] transition-colors"
            >
              Find on Map
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
