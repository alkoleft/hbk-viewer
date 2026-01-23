import React, { createContext, useContext, useState, useCallback } from 'react';
import type { PageDto } from '../types/api';
import { createNodeId, findPageByPath } from '../utils/treeUtils';
import { useGlobalTocSection } from '../hooks/useGlobalData';

interface TreeStateContextType {
  expandedNodes: Set<string>;
  expandPath: (pages: PageDto[], pathTitles: string[], locale: string) => Promise<void>;
  clearExpansion: () => void;
  toggleNode: (nodeId: string) => void;
  isNodeExpanded: (nodeId: string) => boolean;
}

const TreeStateContext = createContext<TreeStateContextType | null>(null);

export function TreeStateProvider({ children }: { children: React.ReactNode }) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const clearExpansion = useCallback(() => {
    setExpandedNodes(new Set());
  }, []);

  const toggleNode = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  const isNodeExpanded = useCallback((nodeId: string) => {
    const result = expandedNodes.has(nodeId);
    if (result) {
      console.log(`🔓 Node expanded: ${nodeId}`);
    }
    return result;
  }, [expandedNodes]);

  const expandPath = useCallback(async (pages: PageDto[], pathTitles: string[], locale: string) => {
    console.log('🌳 expandPath called:', { pathTitles, pagesCount: pages.length, locale });
    
    // Очищаем текущее состояние
    setExpandedNodes(new Set());
    console.log('🧹 Cleared expanded nodes');
    
    let currentPages = pages;
    const nodesToExpand = new Set<string>();
    
    // Проходим по всему пути, включая последний элемент для раскрытия
    for (let i = 0; i < pathTitles.length; i++) {
      const pagePath = pathTitles[i];
      console.log(`🔍 Looking for page with path: "${pagePath}" in ${currentPages.length} pages`);
      
      const page = findPageByPath(currentPages, pagePath);
      
      if (page) {
        console.log(`✅ Found page: "${page.title}" (${page.pagePath})`);
        const nodeId = createNodeId(page, i);
        nodesToExpand.add(nodeId);
        console.log(`➕ Added node to expand: ${nodeId}`);
        
        // Если у страницы нет детей, загружаем их
        if (!page.children || page.children.length === 0) {
          console.log(`📥 Loading children for: ${page.pagePath}`);
          try {
            // Принудительно загружаем дочерние элементы
            const response = await fetch(`/api/toc/${encodeURIComponent(page.pagePath)}?depth=1`, {
              headers: { 'Accept-Language': locale }
            });
            if (response.ok) {
              const loadedChildren = await response.json();
              page.children = loadedChildren;
              console.log(`✅ Loaded ${loadedChildren.length} children for: ${page.pagePath}`);
            } else {
              console.error(`❌ Failed to load children, status: ${response.status}`);
            }
          } catch (error) {
            console.error('❌ Failed to load children for:', page.pagePath, error);
          }
        } else {
          console.log(`📋 Page already has ${page.children.length} children`);
        }
        
        currentPages = page.children || [];
      } else {
        console.warn(`❌ Page not found in tree: "${pagePath}"`);
        console.log('Available pages:', currentPages.map(p => `${p.title} (${p.pagePath})`));
        break;
      }
    }
    
    console.log(`🎯 Final nodes to expand:`, Array.from(nodesToExpand));
    // Устанавливаем новое состояние раскрытия
    setExpandedNodes(nodesToExpand);
    console.log('✅ Expansion completed');
  }, []);

  return (
    <TreeStateContext.Provider value={{
      expandedNodes,
      expandPath,
      clearExpansion,
      toggleNode,
      isNodeExpanded,
    }}>
      {children}
    </TreeStateContext.Provider>
  );
}

export function useTreeState() {
  const context = useContext(TreeStateContext);
  if (!context) {
    throw new Error('useTreeState must be used within TreeStateProvider');
  }
  return context;
}
