# CEO Audit - BrightSight E-shop
**Datum:** 2026-02-27
**Autor:** CEO Agent (Claude Opus 4.6)
**Stav:** Prvni onboarding session

---

## 1. CELKOVE HODNOCENI

Projekt BrightSight je technicky na solidnim zaklade. Backend (Medusa.js v2), storefront (Next.js 15), infrastruktura (Hetzner + Docker + Traefik), i18n (5 jazyku), analytika (GA4 + Meta Pixel), SEO, bezpecnost -- to vse je implementovano na vysoke urovni. Jako one-person operation s AI automatizaci je to pozoruhodne.

**Ale:** E-shop neni pripraveny na launch. Existuji kriticke blokery, ktere musi byt vyreseny pred tim, nez na nej pustime prvniho zakaznika.

### Skore pripravenosti: 65/100

| Oblast | Stav | Hodnoceni |
|--------|------|-----------|
| Backend/API | Funkcni | 8/10 |
| Storefront UI | Funkcni, ale hruby | 6/10 |
| i18n/lokalizace | Kompletni | 8/10 |
| SEO | Solidni zaklad | 7/10 |
| Analytika | Plne pokryta | 9/10 |
| Bezpecnost | Dobre osetrena | 8/10 |
| Platby (Stripe) | Neovereno na produkci | 4/10 |
| Doprava (Packeta) | Neintegrovana | 2/10 |
| Obsah/copywriting | Zakladni | 4/10 |
| Vizualni identita | Chybi logo, fotky | 3/10 |
| VPS/hosting | Zamlceny (DDoS) | 1/10 |
| DNS/domena | Nenastaveno | 0/10 |

---

## 2. CO JE DOBRE (muzeme ukazat zakaznikum)

### 2.1 Technicky zaklad
- **Medusa.js v2** jako headless backend -- skalovatelny, moderni, API-first
- **Next.js 15** storefront se server-side renderingem -- rychly, SEO-friendly
- **5 jazykovych mutaci** (cs, sk, pl, en, de) -- vsechny prekladove soubory kompletni (cca 660 radku kazdy)
- **Multi-region cenova podpora** -- CZ (CZK), SK (EUR), PL (PLN), EU (EUR)
- **Docker Compose produkce** s Traefik reverse proxy, health checky, auto-restart

### 2.2 E-commerce funkce
- **Kompletni checkout flow** -- kontakt, adresa, doprava, platba (karta + prevod), potvrzeni
- **Stripe platby** -- karta + bank transfer s proforma fakturou
- **B2B registrace** s VIES validaci DIC, customer skupiny, slevove urovne
- **Fakturacni modul** -- vlastni invoice modul v backendu s PDF generovanim
- **Porovnani produktu** -- az 4 produkty, tabulka specifikaci
- **Vyhledavani** s naseptavacem primo v headeru
- **Kosik** s toast notifikacemi pri pridani
- **Ucet zakaznika** s historii objednavek a detailem objednavky

### 2.3 SEO a analytika
- **generateMetadata** na vsech strankach
- **JSON-LD** schema: Organization, WebSite+SearchAction, Product, BreadcrumbList, CollectionPage, LocalBusiness, FAQPage
- **OG + Twitter Card** meta tagy
- **hreflang** tagy pro vsech 5 lokalizaci
- **GA4 plny funnel** -- view_item, add_to_cart, begin_checkout, purchase, search, atd.
- **Meta Pixel** -- ViewContent, AddToCart, InitiateCheckout, Purchase
- **noindex** na login, registrace, kosik, checkout, porovnani, hledani
- **Cookie consent** s granularnim nastavenim (analyticke/marketingove)

### 2.4 Bezpecnost
- Rate limiting na API endpointy (contact, B2B inquiry)
- CSP headers, HSTS
- Honeypot pole na formularich
- Auth cookies (_bs_auth)
- Timing-safe porovnani pro AI Buddy API key
- Image remotePatterns omezeny

### 2.5 DX a automatizace
- **AI Buddy API** -- dashboard, objednavky, inventory, revenue, B2B endpoint
- **GitHub Actions CI/CD** -- SSH deploy
- **Backup script** (backup-db.sh) pripraveny, 14-dnu retence, GPG sifrovani
- **Email sablony** -- order confirmation, B2B inquiry, contact, B2B welcome/validated

