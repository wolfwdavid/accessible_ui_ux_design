/**
 * Properties Panel - Right sidebar property editor for selected elements.
 */
import { AriaManager } from '../accessibility/aria-manager.js';

export class PropertiesPanel {
  constructor(state, eventBus, registry) {
    this._state = state;
    this._bus = eventBus;
    this._registry = registry;
    this._ariaManager = new AriaManager(state, eventBus);
    this._container = null;

    this._bus.on('selection:changed', () => this._render());
    this._bus.on('state:selection', () => this._render());
  }

  mount(containerEl) {
    this._container = containerEl;
    this._render();
  }

  _render() {
    if (!this._container) return;
    this._container.innerHTML = '';

    const selection = this._state.selection || this._state._state?.selection || [];
    if (selection.length === 0) {
      this._renderEmpty();
      return;
    }

    if (selection.length > 1) {
      this._renderMulti(selection);
      return;
    }

    const nodeId = selection[0];
    const node = this._state.findNodeById(nodeId);
    if (!node) {
      this._renderEmpty();
      return;
    }

    const def = this._registry.get(node.type);

    const header = document.createElement('div');
    header.className = 'props-header';
    header.innerHTML = `<h3 class="props-title">${def?.label || node.type}</h3><span class="props-type">${node.type}</span>`;
    this._container.appendChild(header);

    this._renderContentProps(node, def);
    this._renderStyleProps(node);

    const ariaSection = document.createElement('div');
    ariaSection.className = 'props-aria-section';
    this._container.appendChild(ariaSection);
    this._ariaManager.renderAriaSection(ariaSection, nodeId);

    this._renderActions(node);
  }

  _renderEmpty() {
    const empty = document.createElement('div');
    empty.className = 'props-empty';
    empty.innerHTML = `
      <div class="props-empty-icon" aria-hidden="true">◻</div>
      <p>Select an element on the canvas to edit its properties.</p>
      <p class="props-hint">Double-click a component in the left panel to add it to the canvas.</p>
    `;
    this._container.appendChild(empty);
  }

  _renderMulti(selection) {
    const info = document.createElement('div');
    info.className = 'props-multi';
    info.innerHTML = `<p>${selection.length} elements selected</p>`;
    this._container.appendChild(info);
  }

  _renderContentProps(node, def) {
    const section = document.createElement('div');
    section.className = 'props-section';

    const title = document.createElement('h4');
    title.className = 'props-section-title';
    title.textContent = 'Content';
    section.appendChild(title);

    const props = { ...(def?.defaultProps || {}), ...node.props };

    for (const [key, value] of Object.entries(props)) {
      if (key === 'items' || key === 'tabs' || key === 'links' || key === 'options') {
        this._renderArrayProp(section, node, key, value);
        continue;
      }

      const group = document.createElement('div');
      group.className = 'form-field';

      const label = document.createElement('label');
      label.textContent = this._formatLabel(key);
      label.setAttribute('for', `prop-${key}`);

      let input;
      if (typeof value === 'boolean') {
        input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = node.props[key] ?? value;
        input.addEventListener('change', () => {
          this._state.updateNodeProps(node.id, { [key]: input.checked });
        });
      } else if (key === 'level') {
        input = document.createElement('select');
        for (let i = 1; i <= 6; i++) {
          const opt = document.createElement('option');
          opt.value = String(i);
          opt.textContent = `H${i}`;
          if (i === (node.props[key] ?? value)) opt.selected = true;
          input.appendChild(opt);
        }
        input.addEventListener('change', () => {
          this._state.updateNodeProps(node.id, { [key]: parseInt(input.value) });
        });
      } else if (key === 'variant') {
        input = document.createElement('select');
        ['primary', 'secondary', 'outline'].forEach(v => {
          const opt = document.createElement('option');
          opt.value = v;
          opt.textContent = v.charAt(0).toUpperCase() + v.slice(1);
          if (v === (node.props[key] ?? value)) opt.selected = true;
          input.appendChild(opt);
        });
        input.addEventListener('change', () => {
          this._state.updateNodeProps(node.id, { [key]: input.value });
        });
      } else if (key === 'type' && node.type === 'text-input') {
        input = document.createElement('select');
        ['text', 'email', 'password', 'tel', 'url', 'search', 'number', 'date'].forEach(t => {
          const opt = document.createElement('option');
          opt.value = t;
          opt.textContent = t;
          if (t === (node.props[key] ?? value)) opt.selected = true;
          input.appendChild(opt);
        });
        input.addEventListener('change', () => {
          this._state.updateNodeProps(node.id, { [key]: input.value });
        });
      } else if (typeof value === 'number') {
        input = document.createElement('input');
        input.type = 'number';
        input.value = node.props[key] ?? value;
        input.addEventListener('change', () => {
          this._state.updateNodeProps(node.id, { [key]: parseFloat(input.value) });
        });
      } else {
        input = document.createElement('input');
        input.type = 'text';
        input.value = node.props[key] ?? value ?? '';
        input.addEventListener('change', () => {
          this._state.updateNodeProps(node.id, { [key]: input.value });
        });
      }

      input.id = `prop-${key}`;
      input.className = 'prop-input';

      group.appendChild(label);
      group.appendChild(input);
      section.appendChild(group);
    }

    this._container.appendChild(section);
  }

