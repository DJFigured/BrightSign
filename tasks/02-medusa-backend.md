# Task 02: Medusa Backend Setup

## Overview
Initialize and configure Medusa.js backend with multi-region, multi-currency support.

**Duration:** 3-5 days
**Priority:** P0 (Critical path)
**Dependencies:** Task 01 (Infrastructure)

---

## Step 1: Initialize Medusa Project

### 1.1 Create Medusa App
```bash
cd brightsign-eu-shop
npx create-medusa-app@latest backend --skip-db
```

Select options:
- PostgreSQL: Yes (already running in Coolify)
- Redis: Yes (already running in Coolify)
- Admin: Yes

### 1.2 Configure Database Connection
```bash
cd backend
```

Edit `medusa-config.ts`:
```typescript
import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS,
      adminCors: process.env.ADMIN_CORS,
      authCors: process.env.AUTH_CORS,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
  },
})
```

### 1.3 Run Migrations
```bash
npx medusa db:migrate
```

### 1.4 Seed Database (Development)
```bash
npx medusa seed --seed-file=./src/scripts/seed.ts
```

---

## Step 2: Configure Regions

### 2.1 Create Regions Script
Create `src/scripts/setup-regions.ts`:

```typescript
import { MedusaContainer } from '@medusajs/framework'

export default async function setupRegions(container: MedusaContainer) {
  const regionService = container.resolve('regionService')
  const currencyService = container.resolve('currencyService')
  
  // Ensure currencies exist
  const currencies = ['CZK', 'EUR', 'PLN']
  for (const code of currencies) {
    try {
      await currencyService.retrieveByCode(code)
    } catch {
      // Currency doesn't exist, will be created with region
    }
  }
  
  // Czech Republic
  await regionService.create({
    name: 'Czech Republic',
    currency_code: 'czk',
    tax_rate: 21,
    countries: ['cz'],
    payment_providers: ['stripe'],
    fulfillment_providers: ['manual'],
  })
  
  // Slovakia
  await regionService.create({
    name: 'Slovakia',
    currency_code: 'eur',
    tax_rate: 20,
    countries: ['sk'],
    payment_providers: ['stripe'],
    fulfillment_providers: ['manual'],
  })
  
  // Poland
  await regionService.create({
    name: 'Poland',
    currency_code: 'pln',
    tax_rate: 23,
    countries: ['pl'],
    payment_providers: ['stripe'],
    fulfillment_providers: ['manual'],
  })
  
  // EU (rest of Europe)
  await regionService.create({
    name: 'European Union',
    currency_code: 'eur',
    tax_rate: 0, // Varies, handle per-country
    countries: ['at', 'de', 'ro', 'hu', 'nl', 'be'],
    payment_providers: ['stripe'],
    fulfillment_providers: ['manual'],
  })
  
  console.log('Regions created successfully!')
}
```

### 2.2 Run Setup Script
```bash
npx medusa exec ./src/scripts/setup-regions.ts
```

---

## Step 3: Configure Customer Groups (B2B)

### 3.1 Create Customer Groups Script
Create `src/scripts/setup-customer-groups.ts`:

```typescript
import { MedusaContainer } from '@medusajs/framework'

export default async function setupCustomerGroups(container: MedusaContainer) {
  const customerGroupService = container.resolve('customerGroupService')
  
  const groups = [
    { 
      name: 'Retail',
      metadata: { discount_percentage: 0, tier: 'retail' }
    },
    { 
      name: 'B2B Pending',
      metadata: { discount_percentage: 0, tier: 'b2b_pending' }
    },
    { 
      name: 'B2B Standard',
      metadata: { discount_percentage: 10, tier: 'b2b_standard' }
    },
    { 
      name: 'B2B Volume',
      metadata: { discount_percentage: 15, tier: 'b2b_volume' }
    },
    { 
      name: 'B2B Partner',
      metadata: { discount_percentage: 20, tier: 'b2b_partner' }
    },
  ]
  
  for (const group of groups) {
    await customerGroupService.create(group)
  }
  
  console.log('Customer groups created successfully!')
}
```

---

## Step 4: Install Plugins

### 4.1 Stripe Payment Plugin
```bash
npm install medusa-payment-stripe
```

Add to `medusa-config.ts`:
```typescript
plugins: [
  {
    resolve: 'medusa-payment-stripe',
    options: {
      api_key: process.env.STRIPE_API_KEY,
      webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
    },
  },
],
```

### 4.2 File Storage (S3/Local)
For product images:
```bash
npm install medusa-file-s3
# or for local development
npm install medusa-file-local
```

---

## Step 5: Import Products from Shoptet

### 5.1 Create Import Script
Create `src/scripts/import-shoptet.ts`:

