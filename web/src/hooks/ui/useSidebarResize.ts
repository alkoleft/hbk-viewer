import { useState, useCallback, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';

const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 800;

/**
 * Хук для управления изменением размера Sidebar
 */
export function useSidebarResize() {
  const sidebarWidth = useAppStore((state) => state.sidebarWidth);
  const setSidebarWidth = useAppStore((state) => state.setSidebarWidth);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(0);
  const currentWidthRef = useRef<number>(sidebarWidth);

  // Синхронизируем ref с состоянием ширины
  useEffect(() => {
    currentWidthRef.current = sidebarWidth;
    resizeStartWidthRef.current = sidebarWidth;
  }, [sidebarWidth]);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    resizeStartXRef.current = e.clientX;
    resizeStartWidthRef.current = sidebarWidth;
  }, [sidebarWidth]);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const deltaX = e.clientX - resizeStartXRef.current;
    const newWidth = Math.max(
      MIN_SIDEBAR_WIDTH,
      Math.min(MAX_SIDEBAR_WIDTH, resizeStartWidthRef.current + deltaX)
    );
    setSidebarWidth(newWidth);
    currentWidthRef.current = newWidth;
  }, [isResizing, setSidebarWidth]);

  const handleResizeEnd = useCallback(() => {
    if (!isResizing) return;
    setIsResizing(false);
    setSidebarWidth(currentWidthRef.current);
  }, [isResizing, setSidebarWidth]);

  // Подписываемся на события мыши для изменения размера
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  return {
    sidebarWidth,
    isResizing,
    handleResizeStart,
  };
}
