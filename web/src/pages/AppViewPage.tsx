import { Box } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AppHeader } from '../components/layout/AppHeader';
import { Sidebar } from '../components/sidebar/Sidebar';
import { PageContent } from '../components/page/PageContent';
import { useAppStore } from '../store/useAppStore';
import { useGlobalToc } from '../hooks/useGlobalData';

export function AppViewPage() {
  const { locale, section } = useParams<{ locale: string; section: string }>();
  const navigate = useNavigate();
  
  const { setCurrentLocale, setActiveSection } = useAppStore();
  const { data: globalToc } = useGlobalToc(locale || 'ru', 1);

  // Update store when URL params change
  useEffect(() => {
    if (locale) setCurrentLocale(locale);
    if (section) setActiveSection(decodeURIComponent(section));
  }, [locale, section, setCurrentLocale, setActiveSection]);

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
