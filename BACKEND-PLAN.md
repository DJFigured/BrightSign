# Backend Hardening Plan — BrightSign EU E-shop

**Datum:** 2026-02-21
**Medusa verze:** 2.13.1 (aktuální, upgrade nepotřeba)
**Cíl:** Připravit backend na produkční provoz

---

## Přehled sessions

| # | Session | Soubory | Odhad | Riziko |
|---|---------|---------|-------|--------|
| 1 | Security fixes | medusa-config.ts, .env.template | 15 min | Nízké |
| 2 | Production moduly (Redis) | medusa-config.ts, .env.template, docker-compose.prod.yml | 30 min | Střední |
| 3 | Stripe konfigurace | medusa-config.ts, smazat webhook route | 15 min | Nízké |
| 4 | S3/MinIO file storage | medusa-config.ts, .env.template | 30 min | Střední |
| 5 | Email systém | src/modules/resend/, src/subscribers/, medusa-config.ts | 60 min | Střední |
| 6 | Cleanup + hardcoded values | email templates, stub routes | 20 min | Nízké |
| **Celkem** | | | **~3 hod** | |

---

## Nový kritický nález: Chybějící production moduly

Audit identifikoval Stripe a emaily, ale MCP server odhalil větší problém. Medusa v2 deployment guide explicitně doporučuje tyto moduly pro produkci:

| Modul | Máme? | Dopad pokud chybí |
|-------|-------|-------------------|
| Redis Event Bus | ✅ Ano | — |
| Redis Cache | ⚠️ Deprecated verze | `cache-redis` je deprecated od v2.11.0, nový je `caching` s `caching-redis` providerem |
| Workflow Engine Redis | ❌ Ne (in-memory!) | **Workflows se ztratí při restartu kontejneru!** Objednávky, platby, fulfillment — vše může selhat |
| Redis Locking | ❌ Ne | Race conditions při souběžných objednávkách, duplicitní operace |
| S3 File Provider | ❌ Ne (local) | Soubory se mohou ztratit, local provider je jen pro dev |
| Notification Provider | ❌ Ne | Žádné emaily se neposílají |

**Workflow Engine in-memory je nejkritičtější problém.** Pokud se backend restartuje uprostřed checkout workflow (platba → objednávka), workflow se ztratí a zákazník zaplatí ale objednávka se nevytvoří.

---

## Session 1: Security Fixes

### Co se řeší
- JWT a Cookie secrets defaultují na `"supersecret"` — pokud env var chybí, sessions jsou predikovatelné
- `.env.template` má `JWT_SECRET=supersecret` jako příklad — nebezpečné při copy-paste

### Soubory
- `backend/medusa-config.ts` (řádky 13-14)
- `backend/.env.template` (řádky 5-6)

### Prompt pro Claude Code session

```
Uprav backend security konfiguraci v BrightSign projektu.

## Úkol 1: medusa-config.ts
Soubor: backend/medusa-config.ts, řádky 13-14

Aktuální stav:
jwtSecret: process.env.JWT_SECRET || "supersecret",
cookieSecret: process.env.COOKIE_SECRET || "supersecret",

Změň na:
jwtSecret: process.env.JWT_SECRET || (() => { throw new Error("JWT_SECRET environment variable is required") })(),
cookieSecret: process.env.COOKIE_SECRET || (() => { throw new Error("COOKIE_SECRET environment variable is required") })(),

## Úkol 2: .env.template
Soubor: backend/.env.template, řádky 5-6

Aktuální stav:
JWT_SECRET=supersecret
COOKIE_SECRET=supersecret

Změň na komentáře s instrukcí:
# JWT_SECRET=<generate with: openssl rand -hex 32>
# COOKIE_SECRET=<generate with: openssl rand -hex 32>

## Nic jiného neměň.
```

