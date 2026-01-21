import { create } from 'zustand';
import { STORAGE } from '../constants/config';

export interface AppState {
  // UI состояние
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
  
  // Локализация и разделы
  currentLocale: string;
  activeSection: string;
  availableLocales: string[];
  setCurrentLocale: (locale: string) => void;
  setActiveSection: (section: string) => void;
  setAvailableLocales: (locales: string[]) => void;
}

// Загружаем сохраненную ширину из localStorage
const getInitialSidebarWidth = (): number => {
  if (typeof window === 'undefined') {
    return STORAGE.DEFAULT_SIDEBAR_WIDTH;
  }
  const savedWidth = localStorage.getItem(STORAGE.SIDEBAR_WIDTH_KEY);
  return savedWidth ? parseInt(savedWidth, 10) : STORAGE.DEFAULT_SIDEBAR_WIDTH;
};

// Загружаем сохраненную локаль из localStorage
const getInitialLocale = (): string => {
  if (typeof window === 'undefined') {
    return 'ru';
  }
  const savedLocale = localStorage.getItem('selectedLocale');
  return savedLocale || 'ru';
};

export const useAppStore = create<AppState>((set) => ({
  // UI состояние
  sidebarWidth: getInitialSidebarWidth(),
  setSidebarWidth: (width: number) => {
    set({ sidebarWidth: width });
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE.SIDEBAR_WIDTH_KEY, width.toString());
    }
  },
  
  // Локализация и разделы
  currentLocale: getInitialLocale(),
  activeSection: '',
  availableLocales: [],
  setCurrentLocale: (locale: string) => {
    set({ currentLocale: locale });
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedLocale', locale);
    }
  },
  setActiveSection: (section: string) => {
    set({ activeSection: section });
  },
  setAvailableLocales: (locales: string[]) => {
    set({ availableLocales: locales });
  },
}));
