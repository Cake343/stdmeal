/**
 * schema.js — deklaratywny opis calego formularza.
 *
 * Dlaczego tak: formularz ma ~30 pol. Recznie pisany HTML dla kazdego z nich to
 * 600 linii duplikatow i trzy miejsca do aktualizacji przy kazdej zmianie
 * (markup, odczyt, zapis). Tutaj pole opisane jest raz — typem, sciezka w stanie
 * i slownikiem opcji — a renderer (ui/controls.js) wie, jak je narysowac i
 * podpiac do store'a.
 *
 * `when` to warunek widocznosci liczony przy kazdej zmianie stanu (np. "ile dni"
 * pokazuje sie tylko przy zakresie "kilka dni").
 */

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

export const SECTIONS = [
  {
    id: 'plan',
    num: '01',
    title: 'plan',
    hint: 'Co właściwie ma ułożyć.',
    fields: [
      { type: 'segmented', path: 'scope', label: 'Zakres', options: SCOPES },
      {
        type: 'stepper',
        path: 'days',
        label: 'Ile dni',
        min: 2,
        max: 14,
        when: (state) => state.scope === 'days',
      },
      { type: 'people', label: 'Dla ilu osób' },
      {
        type: 'chips',
        path: 'meals',
        label: 'Które posiłki',
        options: MEALS,
        hint: 'Można zaznaczyć kilka.',
      },
    ],
  },
  {
    id: 'kitchen',
    num: '02',
    title: 'czas i kuchnia',
    hint: 'Realia: ile mam czasu i czym to ugotuję.',
    fields: [
      { type: 'segmented', path: 'time', label: 'Czas na jeden posiłek', options: TIMES },
      { type: 'segmented', path: 'effort', label: 'Ile mi się chce', options: EFFORTS },
      {
        type: 'chips',
        path: 'equipment',
        label: 'Sprzęt, który mam',
        options: EQUIPMENT,
        hint: 'Model nie zaproponuje piekarnika, jeśli go nie odznaczysz.',
      },
    ],
  },
  {
    id: 'mood',
    num: '03',
    title: 'ochota',
    hint: 'Najważniejsza sekcja i jedyna, w której można zmyślać.',
    fields: [
      { type: 'chips', path: 'moods', label: 'Na co masz ochotę', options: MOODS },
      { type: 'chips', path: 'cuisines', label: 'Kuchnia', options: CUISINES },
    ],
  },
  {
    id: 'diet',
    num: '04',
    title: 'dieta i zakazy',
    hint: 'To, czego model nie ma prawa zaproponować.',
    fields: [
      { type: 'chips', path: 'diets', label: 'Dieta', options: DIETS },
      { type: 'chips', path: 'allergens', label: 'Alergie', options: ALLERGENS },
      {
        type: 'text',
        path: 'allergensExtra',
        label: 'Inne zakazy',
        placeholder: 'kolendra, oliwki, ostre papryczki…',
        hint: 'Po przecinku.',
      },
      { type: 'text', path: 'likes', label: 'Lubimy', placeholder: 'makarony, czosnek, feta…' },
      {
        type: 'text',
        path: 'dislikes',
        label: 'Nie lubimy',
        placeholder: 'kasza gryczana, ryba w panierce…',
      },
    ],
  },
  {
    id: 'pantry',
    num: '05',
    title: 'lodówka i spiżarnia',
    hint: 'Klikaj, co masz. Reszta to jest to, po co w ogóle powstała ta apka.',
    fields: [
      { type: 'pantry', path: 'pantry', label: 'Mam w domu' },
      {
        type: 'textarea',
        path: 'pantryExtra',
        label: 'Coś jeszcze (wpisz po swojemu)',
        placeholder: 'pół słoika pesto, resztka ryżu z wczoraj, mrożony groszek…',
        rows: 3,
      },
      {
        type: 'segmented',
        path: 'pantryMode',
        label: 'Jak to traktować',
        options: PANTRY_MODES,
      },
      {
        type: 'note',
        text:
          'Wybrałeś „tylko z tego, co mam", ale lodówka jest pusta — ' +
          'model nie będzie miał z czego gotować. Zaznacz produkty albo zmień tryb.',
        when: (state) =>
          state.pantryMode === 'only' &&
          state.pantry.length === 0 &&
          state.pantryExtra.trim() === '',
      },
    ],
  },
  {
    id: 'shopping',
    num: '06',
    title: 'zakupy',
    hint: 'Czy w ogóle wychodzę z domu.',
    fields: [
      { type: 'switch', path: 'shopping.allowed', label: 'Mogę dokupić składniki' },
      {
        type: 'text',
        path: 'shopping.maxItems',
        label: 'Maksymalnie ile rzeczy dokupić',
        placeholder: 'np. 8',
        inputmode: 'numeric',
        when: (state) => state.shopping.allowed,
      },
      {
        type: 'text',
        path: 'shopping.budget',
        label: 'Budżet',
        placeholder: 'np. 150 zł na tydzień',
        when: (state) => state.shopping.allowed,
      },
    ],
  },
  {
    id: 'nutrition',
    num: '07',
    title: 'makro',
    hint: 'Opcjonalne. Włącz, jeśli liczysz kalorie.',
    fields: [
      { type: 'switch', path: 'nutrition.enabled', label: 'Licz kalorie i makro' },
      {
        type: 'text',
        path: 'nutrition.kcal',
        label: 'Kalorie dziennie',
        placeholder: 'np. 2200',
        inputmode: 'numeric',
        when: (state) => state.nutrition.enabled,
      },
      {
        type: 'text',
        path: 'nutrition.protein',
        label: 'Białko dziennie (g)',
        placeholder: 'np. 140',
        inputmode: 'numeric',
        when: (state) => state.nutrition.enabled,
      },
      {
        type: 'segmented',
        path: 'nutrition.goal',
        label: 'Cel',
        options: GOALS,
        when: (state) => state.nutrition.enabled,
      },
    ],
  },
  {
    id: 'output',
    num: '08',
    title: 'format odpowiedzi',
    hint: 'Czego oczekujesz na wyjściu — im konkretniej, tym mniej lania wody.',
    fields: [
      { type: 'chips', path: 'output.parts', label: 'Odpowiedź ma zawierać', options: OUTPUT_PARTS },
      { type: 'segmented', path: 'output.length', label: 'Długość', options: LENGTHS },
      { type: 'segmented', path: 'lang', label: 'Język promptu', options: LANGS },
      {
        type: 'switch',
        path: 'output.askFirst',
        label: 'Niech najpierw dopyta (max 3 pytania)',
      },
      { type: 'switch', path: 'output.noFluff', label: 'Bez wstępów i podsumowań' },
    ],
  },
  {
    id: 'notes',
    num: '09',
    title: 'uwagi',
    hint: 'Wszystko, czego nie przewidziałem w polach wyżej.',
    fields: [
      {
        type: 'textarea',
        path: 'notes',
        label: 'Dopisz cokolwiek',
        placeholder: 'w czwartek wracam o 21, w piątek są goście, nie mam zmywarki…',
        rows: 3,
      },
    ],
  },
];

/** Plaska lista wszystkich pol — uzywana w testach spojnosci ze stanem. */
export const ALL_FIELDS = SECTIONS.flatMap((section) =>
  section.fields.map((field) => ({ ...field, section: section.id }))
);
