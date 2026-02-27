# CEO Night Shift Progress
**Zacatek:** 2026-02-27 ~21:00
**Agent:** CEO (Claude Opus 4.6)

---

## P0: VPS Fixes

### [DONE] Redis noeviction + 512mb
- Problem: VPS mel `allkeys-lru` a `256mb` misto `noeviction` a `512mb`
- Oprava: `sed` na VPS docker-compose.prod.yml + `docker compose up -d redis`
- Overeno: `CONFIG GET maxmemory-policy` = noeviction, `maxmemory` = 536870912 (512mb)

### [DONE] TransformStream bug
- Problem: `TypeError: controller[kState].transformAlgorithm is not a function`
- Pricina: Node 22 + Next.js 15.3 inkompatibilita
- Reseni: Downgrade Dockerfile na Node 20 (konzistentni s CLAUDE.md)
- Deploynuty a bezici na VPS

### [DONE] VPS hardening verification
- UFW: DONE (aktivni)
- fail2ban: DONE (4 IP banned)
- SSH key-only: DONE

---

## P1: Frontend Fixes (z ceo-ui-review.md)

### [DONE] Terms checkbox v checkout
- Commit: 897aac3

### [DONE] Lokalizace country labels v checkout
- Commit: 81946ad

### [DONE] Hardcoded barvy na kontaktni strance
- Commit: 4dd71e9

### [DONE] Lucide ikony misto text entities (B2B success)
- Commit: 9ba0ff5

### [DONE] Continue shopping button v kosiku
- Commit: aea9c35

### [DONE] Platebni ikony ve footeru (SVG)
- Commit: 3f3c610

### [DONE] Dynamicka VAT sazba
- Commit: f38f1c4

### [DONE] Homepage JSON-LD Organization schema
- Commit: e86d0a8

### [DONE] Order review summary pred potvrzenim
- Commit: 959935a

### [DONE] Lokalizace segment labels
- Commit: e037ab4

### [DONE] Shipping cost info na produktove strance
- Commit: c83ce32

### [IN PROGRESS] Zaruka "3 roky" -> "5 let" vsude
### [PENDING] Lucide ikony v contact success state
### [PENDING] Duplicitni homepage sekce cleanup
### [PENDING] Mobile search close button
### [PENDING] Checkout delivery time info

---

## P2: Production Readiness Audit
### [DONE] docs/PRODUCTION-READINESS.md

---

## P3: Payment Providers

### [DONE] docs/PAYMENT-PROVIDERS.md
- Kompletni srovnani 7 provideru (Comgate, GoPay, ThePay, Przelewy24, PayU, Tpay, Stripe)
- Souhrnna tabulka s poplatky, API, Medusa pluginy, onboardingem
- Cenova kalkulace: uspora 514 EUR/rok s Comgate vs Stripe-only
- Doporuceni per-country architektura

### [DONE] Comgate modul (backend/src/modules/comgate/)
- `types.ts`: Kompletni typy (options, API request/response, session data, webhook, konstanty)
- `service.ts`: Plna implementace AbstractPaymentProvider
  - initiatePayment: POST /v1.0/create, redirect flow
  - authorizePayment: verifikace pres /v1.0/status
  - capturePayment: status check (Comgate auto-captures)
  - refundPayment: POST /v1.0/refund (full + partial)
  - cancelPayment: POST /v1.0/cancel
  - deletePayment: cancel + cleanup
  - updatePayment: cancel + re-create
  - retrievePayment: fetch aktualni status
  - getPaymentStatus: Comgate -> Medusa status mapping
  - getWebhookActionAndData: parse URL-encoded webhook, verify via /status API
- `index.ts`: ModuleProvider export
- TypeScript check: PASS (0 errors)
- Ceka na: COMGATE_MERCHANT_ID + COMGATE_SECRET od Dana

### [DONE] Przelewy24 skeleton (backend/src/modules/przelewy24/)
- `types.ts`: Kompletni typy (options, register/verify/refund API, webhook, P24 methods enum)
- `service.ts`: Skeleton se vsemi required metodami (throwuji "not implemented")
  - Dokumentace co implementovat v kazde metode
  - P24Client trida s Basic Auth a request utilitou
  - computeSign placeholder pro SHA-384
- `index.ts`: ModuleProvider export
- TypeScript check: PASS (0 errors)
- Status: ceka na PL trh (10+ orders/month)

### [DONE] docs/ADDING-PAYMENT-PROVIDER.md
- Krok za krokem guide pro noveho providera
- Pokryva: typy, service, index, config, region, frontend, webhook, env, testing
- Checklist 16 polozek
- Reference implementations tabulka
- Common pitfalls sekce

---

## P4: Per-region Shipping Architecture
### [PENDING]

---

## P5: AI Operations + Knowledge Base
### [PENDING] docs/AI-OPERATIONS.md
### [PENDING] data/brightsign-knowledge-base.md

---

## P6: Nice-to-haves
### [PENDING]

---

## DAN-TODO Items (collected during session)
- [ ] DNS A records
- [ ] Stripe live keys
- [ ] Packeta API key
- [ ] Homepage variant selection
- [ ] Phone number for header/footer
- [ ] **NEW:** Comgate registrace (https://www.comgate.cz/en) -> ziskat COMGATE_MERCHANT_ID + COMGATE_SECRET
