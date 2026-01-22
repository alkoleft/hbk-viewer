import { useGlobalTocSection } from './useGlobalData';

export function useSectionContent(locale: string, sectionPath: string) {
  return useGlobalTocSection(locale, sectionPath, 1);
}
