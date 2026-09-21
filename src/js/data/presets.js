/**
 * presets.js — tryby na jeden klik.
 *
 * Preset to `patch` na stanie, nie pelny stan: dokleja sie do tego, co juz
 * wyklikales (spizarnia, alergie i osoby zostaja). Tablice sa nadpisywane
 * w calosci — bo "tydzien na zapas" ma naprawde ustawic posilki, a nie
 * dorzucic kolejny do listy.
 */

export const PRESETS = [
  {
    id: 'now',
    pl: 'Głodny teraz',
    hint: 'Jeden posiłek, 15 minut, z tego co jest w domu.',
    icon: 'chili',
    patch: {
      scope: 'now',
      meals: ['dinner'],
      time: '15',
      effort: 'lazy',
      pantryMode: 'only',
      shopping: { allowed: false, maxItems: '', budget: '' },
      output: { parts: ['recipes', 'amounts', 'timings', 'swaps'], length: 'short', askFirst: false },
    },
  },
  {
    id: 'week',
    pl: 'Tydzień na zapas',
    hint: 'Siedem dni, jedna lista zakupów, gotowanie z wyprzedzeniem.',
    icon: 'pot',
    patch: {
      scope: 'week',
      days: 7,
      meals: ['dinner', 'supper'],
      time: '45',
      effort: 'normal',
      pantryMode: 'prefer',
      shopping: { allowed: true },
      output: {
        parts: ['plan', 'recipes', 'amounts', 'shopping', 'aisles', 'timings', 'prep', 'leftovers'],
        length: 'normal',
      },
    },
  },
  {
    id: 'leftovers',
    pl: 'Resztki z lodówki',
    hint: 'Zero zakupów. Zużyj to, co i tak się zmarnuje.',
    icon: 'frozen',
    patch: {
      scope: 'now',
      pantryMode: 'only',
      effort: 'lazy',
      moods: ['cheap'],
      shopping: { allowed: false, maxItems: '', budget: '' },
      output: { parts: ['recipes', 'amounts', 'swaps', 'leftovers'], length: 'short' },
    },
  },
  {
    id: 'fit',
    pl: 'Fit / redukcja',
    hint: 'Makro, białko i kalorie policzone przy każdym daniu.',
    icon: 'broccoli',
    patch: {
      diets: ['highprotein'],
      moods: ['protein', 'fresh'],
      nutrition: { enabled: true, goal: 'cut' },
      output: {
        parts: ['plan', 'recipes', 'amounts', 'shopping', 'macros', 'prep'],
        length: 'normal',
      },
    },
  },
  {
    id: 'guests',
    pl: 'Goście',
    hint: 'Coś, co robi wrażenie, plus harmonogram na dzień przed.',
    icon: 'salmon',
    patch: {
      scope: 'now',
      meals: ['dinner', 'dessert'],
      time: 'any',
      effort: 'ambitious',
      moods: ['fancy'],
      pantryMode: 'free',
      shopping: { allowed: true },
      output: {
        parts: ['plan', 'recipes', 'amounts', 'shopping', 'aisles', 'timings', 'prep'],
        length: 'detailed',
      },
    },
  },
  {
    id: 'lunchbox',
    pl: 'Lunch do pracy',
    hint: 'Pięć dni, wszystko przeżywa noc w lodówce.',
    icon: 'tortilla',
    patch: {
      scope: 'days',
      days: 5,
      meals: ['lunch'],
      time: '30',
      moods: ['protein'],
      output: {
        parts: ['plan', 'recipes', 'amounts', 'shopping', 'prep', 'leftovers'],
        length: 'normal',
      },
    },
  },
];

export const PRESETS_BY_ID = Object.fromEntries(PRESETS.map((preset) => [preset.id, preset]));
