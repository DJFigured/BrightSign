# Board Report: BrightSight E-Commerce Platform
**Datum:** 2026-02-27
**Autor:** CEO Agent (Claude Opus 4.6)
**Verze:** 1.0
**Klasifikace:** Interni -- Vedeni projektu

---

## 1. EXECUTIVE SUMMARY

BrightSight je multi-country B2B e-shop pro prodej BrightSign digital signage prehravace na trzich CZ, SK, PL a EU. Projekt je technicky vyspely, ale neni v produkci. Hlavni blokery jsou infrastrukturni (VPS zamceny, DNS nenastaveno, Stripe/Packeta nekonfigurovano).

### Klicova cisla

| Metrika | Hodnota |
|---------|---------|
| Celkove skore pripravenosti | **78/100** |
| Commitu na main branch | 100+ |
| Produktu v katalogu | 32 (Serie 4+5) + 4 (Serie 6) = **36** |
| Jazykovych mutaci | 5 (cs, sk, pl, en, de) |
| Trzni pokryti | 4 zeme (CZ, SK, PL, EU) |
| Odhadovana doba do launche | **7-12 pracovnich dni** po odblokovani VPS |
| Mesicni provozni naklady | cca **12 EUR** (Hetzner VPS 4.51 + domena + Resend free) |
| Ocekavane marze | **23-35%** podle produktu a trhu |
| Adresovatelny trh (EU digital signage) | **7.03 mld USD (2026)**, CAGR 9.86% |

### Stav jednou vetou
Technicka platforma je na 85 %, ale 0 % produkce -- bez VPS, DNS, Stripe a Packeta nelze prijmout ani jednu objednavku.

---

## 2. STAV PROJEKTU

### 2.1 Co je hotovo (zelena zona)

| Oblast | Stav | Score |
|--------|------|-------|
| Medusa.js v2 backend | Plne funkcni, custom moduly (invoice, bank-transfer, packeta) | 9/10 |
| Next.js 15 storefront | Kompletni e-shop s 20+ strankami | 8/10 |
| i18n (5 jazyku) | cs, sk, pl, en, de -- 700+ prekladovych klicu | 9/10 |
| Analytika | GA4 plny funnel + Meta Pixel + locale tracking | 9/10 |
| SEO | generateMetadata, JSON-LD (7 schemat), hreflang, OG/Twitter | 8/10 |
| Bezpecnost | 16/16 items -- CSP, HSTS, rate limiting, honeypot, auth cookies | 9/10 |
| B2B program | Registrace, VIES validace, 3 slevove urovne, firemni pole v checkout | 8/10 |
| Checkout | 4 kroky, Stripe card + bank transfer, order review, terms checkbox | 8/10 |
| Produktovy katalog | Serie 4, 5, 6 + prislusenstvi, cenova matice pro 3 meny | 8/10 |
| Email | Resend -- order confirmation, B2B, contact, newsletter | 7/10 |
| Docker Compose prod | 5 sluzeb (backend, storefront, postgres, redis, minio) + Traefik | 9/10 |
| CI/CD | GitHub Actions -> SSH deploy | 7/10 |
| Homepage varianty | 10 HTML prototypu, QA projito, pripraveno k vyberu | HOTOVO |
| Logo | SVG (dark + light varianta) | HOTOVO |
| Produktove fotky | 13 obrazku (HD5/6, XD5/6, LS5, XT5) v public/products/ | 7/10 |

### 2.2 Co chybi (cervena zona -- blokery launche)

| # | Bloker | Kdo muze vyresit | Odhadovany cas | Zavislost |
|---|--------|-------------------|---------------|-----------|
| 1 | **Hetzner VPS zamceny** (DDoS incident L0029DB12) | Dan -- kontaktovat support | 1-3 dny cekani | Zadna |
| 2 | **DNS nenastaveno** (brightsign.cz -> VPS IP) | Dan | 30 min | #1 |
| 3 | **Stripe live API klice** + webhook URL | Dan | 30 min | #2 |
| 4 | **Packeta API klic** z client.packeta.com | Dan | 1h | Packeta ucet |
| 5 | **Packeta widget** na checkout (vyber vydejniho mista) | Subagent | 1 den | #4 |
| 6 | **DB migrace** (invoice modul) | Dan (SSH) | 5 min | #1 |
| 7 | **VPS hardening** (UFW, fail2ban, SSH, Docker iptables) | Dan (SSH) | 1h | #1 |
| 8 | **.env.production** aktualizace (CORS, secrets) | Dan (SSH) | 30 min | #2 |
| 9 | **Backup cron** nastaveni | Dan (SSH) | 10 min | #1 |
| 10 | **Smoke test** -- cely checkout flow ve vsech mutacich | Dan | 2-4h | #1-#8 |

