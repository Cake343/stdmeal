/**
 * pantry.js (ui) — siatka "co mam w domu" plus dodawanie własnych produktów.
 *
 * Najbardziej klikana czesc aplikacji, wiec dostala wlasny komponent zamiast
 * zwyklych `chips`:
 *   - wyszukiwarka odporna na ogonki ("zolty ser" znajdzie "ser żółty"),
 *   - licznik zaznaczonych + szybkie czyszczenie,
 *   - naglowki kategorii, ktore znikaja razem z odfiltrowana zawartoscia,
 *   - formularz dodawania rzeczy spoza katalogu.
 *
 * Jak dziala ikona przy wlasnym produkcie (trzy poziomy, od najlepszego):
 *   1. zgadywanie z nazwy po katalogu — „ser kozi" dostaje ikone sera,
 *   2. ikona kategorii, jesli nic nie pasuje,
 *   3. reczny wybor: klikniecie podgladu przewija ikony tej kategorii.
 *
 * Stan wyszukiwarki i formularza celowo NIE trafia do store'a — to stan ulotny
 * widoku, ktorego nie chce ani w localStorage, ani w linku do udostepniania.
 */

import {
  CATEGORIES,
  CATEGORY_ICONS,
  CATEGORY_ICON_CHOICES,
  PANTRY,
  guessFromName,
  normalize,
} from '../data/pantry.js';
import { foodIcon, uiIcon } from '../icons.js';
import { getPath } from '../state.js';
import { h } from './dom.js';

