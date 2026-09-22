/**
 * controls.js — renderuje pola opisane w schema.js i spina je ze store'em.
 *
 * Kontrakt: kazdy renderer zwraca { el, sync }.
 *   el   — gotowy wezel DOM (wstawiany raz)
 *   sync — funkcja wywolywana po KAZDEJ zmianie stanu; ma ustawic wizualny stan
 *          kontrolki na podstawie `state`, ale nie tworzyc niczego od nowa.
 *
 * Dzieki temu nie przerysowujemy formularza — a wiec nie tracimy fokusu,
 * pozycji kursora w polu tekstowym ani pozycji scrolla.
 */

import { h } from './dom.js';
import { foodIcon, uiIcon } from '../icons.js';
import { getPath } from '../state.js';
import { renderPantry } from './pantry.js';

/** Opakowanie pola: etykieta + podpowiedz + kontrolka. */
function fieldWrap(field, control) {
  return h('div.field', { dataset: { path: field.path ?? field.type } }, [
    field.label ? h('div.field__label', { text: field.label }) : null,
    control,
    field.hint ? h('p.field__hint', { text: field.hint }) : null,
  ]);
}

/** Jeden wybor z kilku — wyglada jak przelacznik, zachowuje sie jak radio. */
function segmented(field, store) {
  const buttons = field.options.map((option) =>
    h(
      'button.seg__item',
      {
        type: 'button',
        role: 'radio',
        'aria-checked': 'false',
        dataset: { id: option.id },
        on: { click: () => store.set(field.path, option.id) },
      },
      [option.pl]
    )
  );

  const group = h('div.seg', { role: 'radiogroup', 'aria-label': field.label ?? '' }, buttons);

  return {
    el: fieldWrap(field, group),
    sync(state) {
      const current = getPath(state, field.path);
      for (const button of buttons) {
        const active = button.dataset.id === String(current);
        button.setAttribute('aria-checked', active ? 'true' : 'false');
        button.classList.toggle('is-on', active);
      }
    },
  };
}

/** Wielokrotny wybor — kolorowa ikonka + etykieta. */
function chips(field, store) {
  const buttons = field.options.map((option) =>
    h(
      'button.chip',
      {
        type: 'button',
        'aria-pressed': 'false',
        dataset: { id: option.id },
        on: { click: () => store.toggle(field.path, option.id) },
      },
      [
        option.icon
          ? h('span.chip__ico', { html: foodIcon(option.icon) })
          : null,
        h('span.chip__label', { text: option.pl }),
      ]
    )
  );

  const group = h('div.chips', { role: 'group', 'aria-label': field.label ?? '' }, buttons);

  return {
    el: fieldWrap(field, group),
    sync(state) {
      const selected = new Set(getPath(state, field.path) ?? []);
      for (const button of buttons) {
        const active = selected.has(button.dataset.id);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
        button.classList.toggle('is-on', active);
      }
    },
  };
}

/** Licznik z plusem i minusem. */
function stepperControl({ path, min = 0, max = 99, store, ariaLabel }) {
  const value = h('output.stepper__value', { 'aria-live': 'off' });
  const bump = (delta) => {
    const current = Number(store.getPath(path)) || 0;
    store.set(path, Math.min(max, Math.max(min, current + delta)));
  };

  const control = h('div.stepper', { 'aria-label': ariaLabel ?? '' }, [
    h('button.stepper__btn', {
      type: 'button',
      'aria-label': 'mniej',
      html: uiIcon('minus'),
      on: { click: () => bump(-1) },
    }),
    value,
    h('button.stepper__btn', {
      type: 'button',
      'aria-label': 'więcej',
      html: uiIcon('plus'),
      on: { click: () => bump(1) },
    }),
  ]);

  return {
    el: control,
    sync(state) {
      value.textContent = String(getPath(state, path) ?? 0);
    },
  };
}

function stepper(field, store) {
  const control = stepperControl({ ...field, store, ariaLabel: field.label });
  return { el: fieldWrap(field, control.el), sync: control.sync };
}

/** Dwa liczniki obok siebie: dorosli i dzieci. */
function people(field, store) {
  const adults = stepperControl({ path: 'people.adults', min: 0, max: 20, store, ariaLabel: 'dorośli' });
  const kids = stepperControl({ path: 'people.kids', min: 0, max: 20, store, ariaLabel: 'dzieci' });

  const control = h('div.people', {}, [
    h('div.people__slot', {}, [h('span.people__tag', { text: 'dorośli' }), adults.el]),
    h('div.people__slot', {}, [h('span.people__tag', { text: 'dzieci' }), kids.el]),
  ]);

  return {
    el: fieldWrap(field, control),
    sync(state) {
      adults.sync(state);
      kids.sync(state);
    },
  };
}

