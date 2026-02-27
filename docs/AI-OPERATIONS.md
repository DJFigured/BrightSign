# AI Operations -- Architektura AI teamu BrightSight

**Datum:** 2026-02-27
**Verze:** 1.0
**Autor:** CEO Agent (Claude Opus 4.6)
**Stav:** Navrh architektury -- ceka na implementaci po soft launch

---

## 1. VIZE

Jednoclovekova operace (Dan) rizena AI agenty, kteri autonomne zpracovavaji objednavky, monitoruji sklad a ceny, generuji reporty a odpovidaji zakaznikum. Cil: Dan se soustredi na strategii a rust, agenti delaji rutinni praci.

**Klicovy princip:** BrightSign Brain je single source of truth -- vsichni agenti cerpaji data z jeho knowledge base a komunikuji pres nej.

---

## 2. ARCHITEKTURA TEAMU

### 2.1 Prehled agentu

| Agent | Role | Trigger | Frekvence | Vystup |
|-------|------|---------|-----------|--------|
| **BrightSign Brain** | Knowledge + content + preklady + support | Na vyzadani + competitive scan | Stale dostupny | Texty, preklady, odpovedi, doporuceni |
| **Order Processor** | Zpracovani objednavek end-to-end | Medusa event: `order.placed` | Na event | COMM-TEC objednavka, Packeta label, status update |
| **Stock Monitor** | Sledovani skladu COMM-TEC + cen | Cron 2x denne (6:00, 18:00) | 2x denne | Stock update v Meduse, cenova alerta |
| **QA Watchdog** | Monitoring zdravi e-shopu | Cron 5min + error events | Kontinualne | Error alerty, health reporty, uptime |
| **Analytics Reporter** | Business reporty a insights | Cron denne 7:00 + tydenne Po 8:00 | Denne/tydenne | Revenue, konverze, traffic, doporuceni |

### 2.2 Vizualni architektura

```
                    +-------------------+
                    |   Dan (Owner)     |
                    |   Rozhodovani,    |
                    |   schvalovani     |
                    +--------+----------+
                             |
                    Telegram / Email / Dashboard
                             |
              +--------------+--------------+
              |                             |
     +--------v--------+          +--------v--------+
     |  n8n Orchestrator|          | BrightSign Brain|
     |  (Event router)  |<-------->| (Knowledge Hub) |
     +--------+---------+          +---------+-------+
              |                              |
    +---------+---------+---------+          |
    |         |         |         |          |
+---v---+ +--v----+ +--v----+ +--v-----+    |
| Order | | Stock | |  QA   | |Analyt. |    |
| Proc. | | Mon.  | | Watch | |Reporter|    |
+---+---+ +--+----+ +--+----+ +--+-----+    |
    |         |         |         |          |
    +---------+---------+---------+----------+
              |
     +--------v--------+
     | Medusa Backend   |
     | (Source of truth |
     |  pro objednavky, |
     |  produkty, ceny) |
     +---------+--------+
               |
     +---------+---------+
     |         |         |
  +--v--+  +--v--+  +--v--+
  |Stripe|  |Pack.|  |Resend|
  +------+  +-----+  +------+
```

---

## 3. ORCHESTRACE -- n8n jako centralni mozek

### 3.1 Proc n8n

- Open-source, self-hosted na nasem VPS (zadne mesicni naklady)
- Vizualni workflow builder -- Dan muze upravovat bez kodovani
- Nativni integrace: Webhook, HTTP, Telegram, IMAP, Schedule, Code
- Docker compose vedle existujiciho stacku
- Claude API integrace pres HTTP node

### 3.2 n8n na VPS

```yaml
# Pridani do docker-compose.prod.yml
n8n:
  image: n8nio/n8n:latest
  container_name: brightsign-n8n
  restart: unless-stopped
  environment:
    - N8N_BASIC_AUTH_ACTIVE=true
    - N8N_BASIC_AUTH_USER=${N8N_USER}
    - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
    - N8N_HOST=n8n.brightsign.cz
    - N8N_PROTOCOL=https
    - WEBHOOK_URL=https://n8n.brightsign.cz
    - GENERIC_TIMEZONE=Europe/Prague
  volumes:
    - n8n_data:/home/node/.n8n
  networks:
    - brightsign-network
  labels:
    - "traefik.enable=true"
    - "traefik.http.routers.n8n.rule=Host(`n8n.brightsign.cz`)"
    - "traefik.http.routers.n8n.tls.certresolver=letsencrypt"
```

