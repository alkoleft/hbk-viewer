import { Box, LinearProgress } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AppHeader } from '../components/layout/AppHeader';
import { Sidebar } from '../components/sidebar/Sidebar';
import { PageContent } from '../components/page/PageContent';
import { useStore } from '@core/store';
import { useGlobalToc } from '@shared/api';
import { useSectionNavigation } from '@features/navigation/hooks';
import { useContentNavigation } from '@features/content/hooks';

export function AppViewPage() {
  const { locale, section } = useParams<{ locale: string; section: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const currentLocale = useStore((state) => state.currentLocale);
  const setCurrentLocale = useStore((state) => state.setCurrentLocale);
  const setActiveSection = useStore((state) => state.setActiveSection);
  
  const { data: globalToc } = useGlobalToc(locale || 'ru');
  const { sectionPages } = useSectionNavigation();
  const { isLoading } = useContentNavigation(locale || 'ru', section || '', sectionPages);

  useEffect(() => {
    if (locale && locale !== currentLocale) {
      queryClient.clear();
      setCurrentLocale(locale);
    }
    if (section) setActiveSection(decodeURIComponent(section));
  }, [locale, section, currentLocale, setCurrentLocale, setActiveSection, queryClient]);

  useEffect(() => {
    if (globalToc && globalToc.length > 0 && !section) {
      const firstSection = globalToc[0];
      navigate(`/${locale}/${encodeURIComponent(firstSection.title)}?page=${encodeURIComponent(firstSection.pagePath)}`, { replace: true });
    }
  }, [globalToc, section, locale, navigate]);

  if (!locale) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {isLoading && (
        <LinearProgress 
          color="secondary"
          sx={{ 
            position: 'fixed', 
            top: 0,
            left: 0, 
            right: 0,
            zIndex: 10000,
            height: 4
          }} 
        />
      )}
      <AppHeader />
      <Box sx={{ 
        display: 'flex', 
        flex: 1, 
        mt: '112px',
        overflow: 'hidden',
        minHeight: 0,
        flexDirection: { xs: 'column', md: 'row' }
      }}>
        <Sidebar />
        <PageContent />
      </Box>
    </Box>
  );
}

export default AppViewPage;
