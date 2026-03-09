/**
 * Toolbar - Top toolbar with undo/redo, zoom, device toggle, visualization toggles.
 */
export class Toolbar {
  constructor(state, eventBus, history, exportPanel, importManager, figmaExporter) {
    this._state = state;
    this._bus = eventBus;
    this._history = history;
    this._exportPanel = exportPanel;
    this._importManager = importManager;
    this._figmaExporter = figmaExporter;
    this._container = null;

    this._bus.on('history:changed', (status) => this._updateUndoRedo(status));
    this._bus.on('state:zoom', () => this._updateZoom());
  }

  mount(containerEl) {
    this._container = containerEl;
    this._render();
  }

  _render() {
    this._container.innerHTML = '';
    this._container.setAttribute('role', 'toolbar');
    this._container.setAttribute('aria-label', 'Editor toolbar');

    const logo = document.createElement('div');
    logo.className = 'toolbar-logo';
    logo.innerHTML = '<strong>AccessibleMake</strong>';
    this._container.appendChild(logo);

    const sep1 = this._createSeparator();
    this._container.appendChild(sep1);

    // Import button
    const importBtn = this._createButton('Import', '📂 Import', () => {
      this._importManager.openImportDialog();
    }, 'import-btn');
    this._container.appendChild(importBtn);

    this._container.appendChild(this._createSeparator());

    this._undoBtn = this._createButton('Undo', '↩', () => this._history.undo(), 'undo-btn');
    this._redoBtn = this._createButton('Redo', '↪', () => this._history.redo(), 'redo-btn');
    this._container.appendChild(this._undoBtn);
    this._container.appendChild(this._redoBtn);

    this._container.appendChild(this._createSeparator());

    const zoomOut = this._createButton('Zoom Out', '−', () => {
      this._state.zoom = Math.max(0.25, (this._state.zoom || 1) - 0.1);
    });
    this._zoomDisplay = document.createElement('span');
    this._zoomDisplay.className = 'toolbar-zoom-display';
    this._zoomDisplay.setAttribute('aria-label', 'Current zoom level');
    this._zoomDisplay.textContent = `${Math.round((this._state.zoom || 1) * 100)}%`;
    const zoomIn = this._createButton('Zoom In', '+', () => {
      this._state.zoom = Math.min(3, (this._state.zoom || 1) + 0.1);
    });
    const zoomReset = this._createButton('Reset Zoom', '1:1', () => {
      this._state.zoom = 1;
    });

    this._container.appendChild(zoomOut);
    this._container.appendChild(this._zoomDisplay);
    this._container.appendChild(zoomIn);
    this._container.appendChild(zoomReset);

    this._container.appendChild(this._createSeparator());

    this._gridToggle = this._createToggle('Grid', this._state.showGrid, (v) => {
      this._state.showGrid = v;
    });
    this._container.appendChild(this._gridToggle);

    this._focusToggle = this._createToggle('Focus Order', this._state.showFocusOrder, (v) => {
      this._state.showFocusOrder = v;
    });
    this._container.appendChild(this._focusToggle);

    this._touchToggle = this._createToggle('Touch Targets', this._state.showTouchTargets, (v) => {
      this._state.showTouchTargets = v;
    });
    this._container.appendChild(this._touchToggle);

    this._container.appendChild(this._createSeparator());

    const exportBtn = this._createButton('Export Code', '⬇ Export', () => {
      this._exportPanel.open();
    }, 'export-btn');
    exportBtn.classList.add('toolbar-btn-primary');
    this._container.appendChild(exportBtn);

    // Figma export dropdown
    const figmaBtn = this._createButton('Export to Figma', '◆ Figma', () => {
      this._showFigmaMenu(figmaBtn);
    }, 'figma-btn');
    this._container.appendChild(figmaBtn);

    this._updateUndoRedo(this._history.status());
  }

  _createButton(label, text, onClick, id = '') {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'toolbar-btn';
    btn.setAttribute('aria-label', label);
    btn.setAttribute('title', label);
    btn.textContent = text;
    if (id) btn.id = id;
    btn.addEventListener('click', onClick);
    return btn;
  }

  _createToggle(label, initialValue, onChange) {
    const wrapper = document.createElement('label');
    wrapper.className = 'toolbar-toggle';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = initialValue;
    input.addEventListener('change', () => onChange(input.checked));
    const span = document.createElement('span');
    span.textContent = label;
    wrapper.appendChild(input);
    wrapper.appendChild(span);
    return wrapper;
  }

  _createSeparator() {
    const sep = document.createElement('div');
    sep.className = 'toolbar-separator';
    sep.setAttribute('role', 'separator');
    return sep;
  }

  _updateUndoRedo(status) {
    if (this._undoBtn) this._undoBtn.disabled = !status.canUndo;
    if (this._redoBtn) this._redoBtn.disabled = !status.canRedo;
  }

  _updateZoom() {
    if (this._zoomDisplay) {
      this._zoomDisplay.textContent = `${Math.round((this._state.zoom || 1) * 100)}%`;
    }
  }

  _showFigmaMenu(anchorBtn) {
    // Remove existing menu
    document.querySelectorAll('.figma-menu').forEach(m => m.remove());

    const menu = document.createElement('div');
    menu.className = 'figma-menu';
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-label', 'Figma export options');
    menu.style.cssText = `
      position: absolute;
      top: ${anchorBtn.getBoundingClientRect().bottom + 4}px;
      right: 16px;
      background: var(--am-bg-secondary);
      border: 1px solid var(--am-border);
      border-radius: var(--am-radius);
      padding: 4px;
      z-index: 10000;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      min-width: 220px;
    `;

    const items = [
      { label: 'Export as SVG (Figma Import)', action: () => this._figmaExporter.downloadSVG() },
      { label: 'Export as Figma JSON', action: () => this._figmaExporter.downloadFigmaJSON() }
    ];

    for (const item of items) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('role', 'menuitem');
      btn.textContent = item.label;
      btn.style.cssText = `
        display: block;
        width: 100%;
        padding: 8px 12px;
        border: none;
        background: transparent;
        color: var(--am-text);
        font-size: 13px;
        text-align: left;
        cursor: pointer;
        border-radius: var(--am-radius-sm);
      `;
      btn.addEventListener('mouseenter', () => btn.style.background = 'var(--am-bg-hover)');
      btn.addEventListener('mouseleave', () => btn.style.background = 'transparent');
      btn.addEventListener('click', () => {
        item.action();
        menu.remove();
      });
      menu.appendChild(btn);
    }

    document.body.appendChild(menu);

    // Close on click outside
    const closeMenu = (e) => {
      if (!menu.contains(e.target) && e.target !== anchorBtn) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    };
    setTimeout(() => document.addEventListener('click', closeMenu), 0);
  }
}
