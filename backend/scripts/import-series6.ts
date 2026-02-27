/**
 * BrightSign Série 6 — Standalone Import Script
 *
 * Importuje 4 produkty Série 6 (HD226, HD1026, XD236, XD1036) do Medusa.js.
 * Obsahuje kompletní reálná data ze stránek brightsign.biz včetně specifikací,
 * popisů, SEO metadat a multi-currency cen.
 *
 * Spuštění:
 *   cd backend && npx medusa exec ./scripts/import-series6.ts
 *
 * Prerekvizity:
 *   - Seed proběhl (kategorie, sales channel, shipping profile)
 *   - add-categories.ts proběhl (serie-6, hd6-serie, xd6-serie kategorie)
 *
 * Poznámky:
 *   - Ceny v CZK = s DPH (koncový zákazník), Medusa ukládá v haléřích (CZK*100)
 *   - EUR a PLN ceny jsou manuálně nastaveny pro konkurenceschopnost na trzích
 *   - COMM-TEC dealer discount: 35% z RRP
 *   - CZ: vyrovnat/podrazit českou konkurenci
 *   - PL: first-mover advantage (žádný lokální e-shop nemá S6)
 *   - SK: stejné ceny jako CZ (EUR konverze)
 *
 * Zdroje dat:
 *   - Specifikace: brightsign.biz/brightsign-players/series-6/
 *   - Ceny: vlastní kalkulace na základě S5 + 15% přirážky
 *   - Konkurence: ab-com.cz, daars.pl, brightsign-shop.eu
 */

import {
  CreateInventoryLevelInput,
  ExecArgs,
} from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createInventoryLevelsWorkflow,
  createProductsWorkflow,
} from "@medusajs/medusa/core-flows"

// ─── Série 6 Product Data ────────────────────────────────────────────────────

interface Series6Product {
  modelNumber: string
  familyCode: string
  title: string
  subtitle: string
  handle: string
  sku: string
  description: string
  seoTitle: string
  seoDescription: string
  categoryHandles: string[]
  prices: {
    czk: number // CZK s DPH
    eur: number // EUR s DPH
    pln: number // PLN s DPH
  }
  specs: Record<string, string>
  features: string[]
  warranty: string
  dimensions: string
  weight: string
  operatingTemp: string
  powerSupply: string
  datasheetUrl: string
  imageUrl: string | null
  translations: {
    [locale: string]: {
      title: string
      subtitle: string
      seoTitle: string
      seoDescription: string
    }
  }
}

