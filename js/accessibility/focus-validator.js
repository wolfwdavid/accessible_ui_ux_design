/**
 * Focus Validator - Analyzes tab order and focus indicator compliance.
 */
import { isFocusable } from '../core/dom-utils.js';

export class FocusValidator {
  constructor(canvasController) {
    this._canvas = canvasController;
  }

  validate() {
    const doc = this._canvas.getIframeDoc();
    if (!doc) return { issues: [], focusables: [] };

    const issues = [];
    const focusables = [];
    const all = doc.querySelectorAll('*');

    for (const el of all) {
      if (el.classList.contains('am-audit-icon') ||
          el.classList.contains('am-focus-badge')) continue;

      if (!isFocusable(el)) continue;

      const rect = el.getBoundingClientRect();
      const tabindex = parseInt(el.getAttribute('tabindex') || '0');

      focusables.push({
        element: el,
        tag: el.tagName.toLowerCase(),
        tabindex,
        rect: { x: rect.left, y: rect.top, width: rect.width, height: rect.height },
        nodeId: el.dataset?.amId || null
      });

      if (tabindex > 0) {
        issues.push({
          type: 'positive-tabindex',
          message: `Positive tabindex="${tabindex}" disrupts natural order`,
          element: el
        });
      }
    }

    const naturalOrder = focusables
      .filter(f => f.tabindex <= 0)
      .sort((a, b) => {
        const rowDiff = Math.abs(a.rect.y - b.rect.y);
        if (rowDiff < 10) return a.rect.x - b.rect.x;
        return a.rect.y - b.rect.y;
      });

    for (let i = 1; i < naturalOrder.length; i++) {
      const prev = naturalOrder[i - 1];
      const curr = naturalOrder[i];
      if (curr.rect.y < prev.rect.y - 20 && curr.rect.x > prev.rect.x + 50) {
        issues.push({
          type: 'order-mismatch',
          message: `Visual reading order may not match DOM order between elements`,
          element: curr.element
        });
      }
    }

    return { issues, focusables };
  }
}
