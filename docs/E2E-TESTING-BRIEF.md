# BrightSign EU E-shop — E2E Testing Brief

**Datum:** 2026-02-23
**Verze:** 1.0
**Prostředí:** Staging (bez domény, přímý IP přístup)

---

## Přístupové údaje

### VPS Server
- **IP:** 91.99.49.122
- **OS:** Ubuntu ARM64 (Hetzner CAX21)
- **SSH:** `ssh -i ~/.ssh/id_ed25519 root@91.99.49.122`

### Storefront (Next.js)
- **URL:** http://91.99.49.122:3000
- **Jazyky:** `/cs`, `/sk`, `/pl`, `/en`, `/de`
- **Příklad:** http://91.99.49.122:3000/cs

### Medusa Admin Panel
- **URL:** http://91.99.49.122:9000/app
- **Login:** admin@brightsign.cz
- **Heslo:** BrightSign2024!

### Medusa Store API
- **URL:** http://91.99.49.122:9000/store
- **Publishable API Key:** `pk_157ba3f6a48f046d6de8bf87cb9d85c9149a9ed88458eb5f367d3b107a2c06c7`
- **Header:** `x-publishable-api-key: pk_157ba3f6a48f046d6de8bf87cb9d85c9149a9ed88458eb5f367d3b107a2c06c7`

### AI Buddy API
- **Base URL:** http://91.99.49.122:9000/store/ai-buddy
- **Auth Header:** `Authorization: Bearer ab_live_bs_709d931696b98d845bafba8792671065e304143fef9a60261e1366d84e561819`
- **Health (bez auth):** GET `/store/ai-buddy/health`

### MinIO S3 (obrázky)
- **Console:** http://91.99.49.122:9001
- **User:** brightsign
- **Password:** 3777cd9fa45fa76ef7f766a7397bea0de2e82cde490a8eea
- **Public bucket:** http://91.99.49.122:9002/brightsign-media/

### Stripe (PLACEHOLDER — testovací klíče nenastaveny)
- **Status:** Placeholdery, platba kartou není funkční
- **Bankovní převod:** Funguje (custom modul)

### Email (Resend)
- **Status:** Placeholder API klíč, emaily se logují do console
- **From:** obchod@brightsign.cz

### Fakturační údaje (hardcoded)
- **IBAN CZK:** CZ1603000000000335584589
- **IBAN EUR:** CZ9303000000000335645089

---

## Infrastruktura

| Služba | Port | Container | Stav |
|--------|------|-----------|------|
| Storefront (Next.js 15) | 3000 | brightsign-storefront | healthy |
| Backend (Medusa v2.13) | 9000 | brightsign-backend | healthy |
| Admin panel | 9000/app | (součást backendu) | healthy |
| PostgreSQL 16 | 5432 (interní) | brightsign-postgres | healthy |
| Redis 7 | 6379 (interní) | brightsign-redis | healthy |
| MinIO S3 | 9001 (console), 9002 (API) | brightsign-minio | healthy |
| Caddy (reverse proxy) | 80, 443 | coolify-proxy | healthy |

---

## Produktový katalog

- **24 produktů** (všechny published)
- **16 produktů Série 5/6** — AI-generované popisy (~2000 zn.), kompletní překlady, 3-7 obrázků
- **8 produktů Série 4** — manuální popisy (~650 zn.), kompletní překlady, obrázky z MinIO
- **5 jazyků:** CZ (primární), SK, PL, EN, DE
- **3 měny:** CZK (region CZ), EUR (regiony SK, EU), PLN (region PL)
- **4 regiony:** CZ, SK, PL, EU (AT/DE/ostatní)
- **Kategorie:** Série 4/5/6 (family) + Produktové řady HD/XD/XT/XC/LS/AU

---

## Stránky a funkce k otestování

### 1. Homepage (`/{locale}`)
- Hero banner s CTA tlačítky
- Důvěryhodnostní signály (doprava, záruka, podpora)
- Featured produkty (grid)
- Produktové řady (LS/HD/XD/XT/XC/AU karty)
- Segmentový průvodce (Začátečník/Standard/Pokročilý)
- "Proč BrightSign?" sekce
- Doprodejový banner (Série 4)
- B2B CTA banner
- **Testovat:** Všech 5 jazyků, responsivita, odkazy

