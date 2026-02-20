import Anthropic from "@anthropic-ai/sdk"
import { ScrapedFamily, ScrapedModel, GeneratedContent, ParsedSpecs } from "../scraper/types.js"
import { SYSTEM_PROMPT, buildGeneratePrompt } from "./prompts.js"

const GENERATION_DELAY_MS = 2000

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

/** Parse raw spec strings into structured ParsedSpecs */
function parseSpecs(raw: Record<string, string>, series: string): ParsedSpecs {
  const getBool = (key: string): boolean => {
    const val = raw[key]?.toLowerCase()
    return val === "\u2714" || val === "yes" || val === "true" || val === "✔" || val === "✓"
  }

  const getList = (key: string): string[] => {
    const val = raw[key]
    if (!val) return []
    return val
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean)
  }

  const warrantyMap: Record<string, string> = {
    "6": "5 let",
    "5": "3 roky",
    "4": "2 roky",
  }

  return {
    ioPackage: raw["I/O package"] || null,
    npu: getBool("Neural processing unit (NPU)"),
    resolution: raw["4K video decoding"] || raw["Video decoding"] || null,
    videoDecoding4k: raw["4K video decoding"] || null,
    videoDecodingFhd: raw["Full HD decoding"] || null,
    videoRotation4k: getBool("4K video rotation"),
    hdGraphics: raw["HD images/graphics"] || null,
    html5Performance: raw["HTML5 performance"] || null,
    htmlSupport: raw["HTML support"] || null,
    htmlResolution: raw["HTML resolution"] || null,
    hdr10bit: getBool("10-bit HDR"),
    ipStreaming4k: getBool("4K IP streaming"),
    codecs4k: getList("4K codecs"),
    containers4k: getList("4K containers"),
    codecsFhd: getList("Full HD codecs"),
    containersFhd: getList("Full HD containers"),
    imageFormats: getList("Images formats") || getList("Image formats"),
    audioFormats: getList("Audio formats"),
    operatingTemp: raw["Operating temp"] || raw["Operating temperature"] || null,
    dimensions: raw["Dimensions (W x D x H)"] || raw["Dimensions"] || null,
    weight: raw["Weight"] || null,
    powerSupply: raw["Power supply"] || raw["Power"] || null,
    warranty: raw["Warranty"] || warrantyMap[series] || null,
    raw,
  }
}

/** Generate Czech product description using Claude API */
export async function generateDescription(
  client: Anthropic,
  family: ScrapedFamily,
  model: ScrapedModel
): Promise<GeneratedContent> {
  const userPrompt = buildGeneratePrompt(family, model)

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  })

  const textBlock = response.content.find((b) => b.type === "text")
  if (!textBlock || textBlock.type !== "text") {
    throw new Error(`No text response for ${model.modelNumber}`)
  }

  // Parse JSON from response - handle possible markdown wrapping
  let jsonStr = textBlock.text.trim()
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "")
  }

  let parsed: { title: string; subtitle: string; description: string; seoTitle: string; seoDescription: string }
  try {
    parsed = JSON.parse(jsonStr)
  } catch {
    throw new Error(
      `Invalid JSON from Claude for ${model.modelNumber}: ${jsonStr.slice(0, 200)}`
    )
  }

  return {
    modelNumber: model.modelNumber,
    familyCode: family.familyCode,
    series: family.series,
    title: parsed.title,
    subtitle: parsed.subtitle,
    description: parsed.description,
    seoTitle: parsed.seoTitle,
    seoDescription: parsed.seoDescription,
    specs: parseSpecs(model.specs, family.series),
    generatedAt: new Date().toISOString(),
  }
}

/** Generate descriptions for all models in scraped families */
export async function generateAllDescriptions(
  families: ScrapedFamily[]
): Promise<GeneratedContent[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY not set. Export it before running generate."
    )
  }

  const client = new Anthropic({ apiKey })
  const results: GeneratedContent[] = []

  for (const family of families) {
    for (const model of family.models) {
      console.log(`  Generating description for ${model.modelNumber}...`)
      try {
        const content = await generateDescription(client, family, model)
        results.push(content)
        console.log(`    OK: "${content.title}"`)
      } catch (err) {
        console.error(
          `    FAIL: ${model.modelNumber} - ${err instanceof Error ? err.message : err}`
        )
      }
      await delay(GENERATION_DELAY_MS)
    }
  }

  return results
}
