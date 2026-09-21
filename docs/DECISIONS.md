# Dziennik decyzji

Krótkie ADR-y: co, dlaczego i czym za to płacimy. Zapisane w chwili podejmowania
decyzji, nie dopisane później „jak wyszło".

---

## ADR-001 · Zero zależności

**Status:** przyjęte

**Kontekst.** Aplikacja ma jeden ekran, kilkadziesiąt kontrolek i jedną funkcję
biznesową (złóż tekst z pól). Naturalnym odruchem byłby Vite + React + jakiś
zestaw komponentów.

**Decyzja.** Żadnych zależności — ani produkcyjnych, ani deweloperskich.
Vanilla JS w modułach ES, `node:test` do testów, własny skrypt buildujący.

**Konsekwencje.**
- ✅ `git clone && npm test` działa natychmiast, bez `npm install`.
- ✅ Obraz Dockera nie zawiera `node_modules`, więc nie ma czego skanować
  pod kątem CVE. Za dwa lata to nadal się zbuduje.
- ✅ Nie ma pytania „czemu ten projekt waży 200 MB".
- ❌ Trzeba napisać własny router stanu (~60 linii), renderer (~200) i bundler
  (~150). To świadomy koszt, spłacony raz.
- ❌ Brak ekosystemu: nie ma gotowego date pickera ani wirtualizowanej listy.
  Przy tej skali nic z tego nie było potrzebne.

---

## ADR-002 · Formularz opisany deklaratywnie, nie ręcznie w HTML-u

**Status:** przyjęte

**Kontekst.** ~30 pól w 9 sekcjach. Napisane ręcznie w HTML-u oznaczałyby
600 linii powtarzalnego markupu i trzy miejsca do zmiany przy każdej poprawce
(markup, odczyt, zapis).

**Decyzja.** [`schema.js`](../src/js/schema.js) opisuje pole jako `{ typ, ścieżka
w stanie, słownik opcji, warunek widoczności }`. Renderer
([`ui/controls.js`](../src/js/ui/controls.js)) tłumaczy to na DOM i podpina store.

**Konsekwencje.**
- ✅ Nowe pole to trzy linijki w jednym pliku.
- ✅ Da się przetestować spójność: „czy każde pole celuje w istniejącą ścieżkę
  stanu" jest zwykłą pętlą po schemacie (patrz `test/data.test.js`).
- ❌ Nietypowa kontrolka wymaga nowego typu w rendererze (tak powstały `people`
  i `pantry`).

---

## ADR-003 · Kontrakt renderera: `{ el, sync }`

**Status:** przyjęte

**Kontekst.** Przy każdej zmianie stanu trzeba odświeżyć zaznaczenia, wartości
i widoczność pól. Najprostsze „przerysuj wszystko" gubi fokus, pozycję kursora
w polu tekstowym i scroll.

**Decyzja.** Każda kontrolka powstaje raz i zwraca funkcję `sync(state)`, która
ustawia jej wygląd. Nic się nie przerysowuje; zmienia się tylko `aria-pressed`,
`value` i `hidden`.

**Konsekwencje.**
- ✅ Pisanie w polu tekstowym jest płynne, kursor nie skacze.
- ✅ Dostępność dostajemy przy okazji — `sync` i tak musi ustawić atrybuty ARIA.
- ❌ Trzeba pamiętać, że `sync` nie może tworzyć elementów. To jedyna zasada
  tego kontraktu i jest opisana w komentarzu na górze pliku.

---

## ADR-004 · Stan niezmienny i zamrożony

**Status:** przyjęte

**Kontekst.** W aplikacji z ręcznie pisaną reaktywnością najgorsza klasa błędów
to „ktoś po cichu zmutował stan i widok się nie odświeżył". Takie rzeczy nie
rzucają wyjątku i wychodzą tygodnie później.

**Decyzja.** Każda zmiana tworzy nowy obiekt, przepuszcza go przez `sanitize()`
i zamraża w głąb (`Object.freeze` rekurencyjnie).

**Konsekwencje.**
- ✅ Próba mutacji z zewnątrz rzuca `TypeError` natychmiast, w trybie ścisłym.
- ✅ Porównanie „czy coś się zmieniło" to zwykłe `JSON.stringify`.
- ❌ Koszt klonowania przy każdym kliknięciu — przy stanie tej wielkości
  nieistotny (dziesiątki mikrosekund).

---

## ADR-005 · Sanityzacja jako granica bezpieczeństwa

**Status:** przyjęte

**Kontekst.** Stan wchodzi do aplikacji z trzech niezaufanych źródeł:
`localStorage`, `#hash` w adresie (link, który ktoś może podesłać) i importowany
plik JSON.

**Decyzja.** Wszystkie trzy przechodzą przez jedną funkcję `sanitize()`, która
przycina dane do kształtu `DEFAULTS`: nieznane klucze giną, typy są wymuszane,
liczby ograniczane do zakresu, a identyfikatory filtrowane po słownikach.
Pola tekstowe są obcinane do 600 znaków.

**Konsekwencje.**
- ✅ Spreparowany link nie wstrzyknie nic poza treścią pól tekstowych,
  które i tak trafiają wyłącznie do `textarea` (bez `innerHTML`).
- ✅ Dopisanie pola z domyślną wartością nie unieważnia zapisanych ustawień.
- ❌ Cicho odrzuca nieznane id-ki zamiast krzyczeć. Dla aplikacji, w której
  najgorszy scenariusz to „nie zaznaczył się pomidor", to właściwy kompromis.

---

