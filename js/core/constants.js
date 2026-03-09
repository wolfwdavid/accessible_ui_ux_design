/**
 * Constants - WCAG thresholds, ARIA role maps, default configuration.
 */

export const WCAG_CONTRAST = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3,
  AAA_NORMAL: 7,
  AAA_LARGE: 4.5,
  UI_COMPONENT: 3
};

export const LARGE_TEXT_PX = 24;    // 18pt
export const LARGE_BOLD_PX = 18.66; // 14pt bold

export const TOUCH_TARGET = {
  AAA: 44,
  AA: 24
};

export const IMPLICIT_ROLES = {
  a: 'link',
  article: 'article',
  aside: 'complementary',
  button: 'button',
  details: 'group',
  dialog: 'dialog',
  footer: 'contentinfo',
  form: 'form',
  h1: 'heading',
  h2: 'heading',
  h3: 'heading',
  h4: 'heading',
  h5: 'heading',
  h6: 'heading',
  header: 'banner',
  hr: 'separator',
  img: 'img',
  input: 'textbox',
  'input[type="checkbox"]': 'checkbox',
  'input[type="radio"]': 'radio',
  'input[type="range"]': 'slider',
  'input[type="search"]': 'searchbox',
  'input[type="email"]': 'textbox',
  'input[type="tel"]': 'textbox',
  'input[type="url"]': 'textbox',
  'input[type="number"]': 'spinbutton',
  li: 'listitem',
  main: 'main',
  nav: 'navigation',
  ol: 'list',
  option: 'option',
  progress: 'progressbar',
  section: 'region',
  select: 'combobox',
  summary: 'button',
  table: 'table',
  tbody: 'rowgroup',
  td: 'cell',
  textarea: 'textbox',
  th: 'columnheader',
  thead: 'rowgroup',
  tr: 'row',
  ul: 'list'
};

export const VALID_ARIA_ROLES = [
  'alert', 'alertdialog', 'application', 'article', 'banner', 'button',
  'cell', 'checkbox', 'columnheader', 'combobox', 'complementary',
  'contentinfo', 'definition', 'dialog', 'directory', 'document',
  'feed', 'figure', 'form', 'grid', 'gridcell', 'group', 'heading',
  'img', 'link', 'list', 'listbox', 'listitem', 'log', 'main',
  'marquee', 'math', 'menu', 'menubar', 'menuitem', 'menuitemcheckbox',
  'menuitemradio', 'navigation', 'none', 'note', 'option', 'presentation',
  'progressbar', 'radio', 'radiogroup', 'region', 'row', 'rowgroup',
  'rowheader', 'scrollbar', 'search', 'searchbox', 'separator',
  'slider', 'spinbutton', 'status', 'switch', 'tab', 'table',
  'tablist', 'tabpanel', 'term', 'textbox', 'timer', 'toolbar',
  'tooltip', 'tree', 'treegrid', 'treeitem'
];

export const VALID_ARIA_ATTRIBUTES = [
  'aria-activedescendant', 'aria-atomic', 'aria-autocomplete',
  'aria-busy', 'aria-checked', 'aria-colcount', 'aria-colindex',
  'aria-colspan', 'aria-controls', 'aria-current', 'aria-describedby',
  'aria-details', 'aria-disabled', 'aria-dropeffect', 'aria-errormessage',
  'aria-expanded', 'aria-flowto', 'aria-grabbed', 'aria-haspopup',
  'aria-hidden', 'aria-invalid', 'aria-keyshortcuts', 'aria-label',
  'aria-labelledby', 'aria-level', 'aria-live', 'aria-modal',
  'aria-multiline', 'aria-multiselectable', 'aria-orientation',
  'aria-owns', 'aria-placeholder', 'aria-posinset', 'aria-pressed',
  'aria-readonly', 'aria-relevant', 'aria-required', 'aria-roledescription',
  'aria-rowcount', 'aria-rowindex', 'aria-rowspan', 'aria-selected',
  'aria-setsize', 'aria-sort', 'aria-valuemax', 'aria-valuemin',
  'aria-valuenow', 'aria-valuetext'
];

export const SUSPICIOUS_ALT_TEXTS = [
  'image', 'img', 'photo', 'picture', 'graphic', 'icon', 'logo',
  'banner', 'spacer', 'placeholder', 'untitled', 'screenshot',
  'thumbnail', 'hero'
];

export const SUSPICIOUS_LINK_TEXTS = [
  'click here', 'here', 'read more', 'more', 'link', 'click',
  'this link', 'go', 'learn more', 'details'
];

export const NAMED_COLORS = {
  black: '#000000', white: '#ffffff', red: '#ff0000', green: '#008000',
  blue: '#0000ff', yellow: '#ffff00', cyan: '#00ffff', magenta: '#ff00ff',
  silver: '#c0c0c0', gray: '#808080', maroon: '#800000', olive: '#808000',
  purple: '#800080', teal: '#008080', navy: '#000080', orange: '#ffa500',
  transparent: 'rgba(0,0,0,0)'
};

export const DEFAULT_CONFIG = {
  auditDebounceMs: 300,
  maxUndoSteps: 50,
  gridSize: 8,
  canvasWidth: 1440,
  canvasHeight: 900
};

export const COMPONENT_CATEGORIES = [
  { id: 'layout', label: 'Layout', icon: '#icon-layout' },
  { id: 'typography', label: 'Typography', icon: '#icon-text' },
  { id: 'navigation', label: 'Navigation', icon: '#icon-nav' },
  { id: 'forms', label: 'Forms', icon: '#icon-form' },
  { id: 'media', label: 'Media', icon: '#icon-media' },
  { id: 'interactive', label: 'Interactive', icon: '#icon-interactive' },
  { id: 'landmarks', label: 'Landmarks', icon: '#icon-landmark' }
];