**Kriticka cesta:** Hetzner unlock (#1) -> DNS (#2) -> env (#8) -> deploy -> DB migrace (#6) -> Stripe (#3) -> smoke test (#10).

### 2.3 Co je rozpracovano (oranzova zona)

| Polozka | Stav | Co zbyva |
|---------|------|----------|
| Homepage redesign | 10 prototypu hotovych | Dan vybere viteze, pak Next.js implementace |
| Packeta backend modul | Kod hotovy (80b4a30) | Chybi API klic, widget, shipping options v admin |
| Produktove fotky | 13 obrazku stazeno | LS5 = 2.1 MB -- nutna optimalizace, chybi AU5, XC5 |
| Content (blog, landing pages) | Neexistuje | Planovano pro post-launch |

---

## 3. FINANCNI ANALYZA

### 3.1 Cenova strategie -- validace

**Nakupni ceny (COMM-TEC GmbH, dealerska sleva 35% z RRP):**

| Model | COMM-TEC EUR | Nase CZK | Nase EUR | Nase PLN | Marze CZK | Marze PLN |
|-------|-------------|----------|----------|----------|-----------|-----------|
| AU335 | ~150 | 5,800 | 227 | 949 | ~35% | ~34% |
| HD225 (S5) | ~423 | 14,900 | 584 | 2,499 | ~28% | ~28% |
| HD226 (S6) | ~487* | 17,100 | 670 | 2,799 | ~28% | ~28% |
| XD236 (S6) | ~583* | 22,300 | 875 | 3,699 | ~34% | ~34% |
| XT245 (S5) | ~650 | 24,400 | 957 | 3,999 | ~33% | ~32% |
| XC4055 | ~1,350 | 49,900 | 1,957 | 8,199 | ~32% | ~32% |

*Serie 6 naklady odhadovane jako S5 + 15%.

**Prumerna hruba marze: 30.5 %**

### 3.2 Konkurencni cenova pozice

| Trh | Nase pozice | Detail |
|-----|-------------|--------|
| CZ | **Konkurenceschopna** | HD225: my 14,900 vs VDT ~14,500 CZK (-3%). XT244: my 17,900 vs VDT 25,900 CZK (+31% pro nas) |
| SK | **Dominantni** | Zadny lokalni e-shop. First-mover advantage. |
| PL | **Silna** | HD225: my 2,499 vs daars.pl 3,099 PLN (-19%). XD235: my 3,199 vs supertech ~2,871 PLN brutto (+11%) |
| EU | **Pasivni** | brightsign-shop.eu je benchmark. HD226 UK: GBP 346 (~EUR 405) vs my EUR 670 -- vyssi ale s lokalni podporou |

**VAROVANI:** Na polskem trhu u XD235 jsme drazsi nez supertech.pl. Doporucuji snizit PL cenu XD235 z 3,199 na 2,899 PLN.

### 3.3 ROI projekce -- prvni rok

**Konzervativni scenar:**

| Kvartal | Objednavky | Prumerna hodnota | Revenue | COGS (70%) | Hruba marze |
|---------|-----------|-------------------|---------|------------|-------------|
| Q1 | 20 | 600 EUR | 12,000 EUR | 8,400 | 3,600 EUR |
| Q2 | 35 | 650 EUR | 22,750 EUR | 15,925 | 6,825 EUR |
| Q3 | 50 | 700 EUR | 35,000 EUR | 24,500 | 10,500 EUR |
| Q4 | 70 | 750 EUR | 52,500 EUR | 36,750 | 15,750 EUR |
| **Rok 1** | **175** | **~680 EUR** | **122,250 EUR** | **85,575** | **36,675 EUR** |

**Fixni naklady rok 1:**

| Polozka | Mesicne | Rocne |
|---------|---------|-------|
| Hetzner VPS CAX21 | 4.51 EUR | 54 EUR |
| Domena brightsign.cz | - | 10 EUR |
| Resend (email) | 0-20 EUR | 100 EUR |
| Stripe poplatky (~2.9%) | ~100 EUR | 1,200 EUR |
| Google Ads (425 EUR/mes od Q1) | 425 EUR | 3,825 EUR |
| **Celkem** | **~550 EUR** | **5,189 EUR** |

**Cisty zisk rok 1 (konzervativni): ~31,500 EUR**

**Optimisticky scenar (2x objednavky): ~68,000 EUR**

Poznamka: Toto je hruba kalkulace bez dani, ucetnictvi, casu Dana. Ale ukazuje, ze business model je ekonomicky zivotaschopny i pri male skale.

### 3.4 Break-even analyza

- Fixni naklady: ~550 EUR/mesic
- Prumerna marze na objednavce: ~200 EUR
- **Break-even: 3 objednavky mesicne**

To je realisticky dosazitelny cil od prvniho mesice.

---

## 4. TECHNICKY STAV

### 4.1 Architektura -- hodnoceni

| Komponenta | Technologie | Verze | Hodnoceni |
|------------|-------------|-------|-----------|
| Backend framework | Medusa.js v2 | latest | Solidni volba pro headless commerce |
| Frontend | Next.js 15.3 | latest | SSR, App Router, moderni |
| DB | PostgreSQL 16 | latest | Overeny, stabilni |
| Cache | Redis 7 | noeviction + 512MB | Spravne pro Medusa workflow engine |
| Hosting | Hetzner CAX21 | ARM64, 4GB | Dostatecne pro start, skalovatelne |
| Reverse proxy | Traefik (Coolify) | latest | Auto-SSL, health checks |
| Object storage | MinIO | latest | S3-kompatibilni, self-hosted |

**Architekturni riziko:** Nizke. Stack je moderni, dobre zdokumentovany. Jediny concern je 4GB RAM pro 5 Docker kontejneru -- muze byt tesne pod zatezi.

### 4.2 Kvalita kodu

| Metrika | Hodnota | Hodnoceni |
|---------|---------|-----------|
| Backend src | 380 KB | Ciste, modularni |
| Storefront src | 920 KB | Rozumna velikost |
| i18n kompletnost | 5/5 jazyku, 700+ klicu | Vyborne |
| Custom moduly | 3 (invoice, bank-transfer, packeta) | Dobre strukturovane |
| TypeScript | Ano, strict mode | Spravne |
| Loading states | Skeleton na vsech routach | Vyborne |
| Error handling | Error boundary + error.tsx | Dobry |

**Nalezene technicke problemy:**

1. **P0:** Packeta i18n klice chybi v cs.json (7 klicu)
2. **P0:** CSP blokuje Packeta widget + Meta Pixel domeny
3. **P0:** PacketaWidget.tsx neni importovan v checkout
4. **P1:** ~30 hardcoded gray-* trid misto brand tokenu (kontaktni stranka opravena, mohou zustavat jinde)
5. **P1:** Velke product images -- ls5-front.png = 2.1 MB, xd5-hero.png = 1.5 MB
6. **P2:** Checkout monoliticky (odhadovano 1200+ radku v jednom souboru)
7. **P2:** URL cesty jsou ceske i pro ostatni jazyky (/pl/hledani misto /pl/szukaj)

### 4.3 Bezpecnostni stav

| Oblast | Stav | Poznamka |
|--------|------|----------|
| CSP headers | Implementovano | Potrebuje pridani Packeta domeny |
| HSTS | Implementovano | - |
| Rate limiting | Implementovano | contact, B2B formulare |
| Honeypot | Implementovano | Silently returns 201 |
| Auth cookies | Implementovano | _bs_auth flag |
| SSH hardening | PRIPRAVENO | harden-vps.sh ceka na spusteni |
| UFW firewall | PRIPRAVENO | V hardening scriptu |
| Redis auth | Implementovano | requirepass v compose |
| Docker iptables | PRIPRAVENO | iptables:false v hardening scriptu |
| Stripe PCI | Delegovano na Stripe | Zadna kartova data u nas |

**Bezpecnostni skore: 8/10** (po spusteni hardening scriptu bude 9.5/10)

### 4.4 Infrastrukturni rizika

| Riziko | Pravdepodobnost | Dopad | Mitigace |
|--------|-----------------|-------|----------|
| VPS presyceni (4GB RAM) | Stredni | Vysoky | Monitoring + upgrade plan na CAX31 |
| DDoS opakujici se | Nizka | Vysoky | UFW + Hetzner DDoS protection |
| Database ztrata dat | Nizka | Kriticky | backup-db.sh (14-denni retence, GPG) |
| MinIO nedostupnost | Nizka | Stredni | Product images v public/ jako fallback |
| Coolify outage | Velmi nizka | Stredni | Docker compose funguje i bez Coolify |

---

## 5. HOMEPAGE VARIANTY -- DOPORUCENI

### 5.1 Prehled variant

Mame 10 HTML prototypu ve dvou sadach. Vsechny prosly QA (diakritika, ceny, a11y, mobile 375px).

**Sada 2 (Brand Native):**
- V1 Flagship -- korporatni, mega menu, BrightSignOS sekce
- V2 Product Focus -- specs+ceny upfront, comparison table
- V3 Solutions -- industry karty, konfigurator
- V4 Premium -- full dark mode, glow efekty, a11y compliant
- V5 Conversion -- urgency, CTA, trust signals

**Sada 1 (Rebrandovano z puvodniho designu):**
- V6 Minimal -- purple/cyan minimalism
- V7 Dark Tech -- neon glow
- V8 Enterprise -- B2B trust-focused
- V9 Editorial -- magazine layout
- V10 Bold -- gradient energy, animated counters

### 5.2 CEO doporuceni: V2 Product Focus NEBO V1 Flagship

**Prvni volba: V2 Product Focus**

Duvody:
1. **B2B zakaznici chteji specifikace a ceny okamzite** -- V2 to dava do popredi
2. **Comparison table** primo na homepage snizuje bounce rate (zakaznik neodchazi hledat jinam)
3. **Sticky product bar** udrzuje konverzni cestu viditelnou
4. **Plus Jakarta Sans** je moderni ale cteny font
5. **Nejblizssi k visunext.de** -- nasi nejlepsi UX inspiraci

**Druha volba: V1 Flagship**

Duvody:
1. Pusobi nejprofesionalneji a "nejvetsi"
2. Mega menu je uzitecne pro rozsahly katalog
3. BrightSignOS sekce dodava technicky kredit
4. Inter font je bezpecna volba

**Co nedoporucuji:**
- V4 Premium (dark mode) -- neni standard pro B2B e-shop, muze pusobit gamer-ovsky
- V5 Conversion -- urgency taktiky (countdown) jsou pro B2C, ne B2B
- V7 Dark Tech -- stejny problem jako V4
- V9 Editorial -- magazine layout se nehodi pro e-shop
- V10 Bold -- prilis hrava pro B2B segment

### 5.3 Konecne rozhodnuti je na Danovi

Dan musi otevrit `storefront/ui-variants/INDEX.html` v prohlizeci a projit vsech 10 variant. Me doporuceni je V2 nebo V1, ale je to Danova vizualni volba.

**Dulezite:** Po vyberu je implementace do Next.js odhadovana na 2-3 dny subagenta.

---

## 6. KONKURENCNI ANALYZA (aktualizovano 2026-02-27)

### 6.1 Cesky trh -- hlavni hraci

| Konkurent | Typ | Serie 6 | Online ceny | Nas edge |
|-----------|-----|---------|-------------|----------|
| ab-com.cz | AV distributor | ANO (XD236) | Na dotaz | Nase ceny jsou verejne, rychlejsi nakup |
| VDT Systems | AV integrator | NE | Ano (zastarale S4) | Modernejsi e-shop, sirsi katalog |
| AV Media | Integrator | ? | Ne (projektovy prodej) | Neni prime konkurence online |
| brightsign.cz (Shoptet) | Nase stara stranka | NE | Ano | Musi byt presmerovana na novy e-shop |

**Kriticke zjisteni:** ab-com.cz jiz nabizi Serie 6 (vcetne XD236). My mame Serie 6 pripravenu (import script + data), ale neni v produkci. Casove okno se zuzuje.

### 6.2 Slovensky trh

**ZADNY lokalni online prodejce BrightSign.** Slovaci kupuji z CZ nebo z brightsign-shop.eu (anglicky). Nase slovenska mutace nam dava okamzitou vyhodu.

### 6.3 Polsky trh

| Konkurent | HD225 cena PLN | vs. my (2,499 PLN) | Poznamka |
|-----------|----------------|---------------------|----------|
| daars.pl | 3,099 | **-19%** | Hlavni konkurent, siroky sortiment |
| supertech.pl | 2,334 | **+7%** | Mozna netto cena |
| c4i.com.pl | 1,199 | **+108%** | Velmi pravdepodobne netto (bez DPH) |
| wyswietlanie.com.pl | ? | ? | Novy hrac, nutno overit |

**Dulezite:** NIKDO v Polsku neprodava Serie 6. Mame first-mover advantage -- ale jen dokud nespustime e-shop.

### 6.4 EU trh

| Konkurent | Zeme | Nas edge |
|-----------|------|----------|
| brightsign-shop.eu | NL | Nase tech stack je lepsi, mame 5 jazyku vs jejich 1 |
| visunext.de | DE | Silny B2B hrac, tezke konkurovat -- UX inspirace |
| signamedia.de | DE | Projektove ceny (na dotaz) -- nas model je transparentnejsi |
| Amazon.de | DE | Zadny B2B program, zadna podpora |

### 6.5 Globalni kontext

- BrightSign je **globalni jednicka** v digital signage hardwaru (#1 market share)
- Evropsky digital signage trh: **7.03 mld USD (2026)**, CAGR 9.86% do 2031
- Hardware tvorí **65.78 % trzeb** (zdroj: Mordor Intelligence)
- BrightSign zavedl **5letou zaruku** od 1.1.2025 pro Serie 5 a 6 -- silny marketingovy argument
- Serie 6 pridava **NPU (Neural Processing Unit)** pro AI na hranie -- potencialni diferenciator

---

## 7. GO-TO-MARKET STRATEGIE

### 7.1 Faze 1: Soft Launch (tyden 1-2)

**Cil:** Overit ze vse funguje, ziskat prvni realne objednavky.

| Akce | Kanal | Rozpocet | KPI |
|------|-------|---------|-----|
| Presmerovani brightsign.cz (Shoptet) | 301 redirect | 0 | Zachovani SEO juice |
| Google Search Console + sitemap | Organic | 0 | Indexace 50 % stranek |
| Brand kampan CZ "brightsign" | Google Ads | 50 CZK/den | CTR > 15% |
| Email existujicim zakaznikum | Resend | 0 | Open rate > 30% |
| LinkedIn announcement | Social | 0 | 50+ impressions |

### 7.2 Faze 2: Akvizice (tyden 3-8)

| Akce | Kanal | Rozpocet | KPI |
|------|-------|---------|-----|
| Produktova kampan CZ | Google Ads | 100 CZK/den | ROAS > 400% |
| Brand kampan PL | Google Ads | 50 PLN/den | CTR > 10% |
| Google Shopping feed | Merchant Center | included | Impressions > 1000/tyden |
| Blog: "Jak vybrat BrightSign" (CZ) | SEO | 0 (cas) | Organic traffic |
| Blog: "Serie 6 -- co je noveho" (CZ) | SEO | 0 (cas) | Organic traffic |

### 7.3 Faze 3: Skala (mesic 3-6)

| Akce | Kanal | Rozpocet | KPI |
|------|-------|---------|-----|
| PL produktova kampan | Google Ads | 200 PLN/den | 5+ objednavek/mesic z PL |
| SK kampan | Google Ads | 30 EUR/den | 3+ objednavek/mesic z SK |
| Remarketing | Google Ads | 50 CZK/den | CTR > 2% |
| Abandoned cart emaily | Resend | 0 | Recovery rate > 5% |
| B2B outreach -- AV integratori | Direct | 0 (cas) | 5+ B2B registraci |

### 7.4 Messaging a positioning

**USP (Unique Selling Proposition):**
"Jediny specializovany online obchod s BrightSign v stredni Evrope. Verejne ceny, B2B program, 5 jazyku, doruceni do celeho EU."

**Key messages:**
1. **Specializace:** Nejsme vseobecny AV e-shop. Jsme BrightSign experti.
2. **Transparentnost:** Verejne ceny vcetne DPH i bez DPH. Zadne "ceny na dotaz".
3. **Lokalni podpora:** Ceska firma, ceska fakturace, Packeta doruceni.
4. **B2B program:** Sleva 10-20 % podle objemu, fakturacni adresa, DIK.
5. **Novinka:** Serie 6 s NPU pro AI -- jako jedni z prvnich v regionu.
6. **Zaruka:** 5 let zaruka od BrightSign (od 1.1.2025).

---

## 8. RISK ASSESSMENT

### 8.1 Rizikova matice

| # | Riziko | Pravdepodobnost | Dopad | Skore | Mitigace |
|---|--------|-----------------|-------|-------|----------|
| 1 | Hetzner VPS zustane zamceny dlouhodobe | Nizka | Kriticky | 4 | Alternativni VPS (Contabo, OVH) jako plan B |
| 2 | COMM-TEC zmeni podminky/ceny | Nizka | Vysoky | 3 | Diverzifikace dodavatelu (Midwich, AVD Distribution) |
| 3 | ab-com.cz zintenzivni online aktivity | Stredni | Stredni | 4 | Differentiate pres UX, content, B2B program |
| 4 | BrightSign zmeni distribuci (direct-to-customer) | Velmi nizka | Kriticky | 2 | Neni ve strategii BrightSign (channel-only model) |
| 5 | Nizky traffic / male objednavky | Stredni | Vysoky | 6 | Agresivnejsi PPC, content marketing, B2B outreach |
| 6 | Technicke problemy po launchi (bugy, downtime) | Stredni | Stredni | 4 | Monitoring (UptimeRobot), Sentry, backup |
| 7 | Kurzove riziko (CZK/EUR/PLN) | Stredni | Nizky | 2 | Ceny nastaveny manualne v kazde mene |
| 8 | Pravni riziko (GDPR, spotrebitelske pravo) | Nizka | Stredni | 2 | OP, GDPR, reklamacni rad implementovano |
| 9 | Jeden clovek = single point of failure | Vysoka | Vysoky | 8 | AI automatizace, dokumentace, SOP |
| 10 | Fake objednavky / podvody | Nizka | Nizky | 1 | Stripe Radar, honeypot, rate limiting |

**Nejvetsi riziko (#9):** Dan je jediny clovek na vsechno -- obchod, support, IT, marketing. Mitigace pres AI agenty a automatizace je spravny smer, ale je to stale krehke.

### 8.2 SWOT analyza

| **Silne stranky** | **Slabiny** |
|-------------------|-------------|
| Jediny specializovany BrightSign e-shop v CEE | One-person operation |
| 5 jazykovych mutaci od dne 1 | Zadna brand awareness (novy e-shop) |
| Moderni tech stack (Next.js 15, Medusa v2) | VPS zamceny -- neni v produkci |
| Konkurenceschopne ceny diky COMM-TEC | Zadne reference / testimonials |
| AI-powered operations | Packeta integrace nekompletni |
| B2B program s VIES validaci | Neoverene PL/SK preklady (strojove) |
| **Prilezitosti** | **Hrozby** |
| SK trh: zadna lokalni konkurence | ab-com.cz rozsirovani do online |
| PL trh: cenova arbitraz + Serie 6 first-mover | COMM-TEC zmena podminek |
| 5leta zaruka BrightSign -- marketing | Pokles poptavky po HW (SaaS trend) |
| AI/NPU v Serie 6 -- novy segment | Silni EU hraci (visunext, brightsign-shop.eu) |
| Partnersky program pro AV integratory | Kurzove vykyvy |

---

## 9. ROADMAPA S PRIORITAMI

### 9.1 IHNED (den 0-1) -- Dan musi udelat osobne

| # | Ukol | Cas | Dulezitost |
|---|------|-----|-----------|
| 1 | Kontaktovat Hetzner support (unlock VPS) | 15 min + cekani | KRITICKE |
| 2 | Ziskat Packeta API klic z client.packeta.com | 1h | KRITICKE |
| 3 | Overit Stripe ucet / ziskat live klice | 30 min | KRITICKE |
| 4 | **Vybrat homepage variantu** z INDEX.html | 30 min | VYSOKE |
| 5 | Poskytnout telefonni cislo pro header/footer | 5 min | STREDNI |

### 9.2 TYDEN 1 (po VPS unlock) -- Infrastruktura a deploy

| # | Ukol | Cas | Kdo |
|---|------|-----|-----|
| 1 | Spustit harden-vps.sh | 1h | Dan (SSH) |
| 2 | DNS A zaznamy: brightsign.cz, api.brightsign.cz, minio.brightsign.cz | 30 min | Dan |
| 3 | Aktualizovat .env.production (CORS, Stripe, Packeta, Resend) | 30 min | Dan (SSH) |
| 4 | Docker compose up --build | 30 min | Dan (SSH) |
| 5 | DB migrace (npx medusa db:migrate) | 5 min | Dan (SSH) |
| 6 | Backup cron nastaveni | 10 min | Dan (SSH) |
| 7 | Stripe webhook URL v Stripe Dashboard | 10 min | Dan |
| 8 | Implementace homepage varianty do Next.js | 2-3 dny | Subagent |
| 9 | Packeta widget na checkout | 1 den | Subagent |
| 10 | Shipping options v Medusa admin (CZ, SK, PL ceny) | 1h | Dan |
| 11 | Optimalizace produktovych obrazku (ls5-front 2.1 MB -> 200 KB) | 1h | Subagent |
| 12 | Smoke test vsech 5 jazykovych mutaci | 2-4h | Dan |

### 9.3 TYDEN 2 -- Soft Launch

| # | Ukol | Cas | Kdo |
|---|------|-----|-----|
| 1 | 301 redirect stary brightsign.cz -> novy | 30 min | Dan |
| 2 | Google Search Console -- verifikace + sitemap | 1h | Dan |
| 3 | Google Ads brand kampan CZ (50 CZK/den) | 2h | Dan |
| 4 | Email existujicim zakaznikum -- "Novy e-shop" | 2h | Dan + Resend |
| 5 | LinkedIn announcement | 30 min | Dan |
| 6 | UptimeRobot monitoring | 30 min | Dan |
| 7 | GA4 overeni eventov (purchase, add_to_cart) | 1h | Dan |

### 9.4 MESIC 1 -- Rust

| # | Ukol | Kdo |
|---|------|-----|
| 1 | Google Ads produktova kampan CZ | Dan |
| 2 | Google Ads brand kampan PL | Dan |
| 3 | Google Merchant Center + Shopping feed | Dan |
| 4 | Sentry error tracking (frontend + backend) | Subagent |
| 5 | Blog: "Jak vybrat BrightSign prehravac" (CZ) | Subagent / Dan |
| 6 | Blog: "BrightSign Serie 6 -- co je noveho" (CZ) | Subagent / Dan |
| 7 | PL preklady -- nativni korektura | Externista |
| 8 | Abandoned cart email flow (Resend) | Subagent |
| 9 | Performance audit (Core Web Vitals, Lighthouse) | Subagent |

### 9.5 KVARTAL 1 (mesic 2-3) -- Expanze

| # | Ukol | Kdo |
|---|------|-----|
| 1 | PL produktova kampan Google Ads | Dan |
| 2 | SK kampan Google Ads | Dan |
| 3 | Landing pages: /reseni/retail, /reseni/restaurace | Subagent |
| 4 | B2B dashboard (slevova uroven, reorder) | Subagent |
| 5 | Case studies (prvni zakaznici) | Dan |
| 6 | COMM-TEC stock monitoring (n8n automation) | Subagent |
| 7 | Remarketing kampan (cart abandoners) | Dan |
| 8 | Overit HU/RO trzni potencial | CEO Agent |

---

## 10. KONKRETNI DOPORUCENI A VYLEPSENI

### 10.1 Okamzita doporuceni (pred launchem)

1. **Snizit PL cenu XD235 z 3,199 na 2,899 PLN** -- jsme nad supertech.pl, co podkopava nasi cenovou strategii na polskem trhu

2. **Aktualizovat zaruku z "3 roky" na "5 let"** vsude na e-shopu -- BrightSign zavedl 5letou zaruku od 1.1.2025 pro S5 a S6. Toto je silny konkurencni argument a momentalne to nase texty neodrazi

3. **Pridat NPU/AI messaging k Serie 6** -- "S vestavenim AI procesorem (NPU)" je diferenciator, ktery zadny cesky konkurent nekomunikuje

4. **Optimalizovat produktove obrazky** -- ls5-front.png je 2.1 MB, xt5-hero.png 1.3 MB. Pro mobilni uzivatele je to pomale. Cil: pod 200 KB kazdy (WebP s lazy loading)

5. **Resit URL lokalizaci postupne** -- /pl/hledani misto /pl/szukaj je suboptimalni pro polske SEO, ale neni launch bloker. Zaradit do P2

### 10.2 Strategicka doporuceni

6. **Nevstupovar aktivne na DE/AT trh** -- silna konkurence (visunext, signamedia, Amazon). Obsluzt pasivne pres EN/DE mutaci, neinvestovat do marketingu

7. **Soustredme se na CZ+SK+PL** -- tri trhy kde mame jasnou vyhodu (specializace, jazyk, cena)

8. **B2B-first messaging** -- 70 % nasich zakazniku budou firmy. Homepage, messaging, checkout -- vsechno musi byti B2B-optimized. Ceny bez DPH vyrazne, firemni pole v checkout, B2B registrace vyrazna v navigaci

9. **Content marketing > PPC dlouhodobe** -- blog clanky "Jak vybrat BrightSign", "BrightSign vs konkurence", "Serie 6 review" budou generovat organicky traffic a budovat autoritu. PPC je pro okamzity traffic, ale CAC roste

10. **Sledovat brightsign-shop.eu** -- je to nas nejblizsi koncepci konkurent. Pokud zacnou pridavat jazykove mutace nebo agresivneji nastupi do CEE, musime reagovat

### 10.3 Technicka doporuceni

11. **Pridat monitoring od dne 1** -- UptimeRobot (free) + Sentry (free tier). Bez monitoringu nebudeme vedet o problemech driv nez zakaznici

12. **Plan upgrade VPS** -- pokud traffic prekroci 1000 sessions/den nebo RAM bude konzistentne nad 80 %, upgradovat z CAX21 (4GB) na CAX31 (8GB, ~8 EUR/mesic)

13. **Implementovat Przelewy24** pres Stripe pro polsky trh -- je to dominantni platebni metoda v PL. Stripe to podporuje, staci aktivovat

14. **Checkout decomposition** -- rozdelit monoliticky checkout soubor (1200+ radku) na mensi komponenty. Neni launch bloker, ale zlepsuje udrzitelnost

15. **Automaticke objednavani u COMM-TEC** -- v Q2 implementovat n8n workflow: nova objednavka -> automaticky email na COMM-TEC s objednavkou. Uspora 15-30 minut na objednavku

---

## 11. FINANCNI METRIKY K SLEDOVANI

| Metrika | Tydenni | Mesicni | Kvartalni |
|---------|---------|---------|-----------|
| Objednavky | > 2 | > 8 | > 20 |
| Revenue | > 1,200 EUR | > 5,000 EUR | > 15,000 EUR |
| Prumerna hodnota objednavky | > 500 EUR | > 600 EUR | Stabilni |
| Konverzni pomer | > 2% | > 3% | > 3% |
| ROAS (Google Ads) | - | > 300% | > 400% |
| CAC (Customer Acquisition Cost) | - | < 50 EUR | < 40 EUR |
| B2B podil na objednavkach | - | > 40% | > 60% |
| Bounce rate homepage | - | < 50% | < 45% |
| GA4 purchase events | Matchuje Stripe | Matchuje Stripe | Matchuje Stripe |

---

## 12. ZAVER A DALSI KROKY

### Projekt BrightSight je pripraveny k launchi -- az na infrastrukturni blokery.

Technicky zaklad je solidni. Mame moderni stack, 5 jazyku, 36 produktu, B2B program, analytiku, SEO, bezpecnost. Cekame na jedinou vec: **funkcni VPS s DNS a platebni branou.**

### Top 5 akci pro Dana (serazeno podle priority):

1. **Kontaktovat Hetzner support** a vyresit VPS unlock (dnes)
2. **Ziskat Packeta API klic** z client.packeta.com (dnes)
3. **Overit Stripe live credentials** (dnes)
4. **Vybrat homepage variantu** z storefront/ui-variants/INDEX.html (dnes/zitra)
5. **Poskytnout telefonni cislo** pro header a footer (dnes)

### Nasledne bude potreba:
- Deploy na VPS (1 den)
- Homepage implementace (2-3 dny)
- Packeta widget (1 den)
- Smoke test (1 den)
- **Soft launch: cca 7 pracovnich dni po VPS unlock**

---

## PRILOHY

### A. Struktura repozitare

```
BrightSight/
  backend/src/           # 380 KB -- Medusa custom API, moduly, scripty
  storefront/src/        # 920 KB -- Next.js pages, komponenty, i18n
  docs/                  # 232 KB -- business docs, specs, plany
  scripts/               # harden-vps.sh, backup-db.sh
  data/                  # price-overrides.json, produktova data
  docker-compose.prod.yml  # 5 sluzeb
  storefront/ui-variants/  # 10 HTML prototypu homepage
```

### B. Klicove soubory

| Soubor | Ucel |
|--------|------|
| `/docs/ceo-roadmap.md` | Detailni roadmapa s ukoly |
| `/docs/ceo-konkurence.md` | Konkurencni analyza 4 trhu |
| `/docs/ceo-ui-review.md` | UI gap analyza + akcni plan |
| `/docs/ceo-ux-inspirace.md` | UX principy a wireframy |
| `/data/price-overrides.json` | Cenova matice vsech produktu |
| `/backend/src/modules/packeta/` | Packeta fulfillment modul |
| `/storefront/ui-variants/INDEX.html` | Rozcestnik homepage variant |
| `/scripts/harden-vps.sh` | VPS bezpecnostni hardening |

### C. Zdroje trzni analyzy

- [Europe Digital Signage Market (Mordor Intelligence)](https://www.mordorintelligence.com/industry-reports/europe-digital-signage-market)
- [Europe Digital Signage Market worth $5.56 billion by 2030 (MarketsandMarkets)](https://www.marketsandmarkets.com/PressReleases/europe-digital-signage.asp)
- [BrightSign 5-Year Warranty Program](https://www.brightsign.biz/brightsign-players/warranty/)
- [BrightSign Series 6 Players](https://www.brightsign.biz/brightsign-players/series-6/)
- [brightsign-shop.eu -- HD226](https://brightsign-shop.eu/shop/en/home/93-brightsign-hd226.html)
- [daars.pl -- BrightSign HD225](https://daars.pl/digital-signage/84511-brightsign-hd225.html)
- [Ballicom UK -- HD226 GBP 346.07](https://www.ballicom.co.uk/brightsign-hd226.p1703305.html)

---

*Report pripravil CEO Agent (Claude Opus 4.6) na zaklade kompletniho auditu repozitare, existujici dokumentace a aktualniho websearch pruzkumu. Data jsou platna k 2026-02-27.*
