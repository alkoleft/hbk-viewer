import { useParams } from 'react-router-dom';
import { useGlobalToc, useGlobalTocSection } from './useGlobalData';
import { useMemo } from 'react';

export function useSectionNavigation() {
  const { locale, section } = useParams<{ locale: string; section: string }>();
  const { data: globalToc } = useGlobalToc(locale || 'ru', 1);

  const currentSection = useMemo(() => {
    if (!globalToc || !section) return null;
    const decodedSection = decodeURIComponent(section);
    return globalToc.find(page => page.title === decodedSection);
  }, [globalToc, section]);

  const { data: sectionPages = [], isLoading, error } = useGlobalTocSection(
    locale || 'ru', 
    currentSection?.pagePath || '',
    1
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
