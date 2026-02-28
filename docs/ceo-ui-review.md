# CEO UI Review & Gap Analysis
**Datum:** 2026-02-27
**Cil:** Score 90+/100 (aktualne 78/100)
**Metoda:** Code review vsech komponent + staticka analyza

---

## SOUCASNE SKORE PO OBLASTECH

| Oblast | Score | Cil | Gap |
|--------|-------|-----|-----|
| Frontend UX | 8/10 | 10/10 | -2 |
| Backend | 9/10 | 10/10 | -1 |
| Checkout | 7/10 | 10/10 | -3 |
| Content/SEO | 8/10 | 10/10 | -2 |
| Shipping | 5/10 | 8/10 | -3 |

---

## 1. FRONTEND UX (8/10 -> cil 10/10)

### Co funguje dobre
- Sticky header s mega-menu dropdown
- Mobile menu (Sheet) s kolapsibilnou navigaci
- Homepage: hero, trust signals, "Proc u nas", product lines, segment guide, featured products
- ProductCard: series/clearance/segment badges, warranty, compare toggle, ex-VAT price
- Product detail: lightbox, breadcrumbs, specs table, recently viewed, related products
- Search autocomplete s keyboard navigation
- Cart: item management, order summary
- FAQ: details/summary accordions s JSON-LD
- Skeleton loading.tsx na vsech routach
- Back-to-top button (ClientOverlays)
- Cookie consent

### Nalezene problemy (MOHU OPRAVIT)

#### P1 - Vizualni nedostatky
1. **[CONTACT] Kontaktni stranka pouziva hardcoded barvy** -- `text-gray-600`, `text-gray-700`, `border-gray-200`, `bg-gray-50` misto brand tokenů. Nesouvisly s design systemem.
2. **[CONTACT] Success stav pouziva text entity `&#10003;`** misto ikony (CheckCircle z Lucide). Vizualne neprofesionalni.
3. **[B2B] Success stav pouziva text entity `&#10003;`, `&#8987;`, `&#9888;`** misto Lucide ikon. Vizualne nekonsistentni.
4. **[FOOTER] Platebni metody jsou textove badges** -- "Visa", "Mastercard" misto SVG/obrazkovych lozek. Nepusobi duveryhodne.
5. **[PRODUCT] Segment labels jsou anglicky** ("Entry 4K", "Performance 4K") -- neprekladane. Melo by byt lokalizovano.
6. **[HOMEPAGE] Duplicitni sekce** -- "Why Buy From Us" (whyUs) a "Why BrightSign" (whyBrightsign) jsou konceptualne duplicitni. Homepage je prilis dlouha.

#### P2 - UX problemy
7. **[CART] Chybi "Pokracovat v nakupu" tlacitko** kdyz je kosik plny -- uzivatel nema cestu zpet k produktum krome navigace.
8. **[CHECKOUT] Country labels jsou anglicky** -- "Czechia", "Slovakia", "Poland" misto lokalizovanych nazvu (Cesko, Slovensko, Polsko).
9. **[CHECKOUT] Zadna validace formatu** -- PSC bez masky, telefon bez prefixu. Uzivatel muze zadat cokoliv.
10. **[PRODUCT] Price ex-VAT pocita s fixnim 21%** -- spatne pro SK (20%), PL (23%), AT (20%). Melo by byt dynamicke.
11. **[SEARCH] Mobile search suggestions nemaji close tlacitko** -- uzivatel muze zustat "uviznuty".
12. **[CATEGORY] Sidebar nezvyraznuje child kategorie** kdyz je rodic zavren -- uzivatel ztrati orientaci.

#### P3 - Drobnosti
13. **[FOOTER] Email info@brightsign.cz hardcoded** -- melo by byt v prekladu.
14. **[HEADER] Top bar text neni responzivni** -- na malych desktopech muze pretekt.
15. **[PRODUCT] "Skladem" badge je vzdy zeleny** -- neni napojeno na realny stock. Vzdy rika "Skladem".

### Co NEMOHU opravit (CEKA NA DANA)
- Telefonni cislo do headeru/paticky (Dan musi dat cislo)
- Real stock data z COMM-TEC (neni API/feed)
- Produktove fotky z brightsign.biz (potrebuji overit copyright)

