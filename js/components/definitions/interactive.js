/**
 * Interactive Components - Buttons, links, accordions, tabs, dialogs, tooltips.
 */
export const interactiveComponents = [
  {
    type: 'button',
    category: 'interactive',
    label: 'Button',
    icon: '#icon-button',
    defaultProps: { text: 'Click Me', variant: 'primary', ariaLabel: '', disabled: false },
    requiredA11y: ['accessible-name'],
    render(props) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = props.text || 'Button';
      if (props.ariaLabel) btn.setAttribute('aria-label', props.ariaLabel);
      if (props.disabled) btn.disabled = true;
      const isPrimary = props.variant === 'primary';
      btn.style.padding = '10px 24px';
      btn.style.background = isPrimary ? '#0066cc' : 'transparent';
      btn.style.color = isPrimary ? '#ffffff' : '#0066cc';
      btn.style.border = isPrimary ? 'none' : '2px solid #0066cc';
      btn.style.borderRadius = '4px';
      btn.style.fontSize = '16px';
      btn.style.cursor = props.disabled ? 'not-allowed' : 'pointer';
      btn.style.minWidth = '44px';
      btn.style.minHeight = '44px';
      btn.style.opacity = props.disabled ? '0.5' : '1';
      return btn;
    },
    toHTML(props) {
      const aria = props.ariaLabel ? ` aria-label="${props.ariaLabel}"` : '';
      const disabled = props.disabled ? ' disabled' : '';
      return `<button type="button"${aria}${disabled}>${props.text || 'Button'}</button>`;
    }
  },
  {
    type: 'link',
    category: 'interactive',
    label: 'Link',
    icon: '#icon-link',
    defaultProps: { text: 'Learn more about accessibility', href: '#', opensNew: false },
    requiredA11y: ['accessible-name'],
    render(props) {
      const a = document.createElement('a');
      a.href = props.href || '#';
      a.textContent = props.text || 'Link';
      if (props.opensNew) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent += ' (opens in new tab)';
      }
      a.style.color = '#0066cc';
      a.style.textDecoration = 'underline';
      return a;
    },
    toHTML(props) {
      let text = props.text || 'Link';
      let attrs = ` href="${props.href || '#'}"`;
      if (props.opensNew) {
        attrs += ' target="_blank" rel="noopener noreferrer"';
        text += ' <span aria-hidden="true">↗</span><span class="sr-only">(opens in new tab)</span>';
      }
      return `<a${attrs}>${text}</a>`;
    }
  },
  {
    type: 'accordion',
    category: 'interactive',
    label: 'Accordion',
    icon: '#icon-accordion',
    defaultProps: {
      items: [
        { summary: 'Section 1', content: 'Content for section 1 goes here.' },
        { summary: 'Section 2', content: 'Content for section 2 goes here.' },
        { summary: 'Section 3', content: 'Content for section 3 goes here.' }
      ]
    },
    render(props) {
      const wrapper = document.createElement('div');
      wrapper.className = 'accordion';
      for (const item of (props.items || [])) {
        const details = document.createElement('details');
        details.style.borderBottom = '1px solid #ddd';
        const summary = document.createElement('summary');
        summary.textContent = item.summary || 'Section';
        summary.style.padding = '12px 16px';
        summary.style.cursor = 'pointer';
        summary.style.fontWeight = '600';
        summary.style.minHeight = '44px';
        summary.style.display = 'flex';
        summary.style.alignItems = 'center';
        const content = document.createElement('div');
        content.style.padding = '8px 16px 16px';
        content.textContent = item.content || '';
        details.appendChild(summary);
        details.appendChild(content);
        wrapper.appendChild(details);
      }
      return wrapper;
    },
    toHTML(props) {
      const items = (props.items || []).map(item =>
        `<details>\n  <summary>${item.summary || 'Section'}</summary>\n  <div class="accordion-content">\n    <p>${item.content || ''}</p>\n  </div>\n</details>`
      ).join('\n');
      return `<div class="accordion">\n${items}\n</div>`;
    }
  },
  {
    type: 'tabs',
    category: 'interactive',
    label: 'Tab Panel',
    icon: '#icon-tabs',
    defaultProps: {
      tabs: [
        { label: 'Tab 1', content: 'Content for tab 1.' },
        { label: 'Tab 2', content: 'Content for tab 2.' },
        { label: 'Tab 3', content: 'Content for tab 3.' }
      ],
      activeTab: 0
    },
    render(props) {
      const wrapper = document.createElement('div');
      wrapper.className = 'tabs-component';
      const tablist = document.createElement('div');
      tablist.setAttribute('role', 'tablist');
      tablist.style.display = 'flex';
      tablist.style.borderBottom = '2px solid #ddd';
      const panels = document.createElement('div');
      const tabs = props.tabs || [];
      tabs.forEach((tab, i) => {
        const tabId = `tab-${Date.now()}-${i}`;
        const panelId = `panel-${Date.now()}-${i}`;
        const tabBtn = document.createElement('button');
        tabBtn.setAttribute('role', 'tab');
        tabBtn.setAttribute('aria-selected', i === (props.activeTab || 0) ? 'true' : 'false');
        tabBtn.setAttribute('aria-controls', panelId);
        tabBtn.id = tabId;
        tabBtn.textContent = tab.label || `Tab ${i + 1}`;
        tabBtn.style.padding = '12px 20px';
        tabBtn.style.border = 'none';
        tabBtn.style.background = i === (props.activeTab || 0) ? '#fff' : '#f5f5f5';
        tabBtn.style.borderBottom = i === (props.activeTab || 0) ? '2px solid #0066cc' : 'none';
        tabBtn.style.cursor = 'pointer';
        tabBtn.style.fontWeight = i === (props.activeTab || 0) ? '600' : '400';
        tabBtn.style.minHeight = '44px';
        tablist.appendChild(tabBtn);

        const panel = document.createElement('div');
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', tabId);
        panel.id = panelId;
        panel.style.padding = '16px';
        panel.style.display = i === (props.activeTab || 0) ? 'block' : 'none';
        panel.textContent = tab.content || '';
        panels.appendChild(panel);
      });
      wrapper.appendChild(tablist);
      wrapper.appendChild(panels);
      return wrapper;
    },
    toHTML(props) {
      const tabs = props.tabs || [];
      const tabBtns = tabs.map((tab, i) => {
        const sel = i === (props.activeTab || 0) ? 'true' : 'false';
        return `    <button role="tab" aria-selected="${sel}" aria-controls="panel-${i}" id="tab-${i}">${tab.label || `Tab ${i + 1}`}</button>`;
      }).join('\n');
      const panels = tabs.map((tab, i) => {
        const hidden = i !== (props.activeTab || 0) ? ' hidden' : '';
        return `  <div role="tabpanel" aria-labelledby="tab-${i}" id="panel-${i}"${hidden}>\n    <p>${tab.content || ''}</p>\n  </div>`;
      }).join('\n');
      return `<div class="tabs-component">\n  <div role="tablist">\n${tabBtns}\n  </div>\n${panels}\n</div>`;
    }
  },
  {
    type: 'dialog-trigger',
    category: 'interactive',
    label: 'Dialog',
    icon: '#icon-dialog',
    defaultProps: { triggerText: 'Open Dialog', title: 'Dialog Title', content: 'Dialog content goes here.' },
    render(props) {
      const wrapper = document.createElement('div');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = props.triggerText || 'Open Dialog';
      btn.style.padding = '10px 24px';
      btn.style.background = '#0066cc';
      btn.style.color = '#fff';
      btn.style.border = 'none';
      btn.style.borderRadius = '4px';
      btn.style.cursor = 'pointer';
      btn.style.minHeight = '44px';

      const indicator = document.createElement('span');
      indicator.textContent = ` → [Dialog: ${props.title || 'Dialog'}]`;
      indicator.style.color = '#666';
      indicator.style.fontSize = '14px';
      indicator.style.fontStyle = 'italic';

      wrapper.appendChild(btn);
      wrapper.appendChild(indicator);
      return wrapper;
    },
    toHTML(props) {
      return `<button type="button" onclick="document.getElementById('dialog-1').showModal()">${props.triggerText || 'Open Dialog'}</button>\n<dialog id="dialog-1" aria-labelledby="dialog-title-1">\n  <h2 id="dialog-title-1">${props.title || 'Dialog Title'}</h2>\n  <p>${props.content || ''}</p>\n  <button type="button" onclick="this.closest('dialog').close()">Close</button>\n</dialog>`;
    }
  },
  {
    type: 'tooltip-trigger',
    category: 'interactive',
    label: 'Tooltip',
    icon: '#icon-tooltip',
    defaultProps: { text: 'Hover me', tooltip: 'This is helpful tooltip text' },
    render(props) {
      const wrapper = document.createElement('span');
      wrapper.style.position = 'relative';
      wrapper.style.display = 'inline-block';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = props.text || 'Hover me';
      btn.setAttribute('aria-describedby', 'tooltip-preview');
      btn.style.padding = '8px 16px';
      btn.style.background = '#f5f5f5';
      btn.style.border = '1px solid #ccc';
      btn.style.borderRadius = '4px';
      btn.style.cursor = 'help';
      const tip = document.createElement('span');
      tip.id = 'tooltip-preview';
      tip.setAttribute('role', 'tooltip');
      tip.textContent = props.tooltip || 'Tooltip';
      tip.style.position = 'absolute';
      tip.style.bottom = '100%';
      tip.style.left = '50%';
      tip.style.transform = 'translateX(-50%)';
      tip.style.background = '#333';
      tip.style.color = '#fff';
      tip.style.padding = '4px 8px';
      tip.style.borderRadius = '4px';
      tip.style.fontSize = '14px';
      tip.style.whiteSpace = 'nowrap';
      tip.style.marginBottom = '4px';
      wrapper.appendChild(btn);
      wrapper.appendChild(tip);
      return wrapper;
    },
    toHTML(props) {
      return `<span class="tooltip-wrapper">\n  <button type="button" aria-describedby="tooltip-1">${props.text || 'Hover me'}</button>\n  <span role="tooltip" id="tooltip-1">${props.tooltip || 'Tooltip'}</span>\n</span>`;
    }
  }
];
