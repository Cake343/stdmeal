/**
 * state.js — jedno zrodlo prawdy o tym, co uzytkownik wyklikal.
 *
 * Zasady:
 *  1. Stan jest zwyklym, serializowalnym obiektem (JSON in / JSON out).
 *     Zadnych Setow ani Map — inaczej link do udostepniania i localStorage
 *     wymagalyby wlasnego (de)serializatora.
 *  2. Dostep przez sciezki ("people.adults"), zeby schema UI mogla byc
 *     deklaratywna i nie znala struktury stanu.
 *  3. Wszystko, co wchodzi z zewnatrz (localStorage, #hash w URL, import JSON),
 *     przechodzi przez `sanitize()`. Nieznane klucze leca do kosza, typy sa
 *     wymuszane wg DEFAULTS, a id-ki filtrowane po slownikach — dzieki temu
 *     spreparowany link nie wstrzyknie niczego do promptu poza polami tekstowymi.
 */

import { PANTRY } from './data/pantry.js';
import {
  ALLERGENS,
  CUISINES,
  DIETS,
  EFFORTS,
  EQUIPMENT,
  GOALS,
  LANGS,
  LENGTHS,
  MEALS,
  MOODS,
  OUTPUT_PARTS,
  PANTRY_MODES,
  SCOPES,
  TIMES,
} from './data/options.js';

/** Wersja formatu stanu. Podbijamy przy zmianie niekompatybilnej. */
export const STATE_VERSION = 1;

export const DEFAULTS = Object.freeze({
  v: STATE_VERSION,
  lang: 'pl',
  people: { adults: 2, kids: 0 },
  scope: 'day',
  days: 3,
  meals: ['dinner'],
  time: '30',
  effort: 'normal',
  equipment: ['pan', 'pot', 'oven'],
  moods: [],
  cuisines: [],
  diets: [],
  allergens: [],
  allergensExtra: '',
  likes: '',
  dislikes: '',
  pantry: [],
  pantryExtra: '',
  pantryMode: 'prefer',
  shopping: { allowed: true, maxItems: '', budget: '' },
  nutrition: { enabled: false, kcal: '', protein: '', goal: 'maintain' },
  output: {
    parts: ['plan', 'recipes', 'amounts', 'shopping', 'aisles', 'timings', 'swaps'],
    length: 'normal',
    askFirst: false,
    noFluff: true,
  },
  notes: '',
});

/** Mapa: sciezka w stanie -> slownik dozwolonych id-kow. */
const ENUMS = {
  lang: LANGS,
  scope: SCOPES,
  time: TIMES,
  effort: EFFORTS,
  pantryMode: PANTRY_MODES,
  meals: MEALS,
  equipment: EQUIPMENT,
  moods: MOODS,
  cuisines: CUISINES,
  diets: DIETS,
  allergens: ALLERGENS,
  pantry: PANTRY,
  'nutrition.goal': GOALS,
  'output.parts': OUTPUT_PARTS,
  'output.length': LENGTHS,
};

const LIMITS = {
  'people.adults': [0, 20],
  'people.kids': [0, 20],
  days: [1, 14],
};

/** Maksymalna dlugosc pol tekstowych — zeby link/localStorage nie spuchl. */
const MAX_TEXT = 600;

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function defaultState() {
  return clone(DEFAULTS);
}

export function getPath(object, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), object);
}

export function setPath(object, path, value) {
  const keys = path.split('.');
  const last = keys.pop();
  let cursor = object;
  for (const key of keys) {
    if (typeof cursor[key] !== 'object' || cursor[key] === null) cursor[key] = {};
    cursor = cursor[key];
  }
  cursor[last] = value;
  return object;
}

function clampNumber(value, fallback, path) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  const [min, max] = LIMITS[path] ?? [0, Number.MAX_SAFE_INTEGER];
  return Math.min(max, Math.max(min, Math.round(number)));
}

function cleanText(value) {
  if (typeof value !== 'string') return '';
  return value.replace(/\r/g, '').slice(0, MAX_TEXT);
}

function allowedIds(path) {
  const dict = ENUMS[path];
  return dict ? new Set(dict.map((option) => option.id)) : null;
}

/**
 * Przycina dowolne dane do ksztaltu DEFAULTS.
 * Rekurencyjnie: obiekt -> obiekt, tablica -> przefiltrowana tablica id,
 * liczba -> liczba w zakresie, string -> string (lub id ze slownika), bool -> bool.
 */
