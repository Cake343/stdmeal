/**
 * pantry.js (ui) — siatka "co mam w domu".
 *
 * Najbardziej klikana czesc aplikacji, wiec dostala wlasny komponent zamiast
 * zwyklych `chips`:
 *   - wyszukiwarka odporna na ogonki ("zolty ser" znajdzie "ser żółty"),
 *   - licznik zaznaczonych + szybkie czyszczenie,
 *   - naglowki kategorii, ktore znikaja razem z odfiltrowana zawartoscia.
 *
 * Stan wyszukiwarki celowo NIE trafia do store'a — to stan ulotny widoku,
 * ktorego nie chce ani w localStorage, ani w linku do udostepniania.
 */

import { CATEGORIES, PANTRY, normalize } from '../data/pantry.js';
import { foodIcon, uiIcon } from '../icons.js';
import { getPath } from '../state.js';
import { h } from './dom.js';

export function renderPantry(field, store) {
  const path = field.path ?? 'pantry';

  const search = h('input.pantry__search', {
    type: 'search',
    placeholder: 'szukaj: pomidor, ser, kasza…',
    'aria-label': 'Szukaj produktu',
    autocomplete: 'off',
  });

  const counter = h('span.pantry__count', { 'aria-live': 'polite' });

  const clear = h('button.btn.btn--ghost.btn--sm', {
    type: 'button',
    on: { click: () => store.set(path, []) },
  }, ['wyczyść']);

  const toolbar = h('div.pantry__bar', {}, [
    h('span.pantry__searchicon', { html: uiIcon('search') }),
    search,
    counter,
    clear,
  ]);

  /** id produktu -> przycisk (zeby sync nie musial przeszukiwac DOM-u) */
  const buttons = new Map();
  /** id kategorii -> sekcja */
  const groups = new Map();

  const grid = h('div.pantry__groups');

  for (const category of CATEGORIES) {
    const items = PANTRY.filter((item) => item.cat === category.id);
    const list = h('div.chips.chips--grid');

    for (const item of items) {
      const button = h(
        'button.chip.chip--pantry',
        {
          type: 'button',
          'aria-pressed': 'false',
          title: item.pl,
          dataset: { id: item.id },
          on: { click: () => store.toggle(path, item.id) },
        },
        [
          h('span.chip__ico', { html: foodIcon(item.icon) }),
          h('span.chip__label', { text: item.pl }),
        ]
      );
      buttons.set(item.id, button);
      list.append(button);
    }

    const group = h('div.pantry__group', {}, [
      h('h3.pantry__cat', { text: category.pl }),
      list,
    ]);
    groups.set(category.id, group);
    grid.append(group);
  }

  const empty = h('p.pantry__empty', {
    text: 'Nic takiego nie mam w katalogu — wpisz to niżej, w polu „coś jeszcze".',
    hidden: true,
  });

  function applyFilter() {
    const query = normalize(search.value);
    let visibleTotal = 0;

    for (const category of CATEGORIES) {
      let visible = 0;
      for (const item of PANTRY) {
        if (item.cat !== category.id) continue;
        const match =
          !query || normalize(`${item.pl} ${item.en} ${item.tags ?? ''}`).includes(query);
        buttons.get(item.id).hidden = !match;
        if (match) visible += 1;
      }
      groups.get(category.id).hidden = visible === 0;
      visibleTotal += visible;
    }

    empty.hidden = visibleTotal > 0;
  }

  search.addEventListener('input', applyFilter);
  search.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      search.value = '';
      applyFilter();
    }
  });

  const el = h('div.pantry', {}, [toolbar, grid, empty]);
  applyFilter();

  return {
    el,
    /** Referencja dla skrotu klawiszowego (Ctrl+K). */
    focusSearch: () => search.focus(),
    sync(state) {
      const selected = new Set(getPath(state, path) ?? []);
      for (const [id, button] of buttons) {
        const active = selected.has(id);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
        button.classList.toggle('is-on', active);
      }
      const count = selected.size;
      counter.textContent = count === 0 ? 'nic nie wybrano' : `wybrano: ${count}`;
      clear.hidden = count === 0;
    },
  };
}
