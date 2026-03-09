/**
 * HTML Builder - Converts component tree to semantic, accessible HTML.
 */
export class HTMLBuilder {
  constructor(registry) {
    this._registry = registry;
  }

  build(document) {
    if (!document?.root) return '';
    return this._buildNode(document.root, 0);
  }

  _buildNode(node, depth) {
    const def = this._registry.get(node.type);
    if (!def) return `<!-- Unknown component: ${node.type} -->`;

    let childrenHTML = '';
    if (node.children && node.children.length > 0) {
      childrenHTML = node.children
        .map(child => this._buildNode(child, depth + 1))
        .join('\n');
    }

    const props = { ...node.props };

    for (const [attr, value] of Object.entries(node.ariaAttributes || {})) {
      if (value !== undefined && value !== '') {
        props[attr] = value;
      }
    }

    let html = def.toHTML(props, childrenHTML);

    if (node.styles && Object.keys(node.styles).length > 0) {
      const styleStr = Object.entries(node.styles)
        .filter(([, v]) => v)
        .map(([k, v]) => `${this._camelToKebab(k)}: ${v}`)
        .join('; ');

      if (styleStr) {
        html = html.replace(/>/, ` style="${styleStr}">`);
      }
    }

    return this._indent(html, depth);
  }

  _indent(html, depth) {
    const pad = '  '.repeat(depth);
    return html.split('\n').map(line => pad + line).join('\n');
  }

  _camelToKebab(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
}
