/**
 * icons.js — zestaw plaskich ikon (viewBox 0 0 24 24).
 *
 * Dwa rodzaje:
 *  - FOOD: kolorowe, plaskie ikony jedzenia. Kolory sa "zapieczone", bo maja
 *    wygladac tak samo na bialym i na czarnym tle (zaznaczony chip = czarne tlo).
 *  - UI: monochromatyczne, rysowane `currentColor`, wiec dziedzicza kolor tekstu.
 *
 * Ikony trzymamy w JS (a nie w osobnym pliku .svg z <use href="sprite.svg#id">),
 * bo sprite z zewnetrznego pliku nie dziala przy otwarciu z file:// — a jednym
 * z celow projektu jest "dwuklik w index.html i dziala".
 */

/** Kolorowe ikony jedzenia. Klucz = id uzywane w katalogu spizarni. */
export const FOOD = {
  // ——— warzywa ———————————————————————————————————————————————
  tomato: '<circle cx="12" cy="14.5" r="7.2" fill="#e5493c"/><path d="M12 7.6c-.4-2-2.3-3.4-4.6-3.3.1 2.2 1.9 3.6 4.6 3.3z" fill="#5bb45f"/><path d="M12 7.6c.4-2 2.3-3.4 4.6-3.3-.1 2.2-1.9 3.6-4.6 3.3z" fill="#43a04a"/><circle cx="9.4" cy="12.6" r="1.6" fill="#f2796d"/>',
  cucumber: '<rect x="3.4" y="9" width="17.2" height="6.2" rx="3.1" fill="#4e9f4a" transform="rotate(-18 12 12)"/><circle cx="9" cy="14" r=".9" fill="#7fc47a"/><circle cx="13" cy="11.4" r=".9" fill="#7fc47a"/><circle cx="16.6" cy="9.3" r=".8" fill="#7fc47a"/>',
  pepper: '<path d="M6.3 12.9c0-3.5 2.6-5.6 5.7-5.6s5.7 2.1 5.7 5.6c0 4-1.9 7.3-3.4 7.3-.9 0-1.1-.9-2.3-.9s-1.4.9-2.3.9c-1.5 0-3.4-3.3-3.4-7.3z" fill="#e0342f"/><path d="M11.2 7.4V5.6c0-.9.7-1.6 1.6-1.6" fill="none" stroke="#4aa055" stroke-width="1.8" stroke-linecap="round"/><path d="M9 11.3c-.7 1.2-.8 2.7-.5 4" fill="none" stroke="#f0837c" stroke-width="1.4" stroke-linecap="round"/>',
  onion: '<path d="M12 4.2c2.9 2.3 6 4.6 6 8.6a6 6 0 0 1-12 0c0-4 3.1-6.3 6-8.6z" fill="#b38ab8"/><path d="M12 4.2c-1 2.6-1.6 5.3-1.6 8.6 0 2.2.5 4.3 1.6 6-1.1-1.7-1.6-3.8-1.6-6" fill="#8f6b96"/><path d="M13.8 6.6c.9 2.2 1.4 4.4 1.4 6.9 0 2-.4 3.9-1.2 5.4" fill="none" stroke="#8f6b96" stroke-width="1" opacity=".7"/><path d="M12 4.2c.3-1 1.2-1.6 2.2-1.7" fill="none" stroke="#6e9c52" stroke-width="1.6" stroke-linecap="round"/>',
  garlic: '<path d="M12 3.9c2.7 2.6 5.3 4.8 5.3 8.5A5.3 5.3 0 0 1 12 20.6a5.3 5.3 0 0 1-5.3-8.2c0-3.7 2.6-5.9 5.3-8.5z" fill="#f2efe6"/><path d="M12 4.1c-1 2.6-1.5 5.2-1.5 8.3 0 2.9.5 5.7 1.5 8.2-1-2.5-1.5-5.3-1.5-8.2" fill="#d9d3c2"/><path d="M14.3 7.5c.8 2.1 1.2 4.1 1.2 6.4 0 2.3-.4 4.5-1.2 6.4" fill="none" stroke="#d9d3c2" stroke-width="1"/><path d="M12 4.1c0-1 .4-1.8 1.2-2.3" fill="none" stroke="#a8b08a" stroke-width="1.5" stroke-linecap="round"/>',
  potato: '<ellipse cx="12" cy="12.4" rx="8.4" ry="6.4" fill="#c9a06a" transform="rotate(-16 12 12.4)"/><ellipse cx="9" cy="11" rx="1.1" ry=".8" fill="#a97f4d"/><ellipse cx="13.6" cy="14" rx="1" ry=".7" fill="#a97f4d"/><ellipse cx="15" cy="9.8" rx=".8" ry=".6" fill="#a97f4d"/>',
  carrot: '<path d="M8.4 21.2c-.9.3-1.7-.5-1.4-1.4L11 9.4l4.2 4.2-6.8 7.6z" fill="#ec8127"/><path d="m11.9 10.3 2.8 2.8-5.6 6.3 2.8-9.1z" fill="#f59b4e"/><path d="M13.4 7.4c1-1.6 3-2.6 4.9-2.2-.2 2-1.7 3.6-3.6 4l2.9.7c-.5 1.7-2.2 3-4 3" fill="#57a94f"/>',
  broccoli: '<circle cx="8.6" cy="8.6" r="4" fill="#4c9c4f"/><circle cx="15.2" cy="8.2" r="3.7" fill="#3f8a44"/><circle cx="12" cy="6.2" r="3.4" fill="#5cae5b"/><path d="M9.4 12h5.2l-.7 7.4a1.9 1.9 0 0 1-3.8 0L9.4 12z" fill="#8bc47f"/>',
  zucchini: '<rect x="3" y="9.6" width="18" height="5.6" rx="2.8" fill="#3d7d3f" transform="rotate(-20 12 12.4)"/><path d="M7 15.4c.8-2.4 2.4-4.6 4.6-6" fill="none" stroke="#5ea05a" stroke-width="1.2" stroke-linecap="round"/><path d="M17.4 7.8c.5-.9 1.4-1.4 2.4-1.4" fill="none" stroke="#6ea24f" stroke-width="1.6" stroke-linecap="round"/>',
  eggplant: '<path d="M18.6 8.3c1.7 2.9.2 7.4-3 9.9-3.2 2.5-7.1 2.1-8.8-.4-1.7-2.5-.3-6.1 2.9-8.5 3.2-2.4 7.2-3.9 8.9-1z" fill="#7d4d9e"/><path d="M11 9c-1.9 1.4-3.2 3.3-3.6 5.1" fill="none" stroke="#9a6fb8" stroke-width="1.3" stroke-linecap="round"/><path d="M16.6 7.3c.6-1.5 2-2.5 3.6-2.6.1 1.7-1 3.2-2.6 3.8" fill="#55a35a"/>',
  spinach: '<path d="M20 4.4c.6 6.3-3 11.4-8.6 11.8-2.8.2-5-1.2-5.6-3.5-.8-3.2 1.6-6.3 5.6-7.3 2.9-.7 6-.9 8.6-1z" fill="#3f8f45"/><path d="M4.6 20c2.6-4.2 6.6-7.6 11.4-9.6" fill="none" stroke="#66b062" stroke-width="1.6" stroke-linecap="round"/>',
  lettuce: '<path d="M4 12.6c0-4.2 3.6-7.4 8-7.4s8 3.2 8 7.4c0 .8-.6 1.4-1.4 1.4H5.4c-.8 0-1.4-.6-1.4-1.4z" fill="#8cc63f"/><path d="M6.4 14c-.3 3 1.6 5.3 5.6 5.3s5.9-2.3 5.6-5.3H6.4z" fill="#a8d95c"/><path d="M12 5.2v8.8M8 6.6c-.4 2.6-.5 5-.3 7.4M16 6.6c.4 2.6.5 5 .3 7.4" fill="none" stroke="#6fae2e" stroke-width="1"/>',
  cabbage: '<circle cx="12" cy="12.6" r="7.8" fill="#bcd98f"/><path d="M12 4.8c-3.2 2.2-5 5-5 8.2 0 2.6 1.4 4.8 3.4 6.1-1.2-1.8-1.8-3.9-1.8-6.1 0-3.1 1.2-6 3.4-8.2z" fill="#9ec96a"/><path d="M12 4.8c3.2 2.2 5 5 5 8.2 0 2.6-1.4 4.8-3.4 6.1 1.2-1.8 1.8-3.9 1.8-6.1 0-3.1-1.2-6-3.4-8.2z" fill="#9ec96a"/><path d="M12 5v15" fill="none" stroke="#86b455" stroke-width="1"/>',
  mushroom: '<path d="M3.6 11.6C3.6 7.4 7.4 4.4 12 4.4s8.4 3 8.4 7.2c0 .9-.7 1.6-1.6 1.6H5.2c-.9 0-1.6-.7-1.6-1.6z" fill="#c2705a"/><path d="M9.8 13.2h4.4v4.6a2.2 2.2 0 0 1-4.4 0v-4.6z" fill="#efe3d2"/><ellipse cx="8.6" cy="8.6" rx="1.8" ry="1.2" fill="#d99680"/><ellipse cx="14.6" cy="9.4" rx="1.4" ry="1" fill="#d99680"/>',
  corn: '<path d="M12 3.2c3 0 5 3.5 5 8.2S15 20 12 20s-5-3.9-5-8.6 2-8.2 5-8.2z" fill="#f3c33e"/><path d="M10.2 6.4c-.4 3.6-.4 7.2 0 10.8M13.8 6.4c.4 3.6.4 7.2 0 10.8M12 5.6v13" fill="none" stroke="#dba71f" stroke-width=".9"/><path d="M7.2 11.6C5 11 3.4 9 3.2 6.6c2.6.2 4.6 1.9 5.2 4.2M16.8 11.6c2.2-.6 3.8-2.6 4-5-2.6.2-4.6 1.9-5.2 4.2" fill="#63a94f"/>',
  pumpkin: '<ellipse cx="12" cy="13.4" rx="8.6" ry="6.8" fill="#ee8a2b"/><path d="M12 6.6c-1.6 1.9-2.4 4.2-2.4 6.8s.8 4.9 2.4 6.8c-1.6-1.9-2.4-4.2-2.4-6.8" fill="#d97518"/><path d="M8.6 7.6c-1.4 1.8-2.1 3.8-2.1 5.8s.7 4 2.1 5.8M15.4 7.6c1.4 1.8 2.1 3.8 2.1 5.8s-.7 4-2.1 5.8" fill="none" stroke="#d97518" stroke-width="1"/><path d="M12 6.6V4.2c0-.8.6-1.4 1.4-1.4" fill="none" stroke="#5ea04f" stroke-width="1.8" stroke-linecap="round"/>',

  // ——— owoce ————————————————————————————————————————————————
  apple: '<path d="M12 7.8c1.5-1.4 4-1.6 5.6.2 1.7 1.9 1.6 5.6-.3 8.6-1.2 1.9-2.6 3.1-3.8 3.1-.7 0-1-.5-1.5-.5s-.8.5-1.5.5c-1.2 0-2.6-1.2-3.8-3.1-1.9-3-2-6.7-.3-8.6 1.6-1.8 4.1-1.6 5.6-.2z" fill="#df3b3b"/><path d="M12 7.8V5.2" fill="none" stroke="#7a5230" stroke-width="1.5" stroke-linecap="round"/><path d="M12.4 5.6c.6-1.8 2.4-2.8 4.2-2.6-.2 1.9-1.9 3.2-4.2 3.2z" fill="#5aab52"/>',
  banana: '<path d="M4.6 8.2c.4 6 4.6 10 10.2 10 2.6 0 4.6-1 5.6-2.6-2.4.4-4.4-.4-5.8-1.8-1.6-1.6-2-4-1.6-6.6-2.4 1.6-5.2 1.8-8.4 1z" fill="#f5cc3f"/><path d="M4.6 8.2c-.9-.3-1.4-1-1.4-2 1.4-.3 2.4.3 2.8 1.6M20.4 15.6c.9.5 1.2 1.3 1 2.2-1.4.2-2.4-.4-2.8-1.4" fill="#e0b32b"/>',
  lemon: '<ellipse cx="12" cy="12" rx="8.4" ry="6" fill="#f2d33c" transform="rotate(-20 12 12)"/><path d="M4.6 9.6c-.9-.4-1.5-.2-1.9.4.5.6 1.2.8 2 .5M19.4 14.4c.9.4 1.5.2 1.9-.4-.5-.6-1.2-.8-2-.5" fill="#dcb824"/><ellipse cx="9.6" cy="10.6" rx="2" ry="1.2" fill="#f8e88a" transform="rotate(-20 9.6 10.6)"/>',
  orange: '<circle cx="12" cy="13" r="7.6" fill="#f18a1e"/><path d="M12 5.4v15.2M5.2 10.4l13.6 5.2M5.2 15.6l13.6-5.2" fill="none" stroke="#d9740f" stroke-width=".9" opacity=".6"/><path d="M12 5.4c.3-1.2 1.4-2 2.8-2" fill="none" stroke="#6b8f3a" stroke-width="1.5" stroke-linecap="round"/>',
  strawberry: '<path d="M12 20.4c-3.6-1.4-6.4-4.6-6.4-8 0-2.4 2.8-4 6.4-4s6.4 1.6 6.4 4c0 3.4-2.8 6.6-6.4 8z" fill="#e23b4e"/><path d="M8.2 6.4c1-.9 2.3-1.3 3.8-1.3s2.8.4 3.8 1.3c-.6 1.3-2 2-3.8 2s-3.2-.7-3.8-2z" fill="#4aa04e"/><path d="M12 5.1V3.4" fill="none" stroke="#4aa04e" stroke-width="1.4" stroke-linecap="round"/><circle cx="10" cy="12" r=".8" fill="#ffd9a1"/><circle cx="13.6" cy="11.2" r=".8" fill="#ffd9a1"/><circle cx="12" cy="15" r=".8" fill="#ffd9a1"/>',
  grapes: '<circle cx="12" cy="7.4" r="2.4" fill="#8e5ba6"/><circle cx="8.4" cy="11" r="2.4" fill="#9d6ab5"/><circle cx="15.6" cy="11" r="2.4" fill="#9d6ab5"/><circle cx="12" cy="12.4" r="2.4" fill="#8e5ba6"/><circle cx="10" cy="16" r="2.4" fill="#9d6ab5"/><circle cx="14" cy="16" r="2.4" fill="#8e5ba6"/><path d="M12 5.2V3.4c1.6 0 2.8-.6 3.6-1.6" fill="none" stroke="#5c9e4f" stroke-width="1.4" stroke-linecap="round"/>',
  avocado: '<path d="M12 3.6c3.6 0 6.2 3.6 6.2 8 0 4.4-2.6 8-6.2 8s-6.2-3.6-6.2-8c0-4.4 2.6-8 6.2-8z" fill="#5f9e3e"/><path d="M12 6c2.4 0 4.2 2.6 4.2 5.8s-1.8 5.8-4.2 5.8-4.2-2.6-4.2-5.8S9.6 6 12 6z" fill="#dfe7a8"/><ellipse cx="12" cy="12.6" rx="2.6" ry="3" fill="#8a5a33"/>',

  // ——— nabial i jaja —————————————————————————————————————————
  egg: '<ellipse cx="9.4" cy="13.4" rx="5.4" ry="6.8" fill="#fdfbf5"/><ellipse cx="9.4" cy="14.6" rx="2.6" ry="2.6" fill="#f5b93b"/><ellipse cx="16.8" cy="9.6" rx="3.8" ry="4.8" fill="#f0ece0"/>',
  milk: '<path d="M8 8.6h8V20a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V8.6z" fill="#e9edf2"/><path d="M8 8.6 12 3l4 5.6H8z" fill="#cfd8e2"/><rect x="9.6" y="12.4" width="4.8" height="4.4" rx=".6" fill="#3b82c4"/>',
  butter: '<path d="M3.6 13.2 8 8.8h11.2a1.2 1.2 0 0 1 1.2 1.2v5.6a1.2 1.2 0 0 1-1.2 1.2H4.8a1.2 1.2 0 0 1-1.2-1.2v-2.4z" fill="#f5d46a"/><path d="M3.6 13.2 8 8.8h11.2c.4 0 .8.2 1 .5l-4.2 4.4-12.4-.5z" fill="#fae9a8"/>',
  cheese: '<path d="M3.4 11.6 12.6 5c.4-.3.9-.3 1.3-.1l6.1 3.5c.9.5.5 1.9-.5 1.9H4.2l-.8 1.3z" fill="#f2c94c"/><path d="M3.4 11.6h16.2v5.8a1.6 1.6 0 0 1-1.6 1.6H5a1.6 1.6 0 0 1-1.6-1.6v-5.8z" fill="#f5d977"/><circle cx="8" cy="15" r="1.5" fill="#e0b32b"/><circle cx="15" cy="16" r="1.2" fill="#e0b32b"/><circle cx="12.6" cy="12.8" r=".9" fill="#e0b32b"/>',
  cottage: '<path d="M4 9h16v8.6a1.4 1.4 0 0 1-1.4 1.4H5.4A1.4 1.4 0 0 1 4 17.6V9z" fill="#f7f5ee"/><path d="M4 9 7.6 5.4c.3-.3.6-.4 1-.4h9.2c.9 0 1.4 1.1.8 1.8L20 9H4z" fill="#e6e2d6"/><circle cx="8.6" cy="13" r="1.1" fill="#e6e2d6"/><circle cx="13" cy="15.4" r="1.4" fill="#e6e2d6"/><circle cx="16" cy="12.2" r=".9" fill="#e6e2d6"/>',
  yogurt: '<path d="M6.4 8.4h11.2l-1 11a1.6 1.6 0 0 1-1.6 1.4H9a1.6 1.6 0 0 1-1.6-1.4l-1-11z" fill="#f6f3ec"/><path d="M5.6 5.6h12.8v2.8H5.6z" fill="#e0517d"/><path d="M8.4 12.4c1.4.8 3 1.1 4.6.9" fill="none" stroke="#e0517d" stroke-width="1.4" stroke-linecap="round"/>',
  cream: '<path d="M5.4 9.6h13.2l-.9 9.6a1.6 1.6 0 0 1-1.6 1.4H7.9a1.6 1.6 0 0 1-1.6-1.4l-.9-9.6z" fill="#f4f7f9"/><rect x="4.4" y="6.6" width="15.2" height="3.2" rx="1" fill="#6fa8d6"/><path d="M8.6 13.8c1.6 1 3.4 1.2 5.2.6" fill="none" stroke="#6fa8d6" stroke-width="1.3" stroke-linecap="round"/>',
  mozzarella: '<circle cx="12" cy="13" r="6.6" fill="#fbfaf6"/><path d="M12 6.4c-2.6 1.6-4 3.8-4 6.6 0 2.4 1.2 4.4 3.2 5.6-1.2-1.6-1.8-3.4-1.8-5.6 0-2.4.9-4.6 2.6-6.6z" fill="#eae6da"/><path d="M14.6 6.4c1.3-1.6 3-2.4 5-2.4-.4 1.9-1.7 3.2-3.7 3.8z" fill="#5ea852"/>',

  // ——— mieso i ryby ——————————————————————————————————————————
  chicken: '<path d="M16.6 4.2c2.6 1.6 3.4 5.2 1.7 8-1.4 2.3-4 3.2-6.3 2.5l-1.4 1.4-2.8-2.8 1.4-1.4c-.8-2.4.2-5.1 2.6-6.5 1.7-1 3.5-1 4.8-1.2z" fill="#e0a86a"/><path d="M7.2 14.4 9.6 16.8l-3 3a1.7 1.7 0 0 1-2.4-2.4l3-3z" fill="#f2efe4"/><circle cx="14.6" cy="9" r="1.4" fill="#c98f4f"/>',
  beef: '<path d="M4.6 11c0-3.8 3.4-6.6 8-6.6s7.2 2.6 7.2 6c0 4.6-3.4 9-7.8 9-4 0-7.4-3.6-7.4-8.4z" fill="#cf4d4d"/><path d="M8.6 10.6c1.6-1.8 4.4-2.2 6.4-1 1.6 1 2.2 3 1.4 4.8-.8 1.8-2.8 2.8-4.6 2.2" fill="none" stroke="#e8837f" stroke-width="1.6" stroke-linecap="round"/><path d="M18.4 6.4c1.4.4 2.2 1.6 2 3-.2 1.4-1.4 2.2-2.8 2" fill="#f2ece2"/>',
  pork: '<path d="M5 12.6c0-4 3.2-7 7.4-7s7 2.8 7 6.4c0 4.2-3.2 8-7.2 8-3.8 0-7.2-3.4-7.2-7.4z" fill="#e79a9a"/><path d="M9.6 11.4c1.8-1.4 4.4-1.4 6.2.2" fill="none" stroke="#f5c6c6" stroke-width="1.6" stroke-linecap="round"/><path d="M9 16.2c1.8 1.2 4.2 1.2 6-.2" fill="none" stroke="#f5c6c6" stroke-width="1.6" stroke-linecap="round"/><path d="M5.6 8.4c-1.2-.6-1.8-1.8-1.4-3 1.4-.2 2.6.5 3 1.8" fill="#f2ece2"/>',
  mince: '<path d="M3.6 12.4h16.8c0 4.4-3.8 7.4-8.4 7.4s-8.4-3-8.4-7.4z" fill="#d9d2c4"/><path d="M4.8 12.4c.4-3.6 3.4-6.2 7.2-6.2s6.8 2.6 7.2 6.2H4.8z" fill="#cf5757"/><circle cx="9" cy="9.8" r="1" fill="#e88a8a"/><circle cx="13.4" cy="10.6" r=".9" fill="#e88a8a"/><circle cx="15.6" cy="8.8" r=".8" fill="#e88a8a"/>',
  bacon: '<path d="M3.4 8.2c3-2.4 5.4.8 8.4-1.4 2.8-2 5.4.6 8.8-1.2l1 3.4c-3.4 1.8-6-.8-8.8 1.2-3 2.2-5.4-1-8.4 1.4L3.4 8.2z" fill="#e07c7c"/><path d="M3.4 13.2c3-2.4 5.4.8 8.4-1.4 2.8-2 5.4.6 8.8-1.2l1 3.4c-3.4 1.8-6-.8-8.8 1.2-3 2.2-5.4-1-8.4 1.4l-1-3.4z" fill="#f2f0e8"/><path d="M3.4 18.2c3-2.4 5.4.8 8.4-1.4 2.8-2 5.4.6 8.8-1.2l1 3.4c-3.4 1.8-6-.8-8.8 1.2-3 2.2-5.4-1-8.4 1.4l-1-3.4z" fill="#e07c7c"/>',
  sausage: '<path d="M6.2 5.4c3.4 0 5.6 2.6 5.6 6.2s2.2 6.2 5.6 6.2c1.6 0 2.8 1 2.8 2.2H6.2c-3 0-4.6-2-4.6-4.4 0-2.2 1.6-3.8 4-3.8" fill="none" stroke="#a5613a" stroke-width="3.2" stroke-linecap="round"/><path d="M6.2 5.4c3.4 0 5.6 2.6 5.6 6.2" fill="none" stroke="#c07a4d" stroke-width="1.2" stroke-linecap="round"/>',
  salmon: '<path d="M3.4 14.6c2.6-5.4 7.6-8.6 13.4-8.6 2.2 0 3.8.6 3.8 1.6 0 4.6-5.4 9.8-11.8 9.8-3 0-5.4-1-5.4-2.8z" fill="#ef8a5c"/><path d="M6.4 13.4c3-3.2 7-5.2 11.4-5.6M8.2 16c3.2-3.4 7.4-5.6 12-6" fill="none" stroke="#f9d6c2" stroke-width="1.4" stroke-linecap="round"/>',
  fish: '<path d="M3.2 12.4c2.6-3.4 6-5.2 9.6-5.2 3.4 0 6 1.7 7.4 4-1.4 2.4-4 4.2-7.4 4.2-3.6 0-7-1.7-9.6-3z" fill="#7fb0cf"/><path d="m20.2 11.2 2.4-3v7l-2.4-3.2z" fill="#5f93b8"/><circle cx="8.4" cy="11" r="1.1" fill="#ffffff"/><circle cx="8.4" cy="11" r=".5" fill="#254a63"/><path d="M12.4 8.4c1 1.6 1.2 3.4.6 5.2" fill="none" stroke="#5f93b8" stroke-width="1.2"/>',
  shrimp: '<path d="M18.6 6.6c1.8 0 3 1.4 3 3.2 0 4.8-4.2 8.6-9.2 8.6H8.8c-3 0-5.2-2-5.2-4.6 0-2 1.4-3.4 3.2-3.4 1.6 0 2.6.9 2.6 2.2H7.8" fill="none" stroke="#ee7f66" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="19" cy="8.6" r=".9" fill="#ffffff"/><path d="M20.4 6.6c.8-.9 1.8-1.3 3-1.2" fill="none" stroke="#ee7f66" stroke-width="1.2" stroke-linecap="round"/>',

  // ——— sypkie, pieczywo, straczki —————————————————————————————
  rice: '<path d="M3.2 12.4h17.6c0 4.4-3.9 7.6-8.8 7.6s-8.8-3.2-8.8-7.6z" fill="#e9e4d8"/><path d="M4.6 12.4c.5-3.2 3.6-5.6 7.4-5.6s6.9 2.4 7.4 5.6H4.6z" fill="#fbfaf6"/><ellipse cx="9" cy="10.4" rx="1.5" ry=".8" fill="#e4dfd0" transform="rotate(-25 9 10.4)"/><ellipse cx="13" cy="9.6" rx="1.5" ry=".8" fill="#e4dfd0" transform="rotate(20 13 9.6)"/><ellipse cx="15.2" cy="11.2" rx="1.4" ry=".8" fill="#e4dfd0"/>',
  pasta: '<path d="M6.6 4.4c-1.4 4.6-1.6 9.6-.6 15M10.2 4c-1 4.8-1 9.8.2 15.4M13.8 4c-.2 5-.2 10 .8 15.4M17.4 4.4c.6 4.8 1 9.8 1.4 15" fill="none" stroke="#f2c94c" stroke-width="2.2" stroke-linecap="round"/><path d="M4.4 18.6c4.6-1.2 10.2-1.2 15.2 0" fill="none" stroke="#e0b32b" stroke-width="2.4" stroke-linecap="round"/>',
  groats: '<path d="M3.6 12.6h16.8c0 4.2-3.8 7.2-8.4 7.2s-8.4-3-8.4-7.2z" fill="#d9c9a8"/><path d="M5 12.6c.4-3 3.2-5.2 7-5.2s6.6 2.2 7 5.2H5z" fill="#c0a877"/><circle cx="9" cy="10.2" r=".9" fill="#a68d5c"/><circle cx="12.6" cy="9.4" r=".8" fill="#a68d5c"/><circle cx="15" cy="10.8" r=".8" fill="#a68d5c"/>',
  oats: '<path d="M12 3.6c1.6 1.4 2.4 3.4 2.4 5.8s-.8 4.6-2.4 6.4c-1.6-1.8-2.4-4-2.4-6.4S10.4 5 12 3.6z" fill="#dcc48c"/><path d="M12 15.8V21" fill="none" stroke="#b79a5e" stroke-width="1.4" stroke-linecap="round"/><path d="M6.4 6.6c1.8.6 3 2 3.4 3.8-1.9.4-3.6-.4-4.6-2M17.6 6.6c-1.8.6-3 2-3.4 3.8 1.9.4 3.6-.4 4.6-2" fill="#c9ad72"/><path d="M6 12.4c1.8.6 3 2 3.4 3.8-1.9.4-3.6-.4-4.6-2M18 12.4c-1.8.6-3 2-3.4 3.8 1.9.4 3.6-.4 4.6-2" fill="#c9ad72"/>',
  flour: '<path d="M6.4 7.6c0-.5.3-1 .8-1.2l3.4-1.6c.9-.4 1.9-.4 2.8 0l3.4 1.6c.5.2.8.7.8 1.2V19a1.6 1.6 0 0 1-1.6 1.6H8a1.6 1.6 0 0 1-1.6-1.6V7.6z" fill="#e8e2d2"/><path d="M6.4 7.6 12 9.6l5.6-2v2.2L12 11.8 6.4 9.8V7.6z" fill="#cfc6ae"/><path d="M9.4 14h5.2v4H9.4z" fill="#fbfaf6"/>',
  bread: '<path d="M3.4 11.4c0-3.2 3.8-5.4 8.6-5.4s8.6 2.2 8.6 5.4v.6c0 .8-.7 1.4-1.5 1.4h-.9v4.8a1.8 1.8 0 0 1-1.8 1.8H7.6a1.8 1.8 0 0 1-1.8-1.8v-4.8h-.9c-.8 0-1.5-.6-1.5-1.4v-.6z" fill="#c98f52"/><path d="M5.8 13.4h12.4v1.8H5.8z" fill="#e3b87e"/><path d="M7.4 9.2c2.8-1 6.4-1 9.2 0" fill="none" stroke="#e3b87e" stroke-width="1.3" stroke-linecap="round"/>',
  tortilla: '<circle cx="12" cy="12" r="8.6" fill="#ecd9a8"/><circle cx="12" cy="12" r="6.6" fill="#f5e9c6"/><circle cx="9" cy="9.6" r=".9" fill="#d8bd83"/><circle cx="14.4" cy="10.4" r=".8" fill="#d8bd83"/><circle cx="12" cy="14.6" r="1" fill="#d8bd83"/><circle cx="15.4" cy="14" r=".7" fill="#d8bd83"/>',
  legumes: '<path d="M8.6 5.4c2.2 0 3.6 1.6 3.6 3.4s-1.4 3.2-3.6 3.2S5 10.6 5 8.8s1.4-3.4 3.6-3.4z" fill="#c98a4b"/><path d="M15.6 9.4c2.2 0 3.6 1.6 3.6 3.4s-1.4 3.2-3.6 3.2-3.6-1.4-3.6-3.2 1.4-3.4 3.6-3.4z" fill="#8f6b3f"/><path d="M8.8 13.4c2.2 0 3.6 1.6 3.6 3.4s-1.4 3.2-3.6 3.2-3.6-1.4-3.6-3.2 1.4-3.4 3.6-3.4z" fill="#d9a45e"/>',

  // ——— dodatki i przyprawy ————————————————————————————————————
  oil: '<path d="M10 3.4h4v2.8l2.6 3.4c.5.6.8 1.4.8 2.2v7.6a1.6 1.6 0 0 1-1.6 1.6H8.2a1.6 1.6 0 0 1-1.6-1.6v-7.6c0-.8.3-1.6.8-2.2L10 6.2V3.4z" fill="#a8c24f"/><path d="M8 12.6h8v6.4H8z" fill="#dfe9b4"/><path d="M10.4 14.4c1 .8 2.2 1.1 3.4.9" fill="none" stroke="#8ba63a" stroke-width="1.2" stroke-linecap="round"/>',
  soy: '<path d="M9.4 3.4h5.2v3l1.8 2.4c.4.5.6 1.1.6 1.7v8.4a1.7 1.7 0 0 1-1.7 1.7H8.7A1.7 1.7 0 0 1 7 18.9v-8.4c0-.6.2-1.2.6-1.7l1.8-2.4v-3z" fill="#5c3b2a"/><rect x="8.6" y="12" width="6.8" height="5" rx=".6" fill="#f2ece0"/><path d="M10 14h4M10 15.6h2.6" fill="none" stroke="#5c3b2a" stroke-width="1" stroke-linecap="round"/>',
  passata: '<path d="M7.4 8.4h9.2v10.4a1.8 1.8 0 0 1-1.8 1.8H9.2a1.8 1.8 0 0 1-1.8-1.8V8.4z" fill="#d94b3c"/><rect x="6.8" y="6" width="10.4" height="2.6" rx=".8" fill="#b23a2e"/><rect x="9" y="11.4" width="6" height="5.4" rx=".6" fill="#f2ece0"/><circle cx="12" cy="14.1" r="1.6" fill="#d94b3c"/>',
  coconut: '<path d="M7 8h10v10.8a1.8 1.8 0 0 1-1.8 1.8H8.8A1.8 1.8 0 0 1 7 18.8V8z" fill="#e9edf0"/><path d="M6.6 5.4h10.8v2.8H6.6z" fill="#9fb3bd"/><circle cx="12" cy="14" r="2.8" fill="#ffffff"/><path d="M10.2 12.6c1.1-.7 2.5-.7 3.6 0" fill="none" stroke="#c3d0d6" stroke-width="1.1" stroke-linecap="round"/>',
  honey: '<path d="M7 9.4c0-.6.4-1.1 1-1.3l3-1c.6-.2 1.4-.2 2 0l3 1c.6.2 1 .7 1 1.3V19a1.6 1.6 0 0 1-1.6 1.6H8.6A1.6 1.6 0 0 1 7 19V9.4z" fill="#eaa72c"/><path d="M8.6 12.6h6.8v5.2H8.6z" fill="#f7e2b0"/><path d="m12 13.6 1.4 1v1.8l-1.4 1-1.4-1v-1.8l1.4-1z" fill="#eaa72c"/><path d="M9.4 7.4V5.6c0-.7.6-1.2 1.2-1.2h2.8c.7 0 1.2.6 1.2 1.2v1.8" fill="none" stroke="#c98a1e" stroke-width="1.2"/>',
  nuts: '<path d="M8.4 5c2.6 0 4.4 2.2 4.4 5s-2 5.6-4.4 5.6S4 12.8 4 10s1.8-5 4.4-5z" fill="#b9853f"/><path d="M8.4 5.6c-1 1.4-1.5 3-1.5 4.6s.5 3.2 1.5 4.6" fill="none" stroke="#d8a55c" stroke-width="1.1"/><path d="M15.6 9.8c2.4 0 4.4 2 4.4 4.6s-2 4.6-4.4 4.6-4.4-2-4.4-4.6 2-4.6 4.4-4.6z" fill="#8f6534"/><path d="M15.6 10.4c-.9 1.2-1.4 2.6-1.4 4s.5 2.8 1.4 4" fill="none" stroke="#b9853f" stroke-width="1.1"/>',
  peanut: '<path d="M7.4 7.6h9.2v11.2a1.8 1.8 0 0 1-1.8 1.8H9.2a1.8 1.8 0 0 1-1.8-1.8V7.6z" fill="#e9dcc2"/><rect x="6.8" y="5" width="10.4" height="2.8" rx=".8" fill="#8f5f34"/><rect x="8.8" y="11" width="6.4" height="5.6" rx=".6" fill="#c08a4a"/><path d="M10 13.4h4" fill="none" stroke="#e9dcc2" stroke-width="1.1" stroke-linecap="round"/>',
  spices: '<path d="M7.6 9.6h8.8V19a1.8 1.8 0 0 1-1.8 1.8H9.4A1.8 1.8 0 0 1 7.6 19V9.6z" fill="#e5e0d4"/><path d="M8.4 5.6c0-.7.6-1.2 1.2-1.2h4.8c.7 0 1.2.6 1.2 1.2v4H8.4v-4z" fill="#c1553e"/><circle cx="10.6" cy="6.6" r=".7" fill="#f2ece0"/><circle cx="13.4" cy="6.6" r=".7" fill="#f2ece0"/><circle cx="12" cy="8" r=".7" fill="#f2ece0"/><path d="M9.6 13h4.8M9.6 16h3.2" fill="none" stroke="#b4aa96" stroke-width="1.2" stroke-linecap="round"/>',
  chili: '<path d="M18.8 6.8c1.4 4.6-2 10.2-7 12.2-2.8 1.1-5.2.6-6-1-.7-1.5.3-3 2.4-3.4 1.5-.3 2.6.3 3.6-.4 2.8-1.9 4.4-5 7-7.4z" fill="#d93a3a"/><path d="M18.8 6.8c-.4-1.6 0-3 1.2-4 1.2 1 1.4 2.6.6 4z" fill="#4e9b4e"/><path d="M18.8 6.8c-1.6-.6-3-.4-4.2.6" fill="none" stroke="#4e9b4e" stroke-width="1.5" stroke-linecap="round"/>',
  herbs: '<path d="M12 21V8" fill="none" stroke="#4a8f3f" stroke-width="1.6" stroke-linecap="round"/><path d="M12 9.4c-2.6 0-4.4-1.6-4.6-4.2 2.6-.2 4.6 1.4 4.6 4.2zM12 9.4c2.6 0 4.4-1.6 4.6-4.2-2.6-.2-4.6 1.4-4.6 4.2z" fill="#67b256"/><path d="M12 15c-2.6 0-4.4-1.6-4.6-4.2 2.6-.2 4.6 1.4 4.6 4.2zM12 15c2.6 0 4.4-1.6 4.6-4.2-2.6-.2-4.6 1.4-4.6 4.2z" fill="#4a9440"/>',
  stock: '<path d="M4.6 8.4h14.8v9.8a1.8 1.8 0 0 1-1.8 1.8H6.4a1.8 1.8 0 0 1-1.8-1.8V8.4z" fill="#d9a441"/><path d="M4.6 8.4 7 5.2c.3-.4.8-.7 1.3-.7h7.4c.5 0 1 .2 1.3.7l2.4 3.2H4.6z" fill="#efc46e"/><path d="M8.4 12h7.2M8.4 15.4h5" fill="none" stroke="#b5842c" stroke-width="1.4" stroke-linecap="round"/>',
  frozen: '<path d="M12 2.8v18.4M4 7.4l16 9.2M20 7.4 4 16.6" fill="none" stroke="#4fa3d1" stroke-width="1.8" stroke-linecap="round"/><path d="m12 6.4 2-2M12 6.4l-2-2M12 17.6l2 2M12 17.6l-2 2M6.6 9.4l-2.7.2M6.6 9.4l-.2-2.7M17.4 14.6l2.7-.2M17.4 14.6l.2 2.7M6.6 14.6l-2.7-.2M6.6 14.6l-.2 2.7M17.4 9.4l2.7.2M17.4 9.4l.2-2.7" fill="none" stroke="#7cc3e8" stroke-width="1.5" stroke-linecap="round"/>',

  // ——— sprzet (te same zasady, uzywane przy "co masz w kuchni") ———
  oven: '<rect x="3.4" y="4.4" width="17.2" height="15.2" rx="2" fill="#5a616b"/><rect x="5.6" y="9.4" width="12.8" height="8" rx="1.2" fill="#f0a64a"/><circle cx="7" cy="6.8" r="1" fill="#cbd2da"/><circle cx="10" cy="6.8" r="1" fill="#cbd2da"/><circle cx="17" cy="6.8" r="1" fill="#cbd2da"/>',
  pan: '<ellipse cx="10" cy="13" rx="7" ry="4.6" fill="#3f454e"/><ellipse cx="10" cy="12.2" rx="5.4" ry="3.4" fill="#6d7681"/><path d="M16.6 14.4 22 17.4" fill="none" stroke="#a8683c" stroke-width="2.4" stroke-linecap="round"/>',
  pot: '<path d="M4 9.4h16v5.4a4.6 4.6 0 0 1-4.6 4.6H8.6A4.6 4.6 0 0 1 4 14.8V9.4z" fill="#6d7681"/><path d="M2.4 8.4h19.2v2H2.4z" fill="#3f454e"/><path d="M9 6.4c0-1.2 1.2-1.6 1.2-2.8M13 6.4c0-1.2 1.2-1.6 1.2-2.8" fill="none" stroke="#b8c0c9" stroke-width="1.3" stroke-linecap="round"/>',
  airfryer: '<rect x="5" y="3.6" width="14" height="16.8" rx="2.6" fill="#3f454e"/><rect x="7" y="12.4" width="10" height="6" rx="1.4" fill="#6d7681"/><circle cx="12" cy="8.2" r="2.6" fill="#f0a64a"/><path d="M9.4 15.4h5.2" fill="none" stroke="#b8c0c9" stroke-width="1.3" stroke-linecap="round"/>',
  blender: '<path d="M7.4 4h9.2l-1.2 8.4a2 2 0 0 1-2 1.7h-2.8a2 2 0 0 1-2-1.7L7.4 4z" fill="#8dc3e0"/><path d="M8.2 6.4h7.6l-.5 3.4H8.7z" fill="#5ea3c9"/><path d="M8.6 14.1h6.8v3.4a2 2 0 0 1-2 2h-2.8a2 2 0 0 1-2-2v-3.4z" fill="#3f454e"/><path d="M7.6 19.5h8.8v1.6H7.6z" fill="#6d7681"/>',
  microwave: '<rect x="2.6" y="5.6" width="18.8" height="12.8" rx="2" fill="#5a616b"/><rect x="4.6" y="7.6" width="10.6" height="8.8" rx="1" fill="#9fd0e8"/><circle cx="18.4" cy="9.6" r="1.4" fill="#cbd2da"/><path d="M17 13.4h2.8M17 15.4h2.8" fill="none" stroke="#cbd2da" stroke-width="1.2" stroke-linecap="round"/>',
  grill: '<path d="M4 4.6h16v3.2a5.6 5.6 0 0 1-5.6 5.6H9.6A5.6 5.6 0 0 1 4 7.8V4.6z" fill="#3f454e"/><path d="M7 4.6v8.4M12 4.6v8.8M17 4.6v8.4" fill="none" stroke="#6d7681" stroke-width="1.2"/><path d="m8.6 13.4-2.4 6M15.4 13.4l2.4 6" fill="none" stroke="#6d7681" stroke-width="2" stroke-linecap="round"/><path d="M10 2.6c0 1-.8 1.4-.8 2.4M14 2.6c0 1-.8 1.4-.8 2.4" fill="none" stroke="#f0a64a" stroke-width="1.3" stroke-linecap="round"/>',
  slowcooker: '<path d="M4.6 10.4h14.8v4.8a5 5 0 0 1-5 5h-4.8a5 5 0 0 1-5-5v-4.8z" fill="#a0553f"/><path d="M3 8.6h18v2H3z" fill="#6d3b2b"/><circle cx="12" cy="6.4" r="1.4" fill="#6d3b2b"/><path d="M7.4 14.4c1.2 1.4 3 2.2 4.6 2.2s3.4-.8 4.6-2.2" fill="none" stroke="#d68f74" stroke-width="1.3" stroke-linecap="round"/>',
  wok: '<path d="M2.6 10.4h18.8c0 4.4-4.2 7.6-9.4 7.6S2.6 14.8 2.6 10.4z" fill="#3f454e"/><path d="M4.6 11.4h14.8c-.4 3.2-3.6 5.4-7.4 5.4s-7-2.2-7.4-5.4z" fill="#6d7681"/><path d="M21.4 10.4h2.2M2.6 10.4H.4" fill="none" stroke="#a8683c" stroke-width="2" stroke-linecap="round"/>',
  rice_cooker: '<path d="M3.6 9.4h16.8v7.2a3.4 3.4 0 0 1-3.4 3.4H7a3.4 3.4 0 0 1-3.4-3.4V9.4z" fill="#cbd2da"/><path d="M2.6 7.4h18.8v2H2.6z" fill="#5a616b"/><rect x="8.4" y="12.4" width="7.2" height="3.4" rx="1" fill="#5a616b"/><circle cx="12" cy="5.6" r="1.2" fill="#5a616b"/>',
};

