import { Leaf, Heart, Brain, Shield, Sparkles, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Local Products' }

const PRODUCTS = [
  {
    icon: '🫒',
    name: 'Extra Virgin Olive Oil',
    description:
      'The cornerstone of the Mediterranean diet, rich in heart-healthy monounsaturated fats and powerful antioxidants.',
    benefits: ['Heart health', 'Anti-inflammatory', 'Antioxidant-rich'],
    science: 'Rich in oleic acid and polyphenols, which reduce cardiovascular disease risk.',
  },
  {
    icon: '🌿',
    name: 'Wild Mountain Herbs',
    description:
      'Cretan dittany, sage, oregano, and thyme — used for centuries in traditional medicine and cuisine.',
    benefits: ['Digestive health', 'Immune support', 'Respiratory health'],
    science: 'Contains essential oils and flavonoids with antimicrobial and anti-inflammatory properties.',
  },
  {
    icon: '🍯',
    name: 'Local Honey',
    description:
      'Raw thyme and pine honey from Cretan mountains, known for exceptional antibacterial properties.',
    benefits: ['Natural antibacterial', 'Energy boost', 'Wound healing'],
    science: 'High in antioxidants and has prebiotic effects supporting gut health.',
  },
  {
    icon: '🧀',
    name: 'Graviera Cheese',
    description:
      'Traditional Cretan hard cheese made from sheep and goat milk, rich in protein and calcium.',
    benefits: ['Bone health', 'High protein', 'Probiotic-rich'],
    science: 'Contains CLA (conjugated linoleic acid) which may support weight management.',
  },
  {
    icon: '🫘',
    name: 'Legumes & Pulses',
    description: 'Chickpeas, lentils, and fava beans — staples of Mediterranean cuisine.',
    benefits: ['Fiber-rich', 'Plant protein', 'Blood sugar control'],
    science: 'Low glycemic index foods that support cardiovascular and metabolic health.',
  },
  {
    icon: '🥬',
    name: 'Fresh Vegetables',
    description: 'Seasonal vegetables including tomatoes, eggplant, zucchini, and leafy greens.',
    benefits: ['Nutrient-dense', 'Antioxidants', 'Digestive health'],
    science: 'High in vitamins, minerals, and phytonutrients that support overall wellness.',
  },
]

const PRINCIPLES = [
  {
    icon: <Leaf className="text-green-600" size={28} />,
    title: 'Plant-Based Foundation',
    description:
      'Emphasis on vegetables, fruits, whole grains, legumes, nuts, and seeds as dietary staples.',
  },
  {
    icon: <Heart className="text-red-500" size={28} />,
    title: 'Heart-Healthy Fats',
    description:
      'Olive oil as the primary fat source, providing monounsaturated fats and antioxidants.',
  },
  {
    icon: <Brain className="text-purple-600" size={28} />,
    title: 'Cognitive Benefits',
    description:
      'Diet associated with reduced risk of cognitive decline and neurodegenerative diseases.',
  },
  {
    icon: <Shield className="text-blue-600" size={28} />,
    title: 'Disease Prevention',
    description: 'Linked to lower rates of heart disease, diabetes, and certain cancers.',
  },
]

const STATS = [
  { value: '30%', label: 'Reduction in cardiovascular disease risk', color: 'text-blue-600', border: 'border-blue-200' },
  { value: '23%', label: 'Lower risk of type 2 diabetes', color: 'text-purple-600', border: 'border-purple-200' },
  { value: '40%', label: 'Reduced cognitive decline in older adults', color: 'text-green-600', border: 'border-green-200' },
]

export default function ProductsPage() {
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
            The Mediterranean Diet<br className="hidden md:block" /> & Local Products
          </h1>
          <p className="text-base md:text-lg text-[var(--color-muted-foreground)] leading-relaxed max-w-2xl">
            Discover the science-backed health benefits of Cretan traditional foods and the
            Mediterranean lifestyle. Learn how local products contribute to one of the world&apos;s
            healthiest diets.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-16 space-y-16">

        {/* Mediterranean Diet Principles */}
        <section>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-[var(--color-foreground)] mb-6">
            Mediterranean Diet Principles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PRINCIPLES.map((p) => (
              <div
                key={p.title}
                className="p-5 bg-[var(--color-card)] border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] hover:border-[var(--highlight)] transition-colors"
              >
                <div className="mb-3">{p.icon}</div>
                <h3 className="font-display font-semibold text-base text-[var(--color-foreground)] mb-1.5">
                  {p.title}
                </h3>
                <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Local Products */}
        <section>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-[var(--color-foreground)] mb-2">
            Featured Local Products
          </h2>
          <p className="text-[var(--color-muted-foreground)] mb-8">
            Explore the health benefits of authentic Cretan products, backed by Mediterranean diet research.
          </p>

          <div className="space-y-4">
            {PRODUCTS.map((product) => (
              <div
                key={product.name}
                className="bg-[var(--color-card)] border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] p-5 hover:border-[var(--highlight)] transition-all"
              >
                <div className="flex items-start gap-5">
                  <div className="text-5xl flex-shrink-0 leading-none mt-1">{product.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-lg text-[var(--color-foreground)] mb-1.5">
                      {product.name}
                    </h3>
                    <p className="text-sm text-[var(--color-muted-foreground)] mb-4 leading-relaxed">
                      {product.description}
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] mb-2">
                          Health Benefits
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {product.benefits.map((b) => (
                            <span
                              key={b}
                              className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-medium"
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] mb-2">
                          The Science
                        </h4>
                        <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed">
                          {product.science}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Research & Evidence */}
        <section className="p-6 md:p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-[var(--radius-2xl)] border-2 border-blue-200 dark:border-blue-800">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-[var(--color-foreground)] mb-3">
            Research & Evidence
          </h2>
          <p className="text-[var(--color-muted-foreground)] mb-6 leading-relaxed">
            The Mediterranean diet is one of the most extensively studied dietary patterns in the
            world. Research consistently shows:
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {STATS.map((s) => (
              <div
                key={s.value}
                className={`bg-[var(--color-card)] p-5 rounded-[var(--radius-xl)] border ${s.border}`}
              >
                <div className={`text-4xl font-bold mb-1 ${s.color}`}>{s.value}</div>
                <p className="text-sm text-[var(--color-muted-foreground)]">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--color-muted-foreground)] mt-5">
            Sources: PREDIMED Study, European Journal of Clinical Nutrition, The Lancet
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
