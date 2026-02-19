# TECHNICAL_SPEC.md - Architecture & Technology Stack

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         HETZNER VPS (CAX21)                        │
│                    4GB RAM | 2 vCPU | 40GB SSD                     │
├─────────────────────────────────────────────────────────────────────┤
│                           COOLIFY PaaS                              │
│         Git Push Deploy | Auto SSL | Container Management          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐ │
│  │   PostgreSQL    │  │     Redis       │  │    n8n (optional)   │ │
│  │   Database      │  │     Cache       │  │    Automation       │ │
│  │   Port 5432     │  │   Port 6379     │  │    Port 5678        │ │
│  └────────┬────────┘  └────────┬────────┘  └─────────────────────┘ │
│           │                    │                                    │
│  ┌────────┴────────────────────┴────────────────────────────────┐  │
│  │                    MEDUSA BACKEND                             │  │
│  │              Node.js | Port 9000 | REST API                   │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │  │
│  │  │ Products │ │ Orders   │ │ Customers│ │ Admin Dashboard  │  │  │
│  │  │ Module   │ │ Module   │ │ Module   │ │ (built-in)       │  │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   NEXT.JS STOREFRONT                          │  │
│  │           React 18 | TypeScript | Tailwind CSS                │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │  │
│  │  │ Product  │ │ Cart &   │ │ B2B      │ │ i18n             │  │  │
│  │  │ Catalog  │ │ Checkout │ │ Portal   │ │ CZ/SK/PL/EN      │  │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     STRIPE      │     │    PACKETA      │     │     RESEND      │
│   Payments      │     │   Shipping      │     │   Transactional │
│   Webhooks      │     │   Labels API    │     │   Email         │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 🛠️ Technology Stack

### Backend
| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | Medusa.js | v2.x | Headless commerce engine |
| Runtime | Node.js | 20 LTS | JavaScript runtime |
| Database | PostgreSQL | 16 | Primary data store |
| Cache | Redis | 7.x | Session, cache, queues |
| ORM | MikroORM | (bundled) | Database abstraction |

### Frontend
| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | Next.js | 14.x | React meta-framework |
| Language | TypeScript | 5.x | Type safety |
| Styling | Tailwind CSS | 3.x | Utility-first CSS |
| UI Components | shadcn/ui | latest | Accessible components |
| State | React Query | 5.x | Server state management |
| i18n | next-intl | latest | Internationalization |

### Infrastructure
| Component | Technology | Purpose |
|-----------|------------|---------|
| VPS | Hetzner CAX21 | Hosting (ARM, €4.51/mo) |
| PaaS | Coolify | Deployment management |
| CDN | Cloudflare | DNS, caching, DDoS |
| SSL | Let's Encrypt | Auto-renewed via Coolify |
| CI/CD | GitHub Actions | Automated deployment |

### Integrations
| Service | Purpose | Integration Method |
|---------|---------|-------------------|
| Stripe | Payments | Official Medusa plugin |
| Packeta | Shipping | REST API + webhooks |
| VIES | VAT validation | SOAP API |
| Resend | Email | REST API + MCP |
| Plausible | Analytics | Script tag |
| n8n | Automation | Webhooks |

## 🗄️ Database Schema (Key Entities)

### Products
```sql
-- Medusa handles this, but key fields:
- id (uuid)
- title (varchar)
- handle (slug)
- status (draft/published)
- metadata (jsonb) -- custom fields

-- Product Variants
- sku
- ean
- inventory_quantity
- prices (multi-currency)
```

### Regions (Multi-country)
```sql
-- Region: CZ
- currency: CZK
- tax_rate: 21%
- countries: [CZ]
- payment_providers: [stripe]
- fulfillment_providers: [packeta]

-- Region: SK
- currency: EUR
- tax_rate: 20%
- countries: [SK]

-- Region: PL
- currency: PLN
- tax_rate: 23%
- countries: [PL]

-- Region: EU
- currency: EUR
- tax_rate: varies
- countries: [AT, RO, HU, DE, ...]
```

### Customer Groups (B2B)
```sql
-- Groups for tiered pricing
- b2b_standard (10% discount)
- b2b_volume (15% discount)
- b2b_partner (20% discount)
- retail (no discount)

-- Customer metadata
- vat_id (validated via VIES)
- company_name
- b2b_approved (boolean)
- b2b_tier
```

## 🌐 Multi-language Architecture

### URL Structure
```
brightsign.cz/          → Czech (default)
brightsign.cz/en/       → English on CZ domain

brightsign.sk/          → Slovak (default)
brightsign.sk/en/       → English on SK domain

ebrightsign.pl/         → Polish (default)
ebrightsign.pl/en/      → English on PL domain

ebrightsign.eu/         → English (default)
ebrightsign.eu/de/      → German for AT customers
```

### Translation Files
```
/locales/
├── cs.json    # Czech
├── sk.json    # Slovak (90% same as Czech)
├── pl.json    # Polish
├── en.json    # English
└── de.json    # German
```

### Content to Translate
1. UI strings (buttons, labels, messages)
2. Product titles and descriptions
3. Category names
4. Email templates
5. Legal pages (terms, privacy)