### Ověření
1. `cd backend && npx medusa start` BEZ nastavených env vars → musí crashnout s chybou "JWT_SECRET environment variable is required"
2. S nastavenými env vars → musí normálně nastartovat
3. Na VPS: ověřit že `.env.production` má reálné hodnoty (ne "supersecret")

### Riziko
- **Nízké.** Pokud VPS `.env.production` nemá JWT_SECRET, backend po deployi nenastartuje. Ověřit PŘED deployem.

### Kontrola VPS
```bash
ssh root@91.99.49.122 "grep JWT_SECRET /root/brightsign/.env.production"
ssh root@91.99.49.122 "grep COOKIE_SECRET /root/brightsign/.env.production"
```
Pokud obsahují "supersecret", vygenerovat nové:
```bash
ssh root@91.99.49.122 "sed -i 's/JWT_SECRET=supersecret/JWT_SECRET='$(openssl rand -hex 32)'/' /root/brightsign/.env.production"
ssh root@91.99.49.122 "sed -i 's/COOKIE_SECRET=supersecret/COOKIE_SECRET='$(openssl rand -hex 32)'/' /root/brightsign/.env.production"
```

---

## Session 2: Production Moduly (Workflow Engine, Locking, Caching)

### Co se řeší
Přidání 3 chybějících Redis modulů doporučených pro produkci:
1. **Workflow Engine Redis** — persistence workflow stavů přes restarty
2. **Locking Redis** — prevence race conditions
3. **Caching Redis** (upgrade) — nahrazení deprecated `cache-redis`

### Soubory
- `backend/medusa-config.ts` — přidat moduly
- `backend/.env.template` — přidat env vars
- `backend/package.json` — ověřit že balíčky jsou součástí `@medusajs/medusa` (v2.13.1 je má built-in)

### Prompt pro Claude Code session

```
Přidej chybějící production Redis moduly do Medusa backendu.

## Kontext
Medusa v2 deployment guide vyžaduje pro produkci tyto Redis moduly:
- Workflow Engine Redis (@medusajs/medusa/workflow-engine-redis)
- Locking Redis (@medusajs/medusa/locking-redis)
- Caching Redis (@medusajs/medusa/caching s @medusajs/caching-redis providerem)

Aktuálně máme jen event-bus-redis a DEPRECATED cache-redis.

## Úkol: medusa-config.ts
Soubor: backend/medusa-config.ts

V `modules` poli:

1. NAHRAĎ deprecated cache-redis:
Starý (smaž):
{
  resolve: "@medusajs/medusa/cache-redis",
  options: {
    redisUrl: process.env.REDIS_URL,
  },
},

Nový (přidej):
{
  resolve: "@medusajs/medusa/caching",
  options: {
    providers: [
      {
        resolve: "@medusajs/caching-redis",
        id: "caching-redis",
        is_default: true,
        options: {
          redisUrl: process.env.REDIS_URL,
        },
      },
    ],
  },
},

2. PŘIDEJ Workflow Engine Redis (za event-bus-redis):
{
  resolve: "@medusajs/medusa/workflow-engine-redis",
  options: {
    redis: {
      redisUrl: process.env.REDIS_URL,
    },
  },
},

3. PŘIDEJ Locking Redis (za workflow engine):
{
  resolve: "@medusajs/medusa/locking",
  options: {
    providers: [
      {
        resolve: "@medusajs/medusa/locking-redis",
        id: "locking-redis",
        is_default: true,
        options: {
          redisUrl: process.env.REDIS_URL,
        },
      },
    ],
  },
},

Všechny tři používají stejný REDIS_URL jako event-bus-redis.

## .env.template
Nepotřebuje změny — REDIS_URL tam už je a všechny moduly ho sdílí.

## Nic jiného neměň. Zejména NEMĚŇ event-bus-redis, file provider, payment provider ani projectConfig.
```

