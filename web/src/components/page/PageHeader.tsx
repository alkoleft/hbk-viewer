import { Box } from '@mui/material';
import type { FileStructure } from '../../types/api';
import { Breadcrumbs } from '../navigation/Breadcrumbs';

interface PageHeaderProps {
  structure: FileStructure | null;
  pageName?: string;
  filename: string;
  onPageSelect: (htmlPath: string) => void;
}

export function PageHeader({
  structure,
  pageName,
  filename,
  onPageSelect,
}: PageHeaderProps) {
  return (
    <Box
      sx={{
        flexShrink: 0,
        p: 3,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      {structure && pageName && (
        <Breadcrumbs
          pages={structure.pages}
          currentPageName={pageName}
          onPageSelect={onPageSelect}
          filename={filename}
        />
      )}
    </Box>
  );
}
