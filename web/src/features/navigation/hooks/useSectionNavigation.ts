import { useParams } from 'react-router-dom';
import { useGlobalToc, useGlobalTocSection } from '@shared/api';
import { useMemo } from 'react';

export function useSectionNavigation() {
  const { locale, section } = useParams<{ locale: string; section: string }>();
  const { data: globalToc } = useGlobalToc(locale || 'ru');

  const currentSection = useMemo(() => {
    if (!globalToc || !section) return null;
    const decodedSection = decodeURIComponent(section);
    return globalToc.find(page => page.title === decodedSection);
  }, [globalToc, section]);

  const { data: sectionPages = [], isLoading, error } = useGlobalTocSection(
    locale || 'ru', 
    currentSection?.pagePath || '',
    undefined,
    !!currentSection
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