### 3.3 Medusa Events jako triggery

n8n posloucha Medusa webhooky na `https://n8n.brightsign.cz/webhook/*`:

| Medusa Event | n8n Webhook | Spousti agenta |
|-------------|-------------|----------------|
| `order.placed` | `/webhook/order-placed` | Order Processor |
| `order.payment_captured` | `/webhook/payment-captured` | Order Processor (pokracovani) |
| `order.fulfilled` | `/webhook/order-fulfilled` | Analytics Reporter (update) |
| `order.canceled` | `/webhook/order-canceled` | Order Processor (storno) |
| `customer.created` | `/webhook/customer-created` | BrightSign Brain (welcome email) |
| `product.updated` | `/webhook/product-updated` | BrightSign Brain (preklady) |

Medusa webhook konfigurace v admin panelu: `Settings > Webhooks > Add Webhook`.

### 3.4 Cron schedule

| Cas | Agent | Akce |
|-----|-------|------|
| 06:00 | Stock Monitor | Ranni stock check COMM-TEC |
| 07:00 | Analytics Reporter | Denni report (vcera) |
| 08:00 Po | Analytics Reporter | Tydenni report |
| 12:00 | QA Watchdog | Poledni health check (rozsireny) |
| 18:00 | Stock Monitor | Vecarni stock check COMM-TEC |
| 20:00 Po | Stock Monitor | Tydenni competitive price scan |
| */5min | QA Watchdog | Uptime ping + error check |

---

## 4. AGENT 1: BRIGHTSIGN BRAIN (Knowledge Hub)

**Detailni specifikace:** viz `docs/agent-brightsign-specialist.md`
**Knowledge base:** viz `data/brightsign-knowledge-base.md`

### 4.1 Role v ekosystemu

BrightSign Brain je sdileny znalostni agent, na ktereho se obejruji ostatni agenti:

- **Order Processor** se pta: "Jaky je dodaci cas pro HD226?" -> Brain odpovi z knowledge base
- **Stock Monitor** se pta: "Jaka je nase cilova marze pro XD236 v PL?" -> Brain odpovi z cenove strategie
- **Analytics Reporter** se pta: "Jaky je benchmark konverzniho pomeru pro B2B digital signage?" -> Brain odpovi z trnich dat
- **QA Watchdog** se pta: "Je 404 na /pl/produkty/hd226 problem?" -> Brain odpovi na zaklade znalosti katalogu

### 4.2 Komunikacni protokol

Ostatni agenti volaji Brain pres interní n8n sub-workflow:

```
[Agent] -> n8n HTTP Request -> Claude API
                                  |
                                  +-> System prompt: agent-brightsign-specialist.md
                                  +-> Knowledge context: brightsign-knowledge-base.md
                                  +-> User query: specificka otazka agenta
                                  |
                              <---+-- Strukturovana odpoved (JSON)
```

### 4.3 Co Brain ví (souhrn)

1. Kompletni produktovy katalog (Serie 4, 5, 6) -- specifikace, ceny, use cases
2. Cenova strategie per trh (CZ, SK, PL, EU) a srovnání s konkurenci
3. BrightSign ekosystem (BrightSignOS, BrightAuthor:connected, BSN.cloud)
4. Zarucni podminky (5 let na S5/S6 od 1.1.2025)
5. COMM-TEC dodavatelsky retezec (ceny, dodaci lhuty, objednavani)
6. FAQ a technicka podpora (30+ Q&A)
7. Use cases a doporucene konfigurace per vertikala
8. Konkurencni landscape per trh

---

## 5. AGENT 2: ORDER PROCESSOR

### 5.1 Trigger
Medusa event `order.placed` -> n8n webhook `/webhook/order-placed`

### 5.2 Workflow

