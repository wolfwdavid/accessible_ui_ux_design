/**
 * Focus Order Visualization - Shows tab order with numbered badges and connecting lines.
 */
import { isFocusable } from '../core/dom-utils.js';

export class FocusOrderVisualizer {
  constructor(state, eventBus, canvasController) {
    this._state = state;
    this._bus = eventBus;
    this._canvas = canvasController;
    this._badges = [];

    this._bus.on('state:showFocusOrder', ({ value }) => {
      if (value) this.show();
      else this.hide();
    });
    this._bus.on('canvas:rendered', () => {
      if (this._state.showFocusOrder) this.show();
    });
  }

  show() {
    this.hide();
    const doc = this._canvas.getIframeDoc();
    if (!doc) return;

    const focusables = this._getFocusableElements(doc);
    let svgLine = null;

    if (focusables.length > 1) {
      svgLine = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgLine.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9997;';
      svgLine.setAttribute('aria-hidden', 'true');
      doc.body.appendChild(svgLine);
      this._badges.push(svgLine);
    }

    let prevCenter = null;

    focusables.forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      const badge = doc.createElement('div');
      badge.className = 'am-focus-badge';
      badge.textContent = String(i + 1);
      badge.setAttribute('aria-hidden', 'true');
      badge.style.top = (rect.top + doc.defaultView.scrollY - 12) + 'px';
      badge.style.left = (rect.left + doc.defaultView.scrollX - 12) + 'px';
      doc.body.appendChild(badge);
      this._badges.push(badge);

      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      if (prevCenter && svgLine) {
        const line = doc.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', prevCenter.x);
        line.setAttribute('y1', prevCenter.y);
        line.setAttribute('x2', cx);
        line.setAttribute('y2', cy);
        line.setAttribute('stroke', '#7c4dff');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('stroke-dasharray', '4,4');
        line.setAttribute('opacity', '0.6');
        svgLine.appendChild(line);
      }

      prevCenter = { x: cx, y: cy };
    });
  }

  hide() {
    for (const el of this._badges) {
      el.remove();
    }
    this._badges = [];
  }

  _getFocusableElements(doc) {
    const all = doc.querySelectorAll('*');
    const focusables = [];

    const withTabindex = [];
    const natural = [];

    for (const el of all) {
      if (el.classList.contains('am-focus-badge') || el.classList.contains('am-audit-icon')) continue;
      if (!isFocusable(el)) continue;

      const tabindex = parseInt(el.getAttribute('tabindex') || '0');
      if (tabindex > 0) {
        withTabindex.push({ el, tabindex });
      } else if (tabindex === 0 || !el.hasAttribute('tabindex')) {
        natural.push(el);
      }
    }

    withTabindex.sort((a, b) => a.tabindex - b.tabindex);
    focusables.push(...withTabindex.map(w => w.el), ...natural);

    return focusables;
  }
}
