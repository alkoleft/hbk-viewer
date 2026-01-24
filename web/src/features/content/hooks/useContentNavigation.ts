import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useResolveV8HelpLink, usePageContentByPath } from '@shared/api';
import { useTreeNavigation } from '@features/navigation/hooks';

export function useContentNavigation(locale: string, section: string, sectionPages: any[]) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { expandPath } = useTreeNavigation();
  
  const [selectedPagePath, setSelectedPagePath] = useState(searchParams.get('page') || '');
  const [v8helpLink, setV8helpLink] = useState<string>('');
  const [pendingV8helpResult, setPendingV8helpResult] = useState<any>(null);
  const [processedContent, setProcessedContent] = useState<string>('');
  const processedRef = useRef(false);
  
  const { data: pageContent, isLoading, error } = usePageContentByPath(
    selectedPagePath,
    locale,
    !!selectedPagePath
  );
  
  const { data: v8helpResult } = useResolveV8HelpLink(v8helpLink, locale, !!v8helpLink);
  
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
    setSelectedPagePath(searchParams.get('page') || '');
  }, [searchParams]);
  
  useEffect(() => {
    if (v8helpResult) {
      navigate(`/${locale}/${encodeURIComponent(v8helpResult.sectionTitle)}?page=${encodeURIComponent(v8helpResult.pageLocation)}`);
      setPendingV8helpResult(v8helpResult);
      setV8helpLink('');
      processedRef.current = false;
    }
  }, [v8helpResult, locale, navigate]);
  
  useEffect(() => {
    if (pendingV8helpResult && section && sectionPages.length > 0 && !processedRef.current) {
      processedRef.current = true;
      expandPath(sectionPages, pendingV8helpResult.pagePath, locale);
      setPendingV8helpResult(null);
    }
  }, [pendingV8helpResult, section, sectionPages, expandPath, locale]);
  
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
        
        navigate(`/${locale}/${encodeURIComponent(section)}?page=${encodeURIComponent(pagePath)}`);
      }
    }
  }, [locale, section, navigate, selectedPagePath]);
  
  return {
    selectedPagePath,
    pageContent: processedContent,
    isLoading,
    error,
    handleLinkClick,
  };
}
