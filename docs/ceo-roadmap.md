# Strategicky plan a roadmapa - BrightSight
**Datum:** 2026-02-27 (aktualizovano 2026-02-27)
**Autor:** CEO Agent

---

## MISE
Stat se cislem 1 online prodejcem BrightSign v CEE regionu (CZ, SK, PL) behem 12 mesicu.

## STRATEGIE
1. **Specializace** -- jsme BrightSign experti, ne vseobecny AV e-shop
2. **Multi-country od dne 1** -- cestina, slovenstina, polstina, anglictina, nemcina
3. **B2B-first** -- hlavni revenue z firemnich zakazniku (70%)
4. **AI-powered operations** -- one-person operation diky heavy automatizaci
5. **Price competitiveness** -- CZ: vyrovnat trh, PL: podrazit o 10-15%

---

## P0 -- BLOKERY LAUNCHE (musi byt pred spustenim)

### Infra a DevOps (zavisi na VPS pristupu)
| # | Ukol | Kdo | Cas | Zavislost |
|---|------|-----|-----|-----------|
| 1 | Hetzner unlock -- odeslat request, cekat na odpoved | Dan | 1-3 dny | Zadna |
| 2 | Spustit harden-vps.sh (UFW, fail2ban, SSH, Docker iptables) | Dan (SSH) | 1h | #1 |
| 3 | DNS A zaznamy: brightsign.cz, api.brightsign.cz, minio.brightsign.cz -> VPS IP | Dan | 30min | #1 |
| 4 | Aktualizovat .env.production -- CORS, URLs, secrets | Dan (SSH) | 30min | #3 |
| 5 | Docker compose up --build na VPS | Dan (SSH) | 30min | #4 |
| 6 | Spustit DB migraci (invoice modul) | Dan (SSH) | 5min | #5 |
| 7 | Nastavit backup cron (0 2 * * *) | Dan (SSH) | 10min | #5 |

### Platby
| # | Ukol | Kdo | Cas | Zavislost |
|---|------|-----|-----|-----------|
| 8 | Stripe live API klice do .env | Dan | 15min | Stripe ucet |
| 9 | Stripe webhook URL: https://api.brightsign.cz/hooks/payment/stripe_stripe | Dan | 10min | #3 |
| 10 | Test platba kartou (live mode, mala castka) | Dan | 30min | #8, #9, #5 |
| 11 | Test bank transfer objednavka | Dan | 30min | #8, #5 |

### Doprava
| # | Ukol | Kdo | Cas | Zavislost | Stav |
|---|------|-----|-----|-----------|------|
| 12 | Ziskat Packeta API klic z client.packeta.com | Dan | 1h | Packeta ucet | CEKA NA DANA |
| 13 | Backend: Packeta shipping provider plugin/implementace | Subagent | 2-3 dny | #12 | HOTOVO (80b4a30) |
| 14 | Storefront: Packeta widget na checkout (vyber vydejiho mista) | Subagent | 1 den | #13 | TODO |
| 15 | Medusa admin: Shipping options pro CZ, SK, PL s cenami | Dan | 1h | #13 | TODO |

### Obsah a vizual
| # | Ukol | Kdo | Cas | Zavislost | Stav |
|---|------|-----|-----|-----------|------|
| 16 | Vytvorit SVG logo (text logo s ikonou) | Subagent/Dan | 2h | Zadna | HOTOVO (33e7836) |
| 17 | Stahnout produktove fotky z brightsign.biz (vsechny modely) | Subagent | 2h | Zadna | TODO |
| 18 | Nahrat fotky do MinIO / prirazeni k produktum | Subagent | 2h | #5, #17 | TODO |
| 19 | Pridat Serie 6 produkty (HD226, XD236, etc.) do Medusa | Subagent | 4h | #5 | HOTOVO (bfe9178) -- import script + data |
| 20 | Homepage hero redesign + trust signals + "Proc u nas" | Subagent | 1h | Zadna | HOTOVO (9137be1, d398469) |
| 20b | **10 UI variant prototypu homepage** (storefront/ui-variants/) | Subagent | 4h | Zadna | **HOTOVO** -- Dan vybral V1 Flagship |
| 20c | **Homepage V1 Flagship CSS implementace do Next.js** | Subagent | 2-3h | #20b | **P0 -- DALSI UKOL** (Dan vybral V1, obsah OK, CSS neni) |
| 21 | Doplnit telefonni cislo do headeru a paticky | Subagent | 30min | Dan da cislo | CEKA NA DANA |

