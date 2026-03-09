/**
 * Selection Manager - Handles element selection, highlight overlays, drag-to-move, and resize.
 */
export class SelectionManager {
  constructor(state, eventBus, canvasController, renderer) {
    this._state = state;
    this._bus = eventBus;
    this._canvas = canvasController;
    this._renderer = renderer;
    this._isDragging = false;
    this._dragStart = null;
    this._dragNodeId = null;
    this._dragOrigPos = null;
    this._hasMoved = false;
    this._resizeHandle = null;
    this._resizeStart = null;

    this._bus.on('canvas:rendered', () => this._setupClickHandlers());
    this._bus.on('state:selection', () => this._updateHighlights());
  }

  _setupClickHandlers() {
    const doc = this._canvas.getIframeDoc();
    if (!doc) return;

    doc.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;

      // Check if clicking a resize handle
      if (e.target.classList?.contains('am-resize-handle')) {
        this._startResize(e, doc);
        return;
      }

      const target = e.target.closest('[data-am-id]');
      if (!target) return;

      const nodeId = target.dataset.amId;

      // Handle selection
      if (e.shiftKey) {
        const current = [...(this._state.selection || [])];
        const idx = current.indexOf(nodeId);
        if (idx >= 0) current.splice(idx, 1);
        else current.push(nodeId);
        this._state.setSelection(current);
      } else if (!(this._state.selection || []).includes(nodeId)) {
        this._state.setSelection([nodeId]);
      }

      // Start drag-to-move
      const node = this._state.findNodeById(nodeId);
      if (node) {
        const rect = target.getBoundingClientRect();
        this._isDragging = true;
        this._hasMoved = false;
        this._dragNodeId = nodeId;
        this._dragStart = { x: e.clientX, y: e.clientY };
        this._dragOrigPos = node.position
          ? { ...node.position }
          : { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
        this._dragElement = target;
        e.preventDefault();
      }
    });