---

## 2. BACKEND (9/10 -> cil 10/10)

### Co funguje dobre
- Custom API routes (contact, B2B, AI buddy, invoices, newsletter)
- Rate limiting na formulare
- Honeypot protection
- Redis + PostgreSQL spravne nastaveno
- Invoice modul (ceka na DB migraci)
- Security hardening (16/16)

### Nalezene problemy (MOHU OPRAVIT)
1. **Zadne** -- backend je v dobrem stavu. Jediny issue je DB migrace ktera vyzaduje VPS pristup.

### Co NEMOHU opravit (CEKA NA DANA)
- DB migrace pro invoice modul (VPS SSH)
- Packeta API klic
- Stripe live credentials
- CORS update na VPS

---

## 3. CHECKOUT (7/10 -> cil 10/10)

### Co funguje dobre
- 4-step progress bar s vizualni indikaci
- B2B pole (firma, ICO, DIC)
- Odlisna fakturacni adresa
- Country selector
- Stripe + bank transfer payment
- Order summary s cenami
- Analytics tracking (begin_checkout, add_shipping_info, add_payment_info, purchase)

### Nalezene problemy (MOHU OPRAVIT)
1. **Country labels v anglictine** -- viz #8 vyse
2. **Chybi shrnutí objednavky pred potvrzenim** -- uzivatel nevi co presne objednava (adresa, doprava, platba) pred klikem na "Objednat"
3. **Chybi checkbox pro souhlas s obchodnimi podminkami** -- pravni riziko!
4. **Chybi odkaz na obchodni podminky a ochranu udaju** v checkout flow
5. **Shipping step nema info o dodaci lhute** u kazde moznosti
6. **Payment step: bank transfer nemá jasne instrukce** pred dokoncenim objednavky

### Co NEMOHU opravit (CEKA NA DANA)
- Packeta widget na checkout (potrebuji API klic)
- Stripe live mode (potrebuji live klice)
- Real shipping options v Medusa (Dan musi nastavit v adminu)

---

## 4. CONTENT/SEO (8/10 -> cil 10/10)

### Co funguje dobre
- generateMetadata na vsech strankach
- JSON-LD: Organization, WebSite+SearchAction, Product, BreadcrumbList, CollectionPage, LocalBusiness, FAQPage
- OG + Twitter Card meta tagy
- hreflang tags
- noindex na nepublicnich strankach
- Localized product descriptions (metadata.translations)
- 5 jazykovych mutaci kompletni

### Nalezene problemy (MOHU OPRAVIT)
1. **Homepage nema JSON-LD Organization** -- chybi na nejdulezitejsi strance
2. **Produktove fotky chybi uplne** -- storefront/public/ ma jen logo.svg a manifest.json. Zadne produktove obrazky.
3. **Manifest.json** -- overit ze obsahuje spravne ikony a theme color

### Co NEMOHU opravit (CEKA NA DANA)
- Blog clanky (vyzaduji odborny obsah)
- Landing pages pro vertikaly (strategicke rozhodnuti)
- Google Search Console verifikace
- Google Business profil

---

## 5. SHIPPING (5/10 -> cil 8/10)

### Co funguje dobre
- Packeta backend modul existuje
- Packeta client library hotova
- Registrovano v medusa-config.ts

### Nalezene problemy (MOHU OPRAVIT)
1. **Checkout ukazuje "Nacitam moznosti dopravy..." ale nemusi nic nacist** -- fallback zprava chybi
2. **Zadna info o dopravnych cenach na produktove strance** -- zakaznik nevi kolik zaplati za dopravu

### Co NEMOHU opravit (CEKA NA DANA)
- Packeta API klic (bloker)
- Packeta widget (zavisi na API klici)
- Shipping options v Medusa adminu
- Real dopravne ceny

---

## AKCNI PLAN -- OPRAVY KTERE MOHU UDELAT

