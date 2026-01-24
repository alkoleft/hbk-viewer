import { create } from 'zustand';

export const createMockStore = (initialState = {}) =>
  create(() => ({
    expandedNodes: new Set<string>(),
    toggleNode: (nodeId: string) => {},
    expandNode: (nodeId: string) => {},
    collapseNode: (nodeId: string) => {},
    ...initialState,
  }));
