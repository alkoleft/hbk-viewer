import { describe, it, expect, vi } from 'vitest';
import { TreeExpansionService } from './tree-expansion.service';
import type { PageDto } from '@shared/types';
import { apiClient } from '@shared/api';

vi.mock('@shared/api', () => ({
  apiClient: {
    getGlobalTocSection: vi.fn(),
  },
}));

describe('TreeExpansionService', () => {
  const service = new TreeExpansionService();

  it('should expand path and load children', async () => {
    const mockPage: PageDto = {
      title: 'Parent',
      pagePath: 'parent',
      path: ['parent'],
      hasChildren: true,
    };

    const mockChildren: PageDto[] = [
      { title: 'Child', pagePath: 'parent/child', path: ['parent', 'child'], hasChildren: false },
    ];

    vi.mocked(apiClient.getGlobalTocSection).mockResolvedValue(mockChildren);

    const onNodeExpanded = vi.fn();
    await service.expandPath([mockPage], ['parent'], 'ru', onNodeExpanded);

    expect(onNodeExpanded).toHaveBeenCalledWith('parent-0');
    expect(mockPage.children).toEqual(mockChildren);
  });

  it('should handle missing pages in path', async () => {
    const mockPage: PageDto = {
      title: 'Page',
      pagePath: 'page',
      path: ['page'],
      hasChildren: false,
    };

    const onNodeExpanded = vi.fn();
    await service.expandPath([mockPage], ['nonexistent'], 'ru', onNodeExpanded);

    expect(onNodeExpanded).not.toHaveBeenCalled();
  });
});