### Ověření
1. `cd backend && npx medusa start` lokálně — musí nastartovat bez chyb
2. V logu hledat:
   - `Connection to Redis in "caching-redis" provider established`
   - `Connection to Redis in "locking-redis" provider established`
   - Žádné deprecation warnings pro cache-redis
3. Na VPS po deployi: `docker logs brightsign-backend-1 2>&1 | grep -i "redis\|workflow\|locking\|caching"`

### Riziko
- **Střední.** Deprecated `cache-redis` → `caching` je breaking change v konfiguraci (jiná struktura). Pokud Medusa 2.13.1 ještě nepodporuje nový formát, build selže — ale je to ověřitelné lokálně před deployem.
- Workflow Engine Redis potřebuje BullMQ — je součástí `@medusajs/medusa` v2.13.1, nemusí se instalovat zvlášť.
- Všechny moduly sdílí jeden Redis server — na našem VPS (7.5GB RAM) OK, ale Redis by měl mít persistence zapnutou.

### Kontrola Redis persistence na VPS
```bash
ssh root@91.99.49.122 "docker exec brightsign-redis-1 redis-cli CONFIG GET save"
# Mělo by vrátit save pravidla, ne prázdný string
```

---

## Session 3: Stripe Konfigurace

### Co se řeší
1. Přidat `webhookSecret` do Stripe provider options
2. Smazat custom webhook handler (Medusa má built-in na `/hooks/payment/stripe_stripe`)
3. Přidat `capture: true` pro automatický capture (B2C best practice)

### Důležitý kontext z Medusa MCP
- Medusa v2 má **built-in webhook route**: `POST /hooks/payment/stripe_stripe`
- Interně volá `processPaymentWorkflow` který automaticky:
  - Nastaví payment session na `authorized` nebo `captured`
  - Dokončí cart (vytvoří objednávku) pokud ještě nebyl dokončen
  - Emituje `order.placed` a `payment.captured` eventy
- Custom handler na `/api/webhooks/stripe` je **kompletně zbytečný** — Medusa to řeší sama
- Stripe events pro webhook: `payment_intent.succeeded`, `payment_intent.amount_capturable_updated`, `payment_intent.payment_failed`, `payment_intent.requires_action`

### Soubory
- `backend/medusa-config.ts` (řádky 45-58) — přidat webhookSecret + capture
- `backend/src/api/webhooks/stripe/route.ts` — SMAZAT celý soubor
- `backend/src/api/webhooks/` — smazat prázdný adresář pokud nic jiného neobsahuje

### Prompt pro Claude Code session

```
Oprav Stripe konfiguraci v BrightSign Medusa backendu.

## Kontext
Medusa v2 má built-in webhook handler na /hooks/payment/stripe_stripe.
Náš custom handler v src/api/webhooks/stripe/route.ts je zbytečný a potenciálně matoucí.
Medusa automaticky zpracovává Stripe eventy přes processPaymentWorkflow.

## Úkol 1: medusa-config.ts — přidat webhookSecret
Soubor: backend/medusa-config.ts

Najdi Stripe payment provider konfiguraci (aktuálně řádky 45-58) a uprav options:

Aktuální:
options: {
  apiKey: process.env.STRIPE_API_KEY,
}

Nové:
options: {
  apiKey: process.env.STRIPE_API_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  capture: true,
}

## Úkol 2: Smazat custom webhook handler
Smaž soubor: backend/src/api/webhooks/stripe/route.ts
Smaž adresář: backend/src/api/webhooks/stripe/
Pokud backend/src/api/webhooks/ je pak prázdný, smaž i ten.

## Úkol 3: .env.template
Soubor: backend/.env.template
Ověř že STRIPE_WEBHOOK_SECRET je v šabloně (už tam je). Přidej komentář:
# Stripe webhook URL: https://<your-domain>/hooks/payment/stripe_stripe
# Events: payment_intent.succeeded, payment_intent.amount_capturable_updated, payment_intent.payment_failed, payment_intent.requires_action

## Nic jiného neměň.
```

