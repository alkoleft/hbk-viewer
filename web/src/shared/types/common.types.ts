export type SortType = 'name-asc' | 'name-desc' | 'size-asc' | 'size-desc';

export interface LoadingState {
  loading: boolean;
  error: string | null;
}