```typescript
import xlsx from 'xlsx'
import { MedusaContainer } from '@medusajs/framework'
import path from 'path'

interface ShoptetProduct {
  code: string
  name: string
  shortDescription: string
  description: string
  price: number
  image: string
  categoryText: string
  productNumber: string
  warranty: string
  stock: number
}

export default async function importShoptet(container: MedusaContainer) {
  const productService = container.resolve('productService')
  const productCategoryService = container.resolve('productCategoryService')
  
  // Load Excel file
  const workbook = xlsx.readFile(path.join(__dirname, '../../data/products-3.xlsx'))
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const products: ShoptetProduct[] = xlsx.utils.sheet_to_json(sheet)
  
  // Filter active products
  const activeProducts = products.filter(p => 
    p.productVisibility === 'visible'
  )
  
  console.log(`Importing ${activeProducts.length} products...`)
  
  // Create categories first
  const categoryMap = new Map<string, string>()
  const uniqueCategories = [...new Set(activeProducts.map(p => p.categoryText))]
  
  for (const catName of uniqueCategories) {
    const category = await productCategoryService.create({
      name: catName,
      handle: slugify(catName),
    })
    categoryMap.set(catName, category.id)
  }
  
  // Import products
  for (const shoptetProduct of activeProducts) {
    try {
      const product = await productService.create({
        title: shoptetProduct.name,
        handle: slugify(shoptetProduct.name),
        description: shoptetProduct.description,
        subtitle: stripHtml(shoptetProduct.shortDescription),
        status: 'published',
        categories: [{ id: categoryMap.get(shoptetProduct.categoryText)! }],
        metadata: {
          productNumber: shoptetProduct.productNumber,
          warranty: shoptetProduct.warranty,
          shoptetCode: shoptetProduct.code,
        },
        variants: [
          {
            title: 'Default',
            sku: `BS-${shoptetProduct.code}`,
            inventory_quantity: shoptetProduct.stock || 10,
            prices: [
              {
                amount: Math.round(shoptetProduct.price * 100), // cents
                currency_code: 'czk',
              },
              {
                amount: Math.round((shoptetProduct.price / 25.5) * 100),
                currency_code: 'eur',
              },
            ],
          },
        ],
      })
      
      console.log(`✓ Imported: ${product.title}`)
    } catch (error) {
      console.error(`✗ Failed: ${shoptetProduct.name}`, error.message)
    }
  }
  
  console.log('Import complete!')
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}
```

### 5.2 Copy Data File
```bash
cp /path/to/products-3.xlsx backend/data/
```

### 5.3 Run Import
```bash
npx medusa exec ./src/scripts/import-shoptet.ts
```

---

## Step 6: API Customizations

### 6.1 VAT Validation Endpoint
Create `src/api/store/vat-validate/route.ts`:

```typescript
import { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { validateVatNumber } from '../../../lib/vies'

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { country_code, vat_number } = req.body
  
  if (!country_code || !vat_number) {
    return res.status(400).json({ 
      error: 'country_code and vat_number are required' 
    })
  }
  
  try {
    const result = await validateVatNumber(country_code, vat_number)
    return res.json(result)
  } catch (error) {
    return res.status(503).json({ 
      error: 'VAT validation service unavailable',
      message: error.message 
    })
  }
}
```

### 6.2 B2B Customer Registration
Create `src/subscribers/customer-created.ts`:

```typescript
import { SubscriberConfig, SubscriberArgs } from '@medusajs/framework'
import { validateVatNumber } from '../lib/vies'

export default async function customerCreatedHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const customerService = container.resolve('customerService')
  const customer = await customerService.retrieve(event.data.id)
  
  // Check if VAT ID provided in metadata
  const vatId = customer.metadata?.vat_id
  if (!vatId) return
  
  // Parse and validate
  const parsed = parseVatId(vatId)
  if (!parsed) return
  
  try {
    const result = await validateVatNumber(parsed.country, parsed.number)
    
    if (result.valid) {
      // Assign to B2B Standard group
      const groupService = container.resolve('customerGroupService')
      const groups = await groupService.list({ name: 'B2B Standard' })
      
      await customerService.update(customer.id, {
        groups: [{ id: groups[0].id }],
        metadata: {
          ...customer.metadata,
          vat_validated: true,
          vat_validated_at: new Date().toISOString(),
          vat_company_name: result.name,
        },
      })
    }
  } catch (error) {
    console.error('VAT validation failed:', error)
  }
}

export const config: SubscriberConfig = {
  event: 'customer.created',
}
```

---

## Step 7: Admin Setup

### 7.1 Create Admin User
```bash
npx medusa user -e admin@brightsign.cz -p <secure-password>
```

### 7.2 Access Admin Dashboard
- URL: `http://localhost:9000/app`
- Login with created credentials

### 7.3 Initial Admin Tasks
- [ ] Verify regions are created
- [ ] Check products imported
- [ ] Enable payment providers per region
- [ ] Set up shipping options

---

## Step 8: Testing

### 8.1 API Health Check
```bash
curl http://localhost:9000/health
# Expected: {"status":"ok"}
```

### 8.2 List Products
```bash
curl http://localhost:9000/store/products
```

### 8.3 Check Regions
```bash
curl http://localhost:9000/store/regions
```

---

## Step 9: Deployment to Coolify

### 9.1 Create Dockerfile
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 9000

CMD ["npm", "start"]
```

### 9.2 Add to Coolify
- Go to Project → Add Resource → Application
- Source: GitHub
- Repository: brightsign-eu-shop
- Build Path: /backend
- Port: 9000
- Environment variables: Add all from .env

### 9.3 Deploy
- Click Deploy
- Monitor build logs
- Verify health check passes

---

## Verification Checklist

- [ ] Medusa server running
- [ ] Database connected
- [ ] Redis connected
- [ ] 4 regions created (CZ, SK, PL, EU)
- [ ] 5 customer groups created
- [ ] 32 products imported
- [ ] Admin dashboard accessible
- [ ] API endpoints working
- [ ] Stripe plugin configured (test mode)

---

## Next Step
→ Proceed to `03-storefront-design.md`
