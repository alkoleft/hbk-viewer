import { Tabs, Tab, Box } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useGlobalToc } from '../../hooks/useGlobalData';
import { useAppStore } from '../../store/useAppStore';

export function SectionTabs() {
  const { locale, section } = useParams<{ locale: string; section: string }>();
  const navigate = useNavigate();
  const { data: globalToc } = useGlobalToc(locale || 'ru', 1);
  const { setActiveSection } = useAppStore();

  if (!globalToc || !globalToc.length) {
    return null;
  }

  const handleSectionChange = (_: React.SyntheticEvent, newSection: string) => {
    setActiveSection(newSection);
    navigate(`/${locale}/${encodeURIComponent(newSection)}`);
  };

  const currentSectionIndex = globalToc.findIndex(
    page => page.title === decodeURIComponent(section || '')
  );

  return (
    <Tabs
      value={currentSectionIndex >= 0 ? currentSectionIndex : 0}
      onChange={(e, newValue) => {
        const selectedPage = globalToc[newValue];
        const sectionName = selectedPage.title;
        handleSectionChange(e, sectionName);
      }}
      variant="scrollable"
      scrollButtons="auto"
      sx={{ 
        minHeight: 48,
        flex: 1,
        '& .MuiTab-root': {
          textTransform: 'none',
          fontWeight: 500,
        },
        '& .Mui-selected': {
          color: 'primary.main',
          fontWeight: 600,
        }
      }}
    >
      {globalToc.map((page, index) => (
        <Tab
          key={index}
          label={page.title}
          sx={{ minHeight: 48 }}
        />
      ))}
    </Tabs>
  );
}
