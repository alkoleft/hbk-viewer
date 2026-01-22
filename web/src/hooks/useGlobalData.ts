import { useQuery } from '@tanstack/react-query';
import { useAppInfo, useGlobalToc, useGlobalTocSection } from '../api/queries';

export function useAvailableLocales() {
  const { data: appInfo } = useAppInfo();
  return appInfo?.availableLocales || [];
}

export { useGlobalToc, useGlobalTocSection };
