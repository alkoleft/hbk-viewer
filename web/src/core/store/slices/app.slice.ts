export interface AppSlice {
  sidebarWidth: number;
  currentLocale: string;
  activeSection: string;
  isMobileDrawerOpen: boolean;
  setSidebarWidth: (width: number) => void;
  setCurrentLocale: (locale: string) => void;
  setActiveSection: (section: string) => void;
  toggleMobileDrawer: () => void;
}

const STORAGE_KEYS = {
  SIDEBAR_WIDTH: 'sidebarWidth',
  LOCALE: 'selectedLocale',
} as const;

const DEFAULT_SIDEBAR_WIDTH = 320;

const getInitialSidebarWidth = (): number => {
  if (typeof window === 'undefined') return DEFAULT_SIDEBAR_WIDTH;
  const saved = localStorage.getItem(STORAGE_KEYS.SIDEBAR_WIDTH);
  return saved ? parseInt(saved, 10) : DEFAULT_SIDEBAR_WIDTH;
};

const getInitialLocale = (): string => {
  if (typeof window === 'undefined') return 'ru';
  return localStorage.getItem(STORAGE_KEYS.LOCALE) || 'ru';
};

export const createAppSlice = (set: any): AppSlice => ({
  sidebarWidth: getInitialSidebarWidth(),
  currentLocale: getInitialLocale(),
  activeSection: '',
  isMobileDrawerOpen: false,
  
  setSidebarWidth: (width) => {
    set({ sidebarWidth: width });
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SIDEBAR_WIDTH, width.toString());
    }
  },
  
  setCurrentLocale: (locale) => {
    set({ currentLocale: locale });
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.LOCALE, locale);
    }
  },
  
  setActiveSection: (section) => {
    set({ activeSection: section });
  },
  
  toggleMobileDrawer: () => {
    set((state: AppSlice) => ({ isMobileDrawerOpen: !state.isMobileDrawerOpen }));
  },
});