export function sanitize(input, defaults = DEFAULTS, path = '') {
  const result = Array.isArray(defaults) ? [] : {};

  for (const [key, fallback] of Object.entries(defaults)) {
    const here = path ? `${path}.${key}` : key;
    const value = input == null ? undefined : input[key];

    if (Array.isArray(fallback)) {
      const allowed = allowedIds(here);
      const list = Array.isArray(value) ? value : fallback;
      const unique = [...new Set(list.filter((item) => typeof item === 'string'))];
      result[key] = allowed ? unique.filter((item) => allowed.has(item)) : unique;
      continue;
    }

    if (fallback !== null && typeof fallback === 'object') {
      result[key] = sanitize(value, fallback, here);
      continue;
    }

    if (typeof fallback === 'number') {
      result[key] = clampNumber(value, fallback, here);
      continue;
    }

    if (typeof fallback === 'boolean') {
      result[key] = typeof value === 'boolean' ? value : fallback;
      continue;
    }

    // string
    const allowed = allowedIds(here);
    if (allowed) {
      result[key] = typeof value === 'string' && allowed.has(value) ? value : fallback;
    } else {
      result[key] = value === undefined || value === null ? fallback : cleanText(value);
    }
  }

  // Wersje stemplujemy tylko na korzeniu. (Bez tego `if` kazdy zagniezdzony
  // obiekt — people, shopping, output — dostawal wlasne `v: 1`, co psulo
  // porownania stanu i puchlo w linku. Zlapane przez test isPristine.)
  if (path === '') result.v = STATE_VERSION;
  return result;
}

/**
 * Zamraza stan w glab. Kosztuje tyle co nic (stan ma kilkadziesiat pol),
 * a zamienia najbrzydsza klase bledow w tej architekturze — "ktos gdzies
 * po cichu zmutowal stan i nikt sie nie odswiezyl" — w natychmiastowy wyjatek.
 */
function deepFreeze(value) {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const inner of Object.values(value)) deepFreeze(inner);
  }
  return value;
}

/**
 * Maly store: get / set / patch / subscribe.
 * Bez frameworka, bo cala aplikacja to jeden ekran i kilkanascie pol —
 * reaktywnosc "przerysuj podglad + zaznaczone chipy" wystarcza.
 *
 * Stan jest niezmienny: kazda zmiana tworzy nowy, zamrozony obiekt.
 */
export function createStore(initial = defaultState()) {
  let state = deepFreeze(sanitize(initial));
  const listeners = new Set();

  const emit = (meta) => {
    for (const listener of listeners) listener(state, meta);
  };

  return {
    get() {
      return state;
    },
    getPath(path) {
      return getPath(state, path);
    },
    /** Ustawia pojedyncze pole (sciezka). */
    set(path, value, meta = {}) {
      const next = clone(state);
      setPath(next, path, value);
      state = deepFreeze(sanitize(next));
      emit({ path, ...meta });
      return state;
    },
    /** Dokleja fragment stanu (uzywane przez presety i import). */
    patch(partial, meta = {}) {
      state = deepFreeze(sanitize(deepMerge(clone(state), partial)));
      emit({ patch: true, ...meta });
      return state;
    },
    /** Podmienia caly stan (import / link). */
    replace(next, meta = {}) {
      state = deepFreeze(sanitize(next));
      emit({ replace: true, ...meta });
      return state;
    },
    reset(meta = {}) {
      state = deepFreeze(defaultState());
      emit({ reset: true, ...meta });
      return state;
    },
    /** Dodaje/usuwa id w tablicy (chipy wielokrotnego wyboru). */
    toggle(path, id, meta = {}) {
      const current = getPath(state, path);
      const list = Array.isArray(current) ? current : [];
      const next = list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
      return this.set(path, next, meta);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/** Plytko-glebokie scalanie: obiekty scalamy, tablice i skalary nadpisujemy. */
export function deepMerge(base, patch) {
  for (const [key, value] of Object.entries(patch ?? {})) {
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      base[key] = deepMerge(
        base[key] !== null && typeof base[key] === 'object' && !Array.isArray(base[key])
          ? base[key]
          : {},
        value
      );
    } else {
      base[key] = value;
    }
  }
  return base;
}

/** Czy stan rozni sie od domyslnego (do pokazania "masz niezapisane zmiany"). */
export function isPristine(state) {
  return JSON.stringify(sanitize(state)) === JSON.stringify(defaultState());
}