---

## 3. CO JE SPATNE NEBO NEDODELANE

### 3.1 KRITICKE BLOKERY (bez nich nelze spustit)

#### VPS je zamceny
- Hetzner VPS (91.99.49.122) byl zamlcen kvuli DDoS incidentu (UDP flood)
- Hardening script (scripts/harden-vps.sh) je pripraveny, ale nebyl spusten
- **BEZ VYRESENI TOHOTO NELZE NIC DALSIHO DELAT NA PRODUKCI**

#### DNS neni nastaveno
- Domena brightsign.cz existuje, ale DNS A zaznamy neukazuji na VPS
- Bez DNS nefunguje TLS certifikat, Traefik routing, CORS, email verifikace

#### Stripe neni nakonfigurovany na produkci
- Stripe API klice nejsou v produknim .env
- Webhook URL neni nastaven v Stripe Dashboard
- Nikdy netestovano na live mode

#### Packeta shipping neni integrovana
- API klic chybi
- Shipping widget neni pripojen
- Shipping options v Medusa jsou pravdepodobne prazdne nebo placeholder
- **Zakaznik nema jak vybrat doruceni**

#### DB migrace invoice modulu nebezela
- `npx medusa db:migrate` nebyl spusten na VPS pro invoice modul
- Fakturace nebude fungovat

### 3.2 DULEZITE NEDOSTATKY

#### Vizualni identita
- **Logo je textove** ("BrightSign.cz" v kodu) -- chybi SVG/PNG logo
- Favicon je genericky (25KB .ico soubor)
- Zadny brand manual, zadne graficke materialy
- Hero sekce na homepage je ciste textova -- bez obrazku/videa
- **Pusobi to jako MVP/prototyp, ne jako duveryhodny e-shop**

#### Produktove obrazky
- Nektere produkty nemaji thumbnail (zobrazuje se "Bez obrazku")
- Produktove fotky jsou pravdepodobne nizke kvality nebo z MinIO ktere neni pristupne
- Chybi lifestyle fotky, aplikacni snimky

#### Obsah a copywriting
- Produktove popisy jsou zakladni/technicke
- Chybi "preco kupovat u nas" sekce
- Chybi case studies, reference, recenze
- Obchodni podminky a GDPR jsou na miste, ale generickejsi
- FAQ je solidni (8 otazek) ale mohlo by byt vic

#### Checkout UX
- Country code je natvrdo z locale (neni dropdown pro vyber zeme)
- Chybi pole "firma" a "ICO" v checkout (nutne pro B2B)
- Chybi volba fakturacni vs. doruci adresa (momentalne stejna)

#### Homepage
- Hero sekce nema vizual -- jen text na tmavem pozadi
- Trust signaly jsou tri ikony -- chybi konkretni cisla, reference
- "Clearance banner" pro Serii 4 -- dobre, ale mohlo by byt presvedcivejsi
- Chybi sekce "novinky" nebo "Seriie 6" announcement

### 3.3 MENSI PROBLEMY

- `components/cart/` slozka je prazdna
- Caddyfile soubory v rootu -- zbytecne, pouziva se Traefik
- PDF soubory z COMM-TEC (530KB+) jsou v git repu
- `.DS_Store` soubory v gitu
- Slozka "Bez nazvu" v rootu
- `data/` slozka -- mela by byt v .gitignore pokud obsahuje velka data
- Copyright v patice: "{year}" placeholder funguje, ale rok je dynamicky

---

## 4. CO UPLNE CHYBI

### 4.1 Launch blokery
1. **Packeta integrace** -- bez dopravy nelze prodavat
2. **Realny Stripe setup** -- live API klice, webhook, test objednavka
3. **Dostupny VPS** -- Hetzner unlock, hardening, deploy
4. **DNS konfigurace** -- A zaznam pro brightsign.cz a api.brightsign.cz

