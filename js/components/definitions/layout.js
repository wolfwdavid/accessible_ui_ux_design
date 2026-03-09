/**
 * Layout Components - Containers, grids, flex, sections.
 */
export const layoutComponents = [
  {
    type: 'section',
    category: 'layout',
    label: 'Section',
    icon: '#icon-section',
    defaultProps: { label: '', className: '' },
    isContainer: true,
    render(props) {
      const el = document.createElement('section');
      if (props.label) el.setAttribute('aria-label', props.label);
      if (props.className) el.className = props.className;
      el.style.minHeight = '80px';
      el.style.padding = '16px';
      el.style.border = '1px dashed #ccc';
      return el;
    },
    toHTML(props, childrenHTML = '') {
      const attrs = props.label ? ` aria-label="${props.label}"` : '';
      return `<section${attrs}>\n${childrenHTML}\n</section>`;
    }
  },
  {
    type: 'div-container',
    category: 'layout',
    label: 'Container',
    icon: '#icon-container',
    defaultProps: { className: 'container', maxWidth: '1200px' },
    isContainer: true,
    render(props) {
      const el = document.createElement('div');
      el.className = props.className || 'container';
      el.style.maxWidth = props.maxWidth || '1200px';
      el.style.margin = '0 auto';
      el.style.padding = '16px';
      el.style.minHeight = '60px';
      el.style.border = '1px dashed #e0e0e0';
      return el;
    },
    toHTML(props, childrenHTML = '') {
      return `<div class="${props.className || 'container'}" style="max-width: ${props.maxWidth || '1200px'}; margin: 0 auto;">\n${childrenHTML}\n</div>`;
    }
  },
  {
    type: 'flex-row',
    category: 'layout',
    label: 'Flex Row',
    icon: '#icon-flexrow',
    defaultProps: { gap: '16px', align: 'stretch', justify: 'flex-start', wrap: true },
    isContainer: true,
    render(props) {
      const el = document.createElement('div');
      el.style.display = 'flex';
      el.style.flexDirection = 'row';
      el.style.gap = props.gap || '16px';
      el.style.alignItems = props.align || 'stretch';
      el.style.justifyContent = props.justify || 'flex-start';
      el.style.flexWrap = props.wrap ? 'wrap' : 'nowrap';
      el.style.minHeight = '60px';
      el.style.padding = '8px';
      el.style.border = '1px dashed #d0d0ff';
      return el;
    },
    toHTML(props, childrenHTML = '') {
      return `<div style="display: flex; gap: ${props.gap || '16px'}; align-items: ${props.align || 'stretch'}; justify-content: ${props.justify || 'flex-start'}; flex-wrap: ${props.wrap ? 'wrap' : 'nowrap'};">\n${childrenHTML}\n</div>`;
    }
  },
  {
    type: 'flex-column',
    category: 'layout',
    label: 'Flex Column',
    icon: '#icon-flexcol',
    defaultProps: { gap: '16px', align: 'stretch' },
    isContainer: true,
    render(props) {
      const el = document.createElement('div');
      el.style.display = 'flex';
      el.style.flexDirection = 'column';
      el.style.gap = props.gap || '16px';
      el.style.alignItems = props.align || 'stretch';
      el.style.minHeight = '80px';
      el.style.padding = '8px';
      el.style.border = '1px dashed #d0ffd0';
      return el;
    },
    toHTML(props, childrenHTML = '') {
      return `<div style="display: flex; flex-direction: column; gap: ${props.gap || '16px'}; align-items: ${props.align || 'stretch'};">\n${childrenHTML}\n</div>`;
    }
  },
  {
    type: 'grid',
    category: 'layout',
    label: 'CSS Grid',
    icon: '#icon-grid',
    defaultProps: { columns: '1fr 1fr', gap: '16px', rows: 'auto' },
    isContainer: true,
    render(props) {
      const el = document.createElement('div');
      el.style.display = 'grid';
      el.style.gridTemplateColumns = props.columns || '1fr 1fr';
      el.style.gridTemplateRows = props.rows || 'auto';
      el.style.gap = props.gap || '16px';
      el.style.minHeight = '80px';
      el.style.padding = '8px';
      el.style.border = '1px dashed #ffd0d0';
      return el;
    },
    toHTML(props, childrenHTML = '') {
      return `<div style="display: grid; grid-template-columns: ${props.columns || '1fr 1fr'}; gap: ${props.gap || '16px'};">\n${childrenHTML}\n</div>`;
    }
  },
  {
    type: 'article',
    category: 'layout',
    label: 'Article',
    icon: '#icon-article',
    defaultProps: { className: '' },
    isContainer: true,
    render(props) {
      const el = document.createElement('article');
      if (props.className) el.className = props.className;
      el.style.minHeight = '60px';
      el.style.padding = '16px';
      el.style.border = '1px dashed #ccc';
      return el;
    },
    toHTML(props, childrenHTML = '') {
      const cls = props.className ? ` class="${props.className}"` : '';
      return `<article${cls}>\n${childrenHTML}\n</article>`;
    }
  },
  {
    type: 'aside',
    category: 'layout',
    label: 'Aside',
    icon: '#icon-aside',
    defaultProps: { label: '' },
    isContainer: true,
    render(props) {
      const el = document.createElement('aside');
      if (props.label) el.setAttribute('aria-label', props.label);
      el.style.minHeight = '60px';
      el.style.padding = '16px';
      el.style.border = '1px dashed #ccc';
      return el;
    },
    toHTML(props, childrenHTML = '') {
      const attrs = props.label ? ` aria-label="${props.label}"` : '';
      return `<aside${attrs}>\n${childrenHTML}\n</aside>`;
    }
  }
];
