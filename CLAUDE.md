# CLAUDE.md - BrightSign EU E-shop Project

## Project Overview

Multi-country B2B e-commerce platform for BrightSign digital signage players.
**Medusa.js v2** headless commerce + **Next.js 15** storefront, deployed on **Coolify + Hetzner VPS**.

**Owner:** Dan (Make more s.r.o., Czech Republic)
**Business Model:** Just-in-time resale from COMM-TEC Germany with 30-70% margins
**Target Markets:** CZ → SK → PL → EU (AT, RO, HU)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Medusa.js v2, Node 20, PostgreSQL 16, Redis 7 |
| Storefront | Next.js 15.3, next-intl (cs/sk/pl/en/de), Tailwind CSS, pnpm |
| Payments | Stripe (card) + bank transfer |
| Shipping | Packeta (TODO: API integration) |
| Email | Resend (transactional + newsletter audience) |
| Storage | MinIO (S3-compatible) |
| Hosting | Hetzner CAX21 (Arm64, 4GB), Coolify, Traefik reverse proxy |
| CI/CD | GitHub Actions → SSH deploy |
| Analytics | GTM → GA4 + Meta Pixel (all events include locale) |

## Project Structure

```
backend/                   # Medusa.js v2 backend
  src/api/                 # Custom API routes (contact, B2B, invoices, AI buddy, webhooks)
  src/modules/             # Custom modules (invoice)
  src/lib/                 # Shared utils (rate-limit)
storefront/                # Next.js 15 storefront
  src/app/[locale]/        # Locale-prefixed pages
  src/components/          # UI components (product, checkout, analytics, layout)
  src/lib/                 # Client utils (analytics, auth-context, cart-context, sdk)
  src/i18n/                # Internationalization config
docker-compose.prod.yml    # Production Docker stack
scripts/                   # Backup, hardening scripts
docs/                      # Business docs, specs, task breakdowns
```

## Development

```bash
# Backend
cd backend && medusa develop

# Storefront
cd storefront && pnpm dev

# Type check
cd storefront && npx tsc --noEmit
```

## Key Architecture Decisions

- **Stripe webhooks:** Primary = Medusa built-in `/hooks/payment/stripe_stripe`. Custom `/webhooks/stripe` is logger-only backup.
- **Analytics:** All events auto-inject `locale` from URL path. `trackPixel()` fires Meta Pixel alongside GA4.
- **i18n:** cs (default), sk, pl, en, de. Localized product descriptions in `metadata.translations[locale].description`.
- **Auth:** Cookie `_bs_auth` flag + middleware guard. Login/signup tracked in GA4 + Meta Pixel.
- **Redis:** `noeviction` policy, 512mb maxmemory (required by Medusa workflow engine).
- **CORS:** Domain-based (`https://brightsign.cz`, `https://www.brightsign.cz`).

## Business Rules

### Pricing
- CZ: Match or undercut Czech competition
- SK: Same as CZ (language advantage)
- PL: 15-20% under local competition
- AT: 10-15% under German prices

### B2B Discounts
- Standard B2B: 10% off RRP
- Volume (5+ units): 15% off RRP
- Partner/Integrator: 20% off RRP (manual approval)

### Shipping
- CZ: Packeta, PPL, Zasilkovna
- SK/PL/HU/RO: Packeta international
- AT/DE: DPD, GLS

## AI Buddy Integration

Custom API at `/store/ai-buddy/` for personal command center dashboard.
Full docs: `docs/ai-buddy-api.md`

### Endpoints
- `GET /store/ai-buddy/health` — connection test (no auth)
- `GET /store/ai-buddy/dashboard` — main aggregated overview
- `GET /store/ai-buddy/orders` — filtered/paginated orders
- `GET /store/ai-buddy/revenue` — revenue breakdown
- `GET /store/ai-buddy/inventory` — stock levels + alerts
- `GET /store/ai-buddy/b2b` — B2B customers + groups

Auth: Bearer token `AI_BUDDY_API_KEY` from `.env`.

## Current Status (2026-02-28, after ebrightsign.eu launch)

### Done
- [x] Infrastructure (Hetzner VPS, Coolify, Docker Compose, CI/CD) — **ebrightsign.eu LIVE**
- [x] HTTPS/TLS with Let's Encrypt (Traefik v3.6, fixed network routing)
- [x] Medusa backend (multi-region, multi-currency, products imported, Serie 6 added)
- [x] Storefront (all pages, i18n, checkout, B2B registration)
- [x] Stripe payments (card + bank transfer) — awaiting live API keys
- [x] Security hardening (16/16 items — CSP, HSTS, rate limiting, auth cookies, honeypot)
- [x] SEO (generateMetadata, JSON-LD, OG/Twitter, noindex on non-public pages, dynamic sitemap)
- [x] Analytics (GA4 full funnel + Meta Pixel events + locale tracking)
- [x] Email (Resend transactional + newsletter)
- [x] VPS SSH access, Coolify deployed, docker-compose.prod.yml fully operational

### Pending (Dan controls)
- [ ] **Stripe live API keys** — configure webhook URL in Stripe Dashboard → `https://api.ebrightsign.eu/hooks/payment/stripe_stripe`
- [ ] **Packeta API key** — get from client.packeta.com
- [ ] **Resend API key** — verify
- [ ] **Sentry DSN** — for error tracking
- [ ] **Phone number** — add to header/footer
- [ ] brightsign.cz DNS records (optional — ebrightsign.eu is primary domain)

### In Progress (P0)
- [ ] **Homepage V1 Flagship CSS implementation** — Dan selected V1 design (education-first messaging)
  - Content is correct (commit 2c11f9b), but CSS design doesn't match HTML prototype yet
  - Pattern: `storefront/ui-variants/variant-1-flagship.html`
  - Goal: Update `HomepageClient.tsx` to match V1 layout (2-3 days)

### Future
- [ ] Implement winning homepage variant into Next.js storefront
- [ ] Packeta shipping API integration
- [ ] DNS records (brightsign.cz → VPS)
- [ ] PPC campaigns + marketing launch

## Communication

- **Language:** Czech preferred, English OK
- **Decisions:** Ask before major architectural changes
- **Progress:** Summarize completed tasks after each session
