/**
 * pantry.js — katalog "co mam w domu".
 *
 * Kazdy produkt ma:
 *   id    — stabilny, uzywany w stanie i w linku do udostepniania (NIE zmieniac!)
 *   pl/en — nazwa w prompcie
 *   icon  — id ikony z icons.js (FOOD)
 *   tags  — dodatkowe slowa do wyszukiwarki (synonimy, liczba mnoga, literowki)
 *
 * Kolejnosc kategorii = kolejnosc w UI i w wygenerowanym prompcie.
 */

export const CATEGORIES = [
  { id: 'veg', pl: 'Warzywa', en: 'Vegetables' },
  { id: 'fruit', pl: 'Owoce', en: 'Fruit' },
  { id: 'dairy', pl: 'Nabiał i jaja', en: 'Dairy & eggs' },
  { id: 'protein', pl: 'Mięso i ryby', en: 'Meat & fish' },
  { id: 'staples', pl: 'Sypkie i pieczywo', en: 'Grains & bread' },
  { id: 'extras', pl: 'Dodatki i przyprawy', en: 'Condiments & spices' },
];

export const PANTRY = [
  // ——— warzywa ———
  { id: 'tomato', cat: 'veg', pl: 'pomidory', en: 'tomatoes', icon: 'tomato', tags: 'pomidor tomato' },
  { id: 'cucumber', cat: 'veg', pl: 'ogórek', en: 'cucumber', icon: 'cucumber', tags: 'ogorek ogórki' },
  { id: 'pepper', cat: 'veg', pl: 'papryka', en: 'bell pepper', icon: 'pepper', tags: 'papryke paprika' },
  { id: 'onion', cat: 'veg', pl: 'cebula', en: 'onion', icon: 'onion', tags: 'cebule cebulka' },
  { id: 'garlic', cat: 'veg', pl: 'czosnek', en: 'garlic', icon: 'garlic', tags: 'czosnku' },
  { id: 'potato', cat: 'veg', pl: 'ziemniaki', en: 'potatoes', icon: 'potato', tags: 'ziemniak kartofle pyry' },
  { id: 'carrot', cat: 'veg', pl: 'marchewka', en: 'carrots', icon: 'carrot', tags: 'marchew' },
  { id: 'broccoli', cat: 'veg', pl: 'brokuł', en: 'broccoli', icon: 'broccoli', tags: 'brokuly brokul' },
  { id: 'zucchini', cat: 'veg', pl: 'cukinia', en: 'zucchini', icon: 'zucchini', tags: 'cukinie' },
  { id: 'eggplant', cat: 'veg', pl: 'bakłażan', en: 'eggplant', icon: 'eggplant', tags: 'baklazan' },
  { id: 'spinach', cat: 'veg', pl: 'szpinak', en: 'spinach', icon: 'spinach', tags: '' },
  { id: 'lettuce', cat: 'veg', pl: 'sałata', en: 'lettuce', icon: 'lettuce', tags: 'salata mix sałaty' },
  { id: 'cabbage', cat: 'veg', pl: 'kapusta', en: 'cabbage', icon: 'cabbage', tags: 'kapuste' },
  { id: 'mushroom', cat: 'veg', pl: 'pieczarki', en: 'mushrooms', icon: 'mushroom', tags: 'grzyby pieczarka' },
  { id: 'corn', cat: 'veg', pl: 'kukurydza', en: 'sweetcorn', icon: 'corn', tags: 'kukurydze' },
  { id: 'pumpkin', cat: 'veg', pl: 'dynia', en: 'pumpkin', icon: 'pumpkin', tags: 'dynie' },

  // ——— owoce ———
  { id: 'apple', cat: 'fruit', pl: 'jabłka', en: 'apples', icon: 'apple', tags: 'jablka jablko' },
  { id: 'banana', cat: 'fruit', pl: 'banany', en: 'bananas', icon: 'banana', tags: 'banan' },
  { id: 'lemon', cat: 'fruit', pl: 'cytryna', en: 'lemon', icon: 'lemon', tags: 'cytryny' },
  { id: 'orange', cat: 'fruit', pl: 'pomarańcze', en: 'oranges', icon: 'orange', tags: 'pomarancze' },
  { id: 'strawberry', cat: 'fruit', pl: 'truskawki', en: 'strawberries', icon: 'strawberry', tags: 'truskawka' },
  { id: 'grapes', cat: 'fruit', pl: 'winogrona', en: 'grapes', icon: 'grapes', tags: '' },
  { id: 'avocado', cat: 'fruit', pl: 'awokado', en: 'avocado', icon: 'avocado', tags: 'avocado' },

  // ——— nabial ———
  { id: 'eggs', cat: 'dairy', pl: 'jajka', en: 'eggs', icon: 'egg', tags: 'jaja jajko' },
  { id: 'milk', cat: 'dairy', pl: 'mleko', en: 'milk', icon: 'milk', tags: '' },
  { id: 'butter', cat: 'dairy', pl: 'masło', en: 'butter', icon: 'butter', tags: 'maslo' },
  { id: 'cheese', cat: 'dairy', pl: 'ser żółty', en: 'hard cheese', icon: 'cheese', tags: 'ser zolty gouda cheddar' },
  { id: 'cottage', cat: 'dairy', pl: 'twaróg', en: 'cottage cheese', icon: 'cottage', tags: 'twarog serek wiejski' },
  { id: 'yogurt', cat: 'dairy', pl: 'jogurt', en: 'yogurt', icon: 'yogurt', tags: 'jogurt naturalny skyr' },
  { id: 'cream', cat: 'dairy', pl: 'śmietana', en: 'cream', icon: 'cream', tags: 'smietana kremowka' },
  { id: 'mozzarella', cat: 'dairy', pl: 'mozzarella', en: 'mozzarella', icon: 'mozzarella', tags: 'feta serek' },

  // ——— bialko ———
  { id: 'chicken', cat: 'protein', pl: 'kurczak', en: 'chicken', icon: 'chicken', tags: 'piers z kurczaka udka' },
  { id: 'beef', cat: 'protein', pl: 'wołowina', en: 'beef', icon: 'beef', tags: 'wolowina stek' },
  { id: 'pork', cat: 'protein', pl: 'wieprzowina', en: 'pork', icon: 'pork', tags: 'schab karkowka' },
  { id: 'mince', cat: 'protein', pl: 'mięso mielone', en: 'ground meat', icon: 'mince', tags: 'mielone mieso' },
  { id: 'bacon', cat: 'protein', pl: 'boczek', en: 'bacon', icon: 'bacon', tags: 'bekon' },
  { id: 'sausage', cat: 'protein', pl: 'kiełbasa', en: 'sausage', icon: 'sausage', tags: 'kielbasa parowki' },
  { id: 'salmon', cat: 'protein', pl: 'łosoś', en: 'salmon', icon: 'salmon', tags: 'losos' },
  { id: 'whitefish', cat: 'protein', pl: 'ryba biała', en: 'white fish', icon: 'fish', tags: 'dorsz mintaj ryba' },
  { id: 'shrimp', cat: 'protein', pl: 'krewetki', en: 'shrimp', icon: 'shrimp', tags: 'krewetka' },
  { id: 'tofu', cat: 'protein', pl: 'tofu', en: 'tofu', icon: 'cottage', tags: 'tempeh' },

  // ——— sypkie ———
  { id: 'rice', cat: 'staples', pl: 'ryż', en: 'rice', icon: 'rice', tags: 'ryz basmati jasmine' },
  { id: 'pasta', cat: 'staples', pl: 'makaron', en: 'pasta', icon: 'pasta', tags: 'spaghetti penne' },
  { id: 'groats', cat: 'staples', pl: 'kasza', en: 'groats', icon: 'groats', tags: 'gryczana jaglana bulgur kuskus' },
  { id: 'oats', cat: 'staples', pl: 'płatki owsiane', en: 'oats', icon: 'oats', tags: 'platki owsianka' },
  { id: 'flour', cat: 'staples', pl: 'mąka', en: 'flour', icon: 'flour', tags: 'maka' },
  { id: 'bread', cat: 'staples', pl: 'chleb', en: 'bread', icon: 'bread', tags: 'pieczywo bulki' },
  { id: 'tortilla', cat: 'staples', pl: 'tortille', en: 'tortillas', icon: 'tortilla', tags: 'wrapy placki' },
  { id: 'lentils', cat: 'staples', pl: 'soczewica', en: 'lentils', icon: 'legumes', tags: 'soczewice' },
  { id: 'chickpeas', cat: 'staples', pl: 'ciecierzyca', en: 'chickpeas', icon: 'legumes', tags: 'cieciorka humus' },
  { id: 'beans', cat: 'staples', pl: 'fasola', en: 'beans', icon: 'legumes', tags: 'fasolka czerwona' },

  // ——— dodatki ———
  { id: 'oil', cat: 'extras', pl: 'oliwa / olej', en: 'olive oil', icon: 'oil', tags: 'olej oliwa rzepakowy' },
  { id: 'soy', cat: 'extras', pl: 'sos sojowy', en: 'soy sauce', icon: 'soy', tags: 'sojowy teriyaki' },
  { id: 'passata', cat: 'extras', pl: 'passata / pomidory z puszki', en: 'passata / canned tomatoes', icon: 'passata', tags: 'koncentrat przecier' },
  { id: 'coconut', cat: 'extras', pl: 'mleko kokosowe', en: 'coconut milk', icon: 'coconut', tags: 'kokos curry' },
  { id: 'honey', cat: 'extras', pl: 'miód', en: 'honey', icon: 'honey', tags: 'miod syrop' },
  { id: 'nuts', cat: 'extras', pl: 'orzechy', en: 'nuts', icon: 'nuts', tags: 'migdaly orzeszki' },
  { id: 'peanutbutter', cat: 'extras', pl: 'masło orzechowe', en: 'peanut butter', icon: 'peanut', tags: 'maslo orzechowe' },
  { id: 'spices', cat: 'extras', pl: 'podstawowe przyprawy', en: 'basic spices', icon: 'spices', tags: 'sol pieprz papryka oregano' },
  { id: 'chili', cat: 'extras', pl: 'ostra papryczka / chili', en: 'chili', icon: 'chili', tags: 'ostre sriracha' },
  { id: 'herbs', cat: 'extras', pl: 'świeże zioła', en: 'fresh herbs', icon: 'herbs', tags: 'bazylia natka koperek swieze ziola' },
  { id: 'stock', cat: 'extras', pl: 'bulion / kostka rosołowa', en: 'stock cube', icon: 'stock', tags: 'rosol bulion kostka' },
  { id: 'frozen', cat: 'extras', pl: 'mrożonki', en: 'frozen vegetables', icon: 'frozen', tags: 'mrozonki mrozone warzywa' },
];