### 2. Katalog produktů (`/{locale}/kategorie`)
- Sidebar s kategoriemi (série + produktové řady)
- Filtry: řazení (cena, název), série (4/5/6), řada (HD/XD/XT/XC/LS/AU)
- Produktové karty: obrázek, název, cena s/bez DPH, badge série, badge doprodej
- Stránkování
- **Testovat:** Filtrování, kombinace filtrů, řazení, URL parametry, prázdné výsledky

### 3. Kategorie (`/{locale}/kategorie/{handle}`)
- Stejné jako katalog, ale filtrováno na jednu kategorii
- Breadcrumbs
- **Testovat:** Každou kategorii (serie-4, serie-5, serie-6, hd-prehravace, xd-prehravace...)

### 4. Detail produktu (`/{locale}/produkt/{handle}`)
- Galerie obrázků (hlavní + thumbnaily)
- Badges: série, segment, doprodej, záruka
- Cena s DPH + bez DPH
- Quantity selector + Přidat do košíku
- Popis v jazyce aktuálního locale (CZ/SK/PL/EN/DE)
- Tabulka specifikací
- Datasheet PDF odkaz (S5/S6)
- Související produkty
- Breadcrumbs
- JSON-LD structured data (v HTML source)
- **Testovat:** Všech 24 produktů, přepínání jazyků na jednom produktu, galerie, přidání do košíku

### 5. Vyhledávání (`/{locale}/hledani?q=...`)
- Výsledky z Medusa API
- Prázdný stav "Nenalezeno"
- **Testovat:** "HD225", "XT", "audio", "blbost" (žádné výsledky), prázdný dotaz

### 6. Porovnání produktů (`/{locale}/porovnani`)
- Max 4 produkty
- Toggle tlačítko na ProductCard
- Sticky lišta s vybranými produkty
- Porovnávací tabulka (specifikace vedle sebe)
- localStorage persistence
- **Testovat:** Přidání/odebrání, max limit, persistence po refreshi, porovnání různých sérií

### 7. Košík (`/{locale}/kosik`)
- Seznam položek s obrázkem, názvem, cenou
- Quantity +/- na položku
- Odebrat položku
- Shrnutí objednávky (mezisoučet, doprava, celkem)
- Pokračovat v nákupu / Přejít k pokladně
- Prázdný košík stav
- **Testovat:** Přidání více produktů, změna množství, odebrání, prázdný košík, persistence po refreshi

### 8. Pokladna (`/{locale}/pokladna`) — 5 kroků
**Krok 1 — Kontakt:** Email + telefon
**Krok 2 — Adresa:** Jméno, příjmení, adresa, město, PSČ (země dle locale)
**Krok 3 — Doprava:** Výběr z dostupných možností (radio button s cenami)
**Krok 4 — Platba:**
- Platba kartou (Stripe) — momentálně PLACEHOLDER, nefunkční
- Bankovní převod — funkční
**Krok 5 — Potvrzení:**
- Shrnutí objednávky
- Pro bankovní převod: číslo účtu, IBAN, variabilní symbol
- Proforma faktura
- **Testovat:** Celý flow CZ i SK (EUR), validace polí, zpětné kroky, obě platební metody

### 9. Přihlášení (`/{locale}/prihlaseni`)
- Email + heslo
- Chybové hlášky (špatné heslo, neexistující účet)
- Odkaz na registraci
- Redirect na `/ucet` po úspěchu
- **Testovat:** Správné + špatné údaje, redirect

### 10. Registrace (`/{locale}/registrace`)
- Jméno, příjmení, email, heslo (min 8 znaků)
- Validace
- Odkaz na přihlášení
- **Testovat:** Validace polí, duplicitní email, úspěšná registrace

### 11. Účet (`/{locale}/ucet`)
- Profilová karta (jméno, email)
- Seznam objednávek (číslo, datum, status, cena)
- Odhlášení
- **Testovat:** Po přihlášení vidí správná data, po objednávce se zobrazí v seznamu

### 12. Detail objednávky (`/{locale}/ucet/objednavka/{id}`)
- Header: číslo, datum, status badge
- 3-sloupcový přehled (objednávka, platba, doručení)
- Položky s obrázky
- Dodací adresa
- Způsob dopravy
- Tracking čísla (pokud existují)
- **Testovat:** Po dokončení objednávky