### Ověření
1. `cd backend && npx medusa start` — musí nastartovat
2. Ověřit že `/api/webhooks/stripe` route NEEXISTUJE (curl → 404)
3. Ověřit že `/hooks/payment/stripe_stripe` EXISTUJE (curl POST → 400 nebo jiný non-404)
4. Grep v kódu: `grep -r "webhooks/stripe" backend/src/` — nesmí nic najít

### Riziko
- **Nízké.** Custom handler stejně jen logoval, nic reálného nedělal. Medusa built-in handler je robustnější.
- Na VPS bude potřeba nastavit Stripe webhook URL na `https://<doména>/hooks/payment/stripe_stripe` (až bude doména).

---

## Session 4: S3/MinIO File Storage

### Co se řeší
Přepnutí z Local File Provider (jen pro dev) na S3 provider s MinIO (už běží v docker-compose.prod.yml).

### Důležitý kontext z Medusa MCP
- S3 provider: `@medusajs/medusa/file-s3` (built-in, nemusí se instalovat)
- Pro MinIO nutné: `additional_client_config: { forcePathStyle: true }`
- `file_url`: URL odkud se soubory servírují (pro MinIO: `http://minio:9000/bucket-name`)
- File Module přijímá **pouze jednoho providera** — nelze mít local + S3 současně
- Po přepnutí na S3 se custom route `/uploads/[filename]` stane nepotřebnou (S3 servíruje přímo)

### MinIO v docker-compose.prod.yml (aktuální stav)
```yaml
minio:
  image: minio/minio:latest
  command: server /data --console-address ":9001"
  environment:
    MINIO_ROOT_USER: ${MINIO_ROOT_USER:-brightsign}
    MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD:-CHANGE_ME_STRONG_PASSWORD}
  ports:
    - "9001:9001"
  volumes:
    - minio_data:/data
  healthcheck:
    test: ["CMD", "mc", "ready", "local"]
```

### Rozhodovací bod: Co s custom /uploads route?

**Možnost A: Smazat** — S3/MinIO servíruje soubory přímo přes svou URL
- Pro: Čistší architektura, méně custom kódu
- Proti: Existující produktové obrázky odkazují na `/uploads/...` URL — musely by se re-uploadnout nebo přesměrovat

**Možnost B: Ponechat jako fallback** — pro staré soubory + nové jdou přes S3
- Pro: Zpětná kompatibilita
- Proti: Dva systémy pro soubory

**Doporučení: Možnost A** — ale v SAMOSTATNÉM kroku po migraci existujících souborů do MinIO. Pro tuto session jen přepnout provider, route ponechat.

### Soubory
- `backend/medusa-config.ts` — přepnout file provider
- `backend/.env.template` — upřesnit S3/MinIO vars

### Prompt pro Claude Code session

