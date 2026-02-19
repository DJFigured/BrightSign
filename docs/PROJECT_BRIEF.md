# PROJECT_BRIEF.md - Business Context & Market Analysis

## 🏢 Company Overview

**Company:** Make more s.r.o.
**Location:** Czech Republic
**Owner:** Dan
**Current Operations:**
- brightsign.cz - Shoptet e-shop (migrating away)
- BrightSign authorized reseller
- Just-in-time fulfillment model

## 🎯 Project Goals

### Primary Objective
Build a scalable, multi-country B2B e-commerce platform for BrightSign digital signage products that can be operated by one person with heavy AI automation.

### Success Metrics
1. Launch CZ version within 6 weeks
2. Expand to SK within 2 months
3. Enter PL market within 3 months
4. Achieve 40%+ gross margin on CEE markets
5. Process 80% of orders without manual intervention

## 💼 Business Model

### Supply Chain
```
BrightSign USA
      ↓
COMM-TEC GmbH (Germany) ← Authorized distributor
      ↓ (35% dealer discount)
Make more s.r.o. ← We are here
      ↓
End customers (B2B integrators, enterprises)
```

### Pricing Structure

| Level | Discount from RRP | Who |
|-------|-------------------|-----|
| COMM-TEC Dealer | 35% | Us |
| Our B2B Standard | 10% off RRP | Verified companies |
| Our B2B Volume | 15% off RRP | 5+ units |
| Our B2B Partner | 20% off RRP | Integrators (manual) |
| End User (B2C) | RRP | Walk-in customers |

### Unit Economics Example (HD225)

```
COMM-TEC RRP:        €650
COMM-TEC Dealer:     €422.50 (our cost)
Our RRP (CZ):        ~€590 (14,900 CZK)
Our B2B price:       ~€531 (10% off)

Margin B2C:          €167.50 (28%)
Margin B2B:          €108.50 (20%)

Polish market:
Local competition:   €720-815
Our price:           €550
Margin:              €127.50 (23%) + beating competition by 25%
```

## 🌍 Market Analysis

### Target Markets Priority

| Priority | Country | Domain | Competition | Opportunity |
|----------|---------|--------|-------------|-------------|
| 1 | CZ | brightsign.cz | 2-3 e-shops | Home market, language |
| 2 | SK | brightsign.sk | None | Zero competition, same language |
| 3 | PL | ebrightsign.pl | 3-4 e-shops, 50%+ markup | Huge arbitrage |
| 4 | EU/AT | ebrightsign.eu | DE sellers only | Price under DE |
| 5 | RO | ebrightsign.eu | Zero e-shops | First mover |
| 6 | HU | ebrightsign.eu | 2 e-shops, 60%+ markup | Arbitrage |

### Competitive Analysis

#### Czech Republic
- **AV MEDIA** - Large integrator, not focused on e-commerce
- **Setos.cz** - General electronics, limited BrightSign
- **Our advantage:** Specialist focus, better SEO, B2B service

#### Slovakia
- **No local e-shops** - Customers buy from CZ or NL
- **brightsign-shop.eu** (Netherlands) ships to SK
- **Our advantage:** Czech language, local support, faster shipping

#### Poland
- **Daars.pl** - HD225 at 3,099 PLN (~€720)
- **C4i.com.pl** - HD225 at 3,499 PLN (~€815)
- **Visually.pl** - Limited stock
- **Our advantage:** 15-25% lower prices, same shipping time

#### Austria
- **No local e-shops** - Buy from DE (brightsign-shop.eu, Office Partner)
- **Office Partner (DE)** - €480 for HD225
- **Our advantage:** 10-15% under DE prices, EU shipping

#### Romania
- **GBC.ro** - B2B integrator only, no public prices
- **eMAG.ro** - No BrightSign products
- **Our advantage:** First e-shop in market

#### Hungary
- **Videopart.hu** - HD225 at 307,000 HUF (~€767)
- **27% VAT** - Creates reverse charge opportunity for B2B
- **Our advantage:** 35% lower prices

### Market Size Estimate

Digital signage market CEE (2025):
- CZ: ~€15M annually
- SK: ~€5M annually
- PL: ~€40M annually
- AT: ~€25M annually
- RO: ~€12M annually
- HU: ~€10M annually

