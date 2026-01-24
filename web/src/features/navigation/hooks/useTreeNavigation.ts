import { useStore, selectExpandedNodes } from '@core/store';
import { treeExpansionService } from '../services/tree-expansion.service';
import type { PageDto } from '@shared/types';

export function useTreeNavigation() {
  const expandedNodes = useStore(selectExpandedNodes);
  const toggleNode = useStore((state) => state.toggleNode);
  const clearExpansion = useStore((state) => state.clearExpansion);
  const expandNode = useStore((state) => state.expandNode);
  
  const isNodeExpanded = (nodeId: string) => expandedNodes.has(nodeId);
  
  const expandPath = async (
    pages: PageDto[], 
    pathTitles: string[], 
    locale: string,
    onComplete?: () => void
  ) => {
    await treeExpansionService.expandPath(pages, pathTitles, locale, expandNode);
    onComplete?.();
  };
  
  return {
    expandedNodes,
    isNodeExpanded,
    toggleNode,
    clearExpansion,
    expandPath,
  };
}
