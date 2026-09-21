/**
 * dom.js — trzy funkcje zamiast frameworka.
 *
 * Cala aplikacja to jeden ekran z kilkudziesiecioma kontrolkami, ktore
 * renderuja sie raz, a potem tylko synchronizuja swoj stan (`aria-pressed`,
 * `value`, `hidden`). Przy tej skali React byloby 40 kB zaleznosci po to,
 * zeby uniknac tych trzydziestu linii.
 */

/**
 * Tworzy element.
 * @param {string} tag - nazwa tagu, opcjonalnie z klasami: "button.chip.is-big"
 * @param {object} [props] - atrybuty; `class`, `text`, `html`, `on` traktowane specjalnie
 * @param {Array<Node|string>} [children]
 */
export function h(tag, props = {}, children = []) {
  const [name, ...classes] = tag.split('.');
  const node = document.createElement(name);
  if (classes.length) node.classList.add(...classes);

  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === 'class') node.classList.add(...String(value).split(' ').filter(Boolean));
    else if (key === 'text') node.textContent = value;
    else if (key === 'html') node.innerHTML = value;
    else if (key === 'on') for (const [event, fn] of Object.entries(value)) node.addEventListener(event, fn);
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (value === true) node.setAttribute(key, '');
    else node.setAttribute(key, String(value));
  }

  for (const child of [].concat(children)) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return node;
}

export const qs = (selector, root = document) => root.querySelector(selector);
export const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

/** Ucieczka dla tekstu wstawianego przez innerHTML. */
export function escapeHtml(text) {
  return String(text ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]);
}

/** Odklada wywolanie — uzywane przy zapisie do localStorage i URL-a. */
export function debounce(fn, ms = 250) {
  let timer = 0;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
