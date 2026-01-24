import { useStore, selectExpandedNodes } from '@core/store';
import { treeExpansionService } from '../services/tree-expansion.service';
import type { PageDto } from '@shared/types';

export function useTreeNavigation() {
  const expandedNodes = useStore(selectExpandedNodes);
  const toggleNode = useStore((state) => state.toggleNode);
  const clearExpansion = useStore((state) => state.clearExpansion);
  const setExpandedNodes = useStore((state) => state.setExpandedNodes);
  
  const isNodeExpanded = (nodeId: string) => expandedNodes.has(nodeId);
  
  const expandPath = async (pages: PageDto[], pathTitles: string[], locale: string) => {
    clearExpansion();
    await treeExpansionService.expandPath(pages, pathTitles, locale, setExpandedNodes);
  };
  
  return {
    expandedNodes,
    isNodeExpanded,
    toggleNode,
    clearExpansion,
    expandPath,
  };
}