export function renderPantry(field, store) {
  const path = field.path ?? 'pantry';

  // ——— pasek: szukajka, licznik, czyszczenie ———

  const search = h('input.pantry__search', {
    type: 'search',
    placeholder: 'szukaj: pomidor, ser, kasza…',
    'aria-label': 'Szukaj produktu',
    autocomplete: 'off',
  });

  const counter = h('span.pantry__count', { 'aria-live': 'polite' });

  const clear = h('button.btn.btn--ghost.btn--sm', {
    type: 'button',
    'aria-label': 'Wyczyść całą lodówkę',
    on: { click: () => store.patch({ [path]: [], custom: [] }) },
  }, ['wyczyść']);

  const toolbar = h('div.pantry__bar', {}, [
    h('span.pantry__searchicon', { html: uiIcon('search') }),
    search,
    counter,
    clear,
  ]);

  // ——— siatka katalogu ———

  /** id produktu -> przycisk (zeby sync nie musial przeszukiwac DOM-u) */
  const buttons = new Map();
  /** id kategorii -> { group, customList } */
  const groups = new Map();

  const grid = h('div.pantry__groups');

  for (const category of CATEGORIES) {
    const list = h('div.chips.chips--grid');

    for (const item of PANTRY.filter((entry) => entry.cat === category.id)) {
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

    const customList = h('div.chips.chips--grid.pantry__custom');
    const group = h('div.pantry__group', {}, [
      h('h3.pantry__cat', { text: category.pl }),
      list,
      customList,
    ]);

    groups.set(category.id, { group, customList });
    grid.append(group);
  }

  const empty = h('p.pantry__empty', {
    text: 'Nic takiego nie ma w katalogu — dodaj to niżej jako własny produkt.',
    hidden: true,
  });

  // ——— formularz: własny produkt ———

  let draftIcon = CATEGORY_ICONS.extras;
  /** Czy uzytkownik sam wybral kategorie — wtedy nie nadpisujemy jej zgadywaniem. */
  let categoryTouched = false;

  const iconPreview = h('button.pantry__addicon', {
    type: 'button',
    title: 'Kliknij, żeby zmienić ikonę',
    'aria-label': 'Zmień ikonę produktu',
  });

  const nameInput = h('input.input.pantry__addname', {
    type: 'text',
    placeholder: 'np. ser kozi, tofu wędzone, resztka pesto…',
    'aria-label': 'Nazwa własnego produktu',
    autocomplete: 'off',
    maxlength: '48',
  });

  const categorySelect = h(
    'select.input.pantry__addcat',
    { 'aria-label': 'Kategoria produktu' },
    CATEGORIES.map((category) =>
      h('option', { value: category.id }, [category.pl])
    )
  );
  categorySelect.value = 'extras';

  const addButton = h('button.btn.btn--sm', { type: 'button' }, ['dodaj']);

  function paintIcon() {
    iconPreview.innerHTML = foodIcon(draftIcon);
  }

  /** Po wpisaniu nazwy probujemy zgadnac i kategorie, i ikone. */
  function guessDraft() {
    const match = guessFromName(nameInput.value);
    if (match) {
      if (!categoryTouched) categorySelect.value = match.cat;
      draftIcon = match.icon;
    } else {
      draftIcon = CATEGORY_ICONS[categorySelect.value] ?? CATEGORY_ICONS.extras;
    }
    paintIcon();
  }

  function addCustom() {
    const name = nameInput.value.trim();
    if (!name) {
      nameInput.focus();
      return;
    }

    const current = store.getPath('custom') ?? [];
    store.set('custom', [...current, { name, cat: categorySelect.value, icon: draftIcon }]);

    nameInput.value = '';
    categoryTouched = false;
    categorySelect.value = 'extras';
    draftIcon = CATEGORY_ICONS.extras;
    paintIcon();
    nameInput.focus();
  }

  nameInput.addEventListener('input', guessDraft);
  nameInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addCustom();
    }
  });

  categorySelect.addEventListener('change', () => {
    categoryTouched = true;
    guessDraft();
  });

  // Klikanie w podglad przewija ikony dostepne dla wybranej kategorii.
  iconPreview.addEventListener('click', () => {
    const choices = CATEGORY_ICON_CHOICES[categorySelect.value] ?? [draftIcon];
    const next = (choices.indexOf(draftIcon) + 1) % choices.length;
    draftIcon = choices[next];
    paintIcon();
  });

  addButton.addEventListener('click', addCustom);
  paintIcon();

  const addForm = h('div.pantry__add', {}, [
    h('span.pantry__addlabel', { text: 'nie ma czegoś? dodaj:' }),
    h('div.pantry__addrow', {}, [iconPreview, nameInput, categorySelect, addButton]),
  ]);

  // ——— filtrowanie ———

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

      const { group, customList } = groups.get(category.id);
      // Wlasne produkty tez filtrujemy — inaczej „szukam sera" pokazywaloby
      // pusta kategorie z jednym wlasnym produktem bez zwiazku z zapytaniem.
      let customVisible = 0;
      for (const chip of customList.children) {
        const chipMatch = !query || normalize(chip.dataset.name ?? '').includes(query);
        chip.hidden = !chipMatch;
        if (chipMatch) customVisible += 1;
      }

      group.hidden = visible === 0 && customVisible === 0;
      visibleTotal += visible + customVisible;
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

  const el = h('div.pantry', {}, [toolbar, grid, empty, addForm]);
  applyFilter();

  /** Ostatnio narysowane wlasne produkty — zeby nie przerysowywac bez potrzeby. */
  let paintedCustom = '';

  function paintCustom(custom) {
    const signature = JSON.stringify(custom);
    if (signature === paintedCustom) return;
    paintedCustom = signature;

    for (const { customList } of groups.values()) customList.replaceChildren();

    for (const item of custom) {
      const target = groups.get(item.cat) ?? groups.get('extras');
      // Wlasny produkt jest z definicji zaznaczony — dodalo sie go dlatego,
      // ze sie go MA. Zamiast przelaczania ma wiec krzyzyk do usuniecia.
      const chip = h(
        'span.chip.chip--pantry.chip--custom.is-on',
        { title: item.name, dataset: { name: item.name } },
        [
          h('span.chip__ico', { html: foodIcon(item.icon) }),
          h('span.chip__label', { text: item.name }),
          h('button.chip__x', {
            type: 'button',
            'aria-label': `Usuń ${item.name}`,
            html: uiIcon('close'),
            on: {
              click: () =>
                store.set(
                  'custom',
                  (store.getPath('custom') ?? []).filter((entry) => entry.name !== item.name)
                ),
            },
          }),
        ]
      );
      target.customList.append(chip);
    }

    applyFilter();
  }

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

      const custom = getPath(state, 'custom') ?? [];
      paintCustom(custom);

      const count = selected.size + custom.length;
      counter.textContent = count === 0 ? 'nic nie wybrano' : `wybrano: ${count}`;
      clear.hidden = count === 0;
    },
  };
}
