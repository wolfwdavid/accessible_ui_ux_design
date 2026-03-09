/**
 * Component Registry - Central registry for all component type definitions.
 */
export class ComponentRegistry {
  constructor() {
    this._components = new Map();
  }

  register(definition) {
    this._components.set(definition.type, definition);
  }

  get(type) {
    return this._components.get(type);
  }

  getAll() {
    return Array.from(this._components.values());
  }

  getByCategory(category) {
    return this.getAll().filter(c => c.category === category);
  }

  getCategories() {
    const cats = new Set();
    for (const comp of this._components.values()) {
      cats.add(comp.category);
    }
    return Array.from(cats);
  }
}
