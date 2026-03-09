/**
 * Audit Engine - Core WCAG rule runner. Traverses DOM, applies rules, collects results.
 */
import { perceivableRules } from './rules/perceivable.js';
import { operableRules } from './rules/operable.js';
import { understandableRules } from './rules/understandable.js';
import { robustRules } from './rules/robust.js';
import { ContrastChecker } from './contrast-checker.js';
import { DEFAULT_CONFIG } from '../core/constants.js';

export class AuditEngine {
  constructor(state, eventBus, canvasController) {
    this._state = state;
    this._bus = eventBus;
    this._canvas = canvasController;
    this._contrastChecker = new ContrastChecker();
    this._rules = [...perceivableRules, ...operableRules, ...understandableRules, ...robustRules];
    this._debounceTimer = null;
    this._overlayElements = [];

    this._bus.on('canvas:rendered', () => this._scheduleAudit());
    this._bus.on('document:changed', () => this._scheduleAudit());
  }

  _scheduleAudit() {
    clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => this.runAudit());
      } else {
        setTimeout(() => this.runAudit(), 50);
      }
    }, DEFAULT_CONFIG.auditDebounceMs);
  }

  runAudit() {
    const doc = this._canvas.getIframeDoc();
    if (!doc) return;

    const results = { errors: [], warnings: [], alerts: [] };
    const context = {
      contrastChecker: this._contrastChecker,
      previousHeadingLevel: 0,
      _idCounts: this._countIds(doc)
    };

    const elements = doc.querySelectorAll('*');

    for (const element of elements) {
      if (element.classList.contains('am-audit-icon') ||
          element.classList.contains('am-focus-badge') ||
          element.classList.contains('am-drop-indicator') ||
          element.classList.contains('am-touch-overlay')) {
        continue;
      }

      for (const rule of this._rules) {
        try {
          const result = rule.test(element, context);
          if (result && !result.pass) {
            const entry = {
              ruleId: rule.id,
              criterion: rule.criterion,
              level: rule.level,
              type: rule.type,
              description: rule.description,
              message: result.message,
              element: result.element,
              data: result.data || null,
              nodeId: element.dataset?.amId || null
            };

            if (rule.type === 'error') results.errors.push(entry);
            else if (rule.type === 'warning') results.warnings.push(entry);
            else results.alerts.push(entry);
          }
        } catch (err) {
          console.warn(`Audit rule "${rule.id}" failed:`, err);
        }
      }

      if (element.tagName?.match(/^H[1-6]$/)) {
        context.previousHeadingLevel = parseInt(element.tagName[1]);
      }
    }

    const total = results.errors.length + results.warnings.length + results.alerts.length;
    const score = total === 0 ? 100 : Math.max(0, Math.round(100 - (results.errors.length * 10) - (results.warnings.length * 3) - (results.alerts.length * 1)));

    this._state.audit = { ...results, score };
    this._updateOverlays(results, doc);
    this._bus.emit('audit:complete', { results, score });
  }

  _countIds(doc) {
    const counts = {};
    doc.querySelectorAll('[id]').forEach(el => {
      counts[el.id] = (counts[el.id] || 0) + 1;
    });
    return counts;
  }

  _updateOverlays(results, doc) {
    this._clearOverlays();

    const allIssues = [
      ...results.errors.map(r => ({ ...r, cls: 'am-audit-error', symbol: '✕' })),
      ...results.warnings.map(r => ({ ...r, cls: 'am-audit-warning', symbol: '!' })),
      ...results.alerts.map(r => ({ ...r, cls: 'am-audit-alert', symbol: 'i' }))
    ];

    for (const issue of allIssues) {
      if (!issue.element || !issue.element.getBoundingClientRect) continue;
      try {
        const rect = issue.element.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) continue;

        const icon = doc.createElement('div');
        icon.className = `am-audit-icon ${issue.cls}`;
        icon.textContent = issue.symbol;
        icon.title = `[${issue.criterion}] ${issue.message}`;
        icon.setAttribute('aria-label', issue.message);
        icon.style.top = (rect.top + (doc.defaultView?.scrollY || 0) - 10) + 'px';
        icon.style.left = (rect.right + (doc.defaultView?.scrollX || 0) - 10) + 'px';
        doc.body.appendChild(icon);
        this._overlayElements.push(icon);
      } catch (e) {
        // Element may have been removed
      }
    }
  }

  _clearOverlays() {
    for (const el of this._overlayElements) {
      el.remove();
    }
    this._overlayElements = [];
  }

  getRules() {
    return [...this._rules];
  }

  getContrastChecker() {
    return this._contrastChecker;
  }
}
