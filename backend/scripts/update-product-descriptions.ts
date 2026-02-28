/**
 * Product descriptions for BrightSign digital signage players.
 *
 * Contains localized descriptions (cs, sk, pl, en, de) for 8 Serie 5 models:
 *   HD225, HD1025, XD235, XD1035, XT245, XT1145, LS425, LS445
 *
 * These descriptions are stored in Medusa product metadata as:
 *   metadata.translations[locale].description
 *
 * The Czech (cs) description is also used as the main product.description field.
 * The storefront reads translations via getLocalizedDescription() in medusa-helpers.ts.
 *
 * Run with: npx ts-node scripts/update-product-descriptions.ts
 *
 * To apply to Medusa, use sync-products.ts or update via Admin API:
 *   PATCH /admin/products/:id { metadata: { translations: { ... } } }
 *
 * Data source: data/brightsign-knowledge-base.md (2026-02-27)
 */

interface ProductDescription {
  handle: string
  modelNumber: string
  series: string
  translations: {
    cs: string
    sk: string
    pl: string
    en: string
    de: string
  }
}

export const productDescriptions: ProductDescription[] = [
  // ─── HD225 — Mainstream 4K Player (Serie 5) ───────────────────────────────
  {
    handle: "brightsign-hd225",
    modelNumber: "HD225",
    series: "5",
    translations: {
      cs: `<p>BrightSign HD225 je spolehlivy 4K prehravac, ktery nabizi nejlepsi pomer cena/vykon v cele rade BrightSign. Dekoduje video v rozliseni 4K UHD pri 60 snimcich za sekundu s podporou HDR10 a zvladne i simultanni prehravani dvou Full HD streamu. Pro instalatora je klicova podpora PoE+ -- staci jediny Ethernet kabel pro data i napajeni, coz vyrazne zjednodusuje kabelaz a snizuje naklady na instalaci.</p>
<p>Prehravac disponuje plnou podporou HTML5 pro dynamicky obsah, 6pinovym GPIO portem pro pripojeni senzoru ci tlacitek a slotem pro volitelny Wi-Fi modul. BrightSignOS garantuje spolehlivost 99,9 % uptime bez nutnosti restartu po celé mesice provozu. Registraci v BSN.cloud ziskate 5letou zaruku a bezplatnou vzdalenu spravu pres BrightAuthor:connected.</p>
<p><strong>Idealni pro:</strong> Retail vylohy a informacni displeje, korporatni lobby a reception, hotelovou komunikaci se hosty.</p>
<p>HD225 je volba pro kazdého, kdo hledá profesionalni 4K signage bez zbytecnych kompromisu. S cenou od 14 900 Kc bez DPH jde o nejdostupnejsi cestu k 4K kvalite v portfoliu BrightSign Serie 5.</p>`,

      sk: `<p>BrightSign HD225 je spolahlivy 4K prehravac s najlepsim pomerom ceny a vykonu v celej rade BrightSign. Dekoduje video v rozliseni 4K UHD pri 60 snimkach za sekundu s podporou HDR10 a zvladne aj simultanne prehravanie dvoch Full HD streamov. Pre instalatora je klucova podpora PoE+ -- staci jediny Ethernet kabel pre data aj napajanie, co vyrazne zjednodusuje kabelaz a znizuje naklady na instalaciu.</p>
<p>Prehravac disponuje plnou podporou HTML5 pre dynamicky obsah, 6-pinovym GPIO portom pre pripojenie senzorov ci tlacidiel a slotom pre volitelny Wi-Fi modul. BrightSignOS garantuje spolahlivost 99,9 % uptime bez nutnosti restartu pocas celych mesiacov prevádzky. Registraciou v BSN.cloud ziskate 5-rocnu zaruku a bezplatnu vzdialenu spravu cez BrightAuthor:connected.</p>
<p><strong>Idealne pre:</strong> Retail vylohy a informacne displeje, korporatne lobby a recepcie, hotelovu komunikaciu s hostmi.</p>
<p>HD225 je volba pre kazdeho, kto hlada profesionalny 4K signage bez zbytocnych kompromisov. S cenou od 584 EUR bez DPH ide o najdostupnejsiu cestu k 4K kvalite v portfoliu BrightSign Serie 5.</p>`,

      pl: `<p>BrightSign HD225 to niezawodny odtwarzacz 4K oferujacy najlepszy stosunek ceny do wydajnosci w calej ofercie BrightSign. Dekoduje wideo w rozdzielczosci 4K UHD przy 60 klatkach na sekunde z obsluga HDR10, a takze moze jednoczesnie odtwarzac dwa strumienie Full HD. Kluczowa zaleta dla instalatorow jest obsluga PoE+ -- wystarczy jeden kabel Ethernet do przesylu danych i zasilania, co znacznie upraszcza okladanie i obniza koszty instalacji.</p>
<p>Odtwarzacz oferuje pelna obsluge HTML5 dla dynamicznej tresci, 6-pinowy port GPIO do podlaczenia czujnikow lub przyciskow oraz slot na opcjonalny modul Wi-Fi. System BrightSignOS gwarantuje niezawodnosc na poziomie 99,9% czasu pracy bez koniecznosci restartu przez cale miesiace. Rejestracja w BSN.cloud zapewnia 5-letnia gwarancje i bezplatne zdalne zarzadzanie przez BrightAuthor:connected.</p>
<p><strong>Idealny do:</strong> Witryn sklepowych i wyswietlaczy informacyjnych, lobby korporacyjnych i recepcji, komunikacji hotelowej z goscmi.</p>
<p>HD225 to wybor dla kazdego, kto szuka profesjonalnego digital signage 4K bez niepotrzebnych kompromisow. W cenie od 2 499 PLN netto to najbardziej przystepna droga do jakosci 4K w portfolio BrightSign Seria 5.</p>`,

      en: `<p>The BrightSign HD225 is a reliable 4K player offering the best price-to-performance ratio in the entire BrightSign lineup. It decodes 4K UHD video at 60 fps with HDR10 support and can simultaneously play two Full HD streams. For installers, PoE+ support is key -- a single Ethernet cable handles both data and power, significantly simplifying cabling and reducing installation costs.</p>
<p>The player features full HTML5 support for dynamic content, a 6-pin GPIO port for connecting sensors or buttons, and a slot for an optional Wi-Fi module. BrightSignOS guarantees 99.9% uptime reliability without requiring restarts for months of continuous operation. Registering with BSN.cloud provides a 5-year warranty and free remote management via BrightAuthor:connected.</p>
<p><strong>Ideal for:</strong> Retail window displays and information screens, corporate lobbies and receptions, hotel guest communication.</p>
<p>The HD225 is the choice for anyone seeking professional 4K signage without unnecessary compromises. Starting at EUR 584 ex. VAT, it is the most accessible path to 4K quality in the BrightSign Series 5 portfolio.</p>`,

      de: `<p>Der BrightSign HD225 ist ein zuverlassiger 4K-Player mit dem besten Preis-Leistungs-Verhaltnis im gesamten BrightSign-Sortiment. Er dekodiert 4K-UHD-Video mit 60 fps und HDR10-Unterstutzung und kann gleichzeitig zwei Full-HD-Streams wiedergeben. Fur Installateure ist die PoE+-Unterstutzung entscheidend -- ein einziges Ethernet-Kabel ubernimmt Daten und Stromversorgung, was die Verkabelung erheblich vereinfacht und die Installationskosten senkt.</p>
<p>Der Player bietet volle HTML5-Unterstutzung fur dynamische Inhalte, einen 6-Pin-GPIO-Port zum Anschluss von Sensoren oder Tastern sowie einen Slot fur ein optionales WLAN-Modul. BrightSignOS garantiert eine Verfugbarkeit von 99,9 % ohne Neustart uber Monate hinweg. Die Registrierung bei BSN.cloud bietet 5 Jahre Garantie und kostenlose Fernverwaltung uber BrightAuthor:connected.</p>
<p><strong>Ideal fur:</strong> Schaufenster und Informationsdisplays im Einzelhandel, Empfangsbereiche in Unternehmen, Gastkommunikation in Hotels.</p>
<p>Der HD225 ist die Wahl fur alle, die professionelles 4K-Signage ohne unnotige Kompromisse suchen. Ab 584 EUR netto ist er der gunstigste Einstieg in die 4K-Qualitat des BrightSign Serie 5 Portfolios.</p>`,
    },
  },

  // ─── HD1025 — Mainstream+ 4K Player s rozsirenym I/O (Serie 5) ────────────
  {
    handle: "brightsign-hd1025",
    modelNumber: "HD1025",
    series: "5",
    translations: {
      cs: `<p>BrightSign HD1025 stavi na overene platforme HD225 a pridava rozsireny I/O balicek pro integracni projekty. Vedle vsech schopnosti zakladniho modelu -- 4K pri 60fps, HDR10, PoE+ napajeni -- nabizi navic seriovy port RS-232 a druhy USB port (USB-A). To z nej dela idealni volbu vsude tam, kde prehravac musi komunikovat s externimi zarizenimi.</p>
<p>RS-232 umoznuje primo z prehravace ovladat displej (zapnuti/vypnuti, zmena vstupu, hlasitost), pripojenou tiskarnu nebo POS terminal. Dva USB porty (USB-C + USB-A) zajistuji komfortni pripojeni dotykovych obrazovek, ctecek carovych kodu ci RFID modulu. GPIO port zustava k dispozici pro senzory a tlacitka. BrightSignOS zajistuje nepretrzity provoz s uptime 99,9 % a registrace v BSN.cloud aktivuje 5letou zaruku.</p>
<p><strong>Idealni pro:</strong> Interaktivni kiosky s dotykovou obrazovkou, samoobsluzne terminaly s tiskarnou, displeje ovladajici externi zarizeni pres RS-232.</p>
<p>Pokud vas projekt vyzaduje vic nez jen prehravani obsahu -- napriklad komunikaci s periferiemi nebo ovladani displeje -- HD1025 je spravna volba. Rozsirene I/O za priplatek pouhych 3 000 Kc oproti HD225.</p>`,

      sk: `<p>BrightSign HD1025 stavá na overenej platforme HD225 a pridava rozsireny I/O balicek pre integracne projekty. Okrem vsetkych schopnosti zakladneho modelu -- 4K pri 60fps, HDR10, PoE+ napajanie -- ponuka navyse seriovy port RS-232 a druhy USB port (USB-A). To z neho robi idealnu volbu vsade tam, kde prehravac musi komunikovat s externymi zariadeniami.</p>
<p>RS-232 umoznuje priamo z prehravaca ovladat displej (zapnutie/vypnutie, zmena vstupu, hlasitost), pripojenu tlaciaren alebo POS terminal. Dva USB porty (USB-C + USB-A) zabezpecuju komfortne pripojenie dotykovych obrazoviek, citaciek ciarovych kodov ci RFID modulov. GPIO port zostava k dispozicii pre senzory a tlacidla. BrightSignOS zabezpecuje nepretrzitu prevadzku s uptime 99,9 % a registracia v BSN.cloud aktivuje 5-rocnu zaruku.</p>
<p><strong>Idealne pre:</strong> Interaktivne kiosky s dotykovou obrazovkou, samoobsluzne terminaly s tlaciarnou, displeje ovladajuce externé zariadenia cez RS-232.</p>
<p>Ak vas projekt vyzaduje viac nez len prehravanie obsahu -- napriklad komunikaciu s periferiami alebo ovladanie displeja -- HD1025 je spravna volba. Rozsirene I/O za priplatek len 118 EUR oproti HD225.</p>`,

      pl: `<p>BrightSign HD1025 bazuje na sprawdzonej platformie HD225 i dodaje rozszerzony pakiet I/O do projektow integracyjnych. Oprocz wszystkich mozliwosci modelu podstawowego -- 4K przy 60fps, HDR10, zasilanie PoE+ -- oferuje dodatkowo port szeregowy RS-232 i drugi port USB (USB-A). To czyni go idealnym wyborem wszedzie tam, gdzie odtwarzacz musi komunikowac sie z urzadzeniami zewnetrznymi.</p>
<p>RS-232 umozliwia bezposrednie sterowanie wyswietlaczem z odtwarzacza (wlaczanie/wylaczanie, zmiana wejscia, glosnosc), polaczona drukarke lub terminal POS. Dwa porty USB (USB-C + USB-A) zapewniaja wygodne podlaczenie ekranow dotykowych, czytnikow kodow kreskowych lub modulow RFID. Port GPIO pozostaje do dyspozycji dla czujnikow i przyciskow. BrightSignOS zapewnia ciagla prace z dostepnoscia 99,9%, a rejestracja w BSN.cloud aktywuje 5-letnia gwarancje.</p>
<p><strong>Idealny do:</strong> Interaktywnych kioskow z ekranem dotykowym, terminali samoobslugowych z drukarkami, wyswietlaczy sterujacych urzadzeniami zewnetrznymi przez RS-232.</p>
<p>Jezeli Twoj projekt wymaga wiecej niz tylko odtwarzania tresci -- np. komunikacji z peryferiami lub sterowania wyswietlaczem -- HD1025 jest wlasciwym wyborem. Rozszerzony I/O za doplata tylko 500 PLN w stosunku do HD225.</p>`,

      en: `<p>The BrightSign HD1025 builds on the proven HD225 platform and adds an expanded I/O package for integration projects. In addition to all the capabilities of the base model -- 4K at 60fps, HDR10, PoE+ power -- it features an RS-232 serial port and a second USB port (USB-A). This makes it the ideal choice wherever the player needs to communicate with external devices.</p>
<p>RS-232 enables direct display control from the player (power on/off, input switching, volume), as well as connection to printers or POS terminals. Two USB ports (USB-C + USB-A) provide convenient connectivity for touch screens, barcode readers, and RFID modules. The GPIO port remains available for sensors and buttons. BrightSignOS ensures uninterrupted operation with 99.9% uptime, and BSN.cloud registration activates the 5-year warranty.</p>
<p><strong>Ideal for:</strong> Interactive kiosks with touch screens, self-service terminals with printers, displays controlling external devices via RS-232.</p>
<p>If your project requires more than just content playback -- such as peripheral communication or display control -- the HD1025 is the right choice. Expanded I/O for just EUR 118 more than the HD225.</p>`,

      de: `<p>Der BrightSign HD1025 baut auf der bewahrten HD225-Plattform auf und bietet ein erweitertes I/O-Paket fur Integrationsprojekte. Zusatzlich zu allen Fahigkeiten des Basismodells -- 4K bei 60fps, HDR10, PoE+-Stromversorgung -- verfugt er uber einen seriellen RS-232-Anschluss und einen zweiten USB-Port (USB-A). Das macht ihn zur idealen Wahl uberall dort, wo der Player mit externen Geraten kommunizieren muss.</p>
<p>RS-232 ermoglicht die direkte Displaysteuerung vom Player aus (Ein-/Ausschalten, Eingangswechsel, Lautstarke) sowie den Anschluss von Druckern oder POS-Terminals. Zwei USB-Anschlusse (USB-C + USB-A) bieten komfortable Konnektivitat fur Touchscreens, Barcode-Lesegerate und RFID-Module. Der GPIO-Port steht weiterhin fur Sensoren und Taster zur Verfugung. BrightSignOS gewahrleistet unterbrechungsfreien Betrieb mit 99,9 % Verfugbarkeit, und die BSN.cloud-Registrierung aktiviert die 5-Jahres-Garantie.</p>
<p><strong>Ideal fur:</strong> Interaktive Kioske mit Touchscreen, Selbstbedienungsterminals mit Drucker, Displays zur Steuerung externer Gerate uber RS-232.</p>
<p>Wenn Ihr Projekt mehr erfordert als reine Inhaltswiedergabe -- etwa Peripheriekommunikation oder Displaysteuerung -- ist der HD1025 die richtige Wahl. Erweitertes I/O fur nur 118 EUR Aufpreis gegenuber dem HD225.</p>`,
    },
  },

  // ─── XD235 — Enterprise 4K Player (Serie 5) ──────────────────────────────
  {
    handle: "brightsign-xd235",
    modelNumber: "XD235",
    series: "5",
    translations: {
      cs: `<p>BrightSign XD235 je enterprise prehravac urceny pro narocne instalace, kde zakladni modely nestaci. Dekoduje 4K UHD pri 60fps s HDR10 a navic zvladne simultanni prehravani dvou 4K streamu -- idealni pro slozite layouty s vice zonami obsahu. Diky interni M.2 PCIe SSD slotu pojme i rozsahle obsahove knihovny bez zavislosti na microSD karte.</p>
<p>Prehravac podporuje PoE+ napajeni, disponuje dvema USB-C porty, 6pinovym GPIO a slotem pro Wi-Fi modul. Vysoky HTML5 vykon umoznuje plynule animace, real-time dashboardy a datove vizualizace. Integrovaný RTC (hodiny reálného casu) zajistuje presne casové planovani obsahu i po vypadku proudu. Registraci v BSN.cloud ziskate 5letou zaruku a bezplatnou vzdalenu spravu.</p>
<p><strong>Idealni pro:</strong> Velke sitove instalace s centralnim rizenim, real-time dashboardy a datove vizualizace, pokrocily obsah vyzadujici interni SSD uloziste.</p>
<p>XD235 je volba pro IT manazery a AV integratory, kteri potrebuji spolehlivy vykon v rozsirenich instalacich. SSD pro velky obsah, dual decode pro slozite layouty a PoE+ pro snadne nasazeni -- vse v jednom zarízeni za 19 400 Kc bez DPH.</p>`,

      sk: `<p>BrightSign XD235 je enterprise prehravac urceny pre narocne instalacie, kde zakladne modely nestacia. Dekoduje 4K UHD pri 60fps s HDR10 a navyse zvladne simultanne prehravanie dvoch 4K streamov -- idealne pre zlozite layouty s viacerymi zonami obsahu. Vdaka internemu M.2 PCIe SSD slotu pojme aj rozsahle obsahove kniznice bez zavislosti na microSD karte.</p>
<p>Prehravac podporuje PoE+ napajanie, disponuje dvoma USB-C portmi, 6-pinovym GPIO a slotom pre Wi-Fi modul. Vysoky HTML5 vykon umoznuje plynule animacie, real-time dashboardy a datove vizualizacie. Integrovane RTC (hodiny realneho casu) zabezpecuju presne casove planovanie obsahu aj po vypadku prudu. Registraciou v BSN.cloud ziskate 5-rocnu zaruku a bezplatnu vzdialenu spravu.</p>
<p><strong>Idealne pre:</strong> Velke sietove instalacie s centralnym riadenim, real-time dashboardy a datove vizualizacie, pokrocily obsah vyzadujuci interne SSD ulozisko.</p>
<p>XD235 je volba pre IT manazerov a AV integratorov, ktori potrebuju spolahlivy vykon v rozsiahlych instalaciach. SSD pre velky obsah, dual decode pre zlozite layouty a PoE+ pre jednoduche nasadenie -- vsetko v jednom zariadeni za 761 EUR bez DPH.</p>`,

      pl: `<p>BrightSign XD235 to odtwarzacz klasy enterprise przeznaczony do wymagajacych instalacji, w ktorych modele podstawowe nie wystarczaja. Dekoduje 4K UHD przy 60fps z HDR10 i dodatkowo obsluguje jednoczesne odtwarzanie dwoch strumieni 4K -- idealny do zlozonych layoutow z wieloma strefami tresci. Dzieki wewnętrznemu slotowi M.2 PCIe SSD moze pomiescic rozlegle biblioteki tresci bez zaleznosci od karty microSD.</p>
<p>Odtwarzacz obsluguje zasilanie PoE+, posiada dwa porty USB-C, 6-pinowy GPIO i slot na modul Wi-Fi. Wysoka wydajnosc HTML5 umozliwia plynne animacje, dashboardy czasu rzeczywistego i wizualizacje danych. Zintegrowany RTC (zegar czasu rzeczywistego) zapewnia dokladne planowanie tresci nawet po awarii zasilania. Rejestracja w BSN.cloud zapewnia 5-letnia gwarancje i bezplatne zdalne zarzadzanie.</p>
<p><strong>Idealny do:</strong> Duzych instalacji sieciowych z centralnym zarzadzaniem, dashboardow czasu rzeczywistego i wizualizacji danych, zaawansowanych tresci wymagajacych wewnetrznego dysku SSD.</p>
<p>XD235 to wybor dla menedzerow IT i integratorow AV, ktorzy potrzebuja niezawodnej wydajnosci w rozleglych instalacjach. SSD na duze tresci, podwojne dekodowanie dla zlozonych layoutow i PoE+ dla latwego wdrozenia -- wszystko w jednym urzadzeniu za 3 199 PLN netto.</p>`,

      en: `<p>The BrightSign XD235 is an enterprise player designed for demanding installations where basic models fall short. It decodes 4K UHD at 60fps with HDR10 and also handles simultaneous playback of two 4K streams -- ideal for complex layouts with multiple content zones. Thanks to an internal M.2 PCIe SSD slot, it can store extensive content libraries without relying solely on microSD.</p>
<p>The player supports PoE+ power, features two USB-C ports, 6-pin GPIO, and a slot for a Wi-Fi module. High HTML5 performance enables smooth animations, real-time dashboards, and data visualisations. The integrated RTC (real-time clock) ensures precise content scheduling even after power outages. BSN.cloud registration provides a 5-year warranty and free remote management.</p>
<p><strong>Ideal for:</strong> Large networked installations with central management, real-time dashboards and data visualisations, advanced content requiring internal SSD storage.</p>
<p>The XD235 is the choice for IT managers and AV integrators who need reliable performance in scaled-out installations. SSD for large content, dual decode for complex layouts, and PoE+ for easy deployment -- all in one device starting at EUR 761 ex. VAT.</p>`,

      de: `<p>Der BrightSign XD235 ist ein Enterprise-Player fur anspruchsvolle Installationen, bei denen Basismodelle nicht ausreichen. Er dekodiert 4K UHD mit 60fps und HDR10 und bewaltigt zusatzlich die gleichzeitige Wiedergabe von zwei 4K-Streams -- ideal fur komplexe Layouts mit mehreren Inhaltszonen. Dank des internen M.2-PCIe-SSD-Slots konnen umfangreiche Inhaltsbibliotheken ohne Abhangigkeit von microSD gespeichert werden.</p>
<p>Der Player unterstutzt PoE+-Stromversorgung, verfugt uber zwei USB-C-Anschlusse, 6-Pin-GPIO und einen Slot fur ein optionales WLAN-Modul. Die hohe HTML5-Leistung ermoglicht flussige Animationen, Echtzeit-Dashboards und Datenvisualisierungen. Die integrierte Echtzeituhr (RTC) gewahrleistet prazise Inhaltsplanung auch nach Stromausfallen. Die BSN.cloud-Registrierung bietet 5 Jahre Garantie und kostenlose Fernverwaltung.</p>
<p><strong>Ideal fur:</strong> Grosse vernetzte Installationen mit zentraler Verwaltung, Echtzeit-Dashboards und Datenvisualisierungen, anspruchsvolle Inhalte mit internem SSD-Speicher.</p>
<p>Der XD235 ist die Wahl fur IT-Manager und AV-Integratoren, die zuverlassige Leistung in skalierten Installationen benotigen. SSD fur grosse Inhalte, Dual-Decode fur komplexe Layouts und PoE+ fur einfache Bereitstellung -- alles in einem Gerat ab 761 EUR netto.</p>`,
    },
  },

  // ─── XD1035 — Enterprise+ 4K Player s rozsirenym I/O (Serie 5) ───────────
  {
    handle: "brightsign-xd1035",
    modelNumber: "XD1035",
    series: "5",
    translations: {
      cs: `<p>BrightSign XD1035 kombinuje enterprise vykon rady XD s rozsirenym I/O balickem pro maximalni flexibilitu integrace. Vedle vsech schopnosti modelu XD235 -- dual 4K decode, M.2 SSD slot, PoE+ napajeni -- pridava seriovy port RS-232 a dalsi USB-A port. To z nej dela idealni reseni pro slozite instalace, kde prehravac musi komunikovat s externymi zarizenimi.</p>
<p>RS-232 umoznuje ovladani displeje, připojeni POS terminalu nebo komunikaci s ridici jednotkou budovy primo z prehravace. Kombinace USB-C a USB-A portu zajistuje kompatibilitu s sirokym spektrem periferii -- od dotykových obrazovek pres ctecky az po USB tlacitkove panely. GPIO port s 6 piny zustava k dispozici pro senzory. Vysoka HTML5 vykonnost, real-time clock a podpora HDR10 delaji z tohoto modelu komplexni reseni pro enterprise projekty.</p>
<p><strong>Idealni pro:</strong> Enterprise instalace s integracnimi pozadavky, kiosky s periferiemi (tiskarna, ctecka, POS), sitove instalace vyzadujici ovladani displeje pres RS-232.</p>
<p>XD1035 je volba pro narocne integratory, kteri potrebuji dual 4K vykon a zaroven rozsirenou konektivitu. Pokud vas projekt zahrnuje externi zarizeni, tento model vam usetri externi prevodnik i dalsi kabelaz. Cena 22 400 Kc bez DPH.</p>`,

      sk: `<p>BrightSign XD1035 kombinuje enterprise vykon radu XD s rozsirenym I/O balickom pre maximalnu flexibilitu integracie. Okrem vsetkych schopnosti modelu XD235 -- dual 4K decode, M.2 SSD slot, PoE+ napajanie -- pridava seriovy port RS-232 a dalsi USB-A port. To z neho robi idealne riesenie pre zlozite instalacie, kde prehravac musi komunikovat s externymi zariadeniami.</p>
<p>RS-232 umoznuje ovladanie displeja, pripojenie POS terminalov alebo komunikaciu s riadiacou jednotkou budovy priamo z prehravaca. Kombinacia USB-C a USB-A portov zabezpecuje kompatibilitu so sirokym spektrom periferii -- od dotykovych obrazoviek cez citacky az po USB tlacidlove panely. GPIO port so 6 pinmi zostava k dispozicii pre senzory. Vysoky HTML5 vykon, real-time clock a podpora HDR10 robia z tohto modelu komplexne riesenie pre enterprise projekty.</p>
<p><strong>Idealne pre:</strong> Enterprise instalacie s integracnymi poziadavkami, kiosky s periferiami (tlaciaren, citacka, POS), sietove instalacie vyzadujuce ovladanie displeja cez RS-232.</p>
<p>XD1035 je volba pre narocnych integratorov, ktori potrebuju dual 4K vykon a zaroven rozsirenu konektivitu. Ak vas projekt zahrna externé zariadenia, tento model vam usetri externy prevodnik aj dalsiu kabelaz. Cena 878 EUR bez DPH.</p>`,

      pl: `<p>BrightSign XD1035 laczy wydajnosc klasy enterprise serii XD z rozszerzonym pakietem I/O dla maksymalnej elastycznosci integracji. Oprocz wszystkich mozliwosci modelu XD235 -- podwojne dekodowanie 4K, slot M.2 SSD, zasilanie PoE+ -- dodaje port szeregowy RS-232 i dodatkowy port USB-A. To czyni go idealnym rozwiazaniem do zlozonych instalacji, w ktorych odtwarzacz musi komunikowac sie z urzadzeniami zewnetrznymi.</p>
<p>RS-232 umozliwia sterowanie wyswietlaczem, polaczenie z terminalami POS lub komunikacje z systemem BMS bezposrednio z odtwarzacza. Kombinacja portow USB-C i USB-A zapewnia kompatybilnosc z szerokim spektrum peryferiow -- od ekranow dotykowych przez czytniki po panele przyciskow USB. Port GPIO z 6 pinami pozostaje dostepny dla czujnikow. Wysoka wydajnosc HTML5, zegar czasu rzeczywistego i obsluga HDR10 czynia ten model kompleksowym rozwiazaniem dla projektow enterprise.</p>
<p><strong>Idealny do:</strong> Instalacji enterprise z wymaganiami integracyjnymi, kioskow z peryferiami (drukarka, czytnik, POS), instalacji sieciowych wymagajacych sterowania wyswietlaczem przez RS-232.</p>
<p>XD1035 to wybor dla wymagajacych integratorow, ktorzy potrzebuja podwojnej wydajnosci 4K i jednoczesnie rozszerzonej lacznosci. Jezeli Twoj projekt obejmuje urzadzenia zewnetrzne, ten model zaoszczedzi Ci zewnetrznego konwertera i dodatkowego kladania. Cena 3 699 PLN netto.</p>`,

      en: `<p>The BrightSign XD1035 combines enterprise-grade XD series performance with an expanded I/O package for maximum integration flexibility. Beyond all the capabilities of the XD235 -- dual 4K decode, M.2 SSD slot, PoE+ power -- it adds an RS-232 serial port and an additional USB-A port. This makes it the ideal solution for complex installations where the player must communicate with external devices.</p>
<p>RS-232 enables display control, POS terminal connections, or building management system communication directly from the player. The combination of USB-C and USB-A ports ensures compatibility with a wide range of peripherals -- from touch screens and barcode readers to USB button panels. The 6-pin GPIO port remains available for sensors. High HTML5 performance, real-time clock, and HDR10 support make this model a comprehensive solution for enterprise projects.</p>
<p><strong>Ideal for:</strong> Enterprise installations with integration requirements, kiosks with peripherals (printers, readers, POS), networked installations requiring display control via RS-232.</p>
<p>The XD1035 is the choice for demanding integrators who need dual 4K performance alongside expanded connectivity. If your project involves external devices, this model eliminates the need for additional converters and cabling. Priced at EUR 878 ex. VAT.</p>`,

      de: `<p>Der BrightSign XD1035 vereint die Enterprise-Leistung der XD-Serie mit einem erweiterten I/O-Paket fur maximale Integrationsflexibilitat. Uber alle Fahigkeiten des XD235 hinaus -- Dual 4K Decode, M.2-SSD-Slot, PoE+-Stromversorgung -- bietet er einen seriellen RS-232-Anschluss und einen zusatzlichen USB-A-Port. Das macht ihn zur idealen Losung fur komplexe Installationen, bei denen der Player mit externen Geraten kommunizieren muss.</p>
<p>RS-232 ermoglicht Displaysteuerung, POS-Terminal-Anbindung oder Gebaudemanagement-Kommunikation direkt vom Player aus. Die Kombination aus USB-C- und USB-A-Anschlussen gewahrleistet Kompatibilitat mit einem breiten Spektrum an Peripheriegeraten -- von Touchscreens uber Barcode-Leser bis hin zu USB-Tastenpanels. Der 6-Pin-GPIO-Port steht weiterhin fur Sensoren zur Verfugung. Hohe HTML5-Leistung, Echtzeituhr und HDR10-Unterstutzung machen dieses Modell zur umfassenden Losung fur Enterprise-Projekte.</p>
<p><strong>Ideal fur:</strong> Enterprise-Installationen mit Integrationsanforderungen, Kioske mit Peripheriegeraten (Drucker, Leser, POS), vernetzte Installationen mit Displaysteuerung uber RS-232.</p>
<p>Der XD1035 ist die Wahl fur anspruchsvolle Integratoren, die Dual 4K-Leistung und erweiterte Konnektivitat benotigen. Wenn Ihr Projekt externe Gerate umfasst, spart Ihnen dieses Modell zusatzliche Konverter und Verkabelung. Preis: 878 EUR netto.</p>`,
    },
  },

  // ─── XT245 — Premium Enterprise Player (Serie 5) ─────────────────────────
  {
    handle: "brightsign-xt245",
    modelNumber: "XT245",
    series: "5",
    translations: {
      cs: `<p>BrightSign XT245 je premie prehravac s nejlepsim HTML5 vykonem v celem portfoliu BrightSign. Podporuje 4K UHD pri 60fps vcetne true cinema rozliseni 4096x2160, HDR10, Dolby Vision i HDR10+. OpenGL podpora otevira dvere narocnym interaktivnim aplikacim, 3D vizualizacim a graficky bohatym prezentacim, ktere jine modely nezvladnou.</p>
<p>PoE++ napajeni (vyssi vykon nez standardni PoE+) umoznuje nasazeni i v narocnych podminkach. 12pinovy GPIO port nabizi dvakrat vice vstupu/vystupu nez zakladni modely -- idealni pro slozite senzorove systemy, casovani osvetleni ci integrace do chytrych budov. IR prijimac/vysilac doplnuje moznosti dalkoveho ovladani. Interni M.2 SSD a microSD slot zajistuji dostatecny ulozny prostor. Registraci v BSN.cloud ziskate 5letou zaruku.</p>
<p><strong>Idealni pro:</strong> Enterprise interaktivni instalace s dotykovymi displeji, narocne HTML5/OpenGL aplikace a dashboardy, showroomy a muzea s bohatym multimedialni obsahem.</p>
<p>XT245 je pro ty, kdo pozaduji absolutne nejlepsi vykon bez kompromisu. Dolby Vision, OpenGL, PoE++ a 12-pin GPIO -- vse, co profesionalni instalace potrebuje, v jednom kompaktnim zarízeni. Cena 24 400 Kc bez DPH.</p>`,

      sk: `<p>BrightSign XT245 je premium prehravac s najlepsim HTML5 vykonom v celom portfoliu BrightSign. Podporuje 4K UHD pri 60fps vratane true cinema rozlisenia 4096x2160, HDR10, Dolby Vision aj HDR10+. OpenGL podpora otváá dvere narocnym interaktivnym aplikaciam, 3D vizualizaciam a graficky bohatym prezentaciam, ktore ine modely nezvladnu.</p>
<p>PoE++ napajanie (vyssi vykon nez standardne PoE+) umoznuje nasadenie aj v narocnych podmienkach. 12-pinovy GPIO port ponuka dvakrat viac vstupov/vystupov nez zakladne modely -- idealny pre zlozite senzorove systemy, casovanie osvetlenia ci integracie do inteligentnych budov. IR prijimac/vysilac doplna moznosti dialkoveho ovladania. Interny M.2 SSD a microSD slot zabezpecuju dostatocny ulozny priestor. Registraciou v BSN.cloud ziskate 5-rocnu zaruku.</p>
<p><strong>Idealne pre:</strong> Enterprise interaktivne instalacie s dotykovymi displejmi, narocne HTML5/OpenGL aplikacie a dashboardy, showroomy a muzea s bohatym multimediálnym obsahom.</p>
<p>XT245 je pre tych, ktori pozaduju absolutne najlepsi vykon bez kompromisov. Dolby Vision, OpenGL, PoE++ a 12-pin GPIO -- vsetko, co profesionalna instalacia potrebuje, v jednom kompaktnom zariadeni. Cena 957 EUR bez DPH.</p>`,

      pl: `<p>BrightSign XT245 to odtwarzacz premium z najlepsza wydajnoscia HTML5 w calym portfolio BrightSign. Obsluguje 4K UHD przy 60fps, w tym rozdzielczosc true cinema 4096x2160, HDR10, Dolby Vision i HDR10+. Obsluga OpenGL otwiera drzwi wymagajacym aplikacjom interaktywnym, wizualizacjom 3D i bogatym graficznie prezentacjom, z ktorymi inne modele sobie nie poradza.</p>
<p>Zasilanie PoE++ (wyzsza moc niz standardowe PoE+) umozliwia wdrozenie nawet w wymagajacych warunkach. 12-pinowy port GPIO oferuje dwukrotnie wiecej wejsc/wyjsc niz modele podstawowe -- idealny do zlozonych systemow czujnikow, sterowania oswietleniem czy integracji z inteligentnymi budynkami. Odbiornik/nadajnik IR uzupelnia mozliwosci zdalnego sterowania. Wewnetrzny M.2 SSD i slot microSD zapewniaja odpowiednia pojemnosc. Rejestracja w BSN.cloud daje 5-letnia gwarancje.</p>
<p><strong>Idealny do:</strong> Instalacji enterprise z interaktywnymi ekranami dotykowymi, wymagajacych aplikacji HTML5/OpenGL i dashboardow, showroomow i muzeow z bogata zawartoscia multimedialna.</p>
<p>XT245 jest dla tych, ktorzy wymagaja absolutnie najlepszej wydajnosci bez kompromisow. Dolby Vision, OpenGL, PoE++ i 12-pinowy GPIO -- wszystko, czego profesjonalna instalacja potrzebuje, w jednym kompaktowym urzadzeniu. Cena 3 999 PLN netto.</p>`,

      en: `<p>The BrightSign XT245 is a premium player with the best HTML5 performance in the entire BrightSign portfolio. It supports 4K UHD at 60fps including true cinema resolution of 4096x2160, HDR10, Dolby Vision, and HDR10+. OpenGL support opens the door to demanding interactive applications, 3D visualisations, and graphically rich presentations that other models cannot handle.</p>
<p>PoE++ power delivery (higher wattage than standard PoE+) enables deployment even in demanding environments. The 12-pin GPIO port offers twice the inputs/outputs of basic models -- ideal for complex sensor systems, lighting control, and smart building integrations. An IR receiver/transmitter complements remote control capabilities. Internal M.2 SSD and microSD slots provide ample storage. BSN.cloud registration activates the 5-year warranty.</p>
<p><strong>Ideal for:</strong> Enterprise interactive installations with touch displays, demanding HTML5/OpenGL applications and dashboards, showrooms and museums with rich multimedia content.</p>
<p>The XT245 is for those who demand the absolute best performance without compromise. Dolby Vision, OpenGL, PoE++, and 12-pin GPIO -- everything a professional installation needs in one compact device. Starting at EUR 957 ex. VAT.</p>`,

      de: `<p>Der BrightSign XT245 ist ein Premium-Player mit der besten HTML5-Leistung im gesamten BrightSign-Portfolio. Er unterstutzt 4K UHD bei 60fps einschliesslich der True-Cinema-Auflosung von 4096x2160, HDR10, Dolby Vision und HDR10+. Die OpenGL-Unterstutzung offnet die Tur zu anspruchsvollen interaktiven Anwendungen, 3D-Visualisierungen und grafisch aufwendigen Prasentationen, die andere Modelle nicht bewaltigen konnen.</p>
<p>PoE++-Stromversorgung (hohere Leistung als Standard-PoE+) ermoglicht den Einsatz auch unter anspruchsvollen Bedingungen. Der 12-Pin-GPIO-Port bietet doppelt so viele Ein-/Ausgange wie Basismodelle -- ideal fur komplexe Sensorsysteme, Lichtsteuerung und Smart-Building-Integrationen. Ein IR-Empfanger/Sender erganzt die Fernsteuerungsmoglichkeiten. Interner M.2-SSD- und microSD-Slot bieten ausreichend Speicherplatz. Die BSN.cloud-Registrierung aktiviert die 5-Jahres-Garantie.</p>
<p><strong>Ideal fur:</strong> Enterprise-Interaktivinstallationen mit Touch-Displays, anspruchsvolle HTML5/OpenGL-Anwendungen und Dashboards, Showrooms und Museen mit reichhaltigen multimedialen Inhalten.</p>
<p>Der XT245 ist fur diejenigen, die kompromisslos die beste Leistung fordern. Dolby Vision, OpenGL, PoE++ und 12-Pin-GPIO -- alles, was eine professionelle Installation braucht, in einem kompakten Gerat. Ab 957 EUR netto.</p>`,
    },
  },

  // ─── XT1145 — Premium+ Player s HDMI vstupem (Serie 5) ───────────────────
  {
    handle: "brightsign-xt1145",
    modelNumber: "XT1145",
    series: "5",
    translations: {
      cs: `<p>BrightSign XT1145 je jediny model v portfoliu Serie 5, ktery nabizi HDMI vstup -- muzete pripojit notebook, kameru nebo set-top box a zobrazit externi signal primo v digital signage layoutu. To znamena, ze v konferencni mistnosti prepinate mezi firemni prezentaci a live TV jednim tlacitkem, bez dalsich zarizeni. HDCP podpora zajistuje prehravani chraneneho obsahu.</p>
<p>Prehravac sdili premie platformu s XT245: nejlepsi HTML5 vykon s OpenGL, Dolby Vision, HDR10+, 12pinovy GPIO, IR in/out, M.2 SSD a microSD uloziste. Navic pridava RS-232 seriovy port a dva USB porty (USB-A + USB-C). PoE++ napajeni umoznuje nasazeni s jedinym kabelem. Vsechny tyto schopnosti v jednom kompaktnim zarízeni eliminuji potrebu externich prepinacu, spliteru a konvertoru.</p>
<p><strong>Idealni pro:</strong> Konferencni mistnosti a zasedacky s pozadavkem na live vstup, Live TV overlay v restauracich a sportovnich barech, firemni prezentace kombinovane s digital signage.</p>
<p>XT1145 resi problem, ktery jine prehravace nedokazi -- integrace externiho HDMI zdroje do signage obsahu. Pro konferencni mistnosti, event prostory nebo kde koexistuje TV a signage, je to jedine spravne reseni. Cena 26 400 Kc bez DPH.</p>`,

      sk: `<p>BrightSign XT1145 je jediny model v portfoliu Serie 5, ktory ponuka HDMI vstup -- mozete pripojit notebook, kameru alebo set-top box a zobrazit externy signal priamo v digital signage layoute. To znamena, ze v konferencnej miestnosti prepinate medzi firemnou prezentaciou a live TV jednym tlacidlom, bez dalsich zariadeni. HDCP podpora zabezpecuje prehravanie chraneneho obsahu.</p>
<p>Prehravac zdielá premium platformu s XT245: najlepsi HTML5 vykon s OpenGL, Dolby Vision, HDR10+, 12-pinovy GPIO, IR in/out, M.2 SSD a microSD ulozisko. Navyse pridava RS-232 seriovy port a dva USB porty (USB-A + USB-C). PoE++ napajanie umoznuje nasadenie s jedinym kablom. Vsetky tieto schopnosti v jednom kompaktnom zariadeni eliminuju potrebu externich prepinacom, spliterov a konvertorov.</p>
<p><strong>Idealne pre:</strong> Konferencne miestnosti a zasadacky s poziadavkou na live vstup, Live TV overlay v restauraciach a sportovych baroch, firemne prezentacie kombinovane s digital signage.</p>
<p>XT1145 riesi problem, ktory ine prehravace nedokazu -- integraciu externeho HDMI zdroja do signage obsahu. Pre konferencne miestnosti, event priestory alebo kde koexistuje TV a signage, je to jedine spravne riesenie. Cena 1 035 EUR bez DPH.</p>`,

      pl: `<p>BrightSign XT1145 to jedyny model w portfolio Serii 5, ktory oferuje wejscie HDMI -- mozesz podlaczyc laptop, kamere lub dekoder i wyswietlic zewnetrzny sygnal bezposrednio w layoucie digital signage. To oznacza, ze w sali konferencyjnej przelaczasz miedzy firmowa prezentacja a live TV jednym przyciskiem, bez dodatkowych urzadzen. Obsluga HDCP zapewnia odtwarzanie chronionej tresci.</p>
<p>Odtwarzacz dziela platforme premium z XT245: najlepsza wydajnosc HTML5 z OpenGL, Dolby Vision, HDR10+, 12-pinowy GPIO, IR wejscie/wyjscie, M.2 SSD i slot microSD. Ponadto dodaje port szeregowy RS-232 i dwa porty USB (USB-A + USB-C). Zasilanie PoE++ umozliwia wdrozenie za pomoca jednego kabla. Wszystkie te mozliwosci w jednym kompaktowym urzadzeniu eliminuja potrzebe zewnetrznych przelacznikow, splitterow i konwerterow.</p>
<p><strong>Idealny do:</strong> Sal konferencyjnych z wymaganiem wejscia na zywo, overlayow Live TV w restauracjach i barach sportowych, prezentacji firmowych laczonych z digital signage.</p>
<p>XT1145 rozwiazuje problem, z ktorym inne odtwarzacze sobie nie radza -- integracje zewnetrznego zrodla HDMI z trescia signage. Dla sal konferencyjnych, przestrzeni eventowych lub wszedzie tam, gdzie wspolistnieje TV i signage, to jedyne wlasciwe rozwiazanie. Cena 4 349 PLN netto.</p>`,

      en: `<p>The BrightSign XT1145 is the only model in the Series 5 portfolio with an HDMI input -- you can connect a laptop, camera, or set-top box and display the external signal directly within your digital signage layout. This means that in a conference room, you switch between a corporate presentation and live TV with one button press, without additional devices. HDCP support ensures playback of protected content.</p>
<p>The player shares the premium platform with the XT245: best-in-class HTML5 performance with OpenGL, Dolby Vision, HDR10+, 12-pin GPIO, IR in/out, M.2 SSD, and microSD storage. It additionally provides an RS-232 serial port and two USB ports (USB-A + USB-C). PoE++ power enables single-cable deployment. All these capabilities in one compact device eliminate the need for external switchers, splitters, and converters.</p>
<p><strong>Ideal for:</strong> Conference rooms and boardrooms requiring live input, Live TV overlay in restaurants and sports bars, corporate presentations combined with digital signage.</p>
<p>The XT1145 solves a problem other players cannot -- integrating an external HDMI source into signage content. For conference rooms, event spaces, or anywhere TV and signage coexist, it is the only right solution. Priced at EUR 1,035 ex. VAT.</p>`,

      de: `<p>Der BrightSign XT1145 ist das einzige Modell im Serie-5-Portfolio mit einem HDMI-Eingang -- Sie konnen einen Laptop, eine Kamera oder eine Set-Top-Box anschliessen und das externe Signal direkt in Ihrem Digital-Signage-Layout anzeigen. Das bedeutet, dass Sie im Konferenzraum per Knopfdruck zwischen Firmenprasentation und Live-TV wechseln, ohne zusatzliche Gerate. HDCP-Unterstutzung gewahrleistet die Wiedergabe geschutzter Inhalte.</p>
<p>Der Player teilt die Premium-Plattform mit dem XT245: beste HTML5-Leistung mit OpenGL, Dolby Vision, HDR10+, 12-Pin-GPIO, IR Ein-/Ausgang, M.2-SSD und microSD-Speicher. Zusatzlich bietet er einen seriellen RS-232-Anschluss und zwei USB-Ports (USB-A + USB-C). PoE++-Stromversorgung ermoglicht die Bereitstellung mit nur einem Kabel. All diese Fahigkeiten in einem kompakten Gerat eliminieren den Bedarf an externen Umschaltern, Splittern und Konvertern.</p>
<p><strong>Ideal fur:</strong> Konferenzraume und Besprechungsraume mit Live-Eingangsanforderung, Live-TV-Overlay in Restaurants und Sportbars, Unternehmensprasentationen kombiniert mit Digital Signage.</p>
<p>Der XT1145 lost ein Problem, das andere Player nicht konnen -- die Integration einer externen HDMI-Quelle in Signage-Inhalte. Fur Konferenzraume, Veranstaltungsraume oder uberall dort, wo TV und Signage koexistieren, ist er die einzig richtige Losung. Preis: 1.035 EUR netto.</p>`,
    },
  },

  // ─── LS425 — Entry-level 1080p Player (Serie 5) ──────────────────────────
  {
    handle: "brightsign-ls425",
    modelNumber: "LS425",
    series: "5",
    translations: {
      cs: `<p>BrightSign LS425 je nejdostupnejsi prehravac v portfoliu BrightSign s plnou profesionalni spolehlivosti. Prehrava video v rozliseni Full HD 1080p pri 60 snimcich za sekundu s podporou kodeku H.265 a H.264. Pro jednoduche instalace -- smycky videa, staticke obrazky, zakladni HTML5 widgety nebo digitalni menu boardy -- nabizi presne to, co potrebujete, bez preplaceni za funkce, ktere nevyuzijete.</p>
<p>Prehravac je vybaven Gigabit Ethernetem, slotem pro microSD kartu a USB-C portem. Volitelny Wi-Fi modul umoznuje bezdratove pripojeni. Integrované hodiny realného casu (RTC) se superkondenzatorem zajistuji presne casove planovani obsahu. BrightSignOS garantuje spolehlivost -- boot pod 10 sekund, mesice provozu bez restartu. Registraci v BSN.cloud ziskate 5letou zaruku a bezplatnou vzdalenu spravu.</p>
<p><strong>Idealni pro:</strong> Digitalni menu boardy v restauracich a kavárnách, jednoduche video smycky ve vyloze, zakladni informacni displeje v cekarnach a kancelarich.</p>
<p>LS425 dokazuje, ze profesionalni digital signage nemusi byt drahy. Za 9 200 Kc bez DPH ziskate prehravac s 5letou zarukou, dedickovany OS a ekosystem BrightSign -- to zadny laciny Android box nenabidne.</p>`,

      sk: `<p>BrightSign LS425 je najdostupnejsi prehravac v portfoliu BrightSign s plnou profesionalnou spolalivostou. Prehrava video v rozliseni Full HD 1080p pri 60 snimkach za sekundu s podporou kodekov H.265 a H.264. Pre jednoduche instalacie -- slucky videa, staticke obrazky, zakladne HTML5 widgety alebo digitalne menu boardy -- ponuka presne to, co potrebujete, bez preplacania za funkcie, ktore nevyuzijete.</p>
<p>Prehravac je vybaveny Gigabit Ethernetom, slotom pre microSD kartu a USB-C portom. Volitelny Wi-Fi modul umoznuje bezdrotove pripojenie. Integrovane hodiny realneho casu (RTC) so superkondenzatorom zabezpecuju presne casove planovanie obsahu. BrightSignOS garantuje spolahlivost -- boot pod 10 sekund, mesiace prevadzky bez restartu. Registraciou v BSN.cloud ziskate 5-rocnu zaruku a bezplatnu vzdialenu spravu.</p>
<p><strong>Idealne pre:</strong> Digitalne menu boardy v restauraciach a kaviarniach, jednoduche video slucky vo vylohe, zakladne informacne displeje v cakárniach a kancelariach.</p>
<p>LS425 dokazuje, ze profesionalny digital signage nemusi byt drahy. Za 361 EUR bez DPH ziskate prehravac s 5-rocnou zarukou, dedickovany OS a ekosystem BrightSign -- to ziadny lacny Android box neponukne.</p>`,

      pl: `<p>BrightSign LS425 to najbardziej przystepny cenowo odtwarzacz w portfolio BrightSign z pelna profesjonalna niezawodnoscia. Odtwarza wideo w rozdzielczosci Full HD 1080p przy 60 klatkach na sekunde z obsluga kodekow H.265 i H.264. Do prostych instalacji -- petle wideo, statyczne obrazy, podstawowe widgety HTML5 lub cyfrowe tablice menu -- oferuje dokladnie to, czego potrzebujesz, bez przepłacania za funkcje, ktorych nie wykorzystasz.</p>
<p>Odtwarzacz jest wyposazony w Gigabit Ethernet, slot na karte microSD i port USB-C. Opcjonalny modul Wi-Fi umozliwia polaczenie bezprzewodowe. Zintegrowany zegar czasu rzeczywistego (RTC) z superkondensatorem zapewnia dokladne planowanie tresci w czasie. BrightSignOS gwarantuje niezawodnosc -- uruchomienie ponizej 10 sekund, miesiace pracy bez restartu. Rejestracja w BSN.cloud daje 5-letnia gwarancje i bezplatne zdalne zarzadzanie.</p>
<p><strong>Idealny do:</strong> Cyfrowych tablic menu w restauracjach i kawiarniach, prostych petli wideo w witrynach, podstawowych wyswietlaczy informacyjnych w poczekalniach i biurach.</p>
<p>LS425 udowadnia, ze profesjonalny digital signage nie musi byc drogi. Za 1 499 PLN netto otrzymujesz odtwarzacz z 5-letnia gwarancja, dedykowany OS i ekosystem BrightSign -- tego zaden tani Android box nie zaoferuje.</p>`,

      en: `<p>The BrightSign LS425 is the most affordable player in the BrightSign portfolio with full professional reliability. It plays video at Full HD 1080p resolution at 60 frames per second with H.265 and H.264 codec support. For simple installations -- video loops, static images, basic HTML5 widgets, or digital menu boards -- it delivers exactly what you need without overpaying for features you will not use.</p>
<p>The player features Gigabit Ethernet, a microSD card slot, and a USB-C port. An optional Wi-Fi module enables wireless connectivity. The integrated real-time clock (RTC) with supercapacitor ensures precise content scheduling. BrightSignOS guarantees reliability -- boot in under 10 seconds, months of operation without restart. BSN.cloud registration provides a 5-year warranty and free remote management.</p>
<p><strong>Ideal for:</strong> Digital menu boards in restaurants and cafes, simple video loops in shop windows, basic information displays in waiting rooms and offices.</p>
<p>The LS425 proves that professional digital signage does not have to be expensive. For EUR 361 ex. VAT, you get a player with a 5-year warranty, a dedicated OS, and the BrightSign ecosystem -- something no cheap Android box can match.</p>`,

      de: `<p>Der BrightSign LS425 ist der gunstigste Player im BrightSign-Portfolio mit voller professioneller Zuverlassigkeit. Er gibt Video in Full-HD-1080p-Auflosung bei 60 Bildern pro Sekunde mit H.265- und H.264-Codec-Unterstutzung wieder. Fur einfache Installationen -- Videoloops, statische Bilder, grundlegende HTML5-Widgets oder digitale Menuboards -- liefert er genau das, was Sie brauchen, ohne fur ungenutzte Funktionen zu bezahlen.</p>
<p>Der Player verfugt uber Gigabit-Ethernet, einen microSD-Kartenslot und einen USB-C-Anschluss. Ein optionales WLAN-Modul ermoglicht drahtlose Konnektivitat. Die integrierte Echtzeituhr (RTC) mit Superkondensator gewahrleistet prazise Inhaltsplanung. BrightSignOS garantiert Zuverlassigkeit -- Start in unter 10 Sekunden, monatelanger Betrieb ohne Neustart. Die BSN.cloud-Registrierung bietet 5 Jahre Garantie und kostenlose Fernverwaltung.</p>
<p><strong>Ideal fur:</strong> Digitale Menuboards in Restaurants und Cafes, einfache Videoloops in Schaufenstern, grundlegende Informationsdisplays in Wartebereichen und Buros.</p>
<p>Der LS425 beweist, dass professionelles Digital Signage nicht teuer sein muss. Fur 361 EUR netto erhalten Sie einen Player mit 5 Jahren Garantie, ein dediziertes Betriebssystem und das BrightSign-Okosystem -- das kann keine gunstige Android-Box bieten.</p>`,
    },
  },

  // ─── LS445 — Entry-level 4K Player (Serie 5) ─────────────────────────────
  {
    handle: "brightsign-ls445",
    modelNumber: "LS445",
    series: "5",
    translations: {
      cs: `<p>BrightSign LS445 je cenove nejpristupnejsi cesta k 4K digital signage v portfoliu BrightSign. Prehrava video v rozliseni 4K UHD (3840x2160) pri 60fps v 8-bit rezimu nebo 30fps v 10-bit rezimu -- ostra a detailni kvalita obrazu pro menu boardy, produktove prezentace a informacni displeje. Dekoduje H.265 i H.264, takze zvladne moderni 4K obsah bez problemu.</p>
<p>Stejne jako LS425, i LS445 je vybaven Gigabit Ethernetem, microSD slotem a USB-C portem s moznosti doplnit Wi-Fi modul. Nedisponuje GPIO, PoE ani serialem -- je to ciste obsahovy prehravac bez slozitych integracnich rozhrani. A presne to je jeho sila: jednoduchost nasazeni. BrightSignOS zajistuje stabilitu a bezudrzovost, registrace v BSN.cloud aktivuje 5letou zaruku. BrightAuthor:connected pro tvorbu a spravu obsahu je zdarma.</p>
<p><strong>Idealni pro:</strong> 4K digitalni menu boardy v gastronomii, jednoduche 4K smycky videa v retail vyloze, zakladni informacni displeje v kancelarich a cekarnach.</p>
<p>LS445 nabizi 4K kvalitu za cenu, za kterou u konkurence dostanete jen 1080p. Za 11 900 Kc bez DPH ziskate spolehlivy 4K prehravac s peti lety zaruky a ekosystemem BrightSign -- to je investice, ktera se vyplati.</p>`,

      sk: `<p>BrightSign LS445 je cenovo najdostupnejsia cesta k 4K digital signage v portfoliu BrightSign. Prehrava video v rozliseni 4K UHD (3840x2160) pri 60fps v 8-bit rezime alebo 30fps v 10-bit rezime -- ostra a detailna kvalita obrazu pre menu boardy, produktove prezentacie a informacne displeje. Dekoduje H.265 aj H.264, takze zvladne moderny 4K obsah bez problemov.</p>
<p>Rovnako ako LS425, aj LS445 je vybaveny Gigabit Ethernetom, microSD slotom a USB-C portom s moznostou doplnit Wi-Fi modul. Nedisponuje GPIO, PoE ani serialom -- je to cisto obsahovy prehravac bez zlozitych integracnych rozhrani. A presne to je jeho sila: jednoduchoslt nasadenia. BrightSignOS zabezpecuje stabilitu a bezudrzovoslt, registracia v BSN.cloud aktivuje 5-rocnu zaruku. BrightAuthor:connected na tvorbu a spravu obsahu je zadarmo.</p>
<p><strong>Idealne pre:</strong> 4K digitalne menu boardy v gastronomii, jednoduche 4K slucky videa v retail vylohe, zakladne informacne displeje v kancelariach a cakárniach.</p>
<p>LS445 ponuka 4K kvalitu za cenu, za ktoru u konkurencie dostanete len 1080p. Za 467 EUR bez DPH ziskate spolahlivy 4K prehravac s piatimi rokmi zaruky a ekosystemom BrightSign -- to je investicia, ktora sa oplati.</p>`,

      pl: `<p>BrightSign LS445 to najbardziej przystepna cenowo droga do 4K digital signage w portfolio BrightSign. Odtwarza wideo w rozdzielczosci 4K UHD (3840x2160) przy 60fps w trybie 8-bit lub 30fps w trybie 10-bit -- ostra i szczegolowa jakosc obrazu dla tablic menu, prezentacji produktow i wyswietlaczy informacyjnych. Dekoduje H.265 i H.264, wiec bez problemu poradzi sobie z nowoczesna trescia 4K.</p>
<p>Podobnie jak LS425, LS445 jest wyposazony w Gigabit Ethernet, slot microSD i port USB-C z mozliwoscia dodania modulu Wi-Fi. Nie posiada GPIO, PoE ani portu szeregowego -- to czysty odtwarzacz tresci bez zlozonych interfejsow integracyjnych. I dokladnie to jest jego sila: prostota wdrozenia. BrightSignOS zapewnia stabilnosc i bezobslugowosc, rejestracja w BSN.cloud aktywuje 5-letnia gwarancje. BrightAuthor:connected do tworzenia i zarzadzania trescia jest darmowy.</p>
<p><strong>Idealny do:</strong> Cyfrowych tablic menu 4K w gastronomii, prostych petli wideo 4K w witrynach sklepowych, podstawowych wyswietlaczy informacyjnych w biurach i poczekalniach.</p>
<p>LS445 oferuje jakosc 4K w cenie, za ktora u konkurencji dostaniesz tylko 1080p. Za 1 949 PLN netto otrzymujesz niezawodny odtwarzacz 4K z piecioma latami gwarancji i ekosystemem BrightSign -- to inwestycja, ktora sie oplaca.</p>`,

      en: `<p>The BrightSign LS445 is the most affordable path to 4K digital signage in the BrightSign portfolio. It plays video at 4K UHD resolution (3840x2160) at 60fps in 8-bit mode or 30fps in 10-bit mode -- sharp, detailed image quality for menu boards, product presentations, and information displays. It decodes both H.265 and H.264, so modern 4K content plays without issues.</p>
<p>Like the LS425, the LS445 features Gigabit Ethernet, a microSD slot, and a USB-C port with the option to add a Wi-Fi module. It does not include GPIO, PoE, or serial -- it is a pure content player without complex integration interfaces. And that is precisely its strength: simplicity of deployment. BrightSignOS ensures stability and maintenance-free operation, while BSN.cloud registration activates the 5-year warranty. BrightAuthor:connected for content creation and management is free.</p>
<p><strong>Ideal for:</strong> 4K digital menu boards in restaurants, simple 4K video loops in retail window displays, basic information screens in offices and waiting rooms.</p>
<p>The LS445 delivers 4K quality at a price where competitors offer only 1080p. For EUR 467 ex. VAT, you get a reliable 4K player with a 5-year warranty and the BrightSign ecosystem -- an investment that pays for itself.</p>`,

      de: `<p>Der BrightSign LS445 ist der gunstigste Weg zu 4K Digital Signage im BrightSign-Portfolio. Er gibt Video in 4K-UHD-Auflosung (3840x2160) bei 60fps im 8-Bit-Modus oder 30fps im 10-Bit-Modus wieder -- scharfe, detaillierte Bildqualitat fur Menuboards, Produktprasentationen und Informationsdisplays. Er dekodiert sowohl H.265 als auch H.264, sodass moderne 4K-Inhalte problemlos wiedergegeben werden.</p>
<p>Wie der LS425 verfugt der LS445 uber Gigabit-Ethernet, einen microSD-Slot und einen USB-C-Anschluss mit der Option, ein WLAN-Modul nachzurusten. Er verfugt nicht uber GPIO, PoE oder serielle Schnittstelle -- er ist ein reiner Content-Player ohne komplexe Integrationsschnittstellen. Und genau das ist seine Starke: die Einfachheit der Bereitstellung. BrightSignOS gewahrleistet Stabilitat und wartungsfreien Betrieb, die BSN.cloud-Registrierung aktiviert die 5-Jahres-Garantie. BrightAuthor:connected fur Content-Erstellung und -Verwaltung ist kostenlos.</p>
<p><strong>Ideal fur:</strong> 4K digitale Menuboards in der Gastronomie, einfache 4K-Videoloops in Schaufenstern, grundlegende Informationsdisplays in Buros und Wartebereichen.</p>
<p>Der LS445 bietet 4K-Qualitat zu einem Preis, fur den Sie bei der Konkurrenz nur 1080p bekommen. Fur 467 EUR netto erhalten Sie einen zuverlassigen 4K-Player mit 5 Jahren Garantie und dem BrightSign-Okosystem -- eine Investition, die sich auszahlt.</p>`,
    },
  },
]

// If run directly, output as JSON for manual import or piping to other tools
if (require.main === module) {
  console.log(JSON.stringify(productDescriptions, null, 2))
}
