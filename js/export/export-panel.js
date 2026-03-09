/**
 * Export Panel - Code preview with syntax highlighting, copy, and download.
 */
import { CodeGenerator } from './code-generator.js';
import { ExportValidator } from './validators.js';

export class ExportPanel {
  constructor(state, eventBus, registry) {
    this._state = state;
    this._bus = eventBus;
    this._generator = new CodeGenerator(registry);
    this._validator = new ExportValidator();
    this._container = null;
    this._dialog = null;
  }

  mount(containerEl) {
    this._container = containerEl;
  }

  open() {
    if (this._dialog) this._dialog.remove();

    this._dialog = document.createElement('dialog');
    this._dialog.className = 'export-dialog';
    this._dialog.setAttribute('aria-labelledby', 'export-dialog-title');

    const doc = this._state.document || this._state._state?.document;
    const { html, css } = this._generator.generate(doc);
    const fullPage = this._generator.generateFullPage(doc);
    const validation = this._validator.validate(fullPage);

    this._dialog.innerHTML = `
      <div class="export-dialog-content">
        <div class="export-dialog-header">
          <h2 id="export-dialog-title">Export Accessible Code</h2>
          <button type="button" class="export-close-btn" aria-label="Close export dialog">&times;</button>
        </div>
        <div class="export-tabs" role="tablist" aria-label="Export format">
          <button role="tab" aria-selected="true" aria-controls="export-html-panel" id="export-html-tab" class="export-tab active">HTML</button>
          <button role="tab" aria-selected="false" aria-controls="export-css-panel" id="export-css-tab" class="export-tab">CSS</button>
          <button role="tab" aria-selected="false" aria-controls="export-full-panel" id="export-full-tab" class="export-tab">Full Page</button>
          <button role="tab" aria-selected="false" aria-controls="export-validation-panel" id="export-validation-tab" class="export-tab">Validation</button>
        </div>
        <div class="export-panel-container">
          <div role="tabpanel" id="export-html-panel" aria-labelledby="export-html-tab" class="export-code-panel">
            <div class="export-actions">
              <button type="button" class="export-copy-btn" data-target="html">Copy HTML</button>
            </div>
            <pre class="export-code"><code>${this._escapeHtml(html)}</code></pre>
          </div>
          <div role="tabpanel" id="export-css-panel" aria-labelledby="export-css-tab" class="export-code-panel" hidden>
            <div class="export-actions">
              <button type="button" class="export-copy-btn" data-target="css">Copy CSS</button>
            </div>
            <pre class="export-code"><code>${this._escapeHtml(css)}</code></pre>
          </div>
          <div role="tabpanel" id="export-full-panel" aria-labelledby="export-full-tab" class="export-code-panel" hidden>
            <div class="export-actions">
              <button type="button" class="export-copy-btn" data-target="full">Copy Full Page</button>
              <button type="button" class="export-download-btn">Download .html</button>
            </div>
            <pre class="export-code"><code>${this._escapeHtml(fullPage)}</code></pre>
          </div>
          <div role="tabpanel" id="export-validation-panel" aria-labelledby="export-validation-tab" class="export-code-panel" hidden>
            <div class="validation-results">
              <div class="validation-summary ${validation.valid ? 'valid' : 'invalid'}">
                ${validation.valid ? '✓ All critical checks passed' : `✕ ${validation.errorCount} error(s) found`}
              </div>
              <div class="validation-list">
                ${validation.issues.map(i => `
                  <div class="validation-item validation-${i.type}">
                    <span class="validation-type">${i.type.toUpperCase()}</span>
                    <span class="validation-rule">WCAG ${i.rule}</span>
                    <span class="validation-message">${i.message}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this._dialog);

    this._dialog.querySelector('.export-close-btn').addEventListener('click', () => {
      this._dialog.close();
      this._dialog.remove();
    });

    const tabs = this._dialog.querySelectorAll('[role="tab"]');
    const panels = this._dialog.querySelectorAll('[role="tabpanel"]');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => { t.setAttribute('aria-selected', 'false'); t.classList.remove('active'); });
        panels.forEach(p => p.hidden = true);
        tab.setAttribute('aria-selected', 'true');
        tab.classList.add('active');
        const panelId = tab.getAttribute('aria-controls');
        this._dialog.querySelector(`#${panelId}`).hidden = false;
      });
    });

    this._dialog.querySelectorAll('.export-copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        let text;
        if (target === 'html') text = html;
        else if (target === 'css') text = css;
        else text = fullPage;
        navigator.clipboard.writeText(text).then(() => {
          btn.textContent = 'Copied!';
          setTimeout(() => btn.textContent = `Copy ${target === 'full' ? 'Full Page' : target.toUpperCase()}`, 2000);
        });
      });
    });

    const downloadBtn = this._dialog.querySelector('.export-download-btn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        const blob = new Blob([fullPage], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'accessible-page.html';
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    this._dialog.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this._dialog.close();
        this._dialog.remove();
      }
    });

    this._dialog.showModal();
  }

  _escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}
