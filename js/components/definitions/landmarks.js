/**
 * Landmark Components - Semantic HTML5 landmark regions.
 */
export const landmarkComponents = [
  {
    type: 'header-landmark',
    category: 'landmarks',
    label: 'Header (Banner)',
    icon: '#icon-header',
    defaultProps: { label: '' },
    isContainer: true,
    render(props) {
      const el = document.createElement('header');
      if (props.label) el.setAttribute('aria-label', props.label);
      el.style.padding = '16px';
      el.style.minHeight = '60px';
      el.style.background = '#f8f9fa';
      el.style.borderBottom = '1px solid #dee2e6';
      return el;
    },
    toHTML(props, childrenHTML = '') {
      const attrs = props.label ? ` aria-label="${props.label}"` : '';
      return `<header${attrs}>\n${childrenHTML}\n</header>`;
    }
  },
  {
    type: 'nav-landmark',
    category: 'landmarks',
    label: 'Nav Region',
    icon: '#icon-nav-landmark',
    defaultProps: { label: 'Main Navigation' },
    isContainer: true,
    render(props) {
      const el = document.createElement('nav');
      el.setAttribute('aria-label', props.label || 'Navigation');
      el.style.padding = '8px 16px';
      el.style.minHeight = '40px';
      el.style.borderBottom = '1px solid #e0e0e0';
      return el;
    },
    toHTML(props, childrenHTML = '') {
      return `<nav aria-label="${props.label || 'Navigation'}">\n${childrenHTML}\n</nav>`;
    }
  },
  {
    type: 'main-landmark',
    category: 'landmarks',
    label: 'Main Content',
    icon: '#icon-main',
    defaultProps: { id: 'main-content', label: '' },
    isContainer: true,
    render(props) {
      const el = document.createElement('main');
      if (props.id) el.id = props.id;
      if (props.label) el.setAttribute('aria-label', props.label);
      el.style.padding = '24px';
      el.style.minHeight = '200px';
      return el;
    },
    toHTML(props, childrenHTML = '') {
      const id = props.id ? ` id="${props.id}"` : '';
      const label = props.label ? ` aria-label="${props.label}"` : '';
      return `<main${id}${label}>\n${childrenHTML}\n</main>`;
    }
  },
  {
    type: 'footer-landmark',
    category: 'landmarks',
    label: 'Footer (Contentinfo)',
    icon: '#icon-footer',
    defaultProps: { label: '' },
    isContainer: true,
    render(props) {
      const el = document.createElement('footer');
      if (props.label) el.setAttribute('aria-label', props.label);
      el.style.padding = '16px';
      el.style.minHeight = '60px';
      el.style.background = '#f8f9fa';
      el.style.borderTop = '1px solid #dee2e6';
      return el;
    },
    toHTML(props, childrenHTML = '') {
      const attrs = props.label ? ` aria-label="${props.label}"` : '';
      return `<footer${attrs}>\n${childrenHTML}\n</footer>`;
    }
  },
  {
    type: 'search-landmark',
    category: 'landmarks',
    label: 'Search Region',
    icon: '#icon-search',
    defaultProps: { label: 'Site Search' },
    isContainer: true,
    render(props) {
      const el = document.createElement('search');
      el.setAttribute('aria-label', props.label || 'Search');
      el.style.padding = '16px';
      el.style.minHeight = '50px';
      el.style.border = '1px dashed #b0b0ff';
      return el;
    },
    toHTML(props, childrenHTML = '') {
      return `<search aria-label="${props.label || 'Search'}">\n${childrenHTML}\n</search>`;
    }
  },
  {
    type: 'complementary-landmark',
    category: 'landmarks',
    label: 'Complementary (Aside)',
    icon: '#icon-complementary',
    defaultProps: { label: 'Related Content' },
    isContainer: true,
    render(props) {
      const el = document.createElement('aside');
      el.setAttribute('aria-label', props.label || 'Complementary');
      el.style.padding = '16px';
      el.style.minHeight = '60px';
      el.style.background = '#fff8e1';
      el.style.borderLeft = '3px solid #ffc107';
      return el;
    },
    toHTML(props, childrenHTML = '') {
      return `<aside aria-label="${props.label || 'Complementary'}">\n${childrenHTML}\n</aside>`;
    }
  },
  {
    type: 'page',
    category: 'landmarks',
    label: 'Page Root',
    icon: '#icon-page',
    defaultProps: { title: 'Untitled Page', lang: 'en' },
    isContainer: true,
    isRoot: true,
    render(props) {
      const el = document.createElement('div');
      el.setAttribute('lang', props.lang || 'en');
      el.style.minHeight = '100vh';
      return el;
    },
    toHTML(props, childrenHTML = '') {
      return `<!DOCTYPE html>\n<html lang="${props.lang || 'en'}">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${props.title || 'Untitled'}</title>\n</head>\n<body>\n${childrenHTML}\n</body>\n</html>`;
    }
  }
];
