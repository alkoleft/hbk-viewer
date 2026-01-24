import { Tabs, Tab } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useGlobalToc } from '@shared/api';
import { useStore } from '@core/store';
import type { PageDto } from '@shared/types';

export function SectionTabs() {
  const { locale, section } = useParams<{ locale: string; section: string }>();
  const navigate = useNavigate();
  const { data: globalToc } = useGlobalToc(locale || 'ru');
  const setActiveSection = useStore((state) => state.setActiveSection);

  if (!globalToc || !globalToc.length) {
    return null;
  }

  const handleSectionChange = (_: React.SyntheticEvent, newSection: string) => {
    setActiveSection(newSection);
    const selectedSection = globalToc.find((page: PageDto) => page.title === newSection);
    const pageParam = selectedSection?.pagePath ? `?page=${encodeURIComponent(selectedSection.pagePath)}` : '';
    navigate(`/${locale}/${encodeURIComponent(newSection)}${pageParam}`);
  };

  const currentSectionIndex = globalToc.findIndex(
    (page: PageDto) => page.title === decodeURIComponent(section || '')
  );

  return (
    <Tabs
      value={currentSectionIndex >= 0 ? currentSectionIndex : 0}
      onChange={(e, newValue) => {
        const selectedPage = globalToc[newValue];
        handleSectionChange(e, selectedPage.title);
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
      {globalToc.map((page: PageDto, index: number) => (
        <Tab
          key={index}
          label={page.title}
          sx={{ minHeight: 48 }}
        />
      ))}
    </Tabs>
  );
}
