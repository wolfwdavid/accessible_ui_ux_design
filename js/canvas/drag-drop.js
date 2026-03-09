/**
 * DragDrop Manager - Handles dragging components from palette onto the canvas.
 */
import { createComponentNode } from '../core/state.js';

export class DragDropManager {
  constructor(state, eventBus, canvasController, renderer, registry) {
    this._state = state;
    this._bus = eventBus;
    this._canvas = canvasController;
    this._renderer = renderer;
    this._registry = registry;
    this._dropIndicator = null;

    this._bus.on('canvas:ready', () => this._setupDropZone());

    // Handle media files dropped on the outer canvas container
    this._bus.on('media:file-drop', ({ files }) => {
      this._handleFileDrop(files, null, null);
    });
  }

  _setupDropZone() {
    const doc = this._canvas.getIframeDoc();
    if (!doc) return;

    const body = doc.body;

    body.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      this._showDropIndicator(e, doc);
    });

    body.addEventListener('dragleave', (e) => {
      if (!body.contains(e.relatedTarget)) {
        this._hideDropIndicator(doc);
      }
    });

    body.addEventListener('drop', (e) => {
      e.preventDefault();
      this._hideDropIndicator(doc);

      const componentType = e.dataTransfer.getData('application/am-component');

      // Handle file drops (images/videos from file explorer) — only if not a component drag
      if (!componentType && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        this._handleFileDrop(e.dataTransfer.files, e, doc);
        return;
      }

      if (!componentType) return;

      const def = this._registry.get(componentType);
      if (!def) return;

      const newNode = createComponentNode(componentType, { ...def.defaultProps });

      // Capture drop position for free placement on canvas
      const canvasRoot = doc.getElementById('canvas-root');
      const rootRect = canvasRoot ? canvasRoot.getBoundingClientRect() : { left: 0, top: 0 };
      const dropX = Math.round((e.clientX - rootRect.left) / 8) * 8;
      const dropY = Math.round((e.clientY - rootRect.top) / 8) * 8;

      // Set initial position where dropped
      newNode.position = { x: dropX, y: dropY, width: null, height: null, z: 1 };

      const target = this._findDropTarget(e.target, doc);
      const parentId = target?.dataset?.amId;

      if (parentId) {
        const parentNode = this._state.findNodeById(parentId);
        const parentDef = parentNode ? this._registry.get(parentNode.type) : null;
        if (parentDef?.isContainer) {
          this._state.addChild(parentId, newNode);
        } else {
          const grandparent = this._state.findParentOf(parentId);
          if (grandparent) {
            const idx = grandparent.children.findIndex(c => c.id === parentId);
            this._state.addChild(grandparent.id, newNode, idx + 1);
          }
        }
      } else {
        const rootId = this._state.document?.root?.id || this._state._state?.document?.root?.id;
        const root = this._state.findNodeById(rootId);
        if (root) {
          const mainChild = root.children?.find(c => c.type === 'main-landmark');
          if (mainChild) {
            this._state.addChild(mainChild.id, newNode);
          } else {
            this._state.addChild(rootId, newNode);
          }
        }
      }

      this._state.setSelection([newNode.id]);
      this._bus.emit('component:added', { node: newNode });
    });
  }

  _findDropTarget(element, doc) {
    let current = element;
    while (current && current !== doc.body) {
      if (current.dataset?.amId) return current;
      current = current.parentElement;
    }
    return null;
  }

  _showDropIndicator(e, doc) {
    if (!this._dropIndicator) {
      this._dropIndicator = doc.createElement('div');
      this._dropIndicator.className = 'am-drop-indicator';
    }
    const target = this._findDropTarget(e.target, doc);
    if (target) {
      const rect = target.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      this._dropIndicator.style.top = (e.clientY < midY ? rect.top : rect.bottom) + 'px';
      if (!this._dropIndicator.parentNode) {
        doc.body.appendChild(this._dropIndicator);
      }
    }
  }

  _hideDropIndicator(doc) {
    if (this._dropIndicator?.parentNode) {
      this._dropIndicator.remove();
    }
  }

  async _handleFileDrop(files, e, doc) {
    let dropY = 40;
    let dropX = 40;
    if (e && doc) {
      const canvasRoot = doc.getElementById('canvas-root');
      const rootRect = canvasRoot ? canvasRoot.getBoundingClientRect() : { left: 0, top: 0 };
      dropX = Math.round((e.clientX - rootRect.left) / 8) * 8;
      dropY = Math.round((e.clientY - rootRect.top) / 8) * 8;
    }

    for (const file of files) {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      if (!isImage && !isVideo) continue;

      const dataURL = await this._readFileAsDataURL(file);

      let newNode;
      if (isImage) {
        const dims = await this._getImageDimensions(dataURL);
        newNode = createComponentNode('image', {
          src: dataURL,
          alt: file.name.replace(/\.[^.]+$/, ''),
          width: dims.width > 800 ? '100%' : dims.width + 'px',
          height: dims.width > 800 ? 'auto' : dims.height + 'px',
          isDecorative: false
        });
        this._bus.emit('toast:show', { message: `Added image: ${file.name}`, type: 'success' });
      } else {
        newNode = createComponentNode('video', {
          src: dataURL,
          title: file.name.replace(/\.[^.]+$/, ''),
          captions: true,
          width: '100%',
          height: 'auto'
        });
        this._bus.emit('toast:show', { message: `Added video: ${file.name}`, type: 'success' });
      }

      newNode.position = { x: dropX, y: dropY, width: null, height: null, z: 1 };
      dropY += 40; // Offset stacked files

      // Add to the main content area
      const stateDoc = this._state.document || this._state._state?.document;
      const root = stateDoc?.root;
      if (root) {
        const mainChild = root.children?.find(c => c.type === 'main-landmark');
        this._state.addChild(mainChild ? mainChild.id : root.id, newNode);
      }

      this._state.setSelection([newNode.id]);
    }
  }

  _readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  _getImageDimensions(dataURL) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({ width: 300, height: 200 });
      img.src = dataURL;
    });
  }

  setupDraggableItem(element, componentType) {
    element.draggable = true;
    element.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('application/am-component', componentType);
      e.dataTransfer.effectAllowed = 'copy';
      this._state.isDragging = true;
    });
    element.addEventListener('dragend', () => {
      this._state.isDragging = false;
    });
  }
}
