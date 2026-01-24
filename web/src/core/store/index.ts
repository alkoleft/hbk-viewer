import { create } from 'zustand';
import { createAppSlice, type AppSlice } from './slices/app.slice';
import { createNavigationSlice, type NavigationSlice } from './slices/navigation.slice';

export type RootStore = AppSlice & NavigationSlice;

export const useStore = create<RootStore>((set) => ({
  ...createAppSlice(set),
  ...createNavigationSlice(set),
}));

// Селекторы для оптимизации ре-рендеров
export const selectSidebarWidth = (state: RootStore) => state.sidebarWidth;
export const selectCurrentLocale = (state: RootStore) => state.currentLocale;
export const selectActiveSection = (state: RootStore) => state.activeSection;
export const selectExpandedNodes = (state: RootStore) => state.expandedNodes;
export const selectIsNodeExpanded = (nodeId: string) => (state: RootStore) => 
  state.expandedNodes.has(nodeId);
