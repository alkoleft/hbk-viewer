import { useRef, useEffect } from 'react';
import { Box, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { BookInfo } from '../../types/api';
import { convertV8HelpLinkToUrl } from '../../utils/v8helpUtils';

interface PageViewerProps {
  content: string;
  isTransitioning: boolean;
  books: BookInfo[];
  currentLocale: string;
}

export function PageViewer({
  content,
  isTransitioning,
  books,
  currentLocale,
}: PageViewerProps) {
  const navigate = useNavigate();
  const contentContainerRef = useRef<HTMLElement | null>(null);
  const cleanupClickHandlerRef = useRef<(() => void) | null>(null);

  // Обработчик кликов по ссылкам v8help://
  useEffect(() => {
    if (!content) {
      if (cleanupClickHandlerRef.current) {
        cleanupClickHandlerRef.current();
        cleanupClickHandlerRef.current = null;
      }
      return;
    }
    
    if (cleanupClickHandlerRef.current) {
      cleanupClickHandlerRef.current();
      cleanupClickHandlerRef.current = null;
    }
    
    const handleClick = (event: MouseEvent) => {
      const container = contentContainerRef.current;
      if (!container) {
        return;
      }
      
      const target = event.target as HTMLElement;
      if (!container.contains(target)) {
        return;
      }
      
      const link = target.closest('a');
      if (!link) {
        return;
      }
      
      const href = link.getAttribute('href');
      if (!href) {
        return;
      }
      
      if (href.startsWith('v8help://')) {
        event.preventDefault();
        event.stopPropagation();
        
        const url = convertV8HelpLinkToUrl(href, books, currentLocale);
        if (url) {
          navigate(url);
        } else {
          console.warn('Не удалось найти книгу для ссылки:', href);
        }
      }
    };
    
    const rafId = requestAnimationFrame(() => {
      const container = contentContainerRef.current;
      if (!container) {
        return;
      }
      
      container.addEventListener('click', handleClick, true);
      
      cleanupClickHandlerRef.current = () => {
        container.removeEventListener('click', handleClick, true);
      };
    });
    
    return () => {
      cancelAnimationFrame(rafId);
      if (cleanupClickHandlerRef.current) {
        cleanupClickHandlerRef.current();
        cleanupClickHandlerRef.current = null;
      }
    };
  }, [content, books, currentLocale, navigate]);

  return (
    <Paper
      elevation={0}
      sx={{
        m: 3,
        p: 3,
        maxWidth: 1200,
        mx: 'auto',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        ref={contentContainerRef}
        sx={{
          '& h1, & h2, & h3, & h4, & h5, & h6': {
            mt: 3,
            mb: 2,
            color: 'text.primary',
          },
          '& h1': { fontSize: '1.8rem' },
          '& h2': { fontSize: '1.5rem' },
          '& h3': { fontSize: '1.3rem' },
          '& p': {
            mb: 2,
            lineHeight: 1.6,
          },
          '& ul, & ol': {
            ml: 4,
            mb: 2,
          },
          '& li': {
            mb: 1,
          },
          '& code': {
            bgcolor: 'action.hover',
            px: 0.5,
            py: 0.25,
            borderRadius: 0.5,
            fontSize: '0.9em',
            color: 'error.main',
          },
          '& pre': {
            bgcolor: 'action.hover',
            p: 2,
            borderRadius: 1,
            overflowX: 'auto',
            mb: 2,
            '& code': {
              bgcolor: 'transparent',
              color: 'text.primary',
            },
          },
          '& table': {
            width: '100%',
            borderCollapse: 'collapse',
            mb: 2,
            '& th, & td': {
              border: 1,
              borderColor: 'divider',
              p: 1,
              textAlign: 'left',
            },
            '& th': {
              bgcolor: 'action.hover',
              fontWeight: 600,
            },
          },
          '& a': {
            color: 'primary.main',
            textDecoration: 'none',
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline',
            },
          },
          '& img': {
            maxWidth: '100%',
            height: 'auto',
            borderRadius: 1,
            my: 2,
          },
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </Paper>
  );
}