### 13. B2B Poptávka (`/{locale}/b2b/registrace`)
- Formulář: firma, IČO, DIČ (volitelné), kontakt, email, telefon, zpráva
- Honeypot pole (skryté "website")
- VIES validace DIČ v reálném čase
- Success screen s badge:
  - Zelený "Ověřeno" — DIČ platné v VIES
  - Oranžový "Čeká na ověření" — VIES nedostupný
  - Červený "Neověřeno" — DIČ neplatné
- Rate limit: 5 požadavků/hodinu/IP
- **Testovat:** Validní CZ DIČ (CZ12345678 formát), SK DIČ, neplatné DIČ, bez DIČ, honeypot (vyplnit = odmítnut), rate limit

### 14. Kontakt (`/{locale}/kontakt`)
- Formulář: jméno, email, předmět, zpráva
- Honeypot pole
- Údaje firmy (Make more s.r.o.)
- **Testovat:** Odeslání, validace, honeypot

### 15. Právní stránky
- `/obchodni-podminky` — Obchodní podmínky (8 sekcí)
- `/ochrana-udaju` — Ochrana osobních údajů (7 sekcí)
- `/reklamace` — Reklamační řád (4 sekce)
- **Testovat:** Obsah ve všech jazycích, navigace, formátování

---

## Backend API endpointy k otestování

### Store API (veřejné)

| Metoda | Endpoint | Auth | Popis |
|--------|----------|------|-------|
| GET | `/store/products` | API key | Seznam produktů |
| GET | `/store/products/{id}` | API key | Detail produktu |
| GET | `/store/product-categories` | API key | Seznam kategorií |
| POST | `/store/carts` | API key | Vytvořit košík |
| GET | `/store/carts/{id}` | API key | Načíst košík |
| POST | `/store/carts/{id}/line-items` | API key | Přidat položku |
| POST | `/store/b2b/inquiry` | API key | B2B poptávka |
| POST | `/store/b2b/register` | API key | B2B registrace (s účtem) |
| POST | `/store/contact` | API key | Kontaktní formulář |
| GET | `/store/orders/{id}/invoices` | Bez auth | Faktury objednávky |
| GET | `/store/ai-buddy/health` | Bez auth | Health check |
| GET | `/store/ai-buddy/dashboard` | Bearer token | Dashboard data |
| GET | `/store/ai-buddy/orders` | Bearer token | Objednávky |
| GET | `/store/ai-buddy/revenue` | Bearer token | Tržby |
| GET | `/store/ai-buddy/inventory` | Bearer token | Sklad |
| GET | `/store/ai-buddy/b2b` | Bearer token | B2B přehled |
| GET | `/uploads/{filename}` | Bez auth | Soubory (obrázky, PDF) |

### Admin API (vyžaduje přihlášení admina)

| Metoda | Endpoint | Popis |
|--------|----------|-------|
| GET | `/admin/invoices` | Seznam faktur |
| POST | `/admin/invoices/{id}/mark-paid` | Označit proformu jako zaplacenou |
| GET | `/admin/b2b/price-lists` | B2B ceníky |
| POST | `/admin/b2b/price-lists` | Přegenerovat B2B ceníky |

---

## Custom moduly

### Bank Transfer Payment
- Vlastní platební provider pro bankovní převody
- Generuje platební instrukce (účet, IBAN, variabilní symbol)
- CZK účet + EUR účet (ČSOB)

### Invoice Module
- Proforma faktury (bankovní převod) + finální faktury (po zaplacení)
- Automatické číslování: FV2026-0001 (faktura), ZF2026-0001 (proforma)
- PDF generování + uložení do S3
- Reverse charge pro EU B2B s platným DIČ

### Event Subscribers
| Event | Akce |
|-------|------|
| `order.placed` | Email potvrzení + generování proformy/faktury |
| `order.payment_captured` | Admin notifikace k expedici |
| `customer.created` | B2B welcome email (podle VAT statusu) |

---

## Známé limitace a nedostatky

### Nefunkční / Placeholder
1. **Stripe platba kartou** — testovací klíče jsou PLACEHOLDER, platba kartou nefunguje
2. **Resend emaily** — API klíč je PLACEHOLDER, emaily se logují do console (neodesílají se)
3. **Packeta doprava** — widget komponent existuje, ale není integrován

### Hardcoded / Neideální
4. **Bankovní údaje** — IBAN hardcoded v env, ne z administrace
5. **Newsletter signup** — formulář ve footeru existuje, ale endpoint není napojen
6. **Spec labels** — tabulka specifikací má hardcoded české popisky (ne lokalizované)
7. **UI texty** — některé texty v detailu produktu jsou hardcoded česky ("Záruka", "Expedice do 48h", "s DPH", "Stáhnout datasheet")
8. **S4 popisy** — kratší (~650 zn.) oproti S5/S6 (~2000 zn.)

