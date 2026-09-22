/**
 * strings.js — teksty wchodzace do wygenerowanego promptu (PL / EN).
 *
 * Uwaga: to NIE jest i18n interfejsu. UI zostaje po polsku; tu chodzi wylacznie
 * o jezyk, w ktorym gada prompt wyslany do modelu. Rozdzielenie jest celowe —
 * chce klikac po polsku, ale czasem dostac odpowiedz po angielsku.
 */

/**
 * Polska odmiana przez liczebniki: 1 osoba / 2 osoby / 5 osob.
 * (Tak, to nadmiarowe w aplikacji do promptow. Ale "2 osób" w gotowym
 * prompcie kluje w oczy za kazdym razem, a model tez to czyta.)
 */
export function plural(count, one, few, many) {
  const n = Math.abs(Math.round(count));
  if (n === 1) return one;
  const lastTwo = n % 100;
  const last = n % 10;
  if (last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) return few;
  return many;
}

const pl = {
  headings: {
    role: 'Rola',
    task: 'Zadanie',
    who: 'Kto je',
    kitchen: 'Czas i kuchnia',
    mood: 'Na co mam ochotę',
    diet: 'Dieta i ograniczenia',
    pantry: 'Moja lodówka i spiżarnia',
    shopping: 'Zakupy',
    nutrition: 'Cele żywieniowe',
    notes: 'Dodatkowe uwagi',
    format: 'Format odpowiedzi',
    rules: 'Zasady',
  },
  role:
    'Jesteś doświadczonym kucharzem domowym i praktycznym planerem posiłków. ' +
    'Gotujesz z tego, co jest pod ręką, liczysz się z czasem i budżetem, ' +
    'nie wymyślasz składników i nie lejesz wody.',
  task: {
    now: () => 'Zaproponuj jedzenie na teraz — konkretnie, do zrobienia od razu.',
    day: () => 'Ułóż plan jedzenia na cały dzień.',
    days: (days) => `Ułóż plan jedzenia na ${days} ${plural(days, 'dzień', 'dni', 'dni')}.`,
    week: () => 'Ułóż plan jedzenia na cały tydzień (7 dni).',
  },
  forPeople: (adults, kids) => {
    const total = adults + kids;
    // „dla" laczy sie z dopelniaczem: dla 1 osoby, dla 2 osób, dla 5 osób.
    const head = `Gotuję dla ${total} ${plural(total, 'osoby', 'osób', 'osób')}`;
    if (kids > 0 && adults > 0) {
      return `${head} (${adults} ${plural(adults, 'dorosły', 'dorosłych', 'dorosłych')}, ${kids} ${plural(kids, 'dziecko', 'dzieci', 'dzieci')}).`;
    }
    if (kids > 0) return `${head} — same dzieci (${kids}).`;
    return `${head}.`;
  },
  meals: (list) => `Posiłki do zaplanowania: ${list}.`,
  labels: {
    likes: 'Lubimy',
    dislikes: 'Nie lubimy i nie chcę tego widzieć',
    time: 'Czas na jeden posiłek',
    effort: 'Ile mi się chce',
    equipment: 'Sprzęt, jaki mam',
    vibe: 'Klimat',
    cuisine: 'Kuchnia',
    diet: 'Dieta',
    allergy: 'Alergie i rzeczy zakazane',
    other: 'Poza tym mam',
    kcal: 'Kalorie',
    protein: 'Białko',
    goal: 'Cel',
    budget: 'Budżet',
  },
  kidsNote: 'Dzieci jedzą z nami — nie rób nic bardzo ostrego ani dziwnego w formie.',
  pantryIntro: 'Mam w domu:',
  pantryModes: {
    only:
      'Zasada: użyj **wyłącznie** tych składników plus sól, pieprz, woda i tłuszcz do smażenia. ' +
      'Nic nie dokupuję. Jeśli z tego nie da się zrobić sensownego dania, powiedz to wprost zamiast zmyślać.',
    prefer:
      'Zasada: zbuduj dania głównie na tym, co już mam, a brakujące rzeczy wpisz na listę zakupów.',
    free: 'Zasada: to tylko podpowiedź, czym dysponuję — nie musisz się tego trzymać.',
  },
  shopping: {
    none: 'Nie idę na zakupy. Lista zakupów ma być pusta.',
    max: (n) => `Mogę dokupić maksymalnie ${n} ${plural(n, 'składnik', 'składniki', 'składników')}.`,
    open: 'Zakupy nie są problemem — mogę dokupić, czego trzeba.',
  },
  nutrition: {
    kcal: (value) => `Ok. ${value} kcal dziennie.`,
    protein: (value) => `Minimum ${value} g białka dziennie.`,
    goal: (value) => `Cel: ${value}.`,
    perMeal: 'Przy każdym posiłku podaj szacunkowe kcal i białko.',
  },
  format: {
    intro: 'Odpowiedz w Markdownie. Struktura odpowiedzi:',
    lengths: {
      short: 'Pisz zwięźle — konkret zamiast opisów.',
      normal: '',
      detailed: 'Możesz rozpisać się szerzej, ale trzymaj się struktury.',
    },
  },
  rules: {
    noInvent:
      'Nie wymyślaj składników — wszystko, czego użyjesz, musi być albo u mnie w domu, albo na liście zakupów.',
    amounts: 'Podawaj konkretne ilości (gramy, ml, sztuki), nie „trochę" i „do smaku".',
    time: 'Trzymaj się limitu czasu przy każdym daniu — jeśli danie się nie mieści, zaproponuj inne.',
    variety: 'Nie powtarzaj tego samego dania dwa razy w planie (poza celowym wykorzystaniem resztek).',
    conflict:
      'Jeśli coś się nie spina (czas, budżet, dieta, zawartość lodówki), powiedz to wprost i zaproponuj kompromis.',
    askFirst:
      'Zanim ułożysz plan, zadaj mi maksymalnie 3 pytania o rzeczy, których naprawdę nie da się zgadnąć. Potem od razu odpowiedz.',
    noFluff: 'Bez wstępów, podsumowań i komplementów — zacznij od razu od treści.',
  },
  focus: {
    heading: 'Jak mam to dostać',
    lines: [
      'Zaproponuj **dokładnie jedno** danie. Żadnych alternatyw, żadnego „albo możesz…" — wybór mam już za sobą.',
      'Zacznij od listy rzeczy, które mam wyjąć i przygotować, ZANIM cokolwiek włączę.',
      'Jeden numerowany krok = jedna czynność. Nigdy „w międzyczasie zrób X" — nie rób ze mnie wielowątkowca.',
      'Przy każdym kroku, w którym coś się samo gotuje, napisz wprost: ile minut mam wolne i czy mogę odejść.',
      'Ogranicz liczbę naczyń i sprzętu do minimum — zmywanie jest częścią gotowania.',
      'Napisz, po czym poznać, że krok jest skończony (kolor, zapach, czas), a nie tylko „aż będzie gotowe".',
    ],
  },
  meta: (date) => `Wygenerowane w stdmeal · ${date}`,
};