BrightSign market share estimate: 15-20%
Addressable e-commerce portion: 30-40%

**Total addressable market: €5-8M annually**

## 🚚 Logistics

### Supplier: COMM-TEC GmbH
- Location: Uhingen, Germany
- Shipping to CZ: 2-3 business days (DPD/GLS)
- Stock: Real-time via dealer portal (no API)
- Ordering: Email or portal
- Payment: Net 30 days

### Fulfillment Model
```
Customer Order
      ↓
Check COMM-TEC stock (scrape/manual)
      ↓
Order from COMM-TEC (same day if before 14:00)
      ↓
COMM-TEC ships to our address (2-3 days)
      ↓
Repack & ship to customer via Packeta (1-3 days)
      ↓
Total lead time: 3-6 business days
```

### Shipping Partners

| Region | Carrier | Est. Cost | Transit |
|--------|---------|-----------|---------|
| CZ | Packeta, PPL | €3-5 | 1-2 days |
| SK | Packeta | €5-8 | 2-3 days |
| PL | Packeta | €8-12 | 2-4 days |
| HU | Packeta | €10-15 | 3-5 days |
| RO | Packeta | €12-18 | 4-6 days |
| AT | DPD, GLS | €8-12 | 2-3 days |

## 🎯 Customer Segments

### Primary: B2B Integrators (70% of revenue)
- AV installation companies
- Digital signage agencies
- IT system integrators
- Characteristics: Buy 3-10 units, need quotes, technical support

### Secondary: Enterprise Direct (20% of revenue)
- Retail chains
- Hotels, restaurants
- Healthcare facilities
- Characteristics: Larger orders, RFQ process, long sales cycle

### Tertiary: Prosumers (10% of revenue)
- Small business owners
- Hobbyists, makers
- Characteristics: Single unit, price-sensitive, self-service

## 📊 Financial Projections (Year 1)

### Conservative Scenario
| Metric | Q1 | Q2 | Q3 | Q4 | Total |
|--------|----|----|----|----|-------|
| Orders | 20 | 35 | 50 | 70 | 175 |
| Revenue | €15K | €28K | €40K | €56K | €139K |
| Gross Margin | €4.5K | €8.4K | €12K | €17K | €42K |
| Margin % | 30% | 30% | 30% | 30% | 30% |

### Optimistic Scenario (with PL traction)
| Metric | Q1 | Q2 | Q3 | Q4 | Total |
|--------|----|----|----|----|-------|
| Orders | 30 | 60 | 100 | 150 | 340 |
| Revenue | €25K | €50K | €80K | €120K | €275K |
| Gross Margin | €8K | €18K | €30K | €45K | €101K |
| Margin % | 32% | 36% | 38% | 38% | 37% |

### Operating Costs (Monthly)
- Hosting (Hetzner): €15
- Email (Resend): €0-5
- Domain renewals: €5
- Packeta account: €0 (pay per shipment)
- PPC budget: €200-500
- **Total fixed: ~€250-550/month**

## 🏆 Competitive Advantages

1. **First-mover in SK/RO** - No local competition
2. **Price arbitrage in PL/HU** - 30-50% under local prices
3. **Specialist focus** - Not general electronics, BrightSign experts
4. **AI-powered operations** - One-person operation at scale
5. **Multi-language from day one** - CZ/SK/PL/EN
6. **B2B-optimized** - VAT validation, quotes, volume pricing

## ⚠️ Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| COMM-TEC price increase | Medium | High | Lock in volume commitment |
| Competition enters SK/RO | Medium | Medium | Build brand early |
| Currency fluctuation | High | Low | Price in EUR, convert daily |
| BrightSign direct sales | Low | High | Focus on service, not just price |
| Stock-out at COMM-TEC | Medium | Medium | Monitor stock, pre-order popular items |

## 📅 Timeline

```
Week 1-2:  Infrastructure setup (Hetzner, Coolify, Medusa)
Week 3-4:  Storefront development, product import
Week 5:    Integrations (Stripe, Packeta, email)
Week 6:    Testing, SEO, soft launch CZ
Week 7-8:  SK expansion, PPC campaigns
Week 9-12: PL market entry, optimization
```
