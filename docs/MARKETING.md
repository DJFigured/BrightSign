# MARKETING.md - Marketing Strategy & Implementation

## 🎯 Marketing Overview

### Goals
1. **Awareness:** Position as #1 BrightSign specialist in CEE
2. **Acquisition:** Drive qualified B2B traffic
3. **Conversion:** Optimize for B2B sign-ups and purchases
4. **Retention:** Build repeat customer base

### Budget Allocation (Monthly)

| Channel | Budget | Expected ROI |
|---------|--------|--------------|
| Google Ads (CZ) | €150 | 3-5x |
| Google Ads (PL) | €150 | 5-8x |
| Google Ads (SK/AT) | €100 | 4-6x |
| Content/SEO | €0 (time) | Long-term |
| Email | €0-5 (Resend) | 10x+ |
| **Total** | **€425** | - |

---

## 🔍 SEO Strategy

### Target Keywords by Market

#### Czech Republic
| Keyword | Volume | Difficulty | Intent |
|---------|--------|------------|--------|
| brightsign | 390 | Low | Brand |
| digital signage přehrávač | 110 | Medium | Product |
| reklamní displej software | 90 | Medium | Informational |
| brightsign cena | 50 | Low | Transactional |
| 4k media player reklama | 40 | Low | Product |

#### Poland
| Keyword | Volume | Difficulty | Intent |
|---------|--------|------------|--------|
| brightsign | 720 | Low | Brand |
| digital signage player | 320 | Medium | Product |
| odtwarzacz digital signage | 170 | Low | Product |
| brightsign cena | 90 | Low | Transactional |
| ekran reklamowy oprogramowanie | 140 | Medium | Informational |

### On-Page SEO Checklist

- [ ] Unique title tags for all pages (< 60 chars)
- [ ] Meta descriptions (< 160 chars, include CTA)
- [ ] H1 tags with primary keyword
- [ ] Alt text for all images
- [ ] Schema markup (Product, Organization, FAQ)
- [ ] Internal linking structure
- [ ] Breadcrumbs
- [ ] Canonical URLs for multi-language

### Technical SEO

```typescript
// next.config.js - SEO setup
module.exports = {
  i18n: {
    locales: ['cs', 'sk', 'pl', 'en', 'de'],
    defaultLocale: 'cs',
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'index, follow' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      // Clean URLs
      { source: '/produkty/:slug', destination: '/products/:slug' },
      { source: '/kategorie/:slug', destination: '/categories/:slug' },
    ];
  },
};
```

### Content Strategy

#### Blog Topics (SEO + Authority)
1. "Co je digital signage a jak vybrat správný přehrávač" (pillar)
2. "BrightSign vs konkurence: Srovnání 2025"
3. "10 příkladů využití digital signage v retailu"
4. "Jak nastavit BrightSign za 30 minut" (tutorial)
5. "ROI digital signage: Případová studie"

#### Landing Pages
- `/brightsign-hd-serie` - Series comparison
- `/digital-signage-pro-obchody` - Retail vertical
- `/digital-signage-pro-restaurace` - Hospitality vertical
- `/b2b-program` - B2B benefits page

---

## 💰 PPC Strategy (Google Ads)

### Campaign Structure

```
Account: BrightSign.cz
├── Search Campaigns
│   ├── [CZ] Brand
│   │   └── brightsign, brightsign.cz, brightsign přehrávač
│   ├── [CZ] Product
│   │   └── digital signage player, reklamní přehrávač, 4k media player
│   ├── [CZ] Competitor
│   │   └── [competitor names] alternativa
│   ├── [PL] Brand
│   │   └── brightsign, brightsign polska
│   ├── [PL] Product
│   │   └── odtwarzacz digital signage, player reklamowy
│   └── [SK] Combined
│       └── brightsign slovensko, digital signage
│
├── Shopping Campaigns
│   ├── [CZ] All Products
│   ├── [PL] All Products
│   └── [SK] All Products
│
└── Remarketing
    └── Cart Abandoners
```

### Ad Copy Templates

#### Brand Campaign (CZ)
```
Headline 1: BrightSign Přehrávače | Skladem
Headline 2: Autorizovaný prodejce v ČR
Headline 3: B2B slevy až -20%
Description 1: Profesionální digital signage přehrávače BrightSign. 
               Série 5 skladem, doprava do 24h. B2B program pro firmy.
Description 2: 4K rozlišení, HTML5 podpora, spolehlivý provoz 24/7. 
               Získejte cenovou nabídku ještě dnes.
```

