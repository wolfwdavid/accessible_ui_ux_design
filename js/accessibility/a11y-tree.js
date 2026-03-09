/**
 * Accessibility Tree Inspector - Builds and displays the a11y tree (Apple Accessibility Inspector-like).
 */
import { IMPLICIT_ROLES } from '../core/constants.js';
import { getAccessibleName, isFocusable } from '../core/dom-utils.js';

export class A11yTreeInspector {
  constructor(state, eventBus, canvasController) {
    this._state = state;
    this._bus = eventBus;
    this._canvas = canvasController;
    this._container = null;

    this._bus.on('canvas:rendered', () => this.refresh());
  }

  mount(containerEl) {
    this._container = containerEl;
    this.refresh();
  }

  refresh() {
    if (!this._container) return;
    const doc = this._canvas.getIframeDoc();
    if (!doc) return;

    const tree = this._buildTree(doc.body);
    this._state.a11yTree = tree;
    this._render(tree);
  }

  _buildTree(element) {
    if (!element || element.nodeType !== 1) return null;
    if (element.classList?.contains('am-audit-icon') ||
        element.classList?.contains('am-focus-badge') ||
        element.classList?.contains('am-drop-indicator') ||
        element.classList?.contains('am-touch-overlay')) {
      return null;
    }

    const tag = element.tagName.toLowerCase();
    const role = element.getAttribute('role') || this._getImplicitRole(element);
    const name = getAccessibleName(element);
    const isHidden = element.getAttribute('aria-hidden') === 'true' ||
      getComputedStyle(element).display === 'none' ||
      getComputedStyle(element).visibility === 'hidden';

    const states = {};
    const properties = {};

    for (const attr of element.attributes) {
      if (attr.name.startsWith('aria-')) {
        const key = attr.name;
        const stateAttrs = ['aria-checked', 'aria-expanded', 'aria-disabled', 'aria-selected',
          'aria-pressed', 'aria-hidden', 'aria-invalid', 'aria-busy', 'aria-grabbed'];
        if (stateAttrs.includes(key)) {
          states[key] = attr.value;
        } else {
          properties[key] = attr.value;
        }
      }
    }

    const children = [];
    for (const child of element.children) {
      const childNode = this._buildTree(child);
      if (childNode) children.push(childNode);
    }

    if (!role && children.length === 0 && !name && Object.keys(states).length === 0) {
      return null;
    }

    return {
      tag,
      role: role || 'generic',
      name,
      focusable: isFocusable(element),
      hidden: isHidden,
      states,
      properties,
      children,
      element,
      nodeId: element.dataset?.amId || null
    };
  }

  _getImplicitRole(element) {
    const tag = element.tagName.toLowerCase();
    const type = element.getAttribute('type');
    if (tag === 'input' && type) {
      return IMPLICIT_ROLES[`${tag}[type="${type}"]`] || IMPLICIT_ROLES[tag] || null;
    }
    return IMPLICIT_ROLES[tag] || null;
  }

  _render(tree) {
    this._container.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'panel-section-header';
    header.innerHTML = '<h3>Accessibility Tree</h3>';
    this._container.appendChild(header);

    if (!tree) {
      const empty = document.createElement('div');
      empty.className = 'panel-empty';
      empty.textContent = 'No accessible content found.';
      this._container.appendChild(empty);
      return;
    }

    const treeContainer = document.createElement('div');
    treeContainer.className = 'a11y-tree';
    treeContainer.setAttribute('role', 'tree');
    treeContainer.setAttribute('aria-label', 'Accessibility tree');

    this._renderNode(tree, treeContainer, 0);
    this._container.appendChild(treeContainer);
  }

  _renderNode(node, parent, depth) {
    const item = document.createElement('div');
    item.className = 'a11y-tree-node';
    item.setAttribute('role', 'treeitem');
    item.setAttribute('tabindex', depth === 0 ? '0' : '-1');
    item.style.paddingLeft = (depth * 16 + 8) + 'px';
    if (node.hidden) item.style.opacity = '0.5';

    const roleSpan = document.createElement('span');
    roleSpan.className = 'a11y-role';
    roleSpan.textContent = `[${node.role}]`;

    const nameSpan = document.createElement('span');
    nameSpan.className = 'a11y-name';
    nameSpan.textContent = node.name ? ` "${node.name}"` : '';

    const metaSpan = document.createElement('span');
    metaSpan.className = 'a11y-meta';
    const meta = [];
    if (node.focusable) meta.push('focusable');
    if (node.hidden) meta.push('hidden');
    for (const [key, val] of Object.entries(node.states)) {
      meta.push(`${key.replace('aria-', '')}=${val}`);
    }
    if (meta.length) metaSpan.textContent = ` (${meta.join(', ')})`;

    item.appendChild(roleSpan);
    item.appendChild(nameSpan);
    item.appendChild(metaSpan);

    item.addEventListener('click', (e) => {
      e.stopPropagation();
      if (node.nodeId) {
        this._state.setSelection([node.nodeId]);
      }
      if (node.element) {
        node.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      parent.querySelectorAll('.a11y-tree-node-active').forEach(el => el.classList.remove('a11y-tree-node-active'));
      item.classList.add('a11y-tree-node-active');
    });

    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });

    parent.appendChild(item);

    if (node.children?.length > 0) {
      const group = document.createElement('div');
      group.setAttribute('role', 'group');
      for (const child of node.children) {
        this._renderNode(child, group, depth + 1);
      }
      parent.appendChild(group);
    }
  }
}
