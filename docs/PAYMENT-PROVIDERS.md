# Payment Providers Research
**Datum:** 2026-02-28 (aktualizace: nocni session)
**Autor:** CEO Agent (Claude Opus 4.6)
**Ucel:** Analyza alternativnich platebních metod pro multi-country e-shop

---

## Souhrnna srovnavaci tabulka

| Provider | Pro trhy | Poplatky (karty) | Poplatky (prevody) | API | Medusa plugin? | Mesicni poplatek | Onboarding | Status |
|----------|----------|------------------|--------------------|-----|---------------|-----------------|------------|--------|
| **Comgate** | CZ, SK | 0.9% + 1 CZK | 0.9% + 1 CZK | REST (URL-encoded) | medusa-payment-comgate-jc (v1 only) | 0 CZK | Online, 1-3 dny | **DOPORUCENO CZ/SK** |
| **GoPay** | CZ, SK | ~1.2-1.9% | ~5-15 CZK | REST JSON | Community plugin (v1) | 0 CZK | Online | **NEDOPORUCENO** (licence odejmuta CNB) |
| **ThePay** | CZ, SK | od 0.9% + 1 CZK | od 8 CZK | REST | Ne | 0-490 CZK (dle obratu) | Online | Alternativa |
| **Przelewy24** | PL | ~1.0-2.0% | ~0.5-1.5% | REST JSON | Ne (nase skeleton) | 0 PLN | Online, 1-3 dny | Skeleton hotov |
| **PayU** | PL, CZ | ~1.4-2.3% | ~0.5-1.5% | REST JSON | medusa-plugin-payu (v1) | 0 PLN | Online | Alternativa PL |
| **Tpay** | PL | ~1.3-2.3% | ~0.5% | REST JSON | Ne | 0 PLN (10 PLN registrace) | Online | Alternativa PL |
| **Stripe** | EU/global | 1.5% + 0.25 EUR | 1.4-1.8% + 0.25 EUR | REST JSON | Oficialni (v2) | 0 EUR | Okamzity | **ZACHOVAT** |

---

## Soucasny stav

Medusa backend ma registrovano 10 payment provideru:
- **stripe** (karta) -- hlavni provider
- **stripe-przelewy24** (PL bank transfers)
- **stripe-blik** (PL mobilni platby)
- **stripe-giropay** (DE bank transfers)
- **stripe-ideal** (NL bank transfers)
- **stripe-bancontact** (BE)
- **stripe-oxxo** (MX -- nerelevantni, odebrat)
- **stripe-promptpay** (TH -- nerelevantni, odebrat)
- **bank-transfer** (proforma faktura -- custom modul)
- **system_default** (system)

### Poplatky Stripe
| Metoda | Poplatek | Poznamka |
|--------|----------|----------|
| European cards | 1.5% + 0.25 EUR | Nejbeznejsi |
| Non-European cards | 3.25% + 0.25 EUR | Vzacne pro nas |
| Przelewy24 | 1.8% + 0.25 EUR | Stripe prostrednictvi |
| BLIK | 1.8% + 0.25 EUR | Stripe prostrednictvi |
| Giropay | 1.4% + 0.25 EUR | Stripe prostrednictvi |
| Bancontact | 1.4% + 0.25 EUR | Stripe prostrednictvi |

---

## Doporuceni provideri

### 1. Comgate (CZ/SK) -- DOPORUCENO

**Proc:**
- Ceska firma, ceska podpora, ceske banky
- **Poplatky 0.9% + 1 CZK** (Easy tarif) vs Stripe 1.5% + 0.25 EUR
- **Uspora na 10,000 CZK objednavce:** ~60 CZK (Comgate) vs ~160 CZK (Stripe) = **63% uspora**
- Podpora CZK, EUR, PLN, HUF, RON a dalsi meny
- Prvnich 6 mesicu kartove platby zdarma do 50,000 CZK/mesic
- REST API s JSON/XML
- Zadne mesicni poplatky

**Platebni metody:**
- Visa, Mastercard, Maestro
- Online bankovni prevod (vsechny ceske banky)
- Google Pay, Apple Pay
- CSOB platebni tlacitko
- Komercni banka platebni tlacitko

**Integrace:**
- REST API: `POST /v2.0/paymentRedirect/merchant/{merchant_id}`
- Webhook notifikace o stavu platby
- PHP SDK k dispozici (adaptujeme pro Node.js)
- Dokumentace: https://apidoc.comgate.cz/en/

**Easy vs Profi tarif:**
| | Easy | Profi |
|---|------|-------|
| Mesicni poplatek | 0 CZK | 0 CZK |
| Karta | 0.9% + 1 CZK | od 0.59% + 1 CZK |
| Bankovni prevod | 0.9% + 1 CZK | od 6 CZK |
| Apple/Google Pay | 0.9% + 1 CZK | od 0.59% + 1 CZK |