### Chybějící funkce
9. **Stav skladu** — všechny produkty ukazují "Skladem" staticky, ne z DB
10. **Packeta výběr pobočky** — chybí widget pro výběr výdejního místa
11. **Fakturační adresa** — checkout nemá oddělené pole pro fakturační adresu
12. **Zapomenuté heslo** — stránka neexistuje
13. **Editace profilu** — v účtu nelze měnit jméno/email/heslo
14. **Smazání účtu** — není implementováno
15. **Objednávka bez registrace** — checkout vyžaduje email, ale account se nevytváří automaticky (guest checkout)

---

## Doporučené testovací scénáře

### Critical Path (musí fungovat)
1. **Happy path objednávka (CZ):** Otevřít → vybrat produkt → přidat do košíku → pokladna → bankovní převod → potvrzení
2. **Happy path objednávka (SK/EUR):** Stejné v SK locale s EUR cenami
3. **B2B poptávka s platným DIČ:** Vyplnit formulář s CZ26416816 → zelený badge
4. **Registrace + přihlášení + objednávka + historie:** Celý customer lifecycle
5. **Přepínání jazyků:** Na homepage, na produktu, v košíku — ceny a texty se mění

### Edge Cases
6. **Prázdný košík → pokladna** — měl by redirect nebo zobrazit empty state
7. **Neplatný DIČ** — B2B formulář s "CZ99999999" → červený badge
8. **Rate limit** — 6× odeslat kontaktní formulář → 429
9. **Neexistující produkt** — `/cs/produkt/neexistuje` → 404
10. **Velké množství** — přidat 999 ks do košíku → ověřit chování
11. **XSS v polích** — `<script>alert(1)</script>` do kontaktního formuláře
12. **Mobile responsivita** — hamburger menu, checkout na malém displeji

### Multi-jazyk
13. **Produkt detail ve všech 5 jazycích** — popis se mění podle locale
14. **Právní stránky** — ObP, GDPR, reklamace ve všech jazycích
15. **Checkout labels** — všechny kroky přeložené

### SEO & Technické
16. **JSON-LD** — `view-source:` na produktové stránce → najít `application/ld+json`
17. **Meta tagy** — title + description se liší podle jazyka
18. **Obrázky** — všech 24 produktů má fungující thumbnail + galerii
19. **404 stránka** — přizpůsobená, ne default Next.js

---

## Rychlé testovací příkazy (API)

```bash
# Health check
curl http://91.99.49.122:9000/store/ai-buddy/health

# Seznam produktů
curl -H "x-publishable-api-key: pk_157ba3f6a48f046d6de8bf87cb9d85c9149a9ed88458eb5f367d3b107a2c06c7" \
  http://91.99.49.122:9000/store/products?limit=5

# AI Buddy dashboard
curl -H "Authorization: Bearer ab_live_bs_709d931696b98d845bafba8792671065e304143fef9a60261e1366d84e561819" \
  http://91.99.49.122:9000/store/ai-buddy/dashboard

# B2B poptávka test
curl -X POST http://91.99.49.122:9000/store/b2b/inquiry \
  -H "Content-Type: application/json" \
  -H "x-publishable-api-key: pk_157ba3f6a48f046d6de8bf87cb9d85c9149a9ed88458eb5f367d3b107a2c06c7" \
  -d '{"company_name":"Test s.r.o.","registration_number":"12345678","contact_name":"Test","email":"test@test.cz","message":"E2E test"}'

# Kontaktní formulář test
curl -X POST http://91.99.49.122:9000/store/contact \
  -H "Content-Type: application/json" \
  -H "x-publishable-api-key: pk_157ba3f6a48f046d6de8bf87cb9d85c9149a9ed88458eb5f367d3b107a2c06c7" \
  -d '{"name":"E2E Tester","email":"test@test.cz","subject":"Test","message":"E2E testing brief"}'
```

---

## Kontakt
- **Owner:** Dan (Make more s.r.o.)
- **Repo:** github.com/DJFigured/BrightSign (private)
- **Stack:** Medusa v2.13 + Next.js 15.3 + PostgreSQL 16 + Redis 7 + MinIO S3
