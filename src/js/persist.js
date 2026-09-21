/**
 * persist.js — pamiec aplikacji: localStorage + link do udostepniania.
 *
 * Trzy rzeczy, ktore warto wiedziec:
 *  1. Zapisujemy RÓŻNICĘ wzgledem stanu domyslnego, nie caly stan. Dzieki temu
 *     link ma ~100 znakow zamiast ~900, a dopisanie nowego pola z domyslna
 *     wartoscia nie uniewaznia zapisanych wczesniej ustawien.
 *  2. Base64 z btoa() nie przyjmuje polskich znakow, wiec najpierw kodujemy
 *     tekst do UTF-8 bajtow. Do tego wariant URL-safe (-, _, bez '='),
 *     zeby link dalo sie wkleic gdziekolwiek.
 *  3. Kazdy odczyt przechodzi przez sanitize() w state.js — dane z URL-a sa
 *     traktowane jak wrogie.
 */

import { DEFAULTS, defaultState, sanitize } from './state.js';

export const STORAGE_KEY = 'stdmeal.state.v1';
export const THEME_KEY = 'stdmeal.theme';

/** Rekurencyjna roznica: zwraca tylko to, co odbiega od domyslnych wartosci. */
export function diffFromDefaults(state, defaults = DEFAULTS) {
  const out = {};
  for (const [key, fallback] of Object.entries(defaults)) {
    const value = state?.[key];
    if (Array.isArray(fallback)) {
      const a = JSON.stringify([...(value ?? [])].sort());
      const b = JSON.stringify([...fallback].sort());
      if (a !== b) out[key] = value;
    } else if (fallback !== null && typeof fallback === 'object') {
      const nested = diffFromDefaults(value ?? {}, fallback);
      if (Object.keys(nested).length > 0) out[key] = nested;
    } else if (value !== fallback) {
      out[key] = value;
    }
  }
  return out;
}

// ——— localStorage ————————————————————————————————————————————

export function saveLocal(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(diffFromDefaults(state)));
    return true;
  } catch {
    // prywatne okno / wylaczone ciasteczka / pelny quota — apka ma dzialac dalej
    return false;
  }
}

export function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return sanitize(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function clearLocal() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nic nie szkodzi */
  }
}

// ——— link do udostepniania ————————————————————————————————————

function toBase64Url(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** Stan -> fragment URL-a (bez '#'). */
export function encodeState(state) {
  return toBase64Url(JSON.stringify(diffFromDefaults(state)));
}

/** Fragment URL-a -> stan (lub null, gdy sie nie da odczytac). */
export function decodeState(fragment) {
  try {
    const raw = String(fragment ?? '').replace(/^#/, '').replace(/^s=/, '');
    if (!raw) return null;
    return sanitize(JSON.parse(fromBase64Url(raw)));
  } catch {
    return null;
  }
}

/** Pelny link do biezacego stanu. */
export function shareUrl(state, location = globalThis.location) {
  const base = `${location.origin}${location.pathname}${location.search}`;
  return `${base}#s=${encodeState(state)}`;
}

/** Stan z adresu, jesli jest — uzywane przy starcie. */
export function stateFromLocation(location = globalThis.location) {
  if (!location?.hash) return null;
  return decodeState(location.hash);
}

// ——— import / eksport pliku ————————————————————————————————————

export function toJsonFile(state) {
  return `${JSON.stringify({ app: 'stdmeal', ...diffFromDefaults(state) }, null, 2)}\n`;
}

export function fromJsonFile(text) {
  try {
    const parsed = JSON.parse(text);
    delete parsed.app;
    return sanitize(parsed);
  } catch {
    return null;
  }
}

/** Stan startowy: URL > localStorage > domyslny. */
export function initialState() {
  return stateFromLocation() ?? loadLocal() ?? defaultState();
}