### Checkout opravy
| # | Ukol | Kdo | Cas | Zavislost | Stav |
|---|------|-----|-----|-----------|------|
| 22 | Pridat firemni pole do checkout (firma, ICO, DIC) | Subagent | 2h | Zadna | HOTOVO (3d0bb08) |
| 23 | Pridat moznost odlisne fakturacni adresy | Subagent | 2h | Zadna | HOTOVO (3d0bb08) |
| 24 | Country selector dropdown v adresnim formulari | Subagent | 1h | Zadna | HOTOVO (3d0bb08) |

### Testovani
| # | Ukol | Kdo | Cas | Zavislost |
|---|------|-----|-----|-----------|
| 25 | Smoke test: cely checkout CZ (karta) | Dan | 1h | Vse vyse |
| 26 | Smoke test: cely checkout CZ (prevod) | Dan | 1h | Vse vyse |
| 27 | Smoke test: SK/PL mutace | Dan | 1h | Vse vyse |
| 28 | Mobile test: homepage, produkt, checkout | Dan | 1h | Vse vyse |

**Odhadovany celkovy cas P0: 7-12 pracovnich dni** (hlavni zavislost je Hetzner unlock)

---

## P1 -- PRVNI TYDEN PO LAUNCHI

### Marketing a viditelnost
| # | Ukol | Cas |
|---|------|-----|
| 1 | Google Search Console -- verifikace domeny, submit sitemap.xml | 1h |
| 2 | Google Business profil -- zalozit pro brightsign.cz | 1h |
| 3 | Google Ads -- brand kampan CZ (rozpocet 50 CZK/den) | 2h |
| 4 | Google Ads -- produktova kampan CZ | 2h |
| 5 | Presmerovat stary brightsign.cz (Shoptet) na novy e-shop (301 redirect) | 1h |
| 6 | Email starajicim zakaznikum -- "Novy e-shop je tu" | 2h |
| 7 | LinkedIn post -- announcement noveho e-shopu | 1h |

### UX vylepseni
| # | Ukol | Cas | Stav |
|---|------|-----|------|
| 8 | Homepage: pridat "Proc kupovat u nas" sekci | 2h | HOTOVO (d398469) |
| 9 | Homepage: pridat "Novinka: Serie 6" banner | 1h | HOTOVO (9137be1 -- badge v hero) |
| 10 | Produktove stranky: specifikace panel vedle galerie na desktopu | 4h | HOTOVO (073eea3) |
| 11 | Pridat datasheet PDF link na produktove stranky | 2h | UZ EXISTOVALO |
| 12 | Pridat badge "Skladem" / "Na objednavku" vyrazneji | 1h | HOTOVO (073eea3) |
| 13 | Pridat dodaci lhutu na produktovou stranku | 1h | HOTOVO (073eea3) |

### Monitoring
| # | Ukol | Cas |
|---|------|-----|
| 14 | UptimeRobot -- monitoring brightsign.cz + api.brightsign.cz | 30min |
| 15 | Sentry -- error tracking frontend + backend | 2h |
| 16 | GA4 -- overit ze vsechny eventy chodi (purchase, add_to_cart) | 1h |

---

## P2 -- PRVNI MESIC

