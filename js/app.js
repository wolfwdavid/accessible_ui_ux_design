/**
 * AccessibleMake - Main Application Entry Point
 * A Figma Make-like design tool with built-in WCAG accessibility compliance.
 */
import { EventBus } from './core/event-bus.js';
import { AppState, createComponentNode } from './core/state.js';
import { HistoryManager } from './core/history.js';
import { ComponentRegistry } from './components/registry.js';
import { CanvasController } from './canvas/canvas.js';
import { CanvasRenderer } from './canvas/renderer.js';
import { SelectionManager } from './canvas/selection.js';
import { DragDropManager } from './canvas/drag-drop.js';
import { FocusOrderVisualizer } from './canvas/focus-order.js';
import { AuditEngine } from './accessibility/audit-engine.js';
import { HeadingMap } from './accessibility/heading-map.js';
import { A11yTreeInspector } from './accessibility/a11y-tree.js';
import { FocusValidator } from './accessibility/focus-validator.js';
import { AuditPanel } from './accessibility/audit-panel.js';
import { TouchTargetOverlay } from './mobile/touch-overlay.js';
import { MobilePreview } from './mobile/preview.js';
import { ScreenReaderHints } from './mobile/screen-reader-hints.js';
import { ExportPanel } from './export/export-panel.js';
import { FigmaExporter } from './export/figma-export.js';
import { ImportManager } from './import/import-manager.js';
import { LibraryPanel } from './components/library-panel.js';
import { PropertiesPanel } from './components/properties-panel.js';
import { Toolbar } from './ui/toolbar.js';
import { TabManager } from './ui/tab-manager.js';
import { Toast } from './ui/toast.js';
import { KeyboardShortcuts } from './ui/keyboard-shortcuts.js';

import { layoutComponents } from './components/definitions/layout.js';
import { typographyComponents } from './components/definitions/typography.js';
import { navigationComponents } from './components/definitions/navigation.js';
import { formComponents } from './components/definitions/forms.js';
import { mediaComponents } from './components/definitions/media.js';
import { interactiveComponents } from './components/definitions/interactive.js';
import { landmarkComponents } from './components/definitions/landmarks.js';

class AccessibleMakeApp {
  constructor() {
    this._bus = new EventBus();
    this._state = new AppState(this._bus);
    this._registry = new ComponentRegistry();
    this._toast = new Toast();

    this._registerComponents();
    this._initModules();
    this._wireEvents();
    this._mountUI();

    this._toast.success('AccessibleMake loaded. Drag components to the canvas to begin.', 5000);
  }

  _registerComponents() {
    const allComponents = [
      ...layoutComponents,
      ...typographyComponents,
      ...navigationComponents,
      ...formComponents,
      ...mediaComponents,
      ...interactiveComponents,
      ...landmarkComponents
    ];

    for (const comp of allComponents) {
      this._registry.register(comp);
    }
  }

  _initModules() {
    this._canvas = new CanvasController(this._state, this._bus);
    this._renderer = new CanvasRenderer(this._state, this._bus, this._registry);
    this._renderer.setCanvas(this._canvas);
    this._selection = new SelectionManager(this._state, this._bus, this._canvas, this._renderer);
    this._dragDrop = new DragDropManager(this._state, this._bus, this._canvas, this._renderer, this._registry);
    this._focusViz = new FocusOrderVisualizer(this._state, this._bus, this._canvas);
    this._auditEngine = new AuditEngine(this._state, this._bus, this._canvas);
    this._headingMap = new HeadingMap(this._state, this._bus, this._canvas);
    this._a11yTree = new A11yTreeInspector(this._state, this._bus, this._canvas);
    this._focusValidator = new FocusValidator(this._canvas);
    this._auditPanel = new AuditPanel(this._state, this._bus);
    this._touchOverlay = new TouchTargetOverlay(this._state, this._bus, this._canvas);
    this._mobilePreview = new MobilePreview(this._state, this._bus);
    this._srHints = new ScreenReaderHints(this._state, this._bus, this._canvas);
    this._exportPanel = new ExportPanel(this._state, this._bus, this._registry);
    this._figmaExporter = new FigmaExporter(this._state, this._registry, this._canvas);
    this._exportPanel.setFigmaExporter(this._figmaExporter);
    this._importManager = new ImportManager(this._state, this._bus, this._registry);
    this._history = new HistoryManager(this._state, this._bus);
    this._libraryPanel = new LibraryPanel(this._state, this._bus, this._registry, this._dragDrop);
    this._propertiesPanel = new PropertiesPanel(this._state, this._bus, this._registry);
    this._toolbar = new Toolbar(this._state, this._bus, this._history, this._exportPanel, this._importManager, this._figmaExporter);
    this._tabManager = new TabManager(this._state, this._bus);
    this._shortcuts = new KeyboardShortcuts(this._state, this._bus, this._history, this._exportPanel, this._importManager);
  }

