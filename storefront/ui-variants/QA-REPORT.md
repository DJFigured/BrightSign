# QA Report: UI Variant Prototypes

**Datum:** 2026-02-27
**Testováno:** 10 HTML variant + INDEX.html rozcestník
**Nástroje:** Playwright MCP (Chrome), manuální A11y audit
**Viewporty:** Desktop 1440px, Mobile 375px

---

## Souhrnná tabulka

| Varianta | Soubor | Desktop | Mobile 375px | Ceny OK | Diakritika | Overflow |
|----------|--------|---------|-------------|---------|------------|----------|
| INDEX | INDEX.html | OK | OK | n/a | OK | Bez |
| V1 Flagship | variant-1-flagship.html | OK | OK | OK | OK* | Bez |
| V2 Product Focus | variant-2-product-focus.html | OK | OK | OK | OK* | Bez |
| V3 Solutions | variant-3-solutions.html | OK | OK | OK | OPRAVENO | Bez |
| V4 Premium | variant-4-premium.html | OK | OK | OK | OPRAVENO | Bez |
| V5 Conversion | variant-5-conversion.html | OK | OK | OK | OPRAVENO | Bez |
| V6 Minimal | variant-1-minimal.html | OK | OK | OK | OPRAVENO | Bez |
| V7 Dark Tech | variant-2-dark-tech.html | OK | OK | OK | OPRAVENO | Bez |
| V8 Enterprise | variant-3-enterprise.html | OK | OK | OK | OPRAVENO | Bez |
| V9 Editorial | variant-4-editorial.html | OK | OK | OK | OPRAVENO | Bez |
| V10 Bold | variant-5-bold.html | OK | OK | OK | OPRAVENO | Bez |

\* V1 měla 1 chybu v announcement baru (opraveno). V2 měla překlep "výstranní" (opraveno).

---

## Ceny (bez DPH)

Všechny varianty konzistentní:

| Model | Cena | Status |
|-------|------|--------|
| HD226 | 6 900 Kč | OK ve všech 10 |
| HD1026 | 8 500 Kč | OK ve všech 10 |
| XD236 | 12 500 Kč | OK ve všech 10 |
| XD1036 | 24 400 Kč | OK ve všech 10 |

---

## A11y audit (Top 3: V1 Flagship, V4 Premium, V5 Conversion)

| Kontrola | V1 Flagship | V4 Premium | V5 Conversion |
|----------|-------------|------------|---------------|
| Images alt | OK | OK | OK |
| Links bez label | 0 | 0* | 0 |
| Buttons bez label | 0* | 0 | 0* |
| Focus ring (:focus-visible) | PŘIDÁNO | PŘIDÁNO | Existoval |
| prefers-reduced-motion | PŘIDÁNO | Existoval (4 rules) | Existoval (3 rules) |
| Bílá na cyan kontrast | ISSUE** | ISSUE** | ISSUE** |

