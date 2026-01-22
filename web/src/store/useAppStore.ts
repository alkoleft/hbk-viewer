import { create } from 'zustand';
import { STORAGE } from '../constants/config';

export interface AppState {
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
  
  currentLocale: string;
  activeSection: string;
  setCurrentLocale: (locale: string) => void;
  setActiveSection: (section: string) => void;
}

const getInitialSidebarWidth = (): number => {
  if (typeof window === 'undefined') return STORAGE.DEFAULT_SIDEBAR_WIDTH;
  const savedWidth = localStorage.getItem(STORAGE.SIDEBAR_WIDTH_KEY);
  return savedWidth ? parseInt(savedWidth, 10) : STORAGE.DEFAULT_SIDEBAR_WIDTH;
};

const getInitialLocale = (): string => {
  if (typeof window === 'undefined') return 'ru';
  return localStorage.getItem('selectedLocale') || 'ru';
};

export const useAppStore = create<AppState>((set) => ({
  sidebarWidth: getInitialSidebarWidth(),
  setSidebarWidth: (width: number) => {
    set({ sidebarWidth: width });
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE.SIDEBAR_WIDTH_KEY, width.toString());
    }
  },
  
  currentLocale: getInitialLocale(),
  activeSection: '',
  setCurrentLocale: (locale: string) => {
    set({ currentLocale: locale });
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedLocale', locale);
    }
  },
  setActiveSection: (section: string) => {
    set({ activeSection: section });
  },
}));
