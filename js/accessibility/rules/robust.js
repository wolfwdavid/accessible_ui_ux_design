/**
 * WCAG Principle 4: Robust - Rules for parsing, name/role/value, status messages.
 */
import { VALID_ARIA_ROLES, VALID_ARIA_ATTRIBUTES, IMPLICIT_ROLES } from '../../core/constants.js';

export const robustRules = [
  {
    id: 'aria-role-valid',
    criterion: '4.1.2',
    level: 'A',
    type: 'error',
    description: 'ARIA roles must be valid',
    test(element) {
      const role = element.getAttribute('role');
      if (!role) return null;
      const roles = role.trim().split(/\s+/);
      for (const r of roles) {
        if (!VALID_ARIA_ROLES.includes(r)) {
          return { pass: false, message: `Invalid ARIA role "${r}"`, element };
        }
      }
      return null;
    }
  },
  {
    id: 'aria-attr-valid',
    criterion: '4.1.2',
    level: 'A',
    type: 'error',
    description: 'ARIA attributes must be valid',
    test(element) {
      for (const attr of element.attributes) {
        if (attr.name.startsWith('aria-') && !VALID_ARIA_ATTRIBUTES.includes(attr.name)) {
          return { pass: false, message: `Invalid ARIA attribute "${attr.name}"`, element };
        }
      }
      return null;
    }
  },
  {
    id: 'aria-role-redundant',
    criterion: '4.1.2',
    level: 'A',
    type: 'alert',
    description: 'ARIA role is redundant with implicit role',
    test(element) {
      const role = element.getAttribute('role');
      if (!role) return null;
      const tag = element.tagName.toLowerCase();
      const implicitRole = IMPLICIT_ROLES[tag];
      if (implicitRole && implicitRole === role.trim()) {
        return { pass: false, message: `role="${role}" is redundant on <${tag}> (implicit role is "${implicitRole}")`, element };
      }
      return null;
    }
  },
  {
    id: 'button-name',
    criterion: '4.1.2',
    level: 'A',
    type: 'error',
    description: 'Buttons must have an accessible name',
    test(element) {
      if (element.tagName !== 'BUTTON' && element.getAttribute('role') !== 'button') return null;

      const text = element.textContent?.trim();
      const ariaLabel = element.getAttribute('aria-label');
      const ariaLabelledBy = element.getAttribute('aria-labelledby');
      const title = element.getAttribute('title');
      const hasImg = element.querySelector('img[alt]');

      if (!text && !ariaLabel && !ariaLabelledBy && !title && !hasImg) {
        return { pass: false, message: 'Button has no accessible name', element };
      }
      return null;
    }
  },
  {
    id: 'landmark-main-missing',
    criterion: '1.3.1',
    level: 'A',
    type: 'warning',
    description: 'Page should have a main landmark',
    test(element) {
      if (element.tagName !== 'BODY') return null;
      const main = element.querySelector('main, [role="main"]');
      if (!main) {
        return { pass: false, message: 'No <main> landmark found', element };
      }
      return null;
    }
  },
  {
    id: 'landmark-duplicate-main',
    criterion: '1.3.1',
    level: 'A',
    type: 'error',
    description: 'Page should not have multiple main landmarks',
    test(element) {
      if (element.tagName !== 'BODY') return null;
      const mains = element.querySelectorAll('main, [role="main"]');
      if (mains.length > 1) {
        return { pass: false, message: `Found ${mains.length} main landmarks. There should be only one.`, element };
      }
      return null;
    }
  },
  {
    id: 'duplicate-id',
    criterion: '4.1.1',
    level: 'A',
    type: 'error',
    description: 'Element IDs must be unique',
    test(element, context) {
      if (!element.id) return null;
      if (!context?._idCounts) return null;
      if (context._idCounts[element.id] > 1) {
        return { pass: false, message: `Duplicate id="${element.id}"`, element };
      }
      return null;
    }
  },
  {
    id: 'aria-hidden-focusable',
    criterion: '4.1.2',
    level: 'A',
    type: 'error',
    description: 'aria-hidden elements should not contain focusable elements',
    test(element) {
      if (element.getAttribute('aria-hidden') !== 'true') return null;
      const focusable = element.querySelector('a[href], button, input, select, textarea, [tabindex]');
      if (focusable && !focusable.disabled) {
        return { pass: false, message: 'aria-hidden="true" element contains focusable content', element };
      }
      return null;
    }
  },
  {
    id: 'list-structure',
    criterion: '1.3.1',
    level: 'A',
    type: 'error',
    description: 'Lists must only contain proper list items',
    test(element) {
      if (element.tagName !== 'UL' && element.tagName !== 'OL') return null;
      for (const child of element.children) {
        if (child.tagName !== 'LI' && child.tagName !== 'SCRIPT' && child.tagName !== 'TEMPLATE') {
          return { pass: false, message: `${element.tagName.toLowerCase()} contains non-li child: <${child.tagName.toLowerCase()}>`, element };
        }
      }
      return null;
    }
  }
];