## 💳 Payment Flow

### Stripe Integration
```
1. Customer adds to cart
2. Proceeds to checkout
3. Enters shipping info
4. Stripe Payment Element loads
5. Customer pays (card, Google Pay, etc.)
6. Stripe webhook → Medusa
7. Order confirmed
8. Email sent via Resend
```

### Supported Payment Methods
- Credit/Debit cards (Visa, Mastercard)
- Google Pay
- Apple Pay
- Bancontact (BE)
- iDEAL (NL)
- Przelewy24 (PL)
- Bank transfer (B2B)

### B2B Payment Options
- Proforma invoice → bank transfer
- Net 14/30 days (approved partners only)
- Credit card on file

## 📦 Shipping Flow

### Packeta Integration
```
1. Order placed
2. n8n webhook triggered
3. Create Packeta shipment via API
4. Generate label PDF
5. Store tracking number in Medusa
6. Send tracking email to customer
7. Daily pickup from Packeta courier
```

### Shipping Zones
```javascript
const shippingZones = {
  cz: {
    methods: ['packeta_pickup', 'packeta_home', 'ppl'],
    freeShippingThreshold: 2000, // CZK
  },
  sk: {
    methods: ['packeta_pickup', 'packeta_home'],
    freeShippingThreshold: 80, // EUR
  },
  pl: {
    methods: ['packeta_pickup', 'packeta_home'],
    freeShippingThreshold: 400, // PLN
  },
  eu: {
    methods: ['dpd', 'gls'],
    freeShippingThreshold: 150, // EUR
  }
};
```

## 🔐 Security

### Authentication
- Customer accounts: Email + password (Medusa built-in)
- Admin: Email + password + optional 2FA
- API: Bearer token authentication

### Data Protection
- HTTPS everywhere (Cloudflare + Let's Encrypt)
- Database encryption at rest
- PCI compliance via Stripe (no card data stored)
- GDPR compliant (EU hosting, data deletion)

### Rate Limiting
- API: 100 requests/minute per IP
- Login: 5 attempts, then 15-min lockout
- Checkout: 10 attempts/hour per session

## 📊 Monitoring & Logging

### Application Monitoring
- Coolify built-in metrics (CPU, RAM, disk)
- Medusa health endpoint: `/health`
- Uptime monitoring: UptimeRobot (free)

### Error Tracking
- Console logs via Coolify
- Optional: Sentry for error aggregation

### Analytics
- Plausible Analytics (privacy-focused)
- Google Search Console (SEO)
- Stripe Dashboard (revenue)

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Coolify
        run: |
          curl -X POST "${{ secrets.COOLIFY_WEBHOOK }}"
```

### Deployment Process
1. Push to `main` branch
2. GitHub Actions triggers
3. Coolify webhook receives signal
4. Coolify pulls latest code
5. Builds Docker container
6. Zero-downtime deployment
7. Health check passes
8. Traffic switched to new container

## 📁 Project Structure

```
brightsign-backend/
├── src/
│   ├── api/              # Custom API routes
│   ├── jobs/             # Background jobs
│   ├── links/            # Data relationships
│   ├── modules/          # Custom modules
│   ├── scripts/          # Migration scripts
│   ├── subscribers/      # Event handlers
│   └── workflows/        # Custom workflows
├── medusa-config.ts      # Main configuration
├── package.json
└── tsconfig.json

brightsign-storefront/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── [locale]/     # i18n routes
│   │   │   ├── page.tsx  # Homepage
│   │   │   ├── products/ # Product pages
│   │   │   ├── cart/     # Cart page
│   │   │   └── checkout/ # Checkout flow
│   ├── components/       # React components
│   ├── lib/              # Utilities, API client
│   ├── locales/          # Translation files
│   └── styles/           # Global styles
├── next.config.js
├── tailwind.config.js
└── package.json
```

## 🚀 Development Setup

### Prerequisites
- Node.js 20+
- pnpm (preferred) or npm
- Docker (for local PostgreSQL/Redis)
- Git

### Local Development
```bash
# Clone repository
git clone git@github.com:makemore/brightsign-eu-shop.git
cd brightsign-eu-shop

# Start databases
docker-compose up -d postgres redis

# Setup backend
cd brightsign-backend
pnpm install
pnpm medusa migrations run
pnpm medusa seed
pnpm dev

# Setup storefront (new terminal)
cd brightsign-storefront
pnpm install
pnpm dev
```

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/medusa
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret
COOKIE_SECRET=your-cookie-secret
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PACKETA_API_KEY=...
RESEND_API_KEY=re_...
```

#### Storefront (.env.local)
```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_STRIPE_KEY=pk_test_...
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=brightsign.cz
```

## 📈 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| TTFB | < 200ms | Lighthouse |
| LCP | < 2.5s | Core Web Vitals |
| FID | < 100ms | Core Web Vitals |
| CLS | < 0.1 | Core Web Vitals |
| Lighthouse Score | > 90 | Mobile |
| API Response | < 100ms | p95 |