```
order.placed
    |
    v
[1] Extrakce dat objednavky
    - order_id, items[], customer, shipping_address, payment_method
    |
    v
[2] Validace objednavky
    - Vsechny polozky maji platne SKU?
    - Fakturacni udaje kompletni?
    - B2B zakaznik? -> aplikovat slevu
    |
    v
[3] Dotaz na BrightSign Brain
    - "Jaky je COMM-TEC SKU pro HD226?"
    - "Jaka je aktualni cena u COMM-TEC?"
    |
    v
[4] Vytvoreni COMM-TEC objednavky
    - Email na COMM-TEC s objednavkou (sablona)
    - Nebo: API call pokud bude k dispozici
    |
    v
[5] Cekani na platbu (pro bank transfer)
    - Medusa event: order.payment_captured
    - Nebo: timeout 7 dni -> cancel
    |
    v
[6] Vytvoreni Packeta zasilky
    - API: POST https://www.zasilkovna.cz/api/rest
    - Data: jmeno, adresa, hmotnost, vydejni misto
    |
    v
[7] Generovani stitku (label PDF)
    - Packeta API -> PDF label
    - Ulozeni do MinIO
    |
    v
[8] Aktualizace Medusa
    - Order status: "processing" -> "shipped"
    - Metadata: packeta_id, tracking_number, tracking_url
    |
    v
[9] Notifikace zakaznikovi
    - Email pres Resend: "Vase objednavka byla odeslana"
    - Tracking link
    |
    v
[10] Notifikace Danovi
     - Telegram: "Nova objednavka #1234, 14,900 CZK, HD225, Packeta 123456"
```

### 5.3 COMM-TEC objednavkovy email (sablona)

```
Predmet: BrightSight Order #{order_id} - {date}

Dobry den,

prosim o objednani nasledujicich polozek:

{items_table}
| SKU | Model | Mnozstvi |
|-----|-------|----------|

Dorucovaci adresa:
Make more s.r.o.
{address}

Fakturacni udaje:
Make more s.r.o.
ICO: {ico}
DIC: {dic}

Dekuji,
Dan
BrightSight / Make more s.r.o.
```

### 5.4 Error handling

| Chyba | Akce |
|-------|------|
| Polozka neni na sklade u COMM-TEC | Notifikace Dan, email zakaznikovi s odhadem dodani |
| Packeta API selhala | Retry 3x, pak manualni notifikace Dan |
| Platba neprisla do 7 dni | Auto-cancel + email zakaznikovi |
| Neplatna adresa | Notifikace Dan + email zakaznikovi |

---

## 6. AGENT 3: STOCK MONITOR

### 6.1 Trigger
Cron: 06:00 a 18:00 CET denne

### 6.2 Workflow

```
Cron trigger
    |
    v
[1] Prihlaseni do COMM-TEC portalu
    - HTTP request s credentials
    - Session cookie pro dalsi requesty
    |
    v
[2] Scrapovani produktovych stranek
    - Vsechny BrightSign modely
    - Parsovani: SKU, nazev, skladem (ano/ne/pocet), cena EUR
    |
    v
[3] Porovnani s predchozim stavem
    - Nacist posledni snapshot z n8n databaze
    - Diff: zmeny cen, zmeny skladu
    |
    v
[4] Aktualizace Medusa inventare
    - API: PUT /admin/inventory-items/{id}
    - Aktualizovat inventory_quantity
    |
    v
[5] Cenova alerta
    - Pokud COMM-TEC zvysil cenu > 5% -> alerta
    - Dotaz na Brain: "Jaka je nase marze pri nove cene X?"
    - Doporuceni: "Zvysit nasi cenu o Y" nebo "Absorbovat, marze stale OK"
    |
    v
[6] Report
    - Denne: kratky souhrn (pocet na sklade, zmeny)
    - Tydenne (pondeli): kompletni stock + price report
    - Alerta: okamzite pri kriticke zmene (out of stock, price change > 10%)
    |
    v
[7] Notifikace
    - Telegram pri alerte
    - Email pri tydenim reportu
```

### 6.3 Tydeni competitive price scan (pondeli 20:00)