    doc.addEventListener('mousemove', (e) => {
      if (this._isDragging && this._dragNodeId) {
        const dx = e.clientX - this._dragStart.x;
        const dy = e.clientY - this._dragStart.y;

        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          this._hasMoved = true;
        }

        if (this._hasMoved && this._dragElement) {
          const newX = this._dragOrigPos.x + dx;
          const newY = this._dragOrigPos.y + dy;

          // Live preview: move the element directly
          this._dragElement.style.position = 'absolute';
          this._dragElement.style.left = newX + 'px';
          this._dragElement.style.top = newY + 'px';
          this._dragElement.style.zIndex = '1000';
          this._dragElement.style.opacity = '0.9';
          this._dragElement.style.cursor = 'grabbing';

          // Snap to grid (8px)
          const snappedX = Math.round(newX / 8) * 8;
          const snappedY = Math.round(newY / 8) * 8;
          this._dragElement.style.left = snappedX + 'px';
          this._dragElement.style.top = snappedY + 'px';

          this._bus.emit('element:moving', {
            nodeId: this._dragNodeId,
            x: snappedX, y: snappedY
          });
        }
      }

      if (this._resizeHandle && this._resizeStart) {
        this._doResize(e);
      }

      // Hover effect
      if (!this._isDragging && !this._resizeHandle) {
        const target = e.target.closest('[data-am-id]');
        this._clearHovers(doc);
        if (target && !(this._state.selection || []).includes(target.dataset.amId)) {
          target.classList.add('am-hover');
        }
      }
    });

    doc.addEventListener('mouseup', (e) => {
      if (this._isDragging && this._dragNodeId) {
        if (this._hasMoved) {
          // Commit position to state
          const dx = e.clientX - this._dragStart.x;
          const dy = e.clientY - this._dragStart.y;
          const newX = Math.round((this._dragOrigPos.x + dx) / 8) * 8;
          const newY = Math.round((this._dragOrigPos.y + dy) / 8) * 8;

          this._state.updateNodePosition(this._dragNodeId, {
            x: newX,
            y: newY,
            width: this._dragOrigPos.width,
            height: this._dragOrigPos.height,
            z: this._dragOrigPos.z || 1
          });

          if (this._dragElement) {
            this._dragElement.style.opacity = '';
            this._dragElement.style.cursor = '';
          }
        } else {
          // It was just a click, not a drag
          // Selection already handled in mousedown
        }

        this._isDragging = false;
        this._dragNodeId = null;
        this._dragStart = null;
        this._dragOrigPos = null;
        this._dragElement = null;
        this._hasMoved = false;
      }

      if (this._resizeHandle) {
        this._endResize(e);
      }
    });

    // Deselect when clicking on empty canvas
    doc.addEventListener('click', (e) => {
      if (e.target === doc.body || e.target.id === 'canvas-root') {
        if (!this._hasMoved) {
          this._state.clearSelection();
        }
      }
    });

    doc.addEventListener('mouseout', (e) => {
      const target = e.target.closest('[data-am-id]');
      if (target) target.classList.remove('am-hover');
    });
  }

  _clearHovers(doc) {
    const hovered = doc.querySelectorAll('.am-hover');
    hovered.forEach(el => el.classList.remove('am-hover'));
  }

  _updateHighlights() {
    const doc = this._canvas.getIframeDoc();
    if (!doc) return;

    // Clear previous
    doc.querySelectorAll('.am-selected').forEach(el => el.classList.remove('am-selected'));
    doc.querySelectorAll('.am-resize-handle').forEach(el => el.remove());

    const selection = this._state.selection || [];
    for (const nodeId of selection) {
      const el = this._renderer.getElementForNode(nodeId);
      if (el) {
        el.classList.add('am-selected');
        this._addResizeHandles(el, nodeId, doc);
      }
    }

    this._bus.emit('selection:changed', { ids: selection });
  }

  _addResizeHandles(el, nodeId, doc) {
    const positions = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];
    const cursors = {
      nw: 'nwse-resize', ne: 'nesw-resize', sw: 'nesw-resize', se: 'nwse-resize',
      n: 'ns-resize', s: 'ns-resize', e: 'ew-resize', w: 'ew-resize'
    };

    for (const pos of positions) {
      const handle = doc.createElement('div');
      handle.className = 'am-resize-handle';
      handle.dataset.handle = pos;
      handle.dataset.nodeId = nodeId;
      handle.style.cssText = `
        position: absolute;
        width: 8px;
        height: 8px;
        background: #0066cc;
        border: 1px solid #fff;
        z-index: 10001;
        cursor: ${cursors[pos]};
        pointer-events: auto;
      `;

      const rect = el.getBoundingClientRect();
      const scrollY = doc.defaultView?.scrollY || 0;
      const scrollX = doc.defaultView?.scrollX || 0;

      switch (pos) {
        case 'nw': handle.style.left = (rect.left + scrollX - 4) + 'px'; handle.style.top = (rect.top + scrollY - 4) + 'px'; break;
        case 'ne': handle.style.left = (rect.right + scrollX - 4) + 'px'; handle.style.top = (rect.top + scrollY - 4) + 'px'; break;
        case 'sw': handle.style.left = (rect.left + scrollX - 4) + 'px'; handle.style.top = (rect.bottom + scrollY - 4) + 'px'; break;
        case 'se': handle.style.left = (rect.right + scrollX - 4) + 'px'; handle.style.top = (rect.bottom + scrollY - 4) + 'px'; break;
        case 'n': handle.style.left = (rect.left + rect.width / 2 + scrollX - 4) + 'px'; handle.style.top = (rect.top + scrollY - 4) + 'px'; break;
        case 's': handle.style.left = (rect.left + rect.width / 2 + scrollX - 4) + 'px'; handle.style.top = (rect.bottom + scrollY - 4) + 'px'; break;
        case 'e': handle.style.left = (rect.right + scrollX - 4) + 'px'; handle.style.top = (rect.top + rect.height / 2 + scrollY - 4) + 'px'; break;
        case 'w': handle.style.left = (rect.left + scrollX - 4) + 'px'; handle.style.top = (rect.top + rect.height / 2 + scrollY - 4) + 'px'; break;
      }

      doc.body.appendChild(handle);
    }
  }

  _startResize(e, doc) {
    e.preventDefault();
    const handle = e.target;
    const nodeId = handle.dataset.nodeId;
    const direction = handle.dataset.handle;
    const el = this._renderer.getElementForNode(nodeId);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const node = this._state.findNodeById(nodeId);

    this._resizeHandle = direction;
    this._resizeStart = {
      x: e.clientX,
      y: e.clientY,
      nodeId,
      element: el,
      origRect: { x: rect.left, y: rect.top, width: rect.width, height: rect.height },
      origPos: node?.position ? { ...node.position } : { x: rect.left, y: rect.top, width: rect.width, height: rect.height }
    };
  }

  _doResize(e) {
    if (!this._resizeStart) return;
    const dx = e.clientX - this._resizeStart.x;
    const dy = e.clientY - this._resizeStart.y;
    const orig = this._resizeStart.origPos;
    const el = this._resizeStart.element;

    let newX = orig.x, newY = orig.y, newW = orig.width, newH = orig.height;

    switch (this._resizeHandle) {
      case 'se': newW = orig.width + dx; newH = orig.height + dy; break;
      case 'sw': newX = orig.x + dx; newW = orig.width - dx; newH = orig.height + dy; break;
      case 'ne': newW = orig.width + dx; newY = orig.y + dy; newH = orig.height - dy; break;
      case 'nw': newX = orig.x + dx; newY = orig.y + dy; newW = orig.width - dx; newH = orig.height - dy; break;
      case 'e': newW = orig.width + dx; break;
      case 'w': newX = orig.x + dx; newW = orig.width - dx; break;
      case 's': newH = orig.height + dy; break;
      case 'n': newY = orig.y + dy; newH = orig.height - dy; break;
    }

    newW = Math.max(24, newW);
    newH = Math.max(24, newH);

    el.style.position = 'absolute';
    el.style.left = Math.round(newX / 8) * 8 + 'px';
    el.style.top = Math.round(newY / 8) * 8 + 'px';
    el.style.width = Math.round(newW / 8) * 8 + 'px';
    el.style.height = Math.round(newH / 8) * 8 + 'px';
  }

  _endResize(e) {
    if (!this._resizeStart) return;
    const dx = e.clientX - this._resizeStart.x;
    const dy = e.clientY - this._resizeStart.y;
    const orig = this._resizeStart.origPos;

    let newX = orig.x, newY = orig.y, newW = orig.width, newH = orig.height;

    switch (this._resizeHandle) {
      case 'se': newW = orig.width + dx; newH = orig.height + dy; break;
      case 'sw': newX = orig.x + dx; newW = orig.width - dx; newH = orig.height + dy; break;
      case 'ne': newW = orig.width + dx; newY = orig.y + dy; newH = orig.height - dy; break;
      case 'nw': newX = orig.x + dx; newY = orig.y + dy; newW = orig.width - dx; newH = orig.height - dy; break;
      case 'e': newW = orig.width + dx; break;
      case 'w': newX = orig.x + dx; newW = orig.width - dx; break;
      case 's': newH = orig.height + dy; break;
      case 'n': newY = orig.y + dy; newH = orig.height - dy; break;
    }

    newW = Math.max(24, newW);
    newH = Math.max(24, newH);

    this._state.updateNodePosition(this._resizeStart.nodeId, {
      x: Math.round(newX / 8) * 8,
      y: Math.round(newY / 8) * 8,
      width: Math.round(newW / 8) * 8,
      height: Math.round(newH / 8) * 8,
      z: orig.z || 1
    });

    this._resizeHandle = null;
    this._resizeStart = null;
  }

  selectElement(nodeId) {
    this._state.setSelection([nodeId]);
  }

  getSelectedElements() {
    return (this._state.selection || [])
      .map(id => this._renderer.getElementForNode(id))
      .filter(Boolean);
  }
}
