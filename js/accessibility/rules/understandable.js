/**
 * WCAG Principle 3: Understandable - Rules for labels, language, error prevention.
 */
import { SUSPICIOUS_LINK_TEXTS } from '../../core/constants.js';

export const understandableRules = [
  {
    id: 'lang-missing',
    criterion: '3.1.1',
    level: 'A',
    type: 'error',
    description: 'Page must have a lang attribute',
    test(element) {
      if (element.tagName !== 'HTML') return null;
      if (!element.hasAttribute('lang') || !element.getAttribute('lang').trim()) {
        return { pass: false, message: 'The <html> element is missing a lang attribute', element };
      }
      return { pass: true, message: '', element };
    }
  },
  {
    id: 'label-missing',
    criterion: '3.3.2',
    level: 'A',
    type: 'error',
    description: 'Form inputs must have associated labels',
    test(element) {
      const tag = element.tagName.toLowerCase();
      if (!['input', 'select', 'textarea'].includes(tag)) return null;
      if (element.type === 'hidden' || element.type === 'submit' || element.type === 'button' || element.type === 'reset' || element.type === 'image') return null;

      if (element.getAttribute('aria-label') || element.getAttribute('aria-labelledby')) {
        return { pass: true, message: '', element };
      }

      const id = element.id;
      if (id) {
        const doc = element.ownerDocument;
        const label = doc.querySelector(`label[for="${id}"]`);
        if (label && label.textContent.trim()) {
          return { pass: true, message: '', element };
        }
      }

      const parentLabel = element.closest('label');
      if (parentLabel && parentLabel.textContent.trim()) {
        return { pass: true, message: '', element };
      }

      if (element.getAttribute('title')) {
        return { pass: true, message: '', element };
      }

      return { pass: false, message: `Form ${tag} is missing an associated label`, element };
    }
  },
  {
    id: 'label-empty',
    criterion: '3.3.2',
    level: 'A',
    type: 'error',
    description: 'Form labels must not be empty',
    test(element) {
      if (element.tagName !== 'LABEL') return null;
      const text = element.textContent.trim();
      const hasImg = element.querySelector('img[alt]');
      if (!text && !hasImg) {
        return { pass: false, message: 'Label element is empty', element };
      }
      return null;
    }
  },
  {
    id: 'link-empty',
    criterion: '2.4.4',
    level: 'A',
    type: 'error',
    description: 'Links must have discernible text',
    test(element) {
      if (element.tagName !== 'A') return null;
      if (!element.hasAttribute('href')) return null;

      const text = element.textContent.trim();
      const ariaLabel = element.getAttribute('aria-label');
      const hasImg = element.querySelector('img[alt]');
      const title = element.getAttribute('title');

      if (!text && !ariaLabel && !hasImg && !title) {
        return { pass: false, message: 'Link has no discernible text', element };
      }
      return null;
    }
  },
  {
    id: 'link-suspicious-text',
    criterion: '2.4.4',
    level: 'AA',
    type: 'warning',
    description: 'Link text should be descriptive',
    test(element) {
      if (element.tagName !== 'A') return null;
      const text = (element.textContent || '').trim().toLowerCase();
      if (SUSPICIOUS_LINK_TEXTS.includes(text)) {
        return { pass: false, message: `Link text "${text}" is not descriptive. Use text that describes the destination.`, element };
      }
      return null;
    }
  },
  {
    id: 'heading-empty',
    criterion: '1.3.1',
    level: 'A',
    type: 'error',
    description: 'Headings must not be empty',
    test(element) {
      if (!element.tagName.match(/^H[1-6]$/)) return null;
      if (!element.textContent.trim()) {
        return { pass: false, message: `Empty ${element.tagName.toLowerCase()} heading`, element };
      }
      return null;
    }
  },
  {
    id: 'heading-skip-level',
    criterion: '1.3.1',
    level: 'A',
    type: 'warning',
    description: 'Heading levels should not be skipped',
    test(element, context) {
      if (!element.tagName.match(/^H[1-6]$/)) return null;
      const level = parseInt(element.tagName[1]);

      if (context?.previousHeadingLevel !== undefined) {
        if (level > context.previousHeadingLevel + 1) {
          return {
            pass: false,
            message: `Heading level skipped from h${context.previousHeadingLevel} to h${level}`,
            element
          };
        }
      }
      return null;
    }
  },
  {
    id: 'heading-no-h1',
    criterion: '1.3.1',
    level: 'A',
    type: 'warning',
    description: 'Page should have at least one h1',
    test(element) {
      if (element.tagName !== 'BODY') return null;
      const h1 = element.querySelector('h1');
      if (!h1) {
        return { pass: false, message: 'Page does not have an h1 heading', element };
      }
      return null;
    }
  },
  {
    id: 'autocomplete-valid',
    criterion: '1.3.5',
    level: 'AA',
    type: 'warning',
    description: 'Autocomplete attribute should use valid values',
    test(element) {
      if (!element.hasAttribute('autocomplete')) return null;
      const validValues = [
        'off', 'on', 'name', 'honorific-prefix', 'given-name', 'additional-name',
        'family-name', 'honorific-suffix', 'nickname', 'email', 'username',
        'new-password', 'current-password', 'one-time-code', 'organization-title',
        'organization', 'street-address', 'address-line1', 'address-line2',
        'address-line3', 'address-level1', 'address-level2', 'address-level3',
        'address-level4', 'country', 'country-name', 'postal-code',
        'cc-name', 'cc-given-name', 'cc-additional-name', 'cc-family-name',
        'cc-number', 'cc-exp', 'cc-exp-month', 'cc-exp-year', 'cc-csc', 'cc-type',
        'transaction-currency', 'transaction-amount', 'language', 'bday',
        'bday-day', 'bday-month', 'bday-year', 'sex', 'tel', 'tel-country-code',
        'tel-national', 'tel-area-code', 'tel-local', 'tel-extension',
        'impp', 'url', 'photo'
      ];
      const value = element.getAttribute('autocomplete').trim().toLowerCase();
      const parts = value.split(/\s+/);
      const mainValue = parts[parts.length - 1];
      if (!validValues.includes(mainValue)) {
        return { pass: false, message: `Invalid autocomplete value "${value}"`, element };
      }
      return null;
    }
  }
];