Krome COMM-TEC Stock Monitor 1x tydne kontroluje ceny konkurence:

| Web | Co scrapovat | Klicove produkty |
|-----|-------------|------------------|
| ab-com.cz | BrightSign sekce | HD226, XD236 |
| daars.pl | BrightSign kategorie | HD225, XD235 |
| supertech.pl | BrightSign produkty | HD225, XD235 |
| brightsign-shop.eu | Vsechny produkty | HD226, XD236 |

Vystup jde do BrightSign Brain pro aktualizaci knowledge base.

---

## 7. AGENT 4: QA WATCHDOG

### 7.1 Trigger
- Cron: kazdych 5 minut (uptime ping)
- Cron: denne 12:00 (rozsireny health check)
- Error events z Sentry (pokud nakonfigurovano)

### 7.2 Monitoring matice

| Co monitoruje | Jak | Frekvence | Alerta pri |
|--------------|-----|-----------|------------|
| Homepage dostupnost | HTTP GET https://brightsign.cz | 5 min | Status != 200 |
| API dostupnost | HTTP GET https://api.brightsign.cz/health | 5 min | Status != 200 |
| SSL certifikat | TLS check | Denne | Expirace < 14 dni |
| Checkout flow | Synthetic test (add to cart -> checkout page) | Denne | Selhani |
| Product pages | Random 5 produktu -> HTTP GET | Denne | 404 nebo prazdna data |
| Stripe webhook | Kontrola posledniho eventu v Meduse | Denne | Zadny event > 24h (po launchi) |
| Packeta API | Health check endpoint | Denne | Nedostupna |
| Database | Medusa admin API response time | 5 min | Response > 5s |
| Disk space VPS | SSH command df -h | Denne | Vyuziti > 85% |
| RAM VPS | SSH command free -m | Denne | Vyuziti > 90% |
| Docker containers | docker ps + zdravi | Denne | Container restarted / unhealthy |
| i18n kompletnost | Porovnani klicu cs.json vs ostatni | Tydenne | Chybejici klice |
| Broken links | Crawl hlavnich stranek | Tydenne | 404 odkazy |

### 7.3 Alertovaci pravidla

| Severity | Kanal | Reakcni cas |
|----------|-------|-------------|
| CRITICAL (site down, payment broken) | Telegram + Email + zvuk | < 15 min |
| WARNING (high latency, disk 85%+) | Telegram | < 1 hodina |
| INFO (minor issues, cert renewal) | Denni report email | Dalsi pracovni den |

### 7.4 Denni health report (12:00)

```
=== BrightSight Health Report ===
Datum: 2026-03-15 12:00 CET

UPTIME (24h): 100%
API RESPONSE: avg 230ms, p99 890ms
ERRORS (24h): 0 critical, 2 warnings

CONTAINERS:
  backend:    healthy (uptime 14d 3h)
  storefront: healthy (uptime 14d 3h)
  postgres:   healthy (connections: 12/100)
  redis:      healthy (memory: 78MB/512MB)
  minio:      healthy (disk: 2.1GB/40GB)

SSL: brightsign.cz expires 2026-06-15 (92 days)
DISK: 34% used (13.6GB / 40GB)
RAM: 62% used (5.0GB / 8GB)

ISSUES: None
```

---

## 8. AGENT 5: ANALYTICS REPORTER

### 8.1 Trigger
- Cron: denne 07:00 (denni report)
- Cron: pondeli 08:00 (tydenni report)
- Manualni: na pozadani pres Telegram command

### 8.2 Datove zdroje

| Zdroj | Metoda | Data |
|-------|--------|------|
| Medusa API | HTTP GET `/store/ai-buddy/dashboard` | Objednavky, revenue, inventory |
| Medusa API | HTTP GET `/store/ai-buddy/revenue` | Revenue breakdown per region |
| Medusa API | HTTP GET `/store/ai-buddy/orders` | Detaily objednavek |
| GA4 | Google Analytics Data API (nebo BigQuery export) | Traffic, konverze, bounce rate |
| Stripe | Stripe API | Platby, refundy, poplatky |
| Google Ads | Google Ads API (pokud aktivni) | Spend, CPC, ROAS |