\* Opraveno přidáním aria-label atributů.
\** Bílý text (#fff) na cyan (#00C4CC) pozadí má kontrast ~2.3:1, pod WCAG AA limitem (4.5:1). Neměněno kvůli pravidlu "barvy neměň" — doporučeno opravit při implementaci do Next.js (tmavší text na cyan tlačítkách).

---

## Nalezené a opravené problémy

### KRITICKÉ (opraveno)
1. **Chybějící diakritika v 8 souborech** (V3-V10) — veškerý český text byl bez háčků a čárek. Opraveno ve všech souborech.
2. **"Kc" místo "Kč"** — opraveno ve všech souborech jako součást diacritiky.

### VYSOKÉ (opraveno)
3. **V1 announcement bar** — "nyni v prodeji s 5letou zarukou" → "nyní v prodeji s 5letou zárukou"
4. **V2 překlep** — "výstranní" → "výstražní" (řádek 469)
5. **V5 zavádějící B2B cena** — "B2B od 10 000 Kc" → "B2B sleva 10–20%" (použila max 20% partnerskou slevu)
6. **V6+V7 nepravdivé tvrzení** — "Expedice do 48 hodin" → "Doručení do 3–5 dnů" (just-in-time model z COMM-TEC)
7. **V10 Wikimedia hotlink** — externí odkaz na Stripe SVG nahrazen inline textem

### STŘEDNÍ (opraveno)
8. **V9 gramatická chyba** — "svych prehravace" → "svých přehrávačů" (genitiv plurálu)
9. **V1 chybějící focus styly** — přidány :focus-visible pravidla
10. **V1 chybějící prefers-reduced-motion** — přidán @media query
11. **V1/V5 tlačítka bez aria-label** — přidány aria-label na search, user, hamburger, quantity, cart icon buttony
12. **V4 košík link bez label** — přidán aria-label="Košík"
13. **V4 chybějící focus styly** — přidány :focus-visible pravidla

### NÍZKÉ (ponecháno)
14. **Placeholder telefonní čísla** (+420 XXX XXX XXX) — očekáváno u prototypů, reálné číslo se doplní v produkci
15. **Bílý text na cyan kontrast** — nesplňuje WCAG AA, ale pravidlo "barvy neměň" zakazuje opravu v prototypech

---

## Vizuální poznámky

### Scroll-reveal animace
V4 Premium, V6 Minimal a V10 Bold používají scroll-triggered CSS animace (`.fade-in`), které skrývají produktové sekce dokud uživatel nescrollne. V fullPage screenshotech tyto sekce vypadají prázdné — v reálném prohlížení fungují správně.

- **V4:** Má `prefers-reduced-motion: reduce` handler, který vynoří vše ihned
- **V6:** Nemá reduced-motion support — doporučeno přidat
- **V10:** Nemá reduced-motion support — doporučeno přidat

### Mobile (375px)
Všech 10 variant projde bez horizontálního overflow na 375px. Ověřeno programaticky (`document.body.scrollWidth > window.innerWidth`).

---

## Screenshoty

Uloženy v `qa-screenshots/`:

| Soubor | Popis |
|--------|-------|
| INDEX-desktop-1440.png | Rozcestník desktop |
| INDEX-mobile-375.png | Rozcestník mobile |
| V1-flagship-desktop.png | V1 desktop |
| V1-flagship-mobile.png | V1 mobile |
| V2-product-focus-desktop.png | V2 desktop |
| V2-product-focus-mobile.png | V2 mobile |
| V3-solutions-desktop.png | V3 desktop |
| V3-solutions-mobile.png | V3 mobile |
| V4-premium-desktop.png | V4 desktop |
| V5-conversion-desktop.png | V5 desktop |
| V6-minimal-desktop.png | V6 desktop |
| V6-minimal-mobile.png | V6 mobile |
| V7-dark-tech-desktop.png | V7 desktop |
| V7-dark-tech-mobile.png | V7 mobile |
| V8-enterprise-desktop.png | V8 desktop |
| V8-enterprise-mobile.png | V8 mobile |
| V9-editorial-desktop.png | V9 desktop |
| V9-editorial-mobile-375.png | V9 mobile |
| V10-bold-desktop.png | V10 desktop |
| V10-bold-mobile-375.png | V10 mobile |

---

## Doporučení pro Next.js implementaci

1. **Cyan button kontrast** — použít tmavší text (#0d0520 nebo #2D1B69) na cyan (#00C4CC) pozadí pro WCAG AA
2. **V6/V10 reduced-motion** — přidat `@media (prefers-reduced-motion: reduce)` jako má V4/V5
3. **Telefonní čísla** — nahradit reálným kontaktem
4. **Scroll-reveal** — pokud se zachová, přidat fallback pro reduced-motion preference
5. **Product images** — prototypy používají placeholder ikony, v produkci nahradit profesionálními fotkami