/** Szybki dostep po id. */
export const PANTRY_BY_ID = Object.fromEntries(PANTRY.map((p) => [p.id, p]));

/**
 * Ikona zastepcza dla kategorii — uzywana, gdy nie udalo sie nic zgadnac
 * z nazwy wlasnego produktu.
 */
export const CATEGORY_ICONS = {
  veg: 'broccoli',
  fruit: 'apple',
  dairy: 'milk',
  protein: 'chicken',
  staples: 'bread',
  extras: 'spices',
};

/**
 * Ikony do recznego wyboru przy wlasnym produkcie — klikanie w podglad
 * przewija te liste. Celowo krotka: przy 70 ikonach wybor z siatki bylby
 * kolejnym ekranem do zaprojektowania, a osiem sensownych propozycji
 * na kategorie zalatwia 95% przypadkow.
 */
export const CATEGORY_ICON_CHOICES = {
  veg: ['broccoli', 'tomato', 'carrot', 'onion', 'pepper', 'mushroom', 'cabbage', 'corn'],
  fruit: ['apple', 'banana', 'lemon', 'orange', 'strawberry', 'grapes', 'avocado', 'pumpkin'],
  dairy: ['milk', 'cheese', 'egg', 'butter', 'yogurt', 'cream', 'cottage', 'mozzarella'],
  protein: ['chicken', 'beef', 'pork', 'fish', 'salmon', 'shrimp', 'sausage', 'bacon'],
  staples: ['bread', 'pasta', 'rice', 'flour', 'oats', 'groats', 'legumes', 'tortilla'],
  extras: ['spices', 'oil', 'honey', 'chili', 'herbs', 'soy', 'nuts', 'passata'],
};

