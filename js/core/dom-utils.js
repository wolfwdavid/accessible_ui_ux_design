/**
 * DOM Utilities - Helper functions for DOM manipulation and inspection.
 */
import { IMPLICIT_ROLES } from './constants.js';

export function el(tag, attrs = {}, children = []) {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'dataset') {
      Object.assign(element.dataset, value);
    } else if (key.startsWith('on')) {
      element.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'innerHTML') {
      element.innerHTML = value;
    } else if (key === 'textContent') {
      element.textContent = value;
    } else {
      element.setAttribute(key, value);
    }
  }
  for (const child of children) {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      element.appendChild(child);
    }
  }
  return element;
}

export function getComputedBg(element) {
  let current = element;
  while (current && current !== current.ownerDocument.documentElement) {
    const bg = getComputedStyle(current).backgroundColor;
    if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
      return bg;
    }
    current = current.parentElement;
  }
  return 'rgb(255, 255, 255)';
}

export function isVisible(element) {
  const style = getComputedStyle(element);
  return style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    element.getAttribute('aria-hidden') !== 'true';
}

export function isFocusable(element) {
  const tag = element.tagName.toLowerCase();
  const tabindex = element.getAttribute('tabindex');
  const focusableTags = ['a', 'button', 'input', 'select', 'textarea', 'details', 'summary'];

  if (element.disabled) return false;
  if (tabindex !== null && parseInt(tabindex) >= 0) return true;
  if (focusableTags.includes(tag)) {
    if (tag === 'a' && !element.hasAttribute('href')) return false;
    return true;
  }
  if (element.hasAttribute('contenteditable')) return true;
  return false;
}

export function getAccessibleName(element) {
  if (element.getAttribute('aria-label')) {
    return element.getAttribute('aria-label');
  }

  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const doc = element.ownerDocument || document;
    const labels = labelledBy.split(/\s+/).map(id => {
      const el = doc.getElementById(id);
      return el ? el.textContent.trim() : '';
    });
    const name = labels.filter(Boolean).join(' ');
    if (name) return name;
  }

  const tag = element.tagName.toLowerCase();
  if (tag === 'input' || tag === 'select' || tag === 'textarea') {
    const id = element.id;
    if (id) {
      const doc = element.ownerDocument || document;
      const label = doc.querySelector(`label[for="${id}"]`);
      if (label) return label.textContent.trim();
    }
    const parentLabel = element.closest('label');
    if (parentLabel) return parentLabel.textContent.trim();
  }

  if (tag === 'img') return element.getAttribute('alt') || '';

  if (element.getAttribute('title')) return element.getAttribute('title');

  return element.textContent?.trim() || '';
}

export function getImplicitRole(element) {
  const tag = element.tagName.toLowerCase();
  const type = element.getAttribute('type');

  if (tag === 'input' && type) {
    const key = `${tag}[type="${type}"]`;
    return IMPLICIT_ROLES[key] || IMPLICIT_ROLES[tag] || null;
  }

  return IMPLICIT_ROLES[tag] || null;
}

export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export function formatHtml(html, indent = 2) {
  let result = '';
  let level = 0;
  const pad = (n) => ' '.repeat(n * indent);

  const lines = html
    .replace(/>\s*</g, '>\n<')
    .split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('</')) {
      level = Math.max(0, level - 1);
      result += pad(level) + trimmed + '\n';
    } else if (trimmed.match(/^<[^/!][^>]*[^/]>/) && !trimmed.match(/<\/[^>]+>$/)) {
      result += pad(level) + trimmed + '\n';
      level++;
    } else {
      result += pad(level) + trimmed + '\n';
    }
  }

  return result.trim();
}
