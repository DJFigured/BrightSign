import Anthropic from "@anthropic-ai/sdk"
import { GeneratedContent, TranslatedContent } from "../scraper/types.js"
import { SYSTEM_PROMPT, buildTranslatePrompt } from "./prompts.js"

const TRANSLATE_DELAY_MS = 2000
const TARGET_LOCALES = ["sk", "pl", "en", "de"] as const

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

/** Translate a single product's content to one locale */
export async function translateContent(
  client: Anthropic,
  content: GeneratedContent,
  targetLocale: string
): Promise<TranslatedContent> {
  const prompt = buildTranslatePrompt(
    content.modelNumber,
    {
      title: content.title,
      subtitle: content.subtitle,
      description: content.description,
      seoTitle: content.seoTitle,
      seoDescription: content.seoDescription,
    },
    targetLocale
  )

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  })

  const textBlock = response.content.find((b) => b.type === "text")
  if (!textBlock || textBlock.type !== "text") {
    throw new Error(
      `No text response for ${content.modelNumber} → ${targetLocale}`
    )
  }

  let jsonStr = textBlock.text.trim()
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "")
  }

  let parsed: { title: string; subtitle: string; description: string; seoTitle: string; seoDescription: string }
  try {
    parsed = JSON.parse(jsonStr)
  } catch {
    throw new Error(
      `Invalid JSON from Claude for ${content.modelNumber} → ${targetLocale}`
    )
  }

  return {
    modelNumber: content.modelNumber,
    locale: targetLocale,
    title: parsed.title,
    subtitle: parsed.subtitle,
    description: parsed.description,
    seoTitle: parsed.seoTitle,
    seoDescription: parsed.seoDescription,
    translatedAt: new Date().toISOString(),
  }
}

/** Translate all products to all target locales */
export async function translateAll(
  contents: GeneratedContent[],
  locales: string[] = [...TARGET_LOCALES]
): Promise<Map<string, TranslatedContent[]>> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not set.")
  }

  const client = new Anthropic({ apiKey })
  const results = new Map<string, TranslatedContent[]>()

  for (const content of contents) {
    const translations: TranslatedContent[] = []

    for (const locale of locales) {
      console.log(
        `  Translating ${content.modelNumber} → ${locale}...`
      )
      try {
        const translated = await translateContent(client, content, locale)
        translations.push(translated)
        console.log(`    OK: "${translated.title}"`)
      } catch (err) {
        console.error(
          `    FAIL: ${content.modelNumber} → ${locale} - ${err instanceof Error ? err.message : err}`
        )
      }
      await delay(TRANSLATE_DELAY_MS)
    }

    results.set(content.modelNumber, translations)
  }

  return results
}