#### Product Campaign (CZ)
```
Headline 1: 4K Digital Signage Přehrávač
Headline 2: Od 9.200 Kč | BrightSign
Headline 3: Profesionální kvalita
Description: Spolehlivé digital signage přehrávače pro vaši firmu. 
             HTML5, HDMI 2.0, PoE+. Doprava zdarma nad 2000 Kč.
```

#### Polish Market
```
Headline 1: BrightSign Polska | Oficjalny
Headline 2: Ceny od 2.199 PLN
Headline 3: Dostawa 2-4 dni
Description: Profesjonalne odtwarzacze digital signage. 
             Najlepsze ceny w Polsce. Faktura VAT dla firm.
```

### Bidding Strategy

| Campaign Type | Strategy | Target |
|---------------|----------|--------|
| Brand | Manual CPC | Position 1 |
| Product | Target ROAS | 400% |
| Shopping | Max Conversions | - |
| Remarketing | Target CPA | €30 |

### Negative Keywords

```
-free
-download
-software only
-diy
-homemade
-cheap chinese
-aliexpress
-used
-second hand
-repair
-manual pdf
```

### Conversion Tracking

```html
<!-- Google Ads Conversion -->
<script>
  gtag('event', 'conversion', {
    'send_to': 'AW-XXXXXXXXX/XXXXXX',
    'value': {{ order.total }},
    'currency': '{{ order.currency }}',
    'transaction_id': '{{ order.id }}'
  });
</script>
```

---

## 📧 Email Marketing (Resend)

### Email Lists

| List | Purpose | Acquisition |
|------|---------|-------------|
| Newsletter | General updates | Website signup |
| B2B Customers | Business buyers | Checkout + registration |
| Abandoned Cart | Recovery | Cart abandonment |
| Post-Purchase | Retention | After purchase |

### Automated Sequences

#### 1. Welcome Sequence (Newsletter)
```
Day 0: Welcome + 10% discount code
Day 3: "How to choose the right BrightSign"
Day 7: Case study / success story
Day 14: Product recommendations
```

#### 2. B2B Welcome Sequence
```
Day 0: B2B benefits explained + login info
Day 2: "How to use your B2B account"
Day 5: Volume discount tiers
Day 10: Project consultation offer
```

#### 3. Abandoned Cart Recovery
```
Hour 1: "Zapomněli jste něco v košíku?"
Hour 24: "Vaše produkty čekají" + urgency
Hour 72: "Poslední šance" + small discount
```

#### 4. Post-Purchase Sequence
```
Day 0: Order confirmation
Day 1: Shipping notification (Packeta)
Day 3: Setup guide / getting started
Day 7: Review request
Day 30: Cross-sell accessories
Day 90: Check-in + new products
```

### Email Templates

#### Newsletter Signup Form
```html
<form action="/api/newsletter" method="POST">
  <h3>Odebírejte novinky</h3>
  <p>Získejte 10% slevu na první objednávku</p>
  <input type="email" name="email" placeholder="váš@email.cz" required />
  <label>
    <input type="checkbox" name="b2b" />
    Jsem firemní zákazník
  </label>
  <button type="submit">Odebírat</button>
  <small>Odhlášení kdykoliv. Bez spamu.</small>
</form>
```

#### Monthly Newsletter Structure
```
1. Hero: New product / promotion
2. Featured products (3-4)
3. Case study or tip
4. Industry news
5. Footer: Contact, socials, unsubscribe
```

### KPIs to Track

| Metric | Target |
|--------|--------|
| Open rate | > 25% |
| Click rate | > 3% |
| Unsubscribe | < 0.5% |
| Revenue per email | > €0.50 |

---

## 🤝 B2B Marketing

### Target Segments

| Segment | Size | Approach |
|---------|------|----------|
| AV Integrators | Small | Direct outreach |
| IT Companies | Medium | Content + PPC |
| Marketing Agencies | Medium | Case studies |
| Enterprise | Large | Account-based |

### Lead Generation Tactics

#### 1. Gated Content
- "Digital Signage ROI Calculator" (spreadsheet)
- "BrightSign Setup Guide" (PDF)
- "Case Study: Retail Chain Implementation"

#### 2. Project Quote Form
```html
<form>
  <h2>Poptávka projektu</h2>
  
  <label>Počet přehrávačů</label>
  <select name="quantity">
    <option>1-5</option>
    <option>6-20</option>
    <option>21-50</option>
    <option>50+</option>
  </select>
  
  <label>Typ použití</label>
  <select name="use_case">
    <option>Retail / obchody</option>
    <option>Restaurace / hospitality</option>
    <option>Korporátní komunikace</option>
    <option>Doprava / letiště</option>
    <option>Jiné</option>
  </select>
  
  <label>Popis projektu</label>
  <textarea name="description"></textarea>
  
  <label>Kontakt</label>
  <input type="text" name="company" placeholder="Název firmy" />
  <input type="email" name="email" placeholder="Email" />
  <input type="tel" name="phone" placeholder="Telefon" />
  
  <button type="submit">Odeslat poptávku</button>
</form>
```

