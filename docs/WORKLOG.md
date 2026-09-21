# Worklog

Dziennik budowy `stdmeal` — od pustego katalogu do obrazu Dockera.
Decyzje są w [DECISIONS.md](DECISIONS.md); tutaj jest narracja, wpadki
i rzeczy, które okazały się ciekawsze, niż się zapowiadały.

Data: 21 września 2026. Jedna sesja, od zera.

---

## 0. Punkt wyjścia

Pusty katalog i jedno zdanie: *„i tak będę pytał jakieś AI o plan na jedzenie,
chciałbym mieć panel, który dokleja do prompta to, co trzeba uzupełnić"*.

Plus wymagania, które okazały się ważniejsze niż sama funkcja:

- ma wyglądać premium i **działać** premium,
- czarno-biało, płasko, trochę markdownowo, kolor tylko z ikonek jedzenia,
- nazwa nerdowska, pasująca do homelaba `Oakloud`,
- na końcu ma polecieć na GitHuba,
- *„overengineering tego"* — z czego zrobiłem sobie mandat, a nie żart.

## 1. Nazwa

Cztery propozycje, każda z innym rejestrem żartu:

| nazwa | żart | dlaczego odpadła |
|---|---|---|
| **Forkbomb** | `:(){ :\|:& };:` + widelec | najzabawniejsza, ale „bomba" to zła metafora dla aplikacji o jedzeniu |
| **mise.d** | *mise en place* + uniksowy demon | za bardzo „szef kuchni", za mało terminal |
| **Acorn** | żołądź, bo Oakloud to dąb | najładniejsza, najmniej nerdowska |
| **stdmeal** ✅ | `stdin`/`stdout` → `stdmeal` | wygrała |

`stdmeal` wygrała, bo jest spójna z całą resztą: cała aplikacja to dosłownie
**potok** — z lodówki na wejściu do promptu na wyjściu. Stąd tagline
`$ hunger | stdmeal > chatgpt` i logo: znak zachęty `>` z pomarańczowym kursorem.

Logo dziedziczy motyw przez CSS (`fill: var(--fg)`, `stroke: var(--bg)`),
więc w ciemnym motywie samo się odwraca. Favicon to `data:` URI wklejony
w `index.html` — żadnego dodatkowego requestu, żadnego pliku do zgubienia.

## 2. Architektura w jednym akapicie

```
klik w UI ──► store.set() ──► sanitize() ──► subskrybenci
                                              ├─► syncForm()
                                              ├─► compile()
                                              └─► saveLocal()
```