```
Přepni file storage z Local na S3/MinIO v BrightSign Medusa backendu.

## Kontext
MinIO už běží v docker-compose.prod.yml na portu 9001 (console).
Backend se k MinIO připojuje přes Docker network na minio:9000.
Medusa File Module přijímá POUZE jednoho providera.
Pro MinIO je nutné nastavit forcePathStyle: true.

## Úkol 1: medusa-config.ts — přepnout file provider
Soubor: backend/medusa-config.ts

NAHRAĎ celou sekci file provideru:

Starý (smaž):
{
  resolve: "@medusajs/medusa/file",
  options: {
    providers: [
      {
        resolve: "@medusajs/file-local",
        id: "local",
        options: {
          upload_dir: process.env.FILE_UPLOAD_DIR || "uploads",
          backend_url: `${process.env.BACKEND_URL || "http://localhost:9000"}/uploads`,
        },
      },
    ],
  },
},

Nový:
{
  resolve: "@medusajs/medusa/file",
  options: {
    providers: [
      ...(process.env.S3_ENDPOINT ? [{
        resolve: "@medusajs/medusa/file-s3",
        id: "s3",
        options: {
          file_url: process.env.S3_FILE_URL,
          access_key_id: process.env.S3_ACCESS_KEY,
          secret_access_key: process.env.S3_SECRET_KEY,
          region: process.env.S3_REGION || "us-east-1",
          bucket: process.env.S3_BUCKET || "brightsign-media",
          endpoint: process.env.S3_ENDPOINT,
          additional_client_config: {
            forcePathStyle: true,
          },
        },
      }] : [{
        resolve: "@medusajs/file-local",
        id: "local",
        options: {
          upload_dir: "uploads",
          backend_url: `${process.env.BACKEND_URL || "http://localhost:9000"}/uploads`,
        },
      }]),
    ],
  },
},

Toto umožní: S3 na produkci (kde S3_ENDPOINT je nastavený), Local pro lokální dev (kde není).

## Úkol 2: .env.template — upřesnit S3 vars
Soubor: backend/.env.template

Uprav MinIO sekci:
# MinIO S3 Storage (production only — leave unset for local file storage)
S3_FILE_URL=http://localhost:9000/brightsign-media
S3_ENDPOINT=http://minio:9000
S3_BUCKET=brightsign-media
S3_REGION=us-east-1
S3_ACCESS_KEY=brightsign
S3_SECRET_KEY=CHANGE_ME_STRONG_PASSWORD

## NEMAZAT custom route /uploads/[filename] — zatím nechat pro zpětnou kompatibilitu.
## Nic jiného neměň.
```

### Ověření
1. Lokálně (bez S3_ENDPOINT): `npx medusa start` → musí nastartovat s local file providerem
2. Na VPS (s S3_ENDPOINT): backend musí nastartovat a připojit se k MinIO
3. Upload test přes Admin dashboard: nahrát obrázek produktu → musí se uložit do MinIO bucketu
4. MinIO console (VPS:9001): ověřit že bucket existuje a soubory se tam ukládají

### Riziko
- **Střední.** MinIO bucket `brightsign-media` musí existovat PŘED spuštěním. Vytvořit přes MinIO console nebo CLI:
  ```bash
  ssh root@91.99.49.122 "docker exec brightsign-minio-1 mc mb local/brightsign-media --ignore-existing"
  ssh root@91.99.49.122 "docker exec brightsign-minio-1 mc anonymous set download local/brightsign-media"
  ```
- Existující obrázky (uploadnuté přes local provider) se NEBUDOU servírovat přes S3. Potřeba migrace (samostatný krok).
- `S3_FILE_URL` musí být dostupná z internetu — na VPS to bude `https://<doména>/storage/` nebo přímo MinIO port. Potřeba vyřešit s Caddy proxy.

### MinIO + Caddy proxy (follow-up po doméně)
V Caddyfile přidat:
```
your-domain.com/storage/* {
  reverse_proxy minio:9000
}
```
A `S3_FILE_URL=https://your-domain.com/storage/brightsign-media`

---

## Session 5: Email Systém

### Rozhodovací bod: Raw Resend API vs Notification Module

| | Raw Resend API (aktuální) | Notification Module + Resend Provider |
|-|--------------------------|--------------------------------------|
| **Stav** | Hotové: email.ts, 3 šablony, 3 subscribery (zakomentované) | Potřeba vytvořit: src/modules/resend/ s service.ts |
| **Práce** | 15 min — odkomentovat volání v subscriberech | 60 min — vytvořit module, přepsat subscribery |
| **Medusa integrace** | Žádná — obchází Medusa notification systém | Plná — notifikace v DB, Medusa events, audit trail |
| **Šablony** | Vlastní HTML v .ts souborech | Mohou být React komponenty nebo HTML |
| **Rozšiřitelnost** | Manuální — přidat nový email = nová funkce + šablona | Standardní — `notificationModuleService.createNotifications()` |
| **Admin viditelnost** | Nic — emaily nejsou v admin panelu | Medusa ukládá notifikace do DB |
| **Resend dashboard** | Ano — viditelné v Resend | Ano — stejné |