### Prio 1 (kritické pro launch)
| # | Oprava | Odhadovany cas | Impact |
|---|--------|---------------|--------|
| 1 | Pridat checkbox pro souhlas s OP v checkout | 30min | Pravni compliance |
| 2 | Lokalizovat country labels v checkout | 30min | UX pro 5 trhu |
| 3 | Nahradit hardcoded barvy na kontaktni strance | 20min | Design konzistence |
| 4 | Nahradit textove entity Lucide ikonami (contact, B2B success) | 20min | Profesionalni vzhled |
| 5 | Pridat "Pokracovat v nakupu" do plneho kosiku | 10min | UX konverzni cesta |
| 6 | Pridat platebni ikony do footer (SVG) | 30min | Trust & conversion |
| 7 | Pridat link na OP do checkout payment step | 10min | Pravni |

### Prio 2 (dulezite pro kvalitu)
| # | Oprava | Odhadovany cas |
|---|--------|---------------|
| 8 | Stahnout produktove fotky z brightsign.biz | 1-2h |
| 9 | Homepage JSON-LD Organization schema | 15min |
| 10 | Opravit ex-VAT kalkulaci (dynamicka sazba podle regionu) | 30min |

### Prio 3 (nice to have)
| # | Oprava | Odhadovany cas |
|---|--------|---------------|
| 11 | Checkout order review pred potvrzenim | 1h |
| 12 | Lokalizovat segment labels v ProductDetailClient | 20min |

---

## OCEKAVANE NOVE SKORE PO OPRAVACH

| Oblast | Pred | Po | Zmena |
|--------|------|----|-------|
| Frontend UX | 8/10 | 9.5/10 | +1.5 |
| Backend | 9/10 | 9/10 | 0 |
| Checkout | 7/10 | 9/10 | +2 |
| Content/SEO | 8/10 | 9/10 | +1 |
| Shipping | 5/10 | 5.5/10 | +0.5 (limitovano blokerama) |

**Celkove skore: 78 -> 86/100** (90+ vyzaduje Danovy blokery: DNS, Stripe, Packeta, produktove fotky na serveru)

---

## CO MUZE UDELAT JEN DAN (bloker pro 90+)

1. **Hetzner unlock + VPS deploy** -- bez toho nic neni na produkci
2. **DNS zaznamy** -- brightsign.cz -> VPS
3. **Stripe live API klice** -- platby
4. **Packeta API klic** -- doprava
5. **Telefonni cislo** -- do headeru a paticky
6. **Shipping options v Medusa admin** -- ceny dopravy
7. **Produktove fotky upload do MinIO** -- po stazeni je potreba nahrat na server
8. **DB migrace** (invoice modul) -- SSH na VPS

---

## HOMEPAGE UI VARIANTY (2026-02-27)

**10 HTML prototypu pripraveno k vyberu:** `storefront/ui-variants/INDEX.html`

### Sada 2: Brand Native (V1-V5)
| # | Nazev | Styl | Font |
|---|-------|------|------|
| V1 | Flagship | Corporate, mega menu, BrightSignOS sekce | Inter |
| V2 | Product Focus | Specs+ceny, comparison table, sticky bar | Jakarta Sans |
| V3 | Solutions | Industry karty, trust signals, konfigurator | Manrope |
| V4 | Premium | Full dark mode, glow efekty, a11y compliant | Sora |
| V5 | Conversion | Urgency, CTA, trust signals, floating cart | DM Sans |

### Sada 1: Rebrandovano (V6-V10)
| # | Nazev | Puvodni styl | Novy styl |
|---|-------|-------------|-----------|
| V6 | Minimal | Green Apple | Purple/cyan minimalism |
| V7 | Dark Tech | Neon green | Purple/cyan neon glow |
| V8 | Enterprise | Navy B2B | Purple B2B trust |
| V9 | Editorial | Terracotta serif | Purple/magenta magazine |
| V10 | Bold | Multi-neon | Brand purple/cyan/magenta energy |

### Co bylo opraveno ve vsech 10:
- Ceny sjednoceny na bez DPH (HD226=6900, HD1026=8500, XD236=12500, XD1036=24400)
- Vsechny fake social proof odstranen (star ratings, fake testimonials, fake company counts)
- Realne BrightSign fakty (#1 global market share, 500k+ deployments, 100+ countries)
- Ceska diakritika opravena v Sade 2
- prefers-reduced-motion na V4 + V5
- WCAG AA kontrast na V4

### Dalsi krok:
Dan otevre INDEX.html, vybere viteze → implementace do Next.js storefrontu
