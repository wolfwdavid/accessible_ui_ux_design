/**
 * Mobile Preview - Responsive device preview with viewport simulation.
 */
export const DEVICES = {
  desktop: { label: 'Desktop', width: 1440, height: 900, icon: '🖥' },
  laptop: { label: 'Laptop', width: 1024, height: 768, icon: '💻' },
  tablet: { label: 'iPad', width: 768, height: 1024, icon: '📱' },
  mobile: { label: 'iPhone', width: 375, height: 812, icon: '📱' },
  mobileSm: { label: 'iPhone SE', width: 320, height: 568, icon: '📱' },
  android: { label: 'Pixel', width: 360, height: 800, icon: '📱' }
};

export class MobilePreview {
  constructor(state, eventBus) {
    this._state = state;
    this._bus = eventBus;
    this._container = null;
  }

  mount(containerEl) {
    this._container = containerEl;
    this._render();
  }

  _render() {
    if (!this._container) return;
    this._container.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'panel-section-header';
    header.innerHTML = '<h3>Device Preview</h3>';
    this._container.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'device-grid';
    grid.setAttribute('role', 'radiogroup');
    grid.setAttribute('aria-label', 'Select device viewport');

    const currentDevice = this._state.viewport?.device || this._state._state?.viewport?.device || 'desktop';

    for (const [key, device] of Object.entries(DEVICES)) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `device-btn ${key === currentDevice ? 'device-btn-active' : ''}`;
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', key === currentDevice ? 'true' : 'false');
      btn.setAttribute('aria-label', `${device.label} (${device.width}×${device.height})`);
      btn.innerHTML = `
        <span class="device-icon" aria-hidden="true">${device.icon}</span>
        <span class="device-label">${device.label}</span>
        <span class="device-size">${device.width}×${device.height}</span>
      `;

      btn.addEventListener('click', () => {
        this._state.viewport = { device: key, width: device.width, height: device.height };
        this._render();
        this._bus.emit('viewport:changed', { device: key, ...device });
      });

      grid.appendChild(btn);
    }

    this._container.appendChild(grid);

    const info = document.createElement('div');
    info.className = 'mobile-info';
    info.innerHTML = `
      <h4>Mobile Accessibility Checks</h4>
      <ul class="mobile-check-list">
        <li>Touch target sizes (min 44×44px for AAA, 24×24px for AA)</li>
        <li>Text size readability (minimum 16px recommended)</li>
        <li>Tap spacing between interactive elements</li>
        <li>Orientation support (portrait & landscape)</li>
        <li>Pinch-to-zoom not disabled</li>
      </ul>
    `;
    this._container.appendChild(info);
  }
}