/**
 * Zgaduje produkt z katalogu na podstawie tego, co uzytkownik wpisal.
 * „ser kozi" trafi w „ser żółty" (ikona sera), „mleko owsiane" w „mleko".
 * Wygrywa najdluzsze dopasowanie, zeby „masło orzechowe" nie zostalo maslem.
 */
export function guessFromName(name) {
  const query = normalize(name);
  if (query.length < 3) return null;

  let best = null;
  for (const item of PANTRY) {
    const terms = [item.pl, item.en, ...(item.tags ?? '').split(/\s+/)].filter(Boolean);
    for (const term of terms) {
      const needle = normalize(term);
      if (needle.length < 3) continue;
      if (query.includes(needle) && (best === null || needle.length > best.length)) {
        best = { item, length: needle.length };
      }
    }
  }
  return best?.item ?? null;
}

/**
 * Produkty pogrupowane w kolejnosci kategorii.
 * Wlasne produkty uzytkownika wchodza do tych samych grup, na koniec —
 * w prompcie maja wygladac jak reszta, a nie jak dopisek.
 */
export function groupPantry(ids, lang = 'pl', custom = []) {
  return CATEGORIES.map((cat) => ({
    cat,
    label: cat[lang] ?? cat.pl,
    items: [
      ...ids
        .map((id) => PANTRY_BY_ID[id])
        .filter((item) => item && item.cat === cat.id)
        .map((item) => item[lang] ?? item.pl),
      ...custom.filter((item) => item.cat === cat.id).map((item) => item.name),
    ],
  })).filter((group) => group.items.length > 0);
}

/** Proste, "wybaczajace" wyszukiwanie: bez ogonkow, po nazwach PL/EN i tagach. */
export function searchPantry(query) {
  const q = normalize(query);
  if (!q) return PANTRY;
  return PANTRY.filter((item) =>
    normalize(`${item.pl} ${item.en} ${item.tags ?? ''}`).includes(q)
  );
}

const DIACRITICS = { ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z' };

export function normalize(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (ch) => DIACRITICS[ch])
    .trim();
}