  _renderArrayProp(container, node, key, value) {
    const items = node.props[key] || value || [];
    const group = document.createElement('div');
    group.className = 'form-field prop-array';

    const label = document.createElement('label');
    label.textContent = this._formatLabel(key);
    label.style.fontWeight = '600';
    group.appendChild(label);

    const textarea = document.createElement('textarea');
    textarea.rows = Math.min(items.length + 1, 8);
    textarea.className = 'prop-input';
    textarea.value = Array.isArray(items) && typeof items[0] === 'string'
      ? items.join('\n')
      : JSON.stringify(items, null, 2);
    textarea.addEventListener('change', () => {
      try {
        let parsed;
        if (textarea.value.trim().startsWith('[')) {
          parsed = JSON.parse(textarea.value);
        } else {
          parsed = textarea.value.split('\n').filter(Boolean);
        }
        this._state.updateNodeProps(node.id, { [key]: parsed });
      } catch (e) {
        textarea.style.borderColor = '#d32f2f';
      }
    });
    group.appendChild(textarea);
    container.appendChild(group);
  }

  _renderStyleProps(node) {
    const section = document.createElement('div');
    section.className = 'props-section';

    const title = document.createElement('h4');
    title.className = 'props-section-title';
    title.textContent = 'Styles';
    section.appendChild(title);

    const styleProps = [
      { key: 'color', label: 'Text Color', type: 'color' },
      { key: 'backgroundColor', label: 'Background', type: 'color' },
      { key: 'fontSize', label: 'Font Size', type: 'text', placeholder: '16px' },
      { key: 'fontWeight', label: 'Font Weight', type: 'select', options: ['', 'normal', '600', '700', '800'] },
      { key: 'padding', label: 'Padding', type: 'text', placeholder: '16px' },
      { key: 'margin', label: 'Margin', type: 'text', placeholder: '0' },
      { key: 'borderRadius', label: 'Border Radius', type: 'text', placeholder: '4px' },
      { key: 'textAlign', label: 'Text Align', type: 'select', options: ['', 'left', 'center', 'right'] },
      { key: 'maxWidth', label: 'Max Width', type: 'text', placeholder: 'none' }
    ];

    for (const prop of styleProps) {
      const group = document.createElement('div');
      group.className = 'form-field';

      const label = document.createElement('label');
      label.textContent = prop.label;
      label.setAttribute('for', `style-${prop.key}`);

      let input;
      if (prop.type === 'select') {
        input = document.createElement('select');
        for (const opt of prop.options) {
          const option = document.createElement('option');
          option.value = opt;
          option.textContent = opt || '(default)';
          if (opt === (node.styles?.[prop.key] || '')) option.selected = true;
          input.appendChild(option);
        }
      } else if (prop.type === 'color') {
        input = document.createElement('input');
        input.type = 'color';
        input.value = node.styles?.[prop.key] || '#000000';
      } else {
        input = document.createElement('input');
        input.type = 'text';
        input.value = node.styles?.[prop.key] || '';
        input.placeholder = prop.placeholder || '';
      }

      input.id = `style-${prop.key}`;
      input.className = 'prop-input';

      input.addEventListener('change', () => {
        this._state.updateNodeStyles(node.id, { [prop.key]: input.value });
      });

      group.appendChild(label);
      group.appendChild(input);
      section.appendChild(group);
    }

    this._container.appendChild(section);
  }

  _renderActions(node) {
    const section = document.createElement('div');
    section.className = 'props-actions';

    const duplicateBtn = document.createElement('button');
    duplicateBtn.type = 'button';
    duplicateBtn.className = 'action-btn';
    duplicateBtn.textContent = 'Duplicate';
    duplicateBtn.addEventListener('click', () => {
      this._bus.emit('component:duplicate', { nodeId: node.id });
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'action-btn action-btn-danger';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
      this._state.removeNode(node.id);
      this._state.clearSelection();
    });

    section.appendChild(duplicateBtn);
    section.appendChild(deleteBtn);
    this._container.appendChild(section);
  }

  _formatLabel(key) {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, s => s.toUpperCase())
      .replace(/aria /i, 'ARIA ');
  }
}
