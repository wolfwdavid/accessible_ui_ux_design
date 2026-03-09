/**
 * Form Components - Inputs, selects, textareas, fieldsets with proper labeling.
 */

let formIdCounter = 0;
function formId() { return `form-field-${++formIdCounter}`; }

export const formComponents = [
  {
    type: 'text-input',
    category: 'forms',
    label: 'Text Input',
    icon: '#icon-input',
    defaultProps: { label: 'Label', placeholder: '', required: false, type: 'text', helpText: '' },
    requiredA11y: ['label'],
    render(props) {
      const wrapper = document.createElement('div');
      wrapper.className = 'form-field';
      const id = formId();
      const label = document.createElement('label');
      label.setAttribute('for', id);
      label.textContent = props.label || 'Label';
      label.style.display = 'block';
      label.style.marginBottom = '4px';
      label.style.fontWeight = '600';
      const input = document.createElement('input');
      input.type = props.type || 'text';
      input.id = id;
      input.placeholder = props.placeholder || '';
      if (props.required) input.required = true;
      input.style.padding = '8px 12px';
      input.style.border = '1px solid #767676';
      input.style.borderRadius = '4px';
      input.style.width = '100%';
      input.style.fontSize = '16px';
      wrapper.appendChild(label);
      if (props.helpText) {
        const help = document.createElement('span');
        help.id = `${id}-help`;
        help.textContent = props.helpText;
        help.style.fontSize = '14px';
        help.style.color = '#595959';
        help.style.display = 'block';
        help.style.marginBottom = '4px';
        input.setAttribute('aria-describedby', `${id}-help`);
        wrapper.appendChild(help);
      }
      wrapper.appendChild(input);
      return wrapper;
    },
    toHTML(props) {
      const id = formId();
      const req = props.required ? ' required' : '';
      const ph = props.placeholder ? ` placeholder="${props.placeholder}"` : '';
      let help = '';
      let desc = '';
      if (props.helpText) {
        help = `\n  <span id="${id}-help">${props.helpText}</span>`;
        desc = ` aria-describedby="${id}-help"`;
      }
      return `<div class="form-field">\n  <label for="${id}">${props.label || 'Label'}</label>${help}\n  <input type="${props.type || 'text'}" id="${id}"${ph}${req}${desc}>\n</div>`;
    }
  },
  {
    type: 'textarea',
    category: 'forms',
    label: 'Textarea',
    icon: '#icon-textarea',
    defaultProps: { label: 'Message', placeholder: '', required: false, rows: 4 },
    requiredA11y: ['label'],
    render(props) {
      const wrapper = document.createElement('div');
      wrapper.className = 'form-field';
      const id = formId();
      const label = document.createElement('label');
      label.setAttribute('for', id);
      label.textContent = props.label || 'Message';
      label.style.display = 'block';
      label.style.marginBottom = '4px';
      label.style.fontWeight = '600';
      const textarea = document.createElement('textarea');
      textarea.id = id;
      textarea.rows = props.rows || 4;
      textarea.placeholder = props.placeholder || '';
      if (props.required) textarea.required = true;
      textarea.style.padding = '8px 12px';
      textarea.style.border = '1px solid #767676';
      textarea.style.borderRadius = '4px';
      textarea.style.width = '100%';
      textarea.style.fontSize = '16px';
      textarea.style.resize = 'vertical';
      wrapper.appendChild(label);
      wrapper.appendChild(textarea);
      return wrapper;
    },
    toHTML(props) {
      const id = formId();
      const req = props.required ? ' required' : '';
      return `<div class="form-field">\n  <label for="${id}">${props.label || 'Message'}</label>\n  <textarea id="${id}" rows="${props.rows || 4}"${req}></textarea>\n</div>`;
    }
  },
  {
    type: 'select',
    category: 'forms',
    label: 'Select',
    icon: '#icon-select',
    defaultProps: {
      label: 'Choose option',
      options: ['Option 1', 'Option 2', 'Option 3'],
      required: false
    },
    requiredA11y: ['label'],
    render(props) {
      const wrapper = document.createElement('div');
      wrapper.className = 'form-field';
      const id = formId();
      const label = document.createElement('label');
      label.setAttribute('for', id);
      label.textContent = props.label || 'Choose option';
      label.style.display = 'block';
      label.style.marginBottom = '4px';
      label.style.fontWeight = '600';
      const select = document.createElement('select');
      select.id = id;
      if (props.required) select.required = true;
      select.style.padding = '8px 12px';
      select.style.border = '1px solid #767676';
      select.style.borderRadius = '4px';
      select.style.width = '100%';
      select.style.fontSize = '16px';
      for (const opt of (props.options || [])) {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        select.appendChild(option);
      }
      wrapper.appendChild(label);
      wrapper.appendChild(select);
      return wrapper;
    },
    toHTML(props) {
      const id = formId();
      const req = props.required ? ' required' : '';
      const opts = (props.options || []).map(o => `    <option value="${o}">${o}</option>`).join('\n');
      return `<div class="form-field">\n  <label for="${id}">${props.label || 'Choose option'}</label>\n  <select id="${id}"${req}>\n${opts}\n  </select>\n</div>`;
    }
  },
  {
    type: 'checkbox',
    category: 'forms',
    label: 'Checkbox',
    icon: '#icon-checkbox',
    defaultProps: { label: 'Accept terms', checked: false },
    requiredA11y: ['label'],
    render(props) {
      const wrapper = document.createElement('div');
      wrapper.className = 'form-field';
      const label = document.createElement('label');
      label.style.display = 'flex';
      label.style.alignItems = 'center';
      label.style.gap = '8px';
      label.style.cursor = 'pointer';
      const input = document.createElement('input');
      input.type = 'checkbox';
      if (props.checked) input.checked = true;
      input.style.width = '20px';
      input.style.height = '20px';
      label.appendChild(input);
      label.appendChild(document.createTextNode(props.label || 'Checkbox'));
      wrapper.appendChild(label);
      return wrapper;
    },
    toHTML(props) {
      const checked = props.checked ? ' checked' : '';
      return `<div class="form-field">\n  <label><input type="checkbox"${checked}> ${props.label || 'Checkbox'}</label>\n</div>`;
    }
  },
  {
    type: 'radio-group',
    category: 'forms',
    label: 'Radio Group',
    icon: '#icon-radio',
    defaultProps: {
      legend: 'Choose one',
      name: 'radio-group',
      options: ['Option A', 'Option B', 'Option C'],
      selected: ''
    },
    requiredA11y: ['legend'],
    render(props) {
      const fieldset = document.createElement('fieldset');
      fieldset.style.border = '1px solid #767676';
      fieldset.style.borderRadius = '4px';
      fieldset.style.padding = '16px';
      const legend = document.createElement('legend');
      legend.textContent = props.legend || 'Choose one';
      legend.style.fontWeight = '600';
      fieldset.appendChild(legend);
      const name = props.name || 'radio-group';
      for (const opt of (props.options || [])) {
        const label = document.createElement('label');
        label.style.display = 'flex';
        label.style.alignItems = 'center';
        label.style.gap = '8px';
        label.style.marginTop = '8px';
        label.style.cursor = 'pointer';
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = name;
        input.value = opt;
        if (opt === props.selected) input.checked = true;
        input.style.width = '20px';
        input.style.height = '20px';
        label.appendChild(input);
        label.appendChild(document.createTextNode(opt));
        fieldset.appendChild(label);
      }
      return fieldset;
    },
    toHTML(props) {
      const name = props.name || 'radio-group';
      const radios = (props.options || []).map(opt => {
        const checked = opt === props.selected ? ' checked' : '';
        return `    <label><input type="radio" name="${name}" value="${opt}"${checked}> ${opt}</label>`;
      }).join('\n');
      return `<fieldset>\n  <legend>${props.legend || 'Choose one'}</legend>\n${radios}\n</fieldset>`;
    }
  },
  {
    type: 'form-button',
    category: 'forms',
    label: 'Submit Button',
    icon: '#icon-submit',
    defaultProps: { text: 'Submit', type: 'submit' },
    render(props) {
      const btn = document.createElement('button');
      btn.type = props.type || 'submit';
      btn.textContent = props.text || 'Submit';
      btn.style.padding = '10px 24px';
      btn.style.background = '#0066cc';
      btn.style.color = '#fff';
      btn.style.border = 'none';
      btn.style.borderRadius = '4px';
      btn.style.fontSize = '16px';
      btn.style.cursor = 'pointer';
      btn.style.minWidth = '44px';
      btn.style.minHeight = '44px';
      return btn;
    },
    toHTML(props) {
      return `<button type="${props.type || 'submit'}">${props.text || 'Submit'}</button>`;
    }
  }
];
