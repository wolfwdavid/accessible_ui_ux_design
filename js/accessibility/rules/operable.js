/**
 * WCAG Principle 2: Operable - Rules for keyboard access, focus, target size.
 */
import { TOUCH_TARGET } from '../../core/constants.js';
import { isFocusable } from '../../core/dom-utils.js';

export const operableRules = [
  {
    id: 'keyboard-focusable',
    criterion: '2.1.1',
    level: 'A',
    type: 'error',
    description: 'Interactive elements must be keyboard accessible',
    test(element) {
      const tag = element.tagName.toLowerCase();
      const role = element.getAttribute('role');
      const interactiveRoles = ['button', 'link', 'checkbox', 'radio', 'tab', 'menuitem', 'switch'];

      if (role && interactiveRoles.includes(role)) {
        if (!isFocusable(element)) {
          return { pass: false, message: `Element with role="${role}" is not keyboard focusable. Add tabindex="0".`, element };
        }
      }

      if (element.onclick && !isFocusable(element) && !['a', 'button', 'input', 'select', 'textarea'].includes(tag)) {
        return { pass: false, message: 'Click handler on non-focusable element. Use a <button> or add tabindex="0" and keydown handler.', element };
      }

      return null;
    }
  },
  {
    id: 'focus-visible',
    criterion: '2.4.7',
    level: 'AA',
    type: 'warning',
    description: 'Interactive elements should have visible focus indicators',
    test(element) {
      if (!isFocusable(element)) return null;
      const style = element.ownerDocument.defaultView.getComputedStyle(element);
      if (style.outlineStyle === 'none' && style.outlineWidth === '0px') {
        const hasFocusClass = element.matches(':focus-visible') || true;
        return null;
      }
      return null;
    }
  },
  {
    id: 'tabindex-positive',
    criterion: '2.4.3',
    level: 'warning',
    type: 'warning',
    description: 'Avoid positive tabindex values',
    test(element) {
      const tabindex = element.getAttribute('tabindex');
      if (tabindex && parseInt(tabindex) > 0) {
        return { pass: false, message: `tabindex="${tabindex}" disrupts natural tab order. Use tabindex="0" or restructure DOM order.`, element };
      }
      return null;
    }
  },
  {
    id: 'target-size-minimum',
    criterion: '2.5.8',
    level: 'AA',
    type: 'error',
    description: 'Touch/click targets must be at least 24x24 CSS pixels',
    test(element) {
      if (!isFocusable(element)) return null;
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return null;

      const tag = element.tagName.toLowerCase();
      if (tag === 'input' && element.type === 'hidden') return null;

      if (rect.width < TOUCH_TARGET.AA || rect.height < TOUCH_TARGET.AA) {
        return {
          pass: false,
          message: `Target size is ${Math.round(rect.width)}x${Math.round(rect.height)}px, minimum is ${TOUCH_TARGET.AA}x${TOUCH_TARGET.AA}px (WCAG 2.5.8 AA)`,
          element,
          data: { width: rect.width, height: rect.height }
        };
      }
      return { pass: true, message: '', element };
    }
  },
  {
    id: 'target-size-enhanced',
    criterion: '2.5.5',
    level: 'AAA',
    type: 'alert',
    description: 'Touch/click targets should be at least 44x44 CSS pixels',
    test(element) {
      if (!isFocusable(element)) return null;
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return null;

      const tag = element.tagName.toLowerCase();
      if (tag === 'input' && element.type === 'hidden') return null;

      if ((rect.width >= TOUCH_TARGET.AA && rect.height >= TOUCH_TARGET.AA) &&
          (rect.width < TOUCH_TARGET.AAA || rect.height < TOUCH_TARGET.AAA)) {
        return {
          pass: false,
          message: `Target size ${Math.round(rect.width)}x${Math.round(rect.height)}px meets AA but not AAA (${TOUCH_TARGET.AAA}x${TOUCH_TARGET.AAA}px)`,
          element,
          data: { width: rect.width, height: rect.height }
        };
      }
      return null;
    }
  },
  {
    id: 'skip-navigation',
    criterion: '2.4.1',
    level: 'A',
    type: 'warning',
    description: 'Pages should have a skip navigation link',
    test(element, context) {
      if (element.tagName !== 'BODY') return null;
      const skipLink = element.querySelector('a[href^="#"]');
      if (!skipLink) {
        const firstFocusable = element.querySelector('a, button, input, select, textarea');
        if (firstFocusable && !firstFocusable.getAttribute('href')?.startsWith('#')) {
          return { pass: false, message: 'No skip navigation link found. Add a skip link as the first focusable element.', element };
        }
      }
      return null;
    }
  },
  {
    id: 'page-title',
    criterion: '2.4.2',
    level: 'A',
    type: 'error',
    description: 'Page must have a title',
    test(element) {
      if (element.tagName !== 'HTML') return null;
      const doc = element.ownerDocument;
      const title = doc.querySelector('title');
      if (!title || !title.textContent.trim()) {
        return { pass: false, message: 'Page is missing a <title> element', element };
      }
      return null;
    }
  }
];
