/**
 * Canvas Controller - Manages the design canvas with pan, zoom, and grid.
 */
export class CanvasController {
  constructor(state, eventBus) {
    this._state = state;
    this._bus = eventBus;
    this._container = null;
    this._viewport = null;
    this._iframe = null;
    this._panStart = null;
    this._panOffset = { x: 0, y: 0 };
  }

  init(containerEl) {
    this._container = containerEl;
    this._setupViewport();
    this._setupIframe();
    this._setupPanZoom();
    this._setupGrid();
    this._bus.on('state:zoom', ({ value }) => this._applyZoom(value));
    this._bus.on('state:showGrid', ({ value }) => this._toggleGrid(value));
    this._bus.on('state:viewport', ({ value }) => this._resizeViewport(value));
  }

  _setupViewport() {
    this._viewport = document.createElement('div');
    this._viewport.className = 'canvas-viewport';
    this._viewport.style.cssText = `
      position: relative;
      transform-origin: 0 0;
      transition: width 0.3s, height 0.3s;
      background: #ffffff;
      box-shadow: 0 2px 20px rgba(0,0,0,0.1);
      margin: 40px auto;
      will-change: transform;
    `;
    this._container.appendChild(this._viewport);
    this._resizeViewport(this._state.viewport);
  }

  _setupIframe() {
    this._iframe = document.createElement('iframe');
    this._iframe.title = 'Design Canvas';
    this._iframe.className = 'canvas-iframe';
    this._iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      display: block;
      backface-visibility: hidden;
    `;
    this._iframe.sandbox = 'allow-same-origin allow-scripts';
    this._viewport.appendChild(this._iframe);

    this._iframe.addEventListener('load', () => {
      this._bus.emit('canvas:ready', { iframe: this._iframe });
    });

    const doc = this._iframe.contentDocument || this._iframe.contentWindow.document;
    doc.open();
    doc.write(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  *, *::before, *::after { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 16px;
    line-height: 1.5;
    color: #1a1a1a;
    min-height: 100vh;
  }
  .skip-link:focus {
    top: 0 !important;
    position: fixed !important;
  }
  :focus-visible {
    outline: 2px solid #0066cc;
    outline-offset: 2px;
  }
  .am-selected {
    outline: 2px dashed #0066cc !important;
    outline-offset: 2px;
  }
  .am-hover {
    outline: 1px dashed #66aaff !important;
    outline-offset: 1px;
  }
  .am-drop-indicator {
    background: #0066cc;
    height: 2px;
    position: absolute;
    left: 0;
    right: 0;
    pointer-events: none;
    z-index: 10000;
  }
  .am-audit-icon {
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    z-index: 9999;
    pointer-events: auto;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }
  .am-audit-error { background: #d32f2f; color: #fff; }
  .am-audit-warning { background: #f9a825; color: #000; }
  .am-audit-alert { background: #1976d2; color: #fff; }
  .am-focus-badge {
    position: absolute;
    background: #7c4dff;
    color: #fff;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: bold;
    z-index: 9998;
    pointer-events: none;
  }
  .am-touch-overlay {
    position: absolute;
    border: 2px solid;
    pointer-events: none;
    z-index: 9997;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: bold;
  }
  .am-touch-pass { border-color: #4caf50; background: rgba(76,175,80,0.1); color: #4caf50; }
  .am-touch-warn { border-color: #ff9800; background: rgba(255,152,0,0.1); color: #ff9800; }
  .am-touch-fail { border-color: #f44336; background: rgba(244,67,54,0.1); color: #f44336; }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
</style>
</head>
<body>
<div id="canvas-root" style="position: relative; min-height: 100vh;"></div>
</body>
</html>`);
    doc.close();
  }

  _setupPanZoom() {
    this._container.addEventListener('wheel', (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const newZoom = Math.max(0.25, Math.min(3, this._state.zoom + delta));
        this._state.zoom = Math.round(newZoom * 100) / 100;
      }
    }, { passive: false });

    this._container.addEventListener('mousedown', (e) => {
      if (e.button === 1) {
        e.preventDefault();
        this._panStart = { x: e.clientX - this._panOffset.x, y: e.clientY - this._panOffset.y };
        this._container.style.cursor = 'grabbing';
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (this._panStart) {
        this._panOffset.x = e.clientX - this._panStart.x;
        this._panOffset.y = e.clientY - this._panStart.y;
        this._applyTransform();
      }
    });

    window.addEventListener('mouseup', () => {
      if (this._panStart) {
        this._panStart = null;
        this._container.style.cursor = '';
      }
    });
  }

  _setupGrid() {
    this._gridOverlay = document.createElement('div');
    this._gridOverlay.className = 'canvas-grid';
    this._gridOverlay.style.cssText = `
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      opacity: 0.15;
      background-image:
        linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px);
      background-size: 8px 8px;
    `;
    this._viewport.insertBefore(this._gridOverlay, this._iframe);
    this._toggleGrid(this._state.showGrid);
  }

  _applyZoom(zoom) {
    this._applyTransform();
  }

  _applyTransform() {
    const zoom = this._state.zoom;
    // Round to whole pixels to avoid sub-pixel blurriness
    const tx = Math.round(this._panOffset.x);
    const ty = Math.round(this._panOffset.y);
    if (zoom === 1) {
      // At 1:1 zoom, skip scale() entirely to keep crisp rendering
      this._viewport.style.transform = `translate(${tx}px, ${ty}px)`;
    } else {
      this._viewport.style.transform = `translate(${tx}px, ${ty}px) scale(${zoom})`;
    }
  }

  _toggleGrid(show) {
    if (this._gridOverlay) {
      this._gridOverlay.style.display = show ? 'block' : 'none';
    }
  }

  _resizeViewport(viewport) {
    this._viewport.style.width = viewport.width + 'px';
    this._viewport.style.height = viewport.height + 'px';
  }

  getIframe() {
    return this._iframe;
  }

  getIframeDoc() {
    return this._iframe?.contentDocument || this._iframe?.contentWindow?.document;
  }

  getCanvasRoot() {
    const doc = this.getIframeDoc();
    return doc?.getElementById('canvas-root');
  }

  resetView() {
    this._panOffset = { x: 0, y: 0 };
    this._state.zoom = 1;
    this._applyTransform();
  }
}
