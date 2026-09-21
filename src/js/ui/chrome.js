/**
 * chrome.js — drobiazgi wokol wlasciwej aplikacji: motyw, powiadomienia,
 * kopiowanie do schowka i pobieranie pliku.
 *
 * Wydzielone razem, bo to jedyne miejsca, ktore dotykaja API przegladarki
 * potrafiacych zawiesc (schowek bez HTTPS, localStorage w trybie prywatnym).
 * Kazde z nich ma wariant awaryjny — apka nigdy nie ma "nie dzialac".
 */

import { THEME_KEY } from '../persist.js';
import { h } from './dom.js';

// ——— motyw ——————————————————————————————————————————————————

/**
 * Motyw ma trzy stany: 'auto' (za systemem), 'light', 'dark'.
 * 'auto' jest domyslny i nie zapisuje niczego — dzieki temu apka
 * przy pierwszym uruchomieniu wyglada tak, jak reszta systemu.
 */
export function createTheme(button) {
  const root = document.documentElement;

  const read = () => {
    try {
      return localStorage.getItem(THEME_KEY) ?? 'auto';
    } catch {
      return 'auto';
    }
  };

  const apply = (mode) => {
    if (mode === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', mode);
    if (button) {
      const dark = mode === 'dark' || (mode === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
      button.dataset.mode = mode;
      button.setAttribute('aria-label', `Motyw: ${mode === 'auto' ? 'systemowy' : mode === 'dark' ? 'ciemny' : 'jasny'}`);
      button.classList.toggle('is-dark', dark);
    }
  };

  const set = (mode) => {
    try {
      if (mode === 'auto') localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, mode);
    } catch {
      /* trudno, zostanie na jedna sesje */
    }
    apply(mode);
  };

  apply(read());

  return {
    current: read,
    set,
    /** auto -> light -> dark -> auto */
    cycle() {
      const order = ['auto', 'light', 'dark'];
      const next = order[(order.indexOf(read()) + 1) % order.length];
      set(next);
      return next;
    },
  };
}

// ——— powiadomienia ————————————————————————————————————————————

let toastHost = null;

export function toast(message, tone = 'ok') {
  if (!toastHost) {
    toastHost = h('div.toasts', { role: 'status', 'aria-live': 'polite' });
    document.body.append(toastHost);
  }
  const node = h('div.toast', { class: `toast--${tone}`, text: message });
  toastHost.append(node);
  setTimeout(() => node.classList.add('is-out'), 2200);
  setTimeout(() => node.remove(), 2600);
}

// ——— schowek ——————————————————————————————————————————————————

/**
 * Kopiuje tekst. navigator.clipboard wymaga bezpiecznego kontekstu
 * (https lub localhost), wiec przy otwarciu pliku z dysku leci fallback
 * przez ukryta <textarea> i document.execCommand('copy').
 */
export async function copyText(text) {
  try {
    if (navigator.clipboard && globalThis.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* lecimy dalej, do wariantu awaryjnego */
  }

  try {
    const helper = h('textarea', {
      style: 'position:fixed;top:-1000px;left:-1000px;opacity:0',
      'aria-hidden': 'true',
    });
    helper.value = text;
    document.body.append(helper);
    helper.select();
    const ok = document.execCommand('copy');
    helper.remove();
    return ok;
  } catch {
    return false;
  }
}

// ——— pobieranie pliku ————————————————————————————————————————

export function downloadFile(filename, content, type = 'text/markdown;charset=utf-8') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = h('a', { href: url, download: filename });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Wczytuje plik tekstowy wybrany przez uzytkownika. */
export function pickTextFile(accept = '.json,application/json') {
  return new Promise((resolve) => {
    const input = h('input', { type: 'file', accept, style: 'display:none' });
    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      resolve(file ? await file.text() : null);
      input.remove();
    });
    document.body.append(input);
    input.click();
  });
}
