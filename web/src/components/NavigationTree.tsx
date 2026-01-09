import { useState, useMemo } from 'react';
import type { PageDto } from '../types/api';

interface NavigationTreeProps {
  pages: PageDto[];
  onPageSelect: (htmlPath: string) => void;
  selectedPage?: string; // htmlPath выбранной страницы
}

export function NavigationTree({ pages, onPageSelect, selectedPage }: NavigationTreeProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filterPages = (pagesList: PageDto[], query: string): PageDto[] => {
    if (!query.trim()) {
      return pagesList;
    }
    const lowerQuery = query.toLowerCase();
    return pagesList
      .map((page) => {
        const pageTitle = page.title.ru || page.title.en;
        const matches = pageTitle.toLowerCase().includes(lowerQuery);
        const filteredChildren = filterPages(page.children, query);
        if (matches || filteredChildren.length > 0) {
          return { ...page, children: filteredChildren };
        }
        return null;
      })
      .filter((page): page is PageDto => page !== null);
  };

  const filteredPages = useMemo(() => {
    return filterPages(pages, searchQuery);
  }, [pages, searchQuery]);

  return (
    <div className="navigation-tree-container">
      <div className="navigation-tree-header">
        <h3>Оглавление</h3>
        <input
          type="text"
          className="navigation-search-input"
          placeholder="Поиск в оглавлении..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="navigation-tree-scrollable">
        <ul className="tree">
          {filteredPages.map((page, index) => (
            <TreeNode
              key={index}
              page={page}
              onPageSelect={onPageSelect}
              selectedPage={selectedPage}
              level={0}
              searchQuery={searchQuery}
            />
          ))}
        </ul>
        {filteredPages.length === 0 && searchQuery && (
          <div className="empty">Ничего не найдено</div>
        )}
      </div>
    </div>
  );
}

interface TreeNodeProps {
  page: PageDto;
  onPageSelect: (htmlPath: string) => void;
  selectedPage?: string; // htmlPath выбранной страницы
  level: number;
  searchQuery?: string;
}

function TreeNode({ page, onPageSelect, selectedPage, level, searchQuery }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2 || (searchQuery ? true : false));
  const hasChildren = page.children.length > 0;
  const pageTitle = page.title.ru || page.title.en;
  const isSelected = selectedPage === page.htmlPath;

  const handleClick = () => {
    onPageSelect(page.htmlPath);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <li className={`tree-node ${isSelected ? 'selected' : ''}`}>
      <div
        className="tree-node-content"
        style={{ paddingLeft: `${level * 20}px` }}
        onClick={handleClick}
      >
        {hasChildren && (
          <span className="tree-toggle" onClick={handleToggle}>
            {isExpanded ? '▼' : '▶'}
          </span>
        )}
        {!hasChildren && <span className="tree-spacer" />}
        <span className="tree-label">{pageTitle}</span>
      </div>
      {hasChildren && isExpanded && (
        <ul className="tree-children">
          {page.children.map((child, index) => (
            <TreeNode
              key={index}
              page={child}
              onPageSelect={onPageSelect}
              selectedPage={selectedPage}
              level={level + 1}
              searchQuery={searchQuery}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
