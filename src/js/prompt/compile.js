/**
 * compile.js — stan (obiekt) => prompt (tekst w Markdownie).
 *
 * To jest cala "logika biznesowa" aplikacji i jedyny kawalek, ktory naprawde
 * musi byc niezawodny. Dlatego:
 *   - funkcja jest czysta: te same dane => ten sam tekst, zero DOM-u, zero Date.now()
 *     (data jest wstrzykiwana parametrem, zeby testy byly deterministyczne),
 *   - puste sekcje nie pojawiaja sie w ogole — lepiej krotszy prompt niz
 *     "Alergie: brak, Sprzet: brak, Budzet: brak",
 *   - kazda linia jest budowana z osobna i dopiero na koncu sklejana, dzieki
 *     czemu nie ma szans na potrojne puste linie ani wiszace naglowki.
 */

import { groupPantry } from '../data/pantry.js';
import {
  ALLERGENS,
  CUISINES,
  DIETS,
  EFFORTS,
  EQUIPMENT,
  GOALS,
  MEALS,
  MOODS,
  OUTPUT_PARTS,
  TIMES,
  label,
  labels,
} from '../data/options.js';
import { strings } from './strings.js';

/** Sklada liste na fraze: "a, b i c" / "a, b and c". */
function joinList(items, lang) {
  const list = items.filter(Boolean);
  if (list.length <= 1) return list.join('');
  const conjunction = lang === 'en' ? 'and' : 'i';
  return `${list.slice(0, -1).join(', ')} ${conjunction} ${list.at(-1)}`;
}

