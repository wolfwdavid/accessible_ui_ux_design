/**
 * Tab Manager - Right sidebar tab switching with keyboard support.
 */
export class TabManager {
  constructor(state, eventBus) {
    this._state = state;
    this._bus = eventBus;
    this._container = null;
    this._tabs = [];
    this._panels = [];
    this._activeIndex = 0;
  }

  mount(containerEl, tabConfigs) {
    this._container = containerEl;
    this._tabConfigs = tabConfigs;
    this._render();
  }

  _render() {
    this._container.innerHTML = '';

    const tablist = document.createElement('div');
    tablist.setAttribute('role', 'tablist');
    tablist.setAttribute('aria-label', 'Inspector panels');
    tablist.className = 'panel-tablist';

    const panelContainer = document.createElement('div');
    panelContainer.className = 'panel-content-area';

    this._tabs = [];
    this._panels = [];

    this._tabConfigs.forEach((config, i) => {
      const tab = document.createElement('button');
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', i === this._activeIndex ? 'true' : 'false');
      tab.setAttribute('aria-controls', `panel-${config.id}`);
      tab.id = `tab-${config.id}`;
      tab.className = `panel-tab ${i === this._activeIndex ? 'panel-tab-active' : ''}`;
      tab.textContent = config.label;
      tab.setAttribute('tabindex', i === this._activeIndex ? '0' : '-1');

      tab.addEventListener('click', () => this._activateTab(i));
      tab.addEventListener('keydown', (e) => this._handleTabKeydown(e, i));

      tablist.appendChild(tab);
      this._tabs.push(tab);

      const panel = document.createElement('div');
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', `tab-${config.id}`);
      panel.id = `panel-${config.id}`;
      panel.className = 'panel-tabpanel';
      panel.hidden = i !== this._activeIndex;
      panel.setAttribute('tabindex', '0');

      panelContainer.appendChild(panel);
      this._panels.push(panel);

      if (i === this._activeIndex && config.mount) {
        config.mount(panel);
      }
    });

    this._container.appendChild(tablist);
    this._container.appendChild(panelContainer);
  }

  _activateTab(index) {
    this._tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', i === index ? 'true' : 'false');
      tab.classList.toggle('panel-tab-active', i === index);
      tab.setAttribute('tabindex', i === index ? '0' : '-1');
    });

    this._panels.forEach((panel, i) => {
      panel.hidden = i !== index;
    });

    this._activeIndex = index;

    const config = this._tabConfigs[index];
    if (config.mount) {
      config.mount(this._panels[index]);
    }

    this._tabs[index].focus();
    this._state.activePanel = config.id;
  }

  _handleTabKeydown(e, currentIndex) {
    let newIndex;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      newIndex = (currentIndex + 1) % this._tabs.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      newIndex = (currentIndex - 1 + this._tabs.length) % this._tabs.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      newIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      newIndex = this._tabs.length - 1;
    }

    if (newIndex !== undefined) {
      this._activateTab(newIndex);
    }
  }

  getPanel(id) {
    const idx = this._tabConfigs.findIndex(c => c.id === id);
    return idx >= 0 ? this._panels[idx] : null;
  }
}