## ADR-006 · Własny bundler zamiast esbuilda

**Status:** przyjęte

**Kontekst.** Chcemy zarówno czytelnych modułów w repo, jak i jednego pliku,
który da się otworzyć dwuklikiem. To standardowa robota dla bundlera.

**Decyzja.** [`tools/build.mjs`](../tools/build.mjs) — 150 linii, które zamieniają
każdy moduł w funkcję w rejestrze, przepisują `import` na `__require` i wklejają
CSS do jednego `<style>`.

Obsługiwany podzbiór składni jest wąski (nazwane importy i eksporty, bez
`default`, bez `as`, bez `import()`, bez cykli) — i **walidowany**: build wywala
się z czytelnym komunikatem, jeśli ktoś użyje czegoś spoza podzbioru.

**Konsekwencje.**
- ✅ Spójne z ADR-001 i dosłownie kilkanaście milisekund na build.
- ✅ Wynik jest czytelny — da się go przejrzeć i zrozumieć.
- ❌ To nie jest prawdziwy bundler. Gdyby projekt urósł do dziesiątek modułów
  albo potrzebował tree-shakingu, trzeba będzie sięgnąć po esbuild.
  Granicę wyznacza `assertSupported()`.

---

## ADR-007 · Ikony w JavaScripcie, nie w pliku `sprite.svg`

**Status:** przyjęte

**Kontekst.** 86 ikon (70 jedzenia, 16 interfejsu). Kanoniczne rozwiązanie to zewnętrzny plik ze `<symbol>`
i odwołania `<use href="sprite.svg#id">`.

**Decyzja.** Ikony jako obiekt w [`icons.js`](../src/js/icons.js); sprite jest
wstrzykiwany do `<body>` przy starcie.

**Konsekwencje.**
- ✅ Działa przy otwarciu z `file://` — `<use>` do zewnętrznego pliku tam nie działa,
  a jednym z celów było „dwuklik i działa".
- ✅ Jeden plik mniej do wdrożenia; build nie musi niczego kopiować.
- ✅ Testy mogą sprawdzić, czy każdy produkt wskazuje na istniejącą ikonę.
- ❌ Ikony są w pakiecie JS (~25 kB) zamiast w cache'owalnym zasobie.
  Przy jednym pliku i tak nie ma to znaczenia.

---

## ADR-008 · Link przenosi różnicę, nie cały stan

**Status:** przyjęte

**Kontekst.** Funkcja „przenieś ustawienia na telefon" wymaga zakodowania stanu
w URL-u. Cały stan to ~900 znaków JSON-a, czyli brzydki, długi link.

**Decyzja.** Kodujemy wyłącznie różnicę względem `DEFAULTS`, w Base64 URL-safe
(z jawnym kodowaniem do UTF-8, bo `btoa` nie przyjmuje polskich znaków).

**Konsekwencje.**
- ✅ Typowy link ma ~100–200 znaków, domyślny stan mieści się w kilku.
- ✅ Dopisanie nowego pola nie psuje starych linków — brakujące klucze
  uzupełnia `sanitize()`.
- ❌ Zmiana wartości domyślnej zmienia znaczenie starych linków. Przy zmianie
  niekompatybilnej podbijamy `STATE_VERSION`.

---

## ADR-009 · Design: zaznaczenie = inwersja

**Status:** przyjęte

**Kontekst.** Interfejs ma być czarno-biały, płaski i „markdownowy", a kolor ma
pochodzić wyłącznie z ikonek jedzenia. Trzeba jakoś pokazać stan zaznaczenia.

**Decyzja.** Zaznaczony element dostaje tło w kolorze tekstu i tekst w kolorze
tła. Jedna zasada dla chipów, segmentów i przełączników.

**Konsekwencje.**
- ✅ Działa identycznie w jasnym i ciemnym motywie, bez osobnych reguł.
- ✅ Nie potrzeba koloru akcentowego, więc kolorowe ikonki jedzenia zostają
  jedynym kolorem na ekranie — także na zaznaczonym, czarnym chipie.
- ✅ Kontrast wychodzi maksymalny z definicji.
- ❌ Zaznaczony chip jest bardzo „ciężki" wizualnie. Przy 63 produktach
  zaznaczonych naraz robi się ciemno — ale to i tak sygnał, że ktoś klika
  wszystko jak leci.

---

## ADR-010 · Kontener: nginx bez roota, bez wolumenów

**Status:** przyjęte

**Kontekst.** Docelowe środowisko to homelab (Oakloud). Aplikacja nie ma
backendu ani stanu po stronie serwera.

**Decyzja.** Build wieloetapowy: Node buduje i **odpala testy**, `nginx-unprivileged`
serwuje jeden plik. Zero wolumenów, `cap_drop: ALL`, `no-new-privileges`,
`/healthz` do monitoringu.

**Konsekwencje.**
- ✅ Finalny obraz nie zawiera Node'a, npm, źródeł ani testów.
- ✅ Zepsuty commit nie zamieni się w obraz — testy są częścią buildu.
- ✅ Kontener jest jednorazowy: `docker compose down && up` niczego nie traci,
  bo wszystko trwałe siedzi w przeglądarce.
- ❌ CSP musi dopuszczać `'unsafe-inline'` dla stylu i skryptu, bo cała
  aplikacja to jeden plik z osadzonym kodem. Świadomy kompromis: alternatywą
  byłyby hashe CSP generowane w buildzie — do rozważenia, jeśli aplikacja
  kiedykolwiek zacznie gadać z siecią. Dziś nie ma z czym wyciekać.
