/**
 * Toast - Accessible non-modal notification system.
 */
export class Toast {
  constructor() {
    this._container = null;
    this._init();
  }

  _init() {
    this._container = document.createElement('div');
    this._container.className = 'toast-container';
    this._container.setAttribute('role', 'status');
    this._container.setAttribute('aria-live', 'polite');
    this._container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(this._container);
  }

  show(message, type = 'info', duration = 4000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icon = document.createElement('span');
    icon.className = 'toast-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '!' : 'i';

    const text = document.createElement('span');
    text.className = 'toast-message';
    text.textContent = message;

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'toast-close';
    close.setAttribute('aria-label', 'Dismiss notification');
    close.textContent = '×';
    close.addEventListener('click', () => this._dismiss(toast));

    toast.appendChild(icon);
    toast.appendChild(text);
    toast.appendChild(close);
    this._container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('toast-visible'));

    if (duration > 0) {
      setTimeout(() => this._dismiss(toast), duration);
    }

    return toast;
  }

  _dismiss(toast) {
    toast.classList.remove('toast-visible');
    toast.classList.add('toast-hiding');
    setTimeout(() => toast.remove(), 300);
  }

  success(message, duration) { return this.show(message, 'success', duration); }
  error(message, duration) { return this.show(message, 'error', duration); }
  warning(message, duration) { return this.show(message, 'warning', duration); }
  info(message, duration) { return this.show(message, 'info', duration); }
}
