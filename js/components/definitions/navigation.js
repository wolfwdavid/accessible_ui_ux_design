/**
 * Navigation Components - Nav, skip-link, breadcrumb, pagination.
 */
export const navigationComponents = [
  {
    type: 'nav',
    category: 'navigation',
    label: 'Navigation',
    icon: '#icon-nav',
    defaultProps: {
      label: 'Main Navigation',
      links: [
        { text: 'Home', href: '#' },
        { text: 'About', href: '#about' },
        { text: 'Contact', href: '#contact' }
      ]
    },
    render(props) {
      const nav = document.createElement('nav');
      nav.setAttribute('aria-label', props.label || 'Navigation');
      const ul = document.createElement('ul');
      ul.style.listStyle = 'none';
      ul.style.padding = '0';
      ul.style.display = 'flex';
      ul.style.gap = '16px';
      for (const link of (props.links || [])) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = link.href || '#';
        a.textContent = link.text || 'Link';
        a.style.color = '#0066cc';
        a.style.textDecoration = 'underline';
        li.appendChild(a);
        ul.appendChild(li);
      }
      nav.appendChild(ul);
      return nav;
    },
    toHTML(props) {
      const links = (props.links || [])
        .map(l => `    <li><a href="${l.href || '#'}">${l.text || 'Link'}</a></li>`)
        .join('\n');
      return `<nav aria-label="${props.label || 'Navigation'}">\n  <ul>\n${links}\n  </ul>\n</nav>`;
    }
  },
  {
    type: 'skip-link',
    category: 'navigation',
    label: 'Skip Link',
    icon: '#icon-skiplink',
    defaultProps: { text: 'Skip to main content', target: 'main-content' },
    render(props) {
      const a = document.createElement('a');
      a.href = `#${props.target || 'main-content'}`;
      a.textContent = props.text || 'Skip to main content';
      a.className = 'skip-link';
      a.style.position = 'absolute';
      a.style.top = '-40px';
      a.style.left = '0';
      a.style.padding = '8px 16px';
      a.style.background = '#000';
      a.style.color = '#fff';
      a.style.zIndex = '10000';
      a.style.transition = 'top 0.2s';
      return a;
    },
    toHTML(props) {
      return `<a href="#${props.target || 'main-content'}" class="skip-link">${props.text || 'Skip to main content'}</a>`;
    }
  },
  {
    type: 'breadcrumb',
    category: 'navigation',
    label: 'Breadcrumb',
    icon: '#icon-breadcrumb',
    defaultProps: {
      items: [
        { text: 'Home', href: '#' },
        { text: 'Products', href: '#products' },
        { text: 'Current Page', href: '', current: true }
      ]
    },
    render(props) {
      const nav = document.createElement('nav');
      nav.setAttribute('aria-label', 'Breadcrumb');
      const ol = document.createElement('ol');
      ol.style.listStyle = 'none';
      ol.style.display = 'flex';
      ol.style.gap = '8px';
      ol.style.padding = '0';
      for (let i = 0; i < (props.items || []).length; i++) {
        const item = props.items[i];
        const li = document.createElement('li');
        if (i > 0) {
          const sep = document.createElement('span');
          sep.setAttribute('aria-hidden', 'true');
          sep.textContent = ' / ';
          sep.style.margin = '0 4px';
          li.appendChild(sep);
        }
        if (item.current) {
          const span = document.createElement('span');
          span.setAttribute('aria-current', 'page');
          span.textContent = item.text;
          li.appendChild(span);
        } else {
          const a = document.createElement('a');
          a.href = item.href || '#';
          a.textContent = item.text;
          li.appendChild(a);
        }
        ol.appendChild(li);
      }
      nav.appendChild(ol);
      return nav;
    },
    toHTML(props) {
      const items = (props.items || []).map((item, i) => {
        const sep = i > 0 ? '<span aria-hidden="true"> / </span>' : '';
        if (item.current) {
          return `    <li>${sep}<span aria-current="page">${item.text}</span></li>`;
        }
        return `    <li>${sep}<a href="${item.href || '#'}">${item.text}</a></li>`;
      }).join('\n');
      return `<nav aria-label="Breadcrumb">\n  <ol>\n${items}\n  </ol>\n</nav>`;
    }
  },
  {
    type: 'pagination',
    category: 'navigation',
    label: 'Pagination',
    icon: '#icon-pagination',
    defaultProps: { current: 1, total: 5 },
    render(props) {
      const nav = document.createElement('nav');
      nav.setAttribute('aria-label', 'Pagination');
      const ul = document.createElement('ul');
      ul.style.listStyle = 'none';
      ul.style.display = 'flex';
      ul.style.gap = '4px';
      ul.style.padding = '0';
      for (let i = 1; i <= (props.total || 5); i++) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#page-${i}`;
        a.textContent = String(i);
        a.style.padding = '8px 12px';
        a.style.border = '1px solid #ccc';
        a.style.borderRadius = '4px';
        a.style.textDecoration = 'none';
        if (i === (props.current || 1)) {
          a.setAttribute('aria-current', 'page');
          a.style.background = '#0066cc';
          a.style.color = '#fff';
          a.style.borderColor = '#0066cc';
        }
        li.appendChild(a);
        ul.appendChild(li);
      }
      nav.appendChild(ul);
      return nav;
    },
    toHTML(props) {
      const pages = [];
      for (let i = 1; i <= (props.total || 5); i++) {
        const current = i === (props.current || 1) ? ' aria-current="page"' : '';
        pages.push(`    <li><a href="#page-${i}"${current}>${i}</a></li>`);
      }
      return `<nav aria-label="Pagination">\n  <ul>\n${pages.join('\n')}\n  </ul>\n</nav>`;
    }
  }
];
