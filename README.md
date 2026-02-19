# BrightSign EU E-shop

Multi-country B2B e-commerce platform for BrightSign digital signage players.

## 🎯 Project Overview

- **Platform:** Medusa.js + Next.js
- **Hosting:** Coolify on Hetzner VPS
- **Markets:** CZ → SK → PL → EU

## 📁 Project Structure

```
brightsign-eu-shop/
├── CLAUDE.md              # Main instructions for Claude Code
├── README.md              # This file
├── docs/
│   ├── PROJECT_BRIEF.md   # Business context & market analysis
│   ├── TECHNICAL_SPEC.md  # Architecture & tech stack
│   ├── DESIGN_SYSTEM.md   # Brand guidelines & UI components
│   ├── PRODUCT_CATALOG.md # Product structure & data
│   ├── B2B_FLOW.md        # B2B registration & pricing tiers
│   ├── INTEGRATIONS.md    # External services (Stripe, Packeta, etc.)
│   ├── AI_AGENTS.md       # n8n automation workflows
│   └── MARKETING.md       # PPC, SEO, email marketing
├── tasks/
│   ├── 01-setup-infrastructure.md
│   ├── 02-medusa-backend.md
│   └── ... (more tasks)
├── data/
│   └── products-3.xlsx    # Shoptet export (54 products)
├── backend/               # Medusa.js (to be created)
└── storefront/            # Next.js (to be created)
```

## 🚀 Quick Start

### For Claude Code

1. Read `CLAUDE.md` first
2. Follow tasks in order from `tasks/` folder
3. Reference `docs/` for detailed specifications

### For Manual Development

```bash
# Prerequisites
node --version  # 20+
pnpm --version  # 8+

# Clone
git clone git@github.com:YOUR_USERNAME/brightsign-eu-shop.git
cd brightsign-eu-shop

# Setup backend
cd backend
pnpm install
pnpm medusa db:migrate
pnpm dev

# Setup storefront (new terminal)
cd storefront
pnpm install
pnpm dev
```

## 🌍 Target Markets

| Priority | Market | Domain | Status |
|----------|--------|--------|--------|
| 1 | Czech Republic | brightsign.cz | 🔨 Building |
| 2 | Slovakia | brightsign.sk | 📋 Planned |
| 3 | Poland | ebrightsign.pl | 📋 Planned |
| 4 | EU/International | ebrightsign.eu | 📋 Planned |

## 💼 Business Model

- **Supplier:** COMM-TEC GmbH (Germany)
- **Margin:** 30-70% depending on market
- **B2B Discounts:** 10-20% for verified businesses
- **Fulfillment:** Just-in-time from COMM-TEC

## 📊 Key Metrics

- **Products:** 32 active (from Shoptet migration)
- **Price range:** €150 - €2,000
- **Target conversion:** 3% (B2C), 5% (B2B)

## 🔗 Links

- **Current site:** https://brightsign.cz (Shoptet - migrating from)
- **BrightSign official:** https://brightsign.biz
- **Supplier:** https://comm-tec.com

## 📅 Timeline

- Week 1-2: Infrastructure + Medusa backend
- Week 3-4: Storefront development
- Week 5: Integrations + testing
- Week 6: Launch CZ version

---

Built with ❤️ using Claude Code
