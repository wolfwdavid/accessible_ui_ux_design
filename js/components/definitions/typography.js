/**
 * Typography Components - Headings, paragraphs, lists, text elements.
 */
export const typographyComponents = [
  {
    type: 'heading',
    category: 'typography',
    label: 'Heading',
    icon: '#icon-heading',
    defaultProps: { level: 2, text: 'Heading Text' },
    render(props) {
      const el = document.createElement(`h${props.level || 2}`);
      el.textContent = props.text || 'Heading Text';
      return el;
    },
    toHTML(props) {
      const level = props.level || 2;
      return `<h${level}>${props.text || ''}</h${level}>`;
    }
  },
  {
    type: 'paragraph',
    category: 'typography',
    label: 'Paragraph',
    icon: '#icon-paragraph',
    defaultProps: { text: 'Enter your paragraph text here. Good content is clear, concise, and uses plain language.' },
    render(props) {
      const el = document.createElement('p');
      el.textContent = props.text || '';
      return el;
    },
    toHTML(props) {
      return `<p>${props.text || ''}</p>`;
    }
  },
  {
    type: 'blockquote',
    category: 'typography',
    label: 'Blockquote',
    icon: '#icon-quote',
    defaultProps: { text: 'Quoted text goes here.', cite: '' },
    render(props) {
      const el = document.createElement('blockquote');
      el.textContent = props.text || '';
      if (props.cite) el.setAttribute('cite', props.cite);
      el.style.borderLeft = '4px solid #666';
      el.style.paddingLeft = '16px';
      el.style.margin = '16px 0';
      el.style.fontStyle = 'italic';
      return el;
    },
    toHTML(props) {
      const cite = props.cite ? ` cite="${props.cite}"` : '';
      return `<blockquote${cite}>${props.text || ''}</blockquote>`;
    }
  },
  {
    type: 'unordered-list',
    category: 'typography',
    label: 'Unordered List',
    icon: '#icon-ul',
    defaultProps: { items: ['List item 1', 'List item 2', 'List item 3'] },
    render(props) {
      const el = document.createElement('ul');
      for (const item of (props.items || [])) {
        const li = document.createElement('li');
        li.textContent = item;
        el.appendChild(li);
      }
      return el;
    },
    toHTML(props) {
      const items = (props.items || []).map(i => `  <li>${i}</li>`).join('\n');
      return `<ul>\n${items}\n</ul>`;
    }
  },
  {
    type: 'ordered-list',
    category: 'typography',
    label: 'Ordered List',
    icon: '#icon-ol',
    defaultProps: { items: ['First item', 'Second item', 'Third item'] },
    render(props) {
      const el = document.createElement('ol');
      for (const item of (props.items || [])) {
        const li = document.createElement('li');
        li.textContent = item;
        el.appendChild(li);
      }
      return el;
    },
    toHTML(props) {
      const items = (props.items || []).map(i => `  <li>${i}</li>`).join('\n');
      return `<ol>\n${items}\n</ol>`;
    }
  },
  {
    type: 'code-block',
    category: 'typography',
    label: 'Code Block',
    icon: '#icon-code',
    defaultProps: { text: 'const hello = "world";', language: 'javascript' },
    render(props) {
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.textContent = props.text || '';
      if (props.language) code.className = `language-${props.language}`;
      pre.appendChild(code);
      pre.style.background = '#1e1e1e';
      pre.style.color = '#d4d4d4';
      pre.style.padding = '16px';
      pre.style.borderRadius = '4px';
      pre.style.overflow = 'auto';
      return pre;
    },
    toHTML(props) {
      const lang = props.language ? ` class="language-${props.language}"` : '';
      return `<pre><code${lang}>${props.text || ''}</code></pre>`;
    }
  },
  {
    type: 'separator',
    category: 'typography',
    label: 'Horizontal Rule',
    icon: '#icon-hr',
    defaultProps: {},
    render() {
      const el = document.createElement('hr');
      el.style.border = 'none';
      el.style.borderTop = '1px solid #ccc';
      el.style.margin = '24px 0';
      return el;
    },
    toHTML() {
      return '<hr>';
    }
  }
];
