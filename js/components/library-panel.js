/**
 * Library Panel - Left sidebar component palette with drag support.
 */
import { COMPONENT_CATEGORIES } from '../core/constants.js';

export class LibraryPanel {
  constructor(state, eventBus, registry, dragDropManager) {
    this._state = state;
    this._bus = eventBus;
    this._registry = registry;
    this._dragDrop = dragDropManager;
    this._container = null;
    this._searchTerm = '';
  }

  mount(containerEl) {
    this._container = containerEl;
    this._render();
  }

  _render() {
    if (!this._container) return;
    this._container.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'library-header';
    header.innerHTML = '<h2 class="library-title">Components</h2>';
    this._container.appendChild(header);

    const search = document.createElement('div');
    search.className = 'library-search';
    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.placeholder = 'Search components...';
    searchInput.setAttribute('aria-label', 'Search components');
    searchInput.className = 'library-search-input';
    searchInput.addEventListener('input', (e) => {
      this._searchTerm = e.target.value.toLowerCase();
      this._renderCategories();
    });
    search.appendChild(searchInput);
    this._container.appendChild(search);

    this._categoriesContainer = document.createElement('div');
    this._categoriesContainer.className = 'library-categories';
    this._categoriesContainer.setAttribute('role', 'list');
    this._categoriesContainer.setAttribute('aria-label', 'Component categories');
    this._container.appendChild(this._categoriesContainer);

    this._renderCategories();
  }

  _renderCategories() {
    this._categoriesContainer.innerHTML = '';

    for (const category of COMPONENT_CATEGORIES) {
      const components = this._registry.getByCategory(category.id);
      const filtered = this._searchTerm
        ? components.filter(c => c.label.toLowerCase().includes(this._searchTerm) || c.type.toLowerCase().includes(this._searchTerm))
        : components;

      if (filtered.length === 0) continue;

      const section = document.createElement('details');
      section.className = 'library-category';
      section.open = true;
      section.setAttribute('role', 'listitem');

      const summary = document.createElement('summary');
      summary.className = 'library-category-header';
      summary.innerHTML = `<span class="category-label">${category.label}</span> <span class="badge">${filtered.length}</span>`;
      section.appendChild(summary);

      const grid = document.createElement('div');
      grid.className = 'library-grid';

      for (const comp of filtered) {
        const item = document.createElement('div');
        item.className = 'library-item';
        item.setAttribute('role', 'option');
        item.setAttribute('tabindex', '0');
        item.setAttribute('aria-label', `${comp.label} component. Drag to add to canvas.`);
        item.dataset.type = comp.type;

        item.innerHTML = `
          <span class="library-item-icon" aria-hidden="true">
            ${this._getIconForType(comp.type)}
          </span>
          <span class="library-item-label">${comp.label}</span>
        `;

        this._dragDrop.setupDraggableItem(item, comp.type);

        item.addEventListener('dblclick', () => {
          this._addToCanvas(comp.type);
        });

        item.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            this._addToCanvas(comp.type);
          }
        });

        grid.appendChild(item);
      }

      section.appendChild(grid);
      this._categoriesContainer.appendChild(section);
    }
  }

  _addToCanvas(type) {
    const def = this._registry.get(type);
    if (!def) return;

    const { createComponentNode } = this._state.constructor === Object
      ? { createComponentNode: null }
      : (() => { return { createComponentNode: null }; })();

    this._bus.emit('component:request-add', { type, props: { ...def.defaultProps } });
  }

  _getIconForType(type) {
    const icons = {
      'section': '☐', 'div-container': '▣', 'flex-row': '⇔', 'flex-column': '⇕',
      'grid': '⊞', 'article': '📄', 'aside': '▤',
      'heading': 'H', 'paragraph': '¶', 'blockquote': '"', 'unordered-list': '•',
      'ordered-list': '#', 'code-block': '{ }', 'separator': '—',
      'nav': '☰', 'skip-link': '⏭', 'breadcrumb': '>', 'pagination': '«»',
      'text-input': '▭', 'textarea': '▯', 'select': '▾', 'checkbox': '☑',
      'radio-group': '◉', 'form-button': '▶',
      'image': '🖼', 'figure': '⊡', 'video': '▶', 'audio': '♪',
      'button': '⬜', 'link': '🔗', 'accordion': '▼', 'tabs': '⊟',
      'dialog-trigger': '◱', 'tooltip-trigger': '💬',
      'header-landmark': '▔', 'nav-landmark': '☰', 'main-landmark': '◼',
      'footer-landmark': '▁', 'search-landmark': '🔍', 'complementary-landmark': '◧',
      'page': '📃'
    };
    return icons[type] || '◻';
  }
}
