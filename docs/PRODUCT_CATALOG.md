# PRODUCT_CATALOG.md - BrightSign Product Structure

## 📦 Product Portfolio Overview

BrightSign digital signage players organized by series and capability level.

### Series Hierarchy
```
BrightSign Players
├── Series 5 (Current - 2024+)
│   ├── AU5 (Audio only)
│   ├── LS5 (Entry-level)
│   ├── HD5 (Mid-range)
│   ├── XD5 (Advanced)
│   ├── XT5 (Premium)
│   └── XC5 (Enterprise)
├── Series 4 (Legacy - 2020-2023)
│   ├── LS4, HD4, XD4, XT4
└── Accessories
    ├── Power adapters
    ├── Wi-Fi modules
    ├── Cables & connectors
    ├── SD cards
    └── Button panels
```

## 🎯 Active Products (32 items from Shoptet)

### Series 5 Players

| Model | Category | Price CZK | Price EUR | COMM-TEC Cost | Margin |
|-------|----------|-----------|-----------|---------------|--------|
| AU335 | Audio | 5,800 | ~230 | ~€150 | ~35% |
| LS425 | Entry | 9,200 | ~365 | ~€254 | ~30% |
| LS445 | Entry+ | 11,900 | ~472 | ~€330 | ~30% |
| HD225 | Mid | 14,900 | ~591 | ~€423 | ~28% |
| HD1025 | Mid+ | 17,900 | ~710 | ~€500 | ~30% |
| XD235 | Advanced | 19,400 | ~770 | ~€507 | ~34% |
| XD1035 | Advanced+ | 22,400 | ~889 | ~€600 | ~32% |
| XT245 | Premium | 24,400 | ~968 | ~€650 | ~33% |
| XT1145 | Premium | 26,400 | ~1048 | ~€761 | ~27% |
| XT2145 | Premium+ | 31,900 | ~1266 | ~€900 | ~29% |
| XC2055 | Enterprise | 36,900 | ~1464 | ~€1000 | ~32% |
| XC4055 | Enterprise+ | 49,900 | ~1980 | ~€1350 | ~32% |

### Series 4 Players (Legacy)

| Model | Category | Price CZK | Notes |
|-------|----------|-----------|-------|
| XT244 | Premium | 20,400 | End of life, limited stock |
| XT1144 | Premium | 22,900 | End of life, limited stock |

### Accessories

| Product | Price CZK | Category |
|---------|-----------|----------|
| Wi-Fi/Bluetooth modul (S4) | 2,500 | Connectivity |
| Wi-Fi/Bluetooth modul (S5) | 2,500 | Connectivity |
| Napájecí adaptér XT/XD/AU (S3) | 1,200 | Power |
| Napájecí adaptér HD (S3/S4) | 1,200 | Power |
| Napájecí adaptér LS (S3/S4) | 1,200 | Power |
| Napájecí adaptér XT/XD/HD (S5) | 1,200 | Power |
| Napájecí adaptér LS (S5) | 1,200 | Power |
| Napájecí adaptér XC (S5) | 1,200 | Power |
| USB panel 11 tlačítek (červená) | 2,700 | Control |
| USB panel 11 tlačítek (modrá) | 2,700 | Control |
| USB panel 4 tlačítka (červená) | 1,700 | Control |
| USB panel 4 tlačítka (modrá) | 1,700 | Control |
| Kabel USB C to GPIO 12-pin | 990 | Cables |
| Kabel USB-C na USB-A + 3,5mm | 400 | Cables |
| Konektor 6-pin GPIO | 150 | Cables |
| MICRO SD Karta 32GB | 1,300 | Storage |
| MICRO SD Karta 16GB | 900 | Storage |
| Dálkový ovladač RC-1002 | 1,500 | Control |

## 🏷️ Category Structure for E-shop

```
Přehrávače
├── Série 5 (aktuální)
│   ├── AU5 Série (audio)
│   ├── LS5 Série (základní)
│   ├── HD5 Série (střední třída)
│   ├── XD5 Série (pokročilé)
│   ├── XT5 Série (prémiové)
│   └── XC5 Série (enterprise)
├── Série 4 (předchozí generace)
│   └── (combined legacy products)
│
Příslušenství
├── Napájecí adaptéry
├── Wi-Fi moduly
├── Kabely a konektory
├── Paměťové karty
└── Ovládací panely
│
Řešení podle odvětví
├── Retail & obchody
├── Restaurace & hospitality
├── Korporátní komunikace
├── Doprava & letiště
├── Zdravotnictví
└── Vzdělávání
```

## 📋 Product Data Structure (Medusa)

### Product Entity
```typescript
interface BrightSignProduct {
  // Core fields
  id: string;
  title: string;                    // "BrightSign HD225"
  handle: string;                   // "brightsign-hd225"
  status: 'draft' | 'published';
  
  // Descriptions
  subtitle: string;                 // Short tagline
  description: string;              // Full HTML description
  
  // Media
  thumbnail: string;                // Main image URL
  images: ProductImage[];           // Gallery images
  
  // Organization
  collection_id: string;            // Series (S5, S4, Accessories)
  categories: Category[];           // HD5 Série, Přehrávače
  tags: Tag[];                      // 4K, HTML5, PoE+
  
  // Metadata (custom fields)
  metadata: {
    productNumber: string;          // "HD225"
    series: string;                 // "5"
    resolution: string;             // "4Kp60"
    features: string[];             // ["HTML5", "HDMI 2.0", "PoE+"]
    warranty: string;               // "24 měsíců"
    commtecSku: string;             // COMM-TEC ordering code
    relatedVideos: string[];        // YouTube embed URLs
  };
  
  // Variants (usually just one for hardware)
  variants: ProductVariant[];
}

interface ProductVariant {
  id: string;
  sku: string;                      // "BS-HD225"
  ean: string;                      // EAN-13 barcode
  inventory_quantity: number;
  
  // Pricing per region
  prices: {
    region_id: string;              // "reg_cz"
    currency_code: string;          // "CZK"
    amount: number;                 // 1490000 (in cents)
  }[];
  
  // Physical attributes
  weight: number;                   // grams
  length: number;                   // mm
  height: number;                   // mm
  width: number;                    // mm
}
```