/** Pole tekstowe / wieloliniowe. */
function textInput(field, store, multiline = false) {
  const input = multiline
    ? h('textarea.input', { rows: field.rows ?? 3, placeholder: field.placeholder ?? '' })
    : h('input.input', {
        type: 'text',
        placeholder: field.placeholder ?? '',
        inputmode: field.inputmode,
        autocomplete: 'off',
      });

  input.addEventListener('input', () => store.set(field.path, input.value));

  return {
    el: fieldWrap(field, input),
    sync(state) {
      const value = String(getPath(state, field.path) ?? '');
      // Nie ruszamy pola, w ktorym uzytkownik wlasnie pisze — inaczej kursor
      // skakalby na koniec przy kazdym wcisnieciu klawisza.
      if (document.activeElement !== input && input.value !== value) input.value = value;
    },
  };
}

/** Przelacznik wlacz/wylacz. */
function toggle(field, store) {
  const button = h('button.switch', {
    type: 'button',
    role: 'switch',
    'aria-checked': 'false',
    on: {
      click: () => store.set(field.path, !store.getPath(field.path)),
    },
  }, [h('span.switch__track', {}, [h('span.switch__thumb')]), h('span.switch__label', { text: field.label })]);

  return {
    el: h('div.field.field--switch', { dataset: { path: field.path } }, [
      button,
      field.hint ? h('p.field__hint', { text: field.hint }) : null,
    ]),
    sync(state) {
      const on = Boolean(getPath(state, field.path));
      button.setAttribute('aria-checked', on ? 'true' : 'false');
      button.classList.toggle('is-on', on);
    },
  };
}

/**
 * Uwaga w ramce — pokazuje sie tylko wtedy, gdy ustawienia sie nie spinaja
 * (np. „gotuj tylko z tego, co mam" przy pustej lodowce). Widocznosc obsluguje
 * zwykle `when` ze schematu, wiec ten renderer nie ma wlasnego stanu.
 */
function note(field) {
  return {
    el: h('p.note', { text: field.text }),
    sync() {},
  };
}

const RENDERERS = {
  segmented,
  chips,
  stepper,
  people,
  note,
  switch: toggle,
  text: (field, store) => textInput(field, store, false),
  textarea: (field, store) => textInput(field, store, true),
  pantry: (field, store) => {
    const built = renderPantry(field, store);
    return { el: fieldWrap(field, built.el), sync: built.sync };
  },
};

/**
 * Renderuje wszystkie sekcje schematu do `root`.
 * @returns {(state: object) => void} funkcja synchronizujaca caly formularz
 */
export function renderSections(root, sections, store) {
  const syncers = [];

  for (const section of sections) {
    const body = h('div.section__body');

    // Licznik przy tytule: ile rzeczy jest w tej sekcji zaznaczonych.
    // Widac go przy przewijaniu, wiec nie trzeba wracac i sprawdzac.
    const countedPaths = section.fields
      .filter((field) => field.path && (field.type === 'chips' || field.type === 'pantry'))
      .map((field) => field.path);
    const counter = countedPaths.length > 0 ? h('span.section__count') : null;

    const element = h('section.section', { id: `sec-${section.id}` }, [
      h('header.section__head', {}, [
        h('h2.section__title', {}, [
          h('span.section__hash', { text: '##' }),
          h('span.section__num', { text: section.num }),
          h('span.section__name', { text: section.title }),
          counter,
        ]),
        section.hint ? h('p.section__hint', { text: section.hint }) : null,
      ]),
      body,
    ]);

    if (counter) {
      syncers.push((state) => {
        const total = countedPaths.reduce(
          (sum, path) => sum + (getPath(state, path)?.length ?? 0),
          0
        );
        counter.textContent = total > 0 ? `· ${total}` : '';
      });
    }

    for (const field of section.fields) {
      const renderer = RENDERERS[field.type];
      if (!renderer) throw new Error(`Nieznany typ pola: ${field.type}`);
      const built = renderer(field, store);
      body.append(built.el);
      syncers.push((state) => {
        if (field.when) built.el.hidden = !field.when(state);
        built.sync(state);
      });
    }

    root.append(element);
  }

  return (state) => {
    for (const sync of syncers) sync(state);
  };
}
