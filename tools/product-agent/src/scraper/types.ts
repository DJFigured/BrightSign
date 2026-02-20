/** Data scraped from brightsign.biz for a product family (e.g., HD6) */
export interface ScrapedFamily {
  /** Family code, e.g. "hd6", "xd5" */
  familyCode: string
  /** Series number: "4", "5", "6" */
  series: string
  /** Display name, e.g. "BrightSign HD6" */
  name: string
  /** Hero tagline from the family page */
  tagline: string
  /** Overview description paragraphs */
  overviewText: string[]
  /** Feature bullet points from overview */
  featureBullets: string[]
  /** Datasheet PDF URL */
  datasheetUrl: string | null
  /** Image URLs */
  images: {
    hero: string | null
    product: string | null
    gallery: string[]
    thumbnail: string | null
  }
  /** Individual models extracted from specs table */
  models: ScrapedModel[]
  /** Source URL */
  sourceUrl: string
  /** When this was scraped */
  scrapedAt: string
}

/** Individual model extracted from the TablePress comparison table */
export interface ScrapedModel {
  /** Model number, e.g. "HD226", "HD1026" */
  modelNumber: string
  /** Column index in the specs table (1-based, column-2 = first model) */
  columnIndex: number
  /** Raw specs as key-value pairs from the table */
  specs: Record<string, string>
}

/** Structured specs parsed from raw spec strings */
export interface ParsedSpecs {
  ioPackage: string | null
  npu: boolean
  resolution: string | null
  videoDecoding4k: string | null
  videoDecodingFhd: string | null
  videoRotation4k: boolean
  hdGraphics: string | null
  html5Performance: string | null
  htmlSupport: string | null
  htmlResolution: string | null
  hdr10bit: boolean
  ipStreaming4k: boolean
  codecs4k: string[]
  containers4k: string[]
  codecsFhd: string[]
  containersFhd: string[]
  imageFormats: string[]
  audioFormats: string[]
  operatingTemp: string | null
  dimensions: string | null
  weight: string | null
  powerSupply: string | null
  warranty: string | null
  /** All raw specs for anything we didn't parse */
  raw: Record<string, string>
}

/** Generated product content (Czech) */
export interface GeneratedContent {
  modelNumber: string
  familyCode: string
  series: string
  /** Short product title */
  title: string
  /** One-line subtitle/tagline */
  subtitle: string
  /** Full HTML description (Czech) */
  description: string
  /** SEO meta title */
  seoTitle: string
  /** SEO meta description */
  seoDescription: string
  /** Parsed and structured specs */
  specs: ParsedSpecs
  /** Generated at timestamp */
  generatedAt: string
}

/** Translation of generated content to another language */
export interface TranslatedContent {
  modelNumber: string
  locale: string
  title: string
  subtitle: string
  description: string
  seoTitle: string
  seoDescription: string
  translatedAt: string
}

/** Product ready for Medusa import */
export interface ProductImportData {
  modelNumber: string
  familyCode: string
  series: string
  handle: string
  title: string
  subtitle: string
  description: string
  categoryHandle: string
  images: string[]
  metadata: Record<string, unknown>
  /** Price in CZK (whole units, not cents) */
  priceCZK: number | null
  translations?: Record<string, TranslatedContent>
}

/** Price override entry from manual JSON */
export interface PriceOverride {
  modelNumber: string
  priceCZK: number
  priceEUR?: number
  pricePLN?: number
}
