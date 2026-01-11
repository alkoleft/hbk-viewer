/**
 * Константы конфигурации приложения
 */

export const UI = {
  SEARCH_DEBOUNCE_MS: 400,
  LOADING_INDICATOR_DELAY_MS: 200,
  TRANSITION_DURATION_MS: 150,
} as const;

export const API = {
  BASE_URL: '/api/hbk',
} as const;

export const STORAGE = {
  SIDEBAR_WIDTH_KEY: 'sidebar-width',
  DEFAULT_SIDEBAR_WIDTH: 320,
} as const;