const SERIES_6_PRODUCTS: Series6Product[] = [
  // ─── HD226 ───────────────────────────────────────────────────────────────
  {
    modelNumber: "HD226",
    familyCode: "hd6",
    title: "BrightSign HD226 -- Vstupni 4K prehravac s HDR",
    subtitle:
      "Entry-level 4K prehravac pro digital signage s 10-bit HDR podporou a pokrocilymi interaktivnimi funkcemi.",
    handle: "brightsign-hd226",
    sku: "BS-HD226",
    description: `<p>BrightSign HD226 je vstupni model ze Serie 6, ktery nabizi vynikajici pomer ceny a vykonu pro 4K digital signage aplikace. Diky 10-bit HDR podpore a pokrocile HTML5 kompatibilite predstavuje idealni reseni pro projekty vyzadujici premiovou kvalitu zobrazeni bez vysokych investicnich nakladu.</p>
<h3>Klicove vlastnosti</h3>
<ul>
<li><strong>4K HDR zobrazeni</strong> -- Single 4K dekodovani s 10-bit HDR podporou pro zive barvy a vysoky kontrast</li>
<li><strong>Pokrocile HTML5 vykony</strong> -- Modularni 2D motion grafika s plnou Chromium kompatibilitou</li>
<li><strong>Neuralni procesorova jednotka (NPU)</strong> -- Umoznuje AI-powered interaktivni aplikace a analyzu obsahu</li>
<li><strong>4K video rotace</strong> -- Flexibilni orientace obsahu pro portrait i landscape displeje</li>
<li><strong>Siroka kodek podpora</strong> -- H.265, H.264 pri 60p a vsechny hlavni kontejnery vcetne VP9 a AV1</li>
<li><strong>Bezpecne uloziste</strong> -- Interni microSD slot pro spolehlive a zabezpecene ukladani obsahu</li>
</ul>
<h3>Idealni vyuziti</h3>
<ul>
<li>Retail prostory s pozadavkem na 4K HDR kvalitu</li>
<li>Korporatni komunikace a informacni systemy</li>
<li>Interaktivni aplikace s AI funkcionalitou</li>
<li>Mensi projekty vyzadujici spolehlivost Serie 6</li>
</ul>`,
    seoTitle: "BrightSign HD226 - 4K Digital Signage Prehravac | BrightSign.cz",
    seoDescription:
      "HD226 4K prehravac s 10-bit HDR a NPU. HTML5 vykon, AI funkce, 5 let zaruka. Skladem, doprava do 48h.",
    categoryHandles: ["hd6-serie", "hd-prehravace"],
    prices: { czk: 17100, eur: 670, pln: 2799 },
    specs: {
      "I/O package": "Standard",
      "Neural processing unit (NPU)": "Ano",
      "4K video decoding": "Single 10-bit at 60p",
      "Full HD video decoding": "Dual at 60p",
      "4K video rotation": "Ano",
      "HD images & graphics": "Ano",
      "HTML5 performance": "Modular 2D motion graphics",
      "HTML resolution": "HD",
      "10-bit HDR support": "Ano",
      "4K IP streaming": "Ano",
      "4K video codecs": "H.265, H.264 at 60p",
      "Full HD codecs": "H.265, H.264, VP9, MPEG-4, MPEG-1/2",
      "Audio": "MP2, MP3, AAC, WAV (eAC3 pass-through)",
    },
    features: [
      "4K Single HDR 10-bit",
      "NPU (AI ready)",
      "HTML5 + Chromium",
      "4K video rotace",
      "Interni microSD",
      "5 let zaruka",
    ],
    warranty: "5 let",
    dimensions: "205 x 185.9 x 19.2 mm",
    weight: "0.59 kg",
    operatingTemp: "0C az 50C",
    powerSupply: "12V / 3A (uzamykatelny adapter)",
    datasheetUrl:
      "https://www.brightsign.biz/wp-content/uploads/2025/06/HD6-datasheet-20250604.pdf",
    imageUrl: "/products/hd6-front.png",
    translations: {
      sk: {
        title: "BrightSign HD226 -- Vstupny 4K prehravac s HDR",
        subtitle:
          "Entry-level 4K prehravac pre digital signage s 10-bit HDR podporou a pokrocilymi interaktivnymi funkciami.",
        seoTitle:
          "BrightSign HD226 - 4K Digital Signage Prehravac | BrightSign.cz",
        seoDescription:
          "HD226 4K prehravac s 10-bit HDR a NPU. HTML5 vykon, AI funkcie, 5 rokov zaruka.",
      },
      en: {
        title: "BrightSign HD226 -- Entry-Level 4K Player with HDR",
        subtitle:
          "Entry-level 4K digital signage player with 10-bit HDR support and advanced interactive features.",
        seoTitle: "BrightSign HD226 - 4K Digital Signage Player | BrightSign.cz",
        seoDescription:
          "HD226 4K player with 10-bit HDR and NPU. HTML5 performance, AI features, 5-year warranty.",
      },
      pl: {
        title: "BrightSign HD226 -- Podstawowy odtwarzacz 4K z HDR",
        subtitle:
          "Podstawowy odtwarzacz 4K do digital signage z obsluga 10-bit HDR i zaawansowanymi funkcjami interaktywnymi.",
        seoTitle:
          "BrightSign HD226 - Odtwarzacz 4K Digital Signage | BrightSign.cz",
        seoDescription:
          "HD226 odtwarzacz 4K z 10-bit HDR i NPU. Wydajnosc HTML5, funkcje AI, 5 lat gwarancji.",
      },
      de: {
        title: "BrightSign HD226 -- Einsteiger 4K-Player mit HDR",
        subtitle:
          "Einsteiger 4K Digital Signage Player mit 10-Bit HDR-Unterstutzung und fortschrittlichen interaktiven Funktionen.",
        seoTitle:
          "BrightSign HD226 - 4K Digital Signage Player | BrightSign.cz",
        seoDescription:
          "HD226 4K-Player mit 10-Bit HDR und NPU. HTML5-Leistung, KI-Funktionen, 5 Jahre Garantie.",
      },
    },
  },

  // ─── HD1026 ──────────────────────────────────────────────────────────────
  {
    modelNumber: "HD1026",
    familyCode: "hd6",
    title: "BrightSign HD1026 -- 4K prehravac s rozsirenym I/O",
    subtitle:
      "4K prehravac s rozsirenym I/O balickem, Live TV vstupem a dualnim Ethernet pro profesionalni instalace.",
    handle: "brightsign-hd1026",
    sku: "BS-HD1026",
    description: `<p>BrightSign HD1026 nabizi vsechny funkce modelu HD226 a navic rozliceny I/O balicek s Live TV vstupem (HDMI In), dualnim Ethernet a GPIO porty. Idealni pro profesionalni instalace, kde potrebujete vstup z externi zdroju nebo rozsirenou konektivitu.</p>
<h3>Klicove vlastnosti</h3>
<ul>
<li><strong>Rozsireny I/O balicek</strong> -- HDMI vstup pro Live TV, dualny Ethernet, USB-C, GPIO</li>
<li><strong>4K HDR zobrazeni</strong> -- Single 4K dekodovani s 10-bit HDR podporou</li>
<li><strong>NPU pro AI aplikace</strong> -- Hardwarova AI akcelerace pro pokrocile interakce</li>
<li><strong>Live TV integrace</strong> -- HDMI vstup umoznuje zobrazeni externi signalu (TV, kamera)</li>
<li><strong>Robustni konektivita</strong> -- Dva Ethernet porty pro redundantni pripojeni</li>
</ul>
<h3>Idealni vyuziti</h3>
<ul>
<li>Korporatni prostory s pozadavkem na Live TV vstup</li>
<li>Restaurace a hotely s TV integraci</li>
<li>Informacni systemy s externimi zdroji dat</li>
<li>Instalace vyzadujici rozsirenou konektivitu</li>
</ul>`,
    seoTitle:
      "BrightSign HD1026 - 4K Prehravac s Live TV vstupem | BrightSign.cz",
    seoDescription:
      "HD1026 4K prehravac s rozsirenym I/O, HDMI vstupem, dualnim Ethernet a NPU. 5 let zaruka.",
    categoryHandles: ["hd6-serie", "hd-prehravace"],
    prices: { czk: 20600, eur: 808, pln: 3399 },
    specs: {
      "I/O package": "Expanded (HDMI In, Dual Ethernet, USB-C, GPIO)",
      "Neural processing unit (NPU)": "Ano",
      "4K video decoding": "Single 10-bit at 60p",
      "Full HD video decoding": "Dual at 60p",
      "Live TV input (HDMI In)": "Ano",
      "4K video rotation": "Ano",
      "HD images & graphics": "Ano",
      "HTML5 performance": "Modular 2D motion graphics",
      "HTML resolution": "HD",
      "10-bit HDR support": "Ano",
      "4K IP streaming": "Ano",
      "Dual Ethernet": "Ano",
      "Audio": "MP2, MP3, AAC, WAV (eAC3 pass-through)",
    },
    features: [
      "HDMI vstup (Live TV)",
      "Dual Ethernet",
      "4K Single HDR 10-bit",
      "NPU (AI ready)",
      "USB-C + GPIO",
      "5 let zaruka",
    ],
    warranty: "5 let",
    dimensions: "205 x 185.9 x 19.2 mm",
    weight: "0.59 kg",
    operatingTemp: "0C az 50C",
    powerSupply: "12V / 3A (uzamykatelny adapter)",
    datasheetUrl:
      "https://www.brightsign.biz/wp-content/uploads/2025/06/HD6-datasheet-20250604.pdf",
    imageUrl: "/products/hd6-front.png",
    translations: {
      sk: {
        title: "BrightSign HD1026 -- 4K prehravac s rozsirenym I/O",
        subtitle:
          "4K prehravac s rozsirenym I/O balickom, Live TV vstupom a dualnym Ethernet pre profesionalne instalacie.",
        seoTitle:
          "BrightSign HD1026 - 4K Prehravac s Live TV vstupom | BrightSign.cz",
        seoDescription:
          "HD1026 4K prehravac s rozsirenym I/O, HDMI vstupom, dualnym Ethernet a NPU. 5 rokov zaruka.",
      },
      en: {
        title: "BrightSign HD1026 -- 4K Player with Expanded I/O",
        subtitle:
          "4K player with expanded I/O package, Live TV input and dual Ethernet for professional installations.",
        seoTitle:
          "BrightSign HD1026 - 4K Player with Live TV Input | BrightSign.cz",
        seoDescription:
          "HD1026 4K player with expanded I/O, HDMI input, dual Ethernet and NPU. 5-year warranty.",
      },
      pl: {
        title: "BrightSign HD1026 -- Odtwarzacz 4K z rozszerzonym I/O",
        subtitle:
          "Odtwarzacz 4K z rozszerzonym pakietem I/O, wejsciem Live TV i podwojnym Ethernet do profesjonalnych instalacji.",
        seoTitle:
          "BrightSign HD1026 - Odtwarzacz 4K z wejsciem Live TV | BrightSign.cz",
        seoDescription:
          "HD1026 odtwarzacz 4K z rozszerzonym I/O, wejsciem HDMI, podwojnym Ethernet i NPU. 5 lat gwarancji.",
      },
      de: {
        title: "BrightSign HD1026 -- 4K-Player mit erweitertem I/O",
        subtitle:
          "4K-Player mit erweitertem I/O-Paket, Live-TV-Eingang und Dual-Ethernet fur professionelle Installationen.",
        seoTitle:
          "BrightSign HD1026 - 4K-Player mit Live TV Eingang | BrightSign.cz",
        seoDescription:
          "HD1026 4K-Player mit erweitertem I/O, HDMI-Eingang, Dual-Ethernet und NPU. 5 Jahre Garantie.",
      },
    },
  },

  // ─── XD236 ───────────────────────────────────────────────────────────────
  {
    modelNumber: "XD236",
    familyCode: "xd6",
    title: "BrightSign XD236 -- Vykonny 4K prehravac s PoE+",
    subtitle:
      "Dual 4K vykon s HDR a rozsiritelnym ulozistem pro narocne instalace kdekoli.",
    handle: "brightsign-xd236",
    sku: "BS-XD236",
    description: `<p>BrightSign XD236 ze Serie 6 prinasi vysoky vykon 4K grafiky a dual 4K video dekodovani s flexibilnim napajenim pres PoE+. Idealni pro profesionalni instalace tam, kde potrebujete spolehlivy vykon bez kompromisu pri zachovani flexibility nasazeni.</p>
<h3>Klicove vlastnosti</h3>
<ul>
<li><strong>Dual 4K video s HDR</strong> -- Dekodovani dvou 4K streamu soucasne v 10-bit kvalite pri 60fps</li>
<li><strong>Power over Ethernet Plus</strong> -- Nasazeni kdekoli s jednim kabelem pro data i napajeni</li>
<li><strong>Neural Processing Unit</strong> -- Hardwarova AI akcelerace pro pokrocile aplikace</li>
<li><strong>Rozsiritelne uloziste</strong> -- Interni M.2 SSD slot pro vetsi kapacitu a rychlost</li>
<li><strong>Pokrocile webove technologie</strong> -- Plynula 2D WebGL animace na celou obrazovku</li>
<li><strong>Siroka kodek podpora</strong> -- H.265, H.264, VP9 v 4K i Full HD rozliseni</li>
</ul>
<h3>Idealni vyuziti</h3>
<ul>
<li>Dual screen instalace v retail a korporatnim prostredi</li>
<li>4K projekce pro konferencni saly a prezentacni mistnosti</li>
<li>Interaktivni aplikace s AI funkcionalitou</li>
<li>Vzdalene lokace s PoE+ infrastrukturou</li>
</ul>`,
    seoTitle:
      "BrightSign XD236 - Dual 4K Digital Signage Prehravac | BrightSign.cz",
    seoDescription:
      "XD236 s dual 4K HDR vykonem a PoE+. Neural processing, rozsiritelne uloziste M.2, 5 let zaruka.",
    categoryHandles: ["xd6-serie", "xd-prehravace"],
    prices: { czk: 22300, eur: 875, pln: 3699 },
    specs: {
      "I/O package": "Standard",
      "Neural processing unit (NPU)": "Ano",
      "4K video decoding": "Dual 10-bit at 60p",
      "Full HD video decoding": "Dual at 60p",
      "HTML5 performance": "Smooth full screen 2D WebGL motion",
      "Image & graphics resolution": "4K",
      "10-bit HDR support": "Ano",
      "4K IP streaming": "Ano",
      "Power over Ethernet Plus (PoE+)": "Ano",
      "M.2 SSD slot": "Ano",
      "4K video codecs": "H.265, H.264 at 60p",
      "Full HD codecs": "H.265, H.264, VP9, MPEG-4, MPEG-1/2",
      "Audio": "MP2, MP3, AAC, WAV (eAC3 pass-through)",
    },
    features: [
      "Dual 4K HDR 10-bit",
      "PoE+ napajeni",
      "NPU (AI ready)",
      "M.2 SSD slot",
      "4K WebGL grafika",
      "5 let zaruka",
    ],
    warranty: "5 let",
    dimensions: "205 x 185.9 x 19.2 mm",
    weight: "0.59 kg",
    operatingTemp: "0C az 50C",
    powerSupply: "PoE+ nebo 12V / 3A",
    datasheetUrl:
      "https://www.brightsign.biz/wp-content/uploads/2025/06/XD6-datasheet-20250604.pdf",
    imageUrl: "/products/xd6-front.png",
    translations: {
      sk: {
        title: "BrightSign XD236 -- Vykonny 4K prehravac s PoE+",
        subtitle:
          "Dual 4K vykon s HDR a rozsiritelnym uloznym priestorom pre narocne instalacie kdekolvek.",
        seoTitle:
          "BrightSign XD236 - Dual 4K Digital Signage Prehravac | BrightSign.cz",
        seoDescription:
          "XD236 s dual 4K HDR vykonom a PoE+. Neural processing, M.2 ulozisko, 5 rokov zaruka.",
      },
      en: {
        title: "BrightSign XD236 -- Powerful 4K Player with PoE+",
        subtitle:
          "Dual 4K performance with HDR and expandable storage for demanding installations anywhere.",
        seoTitle:
          "BrightSign XD236 - Dual 4K Digital Signage Player | BrightSign.cz",
        seoDescription:
          "XD236 with dual 4K HDR and PoE+. Neural processing, M.2 expandable storage, 5-year warranty.",
      },
      pl: {
        title: "BrightSign XD236 -- Wydajny odtwarzacz 4K z PoE+",
        subtitle:
          "Podwojna wydajnosc 4K z HDR i rozszerzalna pamiec do wymagajacych instalacji w kazdym miejscu.",
        seoTitle:
          "BrightSign XD236 - Podwojny odtwarzacz 4K Digital Signage | BrightSign.cz",
        seoDescription:
          "XD236 z podwojnym 4K HDR i PoE+. Procesor neuronowy, M.2 SSD, 5 lat gwarancji.",
      },
      de: {
        title: "BrightSign XD236 -- Leistungsstarker 4K-Player mit PoE+",
        subtitle:
          "Dual 4K Leistung mit HDR und erweiterbarem Speicher fur anspruchsvolle Installationen uberall.",
        seoTitle:
          "BrightSign XD236 - Dual 4K Digital Signage Player | BrightSign.cz",
        seoDescription:
          "XD236 mit Dual 4K HDR und PoE+. Neuronale Verarbeitung, M.2-Erweiterung, 5 Jahre Garantie.",
      },
    },
  },

  // ─── XD1036 ──────────────────────────────────────────────────────────────
  {
    modelNumber: "XD1036",
    familyCode: "xd6",
    title: "BrightSign XD1036 -- Vykonny 4K prehravac s rozsirenym I/O",
    subtitle:
      "Dual 4K vykon s HDR, PoE+, Live TV vstupem a dualnim Ethernet pro nejnarocnejsi instalace.",
    handle: "brightsign-xd1036",
    sku: "BS-XD1036",
    description: `<p>BrightSign XD1036 je vlajkova lod Serie 6 XD rady. Kombinuje vsechny prednosti XD236 s rozsirenym I/O balickem vcetne HDMI vstupu pro Live TV, dualniho Ethernetu a GPIO portu. Idealni pro enterprise instalace, kde potrebujete maximalni flexibilitu a konektivitu.</p>
<h3>Klicove vlastnosti</h3>
<ul>
<li><strong>Dual 4K video s HDR</strong> -- Dekodovani dvou 4K streamu v 10-bit kvalite pri 60fps</li>
<li><strong>Rozsireny I/O balicek</strong> -- HDMI vstup, dualny Ethernet, USB-C, GPIO, SPDIF audio</li>
<li><strong>Power over Ethernet Plus</strong> -- Napajeni a data jednim kabelem</li>
<li><strong>NPU + M.2 SSD</strong> -- AI akcelerace a vysokokapacitni uloziste</li>
<li><strong>4K WebGL grafika</strong> -- Plynula full-screen animace pro interaktivni obsah</li>
<li><strong>Live TV integrace</strong> -- Externí HDMI zdroj primo v digital signage layoutu</li>
</ul>
<h3>Idealni vyuziti</h3>
<ul>
<li>Enterprise digital signage s pozadavkem na Live TV</li>
<li>Sportovni bary a stadiony s multi-source obsahem</li>
<li>Konferencni centra a event prostory</li>
<li>Rozsahle multi-display instalace s centralnim rizenim</li>
</ul>`,
    seoTitle:
      "BrightSign XD1036 - Dual 4K Prehravac s Live TV | BrightSign.cz",
    seoDescription:
      "XD1036 dual 4K HDR prehravac s PoE+, HDMI vstupem, dualnim Ethernet a NPU. Vlajkova lod Serie 6.",
    categoryHandles: ["xd6-serie", "xd-prehravace"],
    prices: { czk: 25800, eur: 1012, pln: 4249 },
    specs: {
      "I/O package": "Expanded (HDMI In, Dual Ethernet, USB-C, GPIO, SPDIF)",
      "Neural processing unit (NPU)": "Ano",
      "4K video decoding": "Dual 10-bit at 60p",
      "Full HD video decoding": "Dual at 60p",
      "Live TV input (HDMI In)": "Ano",
      "HTML5 performance": "Smooth full screen 2D WebGL motion",
      "Image & graphics resolution": "4K",
      "10-bit HDR support": "Ano",
      "4K IP streaming": "Ano",
      "Power over Ethernet Plus (PoE+)": "Ano",
      "M.2 SSD slot": "Ano",
      "Dual Ethernet": "Ano",
      "4K video codecs": "H.265, H.264 at 60p",
      "Full HD codecs": "H.265, H.264, VP9, MPEG-4, MPEG-1/2",
      "Audio": "MP2, MP3, AAC, WAV, SPDIF out (eAC3 pass-through)",
    },
    features: [
      "HDMI vstup (Live TV)",
      "Dual 4K HDR 10-bit",
      "PoE+ napajeni",
      "Dual Ethernet",
      "NPU + M.2 SSD",
      "5 let zaruka",
    ],
    warranty: "5 let",
    dimensions: "205 x 185.9 x 19.2 mm",
    weight: "0.59 kg",
    operatingTemp: "0C az 50C",
    powerSupply: "PoE+ nebo 12V / 3A",
    datasheetUrl:
      "https://www.brightsign.biz/wp-content/uploads/2025/06/XD6-datasheet-20250604.pdf",
    imageUrl: "/products/xd6-front.png",
    translations: {
      sk: {
        title: "BrightSign XD1036 -- Vykonny 4K prehravac s rozsirenym I/O",
        subtitle:
          "Dual 4K vykon s HDR, PoE+, Live TV vstupom a dualnym Ethernet pre najnarocnejsie instalacie.",
        seoTitle:
          "BrightSign XD1036 - Dual 4K Prehravac s Live TV | BrightSign.cz",
        seoDescription:
          "XD1036 dual 4K HDR prehravac s PoE+, HDMI vstupom, dualnym Ethernet a NPU. Vlajkova lod Serie 6.",
      },
      en: {
        title: "BrightSign XD1036 -- Powerful 4K Player with Expanded I/O",
        subtitle:
          "Dual 4K performance with HDR, PoE+, Live TV input and dual Ethernet for the most demanding installations.",
        seoTitle:
          "BrightSign XD1036 - Dual 4K Player with Live TV | BrightSign.cz",
        seoDescription:
          "XD1036 dual 4K HDR player with PoE+, HDMI input, dual Ethernet and NPU. Series 6 flagship.",
      },
      pl: {
        title: "BrightSign XD1036 -- Wydajny odtwarzacz 4K z rozszerzonym I/O",
        subtitle:
          "Podwojna wydajnosc 4K z HDR, PoE+, wejsciem Live TV i podwojnym Ethernet do najbardziej wymagajacych instalacji.",
        seoTitle:
          "BrightSign XD1036 - Podwojny odtwarzacz 4K z Live TV | BrightSign.cz",
        seoDescription:
          "XD1036 podwojny odtwarzacz 4K HDR z PoE+, wejsciem HDMI, podwojnym Ethernet i NPU. Flagowiec Serii 6.",
      },
      de: {
        title: "BrightSign XD1036 -- Leistungsstarker 4K-Player mit erweitertem I/O",
        subtitle:
          "Dual 4K Leistung mit HDR, PoE+, Live-TV-Eingang und Dual-Ethernet fur anspruchsvollste Installationen.",
        seoTitle:
          "BrightSign XD1036 - Dual 4K Player mit Live TV | BrightSign.cz",
        seoDescription:
          "XD1036 Dual 4K HDR Player mit PoE+, HDMI-Eingang, Dual-Ethernet und NPU. Serie 6 Flaggschiff.",
      },
    },
  },
]

