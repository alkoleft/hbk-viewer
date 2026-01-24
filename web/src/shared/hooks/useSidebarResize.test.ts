import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSidebarResize } from './useSidebarResize';

describe('useSidebarResize', () => {
  it('should initialize with default width', () => {
    const { result } = renderHook(() => useSidebarResize());
    expect(result.current.sidebarWidth).toBe(320);
    expect(result.current.isResizing).toBe(false);
  });

  it('should start resizing on mouse down', () => {
    const { result } = renderHook(() => useSidebarResize());
    
    act(() => {
      result.current.handleResizeStart({ preventDefault: vi.fn() } as unknown as React.MouseEvent);
    });
    
    expect(result.current.isResizing).toBe(true);
  });

  it('should update width on mouse move', () => {
    const { result } = renderHook(() => useSidebarResize());
    
    act(() => {
      result.current.handleResizeStart({ clientX: 320, preventDefault: vi.fn() } as unknown as React.MouseEvent);
    });

    const mouseMoveEvent = new MouseEvent('mousemove', { clientX: 400 });
    act(() => {
      document.dispatchEvent(mouseMoveEvent);
    });

    expect(result.current.sidebarWidth).toBeGreaterThan(320);
  });

  it('should stop resizing on mouse up', () => {
    const { result } = renderHook(() => useSidebarResize());
    
    act(() => {
      result.current.handleResizeStart({ preventDefault: vi.fn() } as unknown as React.MouseEvent);
    });

    const mouseUpEvent = new MouseEvent('mouseup');
    act(() => {
      document.dispatchEvent(mouseUpEvent);
    });

    expect(result.current.isResizing).toBe(false);
  });

  it('should respect min and max width constraints', () => {
    const { result } = renderHook(() => useSidebarResize());
    
    act(() => {
      result.current.handleResizeStart({ clientX: 320, preventDefault: vi.fn() } as unknown as React.MouseEvent);
    });

    const mouseMoveEventMin = new MouseEvent('mousemove', { clientX: 100 });
    act(() => {
      document.dispatchEvent(mouseMoveEventMin);
    });
    expect(result.current.sidebarWidth).toBeGreaterThanOrEqual(200);

    const mouseMoveEventMax = new MouseEvent('mousemove', { clientX: 1000 });
    act(() => {
      document.dispatchEvent(mouseMoveEventMax);
    });
    expect(result.current.sidebarWidth).toBeLessThanOrEqual(600);
  });
});
