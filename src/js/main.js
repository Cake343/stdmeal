/**
 * main.js — spina wszystko w calosc.
 *
 * Przeplyw danych jest jednokierunkowy i az nudny, i o to chodzi:
 *
 *   klik w UI -> store.set() -> sanitize() -> subskrybenci
 *                                              |-> syncForm()   (zaznaczenia, wartosci)
 *                                              |-> compile()    (podglad promptu)
 *                                              `-> saveLocal()  (z opoznieniem)
 *
 * Nie ma tu zadnego "przerysuj wszystko" — formularz powstaje raz, potem tylko
 * synchronizuje swoj wyglad ze stanem.
 */

import { PRESETS, PRESETS_BY_ID } from './data/presets.js';
import { CUISINES, MOODS } from './data/options.js';
import { spriteMarkup, foodIcon, uiIcon } from './icons.js';
import {
  initialState,
  clearLocal,
  fromJsonFile,
  saveLocal,
  shareUrl,
  toJsonFile,
} from './persist.js';
import { compile, stats } from './prompt/compile.js';
import { SECTIONS } from './schema.js';
import { createStore } from './state.js';
import { copyText, createTheme, downloadFile, pickTextFile, toast } from './ui/chrome.js';
import { renderSections } from './ui/controls.js';
import { debounce, h, qs } from './ui/dom.js';

// ——— start ————————————————————————————————————————————————————

document.body.insertAdjacentHTML('afterbegin', spriteMarkup());

const store = createStore(initialState());

// Skroty z manifestu PWA (dlugie przytrzymanie ikony aplikacji) wchodza
// jako ?tryb=now. Preset doklada sie do wczytanego stanu, tak samo jak klik.
const requestedPreset = new URLSearchParams(location.search).get('tryb');
if (requestedPreset && PRESETS_BY_ID[requestedPreset]) {
  store.patch(PRESETS_BY_ID[requestedPreset].patch);
}

// Link ze stanem i parametr trybu sa juz odczytane — czyscimy adres, zeby
// odswiezenie strony nie cofalo zmian do wersji z linku.
if (location.hash || location.search) history.replaceState(null, '', location.pathname);

// ——— formularz ————————————————————————————————————————————————

const syncForm = renderSections(qs('#form'), SECTIONS, store);

// ——— presety ——————————————————————————————————————————————————

const presetBar = qs('#presets');
for (const preset of PRESETS) {
  presetBar.append(
    h(
      'button.preset',
      {
        type: 'button',
        title: preset.hint,
        on: {
          click: () => {
            store.patch(preset.patch);
            toast(`Tryb: ${preset.pl.toLowerCase()}`);
          },
        },
      },
      [
        h('span.preset__ico', { html: foodIcon(preset.icon) }),
        h('span.preset__text', {}, [
          h('span.preset__name', { text: preset.pl }),
          h('span.preset__hint', { text: preset.hint }),
        ]),
      ]
    )
  );
}

// „Zaskocz mnie" — losuje klimat i kuchnie. Jedyne miejsce z losowoscia,
// bo cala reszta aplikacji ma byc przewidywalna.
qs('#btn-random').addEventListener('click', () => {
  const pick = (list, count) =>
    [...list]
      .sort(() => Math.random() - 0.5)
      .slice(0, count)
      .map((option) => option.id);
  store.patch({ moods: pick(MOODS, 2), cuisines: pick(CUISINES, 1) });
  toast('Wylosowano klimat i kuchnię');
});

// ——— podglad promptu ——————————————————————————————————————————

const preview = qs('#prompt');
const statsLine = qs('#stats');

function renderPreview(state) {
  const text = compile(state);
  preview.value = text;
  const info = stats(text, state.lang);
  statsLine.textContent = `${info.chars} znaków · ${info.words} słów · ~${info.tokens} tokenów`;
  return text;
}

// ——— akcje ————————————————————————————————————————————————————

async function doCopy() {
  const ok = await copyText(preview.value);
  toast(ok ? 'Prompt w schowku — wklej do AI' : 'Nie udało się skopiować, zaznacz ręcznie', ok ? 'ok' : 'warn');
  if (!ok) {
    preview.focus();
    preview.select();
  }
}

qs('#btn-copy').addEventListener('click', doCopy);
qs('#btn-copy-mobile').addEventListener('click', doCopy);

qs('#btn-select').addEventListener('click', () => {
  preview.focus();
  preview.select();
  toast('Zaznaczone — Ctrl+C');
});

qs('#btn-download').addEventListener('click', () => {
  const date = new Date().toISOString().slice(0, 10);
  downloadFile(`stdmeal-${date}.md`, preview.value);
  toast('Zapisano plik .md');
});

