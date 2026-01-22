import { Box } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AppHeader } from '../components/layout/AppHeader';
import { Sidebar } from '../components/sidebar/Sidebar';
import { PageContent } from '../components/page/PageContent';
import { useAppStore } from '../store/useAppStore';
import { useGlobalToc } from '../hooks/useGlobalData';

export function AppViewPage() {
  const { locale, section } = useParams<{ locale: string; section: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { currentLocale, setCurrentLocale, setActiveSection } = useAppStore();
  const { data: globalToc } = useGlobalToc(locale || 'ru');

  // Update store when URL params change and clear cache on locale change
  useEffect(() => {
    if (locale && locale !== currentLocale) {
      // Сбрасываем кэш при смене локали
      queryClient.clear();
      setCurrentLocale(locale);
    }
    if (section) setActiveSection(decodeURIComponent(section));
  }, [locale, section, currentLocale, setCurrentLocale, setActiveSection, queryClient]);

  // Redirect to first section if no section specified
  useEffect(() => {
    if (globalToc && globalToc.length > 0 && !section) {
      navigate(`/${locale}/${encodeURIComponent(globalToc[0].title)}`, { replace: true });
    }
  }, [globalToc, section, locale, navigate]);

  if (!locale) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
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
