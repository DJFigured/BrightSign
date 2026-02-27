# Production Readiness Audit
**Datum:** 2026-02-28
**Autor:** CEO Agent (Claude Opus 4.6)
**VPS:** root@91.99.49.122 (Hetzner CAX21, 8GB RAM, Ubuntu 24.04)

---

## Stav systemu

### Kontejnery (5/5 healthy)
| Kontejner | Status | Poznamka |
|-----------|--------|----------|
| brightsign-backend | Healthy | Medusa.js v2, /health vraci OK |
| brightsign-storefront | Healthy | Next.js 15.3, Node 20 (opraveno z 22) |
| brightsign-postgres | Healthy | PostgreSQL 16, 88 produktu, 4 regiony |
| brightsign-redis | Healthy | noeviction, 512MB (opraveno) |
| brightsign-minio | Healthy | S3 storage |

### Zdroje
| Metrika | Hodnota | Hodnoceni |
|---------|---------|-----------|
| RAM | 3.4 GB / 7.7 GB (44%) | OK -- prostor pro traffic |
| Disk | 13 GB / 75 GB (17%) | OK |
| Swap | 0 MB | VAROVANI: Pridat 2GB swap pro safety |
| CPU | ARM64 4-core | OK pro tento load |

---

## Kriticke nalezy

### BLOKERY (nelze spustit bez nich)

#### 1. DNS neni nastaveno
- **Stav:** CHYBI
- **Potreba:** A zaznamy pro brightsign.cz, api.brightsign.cz, minio.brightsign.cz -> 91.99.49.122
- **Dopad:** Traefik nevi komu routovat, TLS certifikaty se nevygeneruji
- **Kdo:** Dan
- **Cas:** 15 min u registratora domeny

#### 2. .env.production -- IP-based URLs
- **Stav:** SPATNE
- **Soucasne:**
  - BACKEND_URL=http://91.99.49.122:9000
  - NEXT_PUBLIC_BASE_URL=http://91.99.49.122
  - STORE_CORS=http://91.99.49.122,http://91.99.49.122:3000
  - ADMIN_CORS=http://91.99.49.122,http://91.99.49.122:9000
  - AUTH_CORS=http://91.99.49.122,http://91.99.49.122:3000
- **Potreba:** Zmenit na domain-based URLs (brightsign.cz, api.brightsign.cz)
- **Kdo:** Dan (SSH)
- **Cas:** 10 min

#### 3. Stripe = PLACEHOLDER
- **Stav:** CHYBI
- **Soucasne:**
  - STRIPE_API_KEY=sk_test_PLACEHOLDER
  - STRIPE_WEBHOOK_SECRET=whsec_PLACEHOLDER
  - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_PLACEHOLDER
- **Payment provideri v DB:** 10 provideru registrovano (stripe, przelewy24, blik, giropay, bancontact, ideal, bank-transfer, system)
- **Kdo:** Dan
- **Cas:** 30 min (Stripe dashboard + env update)

#### 4. Packeta = PLACEHOLDER
- **Stav:** CHYBI
- **NEXT_PUBLIC_PACKETA_API_KEY=PLACEHOLDER**
- **Shipping options v DB:** 5 options existuji (Packeta CZ, SK, PL, EU + Standard)
- **Kdo:** Dan
- **Cas:** 1h (Packeta ucet + API klic)

#### 5. Resend = PLACEHOLDER
- **Stav:** CHYBI
- **RESEND_API_KEY=re_PLACEHOLDER**
- **Dopad:** Zadne transakcni emaily (potvrzeni objednavky, B2B, kontakt)
- **Kdo:** Dan
- **Cas:** 15 min

#### 6. Invoice DB migrace
- **Stav:** CHYBI
- **Tabulka 'invoice' neexistuje v DB**
- **Prikaz:** `docker compose exec backend npx medusa db:migrate`
- **Kdo:** Dan (SSH)
- **Cas:** 2 min

---

### OPRAVENO (tato session)

| Polozka | Puvodni stav | Novy stav |
|---------|-------------|-----------|
| Redis maxmemory-policy | allkeys-lru (256MB) | noeviction (512MB) |
| Storefront Node verze | Node 22 (TransformStream bug) | Node 20 (stabilni) |
| Warranty FAQ texty | "3 roky" | "5 let" (vsech 5 jazyku) |
| Backup cron | Aktivni | 0 3 * * * -- OK |

---

## Datovy audit

### Produkty: 88 v DB
- Serie 4, 5, 6 + prislusenstvi
- 33 kategorii (rady, serie, prislusenstvi)

### Regiony: 4
| Region | Mena |
|--------|------|
| Czech Republic | CZK |
| Slovakia | EUR |
| Poland | PLN |
| European Union | EUR |

