import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useResolveV8HelpLink, usePageContentByPath, useResolvePageLocation } from '@shared/api';
import { useTreeNavigation } from '@features/navigation/hooks';

export function useContentNavigation(locale: string, section: string, sectionPages: any[]) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { expandPath } = useTreeNavigation();
  
  const [selectedPagePath, setSelectedPagePath] = useState(searchParams.get('page') || '');
  const [v8helpLink, setV8helpLink] = useState<string>('');
  const [pageLocationToResolve, setPageLocationToResolve] = useState<string>('');
  const [pendingResolveResult, setPendingResolveResult] = useState<any>(null);
  const [processedContent, setProcessedContent] = useState<string>('');
  const initialLoadRef = useRef(true);
  const expandingRef = useRef(false);
  
  const { data: pageContent, isFetching, error } = usePageContentByPath(
    selectedPagePath,
    locale,
    !!selectedPagePath
  );
  
  const { data: v8helpResult } = useResolveV8HelpLink(v8helpLink, locale, !!v8helpLink);
  const { data: pageResult } = useResolvePageLocation(pageLocationToResolve, locale, !!pageLocationToResolve);
  
  useEffect(() => {
    if (pageContent) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(pageContent, 'text/html');
      const images = doc.querySelectorAll('img[src^="v8help://"]');
      
      images.forEach((img) => {
        const v8helpSrc = img.getAttribute('src');
        if (v8helpSrc) {
          const path = v8helpSrc.replace('v8help://', '');
          img.setAttribute('src', `/api/v8help/content/${path}`);
        }
      });
      
      setProcessedContent(images.length > 0 ? doc.body.innerHTML : pageContent);
    }
  }, [pageContent]);
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setSelectedPagePath(params.get('page') || '');
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  
  useEffect(() => {
    const page = searchParams.get('page') || '';
    setSelectedPagePath(page);
    if (page && initialLoadRef.current) {
      setPageLocationToResolve(page);
      initialLoadRef.current = false;
    }
  }, [searchParams]);
  
  useEffect(() => {
    if (selectedPagePath && sectionPages.length > 0) {
      const findPageTitle = (pages: any[], path: string): string | null => {
        for (const page of pages) {
          if (page.pagePath === path) return page.title;
          if (page.children) {
            const found = findPageTitle(page.children, path);
            if (found) return found;
          }
        }
        return null;
      };
      
      const title = findPageTitle(sectionPages, selectedPagePath);
      if (title) document.title = `${title} - 1C:Help Book`;
    }
  }, [selectedPagePath, sectionPages]);
  
  useEffect(() => {
    if (v8helpResult) {
      navigate(`/${locale}/${encodeURIComponent(v8helpResult.sectionTitle)}?page=${encodeURIComponent(v8helpResult.pageLocation)}`);
      setPendingResolveResult(v8helpResult);
      setV8helpLink('');
    }
  }, [v8helpResult, locale, navigate]);
  
  useEffect(() => {
    if (pageResult) {
      const needsNavigation = decodeURIComponent(section) !== pageResult.sectionTitle;
      if (needsNavigation) {
        navigate(`/${locale}/${encodeURIComponent(pageResult.sectionTitle)}?page=${encodeURIComponent(pageResult.pageLocation)}`);
      } else {
        // Обновляем только параметр page, оставаясь в том же разделе
        navigate(`?page=${encodeURIComponent(pageResult.pageLocation)}`, { replace: true });
      }
      setPendingResolveResult(pageResult);
      setPageLocationToResolve('');
    }
  }, [pageResult, locale, section, navigate]);
  
  useEffect(() => {
    if (pendingResolveResult && section && sectionPages.length > 0 && !expandingRef.current) {
      expandingRef.current = true;
      expandPath(sectionPages, pendingResolveResult.pagePath, locale, () => {
        setPendingResolveResult(null);
        expandingRef.current = false;
      });
    }
  }, [pendingResolveResult, section, sectionPages, expandPath, locale]);
  
  const handleLinkClick = useCallback((event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const link = target.closest('a');
    
    if (link && link.href) {
      const originalHref = link.getAttribute('href') || '';
      
      if (originalHref.startsWith('v8help:')) {
        event.preventDefault();
        setV8helpLink(originalHref);
        return;
      }
      
      if (originalHref.endsWith('.html')) {
        event.preventDefault();
        
        let pagePath: string;
        if (originalHref.startsWith('/')) {
          pagePath = originalHref.substring(1);
        } else {
          const lastSlash = selectedPagePath.lastIndexOf('/');
          const currentDir = lastSlash >= 0 ? selectedPagePath.substring(0, lastSlash + 1) : '';
          pagePath = currentDir + originalHref;
        }
        
        setPageLocationToResolve(pagePath);
      }
    }
  }, [selectedPagePath]);
  
  return {
    selectedPagePath,
    pageContent: processedContent,
    isLoading: isFetching,
    error,
    handleLinkClick,
  };
}
