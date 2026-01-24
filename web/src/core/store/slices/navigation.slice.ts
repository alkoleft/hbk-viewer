export interface NavigationSlice {
  expandedNodes: Set<string>;
  toggleNode: (nodeId: string) => void;
  expandNode: (nodeId: string) => void;
  collapseNode: (nodeId: string) => void;
  clearExpansion: () => void;
  setExpandedNodes: (nodes: Set<string>) => void;
}

export const createNavigationSlice = (set: any): NavigationSlice => ({
  expandedNodes: new Set<string>(),
  
  toggleNode: (nodeId) => {
    set((state: NavigationSlice) => {
      const newSet = new Set(state.expandedNodes);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return { expandedNodes: newSet };
    });
  },
  
  expandNode: (nodeId) => {
    set((state: NavigationSlice) => {
      const newSet = new Set(state.expandedNodes);
      newSet.add(nodeId);
      return { expandedNodes: newSet };
    });
  },
  
  collapseNode: (nodeId) => {
    set((state: NavigationSlice) => {
      const newSet = new Set(state.expandedNodes);
      newSet.delete(nodeId);
      return { expandedNodes: newSet };
    });
  },
  
  clearExpansion: () => {
    set({ expandedNodes: new Set<string>() });
  },
  
  setExpandedNodes: (nodes) => {
    set({ expandedNodes: new Set(nodes) });
  },
});
