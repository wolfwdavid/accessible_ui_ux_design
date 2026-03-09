/**
 * Code Generator - Orchestrates HTML and CSS generation.
 */
import { HTMLBuilder } from './html-builder.js';
import { CSSBuilder } from './css-builder.js';

export class CodeGenerator {
  constructor(registry) {
    this._htmlBuilder = new HTMLBuilder(registry);
    this._cssBuilder = new CSSBuilder();
  }

  generate(document) {
    const html = this._htmlBuilder.build(document);
    const css = this._cssBuilder.build();
    return { html, css };
  }

  generateFullPage(document) {
    const css = this._cssBuilder.build();
    const bodyContent = this._htmlBuilder.build(document);

    const isFullPage = bodyContent.trim().startsWith('<!DOCTYPE');
    if (isFullPage) {
      return bodyContent.replace('</head>', `<style>\n${css}\n</style>\n</head>`);
    }

    return `<!DOCTYPE html>
<html lang="${document.root?.props?.lang || 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${document.root?.props?.title || 'Accessible Page'}</title>
  <style>
${css}
  </style>
</head>
<body>
${bodyContent}
</body>
</html>`;
  }
}
