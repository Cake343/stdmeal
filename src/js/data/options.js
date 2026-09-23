/**
 * options.js — wszystkie slowniki wyboru (poza spizarnia, ktora siedzi w pantry.js).
 *
 * Kazda opcja: { id, pl, en } + opcjonalnie `icon` (id z FOOD w icons.js)
 * i `emoji`-free — ikonki rysujemy sami, zadnych emoji w UI.
 *
 * id-ki sa czescia formatu zapisu (localStorage + link do udostepniania),
 * wiec traktujemy je jak API: dopisywac mozna, zmieniac nie.
 */

/** Zakres planu — ile w ogole planujemy. */
export const SCOPES = [
  { id: 'now', pl: 'jeden posiłek teraz', en: 'one meal right now' },
  { id: 'day', pl: 'cały dzień', en: 'a full day' },
  { id: 'days', pl: 'kilka dni', en: 'a few days' },
  { id: 'week', pl: 'cały tydzień', en: 'a whole week' },
  { id: 'prep', pl: 'mealprep — raz na kilka dni', en: 'meal prep — cook once, eat for days' },
];

/** Posilki do zaplanowania. */
export const MEALS = [
  { id: 'breakfast', pl: 'śniadanie', en: 'breakfast', icon: 'egg' },
  { id: 'lunch', pl: 'drugie śniadanie / lunch do pracy', en: 'packed lunch', icon: 'tortilla' },
  { id: 'dinner', pl: 'obiad', en: 'dinner', icon: 'pot' },
  { id: 'supper', pl: 'kolacja', en: 'supper', icon: 'bread' },
  { id: 'snack', pl: 'przekąska', en: 'snack', icon: 'nuts' },
  { id: 'dessert', pl: 'deser', en: 'dessert', icon: 'honey' },
];

/** Ile mam czasu na jeden posilek. */
export const TIMES = [
  { id: '15', pl: 'do 15 min', en: 'under 15 min' },
  { id: '30', pl: 'do 30 min', en: 'under 30 min' },
  { id: '45', pl: 'do 45 min', en: 'under 45 min' },
  { id: '60', pl: 'do godziny', en: 'up to an hour' },
  { id: 'any', pl: 'mam czas, może być dłużej', en: 'no time limit' },
];

/** Ile mi sie chce. */
export const EFFORTS = [
  { id: 'lazy', pl: 'zero wysiłku', en: 'minimum effort' },
  { id: 'normal', pl: 'normalnie', en: 'normal' },
  { id: 'ambitious', pl: 'mam ochotę pokombinować', en: 'feeling ambitious' },
];

/** Sprzet w kuchni. */
export const EQUIPMENT = [
  { id: 'pan', pl: 'patelnia', en: 'frying pan', icon: 'pan' },
  { id: 'pot', pl: 'garnek', en: 'pot', icon: 'pot' },
  { id: 'oven', pl: 'piekarnik', en: 'oven', icon: 'oven' },
  { id: 'airfryer', pl: 'air fryer', en: 'air fryer', icon: 'airfryer' },
  { id: 'blender', pl: 'blender', en: 'blender', icon: 'blender' },
  { id: 'microwave', pl: 'mikrofalówka', en: 'microwave', icon: 'microwave' },
  { id: 'grill', pl: 'grill', en: 'grill', icon: 'grill' },
  { id: 'slowcooker', pl: 'wolnowar / multicooker', en: 'slow cooker', icon: 'slowcooker' },
  { id: 'wok', pl: 'wok', en: 'wok', icon: 'wok' },
  { id: 'ricecooker', pl: 'ryżowar', en: 'rice cooker', icon: 'rice_cooker' },
];

/** Na co mam ochote — klimat dania. */
export const MOODS = [
  { id: 'comfort', pl: 'comfort food', en: 'comfort food', icon: 'bread' },
  { id: 'light', pl: 'coś lekkiego', en: 'something light', icon: 'lettuce' },
  { id: 'spicy', pl: 'ostre', en: 'spicy', icon: 'chili' },
  { id: 'creamy', pl: 'kremowe', en: 'creamy', icon: 'cream' },
  { id: 'crispy', pl: 'chrupiące', en: 'crispy', icon: 'tortilla' },
  { id: 'fresh', pl: 'świeże, dużo warzyw', en: 'fresh & veggie-heavy', icon: 'broccoli' },
  { id: 'protein', pl: 'dużo białka', en: 'high protein', icon: 'chicken' },
  { id: 'onepot', pl: 'jeden garnek / blacha', en: 'one pot / one tray', icon: 'pot' },
  { id: 'soup', pl: 'zupa', en: 'soup', icon: 'stock' },
  { id: 'sweet', pl: 'coś słodkiego', en: 'something sweet', icon: 'honey' },
  { id: 'cheap', pl: 'tanio i konkretnie', en: 'cheap & filling', icon: 'potato' },
  { id: 'fancy', pl: 'coś ładnego, jak z knajpy', en: 'restaurant-style', icon: 'salmon' },
];