### Category Entity
```typescript
interface Category {
  id: string;
  name: string;                     // "HD5 Série"
  handle: string;                   // "hd5-serie"
  description: string;
  parent_category_id: string | null;
  
  metadata: {
    seo_title: string;
    seo_description: string;
    banner_image: string;
    icon: string;
  };
}
```

## 🔄 Data Migration from Shoptet

### Export Fields Mapping

| Shoptet Field | Medusa Field | Transform |
|---------------|--------------|-----------|
| code | variant.sku | Prefix "BS-" |
| name | title | Direct |
| shortDescription | subtitle | Strip HTML |
| description | description | Keep HTML |
| price | variant.prices[].amount | × 100 (cents) |
| image | thumbnail | Download & re-upload |
| image2, image3 | images[] | Download & re-upload |
| categoryText | categories | Map to new structure |
| manufacturer | - | Always "BrightSign" |
| productNumber | metadata.productNumber | Direct |
| warranty | metadata.warranty | Direct |
| stock | variant.inventory_quantity | Direct |

### Migration Script Outline
```javascript
// scripts/migrate-shoptet.js
import xlsx from 'xlsx';
import medusa from '@medusajs/medusa';

async function migrateProducts() {
  // 1. Load Shoptet export
  const workbook = xlsx.readFile('data/products-3.xlsx');
  const products = xlsx.utils.sheet_to_json(workbook.Sheets[0]);
  
  // 2. Filter active products
  const activeProducts = products.filter(p => 
    p.productVisibility === 'visible'
  );
  
  // 3. Create categories first
  const categories = await createCategories();
  
  // 4. Create products
  for (const shoptetProduct of activeProducts) {
    await createMedusaProduct(shoptetProduct, categories);
  }
  
  // 5. Download and upload images
  await migrateImages(activeProducts);
}
```

## 💰 Pricing Strategy by Region

### Czech Republic (CZK)
- Base prices from Shoptet export
- B2B discount: 10-20%
- VAT: 21%

### Slovakia (EUR)
- Convert from CZK at fixed rate (25.5)
- Same relative pricing as CZ
- VAT: 20%

### Poland (PLN)
- Price 15-20% under local competition
- Reference: Daars.pl, C4i.com.pl prices
- VAT: 23%

### EU/International (EUR)
- German market reference pricing
- Slightly under brightsign-shop.eu
- VAT: varies by country (reverse charge for B2B)

### Price Matrix Example (HD225)

| Region | Currency | B2C Price | B2B Price | Our Cost | Margin |
|--------|----------|-----------|-----------|----------|--------|
| CZ | CZK | 14,900 | 13,410 | 10,647 | 21-29% |
| SK | EUR | 591 | 532 | 423 | 20-28% |
| PL | PLN | 2,599 | 2,339 | 1,799 | 23-31% |
| EU | EUR | 549 | 494 | 423 | 14-23% |

## 📊 Product Comparison Chart

For use on category pages:

| Feature | LS425 | HD225 | XD235 | XT1145 | XC4055 |
|---------|-------|-------|-------|--------|--------|
| Resolution | 1080p60 | 4Kp60 | 4Kp60 | 4Kp60 | 4×4Kp60 |
| HTML5 | Basic | Full | Full | Full | Full |
| Video decode | H.265 | H.265 | H.265 | H.265 | H.265 |
| Outputs | 1×HDMI | 1×HDMI | 1×HDMI | 1×HDMI | 4×HDMI |
| GPIO | No | Yes | Yes | Yes | Yes |
| PoE | No | PoE+ | PoE+ | PoE++ | No |
| USB | 1×USB-C | 1×USB-C | 2×USB-C | 2×USB-C | 4×USB |
| Storage | µSD | µSD | µSD+SSD | µSD+SSD | SSD |
| Ideal for | Basic | Standard | Advanced | Interactive | Video walls |
| Price | 9,200 | 14,900 | 19,400 | 26,400 | 49,900 |

## 🏷️ SEO Product Titles & Descriptions

### Title Formula
`[Brand] [Model] - [Key Feature] | [Category]`

Examples:
- "BrightSign HD225 - 4K Digital Signage Přehrávač | HD5 Série"
- "BrightSign XT1145 - Interaktivní 4K Player s PoE++ | XT5 Série"

### Meta Description Formula
`[Model] [key benefit]. [2-3 features]. [CTA]. Skladem, doprava do 24h.`

Example:
"BrightSign HD225 je spolehlivý 4K přehrávač pro digital signage. Podpora HTML5, H.265, HDMI 2.0. Ideální pro retail a korporátní nasazení. Skladem, doprava do 24h."

## 📁 Data Files

The following files are included in `/data/`:

- `products-3.xlsx` - Original Shoptet export (54 products)
- `active-products.json` - Filtered active products (32)
- `categories.json` - New category structure
- `price-matrix.json` - Multi-region pricing
- `images/` - Downloaded product images