qs('#btn-share').addEventListener('click', async () => {
  const url = shareUrl(store.get());
  const ok = await copyText(url);
  toast(ok ? 'Link z ustawieniami w schowku' : 'Nie udało się skopiować linku', ok ? 'ok' : 'warn');
});

qs('#btn-export').addEventListener('click', () => {
  downloadFile('stdmeal-ustawienia.json', toJsonFile(store.get()), 'application/json');
  toast('Ustawienia wyeksportowane');
});

qs('#btn-import').addEventListener('click', async () => {
  const text = await pickTextFile();
  if (!text) return;
  const parsed = fromJsonFile(text);
  if (!parsed) {
    toast('To nie wygląda na plik stdmeal', 'warn');
    return;
  }
  store.replace(parsed);
  toast('Ustawienia wczytane');
});

// Reset bez okienka systemowego: drugi klik w ciagu 3 sekund potwierdza.
const resetButton = qs('#btn-reset');
let resetArmed = 0;
resetButton.addEventListener('click', () => {
  const now = Date.now();
  if (now - resetArmed > 3000) {
    resetArmed = now;
    resetButton.classList.add('is-armed');
    resetButton.setAttribute('title', 'Kliknij jeszcze raz, żeby wyczyścić');
    toast('Kliknij jeszcze raz, żeby wyczyścić wszystko', 'warn');
    setTimeout(() => {
      resetButton.classList.remove('is-armed');
      resetButton.setAttribute('title', 'Wyczyść wszystko');
    }, 3000);
    return;
  }
  resetArmed = 0;
  resetButton.classList.remove('is-armed');
  clearLocal();
  store.reset();
  toast('Wyczyszczone');
});

// ——— motyw ————————————————————————————————————————————————————

const theme = createTheme(qs('#btn-theme'));
qs('#btn-theme').addEventListener('click', () => {
  const mode = theme.cycle();
  toast(`Motyw: ${{ auto: 'systemowy', light: 'jasny', dark: 'ciemny' }[mode]}`);
});

// ——— pomoc / skroty ———————————————————————————————————————————

const help = qs('#help');
qs('#btn-help').addEventListener('click', () => help.showModal());
qs('#help-close').addEventListener('click', () => help.close());
help.addEventListener('click', (event) => {
  // klik w tlo (poza kartka) zamyka
  if (event.target === help) help.close();
});

document.addEventListener('keydown', (event) => {
  const typing = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);

  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault();
    doCopy();
    return;
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    qs('.pantry__search')?.focus();
    return;
  }
  if (event.key === '?' && !typing) {
    event.preventDefault();
    help.open ? help.close() : help.showModal();
  }
});

// ——— reakcja na zmiane stanu ——————————————————————————————————

const persist = debounce((state) => saveLocal(state), 400);

store.subscribe((state) => {
  syncForm(state);
  renderPreview(state);
  persist(state);
});

// pierwsze malowanie
syncForm(store.get());
renderPreview(store.get());

// Rok w stopce — zeby nie zdezaktualizowal sie sam z siebie.
const year = qs('#year');
if (year) year.textContent = String(new Date().getFullYear());

// Ikony w miejscach, ktore w HTML-u sa tylko szkieletem.
for (const node of document.querySelectorAll('[data-icon]')) {
  node.innerHTML = uiIcon(node.dataset.icon);
}

// ——— PWA ——————————————————————————————————————————————————————

/**
 * Service worker rejestrujemy tylko po HTTP(S) — przy otwarciu jednego pliku
 * z dysku (file://) przegladarka i tak by go odrzucila, a w konsoli zostalby
 * brzydki blad. Kolejnosc warunkow ma znaczenie: najpierw sprawdzamy nawigator,
 * bo w srodowisku testowym `location` jest atrapa bez protokolu.
 */
if ('serviceWorker' in (globalThis.navigator ?? {}) && String(location.protocol).startsWith('http')) {
  navigator.serviceWorker
    .register('./sw.js')
    .then((registration) => {
      registration.addEventListener('updatefound', () => {
        const fresh = registration.installing;
        if (!fresh) return;

        fresh.addEventListener('statechange', () => {
          // `controller` istnieje tylko wtedy, gdy cos juz dzialalo wczesniej —
          // czyli to aktualizacja, a nie pierwsza instalacja.
          if (fresh.state === 'installed' && navigator.serviceWorker.controller) {
            toast('Jest nowa wersja — odśwież stronę');
          }
        });
      });
    })
    .catch(() => {
      // Brak service workera to nie powod, zeby aplikacja przestala dzialac.
    });
}
