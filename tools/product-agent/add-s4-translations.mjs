/**
 * Add S4 product translations (sk, pl, en, de) to translations.json
 * 
 * The 8 S4 products currently only have Czech descriptions.
 * This script adds Slovak, Polish, English and German translations.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TRANSLATIONS_PATH = join(__dirname, 'data', 'generated', 'translations.json');
const TIMESTAMP = '2026-02-23T10:00:00.000Z';

// ─── Translations ────────────────────────────────────────────────────────────

const s4Translations = {
  // ═══ HD224 ═══
  HD224: {
    sk: {
      modelNumber: 'HD224',
      locale: 'sk',
      title: 'BrightSign HD224 – Vstupný 4K prehrávač (dopredaj)',
      subtitle: 'Spoľahlivý 4K prehrávač Séria 4 za dopredajovú cenu. Predchodca HD225.',
      description: '<p>BrightSign HD224 je vstupný 4K prehrávač zo <strong>Série 4</strong>, predchodca aktuálneho modelu HD225. Ponúka spoľahlivé 4K prehrávanie v 8-bit kvalite za výrazne nižšiu cenu vďaka dopredajovej ponuke.</p><h3>Kľúčové vlastnosti</h3><ul><li><strong>4K video dekódovanie</strong> – 4K obsah v 8-bit kvalite pri 60p s H.265 a H.264</li><li><strong>HTML5 podpora</strong> – modulárna 2D motion grafika s Chromium kompatibilitou</li><li><strong>Duálne Full HD</strong> – súčasné prehrávanie dvoch Full HD streamov</li><li><strong>Dopredajová cena</strong> – výrazne nižšia cena oproti aktuálnej Sérii 5</li></ul><p><strong>Tip:</strong> Pre nové projekty odporúčame upgrade na <strong>HD225 (Séria 5)</strong> s dlhšou zárukou a pokročilejšími funkciami.</p>',
      seoTitle: 'BrightSign HD224 - 4K Digital Signage Prehrávač | BrightSign.cz',
      seoDescription: 'HD224 4K prehrávač zo Série 4 za dopredajovú cenu. H.265, HTML5, duálne Full HD. Skladom, doprava do 48h.',
      translatedAt: TIMESTAMP,
    },
    pl: {
      modelNumber: 'HD224',
      locale: 'pl',
      title: 'BrightSign HD224 – Podstawowy odtwarzacz 4K (wyprzedaż)',
      subtitle: 'Niezawodny odtwarzacz 4K z Serii 4 w cenie wyprzedażowej. Poprzednik HD225.',
      description: '<p>BrightSign HD224 to podstawowy odtwarzacz 4K z <strong>Serii 4</strong>, poprzednik aktualnego modelu HD225. Oferuje niezawodne odtwarzanie 4K w jakości 8-bit w znacznie niższej cenie dzięki ofercie wyprzedażowej.</p><h3>Kluczowe właściwości</h3><ul><li><strong>Dekodowanie wideo 4K</strong> – treści 4K w jakości 8-bit przy 60p z H.265 i H.264</li><li><strong>Obsługa HTML5</strong> – modularna grafika 2D motion z kompatybilnością Chromium</li><li><strong>Podwójne Full HD</strong> – jednoczesne odtwarzanie dwóch strumieni Full HD</li><li><strong>Cena wyprzedażowa</strong> – znacznie niższa cena w porównaniu z aktualną Serią 5</li></ul><p><strong>Wskazówka:</strong> Do nowych projektów zalecamy upgrade do <strong>HD225 (Seria 5)</strong> z dłuższą gwarancją i zaawansowanymi funkcjami.</p>',
      seoTitle: 'BrightSign HD224 - Odtwarzacz Digital Signage 4K | BrightSign.cz',
      seoDescription: 'HD224 odtwarzacz 4K z Serii 4 w cenie wyprzedażowej. H.265, HTML5, podwójne Full HD. Na stanie, wysyłka do 48h.',
      translatedAt: TIMESTAMP,
    },
    en: {
      modelNumber: 'HD224',
      locale: 'en',
      title: 'BrightSign HD224 – Entry-Level 4K Player (Clearance)',
      subtitle: 'Reliable Series 4 4K player at clearance pricing. Predecessor to HD225.',
      description: '<p>BrightSign HD224 is an entry-level 4K player from <strong>Series 4</strong>, the predecessor to the current HD225 model. It delivers reliable 4K playback in 8-bit quality at a significantly reduced clearance price.</p><h3>Key Features</h3><ul><li><strong>4K video decoding</strong> – 4K content in 8-bit quality at 60p with H.265 and H.264</li><li><strong>HTML5 support</strong> – modular 2D motion graphics with Chromium compatibility</li><li><strong>Dual Full HD</strong> – simultaneous playback of two Full HD streams</li><li><strong>Clearance price</strong> – significantly lower price compared to current Series 5</li></ul><p><strong>Tip:</strong> For new projects we recommend upgrading to <strong>HD225 (Series 5)</strong> with extended warranty and advanced features.</p>',
      seoTitle: 'BrightSign HD224 - 4K Digital Signage Player | BrightSign.cz',
      seoDescription: 'HD224 Series 4 4K player at clearance price. H.265, HTML5, dual Full HD. In stock, 48h delivery.',
      translatedAt: TIMESTAMP,
    },
    de: {
      modelNumber: 'HD224',
      locale: 'de',
      title: 'BrightSign HD224 – 4K-Einstiegsplayer (Ausverkauf)',
      subtitle: 'Zuverlässiger 4K-Player der Serie 4 zum Ausverkaufspreis. Vorgänger des HD225.',
      description: '<p>BrightSign HD224 ist ein 4K-Einstiegsplayer aus der <strong>Serie 4</strong>, der Vorgänger des aktuellen Modells HD225. Er bietet zuverlässige 4K-Wiedergabe in 8-Bit-Qualität zu einem deutlich reduzierten Ausverkaufspreis.</p><h3>Hauptmerkmale</h3><ul><li><strong>4K-Videodekodierung</strong> – 4K-Inhalte in 8-Bit-Qualität bei 60p mit H.265 und H.264</li><li><strong>HTML5-Unterstützung</strong> – modulare 2D-Motion-Grafik mit Chromium-Kompatibilität</li><li><strong>Duales Full HD</strong> – gleichzeitige Wiedergabe von zwei Full-HD-Streams</li><li><strong>Ausverkaufspreis</strong> – deutlich niedrigerer Preis im Vergleich zur aktuellen Serie 5</li></ul><p><strong>Tipp:</strong> Für neue Projekte empfehlen wir ein Upgrade auf den <strong>HD225 (Serie 5)</strong> mit längerer Garantie und erweiterten Funktionen.</p>',
      seoTitle: 'BrightSign HD224 - 4K Digital Signage Player | BrightSign.cz',
      seoDescription: 'HD224 Serie 4 4K-Player zum Ausverkaufspreis. H.265, HTML5, duales Full HD. Auf Lager, Lieferung in 48h.',
      translatedAt: TIMESTAMP,
    },
  },

  // ═══ HD1024 ═══
  HD1024: {
    sk: {
      modelNumber: 'HD1024',
      locale: 'sk',
      title: 'BrightSign HD1024 – Vstupný 4K prehrávač s rozšíreným I/O (dopredaj)',
      subtitle: 'Spoľahlivý 4K prehrávač Séria 4 s rozšíreným I/O za dopredajovú cenu. Predchodca HD1025.',
      description: '<p>BrightSign HD1024 je vstupný 4K prehrávač zo <strong>Série 4</strong> s rozšíreným I/O balíčkom, predchodca aktuálneho HD1025. Ponúka spoľahlivé 4K prehrávanie s bohatšími možnosťami pripojenia za zvýhodnenú cenu.</p><h3>Kľúčové vlastnosti</h3><ul><li><strong>4K video dekódovanie</strong> – 4K obsah v 8-bit kvalite pri 60p</li><li><strong>Rozšírený I/O balíček</strong> – viac portov pre senzory a dotykové displeje</li><li><strong>Interaktívne HTML5</strong> – pokročilá 2D motion grafika</li><li><strong>Dopredajová cena</strong> – výrazná úspora oproti Sérii 5</li></ul><p><strong>Tip:</strong> Pre nové projekty odporúčame <strong>HD1025 (Séria 5)</strong> s 5-ročnou zárukou.</p>',
      seoTitle: 'BrightSign HD1024 - 4K Prehrávač s rozšíreným I/O | BrightSign.cz',
      seoDescription: 'HD1024 4K prehrávač zo Série 4 s rozšíreným I/O za dopredajovú cenu. Interaktívne HTML5. Skladom, doprava do 48h.',
      translatedAt: TIMESTAMP,
    },
    pl: {
      modelNumber: 'HD1024',
      locale: 'pl',
      title: 'BrightSign HD1024 – Podstawowy odtwarzacz 4K z rozszerzonym I/O (wyprzedaż)',
      subtitle: 'Niezawodny odtwarzacz 4K z Serii 4 z rozszerzonym I/O w cenie wyprzedażowej. Poprzednik HD1025.',
      description: '<p>BrightSign HD1024 to podstawowy odtwarzacz 4K z <strong>Serii 4</strong> z rozszerzonym pakietem I/O, poprzednik aktualnego HD1025. Oferuje niezawodne odtwarzanie 4K z bogatszymi możliwościami połączeń w promocyjnej cenie.</p><h3>Kluczowe właściwości</h3><ul><li><strong>Dekodowanie wideo 4K</strong> – treści 4K w jakości 8-bit przy 60p</li><li><strong>Rozszerzony pakiet I/O</strong> – więcej portów do czujników i ekranów dotykowych</li><li><strong>Interaktywne HTML5</strong> – zaawansowana grafika 2D motion</li><li><strong>Cena wyprzedażowa</strong> – znaczna oszczędność w porównaniu z Serią 5</li></ul><p><strong>Wskazówka:</strong> Do nowych projektów zalecamy <strong>HD1025 (Seria 5)</strong> z 5-letnią gwarancją.</p>',
      seoTitle: 'BrightSign HD1024 - Odtwarzacz 4K z rozszerzonym I/O | BrightSign.cz',
      seoDescription: 'HD1024 odtwarzacz 4K z Serii 4 z rozszerzonym I/O w cenie wyprzedażowej. Interaktywne HTML5. Na stanie, wysyłka do 48h.',
      translatedAt: TIMESTAMP,
    },
    en: {
      modelNumber: 'HD1024',
      locale: 'en',
      title: 'BrightSign HD1024 – Entry-Level 4K Player with Expanded I/O (Clearance)',
      subtitle: 'Reliable Series 4 4K player with expanded I/O at clearance pricing. Predecessor to HD1025.',
      description: '<p>BrightSign HD1024 is an entry-level 4K player from <strong>Series 4</strong> with an expanded I/O package, the predecessor to the current HD1025. It delivers reliable 4K playback with richer connectivity options at a discounted price.</p><h3>Key Features</h3><ul><li><strong>4K video decoding</strong> – 4K content in 8-bit quality at 60p</li><li><strong>Expanded I/O package</strong> – more ports for sensors and touch displays</li><li><strong>Interactive HTML5</strong> – advanced 2D motion graphics</li><li><strong>Clearance price</strong> – significant savings compared to Series 5</li></ul><p><strong>Tip:</strong> For new projects we recommend <strong>HD1025 (Series 5)</strong> with a 5-year warranty.</p>',
      seoTitle: 'BrightSign HD1024 - 4K Player with Expanded I/O | BrightSign.cz',
      seoDescription: 'HD1024 Series 4 4K player with expanded I/O at clearance price. Interactive HTML5. In stock, 48h delivery.',
      translatedAt: TIMESTAMP,
    },
    de: {
      modelNumber: 'HD1024',
      locale: 'de',
      title: 'BrightSign HD1024 – 4K-Einstiegsplayer mit erweitertem I/O (Ausverkauf)',
      subtitle: 'Zuverlässiger 4K-Player der Serie 4 mit erweitertem I/O zum Ausverkaufspreis. Vorgänger des HD1025.',
      description: '<p>BrightSign HD1024 ist ein 4K-Einstiegsplayer aus der <strong>Serie 4</strong> mit erweitertem I/O-Paket, der Vorgänger des aktuellen HD1025. Er bietet zuverlässige 4K-Wiedergabe mit umfangreicheren Anschlussmöglichkeiten zu einem vergünstigten Preis.</p><h3>Hauptmerkmale</h3><ul><li><strong>4K-Videodekodierung</strong> – 4K-Inhalte in 8-Bit-Qualität bei 60p</li><li><strong>Erweitertes I/O-Paket</strong> – mehr Anschlüsse für Sensoren und Touchdisplays</li><li><strong>Interaktives HTML5</strong> – fortgeschrittene 2D-Motion-Grafik</li><li><strong>Ausverkaufspreis</strong> – deutliche Ersparnis gegenüber Serie 5</li></ul><p><strong>Tipp:</strong> Für neue Projekte empfehlen wir den <strong>HD1025 (Serie 5)</strong> mit 5 Jahren Garantie.</p>',
      seoTitle: 'BrightSign HD1024 - 4K-Player mit erweitertem I/O | BrightSign.cz',
      seoDescription: 'HD1024 Serie 4 4K-Player mit erweitertem I/O zum Ausverkaufspreis. Interaktives HTML5. Auf Lager, Lieferung in 48h.',
      translatedAt: TIMESTAMP,
    },
  },

  // ═══ XD234 ═══
  XD234: {
    sk: {
      modelNumber: 'XD234',
      locale: 'sk',
      title: 'BrightSign XD234 – Výkonný 4K prehrávač (dopredaj)',
      subtitle: 'Výkonný 4K prehrávač Séria 4 s WebGL grafikou za dopredajovú cenu. Predchodca XD235.',
      description: '<p>BrightSign XD234 je výkonný 4K prehrávač zo <strong>Série 4</strong>, predchodca aktuálneho XD235. Ponúka pokročilé dekódovanie videa s plynulými WebGL animáciami za zvýhodnenú cenu.</p><h3>Kľúčové vlastnosti</h3><ul><li><strong>Pokročilé 4K dekódovanie</strong> – H.265 pri 60p v 8-bit kvalite</li><li><strong>WebGL grafika</strong> – plynulé 2D WebGL animácie pre dynamický obsah</li><li><strong>4K IP streaming</strong> – podpora živého vysielania</li><li><strong>Dopredajová cena</strong> – profesionálny výkon za zlomok ceny</li></ul><p><strong>Tip:</strong> Pre nové projekty odporúčame <strong>XD235 (Séria 5)</strong> s 5-ročnou zárukou.</p>',
      seoTitle: 'BrightSign XD234 - Výkonný 4K Digital Signage Prehrávač | BrightSign.cz',
      seoDescription: 'XD234 výkonný 4K prehrávač zo Série 4 za dopredajovú cenu. WebGL, IP streaming, H.265. Skladom, doprava do 48h.',
      translatedAt: TIMESTAMP,
    },
    pl: {
      modelNumber: 'XD234',
      locale: 'pl',
      title: 'BrightSign XD234 – Wydajny odtwarzacz 4K (wyprzedaż)',
      subtitle: 'Wydajny odtwarzacz 4K z Serii 4 z grafiką WebGL w cenie wyprzedażowej. Poprzednik XD235.',
      description: '<p>BrightSign XD234 to wydajny odtwarzacz 4K z <strong>Serii 4</strong>, poprzednik aktualnego XD235. Oferuje zaawansowane dekodowanie wideo z płynnymi animacjami WebGL w promocyjnej cenie.</p><h3>Kluczowe właściwości</h3><ul><li><strong>Zaawansowane dekodowanie 4K</strong> – H.265 przy 60p w jakości 8-bit</li><li><strong>Grafika WebGL</strong> – płynne animacje 2D WebGL dla dynamicznych treści</li><li><strong>Streaming 4K IP</strong> – obsługa transmisji na żywo</li><li><strong>Cena wyprzedażowa</strong> – profesjonalna wydajność za ułamek ceny</li></ul><p><strong>Wskazówka:</strong> Do nowych projektów zalecamy <strong>XD235 (Seria 5)</strong> z 5-letnią gwarancją.</p>',
      seoTitle: 'BrightSign XD234 - Wydajny Odtwarzacz Digital Signage 4K | BrightSign.cz',
      seoDescription: 'XD234 wydajny odtwarzacz 4K z Serii 4 w cenie wyprzedażowej. WebGL, streaming IP, H.265. Na stanie, wysyłka do 48h.',
      translatedAt: TIMESTAMP,
    },
    en: {
      modelNumber: 'XD234',
      locale: 'en',
      title: 'BrightSign XD234 – High-Performance 4K Player (Clearance)',
      subtitle: 'Powerful Series 4 4K player with WebGL graphics at clearance pricing. Predecessor to XD235.',
      description: '<p>BrightSign XD234 is a high-performance 4K player from <strong>Series 4</strong>, the predecessor to the current XD235. It offers advanced video decoding with smooth WebGL animations at a discounted price.</p><h3>Key Features</h3><ul><li><strong>Advanced 4K decoding</strong> – H.265 at 60p in 8-bit quality</li><li><strong>WebGL graphics</strong> – smooth 2D WebGL animations for dynamic content</li><li><strong>4K IP streaming</strong> – live broadcast support</li><li><strong>Clearance price</strong> – professional performance at a fraction of the cost</li></ul><p><strong>Tip:</strong> For new projects we recommend <strong>XD235 (Series 5)</strong> with a 5-year warranty.</p>',
      seoTitle: 'BrightSign XD234 - High-Performance 4K Digital Signage Player | BrightSign.cz',
      seoDescription: 'XD234 Series 4 high-performance 4K player at clearance price. WebGL, IP streaming, H.265. In stock, 48h delivery.',
      translatedAt: TIMESTAMP,
    },
    de: {
      modelNumber: 'XD234',
      locale: 'de',
      title: 'BrightSign XD234 – Leistungsstarker 4K-Player (Ausverkauf)',
      subtitle: 'Leistungsstarker 4K-Player der Serie 4 mit WebGL-Grafik zum Ausverkaufspreis. Vorgänger des XD235.',
      description: '<p>BrightSign XD234 ist ein leistungsstarker 4K-Player aus der <strong>Serie 4</strong>, der Vorgänger des aktuellen XD235. Er bietet fortschrittliche Videodekodierung mit flüssigen WebGL-Animationen zu einem vergünstigten Preis.</p><h3>Hauptmerkmale</h3><ul><li><strong>Fortschrittliche 4K-Dekodierung</strong> – H.265 bei 60p in 8-Bit-Qualität</li><li><strong>WebGL-Grafik</strong> – flüssige 2D-WebGL-Animationen für dynamische Inhalte</li><li><strong>4K-IP-Streaming</strong> – Unterstützung für Live-Übertragungen</li><li><strong>Ausverkaufspreis</strong> – professionelle Leistung zum Bruchteil des Preises</li></ul><p><strong>Tipp:</strong> Für neue Projekte empfehlen wir den <strong>XD235 (Serie 5)</strong> mit 5 Jahren Garantie.</p>',
      seoTitle: 'BrightSign XD234 - Leistungsstarker 4K Digital Signage Player | BrightSign.cz',
      seoDescription: 'XD234 Serie 4 leistungsstarker 4K-Player zum Ausverkaufspreis. WebGL, IP-Streaming, H.265. Auf Lager, Lieferung in 48h.',
      translatedAt: TIMESTAMP,
    },
  },

  // ═══ XD1034 ═══
  XD1034: {
    sk: {
      modelNumber: 'XD1034',
      locale: 'sk',
      title: 'BrightSign XD1034 – Výkonný 4K prehrávač s rozšíreným I/O (dopredaj)',
      subtitle: 'Výkonný 4K prehrávač Séria 4 s WebGL a rozšíreným I/O za dopredajovú cenu. Predchodca XD1035.',
      description: '<p>BrightSign XD1034 je výkonný 4K prehrávač zo <strong>Série 4</strong> s rozšíreným I/O, predchodca XD1035. Kombinuje WebGL grafiku s bohatou konektivitou za dopredajovú cenu.</p><h3>Kľúčové vlastnosti</h3><ul><li><strong>Pokročilé 4K dekódovanie</strong> – H.265 pri 60p v 8-bit kvalite</li><li><strong>Rozšírený I/O</strong> – viac portov pre senzory a dotykové displeje</li><li><strong>WebGL grafika</strong> – plynulé 2D WebGL animácie</li><li><strong>Dopredajová cena</strong> – pokročilý výkon za výrazne nižšiu cenu</li></ul><p><strong>Tip:</strong> Pre nové projekty odporúčame <strong>XD1035 (Séria 5)</strong> s 5-ročnou zárukou.</p>',
      seoTitle: 'BrightSign XD1034 - 4K Prehrávač s rozšíreným I/O | BrightSign.cz',
      seoDescription: 'XD1034 výkonný 4K prehrávač zo Série 4 s rozšíreným I/O za dopredajovú cenu. WebGL, H.265. Skladom, doprava do 48h.',
      translatedAt: TIMESTAMP,
    },
    pl: {
      modelNumber: 'XD1034',
      locale: 'pl',
      title: 'BrightSign XD1034 – Wydajny odtwarzacz 4K z rozszerzonym I/O (wyprzedaż)',
      subtitle: 'Wydajny odtwarzacz 4K z Serii 4 z WebGL i rozszerzonym I/O w cenie wyprzedażowej. Poprzednik XD1035.',
      description: '<p>BrightSign XD1034 to wydajny odtwarzacz 4K z <strong>Serii 4</strong> z rozszerzonym I/O, poprzednik XD1035. Łączy grafikę WebGL z bogatą łącznością w cenie wyprzedażowej.</p><h3>Kluczowe właściwości</h3><ul><li><strong>Zaawansowane dekodowanie 4K</strong> – H.265 przy 60p w jakości 8-bit</li><li><strong>Rozszerzony I/O</strong> – więcej portów do czujników i ekranów dotykowych</li><li><strong>Grafika WebGL</strong> – płynne animacje 2D WebGL</li><li><strong>Cena wyprzedażowa</strong> – zaawansowana wydajność w znacznie niższej cenie</li></ul><p><strong>Wskazówka:</strong> Do nowych projektów zalecamy <strong>XD1035 (Seria 5)</strong> z 5-letnią gwarancją.</p>',
      seoTitle: 'BrightSign XD1034 - Odtwarzacz 4K z rozszerzonym I/O | BrightSign.cz',
      seoDescription: 'XD1034 wydajny odtwarzacz 4K z Serii 4 z rozszerzonym I/O w cenie wyprzedażowej. WebGL, H.265. Na stanie, wysyłka do 48h.',
      translatedAt: TIMESTAMP,
    },
    en: {
      modelNumber: 'XD1034',
      locale: 'en',
      title: 'BrightSign XD1034 – High-Performance 4K Player with Expanded I/O (Clearance)',
      subtitle: 'Powerful Series 4 4K player with WebGL and expanded I/O at clearance pricing. Predecessor to XD1035.',
      description: '<p>BrightSign XD1034 is a high-performance 4K player from <strong>Series 4</strong> with expanded I/O, the predecessor to XD1035. It combines WebGL graphics with rich connectivity at a clearance price.</p><h3>Key Features</h3><ul><li><strong>Advanced 4K decoding</strong> – H.265 at 60p in 8-bit quality</li><li><strong>Expanded I/O</strong> – more ports for sensors and touch displays</li><li><strong>WebGL graphics</strong> – smooth 2D WebGL animations</li><li><strong>Clearance price</strong> – advanced performance at a significantly lower price</li></ul><p><strong>Tip:</strong> For new projects we recommend <strong>XD1035 (Series 5)</strong> with a 5-year warranty.</p>',
      seoTitle: 'BrightSign XD1034 - 4K Player with Expanded I/O | BrightSign.cz',
      seoDescription: 'XD1034 Series 4 4K player with expanded I/O at clearance price. WebGL graphics, H.265. In stock, 48h delivery.',
      translatedAt: TIMESTAMP,
    },
    de: {
      modelNumber: 'XD1034',
      locale: 'de',
      title: 'BrightSign XD1034 – Leistungsstarker 4K-Player mit erweitertem I/O (Ausverkauf)',
      subtitle: 'Leistungsstarker 4K-Player der Serie 4 mit WebGL und erweitertem I/O zum Ausverkaufspreis. Vorgänger des XD1035.',
      description: '<p>BrightSign XD1034 ist ein leistungsstarker 4K-Player aus der <strong>Serie 4</strong> mit erweitertem I/O, der Vorgänger des XD1035. Er kombiniert WebGL-Grafik mit umfangreicher Konnektivität zum Ausverkaufspreis.</p><h3>Hauptmerkmale</h3><ul><li><strong>Fortschrittliche 4K-Dekodierung</strong> – H.265 bei 60p in 8-Bit-Qualität</li><li><strong>Erweitertes I/O</strong> – mehr Anschlüsse für Sensoren und Touchdisplays</li><li><strong>WebGL-Grafik</strong> – flüssige 2D-WebGL-Animationen</li><li><strong>Ausverkaufspreis</strong> – fortschrittliche Leistung zu einem deutlich niedrigeren Preis</li></ul><p><strong>Tipp:</strong> Für neue Projekte empfehlen wir den <strong>XD1035 (Serie 5)</strong> mit 5 Jahren Garantie.</p>',
      seoTitle: 'BrightSign XD1034 - 4K-Player mit erweitertem I/O | BrightSign.cz',
      seoDescription: 'XD1034 Serie 4 4K-Player mit erweitertem I/O zum Ausverkaufspreis. WebGL-Grafik, H.265. Auf Lager, Lieferung in 48h.',
      translatedAt: TIMESTAMP,
    },
  },

  // ═══ XT244 ═══
  XT244: {
    sk: {
      modelNumber: 'XT244',
      locale: 'sk',
      title: 'BrightSign XT244 – Prémiový prehrávač s duálnym HDMI (dopredaj)',
      subtitle: 'Prémiový prehrávač Séria 4 s duálnym 4K, PoE+ a 3D WebGL za dopredajovú cenu. Predchodca XT245.',
      description: '<p>BrightSign XT244 je prémiový prehrávač zo <strong>Série 4</strong>, predchodca XT245. Ponúka duálne HDMI výstupy, PoE+ napájanie a 3D WebGL grafiku za dopredajovú cenu.</p><h3>Kľúčové vlastnosti</h3><ul><li><strong>Duálne 4K dekódovanie</strong> – dva nezávislé 4K streamy v 8-bit kvalite</li><li><strong>PoE+ napájanie</strong> – dáta aj napájanie cez jeden kábel</li><li><strong>3D WebGL grafika</strong> – pokročilé vizualizácie a interaktívny obsah</li><li><strong>Dopredajová cena</strong> – enterprise výkon za výrazne nižšiu cenu</li></ul><p><strong>Tip:</strong> Pre nové projekty odporúčame <strong>XT245 (Séria 5)</strong> s 8K podporou a NPU.</p>',
      seoTitle: 'BrightSign XT244 - Prémiový Prehrávač s duálnym HDMI | BrightSign.cz',
      seoDescription: 'XT244 prémiový prehrávač zo Série 4 za dopredajovú cenu. Duálne 4K, PoE+, 3D WebGL. Skladom, doprava do 48h.',
      translatedAt: TIMESTAMP,
    },
    pl: {
      modelNumber: 'XT244',
      locale: 'pl',
      title: 'BrightSign XT244 – Odtwarzacz premium z podwójnym HDMI (wyprzedaż)',
      subtitle: 'Odtwarzacz premium z Serii 4 z podwójnym 4K, PoE+ i 3D WebGL w cenie wyprzedażowej. Poprzednik XT245.',
      description: '<p>BrightSign XT244 to odtwarzacz premium z <strong>Serii 4</strong>, poprzednik XT245. Oferuje podwójne wyjścia HDMI, zasilanie PoE+ oraz grafikę 3D WebGL w cenie wyprzedażowej.</p><h3>Kluczowe właściwości</h3><ul><li><strong>Podwójne dekodowanie 4K</strong> – dwa niezależne strumienie 4K w jakości 8-bit</li><li><strong>Zasilanie PoE+</strong> – dane i zasilanie przez jeden kabel</li><li><strong>Grafika 3D WebGL</strong> – zaawansowane wizualizacje i interaktywne treści</li><li><strong>Cena wyprzedażowa</strong> – wydajność klasy enterprise w znacznie niższej cenie</li></ul><p><strong>Wskazówka:</strong> Do nowych projektów zalecamy <strong>XT245 (Seria 5)</strong> z obsługą 8K i NPU.</p>',
      seoTitle: 'BrightSign XT244 - Odtwarzacz Premium z podwójnym HDMI | BrightSign.cz',
      seoDescription: 'XT244 odtwarzacz premium z Serii 4 w cenie wyprzedażowej. Podwójne 4K, PoE+, 3D WebGL. Na stanie, wysyłka do 48h.',
      translatedAt: TIMESTAMP,
    },
    en: {
      modelNumber: 'XT244',
      locale: 'en',
      title: 'BrightSign XT244 – Premium Player with Dual HDMI (Clearance)',
      subtitle: 'Premium Series 4 player with dual 4K, PoE+ and 3D WebGL at clearance pricing. Predecessor to XT245.',
      description: '<p>BrightSign XT244 is a premium player from <strong>Series 4</strong>, the predecessor to XT245. It features dual HDMI outputs, PoE+ power and 3D WebGL graphics at a clearance price.</p><h3>Key Features</h3><ul><li><strong>Dual 4K decoding</strong> – two independent 4K streams in 8-bit quality</li><li><strong>PoE+ power</strong> – data and power over a single cable</li><li><strong>3D WebGL graphics</strong> – advanced visualizations and interactive content</li><li><strong>Clearance price</strong> – enterprise performance at a significantly lower price</li></ul><p><strong>Tip:</strong> For new projects we recommend <strong>XT245 (Series 5)</strong> with 8K support and NPU.</p>',
      seoTitle: 'BrightSign XT244 - Premium Player with Dual HDMI | BrightSign.cz',
      seoDescription: 'XT244 Series 4 premium player at clearance price. Dual 4K, PoE+, 3D WebGL. In stock, 48h delivery.',
      translatedAt: TIMESTAMP,
    },
    de: {
      modelNumber: 'XT244',
      locale: 'de',
      title: 'BrightSign XT244 – Premium-Player mit dualem HDMI (Ausverkauf)',
      subtitle: 'Premium-Player der Serie 4 mit dualem 4K, PoE+ und 3D-WebGL zum Ausverkaufspreis. Vorgänger des XT245.',
      description: '<p>BrightSign XT244 ist ein Premium-Player aus der <strong>Serie 4</strong>, der Vorgänger des XT245. Er bietet duale HDMI-Ausgänge, PoE+-Stromversorgung und 3D-WebGL-Grafik zum Ausverkaufspreis.</p><h3>Hauptmerkmale</h3><ul><li><strong>Duale 4K-Dekodierung</strong> – zwei unabhängige 4K-Streams in 8-Bit-Qualität</li><li><strong>PoE+-Stromversorgung</strong> – Daten und Strom über ein einziges Kabel</li><li><strong>3D-WebGL-Grafik</strong> – fortschrittliche Visualisierungen und interaktive Inhalte</li><li><strong>Ausverkaufspreis</strong> – Enterprise-Leistung zu einem deutlich niedrigeren Preis</li></ul><p><strong>Tipp:</strong> Für neue Projekte empfehlen wir den <strong>XT245 (Serie 5)</strong> mit 8K-Unterstützung und NPU.</p>',
      seoTitle: 'BrightSign XT244 - Premium-Player mit dualem HDMI | BrightSign.cz',
      seoDescription: 'XT244 Serie 4 Premium-Player zum Ausverkaufspreis. Duales 4K, PoE+, 3D-WebGL. Auf Lager, Lieferung in 48h.',
      translatedAt: TIMESTAMP,
    },
  },

  // ═══ XT1144 ═══
  XT1144: {
    sk: {
      modelNumber: 'XT1144',
      locale: 'sk',
      title: 'BrightSign XT1144 – Prémiový prehrávač s rozšíreným I/O (dopredaj)',
      subtitle: 'Prémiový prehrávač Séria 4 s maximálnou konektivitou a PoE+ za dopredajovú cenu. Predchodca XT1145.',
      description: '<p>BrightSign XT1144 je prémiový prehrávač zo <strong>Série 4</strong> s rozšíreným I/O, predchodca XT1145. Ponúka maximálnu konektivitu s duálnymi HDMI výstupmi a PoE+ za dopredajovú cenu.</p><h3>Kľúčové vlastnosti</h3><ul><li><strong>Duálne 4K dekódovanie</strong> – dva nezávislé 4K streamy v 8-bit kvalite</li><li><strong>Rozšírený I/O</strong> – maximum portov pre enterprise inštalácie</li><li><strong>PoE+ napájanie</strong> – dáta aj napájanie cez jeden kábel</li><li><strong>Dopredajová cena</strong> – prémiové funkcie za výrazne nižšiu cenu</li></ul><p><strong>Tip:</strong> Pre nové projekty odporúčame <strong>XT1145 (Séria 5)</strong> s 8K, HDMI vstupom a NPU.</p>',
      seoTitle: 'BrightSign XT1144 - Prémiový Prehrávač s rozšíreným I/O | BrightSign.cz',
      seoDescription: 'XT1144 prémiový prehrávač zo Série 4 za dopredajovú cenu. Duálne 4K, rozšírený I/O, PoE+. Skladom, doprava do 48h.',
      translatedAt: TIMESTAMP,
    },
    pl: {
      modelNumber: 'XT1144',
      locale: 'pl',
      title: 'BrightSign XT1144 – Odtwarzacz premium z rozszerzonym I/O (wyprzedaż)',
      subtitle: 'Odtwarzacz premium z Serii 4 z maksymalną łącznością i PoE+ w cenie wyprzedażowej. Poprzednik XT1145.',
      description: '<p>BrightSign XT1144 to odtwarzacz premium z <strong>Serii 4</strong> z rozszerzonym I/O, poprzednik XT1145. Oferuje maksymalną łączność z podwójnymi wyjściami HDMI i PoE+ w cenie wyprzedażowej.</p><h3>Kluczowe właściwości</h3><ul><li><strong>Podwójne dekodowanie 4K</strong> – dwa niezależne strumienie 4K w jakości 8-bit</li><li><strong>Rozszerzony I/O</strong> – maksymalna liczba portów dla instalacji enterprise</li><li><strong>Zasilanie PoE+</strong> – dane i zasilanie przez jeden kabel</li><li><strong>Cena wyprzedażowa</strong> – funkcje premium w znacznie niższej cenie</li></ul><p><strong>Wskazówka:</strong> Do nowych projektów zalecamy <strong>XT1145 (Seria 5)</strong> z 8K, wejściem HDMI i NPU.</p>',
      seoTitle: 'BrightSign XT1144 - Odtwarzacz Premium z rozszerzonym I/O | BrightSign.cz',
      seoDescription: 'XT1144 odtwarzacz premium z Serii 4 w cenie wyprzedażowej. Podwójne 4K, rozszerzony I/O, PoE+. Na stanie, wysyłka do 48h.',
      translatedAt: TIMESTAMP,
    },
    en: {
      modelNumber: 'XT1144',
      locale: 'en',
      title: 'BrightSign XT1144 – Premium Player with Expanded I/O (Clearance)',
      subtitle: 'Premium Series 4 player with maximum connectivity and PoE+ at clearance pricing. Predecessor to XT1145.',
      description: '<p>BrightSign XT1144 is a premium player from <strong>Series 4</strong> with expanded I/O, the predecessor to XT1145. It offers maximum connectivity with dual HDMI outputs and PoE+ at a clearance price.</p><h3>Key Features</h3><ul><li><strong>Dual 4K decoding</strong> – two independent 4K streams in 8-bit quality</li><li><strong>Expanded I/O</strong> – maximum ports for enterprise installations</li><li><strong>PoE+ power</strong> – data and power over a single cable</li><li><strong>Clearance price</strong> – premium features at a significantly lower price</li></ul><p><strong>Tip:</strong> For new projects we recommend <strong>XT1145 (Series 5)</strong> with 8K, HDMI input and NPU.</p>',
      seoTitle: 'BrightSign XT1144 - Premium Player with Expanded I/O | BrightSign.cz',
      seoDescription: 'XT1144 Series 4 premium player at clearance price. Dual 4K, expanded I/O, PoE+. In stock, 48h delivery.',
      translatedAt: TIMESTAMP,
    },
    de: {
      modelNumber: 'XT1144',
      locale: 'de',
      title: 'BrightSign XT1144 – Premium-Player mit erweitertem I/O (Ausverkauf)',
      subtitle: 'Premium-Player der Serie 4 mit maximaler Konnektivität und PoE+ zum Ausverkaufspreis. Vorgänger des XT1145.',
      description: '<p>BrightSign XT1144 ist ein Premium-Player aus der <strong>Serie 4</strong> mit erweitertem I/O, der Vorgänger des XT1145. Er bietet maximale Konnektivität mit dualen HDMI-Ausgängen und PoE+ zum Ausverkaufspreis.</p><h3>Hauptmerkmale</h3><ul><li><strong>Duale 4K-Dekodierung</strong> – zwei unabhängige 4K-Streams in 8-Bit-Qualität</li><li><strong>Erweitertes I/O</strong> – maximale Anschlüsse für Enterprise-Installationen</li><li><strong>PoE+-Stromversorgung</strong> – Daten und Strom über ein einziges Kabel</li><li><strong>Ausverkaufspreis</strong> – Premium-Funktionen zu einem deutlich niedrigeren Preis</li></ul><p><strong>Tipp:</strong> Für neue Projekte empfehlen wir den <strong>XT1145 (Serie 5)</strong> mit 8K, HDMI-Eingang und NPU.</p>',
      seoTitle: 'BrightSign XT1144 - Premium-Player mit erweitertem I/O | BrightSign.cz',
      seoDescription: 'XT1144 Serie 4 Premium-Player zum Ausverkaufspreis. Duales 4K, erweitertes I/O, PoE+. Auf Lager, Lieferung in 48h.',
      translatedAt: TIMESTAMP,
    },
  },

  // ═══ LS424 ═══
  LS424: {
    sk: {
      modelNumber: 'LS424',
      locale: 'sk',
      title: 'BrightSign LS424 – Základný Full HD prehrávač (dopredaj)',
      subtitle: 'Najdostupnejší BrightSign prehrávač Séria 4 za dopredajovú cenu. Predchodca LS425.',
      description: '<p>BrightSign LS424 je základný Full HD prehrávač zo <strong>Série 4</strong>, predchodca LS425. Ponúka spoľahlivé Full HD prehrávanie a HTML5 widgety za najnižšiu cenu v portfóliu.</p><h3>Kľúčové vlastnosti</h3><ul><li><strong>Full HD prehrávanie</strong> – spoľahlivý výstup 1920x1080 pri 60p</li><li><strong>HTML5 widgety</strong> – jednoduché HTML widgety a animácie</li><li><strong>Kompaktné rozmery</strong> – najmenší formát BrightSign</li><li><strong>Dopredajová cena</strong> – najlacnejší BrightSign na trhu</li></ul><p><strong>Tip:</strong> Pre nové projekty odporúčame <strong>LS425 (Séria 5)</strong> s NPU a 5-ročnou zárukou.</p>',
      seoTitle: 'BrightSign LS424 - Základný Full HD Prehrávač | BrightSign.cz',
      seoDescription: 'LS424 základný Full HD prehrávač zo Série 4 za dopredajovú cenu. HTML5, kompaktný. Skladom, doprava do 48h.',
      translatedAt: TIMESTAMP,
    },
    pl: {
      modelNumber: 'LS424',
      locale: 'pl',
      title: 'BrightSign LS424 – Podstawowy odtwarzacz Full HD (wyprzedaż)',
      subtitle: 'Najtańszy odtwarzacz BrightSign z Serii 4 w cenie wyprzedażowej. Poprzednik LS425.',
      description: '<p>BrightSign LS424 to podstawowy odtwarzacz Full HD z <strong>Serii 4</strong>, poprzednik LS425. Oferuje niezawodne odtwarzanie Full HD i widgety HTML5 w najniższej cenie w portfolio.</p><h3>Kluczowe właściwości</h3><ul><li><strong>Odtwarzanie Full HD</strong> – niezawodne wyjście 1920x1080 przy 60p</li><li><strong>Widgety HTML5</strong> – proste widgety HTML i animacje</li><li><strong>Kompaktowe wymiary</strong> – najmniejszy format BrightSign</li><li><strong>Cena wyprzedażowa</strong> – najtańszy BrightSign na rynku</li></ul><p><strong>Wskazówka:</strong> Do nowych projektów zalecamy <strong>LS425 (Seria 5)</strong> z NPU i 5-letnią gwarancją.</p>',
      seoTitle: 'BrightSign LS424 - Podstawowy Odtwarzacz Full HD | BrightSign.cz',
      seoDescription: 'LS424 podstawowy odtwarzacz Full HD z Serii 4 w cenie wyprzedażowej. HTML5, kompaktowy. Na stanie, wysyłka do 48h.',
      translatedAt: TIMESTAMP,
    },
    en: {
      modelNumber: 'LS424',
      locale: 'en',
      title: 'BrightSign LS424 – Basic Full HD Player (Clearance)',
      subtitle: 'Most affordable BrightSign Series 4 player at clearance pricing. Predecessor to LS425.',
      description: '<p>BrightSign LS424 is a basic Full HD player from <strong>Series 4</strong>, the predecessor to LS425. It delivers reliable Full HD playback and HTML5 widgets at the lowest price in the portfolio.</p><h3>Key Features</h3><ul><li><strong>Full HD playback</strong> – reliable 1920x1080 output at 60p</li><li><strong>HTML5 widgets</strong> – simple HTML widgets and animations</li><li><strong>Compact dimensions</strong> – smallest BrightSign form factor</li><li><strong>Clearance price</strong> – most affordable BrightSign on the market</li></ul><p><strong>Tip:</strong> For new projects we recommend <strong>LS425 (Series 5)</strong> with NPU and 5-year warranty.</p>',
      seoTitle: 'BrightSign LS424 - Basic Full HD Digital Signage Player | BrightSign.cz',
      seoDescription: 'LS424 Series 4 basic Full HD player at clearance price. HTML5, compact design. In stock, 48h delivery.',
      translatedAt: TIMESTAMP,
    },
    de: {
      modelNumber: 'LS424',
      locale: 'de',
      title: 'BrightSign LS424 – Basis Full-HD-Player (Ausverkauf)',
      subtitle: 'Günstigster BrightSign-Player der Serie 4 zum Ausverkaufspreis. Vorgänger des LS425.',
      description: '<p>BrightSign LS424 ist ein Basis Full-HD-Player aus der <strong>Serie 4</strong>, der Vorgänger des LS425. Er bietet zuverlässige Full-HD-Wiedergabe und HTML5-Widgets zum niedrigsten Preis im Portfolio.</p><h3>Hauptmerkmale</h3><ul><li><strong>Full-HD-Wiedergabe</strong> – zuverlässige Ausgabe in 1920x1080 bei 60p</li><li><strong>HTML5-Widgets</strong> – einfache HTML-Widgets und Animationen</li><li><strong>Kompakte Abmessungen</strong> – kleinstes BrightSign-Format</li><li><strong>Ausverkaufspreis</strong> – günstigster BrightSign auf dem Markt</li></ul><p><strong>Tipp:</strong> Für neue Projekte empfehlen wir den <strong>LS425 (Serie 5)</strong> mit NPU und 5 Jahren Garantie.</p>',
      seoTitle: 'BrightSign LS424 - Basis Full-HD Digital Signage Player | BrightSign.cz',
      seoDescription: 'LS424 Serie 4 Basis Full-HD-Player zum Ausverkaufspreis. HTML5, kompaktes Design. Auf Lager, Lieferung in 48h.',
      translatedAt: TIMESTAMP,
    },
  },

  // ═══ LS444 ═══
  LS444: {
    sk: {
      modelNumber: 'LS444',
      locale: 'sk',
      title: 'BrightSign LS444 – Full HD prehrávač s Wi-Fi (dopredaj)',
      subtitle: 'Full HD prehrávač Séria 4 s Wi-Fi a rozšíreným I/O za dopredajovú cenu. Predchodca LS445.',
      description: '<p>BrightSign LS444 je základný Full HD prehrávač zo <strong>Série 4</strong> s Wi-Fi a rozšíreným I/O, predchodca LS445. Ponúka bezdrôtovú konektivitu za dopredajovú cenu.</p><h3>Kľúčové vlastnosti</h3><ul><li><strong>Integrovaná Wi-Fi</strong> – bezdrôtové pripojenie bez nutnosti kabeláže</li><li><strong>Rozšírený I/O</strong> – viac portov pre senzory a zariadenia</li><li><strong>Full HD prehrávanie</strong> – spoľahlivý výstup 1920x1080</li><li><strong>Dopredajová cena</strong> – bezdrôtová konektivita za zlomok ceny</li></ul><p><strong>Tip:</strong> Pre nové projekty odporúčame <strong>LS445 (Séria 5)</strong> s NPU, 4K a 5-ročnou zárukou.</p>',
      seoTitle: 'BrightSign LS444 - Full HD Prehrávač s Wi-Fi | BrightSign.cz',
      seoDescription: 'LS444 Full HD prehrávač zo Série 4 s Wi-Fi za dopredajovú cenu. Bezdrôtové pripojenie, rozšírený I/O. Skladom.',
      translatedAt: TIMESTAMP,
    },
    pl: {
      modelNumber: 'LS444',
      locale: 'pl',
      title: 'BrightSign LS444 – Odtwarzacz Full HD z Wi-Fi (wyprzedaż)',
      subtitle: 'Odtwarzacz Full HD z Serii 4 z Wi-Fi i rozszerzonym I/O w cenie wyprzedażowej. Poprzednik LS445.',
      description: '<p>BrightSign LS444 to podstawowy odtwarzacz Full HD z <strong>Serii 4</strong> z Wi-Fi i rozszerzonym I/O, poprzednik LS445. Oferuje łączność bezprzewodową w cenie wyprzedażowej.</p><h3>Kluczowe właściwości</h3><ul><li><strong>Zintegrowane Wi-Fi</strong> – połączenie bezprzewodowe bez potrzeby okablowania</li><li><strong>Rozszerzony I/O</strong> – więcej portów do czujników i urządzeń</li><li><strong>Odtwarzanie Full HD</strong> – niezawodne wyjście 1920x1080</li><li><strong>Cena wyprzedażowa</strong> – łączność bezprzewodowa za ułamek ceny</li></ul><p><strong>Wskazówka:</strong> Do nowych projektów zalecamy <strong>LS445 (Seria 5)</strong> z NPU, 4K i 5-letnią gwarancją.</p>',
      seoTitle: 'BrightSign LS444 - Odtwarzacz Full HD z Wi-Fi | BrightSign.cz',
      seoDescription: 'LS444 odtwarzacz Full HD z Serii 4 z Wi-Fi w cenie wyprzedażowej. Bezprzewodowe połączenie, rozszerzony I/O. Na stanie.',
      translatedAt: TIMESTAMP,
    },
    en: {
      modelNumber: 'LS444',
      locale: 'en',
      title: 'BrightSign LS444 – Full HD Player with Wi-Fi (Clearance)',
      subtitle: 'Series 4 Full HD player with Wi-Fi and expanded I/O at clearance pricing. Predecessor to LS445.',
      description: '<p>BrightSign LS444 is a basic Full HD player from <strong>Series 4</strong> with Wi-Fi and expanded I/O, the predecessor to LS445. It provides wireless connectivity at a clearance price.</p><h3>Key Features</h3><ul><li><strong>Integrated Wi-Fi</strong> – wireless connectivity without the need for cabling</li><li><strong>Expanded I/O</strong> – more ports for sensors and devices</li><li><strong>Full HD playback</strong> – reliable 1920x1080 output</li><li><strong>Clearance price</strong> – wireless connectivity at a fraction of the cost</li></ul><p><strong>Tip:</strong> For new projects we recommend <strong>LS445 (Series 5)</strong> with NPU, 4K and 5-year warranty.</p>',
      seoTitle: 'BrightSign LS444 - Full HD Player with Wi-Fi | BrightSign.cz',
      seoDescription: 'LS444 Series 4 Full HD player with Wi-Fi at clearance price. Wireless connectivity, expanded I/O. In stock, 48h delivery.',
      translatedAt: TIMESTAMP,
    },
    de: {
      modelNumber: 'LS444',
      locale: 'de',
      title: 'BrightSign LS444 – Full-HD-Player mit Wi-Fi (Ausverkauf)',
      subtitle: 'Full-HD-Player der Serie 4 mit Wi-Fi und erweitertem I/O zum Ausverkaufspreis. Vorgänger des LS445.',
      description: '<p>BrightSign LS444 ist ein Basis Full-HD-Player aus der <strong>Serie 4</strong> mit Wi-Fi und erweitertem I/O, der Vorgänger des LS445. Er bietet drahtlose Konnektivität zum Ausverkaufspreis.</p><h3>Hauptmerkmale</h3><ul><li><strong>Integriertes Wi-Fi</strong> – drahtlose Verbindung ohne Verkabelung</li><li><strong>Erweitertes I/O</strong> – mehr Anschlüsse für Sensoren und Geräte</li><li><strong>Full-HD-Wiedergabe</strong> – zuverlässige Ausgabe in 1920x1080</li><li><strong>Ausverkaufspreis</strong> – drahtlose Konnektivität zum Bruchteil des Preises</li></ul><p><strong>Tipp:</strong> Für neue Projekte empfehlen wir den <strong>LS445 (Serie 5)</strong> mit NPU, 4K und 5 Jahren Garantie.</p>',
      seoTitle: 'BrightSign LS444 - Full-HD-Player mit Wi-Fi | BrightSign.cz',
      seoDescription: 'LS444 Serie 4 Full-HD-Player mit Wi-Fi zum Ausverkaufspreis. Drahtlose Konnektivität, erweitertes I/O. Auf Lager.',
      translatedAt: TIMESTAMP,
    },
  },
};

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  console.log('Reading existing translations.json...');
  const raw = readFileSync(TRANSLATIONS_PATH, 'utf-8');
  const translations = JSON.parse(raw);

  const existingModels = Object.keys(translations);
  console.log(`Found ${existingModels.length} existing models: ${existingModels.join(', ')}`);

  const s4Models = Object.keys(s4Translations);
  console.log(`Adding translations for ${s4Models.length} S4 models: ${s4Models.join(', ')}`);

  // Check for conflicts
  for (const model of s4Models) {
    if (translations[model]) {
      console.warn(`WARNING: ${model} already exists in translations.json — will be overwritten`);
    }
  }

  // Merge S4 translations
  for (const [model, locales] of Object.entries(s4Translations)) {
    translations[model] = locales;
  }

  const updatedModels = Object.keys(translations);
  console.log(`\nTotal models after merge: ${updatedModels.length}`);

  // Validate: count entries per locale
  let totalEntries = 0;
  for (const model of updatedModels) {
    const locales = Object.keys(translations[model]);
    totalEntries += locales.length;
  }
  console.log(`Total translation entries: ${totalEntries}`);

  // Write back
  writeFileSync(TRANSLATIONS_PATH, JSON.stringify(translations, null, 2) + '\n', 'utf-8');
  console.log(`\nWritten to ${TRANSLATIONS_PATH}`);

  // Summary
  console.log('\n--- Summary ---');
  for (const model of s4Models) {
    const locales = Object.keys(translations[model]);
    console.log(`  ${model}: ${locales.join(', ')}`);
  }
  console.log('\nDone!');
}

main();
