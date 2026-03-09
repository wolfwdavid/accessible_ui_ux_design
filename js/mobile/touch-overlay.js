/**
 * Touch Target Overlay - Visualizes touch target sizes with color-coded rectangles.
 */
import { TOUCH_TARGET } from '../core/constants.js';
import { isFocusable } from '../core/dom-utils.js';

export class TouchTargetOverlay {
  constructor(state, eventBus, canvasController) {
    this._state = state;
    this._bus = eventBus;
    this._canvas = canvasController;
    this._overlays = [];

    this._bus.on('state:showTouchTargets', ({ value }) => {
      if (value) this.show();
      else this.hide();
    });
    this._bus.on('canvas:rendered', () => {
      if (this._state.showTouchTargets) this.show();
    });
  }

  show() {
    this.hide();
    const doc = this._canvas.getIframeDoc();
    if (!doc) return;

    const elements = doc.querySelectorAll('*');
    let passCount = 0, warnCount = 0, failCount = 0;

    for (const el of elements) {
      if (!isFocusable(el)) continue;
      if (el.classList.contains('am-audit-icon')) continue;
      if (el.tagName === 'INPUT' && el.type === 'hidden') continue;

      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue;

      const w = rect.width;
      const h = rect.height;

      let cls, label;
      if (w >= TOUCH_TARGET.AAA && h >= TOUCH_TARGET.AAA) {
        cls = 'am-touch-pass';
        label = `${Math.round(w)}×${Math.round(h)} ✓`;
        passCount++;
      } else if (w >= TOUCH_TARGET.AA && h >= TOUCH_TARGET.AA) {
        cls = 'am-touch-warn';
        label = `${Math.round(w)}×${Math.round(h)}`;
        warnCount++;
      } else {
        cls = 'am-touch-fail';
        label = `${Math.round(w)}×${Math.round(h)} ✕`;
        failCount++;
      }

      const overlay = doc.createElement('div');
      overlay.className = `am-touch-overlay ${cls}`;
      overlay.textContent = label;
      overlay.style.top = (rect.top + (doc.defaultView?.scrollY || 0)) + 'px';
      overlay.style.left = (rect.left + (doc.defaultView?.scrollX || 0)) + 'px';
      overlay.style.width = rect.width + 'px';
      overlay.style.height = rect.height + 'px';
      overlay.setAttribute('aria-hidden', 'true');
      doc.body.appendChild(overlay);
      this._overlays.push(overlay);
    }

    this._bus.emit('touch-targets:analyzed', { pass: passCount, warn: warnCount, fail: failCount });
  }

  hide() {
    for (const el of this._overlays) {
      el.remove();
    }
    this._overlays = [];
  }
}