### Shipping options: 5
| Nazev | Poznamka |
|-------|----------|
| Packeta - Vydejni misto | CZ |
| Packeta - Doruceni na adresu | CZ |
| Packeta - Dorucenie na adresu | SK |
| Packeta - Dostawa na adres | PL |
| Standard Shipping | EU |

### Payment provideri: 10
- stripe (karta)
- stripe-przelewy24 (PL)
- stripe-blik (PL)
- stripe-giropay (DE)
- stripe-ideal (NL)
- stripe-bancontact (BE)
- stripe-oxxo (MX -- nerelevantni)
- stripe-promptpay (TH -- nerelevantni)
- bank-transfer (proforma)
- system_default

### Zakaznici: 2 (testovaci)
### Objednavky: 1 (testovaci)

---

## Bezpecnostni audit

| Oblast | Stav | Detail |
|--------|------|--------|
| UFW firewall | AKTIVNI | deny incoming, allow 22/80/443/8080/8000/6001-6002 |
| fail2ban | AKTIVNI | 5 IP banovano za SSH brute-force |
| SSH | BEZPECNE | Key-only auth (defaults, ale funguje) |
| SSH PasswordAuth | DOPORUCENI | Explicitne nastavit PasswordAuthentication no |
| Docker daemon | LOGGING | json-file, max-size 10m, max-file 3 |
| Docker iptables | DEFAULT | Neni iptables:false -- Coolify to potrebuje |
| Redis auth | AKTIVNI | requirepass s 64-char tokenem |
| PostgreSQL | VNITRNI | Pristup jen z Docker site, silne heslo |
| MinIO | VNITRNI | Pristup jen z Docker site, silne heslo |
| CORS | IP-BASED | Zmenit na domain-based po DNS |
| CSP headers | IMPLEMENTOVANO | V Next.js middleware |
| HSTS | IMPLEMENTOVANO | V Next.js headers |

### Doporuceni bezpecnostnich zmen
1. **[P1]** Explicitne nastavit `PasswordAuthentication no` v /etc/ssh/sshd_config
2. **[P1]** Pridat 2GB swap: `fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile`
3. **[P2]** Omezit Coolify porty na specificke IP (pokud mozne)
4. **[P2]** Nastavit automatic security updates: `apt install unattended-upgrades`

---

## Storefront audit

### TransformStream bug
- **Puvodni stav:** Desitky `controller[kState].transformAlgorithm is not a function` erroru
- **Pricina:** Node 22 + Next.js 15.3 inkompatibilita
- **Fix:** Downgrade na Node 20 v Dockerfile (commit b47a6f8)
- **Stav:** Build v prubehu na VPS

### Storefront -> Backend komunikace
- **Soucasne:** Storefront se pripojuje na backend pres externi IP (91.99.49.122:9000)
- **Problem:** Prochazi pres externi sit misto Docker interniho DNS
- **Chyba v logu:** `ConnectTimeoutError: Connect Timeout Error (attempted address: 91.99.49.122:9000, timeout: 10000ms)`
- **Fix:** Po DNS nastaveni zmenit NEXT_PUBLIC_MEDUSA_BACKEND_URL na https://api.brightsign.cz
- **Alternativa:** Pouzit Docker interni DNS (http://backend:9000) -- ale to nefunguje pro SSR public URLs

---

## Checklist pro launch

### Dan musi udelat (serazeno podle priority)
- [ ] DNS A zaznamy (3 domeny -> 91.99.49.122)
- [ ] .env.production -- domain-based URLs + CORS
- [ ] Stripe live API klice + webhook URL
- [ ] Resend API klic
- [ ] Packeta API klic
- [ ] DB migrace: `docker compose exec backend npx medusa db:migrate`
- [ ] Rebuild po env zmene: `docker compose -f docker-compose.prod.yml up -d --build`
- [ ] Smoke test: checkout CZ (karta + prevod)
- [ ] Smoke test: SK a PL mutace
- [ ] Vybrat homepage variantu

### Agent muze udelat (bez DNS/klicu)
- [x] Redis noeviction fix
- [x] Node 20 downgrade
- [x] Warranty 5 let update
- [ ] Homepage implementace (po Danove vyberu)
- [ ] Comgate payment provider modul
- [ ] Shipping architecture dokumentace
- [ ] Image optimalizace (ls5-front.png 2.1MB)

---

## Odhadovany cas do launch

| Krok | Cas | Zavislost |
|------|-----|-----------|
| DNS nastaveni | 15 min | Dan |
| DNS propagace | 1-24h | - |
| .env update + rebuild | 30 min | DNS |
| Stripe setup | 30 min | Dan |
| Packeta setup | 1h | Dan |
| Resend setup | 15 min | Dan |
| DB migrace | 5 min | VPS pristup |
| Smoke test | 2h | Vse vyse |
| **Celkem** | **5-6h Danovy prace + DNS propagace** | - |

**Realisticky: 1-2 pracovni dny po DNS nastaveni.**