  _wireEvents() {
    this._bus.on('component:request-add', ({ type, props }) => {
      const def = this._registry.get(type);
      if (!def) return;
      const node = createComponentNode(type, props || def.defaultProps);
      const doc = this._state.document || this._state._state?.document;
      const root = doc?.root;
      if (!root) return;

      const main = this._findContainer(root);
      this._state.addChild(main.id, node);
      this._state.setSelection([node.id]);
      this._toast.info(`Added ${def.label} to canvas`);
    });

    this._bus.on('component:duplicate', ({ nodeId }) => {
      if (!nodeId) return;
      const node = this._state.findNodeById(nodeId);
      if (!node) return;
      const parent = this._state.findParentOf(nodeId);
      if (!parent) return;
      const clone = structuredClone(node);
      this._reassignIds(clone);
      const idx = parent.children.findIndex(c => c.id === nodeId);
      this._state.addChild(parent.id, clone, idx + 1);
      this._state.setSelection([clone.id]);
      this._toast.info('Element duplicated');
    });

    this._bus.on('toast:show', ({ message, type }) => {
      this._toast.show(message, type);
    });

    this._bus.on('audit:complete', ({ score }) => {
      const scoreEl = document.getElementById('status-score');
      if (scoreEl) {
        scoreEl.textContent = `A11y Score: ${score}/100`;
        scoreEl.style.color = score >= 90 ? '#4caf50' : score >= 70 ? '#ff9800' : '#f44336';
      }
    });
  }

  _findContainer(node) {
    if (node.type === 'main-landmark') return node;
    if (node.children) {
      for (const child of node.children) {
        const found = this._findContainer(child);
        if (found) return found;
      }
    }
    return node;
  }

  _reassignIds(node) {
    const { generateId } = this._state.constructor === Object ? {} : { generateId: () => `el-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}` };
    node.id = `el-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    if (node.children) {
      for (const child of node.children) {
        this._reassignIds(child);
      }
    }
  }

  _mountUI() {
    const toolbarEl = document.getElementById('toolbar');
    const leftPanelEl = document.getElementById('left-panel');
    const canvasEl = document.getElementById('canvas-area');
    const rightPanelEl = document.getElementById('right-panel');

    this._canvas.init(canvasEl);
    this._toolbar.mount(toolbarEl);
    this._libraryPanel.mount(leftPanelEl);

    this._tabManager.mount(rightPanelEl, [
      { id: 'properties', label: 'Properties', mount: (el) => this._propertiesPanel.mount(el) },
      { id: 'audit', label: 'Audit', mount: (el) => this._auditPanel.mount(el) },
      { id: 'headings', label: 'Headings', mount: (el) => this._headingMap.mount(el) },
      { id: 'a11y-tree', label: 'A11y Tree', mount: (el) => this._a11yTree.mount(el) },
      { id: 'mobile', label: 'Mobile', mount: (el) => {
        this._mobilePreview.mount(el);
        const srSection = document.createElement('div');
        srSection.style.marginTop = '16px';
        el.appendChild(srSection);
        this._srHints.mount(srSection);
      }}
    ]);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new AccessibleMakeApp();
});