### Doporučení: Fázovaný přístup

**Teď (Session 5A): Odkomentovat raw Resend API volání** — 15 minut, okamžitě funkční emaily.

**Později (po launchi, Session 5B): Migrovat na Notification Module** — čistší architektura, ale není launch blocker.

Důvod: Notification Module vyžaduje vytvoření custom Resend providera (Medusa nemá built-in Resend provider — je jen tutorial). To je víc práce a pro launch to není kritické. Emaily přes raw API fungují stejně dobře.

### Session 5A: Aktivace emailů přes raw Resend API

### Soubory
- `backend/src/subscribers/order-placed.ts` (řádky 26-28) — odkomentovat
- `backend/src/subscribers/b2b-registered.ts` (řádky 35-37) — odkomentovat
- `backend/src/subscribers/order-payment-captured.ts` (řádky 31-32) — přidat volání
- `backend/src/jobs/vies-retry.ts` (řádek 77) — odkomentovat
- `backend/src/lib/email.ts` — beze změn (už funguje s RESEND_API_KEY)

### Prompt pro Claude Code session

```
Aktivuj email notifikace v BrightSign Medusa backendu.

## Kontext
Email systém je kompletně připravený:
- backend/src/lib/email.ts — Resend REST API wrapper (funguje, testován)
- backend/src/lib/email-templates/ — 3 HTML šablony (order-confirmation, b2b-welcome, b2b-validated)
- Subscribery mají TODO komentáře a zakomentovaný kód

Email.ts automaticky fallbackuje na console.log pokud RESEND_API_KEY není nastavený.

## Úkol 1: order-placed.ts
Soubor: backend/src/subscribers/order-placed.ts

Najdi TODO komentář a zakomentovaný import (kolem řádků 26-28).
Přidej na začátek souboru import:
import { sendOrderConfirmation } from "../lib/email"

Přidej PŘED konec handleru (před uzavírací závorku funkce):
// Send order confirmation email
const customerEmail = order.email
if (customerEmail) {
  await sendOrderConfirmation({
    to: customerEmail,
    orderId: order.display_id?.toString() || order.id,
    items: (order.items || []).map((item: any) => ({
      title: item.title || item.product_title || "Produkt",
      quantity: item.quantity,
      price: item.unit_price * item.quantity,
    })),
    total: formattedTotal,
    currency: order.currency_code?.toUpperCase() || "CZK",
  }).catch((err: any) => logger.error(`[Order Email] Failed: ${err.message}`))
}

Smaž TODO komentář a zakomentovaný kód.

## Úkol 2: b2b-registered.ts
Soubor: backend/src/subscribers/b2b-registered.ts

Najdi TODO komentář (kolem řádků 35-37).
Přidej na začátek import:
import { sendB2BWelcome } from "../lib/email"

Přidej PŘED konec handleru:
// Send B2B welcome email
await sendB2BWelcome({
  to: customer.email,
  companyName: metadata.company_name as string || "",
  vatId: metadata.vat_id as string || "",
  vatStatus: (metadata.vat_status as string) || "pending",
}).catch((err: any) => logger.error(`[B2B Email] Welcome failed: ${err.message}`))

Smaž TODO komentář.

## Úkol 3: vies-retry.ts
Soubor: backend/src/jobs/vies-retry.ts

Najdi TODO komentář (kolem řádku 77).
Přidej na začátek import:
import { sendB2BValidated } from "../lib/email"

Na místě TODO přidej:
await sendB2BValidated({
  to: customer.email,
  companyName: (customer.metadata?.company_name as string) || "",
}).catch((err: any) => logger.error(`[VIES Email] Validation email failed: ${err.message}`))

## Úkol 4: order-payment-captured.ts
Soubor: backend/src/subscribers/order-payment-captured.ts

Tento subscriber aktuálně jen loguje. Přidej admin notifikaci:
Přidej na začátek import:
import { sendEmail } from "../lib/email"

Před konec handleru přidej:
// Notify admin about new order to fulfill
await sendEmail({
  to: process.env.ADMIN_EMAIL || "obchod@brightsign.cz",
  subject: `Nová objednávka k vyřízení #${order.display_id || order.id}`,
  html: `<p>Objednávka <strong>#${order.display_id || order.id}</strong> byla zaplacena.</p><p>Celkem: ${formattedTotal} ${order.currency_code?.toUpperCase()}</p><p>Vyřiďte objednávku v <a href="${process.env.BACKEND_URL || "http://localhost:9000"}/app/orders/${order.id}">Admin panelu</a>.</p>`,
}).catch((err: any) => logger.error(`[Admin Email] Failed: ${err.message}`))

