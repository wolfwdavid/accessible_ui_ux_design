/**
 * AppState - Proxy-based reactive state management.
 * Emits events on the event bus when state changes.
 */
import { DEFAULT_CONFIG } from './constants.js';

let _nextId = 1;
export function generateId() {
  return `el-${Date.now().toString(36)}-${(_nextId++).toString(36)}`;
}

function createComponentNode(type, props = {}, children = []) {
  return {
    id: generateId(),
    type,
    props: { ...props },
    children: [...children],
    styles: {},
    ariaAttributes: {},
    position: null  // { x, y, width, height } when freely placed
  };
}

function createDefaultDocument() {
  return {
    root: createComponentNode('page', {
      title: 'Untitled Page',
      lang: 'en'
    }, [
      createComponentNode('header-landmark', { label: 'Site Header' }, [
        createComponentNode('skip-link', { text: 'Skip to main content', target: 'main-content' }),
        createComponentNode('heading', { level: 1, text: 'My Accessible Page' })
      ]),
      createComponentNode('nav-landmark', { label: 'Main Navigation' }, [
        createComponentNode('nav', { label: 'Main' })
      ]),
      createComponentNode('main-landmark', { id: 'main-content', label: 'Main Content' }),
      createComponentNode('footer-landmark', { label: 'Site Footer' }, [
        createComponentNode('paragraph', { text: '© 2026 AccessibleMake' })
      ])
    ])
  };
}

export class AppState {
  constructor(eventBus) {
    this._bus = eventBus;
    this._state = {
      document: createDefaultDocument(),
      selection: [],
      audit: { errors: [], warnings: [], alerts: [], score: 100 },
      headingMap: [],
      a11yTree: null,
      viewport: { device: 'desktop', width: DEFAULT_CONFIG.canvasWidth, height: DEFAULT_CONFIG.canvasHeight },
      zoom: 1,
      showGrid: true,
      showFocusOrder: false,
      showTouchTargets: false,
      activePanel: 'properties',
      isDragging: false
    };

    return new Proxy(this, {
      get(target, prop) {
        if (prop in target) return target[prop];
        return target._state[prop];
      },
      set(target, prop, value) {
        if (prop.startsWith('_')) {
          target[prop] = value;
          return true;
        }
        const old = target._state[prop];
        target._state[prop] = value;
        target._bus.emit(`state:${prop}`, { value, old });
        target._bus.emit('state:changed', { prop, value, old });
        return true;
      }
    });
  }

  getState() {
    return { ...this._state };
  }

  getSnapshot() {
    return structuredClone(this._state.document);
  }

  restoreSnapshot(snapshot) {
    this._state.document = snapshot;
    this._bus.emit('state:document', { value: snapshot });
    this._bus.emit('state:changed', { prop: 'document', value: snapshot });
  }

  findNodeById(id, node = this._state.document.root) {
    if (node.id === id) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = this.findNodeById(id, child);
        if (found) return found;
      }
    }
    return null;
  }

  findParentOf(id, node = this._state.document.root) {
    if (node.children) {
      for (const child of node.children) {
        if (child.id === id) return node;
        const found = this.findParentOf(id, child);
        if (found) return found;
      }
    }
    return null;
  }

  addChild(parentId, componentNode, index = -1) {
    const parent = this.findNodeById(parentId);
    if (!parent) return null;
    if (!parent.children) parent.children = [];
    if (index === -1) {
      parent.children.push(componentNode);
    } else {
      parent.children.splice(index, 0, componentNode);
    }
    this._bus.emit('document:changed', { action: 'add', node: componentNode, parentId });
    return componentNode;
  }

  removeNode(id) {
    const parent = this.findParentOf(id);
    if (!parent) return false;
    const idx = parent.children.findIndex(c => c.id === id);
    if (idx === -1) return false;
    const removed = parent.children.splice(idx, 1)[0];
    this._bus.emit('document:changed', { action: 'remove', node: removed, parentId: parent.id });
    return removed;
  }

  updateNodeProps(id, props) {
    const node = this.findNodeById(id);
    if (!node) return false;
    Object.assign(node.props, props);
    this._bus.emit('document:changed', { action: 'update', node, props });
    return true;
  }

  updateNodeStyles(id, styles) {
    const node = this.findNodeById(id);
    if (!node) return false;
    Object.assign(node.styles, styles);
    this._bus.emit('document:changed', { action: 'style', node, styles });
    return true;
  }

  updateNodeAria(id, ariaAttributes) {
    const node = this.findNodeById(id);
    if (!node) return false;
    Object.assign(node.ariaAttributes, ariaAttributes);
    this._bus.emit('document:changed', { action: 'aria', node, ariaAttributes });
    return true;
  }

  updateNodePosition(id, position) {
    const node = this.findNodeById(id);
    if (!node) return false;
    node.position = position ? { ...position } : null;
    this._bus.emit('document:changed', { action: 'position', node, position });
    return true;
  }

  setSelection(ids) {
    this.selection = Array.isArray(ids) ? ids : [ids];
  }

  clearSelection() {
    this.selection = [];
  }

  getSelectedNodes() {
    return this._state.selection
      .map(id => this.findNodeById(id))
      .filter(Boolean);
  }
}

export { createComponentNode };
