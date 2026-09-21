/**
 * mini-dom.js — atrapa DOM-u na tyle duza, zeby uruchomic cala aplikacje
 * w Node i na tyle mala, zeby zmiescic sie w jednym pliku bez zaleznosci.
 *
 * Po co: bez tego jedyna weryfikacja warstwy UI byloby klikanie w przegladarce,
 * czyli „dziala u mnie". Tutaj `npm test` naprawde wykonuje renderSections()
 * dla calego schematu, buduje 60+ chipow spizarni, podpina store i sprawdza,
 * czy podglad promptu sie odswieza.
 *
 * Czego NIE robi: nie parsuje HTML-a i nie liczy stylow. Szkielet strony jest
 * odtwarzany z prawdziwego index.html — ale tylko jako zbior elementow z id
 * (patrz `skeletonFromHtml`). Zgodnosc index.html <-> main.js pilnuje osobno
 * test wiring.test.js.
 */

class ClassList {
  constructor() {
    this.set = new Set();
  }

  add(...names) {
    for (const name of names.filter(Boolean)) this.set.add(name);
  }

  remove(...names) {
    for (const name of names) this.set.delete(name);
  }

  contains(name) {
    return this.set.has(name);
  }

  toggle(name, force) {
    const on = force === undefined ? !this.set.has(name) : force;
    if (on) this.set.add(name);
    else this.set.delete(name);
    return on;
  }

  get value() {
    return [...this.set].join(' ');
  }
}

class FakeNode {
  constructor(tag) {
    this.nodeType = 1;
    this.tagName = String(tag).toUpperCase();
    this.children = [];
    this.parent = null;
    this.attributes = Object.create(null);
    this.dataset = Object.create(null);
    this.classList = new ClassList();
    this.listeners = new Map();
    this.style = {};
    this.value = '';
    this._text = '';
    this._html = '';
  }

  // —— drzewo ——
  append(...nodes) {
    for (const node of nodes) {
      node.parent = this;
      this.children.push(node);
    }
  }

  remove() {
    if (!this.parent) return;
    this.parent.children = this.parent.children.filter((child) => child !== this);
    this.parent = null;
  }

  insertAdjacentHTML(_position, html) {
    this._html += html;
  }

  // —— tresc ——
  get textContent() {
    if (this._text) return this._text;
    return this.children.map((child) => child.textContent ?? '').join('');
  }

  set textContent(value) {
    this._text = String(value);
    this.children = [];
  }

  get innerHTML() {
    return this._html;
  }

  set innerHTML(value) {
    this._html = String(value);
  }

  // —— atrybuty ——
  setAttribute(name, value) {
    this.attributes[name] = String(value);
    if (name.startsWith('data-')) {
      this.dataset[name.slice(5).replace(/-(.)/g, (_, c) => c.toUpperCase())] = String(value);
    }
  }

  getAttribute(name) {
    return this.attributes[name] ?? null;
  }

  removeAttribute(name) {
    delete this.attributes[name];
  }

  hasAttribute(name) {
    return name in this.attributes;
  }

  get hidden() {
    return this.attributes.hidden === 'true';
  }

  set hidden(value) {
    this.attributes.hidden = value ? 'true' : 'false';
  }

  // —— zdarzenia ——
  addEventListener(type, handler) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(handler);
  }

  removeEventListener(type, handler) {
    const list = this.listeners.get(type) ?? [];
    this.listeners.set(
      type,
      list.filter((fn) => fn !== handler)
    );
  }

  dispatch(type, event = {}) {
    for (const handler of this.listeners.get(type) ?? []) {
      handler({ type, target: this, preventDefault() {}, stopPropagation() {}, ...event });
    }
  }

  click() {
    this.dispatch('click');
  }

  focus() {
    globalThis.document.activeElement = this;
  }

  blur() {
    globalThis.document.activeElement = null;
  }

  select() {
    this.selected = true;
  }

  // —— <dialog> ——
  showModal() {
    this.open = true;
  }

  close() {
    this.open = false;
  }

  // —— wyszukiwanie ——
  walk(visit) {
    for (const child of this.children) {
      if (child.nodeType !== 1) continue;
      visit(child);
      child.walk(visit);
    }
  }

  querySelectorAll(selector) {
    const found = [];
    this.walk((node) => {
      if (matches(node, selector)) found.push(node);
    });
    return found;
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] ?? null;
  }
}

/** Obslugiwane selektory: #id, .klasa, tag, [atrybut]. */
function matches(node, selector) {
  const sel = selector.trim();
  if (sel.startsWith('#')) return node.attributes.id === sel.slice(1);
  if (sel.startsWith('.')) return node.classList.contains(sel.slice(1));
  if (sel.startsWith('[') && sel.endsWith(']')) return sel.slice(1, -1) in node.attributes;
  return node.tagName === sel.toUpperCase();
}

class FakeText {
  constructor(text) {
    this.nodeType = 3;
    this.textContent = String(text);
  }
}

/** Wyciaga z prawdziwego index.html liste id-kow i atrybutow data-icon. */
export function skeletonFromHtml(html) {
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const icons = [...html.matchAll(/data-icon="([^"]+)"/g)].map((match) => match[1]);
  return { ids, icons };
}

/**
 * Instaluje atrape DOM-u w globalThis i buduje szkielet strony
 * na podstawie id-kow znalezionych w prawdziwym index.html.
 */
export function installDom(html) {
  const document = {
    activeElement: null,
    listeners: new Map(),
    createElement: (tag) => new FakeNode(tag),
    createTextNode: (text) => new FakeText(text),
    addEventListener(type, handler) {
      if (!this.listeners.has(type)) this.listeners.set(type, []);
      this.listeners.get(type).push(handler);
    },
    dispatch(type, event = {}) {
      for (const handler of this.listeners.get(type) ?? []) {
        handler({ type, preventDefault() {}, ...event });
      }
    },
    execCommand: () => true,
  };

  document.body = new FakeNode('body');
  document.documentElement = new FakeNode('html');
  document.querySelector = (selector) => document.body.querySelector(selector);
  document.querySelectorAll = (selector) => document.body.querySelectorAll(selector);

  const { ids, icons } = skeletonFromHtml(html);
  for (const id of ids) {
    const node = new FakeNode(id === 'prompt' ? 'textarea' : id === 'help' ? 'dialog' : 'div');
    node.setAttribute('id', id);
    document.body.append(node);
  }
  for (const icon of icons) {
    const node = new FakeNode('span');
    node.setAttribute('data-icon', icon);
    document.body.append(node);
  }

  const store = new Map();
  const localStorage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };

  // Uwaga: `navigator` w nowym Node jest wlasnoscia tylko do odczytu,
  // a `location` w ogole nie istnieje — stad defineProperty zamiast Object.assign.
  const globals = {
    document,
    window: globalThis,
    localStorage,
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    history: { replaceState() {} },
    location: { hash: '', pathname: '/', search: '', origin: 'http://localhost:5173' },
    navigator: { clipboard: { writeText: async () => {} } },
    isSecureContext: true,
  };
  for (const [name, value] of Object.entries(globals)) {
    Object.defineProperty(globalThis, name, { value, writable: true, configurable: true });
  }

  return { document, localStorage, ids, icons };
}