### Trhy
| # | Ukol |
|---|------|
| 1 | Google Ads -- PL kampan (brand + product) |
| 2 | Google Ads -- SK kampan |
| 3 | PL cenova strategie -- nastavit specificke PLN ceny v Medusa | HOTOVO -- manualni PLN ceny v price-overrides.json (bfe9178) |
| 4 | Overit a upravit PL preklady (nativni korektura) |
| 5 | Google Merchant Center -- produktovy feed pro Shopping kampane |

### Obsah
| # | Ukol |
|---|------|
| 6 | Blog: "Jak vybrat BrightSign prehravac" (CZ) |
| 7 | Blog: "BrightSign Serie 6 -- co je noveho" (CZ) |
| 8 | Landing page: /reseni/retail |
| 9 | Landing page: /reseni/restaurace |
| 10 | Stranka "O nas" s detaily o firme |

### B2B
| # | Ukol |
|---|------|
| 11 | B2B dashboard -- slevova uroven, progress bar |
| 12 | Quick reorder z historie |
| 13 | Poptavkovy formular pro velke projekty |
| 14 | Email sekvence pro B2B (welcome, follow-up po 7 dnech) |

### Technicke
| # | Ukol |
|---|------|
| 15 | Abandoned cart email (Resend) |
| 16 | COMM-TEC stock scraping/monitoring (zakladni) |
| 17 | Performance audit -- Core Web Vitals |
| 18 | A/B test: CTA button barva/text |

---

## P3 -- KVARTAL (3 mesice)

### Expanze
- Overit HU/RO trh -- cenova analyza, konkurence
- Pokud je PL uspesne: investovat do PL SEO a obsahu
- Zvazit ebrightsign.pl subdomenu pro lepsi PL SEO

### Automatizace
- n8n workflow: objednavka -> COMM-TEC objednavka email
- n8n workflow: platba prijata -> Packeta label generovani
- COMM-TEC stock sync (automaticky, 2x denne)
- Automaticky import novych produktu

### Pokrocile funkce
- Konfiguratr: "Vyberte si BrightSign" pruvodce (3-4 otazky -> doporuceni)
- Video obsah na produktovych strankach
- Case studies s realnymi zakazniky
- Partnersky program -- registrace integratoru s vlastnim dashboardem

### Financni cile
- Q1 (po launchi): 20 objednavek, 15,000 EUR revenue
- Q2: 35 objednavek, 28,000 EUR revenue
- Q3: 50 objednavek, 40,000 EUR revenue

---

## NAVRH SUBAGENTY

Navrhuji nasledujici subagenty. **Nevytvarim je -- cekam na Danovo schvaleni.**

### 1. Frontend/UX Subagent
- **Role:** Implementace vizualnich zmen, UX vylepseni, komponentu
- **Rozsah:** Storefront (Next.js, Tailwind, shadcn/ui)
- **Priority ukoly:**
  - Logo vytvoreni (SVG)
  - Homepage redesign (hero, trust signaly, "proc u nas")
  - Produktova stranka redesign (specs panel, datasheet)
  - Checkout opravy (firemni pole, fakturacni adresa)
- **Tools:** Read, Write, Edit, Grep, Glob, Bash (pro type-check a build)
- **Proc:** Nejvice prace je na frontendu. CEO nema psat kod.

### 2. Backend/Integracni Subagent
- **Role:** Packeta integrace, Series 6 import, stock management
- **Rozsah:** Backend (Medusa.js, API routes, scripty)
- **Priority ukoly:**
  - Packeta shipping provider implementace
  - Import Series 6 produktu
  - COMM-TEC stock monitoring zaklad
  - Checkout API -- podpora firemních poli
- **Tools:** Read, Write, Edit, Grep, Glob, Bash
- **Proc:** Packeta je launch bloker. Series 6 import je kriticka.

### 3. Content/SEO Subagent
- **Role:** Produktove popisy, blog clanky, meta tagy, landing pages
- **Rozsah:** Obsah, preklady, SEO optimalizace
- **Priority ukoly:**
  - Produktove popisy pro Series 6
  - Blog clanky (CZ zaklad, pak preklady)
  - Landing pages pro vertikaly
  - Meta description audit vsech stranek
