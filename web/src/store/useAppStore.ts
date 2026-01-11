import { create } from 'zustand';
import type { BookInfo } from '../types/api';
import { STORAGE } from '../constants/config';

export interface AppState {
  // UI состояние
  sidebarWidth: number;
  isBookSelectorOpen: boolean;
  isFileSelectorOpen: boolean;
  setSidebarWidth: (width: number) => void;
  setIsBookSelectorOpen: (isOpen: boolean) => void;
  setIsFileSelectorOpen: (isOpen: boolean) => void;
  
  // Выбранная книга (для удобства, основное состояние в React Query)
  selectedBook: BookInfo | null;
  setSelectedBook: (book: BookInfo | null) => void;
}

// Загружаем сохраненную ширину из localStorage
const getInitialSidebarWidth = (): number => {
  if (typeof window === 'undefined') {
    return STORAGE.DEFAULT_SIDEBAR_WIDTH;
  }
  const savedWidth = localStorage.getItem(STORAGE.SIDEBAR_WIDTH_KEY);
  return savedWidth ? parseInt(savedWidth, 10) : STORAGE.DEFAULT_SIDEBAR_WIDTH;
};

export const useAppStore = create<AppState>((set) => ({
  // UI состояние
  sidebarWidth: getInitialSidebarWidth(),
  isBookSelectorOpen: false,
  isFileSelectorOpen: false,
  setSidebarWidth: (width: number) => {
    set({ sidebarWidth: width });
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE.SIDEBAR_WIDTH_KEY, width.toString());
    }
  },
  setIsBookSelectorOpen: (isOpen: boolean) => {
    set({ isBookSelectorOpen: isOpen });
  },
  setIsFileSelectorOpen: (isOpen: boolean) => {
    set({ isFileSelectorOpen: isOpen });
  },
  
  // Выбранная книга
  selectedBook: null,
  setSelectedBook: (book: BookInfo | null) => {
    set({ selectedBook: book });
  },
}));