### 4.2 Duveryhodnost
1. **Logo a vizualni identita** -- profesionalni SVG logo
2. **Produktove fotky vysoke kvality** -- stazene z brightsign.biz
3. **Hero image/video na homepage** -- BrightSign v akci
4. **Reference/testimonials** -- i jen "100+ instalaci v CR"
5. **BrightSign partner badge** -- pokud existuje
6. **Telefonni cislo** v headeru/patice

### 4.3 Funkce pro launch
1. **Monitoring** -- UptimeRobot/BetterStack pro uptime, Sentry pro errory
2. **Google Search Console** -- verifikace, sitemap submit
3. **Google Merchant Center** -- pro Shopping kampane
4. **Email automatizace** -- abandoned cart, post-purchase sequence
5. **Poptavkovy formular pro projekty** -- vice nez jen B2B registrace

### 4.4 Post-launch
1. **Blog/content sekce** -- pro SEO a autoritu
2. **Srovnavaci stranky** -- BrightSign vs konkurence
3. **Landing pages** pro vertikaly (retail, restaurace, korporat)
4. **Serie 6 produkty** -- HD226, XD236 uz existuji, meli bychom je pridat

---

## 5. POHLED ZAKAZNIKA

### 5.1 Prvni dojem
Zakaznik prijde na homepage a vidi:
- Textove logo "BrightSign.cz"
- Tmavy hero s textem "Profesionalni digital signage reseni"
- Tri trust signaly (rychle doruceni, zaruka, podpora)
- 8 produktovych karet

**Hodnoceni:** Pusobi to ciste a funkcne, ale ne jako etablovany e-shop. Chybi vizualni "wow" efekt, chybi dukaz ze jde o realnou firmu s realnou historii. B2B zakaznik, ktery rozhoduje o nakupu za desitky tisic, potrebuje vetsi duveru.

### 5.2 Produktova stranka
- Breadcrumbs funguje
- Galerie s lightboxem
- Specifikace, popis, souvisejici produkty
- Cena s DPH i bez DPH
- Add to cart button

**Hodnoceni:** Funkcni, ale schazi:
- Dostupnost (skladem/na objednavku) -- zobrazuje se na kartach ale ne vzdy na detailu
- Dodaci lhuta ("doruceni za 3-5 dni")
- Datasheet ke stazeni (link je v prekladu ale neni jasne zda funguje)
- Video/demo obsah

### 5.3 Checkout
- 4 kroky: kontakt, adresa, doprava, platba
- Progress bar s propojovacimi carami
- Stripe platba + bankovi prevod

**Hodnoceni:** Dobry zaklad, ale:
- Shipping options budou prazdne bez Packeta
- Chybi firemni udaje v checkout (ICO, DIC, firma)
- Chybi moznost vybrat fakturacni adresu

---

## 6. CENOVA STRATEGIE VS REALITA

### 6.1 Nase ceny (z PRODUCT_CATALOG.md)

| Model | Nase CZK | Nase EUR (cca) | COMM-TEC naklad |
|-------|----------|----------------|-----------------|
| AU335 | 5,800 | 230 | ~150 EUR |
| LS445 | 11,900 | 472 | ~330 EUR |
| HD225 | 14,900 | 591 | ~423 EUR |
| XD235 | 19,400 | 770 | ~507 EUR |
| XT245 | 24,400 | 968 | ~650 EUR |

### 6.2 Konkurence (dle WebSearch)

**CZ:**
- ab-com.cz -- prodava BrightSign, ceny neverejne (nutno kontaktovat)
- VDT Systems (shop.vdtsystems.cz) -- XT244 za 25,900 CZK
- brightsign.cz (nase stara Shoptet stranka) -- stale aktivni

**PL:**
- daars.pl -- HD225 za 3,099 PLN (cca 18,200 CZK / 720 EUR)
- c4i.com.pl -- HD225 za 1,199 PLN (cca 7,050 CZK / 280 EUR) -- POZOR: toto muze byt bez DPH
- supertech.pl -- HD225 za 2,334 PLN (cca 13,700 CZK / 544 EUR)

**EU:**
- brightsign-shop.eu (NL) -- ceny neverejne
- avgear.shop -- prodava v EU, doprava 20 EUR, zdarma nad 1000 EUR
- leunig.de (DE) -- prodava HD225, cena neverejne
- signamedia.de -- "Projektpreis" (na poptavku)

