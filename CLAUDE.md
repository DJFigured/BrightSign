# CLAUDE.md - BrightSign EU E-shop Project

## 🎯 Project Overview

Building a multi-country B2B e-commerce platform for BrightSign digital signage players using **Medusa.js** headless commerce, deployed on **Coolify + Hetzner VPS**.

**Owner:** Dan (Make more s.r.o., Czech Republic)
**Business Model:** Just-in-time resale from COMM-TEC Germany with 30-70% margins
**Target Markets:** CZ → SK → PL → EU (AT, RO, HU)

## 📁 Documentation Structure

```
docs/
├── PROJECT_BRIEF.md      # Business context, goals, market analysis
├── TECHNICAL_SPEC.md     # Architecture, stack, deployment
├── DESIGN_SYSTEM.md      # Brand colors, components, references
├── PRODUCT_CATALOG.md    # BrightSign product structure
├── B2B_FLOW.md           # B2B registration, VIES, pricing tiers
├── INTEGRATIONS.md       # Stripe, Packeta, COMM-TEC, Tabidoo
├── AI_AGENTS.md          # n8n automation workflows
└── MARKETING.md          # PPC, newsletter, B2B CRM strategy

tasks/                    # Development task breakdown
data/                     # Shoptet export, product data
```

## 🚀 Quick Start Commands

```bash
# 1. Setup Medusa backend
npx create-medusa-app@latest brightsign-backend

# 2. Setup Next.js storefront
npx create-next-app@latest brightsign-storefront --typescript --tailwind

# 3. Install Medusa CLI
npm install -g @medusajs/medusa-cli

# 4. Start development
cd brightsign-backend && medusa develop
```

## 🔧 MCP Servers to Enable

```bash
# Medusa documentation
claude mcp add medusa-docs -- npx -y @anthropic/mcp-server@latest https://docs.medusajs.com/mcp

# GitHub integration
claude mcp add github -- npx -y @modelcontextprotocol/server-github

# Supabase (if using for DB)
claude mcp add supabase -- npx -y @anthropic/mcp-server@latest supabase
```

## 📋 Development Phases

### Phase 1: Infrastructure (Week 1)
- [ ] Setup Hetzner VPS (CAX21, 4GB RAM)
- [ ] Install Coolify
- [ ] Configure PostgreSQL + Redis
- [ ] Setup GitHub repo with CI/CD

### Phase 2: Medusa Backend (Week 2-3)
- [ ] Initialize Medusa project
- [ ] Configure multi-region (CZ, SK, PL, EU)
- [ ] Setup multi-currency (CZK, EUR, PLN)
- [ ] Import products from Shoptet export
- [ ] Configure B2B customer groups

### Phase 3: Storefront (Week 3-4)
- [ ] Next.js storefront with Tailwind
- [ ] Multi-language support (i18n)
- [ ] Product catalog pages
- [ ] Cart & checkout flow
- [ ] B2B login & VAT validation

### Phase 4: Integrations (Week 4-5)
- [ ] Stripe payment gateway
- [ ] Packeta shipping integration
- [ ] VIES VAT validation API
- [ ] Email transactional (Resend)

### Phase 5: Marketing & Launch (Week 5-6)
- [ ] SEO optimization
- [ ] Google Analytics / Plausible
- [ ] Newsletter signup (Resend)
- [ ] PPC campaign structure
- [ ] Go-live CZ version

## 🎨 Design Principles

- **Brand Colors:** Primary #1a2b4a (dark blue), Accent #00c389 (green)
- **Style:** Clean, professional, B2B-focused
- **Reference:** brightsign.biz (official), brightsign-shop.eu (competitor)
- **Mobile-first responsive design**

## ⚠️ Important Constraints

1. **No COMM-TEC API** - Stock/prices must be scraped or manually updated
2. **B2B Focus** - Public RRP prices, automatic discounts after VAT validation
3. **Multi-country from Day 1** - Architecture must support easy localization
4. **One-person operation** - Heavy automation via n8n required
5. **Budget-conscious** - Prefer open-source, self-hosted solutions

## 🔑 Key Business Rules

### Pricing Strategy
- CZ: Match or slightly undercut Czech competition
- SK: Same as CZ (language advantage)
- PL: 15-20% under local competition (huge arbitrage)
- AT: 10-15% under German prices
- RO/HU: Market entry pricing

### B2B Discounts
- Standard B2B: 10% off RRP
- Volume (5+ units): 15% off RRP
- Partner/Integrator: 20% off RRP (manual approval)

### Shipping
- CZ: Packeta, PPL, Zásilkovna
- SK/PL/HU/RO: Packeta international
- AT/DE: DPD, GLS

## 📞 External Services

| Service | Purpose | Status |
|---------|---------|--------|
| COMM-TEC | Supplier | ✅ Active account |
| Stripe | Payments | 🔧 Setup needed |
| Packeta | Shipping | 🔧 Setup needed |
| Resend | Email | 🔧 Setup needed |
| Hetzner | Hosting | 🔧 Setup needed |

## 🗣️ Communication

- **Language:** Czech preferred, English OK
- **Decisions:** Ask before major architectural changes
- **Progress:** Summarize completed tasks after each session
