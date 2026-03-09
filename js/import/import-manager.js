/**
 * Import Manager - Handles importing HTML files, JSON templates, images, ZIP archives, and project folders.
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

          <div class="import-section" style="margin-top: 20px;">
            <h3 style="margin-bottom: 12px; font-size: 14px;">Import ZIP Archive</h3>
            <p style="font-size: 12px; color: var(--am-text-secondary); margin-bottom: 12px;">
              Import a .zip file containing a project. The archive will be extracted and HTML/CSS/images parsed automatically.
            </p>
            <label class="import-drop-zone" id="zip-drop-zone" tabindex="0" aria-label="Drop ZIP file here or click to browse">
              <input type="file" accept=".zip" style="display: none;" id="import-zip-input">
              <div class="import-drop-content">
                <span style="font-size: 32px; opacity: 0.5;" aria-hidden="true">🗜</span>
                <span>Drop ZIP file here or click to browse</span>
                <span style="font-size: 11px; color: var(--am-text-muted);">Extracts and imports HTML, CSS, JS, images, and JSON</span>
              </div>
            </label>
          </div>

          <div class="import-section" style="margin-top: 20px;">
            <h3 style="margin-bottom: 12px; font-size: 14px;">Import Folder / Project</h3>
            <p style="font-size: 12px; color: var(--am-text-secondary); margin-bottom: 12px;">
              Import an entire project folder. HTML files will be parsed into components, and linked CSS/images will be included.
            </p>
            <label class="import-drop-zone" id="folder-drop-zone" tabindex="0" aria-label="Click to select a project folder">
              <input type="file" webkitdirectory directory multiple style="display: none;" id="import-folder-input">
              <div class="import-drop-content">
                <span style="font-size: 32px; opacity: 0.5;" aria-hidden="true">📁</span>
                <span>Click to select a project folder</span>
                <span style="font-size: 11px; color: var(--am-text-muted);">Supports HTML, CSS, JS, images, and JSON files</span>
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

    // ZIP import
    const zipInput = dialog.querySelector('#import-zip-input');
    const zipZone = dialog.querySelector('#zip-drop-zone');
    zipZone.addEventListener('click', () => zipInput.click());
    zipZone.addEventListener('keydown', (e) => { if (e.key === 'Enter') zipInput.click(); });
    zipInput.addEventListener('change', () => {
      if (zipInput.files[0]) this._importZip(zipInput.files[0], dialog);
    });
    this._setupDropZone(zipZone, zipInput, (file) => this._importZip(file, dialog));

    // Folder import
    const folderInput = dialog.querySelector('#import-folder-input');
    const folderZone = dialog.querySelector('#folder-drop-zone');
    folderZone.addEventListener('click', () => folderInput.click());
    folderZone.addEventListener('keydown', (e) => { if (e.key === 'Enter') folderInput.click(); });
    folderInput.addEventListener('change', () => {
      if (folderInput.files.length > 0) this._importFolder(folderInput.files, dialog);
    });

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

  _parseHTMLNode(htmlEl, parentNode, imageMap = {}) {
    // Process all child nodes (elements AND text nodes) to capture mixed content
    for (const childNode of htmlEl.childNodes) {
      // Handle text nodes directly
      if (childNode.nodeType === 3) { // Node.TEXT_NODE
        const text = childNode.textContent.trim();
        if (text) {
          const node = createComponentNode('paragraph', { text });
          if (!parentNode.children) parentNode.children = [];
          parentNode.children.push(node);
        }
        continue;
      }

      // Skip non-element nodes
      if (childNode.nodeType !== 1) continue; // Node.ELEMENT_NODE

      const child = childNode;
      const tag = child.tagName.toLowerCase();

      // Skip invisible/non-content elements
      if (['script', 'style', 'link', 'meta', 'noscript', 'template'].includes(tag)) continue;

      let node = null;

      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
        node = createComponentNode('heading', {
          level: parseInt(tag[1]),
          text: child.textContent.trim()
        });
      } else if (tag === 'p') {
        node = createComponentNode('paragraph', { text: child.textContent.trim() });
      } else if (tag === 'span' || tag === 'strong' || tag === 'em' || tag === 'b' || tag === 'i' || tag === 'small' || tag === 'mark') {
        // Inline text elements — capture as paragraph
        const text = child.textContent.trim();
        if (text) {
          node = createComponentNode('paragraph', { text });
        }
      } else if (tag === 'button') {
        node = createComponentNode('button', { text: child.textContent.trim(), variant: 'primary' });
      } else if (tag === 'a') {
        node = createComponentNode('link', {
          text: child.textContent.trim(),
          href: child.getAttribute('href') || '#'
        });
      } else if (tag === 'img') {
        const rawSrc = child.getAttribute('src') || '';
        const resolvedSrc = imageMap[rawSrc] || imageMap[rawSrc.replace(/^\.\//, '')] || rawSrc;
        node = createComponentNode('image', {
          src: resolvedSrc,
          alt: child.getAttribute('alt') || ''
        });
      } else if (tag === 'picture') {
        // Grab the img inside <picture>
        const img = child.querySelector('img');
        if (img) {
          const rawSrc = img.getAttribute('src') || '';
          const resolvedSrc = imageMap[rawSrc] || imageMap[rawSrc.replace(/^\.\//, '')] || rawSrc;
          node = createComponentNode('image', {
            src: resolvedSrc,
            alt: img.getAttribute('alt') || ''
          });
        }
      } else if (tag === 'svg') {
        // Serialize SVG to data URI and create an image component
        try {
          const serializer = new XMLSerializer();
          let svgStr = serializer.serializeToString(child);
          // Ensure xmlns is present
          if (!svgStr.includes('xmlns=')) {
            svgStr = svgStr.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
          }
          // If width/height were stripped (JSX expressions), add defaults from viewBox
          if (!child.getAttribute('width') && child.getAttribute('viewBox')) {
            const vb = child.getAttribute('viewBox').split(/\s+/);
            if (vb.length === 4) {
              svgStr = svgStr.replace('<svg', `<svg width="${vb[2]}" height="${vb[3]}"`);
            }
          }
          const dataUri = 'data:image/svg+xml,' + encodeURIComponent(svgStr);
          const vb = child.getAttribute('viewBox')?.split(/\s+/) || [];
          node = createComponentNode('image', {
            src: dataUri,
            alt: child.getAttribute('aria-label') || child.querySelector('title')?.textContent || 'Graphic',
            width: child.getAttribute('width') ? child.getAttribute('width') + 'px' : (vb[2] ? vb[2] + 'px' : '200px'),
            height: child.getAttribute('height') ? child.getAttribute('height') + 'px' : (vb[3] ? vb[3] + 'px' : 'auto')
          });
        } catch (_) {}
      } else if (tag === 'input') {
        const label = child.getAttribute('aria-label')
          || child.getAttribute('placeholder')
          || this._findLabelFor(htmlEl, child)
          || 'Input';
        node = createComponentNode('text-input', {
          label,
          type: child.type || 'text',
          placeholder: child.getAttribute('placeholder') || ''
        });
      } else if (tag === 'textarea') {
        node = createComponentNode('textarea', {
          label: child.getAttribute('aria-label') || this._findLabelFor(htmlEl, child) || 'Textarea'
        });
      } else if (tag === 'select') {
        const options = Array.from(child.querySelectorAll('option')).map(o => o.textContent);
        node = createComponentNode('select', {
          label: child.getAttribute('aria-label') || this._findLabelFor(htmlEl, child) || 'Select',
          options
        });
      } else if (tag === 'label') {
        // Labels wrapping inputs — parse children to find the input
        const input = child.querySelector('input, select, textarea');
        if (input) {
          this._parseHTMLNode(child, parentNode, imageMap);
          continue; // already added children
        } else {
          const text = child.textContent.trim();
          if (text) node = createComponentNode('paragraph', { text });
        }
      } else if (tag === 'nav') {
        node = createComponentNode('nav-landmark', {
          label: child.getAttribute('aria-label') || 'Navigation'
        });
        this._parseHTMLNode(child, node, imageMap);
      } else if (tag === 'header') {
        node = createComponentNode('header-landmark', {
          label: child.getAttribute('aria-label') || ''
        });
        this._parseHTMLNode(child, node, imageMap);
      } else if (tag === 'footer') {
        node = createComponentNode('footer-landmark', {
          label: child.getAttribute('aria-label') || ''
        });
        this._parseHTMLNode(child, node, imageMap);
      } else if (tag === 'main') {
        node = createComponentNode('main-landmark', {
          id: child.id || 'main-content'
        });
        this._parseHTMLNode(child, node, imageMap);
      } else if (tag === 'section') {
        node = createComponentNode('section', {
          label: child.getAttribute('aria-label') || ''
        });
        this._parseHTMLNode(child, node, imageMap);
      } else if (tag === 'aside') {
        node = createComponentNode('complementary-landmark', {
          label: child.getAttribute('aria-label') || ''
        });
        this._parseHTMLNode(child, node, imageMap);
      } else if (tag === 'article') {
        node = createComponentNode('article', {});
        this._parseHTMLNode(child, node, imageMap);
      } else if (tag === 'ul') {
        const items = Array.from(child.querySelectorAll(':scope > li')).map(li => li.textContent.trim());
        node = createComponentNode('unordered-list', { items });
      } else if (tag === 'ol') {
        const items = Array.from(child.querySelectorAll(':scope > li')).map(li => li.textContent.trim());
        node = createComponentNode('ordered-list', { items });
      } else if (tag === 'dl') {
        // Definition lists — flatten to paragraphs
        const dlChildren = child.querySelectorAll('dt, dd');
        for (const dlChild of dlChildren) {
          const text = dlChild.textContent.trim();
          if (text) {
            const dlNode = createComponentNode('paragraph', { text: (dlChild.tagName === 'DT' ? '**' + text + '**' : text) });
            if (!parentNode.children) parentNode.children = [];
            parentNode.children.push(dlNode);
          }
        }
        continue;
      } else if (tag === 'table') {
        // Tables — create a section with paragraph rows
        node = createComponentNode('section', { label: child.getAttribute('aria-label') || 'Table' });
        const caption = child.querySelector('caption');
        if (caption) {
          node.children.push(createComponentNode('heading', { level: 3, text: caption.textContent.trim() }));
        }
        const rows = child.querySelectorAll('tr');
        for (const row of rows) {
          const cells = Array.from(row.querySelectorAll('th, td')).map(c => c.textContent.trim());
          if (cells.length > 0) {
            node.children.push(createComponentNode('paragraph', { text: cells.join(' | ') }));
          }
        }
      } else if (tag === 'blockquote') {
        node = createComponentNode('blockquote', { text: child.textContent.trim() });
      } else if (tag === 'hr') {
        node = createComponentNode('separator', {});
      } else if (tag === 'figure') {
        const img = child.querySelector('img');
        const figcaption = child.querySelector('figcaption');
        if (img) {
          const rawSrc = img.getAttribute('src') || '';
          const resolvedSrc = imageMap[rawSrc] || imageMap[rawSrc.replace(/^\.\//, '')] || rawSrc;
          node = createComponentNode('image', {
            src: resolvedSrc,
            alt: img.getAttribute('alt') || figcaption?.textContent?.trim() || ''
          });
        } else {
          node = createComponentNode('section', { label: '' });
          this._parseHTMLNode(child, node, imageMap);
        }
      } else if (tag === 'video') {
        node = createComponentNode('paragraph', { text: `[Video: ${child.getAttribute('aria-label') || child.getAttribute('title') || 'Video'}]` });
      } else if (tag === 'audio') {
        node = createComponentNode('paragraph', { text: `[Audio: ${child.getAttribute('aria-label') || child.getAttribute('title') || 'Audio'}]` });
      } else if (tag === 'iframe') {
        node = createComponentNode('paragraph', { text: `[Embedded: ${child.getAttribute('title') || child.getAttribute('src') || 'iframe'}]` });
      } else if (tag === 'div' || tag === 'form' || tag === 'fieldset') {
        // Check if this div has visual significance (background, border, etc.)
        const hasVisualClass = this._hasVisualTailwindClasses(child.getAttribute('class') || '');
        const hasInlineStyle = child.style && child.style.cssText;
        const isVisual = hasVisualClass || hasInlineStyle;

        if (child.children.length === 0 && child.textContent.trim()) {
          node = createComponentNode('paragraph', { text: child.textContent.trim() });
        } else if (child.children.length === 0 && isVisual) {
          // Empty div but has visual styling (bg color, bg image, etc.) — keep as section
          node = createComponentNode('section', {
            label: child.getAttribute('aria-label') || ''
          });
        } else if (child.children.length > 0) {
          node = createComponentNode('section', {
            label: child.getAttribute('aria-label') || ''
          });
          this._parseHTMLNode(child, node, imageMap);
          // Flatten: if section has no children after parsing, skip it
          // UNLESS it has visual styling (background color/image)
          if (!node.children || node.children.length === 0) {
            const text = child.textContent.trim();
            if (text) {
              node = createComponentNode('paragraph', { text });
            } else if (!isVisual) {
              node = null;
            }
          }
        }
      } else if (child.children.length > 0) {
        node = createComponentNode('div-container', {});
        this._parseHTMLNode(child, node, imageMap);
        // Flatten empty containers unless they have visual styling
        if (!node.children || node.children.length === 0) {
          const hasVisual = this._hasVisualTailwindClasses(child.getAttribute('class') || '') || (child.style && child.style.cssText);
          const text = child.textContent.trim();
          if (text) {
            node = createComponentNode('paragraph', { text });
          } else if (!hasVisual) {
            node = null;
          }
        }
      } else if (child.textContent.trim()) {
        node = createComponentNode('paragraph', { text: child.textContent.trim() });
      } else if (this._hasVisualTailwindClasses(child.getAttribute?.('class') || '') || (child.style && child.style.cssText)) {
        // Empty element but has visual styling — keep it
        node = createComponentNode('section', { label: '' });
      }

      if (node) {
        // Apply Tailwind CSS classes as inline styles
        if (child.nodeType === 1) {
          const classAttr = child.getAttribute?.('class') || '';
          if (classAttr) {
            const twStyles = this._tailwindToStyles(classAttr);
            if (Object.keys(twStyles).length > 0) {
              if (!node.styles) node.styles = {};
              Object.assign(node.styles, twStyles);
            }
          }

          // Copy inline styles from the element
          if (child.style && child.style.cssText) {
            if (!node.styles) node.styles = {};
            for (let si = 0; si < child.style.length; si++) {
              const prop = child.style[si]; // kebab-case
              const val = child.style.getPropertyValue(prop);
              if (val) {
                const camelProp = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
                node.styles[camelProp] = val;
              }
            }
          }

          // Apply animation CSS from data-am-animate attribute
          if (child.getAttribute?.('data-am-animate')) {
            const animCSS = child.getAttribute('data-am-animate');
            if (!node.styles) node.styles = {};
            const pairs = animCSS.split(';').map(p => p.trim()).filter(Boolean);
            for (const pair of pairs) {
              const colonIdx = pair.indexOf(':');
              if (colonIdx === -1) continue;
              const key = pair.slice(0, colonIdx).trim();
              const value = pair.slice(colonIdx + 1).trim();
              const camelKey = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
              node.styles[camelKey] = value;
            }
          }
        }
        if (!parentNode.children) parentNode.children = [];
        parentNode.children.push(node);
      }
    }
  }

  _findLabelFor(context, inputEl) {
    const id = inputEl.getAttribute('id');
    if (id) {
      const label = context.querySelector(`label[for="${id}"]`);
      if (label) return label.textContent.trim();
    }
    // Check if wrapped in a label
    const parentLabel = inputEl.closest?.('label');
    if (parentLabel) return parentLabel.textContent.trim();
    return '';
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

  async _loadJSZip() {
    if (window.JSZip) return window.JSZip;
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'js/lib/jszip.min.js';
      script.onload = () => resolve(window.JSZip);
      script.onerror = () => reject(new Error('Failed to load JSZip library'));
      document.head.appendChild(script);
    });
  }

  async _importZip(file, dialog) {
    let JSZip;
    try {
      JSZip = await this._loadJSZip();
    } catch (e) {
      this._bus.emit('toast:show', { message: 'Could not load ZIP library', type: 'error' });
      return;
    }

    let zip;
    try {
      zip = await JSZip.loadAsync(file);
    } catch (e) {
      this._bus.emit('toast:show', { message: `Invalid ZIP file: ${e.message}`, type: 'error' });
      return;
    }

    const zipName = file.name.replace(/\.zip$/i, '');

    // Extract all files from the zip into categorized arrays
    const htmlFiles = [];
    const cssFiles = [];
    const jsFiles = [];
    const imageFiles = [];
    const jsonFiles = [];

    const imageExts = /\.(png|jpg|jpeg|gif|svg|webp|ico|bmp)$/i;
    const jsxFiles = [];

    for (const [path, entry] of Object.entries(zip.files)) {
      if (entry.dir) continue;

      // Skip hidden files, __MACOSX, node_modules
      if (path.includes('__MACOSX/') || path.includes('node_modules/') || path.split('/').some(p => p.startsWith('.'))) continue;

      const name = path.split('/').pop().toLowerCase();

      if (name.endsWith('.html') || name.endsWith('.htm')) {
        htmlFiles.push({ path, entry });
      } else if (name.endsWith('.css')) {
        cssFiles.push({ path, entry });
      } else if (name.endsWith('.tsx') || name.endsWith('.jsx')) {
        jsxFiles.push({ path, entry });
      } else if (name.endsWith('.js') || name.endsWith('.mjs')) {
        jsFiles.push({ path, entry });
      } else if (imageExts.test(name)) {
        imageFiles.push({ path, entry });
      } else if (name.endsWith('.json') && name !== 'package.json' && name !== 'package-lock.json') {
        jsonFiles.push({ path, entry });
      }
    }

    if (htmlFiles.length === 0 && jsxFiles.length === 0) {
      this._bus.emit('toast:show', { message: 'No HTML or JSX/TSX files found in ZIP archive', type: 'error' });
      return;
    }

    // Build image data URL map from zip entries
    const imageMap = {};
    for (const { path, entry } of imageFiles) {
      try {
        const blob = await entry.async('blob');
        const dataUrl = await this._readFileAsDataURL(new File([blob], path.split('/').pop()));
        const fileName = path.split('/').pop();
        const relativePath = path.includes('/') ? path.split('/').slice(1).join('/') : path;
        imageMap[path] = dataUrl;
        imageMap[relativePath] = dataUrl;
        imageMap[fileName] = dataUrl;
      } catch (_) {}
    }

    // Parse entry HTML
    const parser = new DOMParser();
    let pageTitle = zipName;
    let pageLang = 'en';

    if (htmlFiles.length > 0) {
      const entryFileObj = htmlFiles.find(f => f.path.split('/').pop().toLowerCase() === 'index.html') || htmlFiles[0];
      const htmlText = await entryFileObj.entry.async('string');
      const doc = parser.parseFromString(htmlText, 'text/html');
      pageTitle = doc.title || zipName;
      pageLang = doc.documentElement.getAttribute('lang') || 'en';
    }

    const root = createComponentNode('page', { title: pageTitle, lang: pageLang });

    // Try HTML parsing first
    let hasHTMLContent = false;
    if (htmlFiles.length > 0) {
      const entryFileObj = htmlFiles.find(f => f.path.split('/').pop().toLowerCase() === 'index.html') || htmlFiles[0];
      const htmlText = await entryFileObj.entry.async('string');
      const doc = parser.parseFromString(htmlText, 'text/html');
      const mainContent = doc.querySelector('main') || doc.body;
      this._parseHTMLNode(mainContent, root, imageMap);
      hasHTMLContent = root.children && root.children.length > 0;

      // Parse additional HTML files
      const otherHTML = htmlFiles.filter(f => f !== entryFileObj);
      for (const { path, entry } of otherHTML) {
        try {
          const text = await entry.async('string');
          const extraDoc = parser.parseFromString(text, 'text/html');
          const section = createComponentNode('section', {
            label: extraDoc.title || path.split('/').pop().replace(/\.(html|htm)$/i, '')
          });
          const pageContent = extraDoc.querySelector('main') || extraDoc.body;
          this._parseHTMLNode(pageContent, section, imageMap);
          if (section.children && section.children.length > 0) {
            if (!root.children) root.children = [];
            root.children.push(section);
            hasHTMLContent = true;
          }
        } catch (_) {}
      }
    }

    // If HTML had no meaningful content, parse JSX/TSX files (React/framework project)
    if (!hasHTMLContent && jsxFiles.length > 0) {
      // Build SVG path data map from svg-*.ts/tsx files in the zip
      const svgDataMap = {};
      for (const [zipPath, zipEntry] of Object.entries(zip.files)) {
        if (zipEntry.dir) continue;
        const fname = zipPath.split('/').pop().toLowerCase();
        if (fname.startsWith('svg-') && (fname.endsWith('.ts') || fname.endsWith('.tsx'))) {
          try {
            const svgSource = await zipEntry.async('string');
            const baseName = fname.replace(/\.(ts|tsx)$/, '');
            svgDataMap[baseName] = this._parseSvgDataFile(svgSource);
          } catch (_) {}
        }
      }

      // Prioritize page/component files — skip utility, UI library, SVG data files
      const pageFiles = jsxFiles.filter(({ path }) => {
        const name = path.split('/').pop().toLowerCase();
        const fullPath = path.toLowerCase();
        // Skip utility/config files, SVG data, and very small files
        if (name.startsWith('svg-') || name === 'utils.ts' || name === 'utils.tsx') return false;
        if (name.endsWith('.d.ts') || name.endsWith('.d.tsx')) return false;
        // Skip UI library primitives (shadcn, radix, etc.)
        if (fullPath.includes('/ui/') || fullPath.includes('/primitives/')) return false;
        // Skip context providers and hooks (no visual content)
        if (fullPath.includes('/context/') || fullPath.includes('/hooks/')) return false;
        if (name === 'main.tsx' || name === 'main.jsx') return false;
        return true;
      });

      // Sort: pages first, then app components, then imports, then others
      const prioritized = pageFiles.sort((a, b) => {
        const aPath = a.path.toLowerCase();
        const bPath = b.path.toLowerCase();
        const aPriority = aPath.includes('/pages/') ? 0 :
          (aPath.includes('/components/') && !aPath.includes('/ui/')) ? 1 :
          aPath.includes('/imports/') ? 2 : 3;
        const bPriority = bPath.includes('/pages/') ? 0 :
          (bPath.includes('/components/') && !bPath.includes('/ui/')) ? 1 :
          bPath.includes('/imports/') ? 2 : 3;
        return aPriority - bPriority;
      });

      // Read and parse the top JSX files (limit to avoid huge processing)
      const jsxSources = [];
      const limit = 25;
      for (const { path, entry } of prioritized.slice(0, limit)) {
        try {
          const source = await entry.async('string');
          // Skip files that are mostly SVG data or very short
          if (source.length < 100 || source.length > 200000) continue;
          // Skip files that don't have a return statement with JSX
          if (!source.match(/return\s*[\(<]/)) continue;
          jsxSources.push({ name: path.split('/').pop(), source });
        } catch (_) {}
      }

      if (jsxSources.length > 0) {
        this._parseJSXFiles(jsxSources, root, imageMap, svgDataMap);
      }
    }

    // Apply to state
    const stateDoc = this._state.document || this._state._state?.document;
    if (stateDoc) {
      stateDoc.root = root;
      this._bus.emit('document:changed', { action: 'import' });
      this._bus.emit('state:document', { value: stateDoc });
    }

    dialog.close();
    dialog.remove();

    const summary = [
      htmlFiles.length ? `${htmlFiles.length} HTML` : '',
      jsxFiles.length ? `${jsxFiles.length} JSX/TSX` : '',
      cssFiles.length ? `${cssFiles.length} CSS` : '',
      imageFiles.length ? `${imageFiles.length} images` : '',
      jsFiles.length ? `${jsFiles.length} JS` : ''
    ].filter(Boolean).join(', ');

    this._bus.emit('toast:show', {
      message: `Imported "${zipName}.zip" (${summary})`,
      type: 'success'
    });
  }

  async _importFolder(fileList, dialog) {
    const files = Array.from(fileList);
    const folderName = files[0]?.webkitRelativePath?.split('/')[0] || 'Project';

    // Categorize files
    const htmlFiles = [];
    const cssFiles = [];
    const jsFiles = [];
    const jsxFiles = [];
    const imageFiles = [];
    const jsonFiles = [];

    for (const file of files) {
      const name = file.name.toLowerCase();
      const path = file.webkitRelativePath || file.name;
      // Skip hidden files/folders and node_modules
      if (path.includes('/node_modules/') || path.includes('/.')) continue;

      if (name.endsWith('.html') || name.endsWith('.htm')) {
        htmlFiles.push(file);
      } else if (name.endsWith('.css')) {
        cssFiles.push(file);
      } else if (name.endsWith('.tsx') || name.endsWith('.jsx')) {
        jsxFiles.push(file);
      } else if (name.endsWith('.js') || name.endsWith('.mjs')) {
        jsFiles.push(file);
      } else if (/\.(png|jpg|jpeg|gif|svg|webp|ico|bmp)$/.test(name)) {
        imageFiles.push(file);
      } else if (name.endsWith('.json') && name !== 'package.json' && name !== 'package-lock.json') {
        jsonFiles.push(file);
      }
    }

    if (htmlFiles.length === 0 && jsxFiles.length === 0) {
      this._bus.emit('toast:show', { message: 'No HTML or JSX/TSX files found in folder', type: 'error' });
      return;
    }

    // Build image data URL map (relative path -> dataURL)
    const imageMap = {};
    for (const imgFile of imageFiles) {
      try {
        const dataUrl = await this._readFileAsDataURL(imgFile);
        const relativePath = imgFile.webkitRelativePath
          ? imgFile.webkitRelativePath.split('/').slice(1).join('/')
          : imgFile.name;
        imageMap[relativePath] = dataUrl;
        imageMap[imgFile.name] = dataUrl;
      } catch (_) {}
    }

    // Parse entry HTML
    const parser = new DOMParser();
    let pageTitle = folderName;
    let pageLang = 'en';
    let hasHTMLContent = false;

    if (htmlFiles.length > 0) {
      const entryFile = htmlFiles.find(f => f.name.toLowerCase() === 'index.html') || htmlFiles[0];
      const htmlText = await entryFile.text();
      const doc = parser.parseFromString(htmlText, 'text/html');
      pageTitle = doc.title || folderName;
      pageLang = doc.documentElement.getAttribute('lang') || 'en';
    }

    const root = createComponentNode('page', { title: pageTitle, lang: pageLang });

    if (htmlFiles.length > 0) {
      const entryFile = htmlFiles.find(f => f.name.toLowerCase() === 'index.html') || htmlFiles[0];
      const htmlText = await entryFile.text();
      const doc = parser.parseFromString(htmlText, 'text/html');
      const mainContent = doc.querySelector('main') || doc.body;
      this._parseHTMLNode(mainContent, root, imageMap);
      hasHTMLContent = root.children && root.children.length > 0;

      const otherHTML = htmlFiles.filter(f => f !== entryFile);
      for (const extraFile of otherHTML) {
        try {
          const text = await extraFile.text();
          const extraDoc = parser.parseFromString(text, 'text/html');
          const section = createComponentNode('section', {
            label: extraDoc.title || extraFile.name.replace(/\.(html|htm)$/i, '')
          });
          const pageContent = extraDoc.querySelector('main') || extraDoc.body;
          this._parseHTMLNode(pageContent, section, imageMap);
          if (section.children && section.children.length > 0) {
            if (!root.children) root.children = [];
            root.children.push(section);
            hasHTMLContent = true;
          }
        } catch (_) {}
      }
    }

    // If HTML had no meaningful content, parse JSX/TSX files
    if (!hasHTMLContent && jsxFiles.length > 0) {
      // Build SVG path data map from svg-*.ts/tsx files in the folder
      const svgDataMap = {};
      const svgDataFiles = files.filter(f => {
        const name = f.name.toLowerCase();
        return name.startsWith('svg-') && (name.endsWith('.ts') || name.endsWith('.tsx'));
      });
      for (const svgFile of svgDataFiles) {
        try {
          const svgSource = await svgFile.text();
          const baseName = svgFile.name.toLowerCase().replace(/\.(ts|tsx)$/, '');
          svgDataMap[baseName] = this._parseSvgDataFile(svgSource);
        } catch (_) {}
      }

      const pageFileList = jsxFiles.filter(file => {
        const name = file.name.toLowerCase();
        const fullPath = (file.webkitRelativePath || file.name).toLowerCase();
        if (name.startsWith('svg-')) return false;
        if (name === 'utils.ts' || name === 'utils.tsx') return false;
        if (name.endsWith('.d.ts') || name.endsWith('.d.tsx')) return false;
        if (fullPath.includes('/ui/') || fullPath.includes('/primitives/')) return false;
        if (fullPath.includes('/context/') || fullPath.includes('/hooks/')) return false;
        if (name === 'main.tsx' || name === 'main.jsx') return false;
        return true;
      });

      pageFileList.sort((a, b) => {
        const aPath = (a.webkitRelativePath || a.name).toLowerCase();
        const bPath = (b.webkitRelativePath || b.name).toLowerCase();
        const aPriority = aPath.includes('/pages/') ? 0 :
          (aPath.includes('/components/') && !aPath.includes('/ui/')) ? 1 :
          aPath.includes('/imports/') ? 2 : 3;
        const bPriority = bPath.includes('/pages/') ? 0 :
          (bPath.includes('/components/') && !bPath.includes('/ui/')) ? 1 :
          bPath.includes('/imports/') ? 2 : 3;
        return aPriority - bPriority;
      });

      const jsxSources = [];
      for (const file of pageFileList.slice(0, 25)) {
        try {
          const source = await file.text();
          if (source.length < 100 || source.length > 200000) continue;
          if (!source.match(/return\s*[\(<]/)) continue;
          jsxSources.push({ name: file.name, source });
        } catch (_) {}
      }

      if (jsxSources.length > 0) {
        this._parseJSXFiles(jsxSources, root, imageMap, svgDataMap);
      }
    }

    // Apply to state
    const stateDoc = this._state.document || this._state._state?.document;
    if (stateDoc) {
      stateDoc.root = root;
      this._bus.emit('document:changed', { action: 'import' });
      this._bus.emit('state:document', { value: stateDoc });
    }

    dialog.close();
    dialog.remove();

    const summary = [
      htmlFiles.length ? `${htmlFiles.length} HTML` : '',
      jsxFiles.length ? `${jsxFiles.length} JSX/TSX` : '',
      cssFiles.length ? `${cssFiles.length} CSS` : '',
      imageFiles.length ? `${imageFiles.length} images` : '',
      jsFiles.length ? `${jsFiles.length} JS` : ''
    ].filter(Boolean).join(', ');

    this._bus.emit('toast:show', {
      message: `Imported "${folderName}" (${summary})`,
      type: 'success'
    });
  }

  _readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Convert JSX/TSX source code to HTML for parsing.
   * Extracts the return statement's JSX and converts React syntax to standard HTML.
   */
  _jsxToHTML(source, componentName = '', svgDataMap = {}) {
    // Parse SVG data imports from the source before extracting JSX
    const svgImports = {};
    const importRegex = /import\s+(\w+)\s+from\s+["'][^"']*\/(svg-[\w-]+)["']/g;
    let im;
    while ((im = importRegex.exec(source)) !== null) {
      const varName = im[1];
      const svgFileName = im[2];
      if (svgDataMap[svgFileName]) {
        svgImports[varName] = svgDataMap[svgFileName];
      }
    }

    // Extract JSX from ALL return statements (handles multi-function component files)
    const allReturns = this._extractAllJSXReturns(source);
    if (!allReturns.length) return '';
    let jsx = allReturns.join('\n');

    // Resolve SVG path data references {varName.propName} → actual path data
    for (const [varName, data] of Object.entries(svgImports)) {
      const refRegex = new RegExp(`\\{${varName}\\.(\\w+)\\}`, 'g');
      jsx = jsx.replace(refRegex, (match, prop) => {
        return data[prop] !== undefined ? `"${data[prop]}"` : '""';
      });
    }

    // Convert JSX syntax to HTML
    // 1. motion.X -> X (Framer Motion components)
    jsx = jsx.replace(/<\/?motion\.(\w+)/g, (m, tag) => m.replace(`motion.${tag}`, tag));

    // 2. Remove JSX comments {/* ... */}
    jsx = jsx.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');

    // 3. className -> class
    jsx = jsx.replace(/\bclassName=/g, 'class=');

    // 4. Extract animation target values before stripping them
    //    Convert Framer Motion animate props to inline CSS
    jsx = this._convertAnimateToCSS(jsx);

    // 4b. Remove React event handlers and framework-specific attributes
    jsx = jsx.replace(/\s+on[A-Z]\w*=\{[^}]*\}/g, '');
    // Remove Framer Motion / React-specific props with object values
    jsx = jsx.replace(/\s+(?:initial|animate|exit|transition|whileHover|whileTap|whileInView|whileFocus|whileDrag|layout|variants|ref|key|dangerouslySetInnerHTML)=\{\{[\s\S]*?\}\}/g, '');
    jsx = jsx.replace(/\s+(?:initial|animate|exit|transition|whileHover|whileTap|whileInView|whileFocus|whileDrag|layout|variants|ref|key)=\{[^}]*\}/g, '');

    // 5. Convert style={{...}} JSX objects to inline CSS
    //    Use balanced brace matching to handle nested objects/strings correctly
    jsx = this._replaceStyleObjects(jsx);

    // 6. Remove JSX expressions {variable} but keep text content
    //    - Keep simple string expressions {"text"}
    //    - Remove complex expressions {func()} {condition && <...>} etc.
    jsx = jsx.replace(/\{["'`]([^"'`]*?)["'`]\}/g, '$1'); // {"text"} -> text
    jsx = jsx.replace(/\{`([^`]*?)`\}/g, '$1'); // {`template`} -> template (simplified)

    // 7. Remove conditional renders {condition && <...>} and ternaries
    //    Strip the condition wrapper, keep the JSX content inside
    jsx = jsx.replace(/\{[\w.!()]+\s*&&\s*/g, ''); // remove {condition &&
    jsx = jsx.replace(/\{[\w.!()]+\s*\?\s*/g, '');  // remove {condition ?
    jsx = jsx.replace(/\s*:\s*null\s*\}/g, '');    // remove : null}
    jsx = jsx.replace(/\s*:\s*undefined\s*\}/g, ''); // remove : undefined}

    // 8. Remove remaining JSX expressions that aren't HTML (but keep <tags>)
    jsx = jsx.replace(/\{[^}<]*\}/g, '');

    // 9. Replace custom components with div (PascalCase tags)
    //    Keep standard HTML tags, convert custom ones
    jsx = jsx.replace(/<\/?([A-Z][\w.]*)/g, (match, name) => {
      // Map common component names to semantic HTML
      const mapping = {
        'Card': 'div', 'Button': 'button', 'Input': 'input',
        'Link': 'a', 'Image': 'img', 'Text': 'span',
        'Heading': 'h2', 'Container': 'div', 'Box': 'div',
        'Flex': 'div', 'Grid': 'div', 'Stack': 'div',
        'Section': 'section', 'Header': 'header', 'Footer': 'footer',
        'Nav': 'nav', 'Main': 'main', 'Aside': 'aside',
        'Form': 'form', 'Label': 'label', 'Select': 'select',
        'Textarea': 'textarea', 'Dialog': 'dialog',
        'AnimatePresence': 'div', 'Fragment': 'div'
      };
      const simpleName = name.split('.').pop();
      const htmlTag = mapping[simpleName] || 'div';
      return match[1] === '/' ? `</${htmlTag}` : `<${htmlTag}`;
    });

    // 10. Convert camelCase SVG attributes to kebab-case
    jsx = jsx.replace(/\bfillRule=/g, 'fill-rule=');
    jsx = jsx.replace(/\bclipRule=/g, 'clip-rule=');
    jsx = jsx.replace(/\bstrokeWidth=/g, 'stroke-width=');
    jsx = jsx.replace(/\bstrokeLinecap=/g, 'stroke-linecap=');
    jsx = jsx.replace(/\bstrokeLinejoin=/g, 'stroke-linejoin=');
    jsx = jsx.replace(/\bviewBox=/g, 'viewBox=');

    // 11. Remove attributes with JSX expression values attr={...} that remain
    jsx = jsx.replace(/\s+[\w-]+=\{[^}]*\}/g, '');

    // 12. Clean up self-closing tags that HTML needs closed
    jsx = jsx.replace(/<(div|span|section|article|nav|header|footer|main|aside|button|a|p|h[1-6]|ul|ol|li|form|label|table)\s*\/>/g, '<$1></$1>');

    // 13. Clean up extra whitespace
    jsx = jsx.replace(/\n\s*\n\s*\n/g, '\n\n');

    return jsx.trim();
  }

  _extractJSXReturn(source) {
    // Find "return (" and extract the balanced JSX block
    const returnMatch = source.match(/return\s*\(/);
    if (!returnMatch) {
      // Try "return <" (no parens)
      const returnTag = source.match(/return\s*(<[\s\S]*)/);
      if (returnTag) {
        // Find the end of the JSX (matching closing tag or end of function)
        return this._extractBalancedJSX(returnTag[1]);
      }
      return null;
    }

    const startIdx = returnMatch.index + returnMatch[0].length;
    let depth = 1;
    let i = startIdx;
    while (i < source.length && depth > 0) {
      const ch = source[i];
      if (ch === '(') depth++;
      else if (ch === ')') depth--;
      // Skip strings
      else if (ch === '"' || ch === "'" || ch === '`') {
        const quote = ch;
        i++;
        while (i < source.length && source[i] !== quote) {
          if (source[i] === '\\') i++;
          i++;
        }
      }
      if (depth > 0) i++;
    }

    return source.slice(startIdx, i).trim();
  }

  /**
   * Extract JSX from ALL return statements in a source file.
   * Handles multi-function component files (e.g., SunCharacter + AngrySun + NeutralSun).
   */
  _extractAllJSXReturns(source) {
    const results = [];
    const regex = /return\s*\(/g;
    let match;
    while ((match = regex.exec(source)) !== null) {
      const startIdx = match.index + match[0].length;
      let depth = 1;
      let i = startIdx;
      while (i < source.length && depth > 0) {
        const ch = source[i];
        if (ch === '(') depth++;
        else if (ch === ')') depth--;
        else if (ch === '"' || ch === "'" || ch === '`') {
          const quote = ch;
          i++;
          while (i < source.length && source[i] !== quote) {
            if (source[i] === '\\') i++;
            i++;
          }
        }
        if (depth > 0) i++;
      }
      const jsx = source.slice(startIdx, i).trim();
      if (jsx.length > 5 && jsx.includes('<')) {
        results.push(jsx);
      }
    }

    // Also handle "return <tag>" (no parens) — find any not already covered
    const tagRegex = /return\s+(<[A-Za-z])/g;
    while ((match = tagRegex.exec(source)) !== null) {
      // Check this isn't already covered by a "return (" match
      const nearbyParen = source.lastIndexOf('return (', match.index + 10);
      if (nearbyParen >= 0 && nearbyParen >= match.index - 5) continue;
      const remainder = source.slice(match.index + 7); // skip "return "
      const jsx = this._extractBalancedJSX(remainder);
      if (jsx && jsx.length > 5) {
        results.push(jsx);
      }
    }

    return results;
  }

  _extractBalancedJSX(source) {
    // Extract until we find the matching closing tag
    let depth = 0;
    let i = 0;
    let started = false;
    while (i < source.length) {
      if (source[i] === '<') {
        if (source[i + 1] === '/') {
          depth--;
          if (started && depth <= 0) {
            // Find the end of this closing tag
            const end = source.indexOf('>', i);
            return source.slice(0, end + 1);
          }
        } else if (source[i + 1] !== '!' && source[i + 1] !== ' ') {
          depth++;
          started = true;
          // Check for self-closing
          const tagEnd = source.indexOf('>', i);
          if (tagEnd > 0 && source[tagEnd - 1] === '/') {
            depth--;
          }
        }
      }
      i++;
    }
    return source.slice(0, Math.min(source.length, 5000));
  }

  /**
   * Parse JSX/TSX component files into component nodes.
   * Extracts JSX, converts to HTML, then parses through the standard HTML parser.
   */
  _parseJSXFiles(jsxSources, parentNode, imageMap = {}, svgDataMap = {}) {
    const parser = new DOMParser();
    this._pendingKeyframes = [];

    for (const { name, source } of jsxSources) {
      const html = this._jsxToHTML(source, name, svgDataMap);
      if (!html) continue;

      // Wrap in a body for DOMParser
      const doc = parser.parseFromString(`<body>${html}</body>`, 'text/html');
      if (!doc.body || !doc.body.children.length) continue;

      // Create a section for each page/component
      const section = createComponentNode('section', {
        label: name.replace(/\.(tsx|jsx|js|ts)$/i, '')
      });

      this._parseHTMLNode(doc.body, section, imageMap);

      if (section.children && section.children.length > 0) {
        if (!parentNode.children) parentNode.children = [];
        parentNode.children.push(section);
      }
    }

    // Store animation keyframes on the root node for the renderer to inject
    if (this._pendingKeyframes.length > 0) {
      parentNode.animationCSS = this._pendingKeyframes.join('\n');
      this._pendingKeyframes = [];
    }
  }

  /**
   * Parse SVG data file (export default { key: "path data", ... }).
   */
  _parseSvgDataFile(source) {
    const match = source.match(/export\s+default\s*\{([\s\S]*)\}/);
    if (!match) return {};
    const inner = match[1];
    const data = {};
    const pairRegex = /(\w+)\s*:\s*"((?:[^"\\]|\\.)*)"/g;
    let m;
    while ((m = pairRegex.exec(inner)) !== null) {
      data[m[1]] = m[2];
    }
    return data;
  }

  /**
   * Extract Framer Motion animate={{...}} values and convert to inline CSS.
   * Handles simple transforms (scale, rotate, x, y) and opacity.
   * Array values create CSS keyframe animation references.
   */
  _convertAnimateToCSS(jsx) {
    // Counter for unique animation names
    let animCount = 0;
    const keyframesCSS = [];

    // Match animate={{...}} props and convert to inline CSS
    // Use a non-greedy approach to find animate props
    jsx = jsx.replace(/(\s+)animate=\{\{([\s\S]*?)\}\}/g, (match, space, animProps) => {
      const cssProps = [];
      const transforms = [];
      let hasArrayAnim = false;
      const arrayAnims = {};

      // Parse key: value pairs from the animate object
      // Handle both simple values and arrays
      const cleanProps = animProps.replace(/\/\/[^\n]*/g, '');
      const pairs = [];
      let depth = 0;
      let current = '';
      for (let i = 0; i < cleanProps.length; i++) {
        const ch = cleanProps[i];
        if (ch === '[' || ch === '{') depth++;
        else if (ch === ']' || ch === '}') depth--;
        else if (ch === ',' && depth === 0) {
          pairs.push(current.trim());
          current = '';
          continue;
        }
        current += ch;
      }
      if (current.trim()) pairs.push(current.trim());

      for (const pair of pairs) {
        const colonIdx = pair.indexOf(':');
        if (colonIdx === -1) continue;
        const key = pair.slice(0, colonIdx).trim();
        let value = pair.slice(colonIdx + 1).trim();

        // Array values → keyframe animations
        const arrMatch = value.match(/^\[([\d.,\s-]+)\]$/);
        if (arrMatch) {
          hasArrayAnim = true;
          const vals = arrMatch[1].split(',').map(v => parseFloat(v.trim()));
          arrayAnims[key] = vals;
          continue;
        }

        // Simple numeric/string values → static CSS
        const numVal = parseFloat(value);
        if (key === 'opacity' && !isNaN(numVal)) cssProps.push(`opacity: ${numVal}`);
        else if (key === 'scale' && !isNaN(numVal)) transforms.push(`scale(${numVal})`);
        else if (key === 'rotate' && !isNaN(numVal)) transforms.push(`rotate(${numVal}deg)`);
        else if (key === 'x' && !isNaN(numVal)) transforms.push(`translateX(${numVal}px)`);
        else if (key === 'y' && !isNaN(numVal)) transforms.push(`translateY(${numVal}px)`);
        else if (key === 'width') cssProps.push(`width: ${value.replace(/['"]/g, '')}`);
        else if (key === 'height') cssProps.push(`height: ${value.replace(/['"]/g, '')}`);
      }

      // Generate CSS keyframe animation for array values
      if (hasArrayAnim) {
        const animName = `am-anim-${++animCount}`;
        const frameKeys = Object.keys(arrayAnims);
        const numFrames = Math.max(...frameKeys.map(k => arrayAnims[k].length));
        const keyframeSteps = [];
        for (let f = 0; f < numFrames; f++) {
          const pct = numFrames === 1 ? '0%, 100%' :
            f === 0 ? '0%' :
            f === numFrames - 1 ? '100%' :
            `${Math.round((f / (numFrames - 1)) * 100)}%`;
          const stepTransforms = [];
          const stepProps = [];
          for (const k of frameKeys) {
            const vals = arrayAnims[k];
            const v = vals[Math.min(f, vals.length - 1)];
            if (k === 'opacity') stepProps.push(`opacity: ${v}`);
            else if (k === 'scale') stepTransforms.push(`scale(${v})`);
            else if (k === 'rotate') stepTransforms.push(`rotate(${v}deg)`);
            else if (k === 'x') stepTransforms.push(`translateX(${v}px)`);
            else if (k === 'y') stepTransforms.push(`translateY(${v}px)`);
          }
          if (stepTransforms.length) stepProps.push(`transform: ${stepTransforms.join(' ')}`);
          keyframeSteps.push(`${pct} { ${stepProps.join('; ')} }`);
        }
        keyframesCSS.push(`@keyframes ${animName} { ${keyframeSteps.join(' ')} }`);
        cssProps.push(`animation: ${animName} 3s ease-in-out infinite`);
      }

      if (transforms.length) cssProps.push(`transform: ${transforms.join(' ')}`);

      if (cssProps.length) {
        return `${space}data-am-animate="${cssProps.join('; ')}"`;
      }
      return '';
    });

    // Store keyframes for later injection
    if (keyframesCSS.length) {
      this._pendingKeyframes = (this._pendingKeyframes || []).concat(keyframesCSS);
    }

    return jsx;
  }

  /**
   * Replace all style={{...}} JSX objects with inline style="..." attributes.
   * Uses balanced brace matching to handle nested strings/objects correctly.
   */
  _replaceStyleObjects(jsx) {
    const marker = 'style={{';
    let result = '';
    let pos = 0;
    while (pos < jsx.length) {
      const idx = jsx.indexOf(marker, pos);
      if (idx === -1) {
        result += jsx.slice(pos);
        break;
      }
      result += jsx.slice(pos, idx);
      // Find balanced closing }} starting after the opening {{
      let depth = 2; // we've seen {{
      let i = idx + marker.length;
      let inStr = false;
      let strChar = '';
      while (i < jsx.length && depth > 0) {
        const ch = jsx[i];
        if (inStr) {
          if (ch === '\\') { i++; }
          else if (ch === strChar) { inStr = false; }
        } else {
          if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strChar = ch; }
          else if (ch === '{') depth++;
          else if (ch === '}') depth--;
        }
        if (depth > 0) i++;
      }
      // Extract the inner content (between {{ and }})
      const inner = jsx.slice(idx + marker.length, i - 1);
      try {
        const css = this._parseJSXStyleObject(inner);
        result += css ? `style="${css}"` : '';
      } catch {
        result += '';
      }
      pos = i + 1; // skip the final }
    }
    return result;
  }

  /**
   * Parse JSX style={{...}} object into CSS string.
   * Handles nested quotes, url() values, and complex expressions.
   */
  _parseJSXStyleObject(inner) {
    const cleaned = inner.replace(/\/\/[^\n]*/g, '');
    // Split on commas that are at top level (not nested in parens, quotes, or brackets)
    const pairs = [];
    let depth = 0;
    let inStr = false;
    let strChar = '';
    let current = '';
    for (let i = 0; i < cleaned.length; i++) {
      const ch = cleaned[i];
      if (inStr) {
        current += ch;
        if (ch === '\\') { current += cleaned[++i] || ''; continue; }
        if (ch === strChar) inStr = false;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strChar = ch; current += ch; continue; }
      if (ch === '(' || ch === '[' || ch === '{') depth++;
      else if (ch === ')' || ch === ']' || ch === '}') depth--;
      if (ch === ',' && depth === 0) {
        pairs.push(current.trim());
        current = '';
        continue;
      }
      current += ch;
    }
    if (current.trim()) pairs.push(current.trim());

    return pairs.map(pair => {
      pair = pair.trim();
      if (!pair) return '';
      const colonIdx = pair.indexOf(':');
      if (colonIdx === -1) return '';
      const k = pair.slice(0, colonIdx).trim().replace(/["']/g, '');
      let v = pair.slice(colonIdx + 1).trim();
      // Remove trailing comma
      v = v.replace(/,\s*$/, '');
      // Remove outer quotes but preserve inner content
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      // Remove template literal backticks
      if (v.startsWith('`') && v.endsWith('`')) {
        v = v.slice(1, -1);
      }
      // camelCase to kebab-case
      const cssKey = k.replace(/([A-Z])/g, '-$1').toLowerCase();
      // Skip pure JS expressions (arrow functions, method calls without CSS-like content)
      if (v.includes('=>') || v.includes('? ') || (v.includes('(') && !v.includes('url') && !v.includes('gradient') && !v.includes('px') && !v.includes('rgb') && !v.includes('deg') && !v.includes('%') && !v.includes('calc') && !v.includes('var('))) return '';
      return `${cssKey}: ${v}`;
    }).filter(Boolean).join('; ');
  }

  /**
   * Convert Tailwind CSS utility classes to inline style object.
   * Handles common layout, sizing, color, position, typography, and visual classes.
   */
  _tailwindToStyles(classStr) {
    if (!classStr) return {};
    const styles = {};
    const classes = classStr.split(/\s+/).filter(Boolean);

    for (const cls of classes) {
      // Strip responsive prefixes (sm:, md:, lg:, etc.) — use the style regardless
      const c = cls.replace(/^(sm|md|lg|xl|2xl|hover|focus|active|disabled|dark|group-hover|peer):/, '');

      // Arbitrary values: extract from bracket notation
      const arbMatch = c.match(/^([\w-]+)-\[(.+)\]$/);
      const arbVal = arbMatch ? arbMatch[2] : null;
      const arbProp = arbMatch ? arbMatch[1] : null;

      // Position
      if (c === 'absolute') styles.position = 'absolute';
      else if (c === 'relative') styles.position = 'relative';
      else if (c === 'fixed') styles.position = 'fixed';
      else if (c === 'sticky') styles.position = 'sticky';
      else if (c === 'static') styles.position = 'static';

      // Display
      else if (c === 'flex') styles.display = 'flex';
      else if (c === 'inline-flex') styles.display = 'inline-flex';
      else if (c === 'grid') styles.display = 'grid';
      else if (c === 'inline-grid') styles.display = 'inline-grid';
      else if (c === 'block') styles.display = 'block';
      else if (c === 'inline-block') styles.display = 'inline-block';
      else if (c === 'inline') styles.display = 'inline';
      else if (c === 'hidden') styles.display = 'none';
      else if (c === 'contents') styles.display = 'contents';

      // Flex direction/wrap/align/justify
      else if (c === 'flex-row') styles.flexDirection = 'row';
      else if (c === 'flex-col') styles.flexDirection = 'column';
      else if (c === 'flex-row-reverse') styles.flexDirection = 'row-reverse';
      else if (c === 'flex-col-reverse') styles.flexDirection = 'column-reverse';
      else if (c === 'flex-wrap') styles.flexWrap = 'wrap';
      else if (c === 'flex-nowrap') styles.flexWrap = 'nowrap';
      else if (c === 'flex-1') styles.flex = '1 1 0%';
      else if (c === 'flex-auto') styles.flex = '1 1 auto';
      else if (c === 'flex-initial') styles.flex = '0 1 auto';
      else if (c === 'flex-none') styles.flex = 'none';
      else if (c === 'grow') styles.flexGrow = '1';
      else if (c === 'grow-0') styles.flexGrow = '0';
      else if (c === 'shrink') styles.flexShrink = '1';
      else if (c === 'shrink-0') styles.flexShrink = '0';
      else if (c === 'items-center') styles.alignItems = 'center';
      else if (c === 'items-start') styles.alignItems = 'flex-start';
      else if (c === 'items-end') styles.alignItems = 'flex-end';
      else if (c === 'items-stretch') styles.alignItems = 'stretch';
      else if (c === 'items-baseline') styles.alignItems = 'baseline';
      else if (c === 'justify-center') styles.justifyContent = 'center';
      else if (c === 'justify-start') styles.justifyContent = 'flex-start';
      else if (c === 'justify-end') styles.justifyContent = 'flex-end';
      else if (c === 'justify-between') styles.justifyContent = 'space-between';
      else if (c === 'justify-around') styles.justifyContent = 'space-around';
      else if (c === 'justify-evenly') styles.justifyContent = 'space-evenly';
      else if (c === 'self-center') styles.alignSelf = 'center';
      else if (c === 'self-start') styles.alignSelf = 'flex-start';
      else if (c === 'self-end') styles.alignSelf = 'flex-end';
      else if (c === 'self-auto') styles.alignSelf = 'auto';
      else if (c === 'self-stretch') styles.alignSelf = 'stretch';

      // Overflow
      else if (c === 'overflow-hidden') styles.overflow = 'hidden';
      else if (c === 'overflow-auto') styles.overflow = 'auto';
      else if (c === 'overflow-scroll') styles.overflow = 'scroll';
      else if (c === 'overflow-visible') styles.overflow = 'visible';
      else if (c === 'overflow-x-hidden') styles.overflowX = 'hidden';
      else if (c === 'overflow-y-hidden') styles.overflowY = 'hidden';
      else if (c === 'overflow-x-auto') styles.overflowX = 'auto';
      else if (c === 'overflow-y-auto') styles.overflowY = 'auto';

      // Width/height arbitrary values
      else if (arbProp === 'w') styles.width = arbVal;
      else if (arbProp === 'h') styles.height = arbVal;
      else if (arbProp === 'min-w') styles.minWidth = arbVal;
      else if (arbProp === 'min-h') styles.minHeight = arbVal;
      else if (arbProp === 'max-w') styles.maxWidth = arbVal;
      else if (arbProp === 'max-h') styles.maxHeight = arbVal;

      // Width/height named values
      else if (c === 'w-full') styles.width = '100%';
      else if (c === 'w-screen') styles.width = '100vw';
      else if (c === 'w-auto') styles.width = 'auto';
      else if (c === 'w-fit') styles.width = 'fit-content';
      else if (c === 'w-min') styles.width = 'min-content';
      else if (c === 'w-max') styles.width = 'max-content';
      else if (c === 'h-full') styles.height = '100%';
      else if (c === 'h-screen') styles.height = '100vh';
      else if (c === 'h-auto') styles.height = 'auto';
      else if (c === 'h-fit') styles.height = 'fit-content';
      else if (c === 'h-min') styles.height = 'min-content';
      else if (c === 'h-max') styles.height = 'max-content';
      else if (c === 'min-h-screen') styles.minHeight = '100vh';
      else if (c === 'min-w-full') styles.minWidth = '100%';

      // Width/height with spacing scale (w-N -> N*4px)
      else if (/^w-(\d+)$/.test(c)) { const n = parseInt(c.slice(2)); styles.width = (n * 4) + 'px'; }
      else if (/^h-(\d+)$/.test(c)) { const n = parseInt(c.slice(2)); styles.height = (n * 4) + 'px'; }
      else if (/^w-(\d+)\/(\d+)$/.test(c)) { const m = c.match(/^w-(\d+)\/(\d+)$/); styles.width = `${(parseInt(m[1]) / parseInt(m[2]) * 100).toFixed(4)}%`; }

      // Inset/positioning arbitrary
      else if (arbProp === 'top') styles.top = arbVal;
      else if (arbProp === 'right') styles.right = arbVal;
      else if (arbProp === 'bottom') styles.bottom = arbVal;
      else if (arbProp === 'left') styles.left = arbVal;
      else if (arbProp === 'inset') { styles.top = arbVal; styles.right = arbVal; styles.bottom = arbVal; styles.left = arbVal; }
      else if (c === 'inset-0') { styles.top = '0'; styles.right = '0'; styles.bottom = '0'; styles.left = '0'; }
      else if (c === 'top-0') styles.top = '0';
      else if (c === 'right-0') styles.right = '0';
      else if (c === 'bottom-0') styles.bottom = '0';
      else if (c === 'left-0') styles.left = '0';
      // Numeric positioning (top-N, left-N, etc.)
      else if (/^top-(\d+)$/.test(c)) { styles.top = (parseInt(c.slice(4)) * 4) + 'px'; }
      else if (/^right-(\d+)$/.test(c)) { styles.right = (parseInt(c.slice(6)) * 4) + 'px'; }
      else if (/^bottom-(\d+)$/.test(c)) { styles.bottom = (parseInt(c.slice(7)) * 4) + 'px'; }
      else if (/^left-(\d+)$/.test(c)) { styles.left = (parseInt(c.slice(5)) * 4) + 'px'; }

      // Margin (m-, mx-, my-, mt-, mr-, mb-, ml-)
      else if (arbProp === 'm') { styles.margin = arbVal; }
      else if (arbProp === 'mx') { styles.marginLeft = arbVal; styles.marginRight = arbVal; }
      else if (arbProp === 'my') { styles.marginTop = arbVal; styles.marginBottom = arbVal; }
      else if (arbProp === 'mt') styles.marginTop = arbVal;
      else if (arbProp === 'mr') styles.marginRight = arbVal;
      else if (arbProp === 'mb') styles.marginBottom = arbVal;
      else if (arbProp === 'ml') styles.marginLeft = arbVal;
      else if (c === 'mx-auto') { styles.marginLeft = 'auto'; styles.marginRight = 'auto'; }
      else if (/^m-(\d+)$/.test(c)) { styles.margin = (parseInt(c.slice(2)) * 4) + 'px'; }
      else if (/^mt-(\d+)$/.test(c)) { styles.marginTop = (parseInt(c.slice(3)) * 4) + 'px'; }
      else if (/^mb-(\d+)$/.test(c)) { styles.marginBottom = (parseInt(c.slice(3)) * 4) + 'px'; }
      else if (/^ml-(\d+)$/.test(c)) { styles.marginLeft = (parseInt(c.slice(3)) * 4) + 'px'; }
      else if (/^mr-(\d+)$/.test(c)) { styles.marginRight = (parseInt(c.slice(3)) * 4) + 'px'; }
      else if (/^mx-(\d+)$/.test(c)) { const v = (parseInt(c.slice(3)) * 4) + 'px'; styles.marginLeft = v; styles.marginRight = v; }
      else if (/^my-(\d+)$/.test(c)) { const v = (parseInt(c.slice(3)) * 4) + 'px'; styles.marginTop = v; styles.marginBottom = v; }

      // Padding (p-, px-, py-, pt-, pr-, pb-, pl-)
      else if (arbProp === 'p') { styles.padding = arbVal; }
      else if (arbProp === 'px') { styles.paddingLeft = arbVal; styles.paddingRight = arbVal; }
      else if (arbProp === 'py') { styles.paddingTop = arbVal; styles.paddingBottom = arbVal; }
      else if (arbProp === 'pt') styles.paddingTop = arbVal;
      else if (arbProp === 'pr') styles.paddingRight = arbVal;
      else if (arbProp === 'pb') styles.paddingBottom = arbVal;
      else if (arbProp === 'pl') styles.paddingLeft = arbVal;
      else if (/^p-(\d+)$/.test(c)) { styles.padding = (parseInt(c.slice(2)) * 4) + 'px'; }
      else if (/^pt-(\d+)$/.test(c)) { styles.paddingTop = (parseInt(c.slice(3)) * 4) + 'px'; }
      else if (/^pb-(\d+)$/.test(c)) { styles.paddingBottom = (parseInt(c.slice(3)) * 4) + 'px'; }
      else if (/^pl-(\d+)$/.test(c)) { styles.paddingLeft = (parseInt(c.slice(3)) * 4) + 'px'; }
      else if (/^pr-(\d+)$/.test(c)) { styles.paddingRight = (parseInt(c.slice(3)) * 4) + 'px'; }
      else if (/^px-(\d+)$/.test(c)) { const v = (parseInt(c.slice(3)) * 4) + 'px'; styles.paddingLeft = v; styles.paddingRight = v; }
      else if (/^py-(\d+)$/.test(c)) { const v = (parseInt(c.slice(3)) * 4) + 'px'; styles.paddingTop = v; styles.paddingBottom = v; }

      // Gap
      else if (arbProp === 'gap') styles.gap = arbVal;
      else if (/^gap-(\d+)$/.test(c)) { styles.gap = (parseInt(c.slice(4)) * 4) + 'px'; }
      else if (arbProp === 'gap-x') styles.columnGap = arbVal;
      else if (arbProp === 'gap-y') styles.rowGap = arbVal;

      // Background color
      else if (arbProp === 'bg' && arbVal && (arbVal.startsWith('#') || arbVal.startsWith('rgb'))) styles.backgroundColor = arbVal;
      else if (arbProp === 'bg' && arbVal && (arbVal.startsWith('url') || arbVal.startsWith('linear-gradient') || arbVal.startsWith('radial-gradient'))) styles.backgroundImage = arbVal;
      else if (c === 'bg-transparent') styles.backgroundColor = 'transparent';
      else if (c === 'bg-white') styles.backgroundColor = '#ffffff';
      else if (c === 'bg-black') styles.backgroundColor = '#000000';
      else if (/^bg-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(\d+)$/.test(c)) {
        styles.backgroundColor = this._tailwindColorLookup(c.slice(3));
      }
      // Background size/position/repeat
      else if (c === 'bg-cover') styles.backgroundSize = 'cover';
      else if (c === 'bg-contain') styles.backgroundSize = 'contain';
      else if (c === 'bg-auto') styles.backgroundSize = 'auto';
      else if (c === 'bg-center') styles.backgroundPosition = 'center';
      else if (c === 'bg-top') styles.backgroundPosition = 'top';
      else if (c === 'bg-bottom') styles.backgroundPosition = 'bottom';
      else if (c === 'bg-left') styles.backgroundPosition = 'left';
      else if (c === 'bg-right') styles.backgroundPosition = 'right';
      else if (c === 'bg-no-repeat') styles.backgroundRepeat = 'no-repeat';
      else if (c === 'bg-repeat') styles.backgroundRepeat = 'repeat';
      else if (c === 'bg-repeat-x') styles.backgroundRepeat = 'repeat-x';
      else if (c === 'bg-repeat-y') styles.backgroundRepeat = 'repeat-y';

      // Text color
      else if (arbProp === 'text' && arbVal && (arbVal.startsWith('#') || arbVal.startsWith('rgb'))) styles.color = arbVal;
      else if (c === 'text-white') styles.color = '#ffffff';
      else if (c === 'text-black') styles.color = '#000000';
      else if (c === 'text-transparent') styles.color = 'transparent';
      else if (/^text-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(\d+)$/.test(c)) {
        styles.color = this._tailwindColorLookup(c.slice(5));
      }

      // Font size (text-[...] with px or rem values)
      else if (arbProp === 'text' && arbVal && (arbVal.includes('px') || arbVal.includes('rem') || arbVal.includes('em'))) {
        styles.fontSize = arbVal;
      }
      else if (c === 'text-xs') styles.fontSize = '12px';
      else if (c === 'text-sm') styles.fontSize = '14px';
      else if (c === 'text-base') styles.fontSize = '16px';
      else if (c === 'text-lg') styles.fontSize = '18px';
      else if (c === 'text-xl') styles.fontSize = '20px';
      else if (c === 'text-2xl') styles.fontSize = '24px';
      else if (c === 'text-3xl') styles.fontSize = '30px';
      else if (c === 'text-4xl') styles.fontSize = '36px';
      else if (c === 'text-5xl') styles.fontSize = '48px';
      else if (c === 'text-6xl') styles.fontSize = '60px';
      else if (c === 'text-7xl') styles.fontSize = '72px';
      else if (c === 'text-8xl') styles.fontSize = '96px';
      else if (c === 'text-9xl') styles.fontSize = '128px';

      // Text alignment
      else if (c === 'text-left') styles.textAlign = 'left';
      else if (c === 'text-center') styles.textAlign = 'center';
      else if (c === 'text-right') styles.textAlign = 'right';
      else if (c === 'text-justify') styles.textAlign = 'justify';

      // Font weight
      else if (c === 'font-thin') styles.fontWeight = '100';
      else if (c === 'font-extralight') styles.fontWeight = '200';
      else if (c === 'font-light') styles.fontWeight = '300';
      else if (c === 'font-normal') styles.fontWeight = '400';
      else if (c === 'font-medium') styles.fontWeight = '500';
      else if (c === 'font-semibold') styles.fontWeight = '600';
      else if (c === 'font-bold') styles.fontWeight = '700';
      else if (c === 'font-extrabold') styles.fontWeight = '800';
      else if (c === 'font-black') styles.fontWeight = '900';
      else if (arbProp === 'font' && arbVal && /^\d+$/.test(arbVal)) styles.fontWeight = arbVal;

      // Font style
      else if (c === 'italic') styles.fontStyle = 'italic';
      else if (c === 'not-italic') styles.fontStyle = 'normal';

      // Line height
      else if (arbProp === 'leading') styles.lineHeight = arbVal;
      else if (c === 'leading-none') styles.lineHeight = '1';
      else if (c === 'leading-tight') styles.lineHeight = '1.25';
      else if (c === 'leading-snug') styles.lineHeight = '1.375';
      else if (c === 'leading-normal') styles.lineHeight = '1.5';
      else if (c === 'leading-relaxed') styles.lineHeight = '1.625';
      else if (c === 'leading-loose') styles.lineHeight = '2';
      else if (/^leading-(\d+)$/.test(c)) styles.lineHeight = (parseInt(c.slice(8)) * 4) + 'px';

      // Letter spacing
      else if (arbProp === 'tracking') styles.letterSpacing = arbVal;

      // Border radius
      else if (c === 'rounded') styles.borderRadius = '4px';
      else if (c === 'rounded-sm') styles.borderRadius = '2px';
      else if (c === 'rounded-md') styles.borderRadius = '6px';
      else if (c === 'rounded-lg') styles.borderRadius = '8px';
      else if (c === 'rounded-xl') styles.borderRadius = '12px';
      else if (c === 'rounded-2xl') styles.borderRadius = '16px';
      else if (c === 'rounded-3xl') styles.borderRadius = '24px';
      else if (c === 'rounded-full') styles.borderRadius = '9999px';
      else if (c === 'rounded-none') styles.borderRadius = '0';
      else if (arbProp === 'rounded') styles.borderRadius = arbVal;

      // Border
      else if (c === 'border') styles.border = '1px solid';
      else if (c === 'border-0') styles.border = 'none';
      else if (/^border-(\d+)$/.test(c)) styles.borderWidth = c.slice(7) + 'px';
      else if (arbProp === 'border' && arbVal && (arbVal.startsWith('#') || arbVal.startsWith('rgb'))) styles.borderColor = arbVal;
      else if (c === 'border-transparent') styles.borderColor = 'transparent';
      else if (c === 'border-white') styles.borderColor = '#ffffff';
      else if (c === 'border-black') styles.borderColor = '#000000';

      // Opacity
      else if (/^opacity-(\d+)$/.test(c)) { styles.opacity = (parseInt(c.slice(8)) / 100).toString(); }
      else if (arbProp === 'opacity') styles.opacity = arbVal;

      // Z-index
      else if (arbProp === 'z') styles.zIndex = arbVal;
      else if (/^z-(\d+)$/.test(c)) styles.zIndex = c.slice(2);
      else if (c === 'z-auto') styles.zIndex = 'auto';

      // Box shadow
      else if (c === 'shadow') styles.boxShadow = '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)';
      else if (c === 'shadow-sm') styles.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
      else if (c === 'shadow-md') styles.boxShadow = '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)';
      else if (c === 'shadow-lg') styles.boxShadow = '0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)';
      else if (c === 'shadow-xl') styles.boxShadow = '0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)';
      else if (c === 'shadow-2xl') styles.boxShadow = '0 25px 50px rgba(0,0,0,0.25)';
      else if (c === 'shadow-none') styles.boxShadow = 'none';

      // Cursor
      else if (c === 'cursor-pointer') styles.cursor = 'pointer';
      else if (c === 'cursor-default') styles.cursor = 'default';
      else if (c === 'cursor-not-allowed') styles.cursor = 'not-allowed';

      // Object fit
      else if (c === 'object-cover') styles.objectFit = 'cover';
      else if (c === 'object-contain') styles.objectFit = 'contain';
      else if (c === 'object-fill') styles.objectFit = 'fill';
      else if (c === 'object-none') styles.objectFit = 'none';

      // Whitespace
      else if (c === 'whitespace-nowrap') styles.whiteSpace = 'nowrap';
      else if (c === 'whitespace-normal') styles.whiteSpace = 'normal';
      else if (c === 'whitespace-pre') styles.whiteSpace = 'pre';
      else if (c === 'whitespace-pre-wrap') styles.whiteSpace = 'pre-wrap';

      // Text decoration
      else if (c === 'underline') styles.textDecoration = 'underline';
      else if (c === 'line-through') styles.textDecoration = 'line-through';
      else if (c === 'no-underline') styles.textDecoration = 'none';
      else if (c === 'uppercase') styles.textTransform = 'uppercase';
      else if (c === 'lowercase') styles.textTransform = 'lowercase';
      else if (c === 'capitalize') styles.textTransform = 'capitalize';
      else if (c === 'normal-case') styles.textTransform = 'none';

      // Transform
      else if (arbProp === 'rotate') styles.transform = `rotate(${arbVal})`;
      else if (arbProp === 'scale') styles.transform = `scale(${arbVal})`;
      else if (arbProp === 'translate-x') styles.transform = `translateX(${arbVal})`;
      else if (arbProp === 'translate-y') styles.transform = `translateY(${arbVal})`;

      // Transition
      else if (c === 'transition') styles.transition = 'all 0.15s ease';
      else if (c === 'transition-all') styles.transition = 'all 0.15s ease';
      else if (c === 'transition-colors') styles.transition = 'color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease';
      else if (c === 'transition-none') styles.transition = 'none';
      else if (arbProp === 'duration') styles.transitionDuration = arbVal;

      // Pointer events
      else if (c === 'pointer-events-none') styles.pointerEvents = 'none';
      else if (c === 'pointer-events-auto') styles.pointerEvents = 'auto';

      // Grid
      else if (arbProp === 'grid-cols') styles.gridTemplateColumns = arbVal;
      else if (/^grid-cols-(\d+)$/.test(c)) styles.gridTemplateColumns = `repeat(${c.slice(10)}, 1fr)`;
      else if (arbProp === 'col-span') styles.gridColumn = `span ${arbVal}`;
      else if (/^col-span-(\d+)$/.test(c)) styles.gridColumn = `span ${c.slice(9)}`;

      // Visibility
      else if (c === 'visible') styles.visibility = 'visible';
      else if (c === 'invisible') styles.visibility = 'hidden';

      // Aspect ratio
      else if (c === 'aspect-square') styles.aspectRatio = '1 / 1';
      else if (c === 'aspect-video') styles.aspectRatio = '16 / 9';

      // Truncate / text overflow
      else if (c === 'truncate') { styles.overflow = 'hidden'; styles.textOverflow = 'ellipsis'; styles.whiteSpace = 'nowrap'; }

      // Box sizing
      else if (c === 'box-border') styles.boxSizing = 'border-box';
    }

    return styles;
  }

  /**
   * Lookup approximate Tailwind color values for common named colors.
   */
  _tailwindColorLookup(colorStr) {
    // colorStr is like "red-500", "blue-700", "gray-100"
    const colors = {
      'slate-50': '#f8fafc', 'slate-100': '#f1f5f9', 'slate-200': '#e2e8f0', 'slate-300': '#cbd5e1', 'slate-400': '#94a3b8', 'slate-500': '#64748b', 'slate-600': '#475569', 'slate-700': '#334155', 'slate-800': '#1e293b', 'slate-900': '#0f172a', 'slate-950': '#020617',
      'gray-50': '#f9fafb', 'gray-100': '#f3f4f6', 'gray-200': '#e5e7eb', 'gray-300': '#d1d5db', 'gray-400': '#9ca3af', 'gray-500': '#6b7280', 'gray-600': '#4b5563', 'gray-700': '#374151', 'gray-800': '#1f2937', 'gray-900': '#111827', 'gray-950': '#030712',
      'zinc-50': '#fafafa', 'zinc-100': '#f4f4f5', 'zinc-200': '#e4e4e7', 'zinc-300': '#d4d4d8', 'zinc-400': '#a1a1aa', 'zinc-500': '#71717a', 'zinc-600': '#52525b', 'zinc-700': '#3f3f46', 'zinc-800': '#27272a', 'zinc-900': '#18181b',
      'neutral-50': '#fafafa', 'neutral-100': '#f5f5f5', 'neutral-200': '#e5e5e5', 'neutral-300': '#d4d4d4', 'neutral-400': '#a3a3a3', 'neutral-500': '#737373', 'neutral-600': '#525252', 'neutral-700': '#404040', 'neutral-800': '#262626', 'neutral-900': '#171717',
      'red-50': '#fef2f2', 'red-100': '#fee2e2', 'red-200': '#fecaca', 'red-300': '#fca5a5', 'red-400': '#f87171', 'red-500': '#ef4444', 'red-600': '#dc2626', 'red-700': '#b91c1c', 'red-800': '#991b1b', 'red-900': '#7f1d1d',
      'orange-50': '#fff7ed', 'orange-100': '#ffedd5', 'orange-200': '#fed7aa', 'orange-300': '#fdba74', 'orange-400': '#fb923c', 'orange-500': '#f97316', 'orange-600': '#ea580c', 'orange-700': '#c2410c', 'orange-800': '#9a3412', 'orange-900': '#7c2d12',
      'amber-50': '#fffbeb', 'amber-100': '#fef3c7', 'amber-200': '#fde68a', 'amber-300': '#fcd34d', 'amber-400': '#fbbf24', 'amber-500': '#f59e0b', 'amber-600': '#d97706', 'amber-700': '#b45309', 'amber-800': '#92400e', 'amber-900': '#78350f',
      'yellow-50': '#fefce8', 'yellow-100': '#fef9c3', 'yellow-200': '#fef08a', 'yellow-300': '#fde047', 'yellow-400': '#facc15', 'yellow-500': '#eab308', 'yellow-600': '#ca8a04', 'yellow-700': '#a16207', 'yellow-800': '#854d0e', 'yellow-900': '#713f12',
      'green-50': '#f0fdf4', 'green-100': '#dcfce7', 'green-200': '#bbf7d0', 'green-300': '#86efac', 'green-400': '#4ade80', 'green-500': '#22c55e', 'green-600': '#16a34a', 'green-700': '#15803d', 'green-800': '#166534', 'green-900': '#14532d',
      'emerald-50': '#ecfdf5', 'emerald-100': '#d1fae5', 'emerald-200': '#a7f3d0', 'emerald-300': '#6ee7b7', 'emerald-400': '#34d399', 'emerald-500': '#10b981', 'emerald-600': '#059669', 'emerald-700': '#047857', 'emerald-800': '#065f46', 'emerald-900': '#064e3b',
      'teal-50': '#f0fdfa', 'teal-100': '#ccfbf1', 'teal-200': '#99f6e4', 'teal-300': '#5eead4', 'teal-400': '#2dd4bf', 'teal-500': '#14b8a6', 'teal-600': '#0d9488', 'teal-700': '#0f766e', 'teal-800': '#115e59', 'teal-900': '#134e4a',
      'cyan-50': '#ecfeff', 'cyan-100': '#cffafe', 'cyan-200': '#a5f3fc', 'cyan-300': '#67e8f9', 'cyan-400': '#22d3ee', 'cyan-500': '#06b6d4', 'cyan-600': '#0891b2', 'cyan-700': '#0e7490', 'cyan-800': '#155e75', 'cyan-900': '#164e63',
      'sky-50': '#f0f9ff', 'sky-100': '#e0f2fe', 'sky-200': '#bae6fd', 'sky-300': '#7dd3fc', 'sky-400': '#38bdf8', 'sky-500': '#0ea5e9', 'sky-600': '#0284c7', 'sky-700': '#0369a1', 'sky-800': '#075985', 'sky-900': '#0c4a6e',
      'blue-50': '#eff6ff', 'blue-100': '#dbeafe', 'blue-200': '#bfdbfe', 'blue-300': '#93c5fd', 'blue-400': '#60a5fa', 'blue-500': '#3b82f6', 'blue-600': '#2563eb', 'blue-700': '#1d4ed8', 'blue-800': '#1e40af', 'blue-900': '#1e3a8a',
      'indigo-50': '#eef2ff', 'indigo-100': '#e0e7ff', 'indigo-200': '#c7d2fe', 'indigo-300': '#a5b4fc', 'indigo-400': '#818cf8', 'indigo-500': '#6366f1', 'indigo-600': '#4f46e5', 'indigo-700': '#4338ca', 'indigo-800': '#3730a3', 'indigo-900': '#312e81',
      'violet-50': '#f5f3ff', 'violet-100': '#ede9fe', 'violet-200': '#ddd6fe', 'violet-300': '#c4b5fd', 'violet-400': '#a78bfa', 'violet-500': '#8b5cf6', 'violet-600': '#7c3aed', 'violet-700': '#6d28d9', 'violet-800': '#5b21b6', 'violet-900': '#4c1d95',
      'purple-50': '#faf5ff', 'purple-100': '#f3e8ff', 'purple-200': '#e9d5ff', 'purple-300': '#d8b4fe', 'purple-400': '#c084fc', 'purple-500': '#a855f7', 'purple-600': '#9333ea', 'purple-700': '#7e22ce', 'purple-800': '#6b21a8', 'purple-900': '#581c87',
      'fuchsia-50': '#fdf4ff', 'fuchsia-100': '#fae8ff', 'fuchsia-200': '#f5d0fe', 'fuchsia-300': '#f0abfc', 'fuchsia-400': '#e879f9', 'fuchsia-500': '#d946ef', 'fuchsia-600': '#c026d3', 'fuchsia-700': '#a21caf', 'fuchsia-800': '#86198f', 'fuchsia-900': '#701a75',
      'pink-50': '#fdf2f8', 'pink-100': '#fce7f3', 'pink-200': '#fbcfe8', 'pink-300': '#f9a8d4', 'pink-400': '#f472b6', 'pink-500': '#ec4899', 'pink-600': '#db2777', 'pink-700': '#be185d', 'pink-800': '#9d174d', 'pink-900': '#831843',
      'rose-50': '#fff1f2', 'rose-100': '#ffe4e6', 'rose-200': '#fecdd3', 'rose-300': '#fda4af', 'rose-400': '#fb7185', 'rose-500': '#f43f5e', 'rose-600': '#e11d48', 'rose-700': '#be123c', 'rose-800': '#9f1239', 'rose-900': '#881337',
    };
    return colors[colorStr] || null;
  }

  /**
   * Check if a class string contains Tailwind classes that provide visual appearance.
   */
  _hasVisualTailwindClasses(classStr) {
    if (!classStr) return false;
    // Check for background, border, shadow, gradient, or image-related classes
    return /\b(bg-\[|bg-(?:white|black|transparent|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)|border-\[|shadow|rounded|gradient|from-|to-|via-)\b/.test(classStr);
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
