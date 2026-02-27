# CEO Night Shift Progress
**Zacatek:** 2026-02-27 ~21:00
**Agent:** CEO (Claude Opus 4.6)

---

## P0: VPS Fixes

### [DONE] Redis noeviction + 512mb
- Problem: VPS mel `allkeys-lru` a `256mb` misto `noeviction` a `512mb`
- Oprava: `sed` na VPS docker-compose.prod.yml + `docker compose up -d redis`
- Overeno: `CONFIG GET maxmemory-policy` = noeviction, `maxmemory` = 536870912 (512mb)

### [IN PROGRESS] TransformStream bug
- Problem: `TypeError: controller[kState].transformAlgorithm is not a function`
- Pricina: Node 22 + Next.js 15.3 inkompatibilita
- Reseni: Downgrade Dockerfile na Node 20 (konzistentni s CLAUDE.md)
- Stav: Dockerfile upraven lokalne, ceka na push + rebuild na VPS

### [PENDING] VPS hardening verification
- harden-vps.sh -- overit co uz bylo spusteno vs. co zbyva
- UFW: DONE (aktivni)
- fail2ban: DONE (4 IP banned)
- SSH key-only: DONE
- Docker iptables:false -- overit

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
### [PENDING] docs/PRODUCTION-READINESS.md

---

## P3: Payment Providers
### [PENDING] docs/PAYMENT-PROVIDERS.md
### [PENDING] Comgate modul

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