**Pro nas:** Easy tarif na zacatek (jednoduchy, transparentni), Profi po dosazeni vetsich objemu.

**Rizika:**
- Zadna -- etablovana ceska firma

---

### 2. GoPay -- NEDOPORUCENO

**VAROVANI:** Ceska narodni banka ODEJMULA GoPay licenci e-money instituce dne 16. dubna 2025.

**Duvod nedoporuceni:**
- Regulatorni riziko
- Nejistota budouciho fungovani
- I kdyz stale operuji, neni to stabilni volba pro novy e-shop

---

### 3. ThePay (CZ/SK) -- ALTERNATIVA

**Proc:**
- Ceska firma s transparentnimi poplatky
- Fer ceny, ktere se skaluji podle obratu
- Snadna integrace, podpora ceskych bank
- Zadne mesicni poplatky

**Poplatky:**
- Karty: od 0.9% + 1 CZK (srovnatelne s Comgate)
- Bankovni prevody: od 8 CZK
- BLIK: pod 2%

**Hodnoceni:** Dobra alternativa k Comgate, ale Comgate ma lepsi dokumentaci a sirsi ekosystem.

---

### 4. Przelewy24 (PL) -- PRO POLSKY TRH

**Soucasny stav:** Jiz dostupne pres Stripe (stripe-przelewy24). Ale prime propojeni by snizilo poplatky.

**Proc prime propojeni:**
- Stripe si za prostrednictvi uctuje 1.8% + 0.25 EUR
- Prime propojeni: cca 1.0-1.5% (zavisi na objemu)
- Uspora: ~0.5% na kazde PL transakci

**Platebni metody:**
- 165 polskych bank
- BLIK
- Apple Pay, Google Pay
- Karty (Visa, Mastercard)

**Integrace:**
- REST API
- Dokumentace: https://developers.przelewy24.pl/

**Doporuceni:** Zatim pouzivat pres Stripe. Prime propojeni az po overeni PL trhu (10+ objednavek mesicne).

**Implementace:** Skeleton modul pripraven v `backend/src/modules/przelewy24/` s kompletnimi typy.

---

### 5. PayU (PL, CZ) -- ALTERNATIVA PRO PL

**Proc:**
- Jedna z nejvetsi platebni bran v Polsku (zalozena 2006)
- Podpora BLIK, ryclych prevodu, karet, Apple Pay, Google Pay
- Pouziva i cesky trh, ale vyssi poplatky nez Comgate
- Existuje Medusa v1 plugin (medusa-plugin-payu) — nutna adaptace pro v2

**Poplatky:**
- Karty: ~1.4-2.3% (dle objemu)
- BLIK: ~0.5-1.0%
- Rychle prevody: ~0.5-1.5%
- Mesicni poplatek: 0 PLN
- Vyssi nez Przelewy24, ale univerzalnejsi

**Integrace:**
- REST API (JSON)
- Dokumentace: https://developers.payu.com/
- Sandbox prostredi k dispozici

**Hodnoceni:** Druha volba pro PL po Przelewy24. Vyhodna pro zakazniky, kteri jiz PayU znaji.

**Doporuceni:** Neimplementovat ted. Zvazit pokud P24 neni dostatecna pokrytim.

---

### 6. Tpay (PL) -- ALTERNATIVA PRO PL

**Proc:**
- Jedny z nejnizsich poplatku na polskem trhu
- Podpora BLIK, prevodu, karet, PayPal, BNPL
- Zamereni na lokalni PL trh
- Rychla integrace

**Poplatky:**
- Zakladni sazba: 1.59%
- BLIK: pod 1%
- Prevody: ~0.5%
- Karty/PayPal/Google Pay: vyssi (variabilni)
- Registracni poplatek: 10 PLN (jednorazove)
- Chargebacks: 20 PLN/ks
- Refundy: 0.90 PLN/ks
- Prvni 4 vypisy/mesic zdarma, pak 2 PLN/ks

**Integrace:**
- REST API
- Dokumentace: https://docs.tpay.com/

**Omezeni:**
- Primarne lokalni — omezena mezinarodni podpora
- Nizsi poplatky vyzaduji vyjednavani pri vetsim objemu

**Hodnoceni:** Dobra volba pro ciste PL e-shop, ale pro nas multi-country model je P24 vhodnejsi.

**Doporuceni:** Neimplementovat. P24 a PayU pokryvaji PL trh.

---

### 7. Stripe -- ZACHOVAT JAKO FALLBACK

