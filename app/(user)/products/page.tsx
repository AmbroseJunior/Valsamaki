import { readFileSync } from 'fs'
import { join } from 'path'
import { Sparkles, ArrowLeft, ChevronDown } from 'lucide-react'
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

type Category = {
  id: string
  name: string
  blurb: string
  foodIds: string[]
  accent: string  // tailwind classes for the section accent bar
  tile: string    // tailwind classes for the tile hover/border accent
}

const CATEGORIES: Category[] = [
  {
    id: 'olive',
    name: 'Olive Oil & Pantry',
    blurb: 'The cornerstone of every Cretan kitchen — the oil, the fruit, and the vinegar that finishes nearly every dish.',
    foodIds: ['1', '11', '15'],
    accent: 'from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-950/30 border-emerald-200 dark:border-emerald-800',
    tile: 'hover:border-emerald-400 dark:hover:border-emerald-600',
  },
  {
    id: 'herbs',
    name: 'Herbs & Teas',
    blurb: 'Aromatic plants gathered from Cretan hillsides — used as tea, seasoning, and traditional medicine for centuries.',
    foodIds: ['4', '7', '17', '20', '22', '23', '27', '34'],
    accent: 'from-teal-100 to-teal-50 dark:from-teal-900/30 dark:to-teal-950/30 border-teal-200 dark:border-teal-800',
    tile: 'hover:border-teal-400 dark:hover:border-teal-600',
  },
  {
    id: 'greens',
    name: 'Wild Greens & Vegetables',
    blurb: 'Horta, allium, and garden vegetables — the colourful base of the Cretan plate, much of it still foraged from the wild.',
    foodIds: ['2', '6', '10', '24', '29', '33'],
    accent: 'from-lime-100 to-lime-50 dark:from-lime-900/30 dark:to-lime-950/30 border-lime-200 dark:border-lime-800',
    tile: 'hover:border-lime-500 dark:hover:border-lime-600',
  },
  {
    id: 'fruits',
    name: 'Fruits & Nuts',
    blurb: 'Sun-ripened fruit and tree nuts — concentrated polyphenols, healthy fats, and centuries of agricultural tradition.',
    foodIds: ['9', '25', '26', '31'],
    accent: 'from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-950/30 border-orange-200 dark:border-orange-800',
    tile: 'hover:border-orange-400 dark:hover:border-orange-600',
  },
  {
    id: 'legumes',
    name: 'Legumes & Grains',
    blurb: 'Pulses, ancient grains, and the carob pod — the slow-release carbohydrates that fuelled rural Crete for millennia.',
    foodIds: ['8', '12'],
    accent: 'from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-950/30 border-amber-200 dark:border-amber-800',
    tile: 'hover:border-amber-500 dark:hover:border-amber-600',
  },
  {
    id: 'dairy',
    name: 'Dairy & Cheese',
    blurb: 'Sheep- and goat-milk cheeses and yoghurt — the traditional protein and ferment of Cretan kitchens, made today on small farms much as they have been for centuries.',
    foodIds: ['5', '16', '36', '37', '38'],
    accent: 'from-yellow-100 to-yellow-50 dark:from-yellow-900/30 dark:to-yellow-950/30 border-yellow-200 dark:border-yellow-800',
    tile: 'hover:border-yellow-500 dark:hover:border-yellow-600',
  },
  {
    id: 'pantry-wild',
    name: 'Honey, Salt & Hand-Gathered',
    blurb: 'Wild thyme honey from Cretan apiaries, sea salt from coastal pans, and snails hand-gathered after the autumn rains — the pantry and foraged foods that complete the Cretan table.',
    foodIds: ['3', '32', '35'],
    accent: 'from-stone-100 to-stone-50 dark:from-stone-900/30 dark:to-stone-950/30 border-stone-300 dark:border-stone-700',
    tile: 'hover:border-stone-400 dark:hover:border-stone-600',
  },
  {
    id: 'seafood',
    name: 'Fish & Seafood',
    blurb: 'Sardines, anchovies, octopus, sea bream, and sea bass — the daily catch of Cretan fishing villages, rich in omega-3 fatty acids, taurine, and lean protein from some of the Mediterranean\'s cleanest waters.',
    foodIds: ['39', '40', '41'],
    accent: 'from-sky-100 to-sky-50 dark:from-sky-900/30 dark:to-sky-950/30 border-sky-200 dark:border-sky-800',
    tile: 'hover:border-sky-400 dark:hover:border-sky-600',
  },
]

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
  { value: '19%', label: 'Lower all-cause mortality from >0.5 tbsp/day olive oil across 92,383 adults followed for 28 years (Guasch-Ferré et al. 2022, JACC)', color: 'text-blue-600', border: 'border-blue-200' },
  { value: '733K', label: 'Participants pooled across 36 prospective studies confirming olive oil reduces all-cause and cardiometabolic mortality (Martinez-Gonzalez et al. 2022)', color: 'text-purple-600', border: 'border-purple-200' },
  { value: '77', label: 'Peer-reviewed studies extracted across 34 Cretan foods — RCTs, meta-analyses, and large prospective cohorts', color: 'text-green-600', border: 'border-green-200' },
]

