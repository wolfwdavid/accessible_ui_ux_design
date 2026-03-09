/**
 * Figma Export - Generates Figma-compatible SVG and Figma REST API JSON.
 */
export class FigmaExporter {
  constructor(state, registry, canvasController) {
    this._state = state;
    this._registry = registry;
    this._canvas = canvasController;
  }

  /**
   * Export as SVG that Figma can import natively.
   * Captures the canvas iframe content as an SVG with foreignObject.
   */
  exportAsSVG() {
    const doc = this._canvas.getIframeDoc();
    if (!doc) return '';

    const viewport = this._state.viewport || this._state._state?.viewport;
    const w = viewport?.width || 1440;
    const h = viewport?.height || 900;

    const bodyClone = doc.body.cloneNode(true);

    // Remove editor overlays
    bodyClone.querySelectorAll('.am-selected, .am-hover, .am-audit-icon, .am-focus-badge, .am-touch-overlay, .am-drop-indicator')
      .forEach(el => {
        el.classList.remove('am-selected', 'am-hover');
        if (el.classList.contains('am-audit-icon') ||
            el.classList.contains('am-focus-badge') ||
            el.classList.contains('am-touch-overlay') ||
            el.classList.contains('am-drop-indicator')) {
          el.remove();
        }
      });

    // Remove data attributes
    bodyClone.querySelectorAll('[data-am-id]').forEach(el => {
      el.removeAttribute('data-am-id');
      el.removeAttribute('data-am-type');
    });

    const styles = doc.querySelector('style')?.textContent || '';

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${w}" height="${h}"
     viewBox="0 0 ${w} ${h}">
  <title>${this._state.document?.root?.props?.title || 'AccessibleMake Export'}</title>
  <desc>Exported from AccessibleMake - Accessible Design Tool</desc>

  <!-- Background -->
  <rect width="${w}" height="${h}" fill="#ffffff"/>

  <!-- Page Content -->
  <foreignObject x="0" y="0" width="${w}" height="${h}">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="${this._state.document?.root?.props?.lang || 'en'}">
      <head>
        <style>
          ${this._cleanCSS(styles)}
          body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; line-height: 1.5; color: #1a1a1a; }
          * { box-sizing: border-box; }
        </style>
      </head>
      <body>
        ${bodyClone.innerHTML}
      </body>
    </html>
  </foreignObject>
</svg>`;

    return svg;
  }

  /**
   * Export as Figma REST API compatible JSON.
   * This generates a document structure that maps to Figma's node types.
   */
  exportAsFigmaJSON() {
    const stateDoc = this._state.document || this._state._state?.document;
    if (!stateDoc?.root) return null;

    const viewport = this._state.viewport || this._state._state?.viewport;
    const w = viewport?.width || 1440;
    const h = viewport?.height || 900;

    const figmaDoc = {
      name: stateDoc.root.props?.title || 'AccessibleMake Export',
      type: 'DOCUMENT',
      children: [
        {
          type: 'CANVAS',
          name: 'Page 1',
          backgroundColor: { r: 0.96, g: 0.96, b: 0.96, a: 1 },
          children: [
            this._nodeToFigma(stateDoc.root, 0, 0, w, h)
          ]
        }
      ],
      metadata: {
        generator: 'AccessibleMake',
        exportedAt: new Date().toISOString(),
        accessibility: {
          wcagLevel: 'AA',
          auditScore: this._state.audit?.score || this._state._state?.audit?.score || 0
        }
      }
    };

    return figmaDoc;
  }

  _nodeToFigma(node, x, y, w, h) {
    const def = this._registry.get(node.type);
    const isContainer = def?.isContainer || false;
    const nodeX = node.position?.x ?? x;
    const nodeY = node.position?.y ?? y;
    const nodeW = node.position?.width ?? w;
    const nodeH = node.position?.height ?? (isContainer ? h : 40);

    const figmaNode = {
      type: isContainer ? 'FRAME' : 'RECTANGLE',
      name: this._getFigmaName(node, def),
      absoluteBoundingBox: { x: nodeX, y: nodeY, width: nodeW, height: nodeH },
      constraints: { vertical: 'TOP', horizontal: 'LEFT_RIGHT' },
      fills: this._getFigmaFills(node),
      strokes: [],
      cornerRadius: parseInt(node.styles?.borderRadius) || 0,
      effects: [],
      children: [],
      // Store accessibility metadata as plugin data
      pluginData: {
        accessibleMake: {
          componentType: node.type,
          ariaAttributes: node.ariaAttributes || {},
          role: def?.role || null,
          wcagNotes: this._getWcagNotes(node, def)
        }
      }
    };

    // Add text content for text-bearing elements
    if (node.props?.text || node.props?.label) {
      const textNode = {
        type: 'TEXT',
        name: 'Text',
        characters: node.props.text || node.props.label || '',
        style: {
          fontFamily: 'Inter',
          fontSize: parseInt(node.styles?.fontSize) || this._getDefaultFontSize(node.type),
          fontWeight: parseInt(node.styles?.fontWeight) || 400,
          lineHeightPx: (parseInt(node.styles?.fontSize) || 16) * 1.5,
          textAlignHorizontal: (node.styles?.textAlign || 'LEFT').toUpperCase(),
          fills: [{ type: 'SOLID', color: this._parseColorToFigma(node.styles?.color || '#1a1a1a') }]
        },
        absoluteBoundingBox: { x: nodeX + 16, y: nodeY + 8, width: nodeW - 32, height: nodeH - 16 }
      };
      figmaNode.children.push(textNode);
    }

    // Process children
    if (node.children && isContainer) {
      let childY = nodeY + 16;
      for (const child of node.children) {
        const childDef = this._registry.get(child.type);
        const childH = childDef?.isContainer ? 200 : 48;
        const childFigma = this._nodeToFigma(child, nodeX + 16, childY, nodeW - 32, childH);
        figmaNode.children.push(childFigma);
        childY += childH + 8;
      }
      // Adjust frame height to fit children
      figmaNode.absoluteBoundingBox.height = Math.max(nodeH, childY - nodeY + 16);
    }

    // Auto-layout for Figma
    if (isContainer && node.children?.length > 0) {
      figmaNode.layoutMode = 'VERTICAL';
      figmaNode.itemSpacing = 8;
      figmaNode.paddingLeft = 16;
      figmaNode.paddingRight = 16;
      figmaNode.paddingTop = 16;
      figmaNode.paddingBottom = 16;
      figmaNode.primaryAxisSizingMode = 'AUTO';
      figmaNode.counterAxisSizingMode = 'FIXED';
    }

    return figmaNode;
  }

  _getFigmaName(node, def) {
    const label = def?.label || node.type;
    const text = node.props?.text || node.props?.label || '';
    return text ? `${label}: ${text.substring(0, 30)}` : label;
  }

  _getFigmaFills(node) {
    const bg = node.styles?.backgroundColor;
    if (bg) {
      return [{ type: 'SOLID', color: this._parseColorToFigma(bg) }];
    }

    const typeColors = {
      'header-landmark': '#f8f9fa',
      'footer-landmark': '#f8f9fa',
      'main-landmark': '#ffffff',
      'nav-landmark': '#f0f0f0',
      'button': '#0066cc',
      'form-button': '#0066cc'
    };

    const color = typeColors[node.type];
    if (color) return [{ type: 'SOLID', color: this._parseColorToFigma(color) }];

    return [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }];
  }

  _parseColorToFigma(color) {
    if (!color) return { r: 1, g: 1, b: 1, a: 1 };

    // Hex
    const hexMatch = color.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    if (hexMatch) {
      return {
        r: parseInt(hexMatch[1], 16) / 255,
        g: parseInt(hexMatch[2], 16) / 255,
        b: parseInt(hexMatch[3], 16) / 255,
        a: 1
      };
    }

    // RGB/RGBA
    const rgbMatch = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\)/);
    if (rgbMatch) {
      return {
        r: parseInt(rgbMatch[1]) / 255,
        g: parseInt(rgbMatch[2]) / 255,
        b: parseInt(rgbMatch[3]) / 255,
        a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1
      };
    }

    return { r: 1, g: 1, b: 1, a: 1 };
  }

  _getDefaultFontSize(type) {
    const sizes = {
      'heading': 32, 'paragraph': 16, 'button': 16, 'link': 16,
      'form-button': 16, 'blockquote': 18, 'code-block': 14
    };
    return sizes[type] || 16;
  }

  _getWcagNotes(node, def) {
    const notes = [];
    if (def?.requiredA11y) {
      for (const req of def.requiredA11y) {
        if (req === 'alt-text' && !node.props?.alt) notes.push('Needs alt text');
        if (req === 'label' && !node.props?.label) notes.push('Needs label');
        if (req === 'accessible-name') notes.push('Needs accessible name');
      }
    }
    return notes;
  }

  _cleanCSS(css) {
    return css
      .replace(/\.am-selected[^}]*}/g, '')
      .replace(/\.am-hover[^}]*}/g, '')
      .replace(/\.am-drop-indicator[^}]*}/g, '')
      .replace(/\.am-audit-[^}]*}/g, '')
      .replace(/\.am-focus-badge[^}]*}/g, '')
      .replace(/\.am-touch-[^}]*}/g, '');
  }

  downloadSVG() {
    const svg = this.exportAsSVG();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'accessiblemake-export.svg';
    a.click();
    URL.revokeObjectURL(url);
  }

  downloadFigmaJSON() {
    const json = this.exportAsFigmaJSON();
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'accessiblemake-figma.json';
    a.click();
    URL.revokeObjectURL(url);
  }
}
