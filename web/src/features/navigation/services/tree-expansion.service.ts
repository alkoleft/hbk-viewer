import type { PageDto } from '@shared/types';
import { apiClient } from '@shared/api';
import { createNodeId, findPageByPath } from './tree-utils.service';

export class TreeExpansionService {
  async expandPath(
    pages: PageDto[], 
    pathTitles: string[], 
    locale: string,
    onNodesExpanded: (nodes: Set<string>) => void
  ): Promise<void> {
    let currentPages = pages;
    const nodesToExpand = new Set<string>();
    
    for (let i = 0; i < pathTitles.length; i++) {
      const pagePath = pathTitles[i];
      const page = findPageByPath(currentPages, pagePath);
      
      if (page) {
        const nodeId = createNodeId(page, i);
        nodesToExpand.add(nodeId);
        
        if (!page.children || page.children.length === 0) {
          try {
            const loadedChildren = await apiClient.getGlobalTocSection(locale, page.pagePath, 1);
            page.children = loadedChildren;
          } catch (error) {
            console.error('Failed to load children for:', page.pagePath, error);
          }
        }
        
        currentPages = page.children || [];
      } else {
        break;
      }
    }
    
    onNodesExpanded(nodesToExpand);
  }
}

export const treeExpansionService = new TreeExpansionService();