### 6.3 Analyza

**CR trh:** Nase ceny jsou konkurenceschopne. HD225 za 14,900 CZK (s DPH) je realni. VDT prodava XT244 (starsi!) za 25,900 CZK. Mame prostor.

**PL trh:** Situace je slozitejsi nez se zdalo:
- daars.pl prodava HD225 za 3,099 PLN s DPH = cca 720 EUR -- v tomto pripade mame obrovskou vyhobu (my 591 EUR)
- c4i.com.pl ukazuje 1,199 PLN -- to je podezrele nizke, pravdepodobne bez DPH nebo jde o starsi model
- supertech.pl za 2,334 PLN = cca 544 EUR -- blizko nasich cen

**Zaver:** Na polskem trhu je cenova arbitraz realna ale mensi nez jsme predpokladali. Meli bychom overit aktualni ceny primo na webech a upravit nasi PL cenovou strategii.

**SK trh:** Zadny lokalni e-shop. Zakaznici kupuji z CZ nebo z brightsign-shop.eu. Nase pozice je silna -- cestina, lokalni podpora.

**AT/DE trh:** Silna konkurence (visunext.de, leunig.de, signamedia.de). Tezke se prosadit bez lokalni reputace. Priority snizit.

### 6.4 DULEZITE: Serie 6
BrightSign uz vydal Serii 6 (HD226, XD236, atd.). Nas e-shop stale prodava Serii 5 (a 4). To je problem:
- Zakaznici hledajici nejnovejsi produkty nas najdou s "zastaralym" katalogem
- ab-com.cz uz nabizi XD236
- **MUSIME pridat Serii 6 do katalogu CO NEJDRIVE**

---

## 7. STAV JAZYKOVYCH MUTACI

| Jazyk | Soubor | Radky | Kompletnost | Poznamka |
|-------|--------|-------|-------------|----------|
| cs | cs.json | 655 | 100% | Referencni jazyk |
| sk | sk.json | 662 | 100% | Plne prelozeno |
| pl | pl.json | 662 | 100% | Plne prelozeno |
| en | en.json | 662 | 100% | Plne prelozeno |
| de | de.json | 662 | 100% | Plne prelozeno |

Prekladove soubory jsou kompletni a konzistentni. Mala odchylka v poctu radku (662 vs 655) je normalni -- muze jit o formatovaci rozdily.

**Pozitivni body:**
- Pravni texty (obchodni podminky, GDPR, reklamacni rad) jsou lokalizovane
- FAQ prelozene
- Specificke spec labely prelozene
- Cookie consent prelozeny

**Co overit:**
- Kvalita prekladu do polstiny a nemciny (strojovy preklad vs. nativni korektura)
- Lokalizace URL -- stranky maji ceske URL (hledani, kategorie, porovnani) i pro ostatni jazyky
- To je problem -- polsky zakaznik vidi `/pl/hledani?q=...` misto `/pl/szukaj?q=...`

---

## 8. SHRNUTI KRITICKEHO

### Musi byt hotovo pred launche (P0):
1. Hetzner VPS unlock + hardening
2. DNS nastaveni (brightsign.cz + api.brightsign.cz + minio.brightsign.cz)
3. Stripe live konfigurace + test objednavka
4. Packeta API integrace + shipping options
5. DB migrace (invoice modul)
6. Profesionalni logo (alespon SVG textove s ikonou)
7. Produktove fotky -- stazeni z brightsign.biz, nahrani do MinIO
8. Serie 6 produkty do katalogu
9. Firemni udaje v checkout (ICO, DIC, firma)
10. Smoke test celeho checkout flow

### Odhadovany cas do MVP launche:
- VPS + DNS + env: 1-2 dny (zavisi na Hetzner unlock)
- Packeta integrace: 2-3 dny
- Stripe setup: 0.5 dne
- Logo + obrazky: 1-2 dny
- Serie 6 import: 1 den
- Checkout fix + testing: 1-2 dny
- **Celkem: 7-12 pracovnich dni po odblokovani VPS**