### 8.3 Denni report format

```
=== BrightSight Daily Report ===
Datum: 2026-03-15

REVENUE:
  Vcera: 1,240 EUR (2 objednavky)
  Tento tyden: 4,560 EUR (7 objednavek)
  Tento mesic: 12,340 EUR (19 objednavek)

TOP PRODUKTY (vcera):
  1. HD226 (2x) - 1,340 EUR
  2. LS425 (1x) - 361 EUR

KONVERZE:
  Sessions: 145
  Add to cart: 12 (8.3%)
  Checkout started: 8 (5.5%)
  Purchase: 2 (1.4%)

PO TRZICH:
  CZ: 890 EUR (72%)
  PL: 350 EUR (28%)
  SK: 0 EUR

B2B vs B2C:
  B2B: 1 objednavka (890 EUR)
  B2C: 1 objednavka (350 EUR)

POZNATKY:
  - Konverzni pomer pod cilem (1.4% vs 3% cil)
  - PL traffic roste (+23% W/W)
  - HD226 nejprodavanejsi 3. tyden v rade
```

### 8.4 Tydenni report (rozsireny)

Tydenni report pridava:
- **Trendy:** Week-over-week porovnani (revenue, traffic, konverze)
- **Funnel analyza:** Kde zakaznici odchazi
- **Cenova analyza:** Dotaz na Brain pro competitive positioning
- **Doporuceni:** AI-generovana doporuceni na zaklade dat (Claude API)
- **Google Ads performance** (pokud aktivni): spend, CPC, ROAS, top keywords
- **SEO:** Nova indexace, organic traffic trend

---

## 9. SDILENA KNOWLEDGE BASE

### 9.1 Struktura

```
data/
  brightsign-knowledge-base.md    <- Hlavni knowledge base (Brain)
  price-overrides.json            <- Cenova matice vsech produktu
  competitive-prices/             <- Historie cen konkurence (Stock Monitor output)
    2026-03-W11.json
    2026-03-W12.json

docs/
  agent-brightsign-specialist.md  <- Brain system prompt
  AI-OPERATIONS.md                <- Tento dokument
  ceo-konkurence.md               <- Konkurencni analyza
```

### 9.2 Jak agenti pristupuji ke knowledge base

1. **BrightSign Brain** -- ma knowledge base nactenu v system promptu. Je autoritativni zdroj.
2. **Ostatni agenti** -- volaji Brain pres n8n sub-workflow kdyz potrebuji informace.
3. **Stock Monitor** -- ZAPISUJE do knowledge base (aktualizuje ceny konkurence, stav skladu).
4. **Analytics Reporter** -- CITA z knowledge base (benchmarky, cile) a ZAPISUJE zpet (aktualizace trnich trendov).

### 9.3 Aktualizacni cyklus

```
Stock Monitor (denne) -----> Aktualizuje COMM-TEC ceny a stock
                       -----> Aktualizuje competitive prices (tydenne)
                                    |
                                    v
BrightSign Brain <---- Nacita aktualizovana data
                                    |
                                    v
Analytics Reporter <---- Pta se Brain na kontext
                   -----> Aktualizuje business metriky
                                    |
                                    v
Dan <---- Dostava reporty s kontextem a doporucenimi
```

---

## 10. WORKFLOW PRIKLADY

### 10.1 Nova objednavka (end-to-end)

```
Zakaznik klikne "Objednat" na brightsign.cz
    |
    v
Stripe zpracuje platbu -> webhook -> Medusa
    |
    v
Medusa emituje `order.placed` -> n8n webhook
    |
    v
ORDER PROCESSOR:
  1. Extrahuje data objednavky
  2. Pta se BRAIN: "COMM-TEC SKU pro HD226?"
  3. Odesle email na COMM-TEC s objednavkou
  4. Vytvori Packeta zasilku (API)
  5. Aktualizuje Medusa (tracking number)
  6. Odesle email zakaznikovi (Resend)
  7. Odesle Telegram alert Danovi

Cas: < 5 minut od objednavky do odeslani COMM-TEC emailu
```