## DŮLEŽITÉ:
- Každý email volej s .catch() aby selhání emailu nesblokovalo handler
- Neměň signatury email funkcí v email.ts — ověř že parametry odpovídají
- Přečti si email.ts a email šablony PŘED úpravami aby ses ujistil o správných parametrech

## Nic jiného neměň.
```

### Ověření
1. `cd backend && npx tsc --noEmit` — žádné type chyby
2. Lokálně bez RESEND_API_KEY: emaily se logují do konzole (fallback)
3. S testovacím RESEND_API_KEY: poslat testovací objednávku → email dorazí
4. Testovat: vytvořit B2B registraci přes `/store/b2b/register` → welcome email

### Riziko
- **Nízké.** Email.ts má built-in fallback na console.log. Každé volání je v .catch() takže selhání emailu nezastaví handler.
- Potřeba ověřit přesné parametry `sendOrderConfirmation`, `sendB2BWelcome`, `sendB2BValidated` — prompt říká přečíst si email.ts nejdříve.

### .env.template — přidat ADMIN_EMAIL
```
ADMIN_EMAIL=obchod@brightsign.cz
```

---

## Session 6: Cleanup + Hardcoded Values

### Co se řeší
1. Hardcoded URLs v email šablonách (brightsign-shop.cz)
2. Hardcoded company info (IČO, telefon)
3. Stub routes (admin/custom, store/custom)
4. Placeholder telefon v b2b-welcome.ts

### Soubory
- `backend/src/lib/email-templates/b2b-welcome.ts` (řádky 64, 72)
- `backend/src/lib/email-templates/b2b-validated.ts` (řádky 48, 56)
- `backend/src/lib/email-templates/order-confirmation.ts` (řádky 80, 88)
- `backend/src/api/admin/custom/route.ts` — zvážit smazání
- `backend/src/api/store/custom/route.ts` — zvážit smazání

### Prompt pro Claude Code session

```
Vyčisti hardcoded hodnoty v BrightSign backend email šablonách.

## Kontext
Email šablony mají hardcoded URL a company info. Přepni na env vars s rozumnými fallbacky.

## Úkol 1: Všechny 3 email šablony
V každé šabloně najdi a nahraď:

1. "https://brightsign-shop.cz/katalog" → nahraď za parametr catalogUrl
   - Přidej catalogUrl jako parametr funkce s default hodnotou process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/katalog` : "https://brightsign-shop.cz/katalog"

2. "+420 xxx xxx xxx" (placeholder telefon v b2b-welcome.ts:72) → nahraď za "+420 123 456 789" (nebo process.env.COMPANY_PHONE || "+420 123 456 789")

3. Company info (Make more s.r.o. | IČO: ...) — PONECH hardcoded, tohle se nemění a env var by bylo over-engineering.

## Úkol 2: Stub routes
Soubory:
- backend/src/api/admin/custom/route.ts (9 řádků, vrací 200)
- backend/src/api/store/custom/route.ts (9 řádků, vrací 200)

Tyto routes jsou stubs bez funkce. PONECH je — mohou sloužit jako health check endpointy a nerozbijí nic.

## .env.template
Přidej:
FRONTEND_URL=http://localhost:3000

## Nic jiného neměň. Neopravuj email.ts ani subscribery.
```

