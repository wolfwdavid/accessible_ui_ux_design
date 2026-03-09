/**
 * HistoryManager - Undo/redo stack using structured clone snapshots.
 */
import { DEFAULT_CONFIG } from './constants.js';

export class HistoryManager {
  constructor(state, eventBus) {
    this._state = state;
    this._bus = eventBus;
    this._undoStack = [];
    this._redoStack = [];
    this._maxSteps = DEFAULT_CONFIG.maxUndoSteps;
    this._isRestoring = false;

    this._bus.on('document:changed', () => {
      if (this._isRestoring) return;
      this.push();
    });

    this.push();
  }

  push() {
    const snapshot = this._state.getSnapshot();
    this._undoStack.push(snapshot);
    if (this._undoStack.length > this._maxSteps) {
      this._undoStack.shift();
    }
    this._redoStack = [];
    this._bus.emit('history:changed', this.status());
  }

  undo() {
    if (this._undoStack.length <= 1) return false;
    const current = this._undoStack.pop();
    this._redoStack.push(current);
    const previous = this._undoStack[this._undoStack.length - 1];
    this._isRestoring = true;
    this._state.restoreSnapshot(structuredClone(previous));
    this._isRestoring = false;
    this._bus.emit('history:changed', this.status());
    return true;
  }

  redo() {
    if (this._redoStack.length === 0) return false;
    const next = this._redoStack.pop();
    this._undoStack.push(next);
    this._isRestoring = true;
    this._state.restoreSnapshot(structuredClone(next));
    this._isRestoring = false;
    this._bus.emit('history:changed', this.status());
    return true;
  }

  status() {
    return {
      canUndo: this._undoStack.length > 1,
      canRedo: this._redoStack.length > 0,
      undoCount: this._undoStack.length - 1,
      redoCount: this._redoStack.length
    };
  }
}