**Proc zachovat:**
- Uz je integrovano (zadna prace navic)
- Podporuje karty ze celeho sveta
- PCI DSS compliance "out of the box"
- Giropay pro DE/AT zakazniky
- Bancontact pro BE
- iDEAL pro NL
- 3D Secure 2 automaticky
- Stripe Radar pro fraud prevention

**Strategie:** Stripe jako fallback pro EU zakazniky a non-CZ/SK karty. Comgate jako primarni pro CZ/SK.

---

## DOPORUCENA ARCHITEKTURA

```
CZ zakaznik:
  Preferovane: Comgate (karta, bankovni prevod, Apple/Google Pay)
  Fallback: Stripe (karty), Bank Transfer (proforma)

SK zakaznik:
  Preferovane: Comgate (karta, bankovni prevod)
  Fallback: Stripe (karty), Bank Transfer (proforma)

PL zakaznik:
  Preferovane: Stripe + Przelewy24, Stripe + BLIK
  Budoucnost: Prime Przelewy24 propojeni
  Fallback: Stripe (karty), Bank Transfer (proforma)

DE/AT/EU zakaznik:
  Preferovane: Stripe (karty, Giropay, iDEAL)
  Fallback: Bank Transfer (proforma)
```

---

## IMPLEMENTACNI PLAN

### Faze 1: Comgate modul -- DONE
1. [x] Vytvorit `backend/src/modules/comgate/` payment provider
2. [x] Implementovat: initiatePayment, authorizePayment, capturePayment, refundPayment, cancelPayment
3. [x] Webhook handler (getWebhookActionAndData) s overenim pres /status API
4. [ ] Frontend: Comgate redirect flow v checkout (po Danove Comgate registraci)
5. [ ] Testovani v sandbox modu (po ziskani COMGATE_MERCHANT_ID + COMGATE_SECRET)
6. [ ] Registrace v medusa-config.ts (az budou credentials)

### Faze 2: Aktivace Przelewy24 pres Stripe (pred launchem)
1. Aktivovat P24 v Stripe Dashboard -> Settings -> Payment methods
2. Pridat P24 platebni element do checkout pro PL region
3. Testovani

### Faze 3: Prime Przelewy24 (Q2, pokud PL trh roste)
1. Registrace u Przelewy24
2. Skeleton modul uz pripraven v `backend/src/modules/przelewy24/`
3. Implementace: doplnit SHA-384 signature, register/verify flow
4. A/B test vs Stripe P24

---

## USPORA NAKLADU -- KALKULACE

### Rok 1 (konzervativni scenar: 122,250 EUR revenue)

| Scenar | Stripe only | Comgate CZ/SK + Stripe EU | Uspora |
|--------|-------------|---------------------------|--------|
| CZ/SK (70% revenue) | 85,575 * 1.5% = 1,284 EUR | 85,575 * 0.9% = 770 EUR | **514 EUR** |
| PL (20% revenue) | 24,450 * 1.8% = 440 EUR | 24,450 * 1.8% = 440 EUR | 0 EUR |
| EU (10% revenue) | 12,225 * 1.5% = 183 EUR | 12,225 * 1.5% = 183 EUR | 0 EUR |
| **Celkem poplatky** | **1,907 EUR** | **1,393 EUR** | **514 EUR/rok** |

**Rocni uspora: ~514 EUR** (27% snizeni poplatku)

---

## IMPLEMENTACNI STAV

| Modul | Adresar | Soubory | Status |
|-------|---------|---------|--------|
| Comgate | `backend/src/modules/comgate/` | index.ts, service.ts, types.ts | Kompletni, ceka na credentials |
| Przelewy24 | `backend/src/modules/przelewy24/` | index.ts, service.ts, types.ts | Skeleton (typy + placeholder metody) |
| Bank Transfer | `backend/src/modules/bank-transfer/` | index.ts, service.ts | Produkce |
| Stripe | `@medusajs/medusa/payment-stripe` | (package) | Produkce |

### Dokumentace
- **Srovnani provideru:** `docs/PAYMENT-PROVIDERS.md` (tento soubor)
- **Navod pro noveho providera:** `docs/ADDING-PAYMENT-PROVIDER.md`

---

## ZDROJE

- Comgate API: https://apidoc.comgate.cz/en/
- Comgate poplatky: https://help.comgate.cz/docs/en/fees
- Comgate PHP SDK: https://github.com/comgate-payments/sdk-php
- Przelewy24 API: https://developers.przelewy24.pl/
- PayU PL: https://poland.payu.com/
- PayU API: https://developers.payu.com/
- Tpay: https://tpay.com/en
- Tpay API: https://docs.tpay.com/
- Stripe P24: https://docs.stripe.com/payments/p24
- Medusa Payment Module: https://docs.medusajs.com/resources/commerce-modules/payment
- Medusa v2 Custom Provider: https://docs.medusajs.com/resources/references/payment/provider