// Render up to 3 filled dots based on the food's highest evidence strength
function EvidenceDots({ strength }: { strength: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`Evidence strength ${strength} of 3`}>
      {[1, 2, 3].map(i => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${
            i <= strength
              ? 'bg-[var(--highlight)]'
              : 'bg-[var(--color-border)]'
          }`}
        />
      ))}
    </span>
  )
}

export default function ProductsPage() {
  const foods       = parseCSV('foods.csv')
  const healthGoals = parseCSV('health_goals.csv')
  const foodGoals   = parseCSV('food_health_goals.csv')
  const compounds   = parseCSV('compounds.csv')
  const uiCopy      = parseCSV('ui_copy.csv')

  const goalById = Object.fromEntries(healthGoals.map(g => [g.goal_id, g.name]))
  const foodById = Object.fromEntries(foods.map(f => [f.food_id, f]))

  // Catch any food not assigned to a category, append to last bucket
  const assigned = new Set(CATEGORIES.flatMap(c => c.foodIds))
  const orphaned = foods.map(f => f.food_id).filter(id => !assigned.has(id))
  if (orphaned.length) CATEGORIES[CATEGORIES.length - 1].foodIds.push(...orphaned)

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[var(--highlight)]/20 to-green-50 dark:to-green-950/30 border-b border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-16">
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to explore
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
            Thirty-four iconic Cretan foods — each with health benefits drawn directly from peer-reviewed
            clinical trials, meta-analyses, and large-scale prospective studies.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-16 space-y-16">

        {/* About the Mediterranean Diet */}
        <section className="space-y-5">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-[var(--color-foreground)]">
            The Mediterranean Diet, born in Crete
          </h2>
          <p className="text-[var(--color-muted-foreground)] leading-relaxed">
            The Mediterranean diet is how people have eaten around this sea for centuries — and the version
            studied first, and most carefully, is the Cretan one. In the 1950s the Seven Countries Study
            found that Cretan villagers had the lowest rates of heart disease, cancer, and overall mortality
            of any population surveyed, despite a diet that was more than 40% fat. That paradox launched
            modern nutrition science. The answer, worked out slowly over the following decades, was the
            <em> pattern</em> they ate: extra virgin olive oil at almost every meal, wild greens
            (<em>horta</em>) gathered from the hillsides, legumes, barley rusks, sheep and goat dairy, fresh
            herbs, fish, seasonal fruit, and very little red meat. In 2010 UNESCO inscribed the
            Mediterranean diet as Intangible Cultural Heritage of Humanity, with Greece — and Crete in
            particular — as one of the founding communities.
          </p>

          <h3 className="font-display font-bold text-xl md:text-2xl text-[var(--color-foreground)] pt-2">
            Why the evidence holds up
          </h3>
          <p className="text-[var(--color-muted-foreground)] leading-relaxed">
            What sets the Mediterranean diet apart from almost every other dietary pattern is the depth of
            the research behind it. It is the only diet to have been tested in a multi-year randomized
            controlled trial — the Spanish PREDIMED study, which followed nearly 7,500 adults at high
            cardiovascular risk and reported around a 30% reduction in major cardiovascular events in those
            assigned to the Mediterranean pattern. Beyond that, large prospective cohorts have followed
            hundreds of thousands of adults for decades and consistently link higher adherence to lower
            all-cause mortality, lower rates of type-2 diabetes, slower cognitive decline, and longer
            healthspan. The active ingredients are not single nutrients but a whole-pattern effect —
            polyphenols from olive oil, omega-3s from fish and wild greens, prebiotic fibre from legumes,
            the polyphenol load of Cretan herbs, and the near-absence of ultra-processed food. Each food on
            this page is one piece of that pattern, with the evidence behind it labelled honestly.
          </p>
        </section>

        {/* Categories */}
        <section>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-[var(--color-foreground)] mb-2">
            Browse by Category
          </h2>
          <p className="text-[var(--color-muted-foreground)] mb-8">
            Tap any food to see its bioactive compounds, evidence-tagged health benefits, and what the
            research actually shows.
          </p>

          <div className="space-y-12">
            {CATEGORIES.map(cat => (
              <div key={cat.id}>
                <div className={`bg-gradient-to-br ${cat.accent} border rounded-[var(--radius-xl)] p-5 mb-5`}>
                  <h3 className="font-display font-bold text-xl text-[var(--color-foreground)] mb-1">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
                    {cat.blurb}
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {cat.foodIds.map(fid => {
                    const food = foodById[fid]
                    if (!food) return null
                    const fGoals     = foodGoals.filter(fg => fg.food_id === fid)
                    const fCompounds = compounds.filter(c  => c.food_id  === fid).slice(0, 6)
                    const fCopy      = uiCopy.filter(u     => u.food_id  === fid)[0]
                    const maxStrength = fGoals.reduce(
                      (m, g) => Math.max(m, Number(g.evidence_strength) || 0),
                      0,
                    )

                    return (
                      <details
                        key={fid}
                        className={`group bg-[var(--color-card)] border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] overflow-hidden transition-all ${cat.tile}`}
                      >
                        <summary className="cursor-pointer list-none p-4 flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="font-display font-semibold text-base text-[var(--color-foreground)] leading-tight">
                                {food.name}
                              </h4>
                              <ChevronDown
                                className="h-4 w-4 text-[var(--color-muted-foreground)] flex-shrink-0 mt-0.5 transition-transform group-open:rotate-180"
                              />
                            </div>
                            {food.local_name && (
                              <p className="text-xs text-[var(--highlight)] font-medium mb-2">
                                {food.local_name}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-[var(--color-muted-foreground)]">
                              <EvidenceDots strength={maxStrength} />
                              <span>·</span>
                              <span>{fGoals.length} health benefit{fGoals.length === 1 ? '' : 's'}</span>
                            </div>
                          </div>
                        </summary>

                        <div className="px-4 pb-4 pt-1 border-t border-[var(--color-border)]/50">
                          <p className="text-sm text-[var(--color-muted-foreground)] mb-4 leading-relaxed pt-3">
                            {food.description}
                          </p>

                          {fGoals.length > 0 && (
                            <div className="mb-4">
                              <h5 className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] mb-2">
                                Health Benefits
                              </h5>
                              <div className="flex flex-wrap gap-1.5">
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

                          {fCopy && (
                            <div className="mb-4 p-3 bg-[var(--color-background)] rounded-[var(--radius-lg)] border border-[var(--color-border)]">
                              <h5 className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] mb-1.5">
                                What the Research Says
                              </h5>
                              <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed">
                                {fCopy.description}
                              </p>
                            </div>
                          )}

                          {fCompounds.length > 0 && (
                            <div>
                              <h5 className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] mb-2">
                                Key Bioactive Compounds
                              </h5>
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
                      </details>
                    )
                  })}
                </div>
              </div>
            ))}
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