/** Kuchnie swiata. */
export const CUISINES = [
  { id: 'polish', pl: 'polska', en: 'Polish', icon: 'potato' },
  { id: 'italian', pl: 'włoska', en: 'Italian', icon: 'pasta' },
  { id: 'asian', pl: 'azjatycka', en: 'Asian', icon: 'rice' },
  { id: 'mexican', pl: 'meksykańska', en: 'Mexican', icon: 'tortilla' },
  { id: 'indian', pl: 'indyjska', en: 'Indian', icon: 'spices' },
  { id: 'mediterranean', pl: 'śródziemnomorska', en: 'Mediterranean', icon: 'oil' },
  { id: 'middleeast', pl: 'bliskowschodnia', en: 'Middle Eastern', icon: 'legumes' },
  { id: 'american', pl: 'amerykańska', en: 'American', icon: 'beef' },
  { id: 'french', pl: 'francuska', en: 'French', icon: 'cheese' },
  { id: 'fusion', pl: 'obojętne / zaskocz mnie', en: 'anything / surprise me', icon: 'herbs' },
];

/** Diety i sposob odzywiania. */
export const DIETS = [
  { id: 'vegetarian', pl: 'wegetariańska', en: 'vegetarian', icon: 'lettuce' },
  { id: 'vegan', pl: 'wegańska', en: 'vegan', icon: 'spinach' },
  { id: 'lowcarb', pl: 'low carb / keto', en: 'low carb / keto', icon: 'avocado' },
  { id: 'highprotein', pl: 'wysokobiałkowa', en: 'high protein', icon: 'chicken' },
  { id: 'glutenfree', pl: 'bezglutenowa', en: 'gluten free', icon: 'flour' },
  { id: 'lactosefree', pl: 'bez laktozy', en: 'lactose free', icon: 'milk' },
  { id: 'lowfodmap', pl: 'lekkostrawna', en: 'easy to digest', icon: 'rice' },
  { id: 'nopork', pl: 'bez wieprzowiny', en: 'no pork', icon: 'pork' },
];

/** Najczestsze alergeny — skrot zamiast wpisywania z reki. */
export const ALLERGENS = [
  { id: 'nuts', pl: 'orzechy', en: 'nuts', icon: 'nuts' },
  { id: 'peanuts', pl: 'orzeszki ziemne', en: 'peanuts', icon: 'peanut' },
  { id: 'gluten', pl: 'gluten', en: 'gluten', icon: 'bread' },
  { id: 'lactose', pl: 'laktoza', en: 'lactose', icon: 'milk' },
  { id: 'eggs', pl: 'jajka', en: 'eggs', icon: 'egg' },
  { id: 'fish', pl: 'ryby', en: 'fish', icon: 'fish' },
  { id: 'seafood', pl: 'owoce morza', en: 'seafood', icon: 'shrimp' },
  { id: 'soy', pl: 'soja', en: 'soy', icon: 'soy' },
];

/** Jak traktowac zawartosc lodowki. */
export const PANTRY_MODES = [
  { id: 'only', pl: 'tylko z tego, co mam', en: 'only what I have' },
  { id: 'prefer', pl: 'głównie z tego, resztę dokupię', en: 'mostly what I have' },
  { id: 'free', pl: 'to tylko podpowiedź', en: 'just a hint' },
];

/** Cel zywieniowy. */
export const GOALS = [
  { id: 'maintain', pl: 'utrzymanie', en: 'maintenance' },
  { id: 'cut', pl: 'redukcja', en: 'fat loss' },
  { id: 'bulk', pl: 'masa', en: 'muscle gain' },
];

/** Elementy odpowiedzi, ktore model ma wyprodukowac. */
export const OUTPUT_PARTS = [
  { id: 'plan', pl: 'plan w tabeli (dzień / posiłek / danie)', en: 'plan as a table (day / meal / dish)' },
  { id: 'recipes', pl: 'przepisy krok po kroku', en: 'step-by-step recipes' },
  { id: 'amounts', pl: 'gramatury i ilości', en: 'exact amounts in grams/ml' },
  { id: 'shopping', pl: 'lista zakupów', en: 'shopping list' },
  { id: 'aisles', pl: 'lista zakupów pogrupowana po działach sklepu', en: 'shopping list grouped by store aisle' },
  { id: 'timings', pl: 'czas przygotowania przy każdym daniu', en: 'prep time per dish' },
  { id: 'macros', pl: 'kalorie i makro', en: 'calories and macros' },
  { id: 'swaps', pl: 'zamienniki składników', en: 'ingredient substitutions' },
  { id: 'prep', pl: 'co da się przygotować wcześniej', en: 'what can be prepped ahead' },
  { id: 'leftovers', pl: 'pomysł na resztki', en: 'leftover ideas' },
];

/** Dlugosc odpowiedzi. */
export const LENGTHS = [
  { id: 'short', pl: 'zwięźle', en: 'concise' },
  { id: 'normal', pl: 'normalnie', en: 'normal' },
  { id: 'detailed', pl: 'szczegółowo', en: 'detailed' },
];

/** Jezyk generowanego promptu (UI zostaje po polsku). */
export const LANGS = [
  { id: 'pl', pl: 'polski', en: 'Polish' },
  { id: 'en', pl: 'angielski', en: 'English' },
];

/** Pomocnik: id -> etykieta w danym jezyku. */
export function label(list, id, lang = 'pl') {
  const found = list.find((option) => option.id === id);
  return found ? (found[lang] ?? found.pl) : id;
}

/** Pomocnik: lista id -> lista etykiet (z zachowaniem kolejnosci slownika). */
export function labels(list, ids, lang = 'pl') {
  const set = new Set(ids ?? []);
  return list.filter((option) => set.has(option.id)).map((option) => option[lang] ?? option.pl);
}
