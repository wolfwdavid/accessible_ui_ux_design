/**
 * Keyboard Shortcuts - Global keyboard shortcut handler.
 */
export class KeyboardShortcuts {
  constructor(state, eventBus, history, exportPanel, importManager) {
    this._state = state;
    this._bus = eventBus;
    this._history = history;
    this._exportPanel = exportPanel;
    this._importManager = importManager;
    this._isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent);

    this._shortcuts = [
      { key: 'i', ctrl: true, action: (e) => { e.preventDefault(); this._importManager?.openImportDialog(); }, label: 'Import' },
      { key: 'z', ctrl: true, shift: false, action: () => this._history.undo(), label: 'Undo' },
      { key: 'z', ctrl: true, shift: true, action: () => this._history.redo(), label: 'Redo' },
      { key: 'y', ctrl: true, shift: false, action: () => this._history.redo(), label: 'Redo' },
      { key: 'Delete', ctrl: false, action: () => this._deleteSelected(), label: 'Delete' },
      { key: 'Backspace', ctrl: false, action: () => this._deleteSelected(), label: 'Delete' },
      { key: 'd', ctrl: true, action: (e) => { e.preventDefault(); this._duplicateSelected(); }, label: 'Duplicate' },
      { key: 'e', ctrl: true, action: (e) => { e.preventDefault(); this._exportPanel.open(); }, label: 'Export' },
      { key: 'Escape', ctrl: false, action: () => this._state.clearSelection(), label: 'Deselect' },
      { key: '=', ctrl: true, action: (e) => { e.preventDefault(); this._state.zoom = Math.min(3, (this._state.zoom || 1) + 0.1); }, label: 'Zoom In' },
      { key: '-', ctrl: true, action: (e) => { e.preventDefault(); this._state.zoom = Math.max(0.25, (this._state.zoom || 1) - 0.1); }, label: 'Zoom Out' },
      { key: '0', ctrl: true, action: (e) => { e.preventDefault(); this._state.zoom = 1; }, label: 'Reset Zoom' },
      { key: 'ArrowUp', ctrl: false, action: (e) => this._nudge(e, 0, -1), label: 'Nudge Up' },
      { key: 'ArrowDown', ctrl: false, action: (e) => this._nudge(e, 0, 1), label: 'Nudge Down' },
      { key: 'ArrowLeft', ctrl: false, action: (e) => this._nudge(e, -1, 0), label: 'Nudge Left' },
      { key: 'ArrowRight', ctrl: false, action: (e) => this._nudge(e, 1, 0), label: 'Nudge Right' },
      { key: '?', ctrl: false, shift: true, action: () => this._showHelp(), label: 'Show Shortcuts' }
    ];

    this._init();
  }

  _init() {
    document.addEventListener('keydown', (e) => {
      if (this._isEditingText(e.target)) return;

      for (const shortcut of this._shortcuts) {
        const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : !(e.ctrlKey || e.metaKey);
        const shiftMatch = shortcut.shift !== undefined ? shortcut.shift === e.shiftKey : true;

        if (e.key === shortcut.key && ctrlMatch && shiftMatch) {
          shortcut.action(e);
          return;
        }
      }
    });
  }

  _isEditingText(target) {
    const tag = target.tagName?.toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable;
  }

  _deleteSelected() {
    const selection = this._state.selection || [];
    for (const id of selection) {
      const node = this._state.findNodeById(id);
      if (node && !node.props?.isRoot) {
        this._state.removeNode(id);
      }
    }
    this._state.clearSelection();
  }

  _duplicateSelected() {
    this._bus.emit('component:duplicate', { nodeId: (this._state.selection || [])[0] });
  }

  _nudge(e, dx, dy) {
    const selection = this._state.selection || [];
    if (selection.length === 0) return;
    e.preventDefault();

    const step = e.shiftKey ? 10 : 1;
    for (const id of selection) {
      const node = this._state.findNodeById(id);
      if (node) {
        const currentMargin = node.styles?.margin || '0px';
        const marginTop = parseInt(node.styles?.marginTop || '0') + (dy * step);
        const marginLeft = parseInt(node.styles?.marginLeft || '0') + (dx * step);
        this._state.updateNodeStyles(id, {
          marginTop: marginTop + 'px',
          marginLeft: marginLeft + 'px'
        });
      }
    }
  }

  _showHelp() {
    const dialog = document.createElement('dialog');
    dialog.className = 'shortcuts-dialog';
    dialog.setAttribute('aria-labelledby', 'shortcuts-title');

    const modKey = this._isMac ? '⌘' : 'Ctrl';
    let rows = this._shortcuts.map(s => {
      const keys = [];
      if (s.ctrl) keys.push(modKey);
      if (s.shift) keys.push(this._isMac ? '⇧' : 'Shift');
      keys.push(s.key === ' ' ? 'Space' : s.key);
      return `<tr><td><kbd>${keys.join(' + ')}</kbd></td><td>${s.label}</td></tr>`;
    }).join('');

    dialog.innerHTML = `
      <h2 id="shortcuts-title">Keyboard Shortcuts</h2>
      <table class="shortcuts-table">
        <thead><tr><th>Shortcut</th><th>Action</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <button type="button" class="export-close-btn" aria-label="Close">&times;</button>
    `;

    document.body.appendChild(dialog);
    dialog.querySelector('.export-close-btn').addEventListener('click', () => { dialog.close(); dialog.remove(); });
    dialog.addEventListener('keydown', (e) => { if (e.key === 'Escape') { dialog.close(); dialog.remove(); } });
    dialog.showModal();
  }
}
