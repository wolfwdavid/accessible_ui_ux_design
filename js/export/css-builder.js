/**
 * CSS Builder - Generates accessible CSS with custom properties.
 */
export class CSSBuilder {
  build() {
    return `/* ========================================
   AccessibleMake - Generated Accessible CSS
   ======================================== */

/* Custom Properties (Design Tokens) */
:root {
  /* Colors */
  --color-primary: #0066cc;
  --color-primary-dark: #004499;
  --color-text: #1a1a1a;
  --color-text-secondary: #595959;
  --color-background: #ffffff;
  --color-surface: #f8f9fa;
  --color-border: #dee2e6;
  --color-error: #d32f2f;
  --color-success: #2e7d32;
  --color-warning: #f9a825;

  /* Typography */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-size-base: 1rem;
  --font-size-sm: 0.875rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --line-height: 1.5;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  /* Focus */
  --focus-ring-color: var(--color-primary);
  --focus-ring-width: 2px;
  --focus-ring-offset: 2px;

  /* Touch targets */
  --min-target-size: 44px;
}

/* Reset */
*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  line-height: var(--line-height);
  color: var(--color-text);
  background-color: var(--color-background);
}

/* Focus Indicators (WCAG 2.4.7) */
:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}

/* Skip Navigation (WCAG 2.4.1) */
.skip-link {
  position: absolute;
  top: -100%;
  left: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-text);
  color: var(--color-background);
  text-decoration: none;
  font-weight: 600;
  z-index: 10000;
  border-radius: 0 0 4px 4px;
}

.skip-link:focus {
  top: 0;
}

/* Screen reader only text */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Interactive Elements - Minimum Touch Target (WCAG 2.5.5) */
button,
a,
input,
select,
textarea,
summary,
[role="button"],
[role="link"],
[role="tab"] {
  min-height: var(--min-target-size);
}

button, [role="button"] {
  min-width: var(--min-target-size);
  cursor: pointer;
}

/* Form Fields (WCAG 1.3.1, 3.3.2) */
.form-field {
  margin-bottom: var(--spacing-md);
}

.form-field label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: 600;
  color: var(--color-text);
}

.form-field input,
.form-field select,
.form-field textarea {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: var(--font-size-base);
  color: var(--color-text);
  background: var(--color-background);
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary);
}

/* Error States (WCAG 3.3.1) */
[aria-invalid="true"] {
  border-color: var(--color-error) !important;
}

.error-message {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-xs);
}

/* Reduced Motion (WCAG 2.3.3) */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  :root {
    --color-border: #000000;
    --focus-ring-width: 3px;
  }
}

/* Dark Mode (WCAG 1.4.3 maintained) */
@media (prefers-color-scheme: dark) {
  :root {
    --color-primary: #66b3ff;
    --color-primary-dark: #3399ff;
    --color-text: #e0e0e0;
    --color-text-secondary: #b0b0b0;
    --color-background: #121212;
    --color-surface: #1e1e1e;
    --color-border: #333333;
  }
}

/* Responsive Breakpoints */
@media (max-width: 768px) {
  :root {
    --font-size-base: 1rem;
    --spacing-md: 0.75rem;
    --spacing-lg: 1rem;
  }
}

@media (max-width: 480px) {
  :root {
    --spacing-xl: 1.5rem;
  }
}
`;
  }
}
