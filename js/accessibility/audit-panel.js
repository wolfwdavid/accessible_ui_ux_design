/**
 * Audit Panel - WAVE-like audit results UI with categorized issue list.
 */
export class AuditPanel {
  constructor(state, eventBus) {
    this._state = state;
    this._bus = eventBus;
    this._container = null;

    this._bus.on('audit:complete', ({ results, score }) => this._render(results, score));
  }

  mount(containerEl) {
    this._container = containerEl;
    const audit = this._state.audit || this._state._state?.audit;
    if (audit) this._render(audit, audit.score);
  }

  _render(results, score) {
    if (!this._container) return;
    this._container.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'panel-section-header';
    header.innerHTML = '<h3>Accessibility Audit</h3>';
    this._container.appendChild(header);

    const scoreCard = document.createElement('div');
    scoreCard.className = 'audit-score-card';
    const scoreColor = score >= 90 ? '#4caf50' : score >= 70 ? '#ff9800' : '#f44336';
    scoreCard.innerHTML = `
      <div class="audit-score" style="color: ${scoreColor}">
        <span class="audit-score-number">${score}</span>
        <span class="audit-score-label">/ 100</span>
      </div>
      <div class="audit-summary-counts">
        <span class="audit-count audit-count-error" title="Errors">
          <span class="audit-icon-mini error">✕</span> ${results.errors.length} Error${results.errors.length !== 1 ? 's' : ''}
        </span>
        <span class="audit-count audit-count-warning" title="Warnings">
          <span class="audit-icon-mini warning">!</span> ${results.warnings.length} Warning${results.warnings.length !== 1 ? 's' : ''}
        </span>
        <span class="audit-count audit-count-alert" title="Alerts">
          <span class="audit-icon-mini alert">i</span> ${results.alerts.length} Alert${results.alerts.length !== 1 ? 's' : ''}
        </span>
      </div>
    `;
    this._container.appendChild(scoreCard);

    if (results.errors.length === 0 && results.warnings.length === 0 && results.alerts.length === 0) {
      const success = document.createElement('div');
      success.className = 'audit-success';
      success.textContent = 'No accessibility issues detected. Great work!';
      success.setAttribute('role', 'status');
      this._container.appendChild(success);
      return;
    }

    if (results.errors.length > 0) {
      this._renderSection('Errors', results.errors, 'error');
    }
    if (results.warnings.length > 0) {
      this._renderSection('Warnings', results.warnings, 'warning');
    }
    if (results.alerts.length > 0) {
      this._renderSection('Alerts', results.alerts, 'alert');
    }
  }

  _renderSection(title, items, type) {
    const section = document.createElement('details');
    section.className = `audit-section audit-section-${type}`;
    section.open = type === 'error';

    const summary = document.createElement('summary');
    summary.className = 'audit-section-header';
    summary.innerHTML = `<span class="audit-section-title">${title}</span> <span class="badge">${items.length}</span>`;
    section.appendChild(summary);

    const list = document.createElement('div');
    list.className = 'audit-issue-list';
    list.setAttribute('role', 'list');

    for (const item of items) {
      const card = document.createElement('div');
      card.className = `audit-issue-card audit-issue-${type}`;
      card.setAttribute('role', 'listitem');
      card.setAttribute('tabindex', '0');

      const criterion = document.createElement('span');
      criterion.className = 'audit-criterion';
      criterion.textContent = `WCAG ${item.criterion} (${item.level})`;

      const message = document.createElement('p');
      message.className = 'audit-issue-message';
      message.textContent = item.message;

      const rule = document.createElement('span');
      rule.className = 'audit-rule-id';
      rule.textContent = item.ruleId;

      card.appendChild(criterion);
      card.appendChild(message);
      card.appendChild(rule);

      card.addEventListener('click', () => {
        if (item.nodeId) {
          this._state.setSelection([item.nodeId]);
        }
        if (item.element?.scrollIntoView) {
          item.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });

      list.appendChild(card);
    }

    section.appendChild(list);
    this._container.appendChild(section);
  }
}
