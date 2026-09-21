<div align="center">

<img src="assets/logo.svg" width="88" alt="stdmeal" />

# stdmeal

**`$ hunger | stdmeal > chatgpt`**

Kompilator promptów na jedzenie. Klikasz, co masz w lodówce i na co masz ochotę —
dostajesz gotowy prompt do wklejenia w ChatGPT albo innego ajaja.

*an oakloud thing*

[![CI](https://github.com/Cake343/stdmeal/actions/workflows/ci.yml/badge.svg)](https://github.com/Cake343/stdmeal/actions/workflows/ci.yml)
[![Docker](https://github.com/Cake343/stdmeal/actions/workflows/docker.yml/badge.svg)](https://github.com/Cake343/stdmeal/actions/workflows/docker.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-black.svg)](LICENSE)
![zależności: 0](https://img.shields.io/badge/zale%C5%BCno%C5%9Bci-0-black)

</div>

---

## Po co to jest

I tak co kilka dni pytam jakieś AI, co ugotować. I tak za każdym razem piszę to samo:
ile osób, ile mam czasu, co mam w lodówce, czego nie jem, jak ma wyglądać odpowiedź.
I tak za każdym razem o czymś zapomnę, a potem dostaję przepis z kaparami,
których nie mam i nie chcę mieć.

`stdmeal` to panel, który składa ten prompt za mnie. Klikasz przez dziewięć sekcji,
po prawej na żywo rośnie tekst w Markdownie, na końcu jest przycisk „kopiuj".
Model dostaje komplet informacji, a ja nie muszę pamiętać o niczym.

To **nie jest** klient AI. Nie ma tu żadnego klucza API, żadnego konta i żadnego
backendu — prompt kopiujesz i wklejasz tam, gdzie akurat masz subskrypcję.

```
┌──────────────────────────────────────────┬─────────────────────────┐
│  ## 00 tryby            [zaskocz mnie]   │  ## prompt    1247 zn.  │
│  ┌────────────┐ ┌────────────┐           │ ┌─────────────────────┐ │
│  │ Głodny     │ │ Tydzień    │  …        │ │ # Rola              │ │
│  │ teraz      │ │ na zapas   │           │ │ Jesteś doświadczo…  │ │
│  └────────────┘ └────────────┘           │ │                     │ │
│                                          │ │ # Zadanie           │ │
│  ## 05 lodówka i spiżarnia               │ │ Ułóż plan jedzenia  │ │
│  szukaj: pomidor, ser, kasza…     12     │ │ na 5 dni.           │ │
│  warzywa                                 │ │ Gotuję dla 2 osób.  │ │
│  [pomidory][ogórek ][papryka ]           │ │                     │ │
│  [cebula  ][czosnek][ziemniak]           │ │ ## Moja lodówka…    │ │
│  nabiał i jaja                           │ │ - Warzywa: pomido…  │ │
│  [jajka   ][mleko  ][ser     ]           │ └─────────────────────┘ │
│                                          │ [kopiuj prompt][zaznacz]│
└──────────────────────────────────────────┴─────────────────────────┘
```

*(w prawdziwej aplikacji te ikonki to własne, płaskie SVG — nie emoji)*

## Przygotuj swój pierwszy plan!
1. Wejdź na [cake343.github.io/stdmeal/](https://cake343.github.io/stdmeal/)
2. Wprowadź swoje preferencje
3. Skopiuj prompt
4. Wklej prompt do wybranego czatu Ai

## Jak uruchomić u siebie?

### Docker (tak to u mnie chodzi)

```bash
git clone https://github.com/Cake343/stdmeal.git
cd stdmeal
docker compose up -d --build
```

→ http://localhost:8080

Albo bez klonowania, prosto z rejestru:

```bash
docker run -d --name stdmeal -p 8080:8080 --restart unless-stopped \
  ghcr.io/cake343/stdmeal:latest
```

Obraz jest multi-arch (`amd64` + `arm64`), chodzi jako nieuprzywilejowany
użytkownik, ma `/healthz` i waży tyle, co nginx-alpine plus 140 kB.
Nie ma wolumenów, bo nie ma czego trwale zapisywać — wszystkie ustawienia
siedzą w `localStorage` przeglądarki.

### Bez Dockera

```bash
npm run dev       # http://localhost:5173, źródła na żywo
npm test          # 80 testów, bez instalowania czegokolwiek
npm run build     # dist/index.html — jeden plik, zero zależności
npm run preview   # zbudowany plik przez lokalny serwer
```

### Jeden plik na pendrive

Po `npm run build` plik `dist/index.html` jest samowystarczalny: HTML, CSS,
JavaScript i wszystkie ikony w jednym pliku. Można go otworzyć dwuklikiem
(`file://`), wrzucić na dowolny hosting statyczny albo skopiować na inny komputer.
Działa bez internetu.

## Co potrafi

| | |
|---|---|
| **9 sekcji** | plan, czas i sprzęt, ochota, dieta i zakazy, lodówka, zakupy, makro, format odpowiedzi, uwagi |
| **63 produkty** | z wyszukiwarką odporną na ogonki — „zolty ser" znajdzie „ser żółty" |
| **6 trybów** | „Głodny teraz", „Tydzień na zapas", „Resztki z lodówki", „Fit", „Goście", „Lunch do pracy" |
| **PL / EN** | interfejs zawsze po polsku, prompt do wyboru |
| **Zapis stanu** | sam się zapamiętuje, eksport do JSON-a, link przenoszący ustawienia na inne urządzenie |
| **Skróty** | `Ctrl+Enter` kopiuje, `Ctrl+K` skacze do wyszukiwarki, `?` pokazuje pomoc |
| **Motywy** | jasny, ciemny, za systemem |
| **Prywatność** | zero requestów, zero telemetrii, zero cookies |

## Jak to działa w środku

Przepływ danych jest jednokierunkowy i celowo nudny:

```
klik w UI ──► store.set() ──► sanitize() ──► subskrybenci
                                              ├─► syncForm()   zaznaczenia i wartości
                                              ├─► compile()    podgląd promptu
                                              └─► saveLocal()  zapis (z opóźnieniem)
```

Trzy decyzje, na których stoi cała reszta:

1. **Formularz jest opisany deklaratywnie** ([`src/js/schema.js`](src/js/schema.js)).
   Pole to typ + ścieżka w stanie + słownik opcji. Renderer wie, jak to narysować,
   więc dodanie nowego pola to trzy linijki w jednym pliku, a nie trzy pliki.
2. **Kompilator promptu jest czystą funkcją** ([`src/js/prompt/compile.js`](src/js/prompt/compile.js)).
   Te same dane → ten sam tekst. Zero DOM-u, data wstrzykiwana parametrem.
   Dzięki temu da się to porządnie przetestować.
3. **Wszystko z zewnątrz przechodzi przez `sanitize()`** ([`src/js/state.js`](src/js/state.js)).
   Dane z `localStorage` i z linku są traktowane jak wrogie: nieznane klucze lecą
   do kosza, typy są wymuszane, a id-ki filtrowane po słownikach.

Więcej — łącznie z tym, co poszło nie tak — w [worklogu](docs/WORKLOG.md)
i [dzienniku decyzji](docs/DECISIONS.md).

## Struktura

```
stdmeal/
├── index.html              szkielet — reszta powstaje z JS-a
├── src/
│   ├── css/                tokens · base · layout · components
│   └── js/
│       ├── data/           katalog spiżarni, słowniki opcji, presety
│       ├── prompt/         compile.js (czysta funkcja) + teksty PL/EN
│       ├── ui/             renderer kontrolek, spiżarnia, motyw, schowek
│       ├── icons.js        86 własnych ikon SVG
│       ├── schema.js       deklaratywny opis formularza
│       ├── state.js        niezmienny store + sanityzacja
│       └── main.js         spięcie całości
├── test/                   80 testów (node:test, zero zależności)
│   └── helpers/mini-dom.js atrapa DOM-u — aplikacja startuje w Node
├── tools/                  build.mjs (własny bundler) + serve.mjs
├── deploy/nginx.conf       konfiguracja serwera w obrazie
├── Dockerfile              build w Node → nginx bez roota
└── docs/                   worklog i decyzje
```

## Zależności

Zero. Nie „mało", nie „tylko dev" — zero. Nie ma `node_modules`, nie ma
`package-lock.json`, nie ma czego audytować i nie ma co się zepsuje za dwa lata.
Jedyne, czego potrzebujesz, to Node ≥ 20 (do buildu i testów) albo sam Docker.

## Licencja

MIT — rób, co chcesz. Zobacz [LICENSE](LICENSE).
