/**
 * Canvas Renderer - Renders component tree as live DOM in the canvas iframe.
 */
export class CanvasRenderer {
  constructor(state, eventBus, registry) {
    this._state = state;
    this._bus = eventBus;
    this._registry = registry;
    this._elementMap = new Map();
    this._canvas = null;

    this._bus.on('canvas:ready', () => this.fullRender());
    this._bus.on('document:changed', () => this.fullRender());
    this._bus.on('state:document', () => this.fullRender());
  }

  setCanvas(canvasController) {
    this._canvas = canvasController;
  }

  fullRender() {
    const root = this._canvas?.getCanvasRoot();
    if (!root) return;

    this._elementMap.clear();
    root.innerHTML = '';

    const doc = this._state.document || this._state._state?.document;
    if (!doc || !doc.root) return;

    const rendered = this._renderNode(doc.root);
    if (rendered) {
      if (doc.root.type === 'page') {
        while (rendered.firstChild) {
          root.appendChild(rendered.firstChild);
        }
        if (doc.root.props.lang) {
          const htmlEl = root.ownerDocument.documentElement;
          htmlEl.setAttribute('lang', doc.root.props.lang);
        }
      } else {
        root.appendChild(rendered);
      }
    }

    // Inject animation keyframes CSS if present on the document root
    if (doc.root.animationCSS) {
      const iframeDoc = this._canvas.getIframeDoc();
      let animStyle = iframeDoc.getElementById('am-animation-css');
      if (!animStyle) {
        animStyle = iframeDoc.createElement('style');
        animStyle.id = 'am-animation-css';
        iframeDoc.head.appendChild(animStyle);
      }
      animStyle.textContent = doc.root.animationCSS;
    }

    this._bus.emit('canvas:rendered', { elementMap: this._elementMap });
  }

  _renderNode(node) {
    const iframeDoc = this._canvas.getIframeDoc();
    const def = this._registry.get(node.type);
    if (!def) {
      const fallback = iframeDoc.createElement('div');
      fallback.textContent = `[Unknown: ${node.type}]`;
      fallback.style.padding = '8px';
      fallback.style.border = '1px dashed red';
      fallback.dataset.amId = node.id;
      fallback.dataset.amType = node.type;
      this._elementMap.set(node.id, fallback);
      return fallback;
    }

    const el = def.render(node.props);
    const adoptedEl = iframeDoc.adoptNode(el);

    adoptedEl.dataset.amId = node.id;
    adoptedEl.dataset.amType = node.type;

    if (node.styles) {
      for (const [prop, value] of Object.entries(node.styles)) {
        if (value) adoptedEl.style[prop] = value;
      }
    }

    if (node.ariaAttributes) {
      for (const [attr, value] of Object.entries(node.ariaAttributes)) {
        if (value !== undefined && value !== '') {
          adoptedEl.setAttribute(attr, value);
        }
      }
    }

    // Apply free-position if the node has been dragged
    if (node.position) {
      adoptedEl.style.position = 'absolute';
      adoptedEl.style.left = node.position.x + 'px';
      adoptedEl.style.top = node.position.y + 'px';
      if (node.position.width) adoptedEl.style.width = node.position.width + 'px';
      if (node.position.height) adoptedEl.style.height = node.position.height + 'px';
      adoptedEl.style.zIndex = String(node.position.z || 1);
    }

    if (node.children && node.children.length > 0 && def.isContainer) {
      for (const child of node.children) {
        const childEl = this._renderNode(child);
        if (childEl) adoptedEl.appendChild(childEl);
      }
    }

    this._elementMap.set(node.id, adoptedEl);
    return adoptedEl;
  }

  getElementForNode(nodeId) {
    return this._elementMap.get(nodeId);
  }

  getNodeIdForElement(element) {
    let current = element;
    while (current) {
      if (current.dataset?.amId) return current.dataset.amId;
      current = current.parentElement;
    }
    return null;
  }

  getAllElements() {
    return new Map(this._elementMap);
  }
}
