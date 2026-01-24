import { useState, useCallback } from 'react';
import { useStore } from '@core/store';
import { STORAGE } from '@core/config';

export function useSidebarResize() {
  const sidebarWidth = useStore((state) => state.sidebarWidth);
  const setSidebarWidth = useStore((state) => state.setSidebarWidth);
  const [isResizing, setIsResizing] = useState(false);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.min(
        Math.max(moveEvent.clientX, STORAGE.MIN_SIDEBAR_WIDTH),
        STORAGE.MAX_SIDEBAR_WIDTH
      );
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [setSidebarWidth]);

  return {
    sidebarWidth,
    isResizing,
    handleResizeStart,
  };
}
