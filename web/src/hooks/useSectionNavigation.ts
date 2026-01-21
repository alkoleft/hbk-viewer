import { useParams } from 'react-router-dom';
import { useGlobalToc } from './useGlobalData';
import { useSectionContent } from './useSectionContent';
import { useMemo } from 'react';

export function useSectionNavigation() {
  const { locale, section } = useParams<{ locale: string; section: string }>();
  const { data: globalToc } = useGlobalToc(locale || 'ru', 1);

  const currentSectionIndex = useMemo(() => {
    if (!globalToc || !section) return -1;
    
    const decodedSection = decodeURIComponent(section);
    return globalToc.findIndex(
      page => page.title === decodedSection
    );
  }, [globalToc, section]);

  const currentSection = useMemo(() => {
    if (!globalToc || currentSectionIndex < 0) return null;
    return globalToc[currentSectionIndex];
  }, [globalToc, currentSectionIndex]);

  const { data: sectionPages = [], isLoading, error } = useSectionContent(
    locale || 'ru', 
    currentSection?.pagePath || ''
  );

  return {
    locale: locale || 'ru',
    section: section ? decodeURIComponent(section) : '',
    currentSection,
    sectionPages,
    globalToc,
    isLoading,
    error,
  };
}
