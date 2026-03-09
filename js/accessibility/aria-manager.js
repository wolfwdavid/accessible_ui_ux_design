/**
 * ARIA Manager - ARIA attribute editing and validation integrated into properties panel.
 */
import { VALID_ARIA_ROLES, VALID_ARIA_ATTRIBUTES, IMPLICIT_ROLES } from '../core/constants.js';

export class AriaManager {
  constructor(state, eventBus) {
    this._state = state;
    this._bus = eventBus;
  }

  renderAriaSection(containerEl, nodeId) {
    containerEl.innerHTML = '';
    const node = this._state.findNodeById(nodeId);
    if (!node) return;

    const section = document.createElement('div');
    section.className = 'aria-section';

    const title = document.createElement('h4');
    title.textContent = 'ARIA Attributes';
    title.className = 'props-section-title';
    section.appendChild(title);

    const implicitRole = IMPLICIT_ROLES[node.type] || 'generic';
    const roleInfo = document.createElement('div');
    roleInfo.className = 'aria-implicit-role';
    roleInfo.innerHTML = `<span class="aria-label">Implicit role:</span> <code>${implicitRole}</code>`;
    section.appendChild(roleInfo);

    const roleGroup = document.createElement('div');
    roleGroup.className = 'form-field';
    const roleLabel = document.createElement('label');
    roleLabel.textContent = 'Override Role';
    roleLabel.setAttribute('for', 'aria-role-input');
    const roleInput = document.createElement('input');
    roleInput.type = 'text';
    roleInput.id = 'aria-role-input';
    roleInput.value = node.ariaAttributes?.role || '';
    roleInput.placeholder = implicitRole;
    roleInput.setAttribute('list', 'aria-roles-list');
    roleInput.className = 'prop-input';

    const roleDatalist = document.createElement('datalist');
    roleDatalist.id = 'aria-roles-list';
    for (const role of VALID_ARIA_ROLES) {
      const opt = document.createElement('option');
      opt.value = role;
      roleDatalist.appendChild(opt);
    }

    roleInput.addEventListener('change', () => {
      const val = roleInput.value.trim();
      if (val && !VALID_ARIA_ROLES.includes(val)) {
        roleInput.style.borderColor = '#d32f2f';
        roleInput.setAttribute('aria-invalid', 'true');
      } else {
        roleInput.style.borderColor = '';
        roleInput.removeAttribute('aria-invalid');
        this._state.updateNodeAria(nodeId, { role: val || undefined });
      }
    });

    roleGroup.appendChild(roleLabel);
    roleGroup.appendChild(roleInput);
    roleGroup.appendChild(roleDatalist);
    section.appendChild(roleGroup);

    const commonAria = [
      { attr: 'aria-label', type: 'text', label: 'Label' },
      { attr: 'aria-labelledby', type: 'text', label: 'Labelled By (ID)' },
      { attr: 'aria-describedby', type: 'text', label: 'Described By (ID)' },
      { attr: 'aria-expanded', type: 'select', label: 'Expanded', options: ['', 'true', 'false'] },
      { attr: 'aria-hidden', type: 'select', label: 'Hidden', options: ['', 'true', 'false'] },
      { attr: 'aria-live', type: 'select', label: 'Live Region', options: ['', 'polite', 'assertive', 'off'] },
      { attr: 'aria-required', type: 'select', label: 'Required', options: ['', 'true', 'false'] },
      { attr: 'aria-invalid', type: 'select', label: 'Invalid', options: ['', 'true', 'false', 'grammar', 'spelling'] },
      { attr: 'aria-disabled', type: 'select', label: 'Disabled', options: ['', 'true', 'false'] },
      { attr: 'aria-current', type: 'select', label: 'Current', options: ['', 'page', 'step', 'location', 'date', 'time', 'true', 'false'] }
    ];

    for (const config of commonAria) {
      const group = document.createElement('div');
      group.className = 'form-field';

      const label = document.createElement('label');
      label.textContent = config.label;
      label.setAttribute('for', `prop-${config.attr}`);

      let input;
      if (config.type === 'select') {
        input = document.createElement('select');
        for (const opt of config.options) {
          const option = document.createElement('option');
          option.value = opt;
          option.textContent = opt || '(none)';
          input.appendChild(option);
        }
        input.value = node.ariaAttributes?.[config.attr] || '';
      } else {
        input = document.createElement('input');
        input.type = 'text';
        input.value = node.ariaAttributes?.[config.attr] || '';
      }

      input.id = `prop-${config.attr}`;
      input.className = 'prop-input';

      input.addEventListener('change', () => {
        const updates = {};
        updates[config.attr] = input.value || undefined;
        this._state.updateNodeAria(nodeId, updates);
      });

      group.appendChild(label);
      group.appendChild(input);
      section.appendChild(group);
    }

    containerEl.appendChild(section);
  }
}
