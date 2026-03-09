/**
 * HeadingMap - Heading hierarchy visualization panel (HeadingsMap-like).
 */
export class HeadingMap {
  constructor(state, eventBus, canvasController) {
    this._state = state;
    this._bus = eventBus;
    this._canvas = canvasController;
    this._container = null;

    this._bus.on('canvas:rendered', () => this.refresh());
    this._bus.on('audit:complete', () => this.refresh());
  }

  mount(containerEl) {
    this._container = containerEl;
    this.refresh();
  }

  refresh() {
    if (!this._container) return;
    const doc = this._canvas.getIframeDoc();
    if (!doc) return;

    const headings = this._collectHeadings(doc);
    this._state.headingMap = headings;
    this._render(headings);
  }

  _collectHeadings(doc) {
    const headings = [];
    const elements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]');
    let prevLevel = 0;

    for (const el of elements) {
      if (el.classList.contains('am-audit-icon')) continue;

      let level;
      if (el.getAttribute('role') === 'heading') {
        level = parseInt(el.getAttribute('aria-level') || '2');
      } else {
        level = parseInt(el.tagName[1]);
      }

      const errors = [];
      if (!el.textContent.trim()) errors.push('empty');
      if (prevLevel > 0 && level > prevLevel + 1) errors.push('skipped-level');

      headings.push({
        level,
        text: el.textContent.trim() || '(empty)',
        element: el,
        nodeId: el.dataset?.amId || null,
        tag: el.tagName.toLowerCase(),
        errors
      });

      prevLevel = level;
    }

    return headings;
  }

  _render(headings) {
    this._container.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'panel-section-header';
    header.innerHTML = `<h3>Heading Structure</h3><span class="badge">${headings.length}</span>`;
    this._container.appendChild(header);

    if (headings.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'panel-empty';
      empty.textContent = 'No headings found. Add headings to create a document outline.';
      this._container.appendChild(empty);
      return;
    }

    const list = document.createElement('div');
    list.className = 'heading-map-list';
    list.setAttribute('role', 'tree');
    list.setAttribute('aria-label', 'Heading structure');

    const levelColors = {
      1: '#e53935', 2: '#fb8c00', 3: '#43a047',
      4: '#1e88e5', 5: '#8e24aa', 6: '#546e7a'
    };

    for (const heading of headings) {
      const item = document.createElement('div');
      item.className = 'heading-map-item';
      item.setAttribute('role', 'treeitem');
      item.setAttribute('tabindex', '0');
      item.style.paddingLeft = ((heading.level - 1) * 20 + 12) + 'px';

      const badge = document.createElement('span');
      badge.className = 'heading-level-badge';
      badge.textContent = `H${heading.level}`;
      badge.style.background = levelColors[heading.level] || '#666';
      badge.style.color = '#fff';
      badge.style.padding = '1px 6px';
      badge.style.borderRadius = '3px';
      badge.style.fontSize = '11px';
      badge.style.fontWeight = '700';
      badge.style.marginRight = '8px';
      badge.style.display = 'inline-block';
      badge.style.minWidth = '28px';
      badge.style.textAlign = 'center';

      const text = document.createElement('span');
      text.className = 'heading-map-text';
      text.textContent = heading.text;

      item.appendChild(badge);
      item.appendChild(text);

      if (heading.errors.length > 0) {
        const errorBadge = document.createElement('span');
        errorBadge.className = 'heading-error-badge';
        errorBadge.textContent = heading.errors.join(', ');
        errorBadge.style.marginLeft = '8px';
        errorBadge.style.color = '#d32f2f';
        errorBadge.style.fontSize = '11px';
        errorBadge.style.fontWeight = '600';
        item.appendChild(errorBadge);
      }

      item.addEventListener('click', () => {
        if (heading.nodeId) {
          this._state.setSelection([heading.nodeId]);
        }
        heading.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        heading.element.classList.add('am-selected');
        setTimeout(() => heading.element.classList.remove('am-selected'), 2000);
      });

      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          item.click();
        }
      });

      list.appendChild(item);
    }

    this._container.appendChild(list);
  }
}
