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
    this._figmaExporter = null;
  }

  setFigmaExporter(exporter) {
    this._figmaExporter = exporter;
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
          <button role="tab" aria-selected="false" aria-controls="export-figma-panel" id="export-figma-tab" class="export-tab">Figma</button>
        </div>
        <div class="export-panel-container">
          <div role="tabpanel" id="export-html-panel" aria-labelledby="export-html-tab" class="export-code-panel">
            <div class="export-actions">
              <button type="button" class="export-copy-btn" data-target="html">Copy HTML</button>
              <button type="button" class="export-download-btn" data-file="index.html" data-type="text/html" data-target="html">Save as .html</button>
            </div>
            <pre class="export-code"><code>${this._escapeHtml(html)}</code></pre>
          </div>
          <div role="tabpanel" id="export-css-panel" aria-labelledby="export-css-tab" class="export-code-panel" hidden>
            <div class="export-actions">
              <button type="button" class="export-copy-btn" data-target="css">Copy CSS</button>
              <button type="button" class="export-download-btn" data-file="styles.css" data-type="text/css" data-target="css">Save as .css</button>
            </div>
            <pre class="export-code"><code>${this._escapeHtml(css)}</code></pre>
          </div>
          <div role="tabpanel" id="export-full-panel" aria-labelledby="export-full-tab" class="export-code-panel" hidden>
            <div class="export-actions">
              <button type="button" class="export-copy-btn" data-target="full">Copy Full Page</button>
              <button type="button" class="export-download-btn" data-file="accessible-page.html" data-type="text/html" data-target="full">Save as .html</button>
              <button type="button" class="export-download-zip-btn">Save All as .zip</button>
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
          <div role="tabpanel" id="export-figma-panel" aria-labelledby="export-figma-tab" class="export-code-panel" hidden>
            <div class="figma-export-options">
              <div class="figma-export-card">
                <h3>SVG Export</h3>
                <p class="figma-export-desc">Export as SVG with embedded HTML. Import directly into Figma via File &rarr; Place Image or drag and drop.</p>
                <div class="export-actions">
                  <button type="button" class="export-figma-svg-btn">Save as .svg</button>
                </div>
              </div>
              <div class="figma-export-card">
                <h3>Figma JSON</h3>
                <p class="figma-export-desc">Export as Figma REST API compatible JSON with auto-layout, typography, colors, and WCAG accessibility metadata preserved as plugin data.</p>
                <div class="export-actions">
                  <button type="button" class="export-figma-json-btn">Save as .json</button>
                </div>
              </div>
              <div class="figma-export-card">
                <h3>Full Figma Package</h3>
                <p class="figma-export-desc">Download a .zip containing the SVG, Figma JSON, and the accessible HTML/CSS files all together.</p>
                <div class="export-actions">
                  <button type="button" class="export-figma-zip-btn">Save All as .zip</button>
                </div>
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

    this._dialog.querySelectorAll('.export-download-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        const fileName = btn.dataset.file;
        const mimeType = btn.dataset.type;
        let content;
        if (target === 'html') content = html;
        else if (target === 'css') content = css;
        else content = fullPage;
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        btn.textContent = 'Saved!';
        setTimeout(() => btn.textContent = `Save as .${fileName.split('.').pop()}`, 2000);
      });
    });

    const zipBtn = this._dialog.querySelector('.export-download-zip-btn');
    if (zipBtn) {
      zipBtn.addEventListener('click', async () => {
        zipBtn.disabled = true;
        zipBtn.textContent = 'Creating zip…';
        try {
          const JSZip = await this._loadJSZip();
          const zip = new JSZip();
          zip.file('index.html', html);
          zip.file('styles.css', css);
          zip.file('accessible-page.html', fullPage);
          const blob = await zip.generateAsync({ type: 'blob' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'accessible-export.zip';
          a.click();
          URL.revokeObjectURL(url);
          zipBtn.textContent = 'Saved!';
          setTimeout(() => zipBtn.textContent = 'Save All as .zip', 2000);
        } catch (e) {
          console.error('ZIP export failed:', e);
          zipBtn.textContent = 'Save All as .zip';
        }
        zipBtn.disabled = false;
      });
    }

    // Figma export buttons
    if (this._figmaExporter) {
      const svgBtn = this._dialog.querySelector('.export-figma-svg-btn');
      if (svgBtn) {
        svgBtn.addEventListener('click', () => {
          this._figmaExporter.downloadSVG();
          svgBtn.textContent = 'Saved!';
          setTimeout(() => svgBtn.textContent = 'Save as .svg', 2000);
        });
      }

      const jsonBtn = this._dialog.querySelector('.export-figma-json-btn');
      if (jsonBtn) {
        jsonBtn.addEventListener('click', () => {
          this._figmaExporter.downloadFigmaJSON();
          jsonBtn.textContent = 'Saved!';
          setTimeout(() => jsonBtn.textContent = 'Save as .json', 2000);
        });
      }

      const figmaZipBtn = this._dialog.querySelector('.export-figma-zip-btn');
      if (figmaZipBtn) {
        figmaZipBtn.addEventListener('click', async () => {
          figmaZipBtn.disabled = true;
          figmaZipBtn.textContent = 'Creating zip…';
          try {
            const JSZip = await this._loadJSZip();
            const zip = new JSZip();
            const svgContent = this._figmaExporter.exportAsSVG();
            const jsonContent = this._figmaExporter.exportAsFigmaJSON();
            zip.file('accessiblemake-export.svg', svgContent);
            zip.file('accessiblemake-figma.json', JSON.stringify(jsonContent, null, 2));
            zip.file('index.html', html);
            zip.file('styles.css', css);
            zip.file('accessible-page.html', fullPage);
            const blob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'accessiblemake-figma-export.zip';
            a.click();
            URL.revokeObjectURL(url);
            figmaZipBtn.textContent = 'Saved!';
            setTimeout(() => figmaZipBtn.textContent = 'Save All as .zip', 2000);
          } catch (e) {
            console.error('Figma ZIP export failed:', e);
            figmaZipBtn.textContent = 'Save All as .zip';
          }
          figmaZipBtn.disabled = false;
        });
      }
    }

    this._dialog.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this._dialog.close();
        this._dialog.remove();
      }
    });

    this._dialog.showModal();
  }

  _loadJSZip() {
    if (window.JSZip) return Promise.resolve(window.JSZip);
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'js/lib/jszip.min.js';
      script.onload = () => resolve(window.JSZip);
      script.onerror = () => reject(new Error('Failed to load JSZip library'));
      document.head.appendChild(script);
    });
  }

  _escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}