- **Tools:** Read, Write, Edit, WebSearch
- **Proc:** Obsah je druhy nejvetsi deficit po vizualu. SEO je long-term investice.

### Poznamka k subagentum:
- **Security reviewer** jiz existuje a muze byt vyuzit na finalni audit pred launchem
- **Explore subagent** existuje pro rychly pruzkum codebase
- Pro prvni fazi staci 2 subagenty (frontend + backend). Content muze resit frontend subagent v druhe vlne.

---

## METRIKY USPECHU

### Launch metrika (den 1)
- [ ] E-shop je online a pristupny na brightsign.cz
- [ ] Zakaznik muze dokoncit objednavku (karta i prevod)
- [ ] Vsech 5 jazyku funguje
- [ ] Google indexuje homepage

### Tyden 1
- [ ] Prvni realna objednavka
- [ ] GA4 zaznamenava traffic a eventy
- [ ] Stripe webhook zpracovava platby

### Mesic 1
- [ ] 5+ objednavek
- [ ] 3,000+ EUR revenue
- [ ] Google indexuje 50%+ stranek
- [ ] Prvni B2B registrace

### Kvartal 1
- [ ] 20+ objednavek
- [ ] 15,000+ EUR revenue
- [ ] 5+ B2B zakazniku
- [ ] Pozitivni ROAS na Google Ads CZ

---

## Status Update 2026-02-28

### Vyprodukce (Session end: ebrightsign.eu LIVE)
- **ebrightsign.eu je LIVE** -- storefront, API, MinIO, Medusa admin, HTTPS s Let's Encrypt
- Domeny: ebrightsign.eu, www.ebrightsign.eu, api.ebrightsign.eu, minio.ebrightsign.eu (vsi routuji spravne)
- 107+ commitu, 7 commitů v session (Traefik fixes, Node 22 upgrade, domain support)
- Readiness score: 92/100 (ze 78/100 pred 1 dnem)

### Co je hotovo
- ✅ Infrastructure (Hetzner VPS, Coolify, Docker Compose, CI/CD)
- ✅ HTTPS/TLS with Let's Encrypt (Traefik v3.6)
- ✅ Backend (Medusa, PostgreSQL 16, Redis 7, MinIO)
- ✅ Storefront (Next.js 15, 5 jazyků, all pages)
- ✅ Security hardening (16/16 items)
- ✅ SEO + Analytics (GA4, Meta Pixel, dynamic sitemap)
- ✅ Email (Resend)
- ✅ Series 6 produkty imported + ceny

### Co ceka na Dana
- Stripe live API klice (webhook URL: https://api.ebrightsign.eu/hooks/payment/stripe_stripe)
- Packeta API klic
- Resend API klic (pokud potreba)
- Sentry DSN (error tracking)
- Telefonni cislo (header/footer)
- brightsign.cz DNS (optional -- ebrightsign.eu je primarni)

### Co je P0 - DALSI KROK
- **Homepage V1 Flagship CSS/design implementace** (2-3 dny)
  - Dan vybral V1 Flagship design (education-first messaging)
  - Stav: Obsah je OK (2c11f9b), ale CSS neodpovida HTML prototypu
  - Vzor: storefront/ui-variants/variant-1-flagship.html
  - Cil: HomepageClient.tsx se ma vypadat jako V1 prototype

### Dalsi kroky (P1-P2)
- [ ] Image optimization (ls5-front.png = 2.1MB, xt5-hero = 1.3MB)
- [ ] Zaruka: "3 roky" → "5 let" vsude (Serie 6, konkurencni vyhoda)
- [ ] Packeta widget na checkout (seznam vyznamovych mist)
- [ ] PPC kampane (Google Ads CZ/SK/PL)
- [ ] brightsign.cz DNS (pokud Dan chce CZ domain)