/** Tekst z pola wolnego: przycina, zbija biale znaki, ucina kropke na koncu. */
function tidy(text) {
  return String(text ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Sekcja = naglowek + linie. Pusta (bez linii) nie trafia do wyniku. */
function section(heading, lines, level = 2) {
  const body = lines.filter((line) => typeof line === 'string' && line.trim() !== '');
  if (body.length === 0) return null;
  return `${'#'.repeat(level)} ${heading}\n${body.join('\n')}`;
}

const bullet = (text) => (text ? `- ${text}` : '');
const field = (name, value) => (value ? `- ${name}: ${value}` : '');

/**
 * Buduje prompt.
 * @param {object} state - stan po sanitize()
 * @param {{date?: string}} [options] - data wstrzykiwana (testowalnosc)
 * @returns {string}
 */
export function compile(state, options = {}) {
  const lang = state.lang === 'en' ? 'en' : 'pl';
  const t = strings(lang);
  const out = [];

  // ——— rola ———
  out.push(`# ${t.headings.role}\n${t.role}`);

  // ——— zadanie ———
  const scope = state.scope;
  const taskLine =
    scope === 'now'
      ? t.task.now()
      : scope === 'day'
        ? t.task.day()
        : scope === 'week'
          ? t.task.week()
          : t.task.days(state.days);

  const mealNames = labels(MEALS, state.meals, lang);
  const taskLines = [taskLine, t.forPeople(state.people.adults, state.people.kids)];
  if (mealNames.length > 0) taskLines.push(t.meals(joinList(mealNames, lang)));
  out.push(`# ${t.headings.task}\n${taskLines.join('\n')}`);

  // ——— kto je ———
  const whoLines = [
    state.people.kids > 0 ? bullet(t.kidsNote) : '',
    field(t.labels.likes, tidy(state.likes)),
    field(t.labels.dislikes, tidy(state.dislikes)),
  ];
  out.push(section(t.headings.who, whoLines));

  // ——— czas i kuchnia ———
  const kitchenLines = [
    state.time && state.time !== 'any' ? field(t.labels.time, label(TIMES, state.time, lang)) : '',
    state.effort !== 'normal' ? field(t.labels.effort, label(EFFORTS, state.effort, lang)) : '',
    field(t.labels.equipment, joinList(labels(EQUIPMENT, state.equipment, lang), lang)),
  ];
  out.push(section(t.headings.kitchen, kitchenLines));

  // ——— ochota ———
  const moodLines = [
    field(t.labels.vibe, joinList(labels(MOODS, state.moods, lang), lang)),
    field(t.labels.cuisine, joinList(labels(CUISINES, state.cuisines, lang), lang)),
  ];
  out.push(section(t.headings.mood, moodLines));

  // ——— dieta ———
  const allergyList = [
    ...labels(ALLERGENS, state.allergens, lang),
    ...tidy(state.allergensExtra)
      .split(/[,;]/)
      .map(tidy)
      .filter(Boolean),
  ];
  const dietLines = [
    field(t.labels.diet, joinList(labels(DIETS, state.diets, lang), lang)),
    field(t.labels.allergy, joinList(allergyList, lang)),
  ];
  out.push(section(t.headings.diet, dietLines));

  // ——— spizarnia ———
  const groups = groupPantry(state.pantry, lang);
  const extra = tidy(state.pantryExtra);
  if (groups.length > 0 || extra) {
    const pantryLines = [t.pantryIntro];
    for (const group of groups) {
      pantryLines.push(`- ${group.label}: ${group.items.join(', ')}`);
    }
    if (extra) pantryLines.push(`- ${t.labels.other}: ${extra}`);
    pantryLines.push('');
    pantryLines.push(t.pantryModes[state.pantryMode] ?? t.pantryModes.prefer);
    out.push(`## ${t.headings.pantry}\n${pantryLines.join('\n')}`);
  }

  // ——— zakupy ———
  const shoppingLines = [];
  if (!state.shopping.allowed) {
    shoppingLines.push(bullet(t.shopping.none));
  } else {
    const max = Number(state.shopping.maxItems);
    shoppingLines.push(
      Number.isFinite(max) && max > 0 ? bullet(t.shopping.max(max)) : bullet(t.shopping.open)
    );
  }
  const budget = tidy(state.shopping.budget);
  if (budget) shoppingLines.push(field(t.labels.budget, budget));
  out.push(section(t.headings.shopping, shoppingLines));

  // ——— cele zywieniowe ———
  if (state.nutrition.enabled) {
    const kcal = tidy(state.nutrition.kcal);
    const protein = tidy(state.nutrition.protein);
    const nutritionLines = [
      kcal ? bullet(t.nutrition.kcal(kcal)) : '',
      protein ? bullet(t.nutrition.protein(protein)) : '',
      bullet(t.nutrition.goal(label(GOALS, state.nutrition.goal, lang))),
      bullet(t.nutrition.perMeal),
    ];
    out.push(section(t.headings.nutrition, nutritionLines));
  }

  // ——— uwagi ———
  const notes = tidy(state.notes);
  if (notes) out.push(`## ${t.headings.notes}\n${notes}`);

  // ——— format odpowiedzi ———
  const parts = OUTPUT_PARTS.filter((part) => state.output.parts.includes(part.id));
  const formatLines = [t.format.intro];
  parts.forEach((part, index) => {
    formatLines.push(`${index + 1}. ${part[lang] ?? part.pl}`);
  });
  const lengthNote = t.format.lengths[state.output.length];
  if (lengthNote) formatLines.push(`\n${lengthNote}`);
  if (parts.length > 0) out.push(`# ${t.headings.format}\n${formatLines.join('\n')}`);

  // ——— tryb skupienia (ADHD) ———
  // Osobna sekcja, a nie kolejne punkty w „Zasadach", bo to nie sa wymagania
  // wobec DANIA, tylko wobec sposobu, w jaki ma byc napisany przepis.
  if (state.output.focus) {
    out.push(`# ${t.focus.heading}\n${t.focus.lines.map(bullet).join('\n')}`);
  }

  // ——— zasady ———
  const multiDay = scope === 'days' || scope === 'week';
  const ruleLines = [
    bullet(t.rules.noInvent),
    state.output.parts.includes('amounts') ? bullet(t.rules.amounts) : '',
    state.time && state.time !== 'any' ? bullet(t.rules.time) : '',
    multiDay ? bullet(t.rules.variety) : '',
    bullet(t.rules.conflict),
    state.output.askFirst ? bullet(t.rules.askFirst) : '',
    state.output.noFluff ? bullet(t.rules.noFluff) : '',
  ];
  out.push(section(t.headings.rules, ruleLines, 1));

  const text = out.filter(Boolean).join('\n\n');
  const date = options.date;
  return date ? `${text}\n\n<!-- ${t.meta(date)} -->` : text;
}

/**
 * Zgrubne oszacowanie liczby tokenow.
 * Polski tokenizuje sie gorzej niz angielski (ogonki, fleksja), wiec dzielnik
 * jest mniejszy. To ma byc wskazowka "czy to duzy prompt", nie ksiegowosc.
 */
export function estimateTokens(text, lang = 'pl') {
  const divisor = lang === 'en' ? 4 : 3.1;
  return Math.max(1, Math.round(text.length / divisor));
}

/** Statystyki pokazywane pod podgladem. */
export function stats(text, lang = 'pl') {
  return {
    chars: text.length,
    words: text.split(/\s+/).filter(Boolean).length,
    lines: text.split('\n').length,
    tokens: estimateTokens(text, lang),
  };
}
