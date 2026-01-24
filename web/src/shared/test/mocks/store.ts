import { create } from 'zustand';

export const createMockStore = (initialState = {}) =>
  create(() => ({
    expandedNodes: new Set<string>(),
    toggleNode: () => {},
    expandNode: () => {},
    collapseNode: () => {},
    ...initialState,
  }));
