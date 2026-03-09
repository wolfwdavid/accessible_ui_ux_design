/**
 * Export Validators - Post-generation WCAG validation of exported code.
 */
export class ExportValidator {
  validate(html) {
    const issues = [];

    if (!html.includes('lang=')) {
      issues.push({ type: 'error', rule: '3.1.1', message: 'Missing lang attribute on <html>' });
    }

    if (!html.includes('<title>') || html.includes('<title></title>')) {
      issues.push({ type: 'error', rule: '2.4.2', message: 'Missing or empty page title' });
    }

    if (!html.includes('viewport')) {
      issues.push({ type: 'warning', rule: '1.4.4', message: 'Missing viewport meta tag' });
    }

    if (html.includes('user-scalable=no') || html.includes('user-scalable=0')) {
      issues.push({ type: 'error', rule: '1.4.4', message: 'Pinch-to-zoom is disabled (user-scalable=no)' });
    }

    if (!html.includes('<main') && !html.includes('role="main"')) {
      issues.push({ type: 'warning', rule: '1.3.1', message: 'No <main> landmark found' });
    }

    if (!html.includes('<h1')) {
      issues.push({ type: 'warning', rule: '1.3.1', message: 'No <h1> heading found' });
    }

    const imgMatches = html.match(/<img[^>]*>/gi) || [];
    for (const img of imgMatches) {
      if (!img.includes('alt=')) {
        issues.push({ type: 'error', rule: '1.1.1', message: 'Image missing alt attribute' });
      }
    }

    if (!html.includes('skip') && !html.includes('Skip')) {
      issues.push({ type: 'warning', rule: '2.4.1', message: 'No skip navigation link detected' });
    }

    if (!html.includes(':focus') && !html.includes('focus-visible')) {
      issues.push({ type: 'warning', rule: '2.4.7', message: 'No focus indicator styles detected' });
    }

    if (!html.includes('prefers-reduced-motion')) {
      issues.push({ type: 'alert', rule: '2.3.3', message: 'No prefers-reduced-motion media query' });
    }

    const inputMatches = html.match(/<input[^>]*>/gi) || [];
    for (const input of inputMatches) {
      if (input.includes('type="hidden"') || input.includes('type="submit"')) continue;
      if (!input.includes('id=') && !input.includes('aria-label')) {
        issues.push({ type: 'warning', rule: '3.3.2', message: 'Form input may be missing associated label' });
      }
    }

    return {
      valid: issues.filter(i => i.type === 'error').length === 0,
      issues,
      errorCount: issues.filter(i => i.type === 'error').length,
      warningCount: issues.filter(i => i.type === 'warning').length,
      alertCount: issues.filter(i => i.type === 'alert').length
    };
  }
}