Nudne i jednokierunkowe. Ciekawe jest to, co **nie** zostało zrobione:
nie ma wirtualnego DOM-u, nie ma przerysowywania, nie ma frameworka.
Każda kontrolka powstaje raz i dostaje funkcję `sync(state)` — dzięki temu
pisanie w polu tekstowym jest płynne, a kursor nie skacze na koniec przy
każdej literze (klasyczna wpadka naiwnego „przerysuj wszystko").

## 3. Rzeczy, które okazały się ciekawsze, niż powinny

### 3.1. Polska odmiana przez liczebniki — w prompcie

W `strings.js` siedzi funkcja `plural(n, one, few, many)` implementująca polskie
reguły: `1 składnik`, `2 składniki`, `5 składników`, ale `12 składników`
(bo naście) i znowu `22 składniki`.

Pytanie brzmiało: czy to nie jest przerost formy? Odpowiedź: nie, z dwóch powodów.
Po pierwsze, ten tekst czyta człowiek przed wklejeniem — „Gotuję dla 2 osób"
czyta się normalnie, a „2 osób" w złym miejscu kłuje w oczy. Po drugie, czyta go
też model, a niechlujny prompt to sygnał, że można odpowiedzieć niechlujnie.

Przy okazji drobna lekcja z polskiego: *„Gotuję dla 2 osób"* jest poprawne,
bo „dla" łączy się z dopełniaczem, a dopełniacz liczby mnogiej brzmi tak samo
dla 2 i dla 5. Zdążyłem to raz „poprawić" w złą stronę, zanim zauważyłem.

### 3.2. Test, który znalazł prawdziwy błąd, choć aplikacja działała

Napisałem test `isPristine()` — „świeży stan jest identyczny z domyślnym”.
Wyglądał na formalność. Nie przeszedł.

```
DEFAULT : {"people":{"adults":2,"kids":0}, ...}
SANITIZE: {"people":{"adults":2,"kids":0,"v":1}, ...}
```

`sanitize()` kończyła się linijką `result.v = STATE_VERSION` — słuszną dla
korzenia stanu, ale funkcja jest **rekurencyjna**, więc każdy zagnieżdżony
obiekt (`people`, `shopping`, `nutrition`, `output`) dostawał własny znacznik
wersji. Aplikacja działała bez zarzutu. Efekty byłyby subtelne i późne:
puchnące linki, zaśmiecony eksport i porównania stanu, które nigdy nie są równe.

Poprawka to `if (path === '')`. Wartość testu: pełna.

### 3.3. Build wywalił się na własnej kontroli jakości

`build.mjs` po sklejeniu wszystkiego sprawdza, czy w wyniku nie zostały
odwołania do `src/`. Pierwsze uruchomienie:

```
[build] w wyniku zostały odwołania do src/ — coś się nie podmieniło
```

Fałszywy alarm — i to pouczający. Wynik rzeczywiście zawiera napisy
`"src/js/state.js"`, ale jako **klucze rejestru modułów**, a nie ścieżki do
plików. Kontrola sprawdzała treść, a chodziło o coś węższego: czy nie został
`href=` albo `src=` wskazujący na plik, którego obok `dist/index.html` nie ma.

Regex zmienił się na `/(?:href|src)="(?:\.\/)?src\//`. Morał: walidacja
powinna sprawdzać dokładnie to, co jest obietnicą, a nie coś podobnego.

### 3.4. Aplikacja startuje w Node, na atrapie DOM-u

To miał być moment na sprawdzenie strony w przeglądarce. Rozszerzenie do
Chrome nie było podłączone, więc kliknięcie na żywo odpadło.

Zamiast odesłać kod ze słowami „powinno działać", powstał
[`test/helpers/mini-dom.js`](../test/helpers/mini-dom.js): ~230 linii atrapy DOM-u
obsługującej dokładnie te API, których używa aplikacja — `createElement`,
`classList`, `dataset`, `append`, `addEventListener`, `querySelector` dla
selektorów `#id`, `.klasa`, `tag` i `[atrybut]`.

Na tym startuje **prawdziwy `main.js`**. Szkielet strony nie jest przepisany
ręcznie — id-ki są wyciągane regexem z prawdziwego `index.html`, więc test
korzysta z tego samego źródła co przeglądarka. `test/ui.test.js` klika potem
w chipy, presety, przełączniki i licznik dni, i sprawdza, czy tekst promptu
faktycznie się zmienia.

To nie zastępuje obejrzenia strony (stylów i układu ta atrapa nie liczy),
ale zamienia najważniejsze pytanie — *„czy to w ogóle wstaje i reaguje"* —
w coś, co sprawdza `npm test` w pół sekundy.

### 3.5. Test okablowania i dziewięć klas-widm

Osobny test porównuje nazwy między HTML-em, JS-em i CSS-em: czy każde
`qs('#coś')` ma swój element, czy każda ikona istnieje, czy każda klasa ma
regułę w CSS.

Za pierwszym razem wypadło dziewięć klas bez reguły. Cztery z nich to były
prawdziwe niedoróbki i dostały style (m.in. `.switch__label` i wyrównanie
podpowiedzi przy przełączniku). Pozostałe pięć to czyste uchwyty strukturalne —
`.field`, `.pantry__group` i podobne, istniejące tylko po to, żeby dało się je
znaleźć w drzewie. Zamiast dosypywać im pustych reguł, trafiły na jawną,
skomentowaną listę wyjątków w teście.

Test dodatkowo pilnuje, żeby ciemny motyw „z systemu" i ten wymuszony ręcznie
nadpisywały **dokładnie ten sam zestaw zmiennych** — o rozjechanie się tych
dwóch list jest bardzo łatwo, a objawia się to jedną brzydką barwą w jednym
trybie.

### 3.6. `log_format` w nginksie

Konfiguracja nginx najpierw miała `log_format` wewnątrz bloku `server`.
To błąd składni — dyrektywa jest dozwolona tylko w kontekście `http`.
Kontener nie wstałby w ogóle. Ponieważ `conf.d/*.conf` jest dołączany wewnątrz
`http`, wystarczyło przenieść linijkę ponad blok `server`.

Wyłapane przy czytaniu, nie przy uruchomieniu — demon Dockera na tej maszynie
był wyłączony (patrz „Czego nie sprawdziłem").

### 3.7. Ikony: 86 sztuk, ręcznie

Każda z 70 ikon jedzenia to 2–4 kształty SVG w siatce 24×24, z kolorami wpisanymi na stałe.
Na stałe, bo muszą wyglądać tak samo na białym tle i na czarnym — a zaznaczony
chip jest czarny. Ikony interfejsu odwrotnie: rysowane `currentColor`,
żeby dziedziczyły kolor tekstu. Test pilnuje tego rozdziału i wywala się,
jeśli ikona UI dostanie zapieczony kolor.

### 3.8. Dwa błędy, które wyszły dopiero w CI

Obraz Dockera nie dał się zweryfikować lokalnie (demon wyłączony), więc
weryfikacja przeniosła się do CI. I dobrze, bo znalazła dwie rzeczy:

**`.dockerignore` kontra testy w buildzie.** Dockerfile celowo uruchamia
`node --test` w etapie budowania, żeby zepsuty commit nie zamienił się
w obraz. Tyle że `.dockerignore` wykluczał katalog `test/` — odruchowo,
bo „testy nie są potrzebne w obrazie". Build padał na `"/test": not found`.
Testy rzeczywiście nie trafiają do finalnego obrazu, ale muszą być
w **kontekście** budowania. Plik ma teraz komentarz, żeby nikt (łącznie ze mną
za pół roku) tego nie „posprzątał" z powrotem.

**`add_header` w nginksie nie dokłada, tylko zastępuje.** To klasyczna pułapka:
nagłówki z bloku `server` są dziedziczone przez `location` **tylko wtedy, gdy
ten location nie ma żadnego własnego `add_header`**. Wystarczy jeden, żeby
wszystkie odziedziczone zniknęły.

W konfiguracji był osobny `location = /index.html` ustawiający samo
`Cache-Control`. Efekt: strona główna — czyli jedyna strona w tej aplikacji —
szła bez CSP, bez `X-Content-Type-Options`, bez niczego. Konfiguracja wyglądała
poprawnie i przechodziła `nginx -t`.

Wyłapał to dopiero test dymny kontenera dopisany do CI, który odpytuje
uruchomioną instancję i sprawdza nagłówki w odpowiedzi. Test powstał
dosłownie commit wcześniej — i od razu się zwrócił.

Ten sam test sprawdza przy okazji, że proces w kontenerze nie ma uid 0.

## 4. Chronologia

| # | Etap | Efekt |
|---|---|---|
| 1 | Rekonesans, `git init`, wybór nazwy | Node 24, gh zalogowany, Docker CLI bez demona |
| 2 | 70 ikon SVG + katalog 63 produktów | `icons.js`, `data/` |
| 3 | Stan, sanityzacja, schemat formularza | `state.js`, `schema.js` |
| 4 | Kompilator promptu PL/EN | `prompt/compile.js` + `strings.js` |
| 5 | Warstwa UI: renderer, spiżarnia, motyw | `ui/`, `main.js` |
| 6 | Design system: 4 arkusze CSS | tokeny → baza → układ → komponenty |
| 7 | Własny bundler + serwer dev | `dist/index.html` = 139 kB |
| 8 | 80 testów w 5 plikach | złapany błąd `sanitize()` |
| 9 | Docker, nginx, compose, CI | 3 workflow'y, obraz multi-arch |
| 10 | Dokumentacja | README, ADR-y, ten plik |
| 11 | Publikacja i CI | repo publiczne, obraz w GHCR, dwa błędy złapane przez CI |

## 5. Liczby

```
kod źródłowy      ~3 830 linii (JS + CSS + HTML)
testy             ~1 270 linii, 80 testów, 3,2 s
narzędzia         259 linii (bundler + serwer dev)
zależności        0
ikony             86 (70 jedzenia + 16 interfejsu), rysowane ręcznie
produkty          63 w 6 kategoriach
build             ~15 ms → jeden plik 139 kB
obraz             nginx-alpine + 139 kB, bez roota
```

## 6. Czego nie sprawdziłem

Uczciwa lista, żeby nie było niespodzianek:

- **Wyglądu w prawdziwej przeglądarce.** Rozszerzenie Chrome nie było
  podłączone, więc strony nie widziałem na oczy. Logika, okablowanie i reakcje
  są przetestowane automatycznie, ale rozmiary, odstępy i zachowanie przy
  wąskim ekranie to rzeczy do obejrzenia na żywo.
- ~~**Buildu obrazu Dockera.**~~ Nadrobione: lokalny demon nie działał,
  więc weryfikacja poszła do CI. Każdy push buduje obraz, odpala `nginx -t`,
  startuje kontener i sprawdza `/healthz`, treść strony, nagłówki
  bezpieczeństwa i to, że proces nie chodzi jako root. Po drodze wyszły
  dwa prawdziwe błędy (patrz 3.8). Obraz jest publiczny:
  `docker pull ghcr.io/cake343/stdmeal:latest` — sprawdzone anonimowo.
- **GitHub Pages.** Workflow jest gotowy, ale celowo odpala się wyłącznie
  ręcznie. Publiczny adres w internecie to decyzja właściciela, a nie efekt
  uboczny pusha. Żeby włączyć: Settings → Pages → Source: GitHub Actions,
  potem Actions → Pages → Run workflow.

## 7. Co dalej (gdyby kiedyś wrócić)

- **Hashe CSP zamiast `'unsafe-inline'`** — build mógłby liczyć sumy
  osadzonego skryptu i stylu i wstrzykiwać je do nagłówka.
- **Historia promptów** — ostatnie N wygenerowanych, w `localStorage`.
  Kuszące, ale to pierwszy krok do aplikacji z pamięcią, czyli do backupów
  i migracji. Świadomie odłożone.
- **Własne produkty w spiżarni** — dopisywane do katalogu, nie tylko do pola
  tekstowego. Wymaga przemyślenia id-ków (dziś to zamknięty słownik,
  co jest fundamentem sanityzacji).
- **Eksport do PDF-a listy zakupów** — ale to już praca dla modelu, nie dla
  tej aplikacji.

---

*Zbudowane w jednej sesji, z Claude Code. Cały kod, komentarze i ta dokumentacja
powstały razem — worklog nie jest dopisany po fakcie.*
