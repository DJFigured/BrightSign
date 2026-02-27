# Dan's TODO List
**Posledni aktualizace:** 2026-02-28
**Poznamka:** Tyto ukoly muze udelat POUZE Dan (API klice, DNS, business rozhodnuti).

---

## KRITICKE (blokery launche)

### 1. DNS A zaznamy
```
brightsign.cz       -> 91.99.49.122
api.brightsign.cz   -> 91.99.49.122
minio.brightsign.cz -> 91.99.49.122
```
- Kde: U registratora domeny (wedos.cz / forpsi.cz / jiný)
- Cas: 15 min + 1-24h propagace
- TTL: Nastavit na 300 sekund pro rychle zmeny

### 2. .env.production update (SSH)
Po DNS nastaveni zmenit na VPS:
```bash
ssh root@91.99.49.122
cd /root/brightsign
nano .env.production
```
Zmenit:
```
BACKEND_URL=https://api.brightsign.cz
NEXT_PUBLIC_BASE_URL=https://brightsign.cz
STORE_CORS=https://brightsign.cz,https://www.brightsign.cz
ADMIN_CORS=https://api.brightsign.cz
AUTH_CORS=https://brightsign.cz,https://www.brightsign.cz
S3_FILE_URL=https://minio.brightsign.cz/brightsign-media
```
Pak rebuild:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### 3. Stripe live klice
- Jdi na https://dashboard.stripe.com/apikeys
- Zkopiruj live Secret key (sk_live_...) a Publishable key (pk_live_...)
- Vloz do .env.production:
  ```
  STRIPE_API_KEY=sk_live_...
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
  ```
- Webhook: Stripe Dashboard -> Developers -> Webhooks -> Add endpoint
  - URL: `https://api.brightsign.cz/hooks/payment/stripe_stripe`
  - Events: payment_intent.succeeded, payment_intent.payment_failed, charge.succeeded
  - Zkopiruj Webhook Secret (whsec_...) do .env:
  ```
  STRIPE_WEBHOOK_SECRET=whsec_...
  ```

### 4. Packeta API klic
- Jdi na https://client.packeta.com/
- API key section -> zkopiruj API klic
- Vloz do .env.production:
  ```
  NEXT_PUBLIC_PACKETA_API_KEY=tvuj_klic
  ```

### 5. Resend API klic
- Jdi na https://resend.com/api-keys
- Vytvor API key pro domenu brightsign.cz
- Resend domain verifikace: pridat DNS zaznamy (MX, TXT/DKIM)
- Vloz do .env.production:
  ```
  RESEND_API_KEY=re_...
  ```

### 6. DB migrace (SSH)
```bash
ssh root@91.99.49.122
cd /root/brightsign
docker compose exec backend npx medusa db:migrate
```

---

## DULEZITE (pred spustenim)

### 7. Vybrat homepage variantu
- Otevri: `storefront/ui-variants/INDEX.html` v prohlizeci
- Nebo: `python3 -m http.server 8090` z `storefront/ui-variants/`
- Doporuceni CEO: V2 Product Focus (specifikace + ceny upfront)
- Po vyberu agent implementuje do Next.js (2-3 dny)

### 8. Telefonni cislo
- Poskytnout telefonni cislo pro header a footer e-shopu
- Format: +420 xxx xxx xxx

### 9. SSH hardening
```bash
ssh root@91.99.49.122
# Explicitne vypnout password auth
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart sshd

# Pridat swap
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### 10. Smoke test po deployi
- [ ] Homepage ve vsech 5 jazycich (cs/sk/pl/en/de)
- [ ] Produktovy katalog (min 3 produkty)
- [ ] Produktova stranka (specifikace, ceny, add to cart)
- [ ] Kosik (pridani, odebrani, zmena mnozstvi)
- [ ] Checkout kartou (mala castka, pak refund)
- [ ] Checkout prevodem (overit proforma fakturu v emailu)
- [ ] B2B registrace (testovaci firma)
- [ ] Kontaktni formular
- [ ] Search (vyhledani "HD225")
- [ ] Mobile test (iPhone/Android)

---

## NICE TO HAVE (po launchi)

### 11. Google Search Console
- Verifikovat brightsign.cz (DNS TXT zaznam)
- Odeslat sitemap.xml

### 12. Google Ads
- Brand kampan CZ: "brightsign" keyword, 50 CZK/den
- Nedelat pred smoke testem!

### 13. UptimeRobot
- Monitoring brightsign.cz a api.brightsign.cz
- Free tier staci

### 14. Alternativni platebni metody
- Comgate/GoPay pro CZ/SK (nizsi poplatky nez Stripe)
- Agent pripravuje Comgate modul -- bude potreba Comgate ucet

---

## POZNAMKY
- VPS IP: 91.99.49.122
- SSH: `ssh root@91.99.49.122` (key-based, zadne heslo)
- Projekt na VPS: /root/brightsign
- Coolify panel: http://91.99.49.122:8000
- Medusa admin: https://api.brightsign.cz/app (po DNS)
- Stripe dashboard: https://dashboard.stripe.com
- Packeta dashboard: https://client.packeta.com
