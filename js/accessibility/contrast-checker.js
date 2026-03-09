/**
 * Contrast Checker - WCAG 2.1 color contrast ratio calculator.
 */
import { WCAG_CONTRAST, LARGE_TEXT_PX, LARGE_BOLD_PX, NAMED_COLORS } from '../core/constants.js';

export class ContrastChecker {
  parseColor(color) {
    if (!color || color === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };

    const named = NAMED_COLORS[color.toLowerCase()];
    if (named) color = named;

    let match;

    match = color.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/i);
    if (match) {
      return {
        r: parseInt(match[1], 16),
        g: parseInt(match[2], 16),
        b: parseInt(match[3], 16),
        a: match[4] ? parseInt(match[4], 16) / 255 : 1
      };
    }

    match = color.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
    if (match) {
      return {
        r: parseInt(match[1] + match[1], 16),
        g: parseInt(match[2] + match[2], 16),
        b: parseInt(match[3] + match[3], 16),
        a: 1
      };
    }

    match = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
        a: match[4] ? parseFloat(match[4]) : 1
      };
    }

    match = color.match(/hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*([\d.]+))?\s*\)/);
    if (match) {
      return this._hslToRgb(
        parseFloat(match[1]),
        parseFloat(match[2]),
        parseFloat(match[3]),
        match[4] ? parseFloat(match[4]) : 1
      );
    }

    return { r: 0, g: 0, b: 0, a: 1 };
  }

  _hslToRgb(h, s, l, a = 1) {
    h = h % 360;
    s = s / 100;
    l = l / 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r, g, b;
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
      a
    };
  }

  linearize(channel) {
    const s = channel / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  }

  luminance(color) {
    const { r, g, b } = typeof color === 'string' ? this.parseColor(color) : color;
    return 0.2126 * this.linearize(r) + 0.7152 * this.linearize(g) + 0.0722 * this.linearize(b);
  }

  contrastRatio(fg, bg) {
    const fgColor = typeof fg === 'string' ? this.parseColor(fg) : fg;
    const bgColor = typeof bg === 'string' ? this.parseColor(bg) : bg;

    const blended = this._alphaBlend(fgColor, bgColor);

    const l1 = this.luminance(blended.fg);
    const l2 = this.luminance(blended.bg);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  _alphaBlend(fg, bg) {
    if (fg.a === 1) return { fg, bg };

    return {
      fg: {
        r: Math.round(fg.r * fg.a + bg.r * (1 - fg.a)),
        g: Math.round(fg.g * fg.a + bg.g * (1 - fg.a)),
        b: Math.round(fg.b * fg.a + bg.b * (1 - fg.a)),
        a: 1
      },
      bg
    };
  }

  evaluate(ratio, fontSize, isBold = false) {
    const isLargeText = fontSize >= LARGE_TEXT_PX || (isBold && fontSize >= LARGE_BOLD_PX);

    return {
      ratio: Math.round(ratio * 100) / 100,
      isLargeText,
      AA: isLargeText ? ratio >= WCAG_CONTRAST.AA_LARGE : ratio >= WCAG_CONTRAST.AA_NORMAL,
      AAA: isLargeText ? ratio >= WCAG_CONTRAST.AAA_LARGE : ratio >= WCAG_CONTRAST.AAA_NORMAL,
      AAThreshold: isLargeText ? WCAG_CONTRAST.AA_LARGE : WCAG_CONTRAST.AA_NORMAL,
      AAAThreshold: isLargeText ? WCAG_CONTRAST.AAA_LARGE : WCAG_CONTRAST.AAA_NORMAL
    };
  }

  checkElement(element) {
    const style = element.ownerDocument.defaultView.getComputedStyle(element);
    const fgColor = style.color;
    const bgColor = this._resolveBackground(element);
    const fontSize = parseFloat(style.fontSize);
    const isBold = parseInt(style.fontWeight) >= 700 || style.fontWeight === 'bold';

    const ratio = this.contrastRatio(fgColor, bgColor);

    return {
      ...this.evaluate(ratio, fontSize, isBold),
      foreground: fgColor,
      background: bgColor,
      fontSize,
      isBold
    };
  }

  _resolveBackground(element) {
    let current = element;
    const doc = element.ownerDocument;
    const win = doc.defaultView;

    while (current && current !== doc.documentElement) {
      const bg = win.getComputedStyle(current).backgroundColor;
      if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
        const parsed = this.parseColor(bg);
        if (parsed.a === 1) return bg;
      }
      current = current.parentElement;
    }

    return 'rgb(255, 255, 255)';
  }
}