const en = {
  headings: {
    role: 'Role',
    task: 'Task',
    who: 'Who is eating',
    kitchen: 'Time and kitchen',
    mood: 'What I am in the mood for',
    diet: 'Diet and restrictions',
    pantry: 'My fridge and pantry',
    shopping: 'Shopping',
    nutrition: 'Nutrition targets',
    notes: 'Extra notes',
    format: 'Response format',
    rules: 'Rules',
  },
  role:
    'You are an experienced home cook and a practical meal planner. ' +
    'You cook with what is already in the kitchen, respect time and budget, ' +
    'never invent ingredients and never pad your answers.',
  task: {
    now: () => 'Suggest something to eat right now — concrete and immediately cookable.',
    day: () => 'Plan my food for a full day.',
    days: (days) => `Plan my food for ${days} day${days === 1 ? '' : 's'}.`,
    week: () => 'Plan my food for a whole week (7 days).',
  },
  forPeople: (adults, kids) => {
    const total = adults + kids;
    const head = `I am cooking for ${total} ${total === 1 ? 'person' : 'people'}`;
    if (kids > 0 && adults > 0) {
      return `${head} (${adults} adult${adults === 1 ? '' : 's'}, ${kids} child${kids === 1 ? '' : 'ren'}).`;
    }
    if (kids > 0) return `${head} — children only (${kids}).`;
    return `${head}.`;
  },
  meals: (list) => `Meals to plan: ${list}.`,
  labels: {
    likes: 'We like',
    dislikes: 'We dislike / do not want to see',
    time: 'Time per meal',
    effort: 'Effort level',
    equipment: 'Equipment I have',
    vibe: 'Vibe',
    cuisine: 'Cuisine',
    diet: 'Diet',
    allergy: 'Allergies and hard no-gos',
    other: 'I also have',
    kcal: 'Calories',
    protein: 'Protein',
    goal: 'Goal',
    budget: 'Budget',
  },
  kidsNote: 'Kids eat with us — nothing very spicy or weird in texture.',
  pantryIntro: 'What I have at home:',
  pantryModes: {
    only:
      'Rule: use **only** these ingredients plus salt, pepper, water and cooking fat. ' +
      'I am not buying anything. If a decent dish is impossible, say so instead of inventing ingredients.',
    prefer:
      'Rule: build the dishes mostly around what I already have, and put anything missing on the shopping list.',
    free: 'Rule: this is just a hint about what I have — you do not have to stick to it.',
  },
  shopping: {
    none: 'I am not going shopping. The shopping list must stay empty.',
    max: (n) => `I can buy at most ${n} extra ingredient${n === 1 ? '' : 's'}.`,
    open: 'Shopping is fine — I can buy whatever is needed.',
  },
  nutrition: {
    kcal: (value) => `About ${value} kcal per day.`,
    protein: (value) => `At least ${value} g of protein per day.`,
    goal: (value) => `Goal: ${value}.`,
    perMeal: 'Give estimated kcal and protein for every meal.',
  },
  format: {
    intro: 'Answer in Markdown. Structure:',
    lengths: {
      short: 'Keep it tight — facts over prose.',
      normal: '',
      detailed: 'Feel free to go deeper, but keep the structure.',
    },
  },
  rules: {
    noInvent:
      'Do not invent ingredients — everything you use must be either in my kitchen or on the shopping list.',
    amounts: 'Give concrete amounts (grams, ml, pieces), never "some" or "to taste".',
    time: 'Respect the time limit for every dish — if a dish does not fit, propose another one.',
    variety: 'Do not repeat the same dish twice in the plan (unless it is a deliberate leftover reuse).',
    conflict:
      'If something does not add up (time, budget, diet, pantry), say it directly and propose a compromise.',
    askFirst:
      'Before writing the plan, ask me at most 3 questions about things you genuinely cannot guess. Then answer right away.',
    noFluff: 'No intros, no summaries, no compliments — start with the content.',
  },
  focus: {
    heading: 'How I need this written',
    lines: [
      'Propose **exactly one** dish. No alternatives, no "or you could…" — I have already spent my decision budget.',
      'Start with everything I should take out and prepare BEFORE turning anything on.',
      'One numbered step = one action. Never "meanwhile, do X" — do not make me multitask.',
      'For every step where something cooks on its own, say plainly how many minutes I have free and whether I can walk away.',
      'Keep the number of pots, pans and dishes to a minimum — washing up is part of cooking.',
      'Say how I can tell a step is done (colour, smell, time), not just "until ready".',
    ],
  },
  meta: (date) => `Generated with stdmeal · ${date}`,
};

export const STRINGS = { pl, en };

export function strings(lang) {
  return STRINGS[lang] ?? STRINGS.pl;
}
