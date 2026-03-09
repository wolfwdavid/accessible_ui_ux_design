/**
 * Import Manager - Handles importing HTML files, JSON templates, and images.
 */
import { createComponentNode } from '../core/state.js';

export class ImportManager {
  constructor(state, eventBus, registry) {
    this._state = state;
    this._bus = eventBus;
    this._registry = registry;
  }

  openImportDialog() {
    const dialog = document.createElement('dialog');
    dialog.className = 'export-dialog';
    dialog.setAttribute('aria-labelledby', 'import-dialog-title');

    dialog.innerHTML = `
      <div class="export-dialog-content" style="height: auto; max-height: 70vh;">
        <div class="export-dialog-header">
          <h2 id="import-dialog-title">Import</h2>
          <button type="button" class="export-close-btn" aria-label="Close import dialog">&times;</button>
        </div>
        <div style="padding: 24px;">
          <div class="import-section">
            <h3 style="margin-bottom: 12px; font-size: 14px;">Import HTML File</h3>
            <p style="font-size: 12px; color: var(--am-text-secondary); margin-bottom: 12px;">
              Import an existing HTML file. Elements will be parsed into editable components.
            </p>
            <label class="import-drop-zone" id="html-drop-zone" tabindex="0" aria-label="Drop HTML file here or click to browse">
              <input type="file" accept=".html,.htm" style="display: none;" id="import-html-input">
              <div class="import-drop-content">
                <span style="font-size: 32px; opacity: 0.5;" aria-hidden="true">📄</span>
                <span>Drop HTML file here or click to browse</span>
              </div>
            </label>
          </div>

          <div class="import-section" style="margin-top: 20px;">
            <h3 style="margin-bottom: 12px; font-size: 14px;">Import JSON Template</h3>
            <p style="font-size: 12px; color: var(--am-text-secondary); margin-bottom: 12px;">
              Load a saved AccessibleMake project template (.json).
            </p>
            <label class="import-drop-zone" id="json-drop-zone" tabindex="0" aria-label="Drop JSON file here or click to browse">
              <input type="file" accept=".json" style="display: none;" id="import-json-input">
              <div class="import-drop-content">
                <span style="font-size: 32px; opacity: 0.5;" aria-hidden="true">{ }</span>
                <span>Drop JSON template or click to browse</span>
              </div>
            </label>
          </div>

          <div class="import-section" style="margin-top: 20px;">
            <h3 style="margin-bottom: 12px; font-size: 14px;">Import Image</h3>
            <p style="font-size: 12px; color: var(--am-text-secondary); margin-bottom: 12px;">
              Add an image to the canvas. You will be prompted to provide alt text.
            </p>
            <label class="import-drop-zone" id="img-drop-zone" tabindex="0" aria-label="Drop image here or click to browse">
              <input type="file" accept="image/*" style="display: none;" id="import-img-input">
              <div class="import-drop-content">
                <span style="font-size: 32px; opacity: 0.5;" aria-hidden="true">🖼</span>
                <span>Drop image or click to browse</span>
              </div>
            </label>
          </div>

          <div class="import-section" style="margin-top: 20px; border-top: 1px solid var(--am-border); padding-top: 16px;">
            <h3 style="margin-bottom: 12px; font-size: 14px;">Built-in Templates</h3>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button type="button" class="action-btn template-btn" data-template="blank">Blank Page</button>
              <button type="button" class="action-btn template-btn" data-template="landing-page">Landing Page</button>
              <button type="button" class="action-btn template-btn" data-template="form-page">Form Page</button>
            </div>
          </div>

          <div class="import-section" style="margin-top: 20px; border-top: 1px solid var(--am-border); padding-top: 16px;">
            <h3 style="margin-bottom: 12px; font-size: 14px;">Save Current Project</h3>
            <button type="button" class="action-btn" id="save-project-btn" style="width: 100%;">
              Download Project as JSON
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    // Close button
    dialog.querySelector('.export-close-btn').addEventListener('click', () => {
      dialog.close();
      dialog.remove();
    });
    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { dialog.close(); dialog.remove(); }
    });

    // HTML import
    const htmlInput = dialog.querySelector('#import-html-input');
    const htmlZone = dialog.querySelector('#html-drop-zone');
    htmlZone.addEventListener('click', () => htmlInput.click());
    htmlZone.addEventListener('keydown', (e) => { if (e.key === 'Enter') htmlInput.click(); });
    htmlInput.addEventListener('change', () => {
      if (htmlInput.files[0]) this._importHTML(htmlInput.files[0], dialog);
    });
    this._setupDropZone(htmlZone, htmlInput, (file) => this._importHTML(file, dialog));

    // JSON import
    const jsonInput = dialog.querySelector('#import-json-input');
    const jsonZone = dialog.querySelector('#json-drop-zone');
    jsonZone.addEventListener('click', () => jsonInput.click());
    jsonZone.addEventListener('keydown', (e) => { if (e.key === 'Enter') jsonInput.click(); });
    jsonInput.addEventListener('change', () => {
      if (jsonInput.files[0]) this._importJSON(jsonInput.files[0], dialog);
    });
    this._setupDropZone(jsonZone, jsonInput, (file) => this._importJSON(file, dialog));

    // Image import
    const imgInput = dialog.querySelector('#import-img-input');
    const imgZone = dialog.querySelector('#img-drop-zone');
    imgZone.addEventListener('click', () => imgInput.click());
    imgZone.addEventListener('keydown', (e) => { if (e.key === 'Enter') imgInput.click(); });
    imgInput.addEventListener('change', () => {
      if (imgInput.files[0]) this._importImage(imgInput.files[0], dialog);
    });
    this._setupDropZone(imgZone, imgInput, (file) => this._importImage(file, dialog));

    // Templates
    dialog.querySelectorAll('.template-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this._loadTemplate(btn.dataset.template, dialog);
      });
    });

    // Save project
    dialog.querySelector('#save-project-btn').addEventListener('click', () => {
      this._saveProject();
    });

    dialog.showModal();
  }

  _setupDropZone(zone, input, handler) {
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('import-drop-active');
    });
    zone.addEventListener('dragleave', () => {
      zone.classList.remove('import-drop-active');
    });
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('import-drop-active');
      const file = e.dataTransfer.files[0];
      if (file) handler(file);
    });
  }

  async _importHTML(file, dialog) {
    const text = await file.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');

    const root = createComponentNode('page', {
      title: doc.title || 'Imported Page',
      lang: doc.documentElement.getAttribute('lang') || 'en'
    });

    const mainContent = doc.querySelector('main') || doc.body;
    this._parseHTMLNode(mainContent, root);

    const stateDoc = this._state.document || this._state._state?.document;
    if (stateDoc) {
      stateDoc.root = root;
      this._bus.emit('document:changed', { action: 'import' });
      this._bus.emit('state:document', { value: stateDoc });
    }

    dialog.close();
    dialog.remove();
    this._bus.emit('toast:show', { message: `Imported "${file.name}"`, type: 'success' });
  }

  _parseHTMLNode(htmlEl, parentNode) {
    for (const child of htmlEl.children) {
      const tag = child.tagName.toLowerCase();
      let node = null;

      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
        node = createComponentNode('heading', {
          level: parseInt(tag[1]),
          text: child.textContent.trim()
        });
      } else if (tag === 'p') {
        node = createComponentNode('paragraph', { text: child.textContent.trim() });
      } else if (tag === 'button') {
        node = createComponentNode('button', { text: child.textContent.trim(), variant: 'primary' });
      } else if (tag === 'a') {
        node = createComponentNode('link', {
          text: child.textContent.trim(),
          href: child.getAttribute('href') || '#'
        });
      } else if (tag === 'img') {
        node = createComponentNode('image', {
          src: child.getAttribute('src') || '',
          alt: child.getAttribute('alt') || ''
        });
      } else if (tag === 'input') {
        node = createComponentNode('text-input', {
          label: child.getAttribute('aria-label') || child.getAttribute('placeholder') || 'Input',
          type: child.type || 'text',
          placeholder: child.getAttribute('placeholder') || ''
        });
      } else if (tag === 'textarea') {
        node = createComponentNode('textarea', {
          label: child.getAttribute('aria-label') || 'Textarea'
        });
      } else if (tag === 'select') {
        const options = Array.from(child.options).map(o => o.textContent);
        node = createComponentNode('select', {
          label: child.getAttribute('aria-label') || 'Select',
          options
        });
      } else if (tag === 'nav') {
        node = createComponentNode('nav-landmark', {
          label: child.getAttribute('aria-label') || 'Navigation'
        });
        this._parseHTMLNode(child, node);
      } else if (tag === 'header') {
        node = createComponentNode('header-landmark', {
          label: child.getAttribute('aria-label') || ''
        });
        this._parseHTMLNode(child, node);
      } else if (tag === 'footer') {
        node = createComponentNode('footer-landmark', {
          label: child.getAttribute('aria-label') || ''
        });
        this._parseHTMLNode(child, node);
      } else if (tag === 'main') {
        node = createComponentNode('main-landmark', {
          id: child.id || 'main-content'
        });
        this._parseHTMLNode(child, node);
      } else if (tag === 'section') {
        node = createComponentNode('section', {
          label: child.getAttribute('aria-label') || ''
        });
        this._parseHTMLNode(child, node);
      } else if (tag === 'aside') {
        node = createComponentNode('complementary-landmark', {
          label: child.getAttribute('aria-label') || ''
        });
        this._parseHTMLNode(child, node);
      } else if (tag === 'article') {
        node = createComponentNode('article', {});
        this._parseHTMLNode(child, node);
      } else if (tag === 'ul') {
        const items = Array.from(child.querySelectorAll(':scope > li')).map(li => li.textContent.trim());
        node = createComponentNode('unordered-list', { items });
      } else if (tag === 'ol') {
        const items = Array.from(child.querySelectorAll(':scope > li')).map(li => li.textContent.trim());
        node = createComponentNode('ordered-list', { items });
      } else if (tag === 'blockquote') {
        node = createComponentNode('blockquote', { text: child.textContent.trim() });
      } else if (tag === 'hr') {
        node = createComponentNode('separator', {});
      } else if (tag === 'div' || tag === 'form' || tag === 'fieldset') {
        node = createComponentNode('section', {
          label: child.getAttribute('aria-label') || ''
        });
        this._parseHTMLNode(child, node);
      } else if (child.children.length > 0) {
        node = createComponentNode('div-container', {});
        this._parseHTMLNode(child, node);
      } else if (child.textContent.trim()) {
        node = createComponentNode('paragraph', { text: child.textContent.trim() });
      }

      if (node) {
        if (!parentNode.children) parentNode.children = [];
        parentNode.children.push(node);
      }
    }
  }

  async _importJSON(file, dialog) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.root) {
        this._bus.emit('toast:show', { message: 'Invalid template format', type: 'error' });
        return;
      }

      this._reassignIds(data.root);

      const stateDoc = this._state.document || this._state._state?.document;
      if (stateDoc) {
        stateDoc.root = data.root;
        this._bus.emit('document:changed', { action: 'import' });
        this._bus.emit('state:document', { value: stateDoc });
      }

      dialog.close();
      dialog.remove();
      this._bus.emit('toast:show', { message: `Loaded "${data.name || file.name}"`, type: 'success' });
    } catch (e) {
      this._bus.emit('toast:show', { message: `Import error: ${e.message}`, type: 'error' });
    }
  }

  async _importImage(file, dialog) {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const alt = prompt('Enter alt text for this image (leave empty if decorative):') || '';

      const node = createComponentNode('image', {
        src: dataUrl,
        alt: alt,
        isDecorative: alt === '',
        width: '100%',
        height: 'auto'
      });

      const doc = this._state.document || this._state._state?.document;
      const root = doc?.root;
      if (root) {
        const main = this._findContainer(root);
        this._state.addChild(main.id, node);
        this._state.setSelection([node.id]);
      }

      dialog.close();
      dialog.remove();
      this._bus.emit('toast:show', { message: 'Image added to canvas', type: 'success' });
    };
    reader.readAsDataURL(file);
  }

  async _loadTemplate(templateName, dialog) {
    try {
      const resp = await fetch(`assets/templates/${templateName}.json`);
      const data = await resp.json();

      this._reassignIds(data.root);

      const stateDoc = this._state.document || this._state._state?.document;
      if (stateDoc) {
        stateDoc.root = data.root;
        this._bus.emit('document:changed', { action: 'import' });
        this._bus.emit('state:document', { value: stateDoc });
      }

      dialog.close();
      dialog.remove();
      this._bus.emit('toast:show', { message: `Loaded "${data.name}" template`, type: 'success' });
    } catch (e) {
      this._bus.emit('toast:show', { message: `Template load error: ${e.message}`, type: 'error' });
    }
  }

  _saveProject() {
    const doc = this._state.document || this._state._state?.document;
    const data = {
      name: doc?.root?.props?.title || 'Untitled',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      root: doc?.root || null
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(data.name || 'project').replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this._bus.emit('toast:show', { message: 'Project saved', type: 'success' });
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
    node.id = `el-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    if (node.children) {
      for (const child of node.children) {
        this._reassignIds(child);
      }
    }
  }
}