### 10.2 Platba bankovnim prevodem

```
Zakaznik zvoli "Bankovy prevod"
    |
    v
Medusa vytvori objednavku se statusem "awaiting_payment"
    |
    v
ORDER PROCESSOR:
  1. Odesle proforma fakturu zakaznikovi (Resend)
  2. Nastavi timer: 7 dni timeout
    |
    v
--- Zakaznik posle platbu ---
    |
    v
Stripe (bank_transfer) zachyti platbu -> `order.payment_captured`
    |
    v
ORDER PROCESSOR (pokracovani):
  3. Odesle COMM-TEC objednavku
  4. Vytvori Packeta zasilku
  5. ... (stejne jako u karty)
    |
    v
--- ALTERNATIVA: Timeout 7 dni ---
    |
    v
ORDER PROCESSOR:
  - Auto-cancel objednavky
  - Email zakaznikovi: "Platba neprijata, objednavka zrusena"
  - Telegram alert Dan
```

### 10.3 Denni report (automaticky)

```
Cron 07:00 CET
    |
    v
ANALYTICS REPORTER:
  1. Nacte data z Medusa AI Buddy API
  2. Nacte GA4 data (sessions, konverze)
  3. Nacte Stripe data (platby, poplatky)
    |
    v
  4. Pta se BRAIN: "Jaky je nas cilovy konverzni pomer?"
  5. Pta se BRAIN: "Jaky je benchmark pro B2B digital signage?"
    |
    v
  6. Generuje report (Claude API)
  7. Odesle na Telegram + email
```

### 10.4 Zmena ceny u konkurence

```
Stock Monitor (pondeli 20:00) -> competitive price scan
    |
    v
Detekuje: daars.pl snizil HD225 z 3,099 na 2,799 PLN
    |
    v
STOCK MONITOR:
  1. Ulozi novou cenu do competitive-prices/
  2. Pta se BRAIN: "Jaka je nase PL cena HD225?"
  3. BRAIN odpovi: "2,499 PLN, marze 28%"
  4. STOCK MONITOR: "Stale jsme levnejsi o 12%, marze OK"
    |
    v
  5. Generuje alert: "Konkurent daars.pl snizil HD225 o 10%. My stale -12% levnejsi."
  6. Telegram alert Dan (INFO severity)
```

### 10.5 E-shop nefunguje

```
QA WATCHDOG (kazdych 5 min) -> HTTP GET https://brightsign.cz
    |
    v
Odpoved: timeout / 500 / connection refused
    |
    v
QA WATCHDOG:
  1. Retry za 30 sekund
  2. Stale nefunguje -> CRITICAL alert
    |
    v
  3. Kontrola Docker containeru (SSH command)
  4. Kontrola RAM/disk (SSH command)
  5. Identifikace problemu: "storefront container restarted, OOM killed"
    |
    v
  6. Telegram CRITICAL alert:
     "SITE DOWN: brightsign.cz nereaguje >1 min.
      Pricina: storefront OOM killed.
      Doporuceni: restart container nebo upgrade RAM."
    |
    v
  7. Pokus o auto-recovery: docker restart brightsign-storefront
  8. Overeni: HTTP GET brightsign.cz -> 200 OK
  9. Telegram: "Vyreseno: storefront restartovan, site OK."
```

---

## 11. TECHNICKE POZADAVKY

### 11.1 n8n credentials

| Credential | Typ | Agent |
|-----------|-----|-------|
| Medusa Admin API | HTTP Header Auth (x-medusa-access-token) | Vsichni |
| Medusa AI Buddy | Bearer token (AI_BUDDY_API_KEY) | Analytics Reporter |
| Claude API | API Key (Anthropic) | Brain, Analytics Reporter |
| Telegram Bot | Bot Token + Chat ID | Vsichni (notifikace) |
| Stripe API | Secret Key | Analytics Reporter |
| Packeta API | API Password | Order Processor |
| COMM-TEC Portal | Username + Password | Stock Monitor |
| Resend API | API Key | Order Processor |
| VPS SSH | SSH Key | QA Watchdog |
| GA4 | Service Account JSON | Analytics Reporter |

