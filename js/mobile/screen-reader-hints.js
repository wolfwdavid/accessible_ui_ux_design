/**
 * Screen Reader Hints - Simulates what a screen reader would announce.
 */
import { IMPLICIT_ROLES } from '../core/constants.js';
import { getAccessibleName, isFocusable, isVisible } from '../core/dom-utils.js';

export class ScreenReaderHints {
  constructor(state, eventBus, canvasController) {
    this._state = state;
    this._bus = eventBus;
    this._canvas = canvasController;
    this._container = null;
  }

  mount(containerEl) {
    this._container = containerEl;
    this._bus.on('canvas:rendered', () => this.refresh());
    this.refresh();
  }

  refresh() {
    if (!this._container) return;
    const doc = this._canvas.getIframeDoc();
    if (!doc) return;

    this._container.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'panel-section-header';
    header.innerHTML = '<h3>Screen Reader Output</h3>';
    this._container.appendChild(header);

    const desc = document.createElement('p');
    desc.className = 'panel-description';
    desc.textContent = 'Simulated announcements in reading order:';
    this._container.appendChild(desc);

    const list = document.createElement('div');
    list.className = 'sr-hints-list';
    list.setAttribute('role', 'log');
    list.setAttribute('aria-label', 'Screen reader announcements');

    const announcements = this._buildAnnouncements(doc.body);

    if (announcements.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'panel-empty';
      empty.textContent = 'No content to announce.';
      list.appendChild(empty);
    } else {
      for (const ann of announcements) {
        const item = document.createElement('div');
        item.className = `sr-hint-item sr-hint-${ann.type}`;

        const typeLabel = document.createElement('span');
        typeLabel.className = 'sr-hint-type';
        typeLabel.textContent = ann.type;

        const text = document.createElement('span');
        text.className = 'sr-hint-text';
        text.textContent = ann.announcement;

        item.appendChild(typeLabel);
        item.appendChild(text);

        if (ann.element?.dataset?.amId) {
          item.setAttribute('tabindex', '0');
          item.addEventListener('click', () => {
            this._state.setSelection([ann.element.dataset.amId]);
          });
          item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              item.click();
            }
          });
        }

        list.appendChild(item);
      }
    }

    this._container.appendChild(list);
  }

  _buildAnnouncements(element) {
    const announcements = [];
    this._traverse(element, announcements);
    return announcements;
  }

  _traverse(element, announcements) {
    if (!element || element.nodeType !== 1) return;
    if (!isVisible(element)) return;
    if (element.getAttribute('aria-hidden') === 'true') return;
    if (element.classList?.contains('am-audit-icon') ||
        element.classList?.contains('am-focus-badge') ||
        element.classList?.contains('am-touch-overlay')) return;

    const tag = element.tagName.toLowerCase();
    const role = element.getAttribute('role') || IMPLICIT_ROLES[tag];
    const name = getAccessibleName(element);

    if (tag.match(/^h[1-6]$/)) {
      announcements.push({
        type: 'heading',
        announcement: `Heading level ${tag[1]}: ${name || '(empty)'}`,
        element
      });
      return;
    }

    if (role === 'banner' || tag === 'header') {
      announcements.push({ type: 'landmark', announcement: `Banner${name ? ': ' + name : ''}`, element });
    } else if (role === 'navigation' || tag === 'nav') {
      announcements.push({ type: 'landmark', announcement: `Navigation${name ? ': ' + name : ''}`, element });
    } else if (role === 'main' || tag === 'main') {
      announcements.push({ type: 'landmark', announcement: `Main${name ? ': ' + name : ''}`, element });
    } else if (role === 'contentinfo' || (tag === 'footer' && !element.closest('article, section'))) {
      announcements.push({ type: 'landmark', announcement: `Content info${name ? ': ' + name : ''}`, element });
    } else if (role === 'complementary' || tag === 'aside') {
      announcements.push({ type: 'landmark', announcement: `Complementary${name ? ': ' + name : ''}`, element });
    }

    if (tag === 'button' || role === 'button') {
      const state = element.disabled ? ', disabled' : '';
      announcements.push({ type: 'interactive', announcement: `Button: ${name || '(no label)'}${state}`, element });
      return;
    }

    if (tag === 'a' && element.hasAttribute('href')) {
      announcements.push({ type: 'interactive', announcement: `Link: ${name || '(no text)'}`, element });
      return;
    }

    if (tag === 'img') {
      const alt = element.getAttribute('alt');
      if (alt === '') return;
      if (alt) {
        announcements.push({ type: 'content', announcement: `Image: ${alt}`, element });
      } else {
        announcements.push({ type: 'error', announcement: 'Image: (no alt text)', element });
      }
      return;
    }

    if (['input', 'select', 'textarea'].includes(tag)) {
      const type = element.type || 'text';
      const required = element.required ? ', required' : '';
      announcements.push({
        type: 'interactive',
        announcement: `${type} input: ${name || '(no label)'}${required}`,
        element
      });
      return;
    }

    if (tag === 'ul' || tag === 'ol') {
      const itemCount = element.querySelectorAll(':scope > li').length;
      announcements.push({ type: 'structure', announcement: `List, ${itemCount} items`, element });
    }

    for (const child of element.childNodes) {
      if (child.nodeType === 3) {
        const text = child.textContent.trim();
        if (text) {
          announcements.push({ type: 'content', announcement: text, element: child.parentElement });
        }
      } else if (child.nodeType === 1) {
        this._traverse(child, announcements);
      }
    }
  }
}