// ─── Import Logic ────────────────────────────────────────────────────────────

export default async function importSeries6({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)

  logger.info("=== BrightSign Serie 6 Import ===")
  logger.info(`Importing ${SERIES_6_PRODUCTS.length} products...`)

  // Load categories
  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle", "name"],
  })
  const categoryByHandle = new Map(categories.map((c: any) => [c.handle, c]))

  // Check for missing categories
  const allHandles = new Set(
    SERIES_6_PRODUCTS.flatMap((p) => p.categoryHandles)
  )
  for (const handle of allHandles) {
    if (!categoryByHandle.has(handle)) {
      logger.warn(
        `Category "${handle}" not found. Run add-categories.ts first.`
      )
    }
  }

  // Get shipping profile
  const shippingProfiles =
    await fulfillmentModuleService.listShippingProfiles({ type: "default" })
  const shippingProfile = shippingProfiles[0]
  if (!shippingProfile) {
    throw new Error("No default shipping profile found. Run seed first.")
  }

  // Get sales channel
  const salesChannels = await salesChannelModuleService.listSalesChannels({
    name: "BrightSign Webshop",
  })
  if (!salesChannels.length) {
    throw new Error("No BrightSign Webshop sales channel. Run seed first.")
  }

  // Check for existing products
  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
  })
  const existingHandles = new Set(existingProducts.map((p: any) => p.handle))

  // Build product inputs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const productInputs: any[] = []

  for (const product of SERIES_6_PRODUCTS) {
    if (existingHandles.has(product.handle)) {
      logger.info(`  SKIP: ${product.modelNumber} (already exists)`)
      continue
    }

    const categoryIds = product.categoryHandles
      .map((h) => categoryByHandle.get(h)?.id)
      .filter(Boolean) as string[]

    // Medusa stores prices in minor units (halere/cents/grosze)
    const prices = [
      { currency_code: "czk", amount: product.prices.czk * 100 },
      { currency_code: "eur", amount: product.prices.eur * 100 },
      { currency_code: "pln", amount: product.prices.pln * 100 },
    ]

    const metadata: Record<string, unknown> = {
      productNumber: product.modelNumber,
      series: "6",
      familyCode: product.familyCode,
      familyName: product.familyCode.toUpperCase(),
      lineCode: product.familyCode.replace(/[0-9]/g, "").toUpperCase(),
      clearance: "false",
      warranty: product.warranty,
      datasheetUrl: product.datasheetUrl,
      features: product.features,
      specs: product.specs,
      dimensions: product.dimensions,
      weight: product.weight,
      operatingTemp: product.operatingTemp,
      powerSupply: product.powerSupply,
      seo: {
        title: product.seoTitle,
        description: product.seoDescription,
      },
      translations: product.translations,
    }

    productInputs.push({
      title: product.title,
      handle: product.handle,
      subtitle: product.subtitle,
      description: product.description,
      status: ProductStatus.PUBLISHED,
      category_ids: categoryIds,
      shipping_profile_id: shippingProfile.id,
      metadata,
      images: product.imageUrl ? [{ url: product.imageUrl }] : [],
      options: [{ title: "Default", values: ["Standard"] }],
      variants: [
        {
          title: "Standard",
          sku: product.sku,
          manage_inventory: true,
          options: { Default: "Standard" },
          prices,
        },
      ],
      sales_channels: [{ id: salesChannels[0].id }],
    })
  }

  if (!productInputs.length) {
    logger.info("No new products to import. All Serie 6 products already exist.")
    return
  }

  // Create products
  logger.info(`Creating ${productInputs.length} new Serie 6 products...`)
  await createProductsWorkflow(container).run({
    input: { products: productInputs },
  })

  // Set up inventory levels
  logger.info("Setting up inventory levels...")
  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id"],
  })
  const stockLocation = stockLocations[0]

  if (stockLocation) {
    const { data: inventoryItems } = await query.graph({
      entity: "inventory_item",
      fields: ["id"],
    })
    const { data: existingLevels } = await query.graph({
      entity: "inventory_level",
      fields: ["inventory_item_id"],
    })
    const hasLevel = new Set(
      existingLevels.map((l: any) => l.inventory_item_id)
    )

    const newLevels: CreateInventoryLevelInput[] = inventoryItems
      .filter((item: any) => !hasLevel.has(item.id))
      .map((item: any) => ({
        location_id: stockLocation.id,
        stocked_quantity: 0,
        inventory_item_id: item.id,
      }))

    if (newLevels.length) {
      await createInventoryLevelsWorkflow(container).run({
        input: { inventory_levels: newLevels },
      })
      logger.info(`  Set ${newLevels.length} new inventory levels (qty=0).`)
    }
  }

  // Summary
  logger.info("\n=== Serie 6 Import Complete ===")
  logger.info(`  Products created: ${productInputs.length}`)
  for (const p of productInputs) {
    const prod = SERIES_6_PRODUCTS.find((s) => s.handle === p.handle)!
    logger.info(
      `    ${prod.modelNumber}: CZK ${prod.prices.czk} | EUR ${prod.prices.eur} | PLN ${prod.prices.pln}`
    )
  }
  logger.info("\nCenova strategie:")
  logger.info("  CZ: S5 + 15% prirazka (vyrovnani s ab-com.cz)")
  logger.info("  PL: First-mover advantage, zadna lokalni konkurence")
  logger.info("  SK: Stejna cena jako CZ (EUR konverze)")
  logger.info("  EU: EUR cena platna pro AT, DE, RO, HU")
  logger.info("\nSpusteni:")
  logger.info("  cd backend && npx medusa exec ./scripts/import-series6.ts")
}
