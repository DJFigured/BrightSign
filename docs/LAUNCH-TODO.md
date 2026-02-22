# BrightSign E-shop — Pre-launch Checklist

Manuální úkoly, které musí Dan udělat před ostrým spuštěním.

## 1. Doména + DNS

- [ ] Koupit/připojit doménu `brightsign.cz`
- [ ] DNS A záznam → `91.99.49.122`
- [ ] HTTPS certifikát (Caddy auto-TLS nebo Let's Encrypt)
- [ ] Nastavit CORS v `.env.production`: `STORE_CORS=https://brightsign.cz`
- [ ] Update `NEXT_PUBLIC_SITE_URL=https://brightsign.cz` v storefront env

## 2. Stripe (platby)

- [ ] Vytvořit Stripe účet na [dashboard.stripe.com](https://dashboard.stripe.com)
- [ ] Získat Publishable Key + Secret Key
- [ ] Nastavit v `.env.production`:
  - `STRIPE_API_KEY=sk_live_...`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...`
- [ ] V Medusa admin: aktivovat Stripe payment provider pro všechny regiony
- [ ] Otestovat platbu v test mode před přepnutím na live

## 3. Resend (emaily)

- [ ] Vytvořit účet na [resend.com](https://resend.com)
- [ ] Ověřit doménu `brightsign.cz`
- [ ] Nastavit `RESEND_API_KEY` v `.env.production`
- [ ] Otestovat: potvrzení objednávky, B2B inquiry, kontaktní formulář

## 4. Packeta (doprava)

- [ ] Získat API klíč z [client.packeta.com](https://client.packeta.com)
- [ ] Nastavit `PACKETA_API_KEY` v `.env.production`
- [ ] Nastavit `NEXT_PUBLIC_PACKETA_API_KEY` pro widget ve storefrontu
- [ ] V Medusa admin: nastavit shipping options + ceny pro CZ, SK, PL

## 5. Analytics

- [ ] Google Analytics 4: vytvořit property, nastavit `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- [ ] Google Tag Manager: nastavit `NEXT_PUBLIC_GTM_ID`
- [ ] Meta Pixel (volitelné): nastavit `NEXT_PUBLIC_META_PIXEL_ID`
- [ ] Ověřit conversion tracking: `begin_checkout`, `purchase`, `add_to_cart`

## 6. Monitoring

- [ ] Nastavit UptimeRobot / BetterStack na `https://brightsign.cz`
- [ ] Alert na email/Slack při výpadku
- [ ] Zvážit: Sentry pro error tracking (backend + storefront)

## 7. VPS bezpečnost

- [ ] Firewall (ufw): povolit jen 80, 443, 22
  ```bash
  ufw allow 22/tcp
  ufw allow 80/tcp
  ufw allow 443/tcp
  ufw enable
  ```
- [ ] Zkontrolovat, že MinIO port 9002 NENÍ veřejně přístupný pro zápis
- [ ] SSH: vypnout password auth, jen klíče
- [ ] Automatické security updates: `apt install unattended-upgrades`

## 8. DB zálohy

- [ ] Deploynout `scripts/backup-db.sh` na VPS
- [ ] Přidat cron:
  ```bash
  crontab -e
  # Přidat řádek:
  0 3 * * * /root/brightsign/scripts/backup-db.sh >> /root/backups/backup.log 2>&1
  ```
- [ ] Ověřit, že zálohy vznikají v `/root/backups/`
- [ ] Zvážit off-site backup (rsync na jiný server / S3)

## 9. Obsah

- [ ] Doplnit S4 obrázky (pokud dostupné)
- [ ] Přeložit S4 produkty do SK/PL/EN/DE (potřeba ANTHROPIC_API_KEY)
- [ ] Zkontrolovat kontaktní stránku (email, adresa, IČO)
- [ ] Zkontrolovat obchodní podmínky — aktuální datum a údaje

## 10. Finální smoke test

- [ ] Celý checkout flow: přidat do košíku → kontakt → adresa → doprava → platba → potvrzení
- [ ] B2B inquiry formulář
- [ ] Registrace + přihlášení zákazníka
- [ ] SEO: zkontrolovat meta tagy, hreflang, sitemap.xml, robots.txt
- [ ] Mobilní verze: menu, produkty, košík, checkout
- [ ] Všech 5 jazyků: cs, sk, pl, en, de

## 11. Po spuštění

- [ ] Submitnout sitemap do Google Search Console
- [ ] Nastavit Google Merchant Center (volitelné)
- [ ] Spustit PPC kampaně (Google Ads, Sklik)
- [ ] Newsletter: první mailing s oznámením spuštění