/** Monochromatyczne ikony interfejsu — rysowane `currentColor`. */
export const UI = {
  copy: '<rect x="8.4" y="3.6" width="11" height="13.6" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M15.6 20.4H6.8a2.2 2.2 0 0 1-2.2-2.2V7.6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  check: '<path d="m4.6 12.6 4.8 4.8 10-10.8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
  download: '<path d="M12 3.6v11.2m0 0 4.4-4.4M12 14.8l-4.4-4.4M4.4 17.4v1.4a1.6 1.6 0 0 0 1.6 1.6h12a1.6 1.6 0 0 0 1.6-1.6v-1.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  link: '<path d="M9.6 14.4a3.6 3.6 0 0 0 5.1 0l3.6-3.6a3.6 3.6 0 0 0-5.1-5.1l-1.2 1.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M14.4 9.6a3.6 3.6 0 0 0-5.1 0l-3.6 3.6a3.6 3.6 0 0 0 5.1 5.1l1.2-1.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  reset: '<path d="M4.6 12a7.4 7.4 0 1 0 2.2-5.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M4.2 3.6v4.2h4.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  sun: '<circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4 17 7M7 17l-1.6 1.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  moon: '<path d="M20 14.4A8.4 8.4 0 0 1 9.6 4a8.4 8.4 0 1 0 10.4 10.4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
  search: '<circle cx="10.6" cy="10.6" r="6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m15 15 4.6 4.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  close: '<path d="m5.6 5.6 12.8 12.8M18.4 5.6 5.6 18.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  keyboard: '<rect x="2.6" y="6.4" width="18.8" height="11.2" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M6.4 10h.01M10 10h.01M13.6 10h.01M17.2 10h.01M6.4 13.4h.01M17.2 13.4h.01M9 14h6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
  dice: '<rect x="4" y="4" width="16" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8.6 8.6h.01M15.4 8.6h.01M12 12h.01M8.6 15.4h.01M15.4 15.4h.01" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
  plus: '<path d="M12 5.4v13.2M5.4 12h13.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  minus: '<path d="M5.4 12h13.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  chevron: '<path d="m7.6 9.6 4.4 4.4 4.4-4.4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
  github: '<path d="M12 2.4a9.6 9.6 0 0 0-3 18.7c.5.1.7-.2.7-.5v-1.8c-2.7.6-3.2-1.2-3.2-1.2-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.1-.2-4.4-1.1-4.4-4.8 0-1.1.4-1.9 1-2.6-.1-.3-.4-1.3.1-2.6 0 0 .8-.3 2.6 1a9 9 0 0 1 4.8 0c1.8-1.3 2.6-1 2.6-1 .5 1.3.2 2.3.1 2.6.6.7 1 1.5 1 2.6 0 3.7-2.3 4.6-4.4 4.8.3.3.7 1 .7 1.9v2.8c0 .3.2.6.7.5A9.6 9.6 0 0 0 12 2.4z" fill="currentColor"/>',
  logo: '<rect width="24" height="24" rx="6" fill="#0b0b0c"/><path d="m6.6 8.4 3.6 3.6-3.6 3.6" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><rect x="12.6" y="13.6" width="5.4" height="2.4" rx="1.2" fill="#ee7f2d"/>',
};

/**
 * Buduje markup sprite'a: <symbol> per ikona, wstrzykiwany raz do <body>.
 * Prefiksy: `f-` dla jedzenia, `u-` dla UI.
 */
export function spriteMarkup() {
  const sym = (prefix, dict) =>
    Object.entries(dict)
      .map(([id, body]) => `<symbol id="${prefix}-${id}" viewBox="0 0 24 24">${body}</symbol>`)
      .join('');
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden">' +
    sym('f', FOOD) +
    sym('u', UI) +
    '</svg>'
  );
}

/** Zwraca <svg><use/></svg> dla ikony jedzenia. */
export function foodIcon(id, cls = 'ico') {
  const known = Object.hasOwn(FOOD, id) ? id : 'spices';
  return `<svg class="${cls}" aria-hidden="true"><use href="#f-${known}"/></svg>`;
}

/** Zwraca <svg><use/></svg> dla ikony UI. */
export function uiIcon(id, cls = 'ico') {
  return `<svg class="${cls}" aria-hidden="true"><use href="#u-${id}"/></svg>`;
}

/** Lista id-kow — uzywana w testach (kazdy produkt musi miec istniejaca ikone). */
export const FOOD_IDS = Object.keys(FOOD);