#### 3. LinkedIn Strategy
- Company page: BrightSign.cz
- Share case studies, tips
- Connect with AV integrators
- Join digital signage groups

### B2B Landing Page Structure

```
/b2b-program

1. Hero
   "Partnerský program pro profesionály"
   CTA: Registrovat se

2. Benefits
   - 10-20% slevy
   - Fakturace
   - Prioritní podpora
   - Technická dokumentace

3. Pricing Tiers Table
   Standard / Volume / Partner

4. How It Works
   1. Registrace
   2. Ověření DIČ
   3. Okamžité slevy

5. Testimonials
   Quotes from existing B2B customers

6. FAQ
   Common B2B questions

7. CTA
   "Začněte ještě dnes"
   Registration form
```

---

## 📊 Analytics & Tracking

### Tools Stack

| Tool | Purpose | Cost |
|------|---------|------|
| Plausible | Website analytics | €9/mo or self-host |
| Google Search Console | SEO monitoring | Free |
| Google Ads | PPC tracking | Included |
| Resend | Email analytics | Included |
| Hotjar | Heatmaps (optional) | Free tier |

### Key Metrics Dashboard

```
Daily:
- Sessions
- Conversions
- Revenue
- Ad spend

Weekly:
- Conversion rate
- ROAS
- Email performance
- Top landing pages

Monthly:
- Customer acquisition cost
- Lifetime value
- Market share by country
- SEO rankings
```

### UTM Convention

```
utm_source: google, resend, linkedin, direct
utm_medium: cpc, email, social, organic
utm_campaign: brand_cz, product_pl, newsletter_jan
utm_content: ad_variant_a, button_hero

Example:
https://brightsign.cz/hd225?utm_source=google&utm_medium=cpc&utm_campaign=product_cz&utm_content=ad_v1
```

### Conversion Funnel

```
Awareness    →    Interest    →    Decision    →    Action
   │                 │               │              │
Sessions         Product Views    Add to Cart    Purchase
   │                 │               │              │
100%              30%              10%            3%

Target: 3% overall conversion rate
B2B: 5% conversion rate (higher intent)
```

---

## 📅 Launch Marketing Plan

### Pre-Launch (Week -2 to 0)
- [ ] Setup Google Ads accounts
- [ ] Configure Plausible analytics
- [ ] Prepare email templates in Resend
- [ ] Create initial ad campaigns (paused)
- [ ] Setup conversion tracking
- [ ] Prepare social media profiles

### Launch Week (Week 1)
- [ ] Go live with website
- [ ] Activate Google Ads (low budget)
- [ ] Announce on LinkedIn
- [ ] Email existing Shoptet customers
- [ ] Monitor closely, fix issues

### Growth Phase (Week 2-4)
- [ ] Increase PPC budget based on ROAS
- [ ] Start Shopping campaigns
- [ ] Launch remarketing
- [ ] Begin content publishing
- [ ] Collect first reviews

### Expansion (Month 2-3)
- [ ] Launch PL campaigns
- [ ] Add SK/AT targeting
- [ ] Scale winning campaigns
- [ ] A/B test landing pages
- [ ] Build case studies

---

## 🔧 Marketing Tech Setup

### Google Tag Manager

```html
<!-- GTM Container -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXX');</script>
```

### DataLayer Events

```javascript
// Product View
dataLayer.push({
  event: 'view_item',
  ecommerce: {
    currency: 'CZK',
    value: 14900,
    items: [{
      item_id: 'HD225',
      item_name: 'BrightSign HD225',
      price: 14900,
      quantity: 1
    }]
  }
});

// Add to Cart
dataLayer.push({
  event: 'add_to_cart',
  ecommerce: {
    currency: 'CZK',
    value: 14900,
    items: [{ ... }]
  }
});

// Purchase
dataLayer.push({
  event: 'purchase',
  ecommerce: {
    transaction_id: 'ORD-001',
    value: 14900,
    currency: 'CZK',
    items: [{ ... }]
  }
});
```

### Resend Integration

```typescript
// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMarketingEmail(to: string, subject: string, html: string) {
  return resend.emails.send({
    from: 'BrightSign.cz <info@brightsign.cz>',
    to,
    subject,
    html,
  });
}

// Usage
sendMarketingEmail(
  'customer@example.com', 
  'Nové produkty BrightSign', 
  '<h1>Série 5 je tady!</h1>'
);
```
