/**
 * Automated translation script — powered by Claude.
 *
 * Reads messages/en.json as the source of truth, finds keys missing in each
 * of the 10 other locale files, and translates them using the Claude API.
 *
 * USAGE
 *   ANTHROPIC_API_KEY=sk-... node scripts/translate.mjs
 *
 * Run this whenever you add new keys to en.json (e.g. after adding a new page
 * or updating scientific product descriptions). It only adds missing keys —
 * it never overwrites existing translations.
 *
 * RULES ENFORCED
 * - The brand name "valsamaki" is NEVER translated.
 * - ICU variables in {curly braces} are preserved exactly.
 * - Translations are batched (20 keys at a time) to stay within token limits.
 */

import Anthropic from '@anthropic-ai/sdk'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const LOCALES = ['el', 'es', 'fr', 'de', 'it', 'nl', 'ru', 'zh', 'ar', 'pt']

const LOCALE_NAMES = {
  el: 'Greek (as spoken in Crete, Greece)',
  es: 'Spanish (Spain)',
  fr: 'French (France)',
  de: 'German (Germany)',
  it: 'Italian (Italy)',
  nl: 'Dutch (Netherlands)',
  ru: 'Russian',
  zh: 'Chinese Simplified (Mandarin)',
  ar: 'Arabic (Modern Standard)',
  pt: 'Portuguese (European)',
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function flattenObject(obj, prefix = '') {
  const result = {}
  for (const [key, val] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${key}` : key
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      Object.assign(result, flattenObject(val, full))
    } else {
      result[full] = String(val)
    }
  }
  return result
}

function setNestedKey(obj, dotPath, value) {
  const parts = dotPath.split('.')
  let cur = obj
  for (let i = 0; i < parts.length - 1; i++) {
    if (typeof cur[parts[i]] !== 'object' || cur[parts[i]] === null) cur[parts[i]] = {}
    cur = cur[parts[i]]
  }
  cur[parts[parts.length - 1]] = value
}

function readJSON(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8'))
  } catch {
    return {}
  }
}

// ── Translation ───────────────────────────────────────────────────────────────

async function translateBatch(client, keys, enValues, localeName) {
  const pairs = keys.map((k) => `"${k}": ${JSON.stringify(enValues[k])}`).join('\n')

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `You are a professional UI translator. Translate the following JSON key-value pairs from English to ${localeName}.

STRICT RULES:
1. Output ONLY a valid JSON object — no explanation, no markdown, no code fences.
2. Keep ALL keys exactly as they appear (do not translate keys).
3. Preserve variables in {curly braces} exactly — e.g. {count}, {position}, {name}.
4. NEVER translate or modify the brand name "valsamaki" — keep it lowercase as-is.
5. Use natural, fluent phrasing appropriate for a food & travel app (friendly, not formal).
6. For Greek (el): use Demotic Greek, not Katharevousa.

English strings to translate:
${pairs}`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error(`No JSON found in response for ${localeName}`)
  return JSON.parse(match[0])
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('ERROR: ANTHROPIC_API_KEY environment variable is not set.')
    process.exit(1)
  }

  const client = new Anthropic({ apiKey })

  const enPath = join(ROOT, 'messages', 'en.json')
  const enData = readJSON(enPath)
  const enFlat = flattenObject(enData)

  console.log(`Source: ${Object.keys(enFlat).length} keys in en.json\n`)

  let totalTranslated = 0

  for (const locale of LOCALES) {
    const localeName = LOCALE_NAMES[locale]
    const filePath = join(ROOT, 'messages', `${locale}.json`)
    const localeData = readJSON(filePath)
    const localeFlat = flattenObject(localeData)

    const missing = Object.keys(enFlat).filter((k) => !(k in localeFlat))

    if (missing.length === 0) {
      console.log(`✓ ${locale}.json  (complete — no missing keys)`)
      continue
    }

    console.log(`→ ${locale}.json  (${missing.length} missing keys)`)

    const BATCH = 20
    for (let i = 0; i < missing.length; i += BATCH) {
      const batch = missing.slice(i, i + BATCH)
      process.stdout.write(`  batch ${Math.floor(i / BATCH) + 1}/${Math.ceil(missing.length / BATCH)}... `)
      try {
        const translations = await translateBatch(client, batch, enFlat, localeName)
        for (const [key, value] of Object.entries(translations)) {
          if (missing.includes(key)) {
            setNestedKey(localeData, key, value)
          }
        }
        console.log('done')
      } catch (err) {
        console.log(`FAILED: ${err.message}`)
      }
    }

    writeFileSync(filePath, JSON.stringify(localeData, null, 2) + '\n', 'utf-8')
    console.log(`  ✓ Written ${locale}.json`)
    totalTranslated += missing.length
  }

  console.log(`\nDone. ${totalTranslated} keys translated across ${LOCALES.length} locales.`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