### 11.2 Environment variables pro n8n

```env
# Medusa
MEDUSA_URL=https://api.brightsign.cz
MEDUSA_ADMIN_TOKEN=sk_...
AI_BUDDY_API_KEY=...

# Claude
CLAUDE_API_KEY=sk-ant-...

# Telegram
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...

# Stripe
STRIPE_SECRET_KEY=sk_live_...

# Packeta
PACKETA_API_PASSWORD=...

# COMM-TEC
COMMTEC_USERNAME=...
COMMTEC_PASSWORD=...

# Resend
RESEND_API_KEY=re_...

# VPS SSH
VPS_HOST=91.99.49.122
VPS_SSH_KEY=/path/to/key

# GA4
GA4_PROPERTY_ID=...
GA4_SERVICE_ACCOUNT_JSON=...
```

### 11.3 Bezpecnostni pravidla

1. **n8n je za Traefik proxy** -- HTTPS only, basic auth
2. **n8n je pristupny pouze z VPN/whitelist IP** -- ne verejne
3. **Credentials v n8n encrypted** -- n8n native credential encryption
4. **Webhook endpointy** -- validace HMAC signature z Medusa
5. **SSH pristup z n8n** -- dedicated SSH key s omezenymi pravy
6. **Claude API** -- rate limiting, max tokens per request
7. **Logy** -- vsechny workflow execution logy uchovavat 30 dni

---

## 12. IMPLEMENTACNI PLAN

### Faze 1: Zaklad (tyden 1 po launchi)
- [ ] Deploy n8n na VPS (docker-compose)
- [ ] Nastavit Telegram bota
- [ ] QA Watchdog: uptime monitoring (5min ping)
- [ ] Order Processor: zakladni notifikace (Telegram alert pri nove objednavce)

### Faze 2: Automatizace (tyden 2-3)
- [ ] Order Processor: COMM-TEC email sablona (automaticky odeslany)
- [ ] Order Processor: Packeta API integrace (label generovani)
- [ ] Analytics Reporter: denni report z AI Buddy API
- [ ] QA Watchdog: rozsireny health check (denne)

### Faze 3: Intelligence (mesic 2)
- [ ] BrightSign Brain: plny system prompt + knowledge base
- [ ] Stock Monitor: COMM-TEC stock scraping
- [ ] Stock Monitor: competitive price scan (tydenne)
- [ ] Analytics Reporter: tydenni report s doporucenimi (Claude API)

### Faze 4: Pokrocile (mesic 3+)
- [ ] Customer support chatbot (Brain na frontendu)
- [ ] Automaticky abandoned cart email flow
- [ ] Automaticky review request po doruceni
- [ ] Automaticky content generation (blog clanky draft)

---

## 13. NAKLADY

| Polozka | Mesicni naklad |
|---------|---------------|
| n8n (self-hosted) | 0 EUR |
| Claude API (Brain + Reporter) | ~10-30 EUR (odhad 1000-3000 requestu/mes) |
| Telegram Bot | 0 EUR |
| GA4 API | 0 EUR |
| Stripe API | 0 EUR (zahrnuty v platebních poplatcich) |
| **Celkem** | **~10-30 EUR/mesic** |

Pri 175 objednavkach/rok (konzervativni scenar) je to ~0.07-0.20 EUR za objednavku na AI operace.

---

## 14. METRIKY USPECHU AI OPERATIONS

| Metrika | Cil | Mereni |
|---------|-----|--------|
| Order processing time | < 5 min (od platby do COMM-TEC emailu) | n8n execution log |
| Uptime detection | < 2 min (od vypadku do alertu) | QA Watchdog log |
| Daily report delivery | 100% (kazdy den v 07:00) | n8n schedule log |
| Stock sync accuracy | > 95% | Manualni spot check mesicne |
| False positive alerts | < 5% | Manualni review |
| Dan manual intervention | < 20% objednavek | Order Processor log |

---

*Dokument pripravil CEO Agent na zaklade analyzy projektu BrightSight. Implementace zavisi na soft launch a dostupnosti VPS.*
