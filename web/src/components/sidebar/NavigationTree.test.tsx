import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@shared/test/test-utils';
import userEvent from '@testing-library/user-event';
import { NavigationTree } from './NavigationTree';
import type { PageDto } from '@shared/types';

describe('NavigationTree', () => {
  const mockPages: PageDto[] = [
    {
      title: 'Page 1',
      pagePath: 'page1',
      path: [0],
      hasChildren: false,
      children: null,
    },
    {
      title: 'Page 2',
      pagePath: 'page2',
      path: [1],
      hasChildren: false,
      children: null,
    },
  ];

  it('should render list of pages', () => {
    const onPageSelect = vi.fn();
    render(<NavigationTree pages={mockPages} onPageSelect={onPageSelect} />);

    expect(screen.getByText('Page 1')).toBeInTheDocument();
    expect(screen.getByText('Page 2')).toBeInTheDocument();
  });

  it('should call onPageSelect when page is clicked', async () => {
    const user = userEvent.setup();
    const onPageSelect = vi.fn();
    render(<NavigationTree pages={mockPages} onPageSelect={onPageSelect} />);

    await user.click(screen.getByText('Page 1'));
    expect(onPageSelect).toHaveBeenCalledWith('page1');
  });

  it('should show empty message when no pages', () => {
    const onPageSelect = vi.fn();
    render(<NavigationTree pages={[]} onPageSelect={onPageSelect} />);

    expect(screen.getByText('Оглавление пусто')).toBeInTheDocument();
  });

  it('should show search empty message when searching', () => {
    const onPageSelect = vi.fn();
    render(<NavigationTree pages={[]} onPageSelect={onPageSelect} searchQuery="test" />);

    expect(screen.getByText('Ничего не найдено')).toBeInTheDocument();
  });
});
