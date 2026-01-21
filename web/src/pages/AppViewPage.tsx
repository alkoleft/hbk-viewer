import { Box } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AppHeader } from '../components/layout/AppHeader';
import { Sidebar } from '../components/sidebar/Sidebar';
import { PageContent } from '../components/page/PageContent';
import { useAppStore } from '../store/useAppStore';
import { useAvailableLocales, useGlobalToc } from '../hooks/useGlobalData';

export function AppViewPage() {
  const { locale, section } = useParams<{ locale: string; section: string }>();
  const navigate = useNavigate();
  
  const {
    currentLocale,
    activeSection,
    setCurrentLocale,
    setActiveSection,
    setAvailableLocales,
  } = useAppStore();

  const { data: availableLocales } = useAvailableLocales();
  const { data: globalToc } = useGlobalToc(locale || 'ru', 1);

  // Update store when URL params change
  useEffect(() => {
    if (locale && locale !== currentLocale) {
      setCurrentLocale(locale);
    }
    if (section && section !== activeSection) {
      setActiveSection(section);
    }
  }, [locale, section, currentLocale, activeSection, setCurrentLocale, setActiveSection]);

  // Update available locales in store
  useEffect(() => {
    if (availableLocales) {
      setAvailableLocales(availableLocales);
    }
  }, [availableLocales, setAvailableLocales]);

  // Redirect to first section if no section specified
  useEffect(() => {
    if (globalToc && globalToc.length > 0 && !section) {
      const firstSection = globalToc[0].title;
      navigate(`/${locale}/${encodeURIComponent(firstSection)}`, { replace: true });
    }
  }, [globalToc, section, locale, navigate]);

  if (!locale) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <AppHeader />
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          mt: '112px', // Updated for two-level header (64px + 48px)
          overflow: 'hidden',
          minHeight: 0,
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        <Sidebar />
        <PageContent />
      </Box>
    </Box>
  );
}
