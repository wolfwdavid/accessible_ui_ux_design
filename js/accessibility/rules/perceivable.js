/**
 * WCAG Principle 1: Perceivable - Rules for alt text, contrast, sensory info.
 */
import { SUSPICIOUS_ALT_TEXTS } from '../../core/constants.js';

export const perceivableRules = [
  {
    id: 'img-alt-missing',
    criterion: '1.1.1',
    level: 'A',
    type: 'error',
    description: 'Images must have alternative text',
    test(element) {
      if (element.tagName !== 'IMG') return null;
      if (element.getAttribute('role') === 'presentation' || element.getAttribute('role') === 'none') {
        if (element.getAttribute('alt') === '') return null;
      }
      if (!element.hasAttribute('alt')) {
        return { pass: false, message: 'Image is missing alt attribute', element };
      }
      return { pass: true, message: '', element };
    }
  },
  {
    id: 'img-alt-empty',
    criterion: '1.1.1',
    level: 'A',
    type: 'warning',
    description: 'Image has empty alt text — verify it is decorative',
    test(element) {
      if (element.tagName !== 'IMG') return null;
      if (element.getAttribute('role') === 'presentation' || element.getAttribute('role') === 'none') return null;
      const alt = element.getAttribute('alt');
      if (alt === '') {
        return { pass: false, message: 'Image has empty alt text. If decorative, add role="presentation". Otherwise provide descriptive alt text.', element };
      }
      return null;
    }
  },
  {
    id: 'img-alt-suspicious',
    criterion: '1.1.1',
    level: 'A',
    type: 'warning',
    description: 'Image alt text appears to be a filename or generic',
    test(element) {
      if (element.tagName !== 'IMG') return null;
      const alt = (element.getAttribute('alt') || '').toLowerCase().trim();
      if (!alt) return null;
      if (alt.match(/\.(jpg|jpeg|png|gif|svg|webp|bmp|ico)$/i)) {
        return { pass: false, message: `Alt text "${alt}" appears to be a filename`, element };
      }
      if (SUSPICIOUS_ALT_TEXTS.includes(alt)) {
        return { pass: false, message: `Alt text "${alt}" is too generic`, element };
      }
      return null;
    }
  },
  {
    id: 'contrast-normal-aa',
    criterion: '1.4.3',
    level: 'AA',
    type: 'error',
    description: 'Text must have sufficient contrast ratio (AA)',
    test(element, context) {
      if (!context?.contrastChecker) return null;
      if (!element.textContent?.trim()) return null;
      if (element.children.length > 0 && element.textContent === element.innerHTML) return null;

      const hasDirectText = Array.from(element.childNodes).some(
        n => n.nodeType === 3 && n.textContent.trim()
      );
      if (!hasDirectText) return null;

      const check = context.contrastChecker.checkElement(element);
      if (!check.AA) {
        return {
          pass: false,
          message: `Contrast ratio ${check.ratio}:1 is below ${check.AAThreshold}:1 (AA ${check.isLargeText ? 'large' : 'normal'} text)`,
          element,
          data: check
        };
      }
      return { pass: true, message: '', element };
    }
  },
  {
    id: 'contrast-enhanced-aaa',
    criterion: '1.4.6',
    level: 'AAA',
    type: 'alert',
    description: 'Text should have enhanced contrast ratio (AAA)',
    test(element, context) {
      if (!context?.contrastChecker) return null;
      if (!element.textContent?.trim()) return null;

      const hasDirectText = Array.from(element.childNodes).some(
        n => n.nodeType === 3 && n.textContent.trim()
      );
      if (!hasDirectText) return null;

      const check = context.contrastChecker.checkElement(element);
      if (check.AA && !check.AAA) {
        return {
          pass: false,
          message: `Contrast ratio ${check.ratio}:1 passes AA but not AAA (needs ${check.AAAThreshold}:1)`,
          element,
          data: check
        };
      }
      return null;
    }
  },
  {
    id: 'video-captions',
    criterion: '1.2.2',
    level: 'A',
    type: 'warning',
    description: 'Videos should have captions',
    test(element) {
      if (element.tagName !== 'VIDEO') return null;
      const tracks = element.querySelectorAll('track[kind="captions"], track[kind="subtitles"]');
      if (tracks.length === 0) {
        return { pass: false, message: 'Video does not have captions track', element };
      }
      return { pass: true, message: '', element };
    }
  },
  {
    id: 'audio-transcript',
    criterion: '1.2.1',
    level: 'A',
    type: 'warning',
    description: 'Audio content should have a transcript',
    test(element) {
      if (element.tagName !== 'AUDIO') return null;
      return { pass: false, message: 'Verify that a transcript is available for this audio content', element };
    }
  }
];