### Ověření
1. `cd backend && npx tsc --noEmit` — žádné type chyby
2. Grep: `grep -r "brightsign-shop.cz" backend/src/` — nesmí najít hardcoded URL (jen fallback)
3. Grep: `grep -r "xxx xxx xxx" backend/src/` — nesmí najít placeholder telefon

### Riziko
- **Nízké.** Jen kozmetické změny v šablonách.

---

## Checklist po všech sessions

### Lokální ověření
- [ ] `cd backend && npx tsc --noEmit` — žádné type chyby
- [ ] `cd backend && npx medusa start` — nastartuje lokálně
- [ ] Lokální admin dashboard (`localhost:9000/app`) — přihlášení funguje
- [ ] Grep "supersecret" v kódu — nesmí být v medusa-config.ts
- [ ] Grep "webhooks/stripe" v kódu — nesmí existovat
- [ ] Grep "cache-redis" v medusa-config.ts — nesmí být (nahrazeno caching)

### VPS ověření (po deployi)
- [ ] `docker logs brightsign-backend-1` — žádné chyby při startu
- [ ] Redis moduly connected (event-bus, caching, locking, workflow-engine)
- [ ] Admin dashboard funguje
- [ ] Existující produkty a obrázky se zobrazují
- [ ] MinIO bucket existuje a je přístupný
- [ ] JWT_SECRET a COOKIE_SECRET NEJSOU "supersecret"

### Stripe (po získání API klíčů)
- [ ] Stripe provider povolený ve všech 4 regionech (Admin → Settings → Regions)
- [ ] Webhook URL nastavená ve Stripe Dashboard: `https://<doména>/hooks/payment/stripe_stripe`
- [ ] Webhook events: payment_intent.succeeded, payment_intent.amount_capturable_updated, payment_intent.payment_failed, payment_intent.requires_action
- [ ] Test payment — `pp_stripe_stripe` jako provider_id

### Emaily (po nastavení RESEND_API_KEY)
- [ ] Testovací objednávka → order confirmation email dorazí
- [ ] B2B registrace → welcome email dorazí
- [ ] Admin dostane notifikaci o zaplacené objednávce

---

## Pořadí deployů na VPS

1. **Session 1 (security)** → deploy ihned, ověřit že JWT_SECRET je nastavený
2. **Session 2 (production moduly)** → deploy, ověřit Redis logy
3. **Session 3 (Stripe)** → deploy, ale Stripe ještě nefunguje (čeká na API klíče + frontend)
4. **Session 4 (MinIO)** → deploy, vytvořit bucket, migrovat existující soubory
5. **Session 5 (emaily)** → deploy, nastavit RESEND_API_KEY
6. **Session 6 (cleanup)** → deploy, nastavit FRONTEND_URL

Každý deploy: `ssh root@91.99.49.122 "cd /root/brightsign && git pull && docker compose -f docker-compose.prod.yml up -d --build"`

---

## Co NEŘEŠÍME v tomto plánu

- **Frontend Stripe integrace** (Payment Element) — samostatný frontend plán
- **Packeta API** — není launch blocker, fulfillment je manuální
- **Medusa upgrade** — už jsme na v2.13.1, aktuální
- **Seed script refactoring** — funguje správně, používá korektní Medusa workflows
- **Migrace souborů z local → MinIO** — samostatný krok po Session 4
- **Doména + HTTPS** — infrastrukturní úkol, ne backend kód
