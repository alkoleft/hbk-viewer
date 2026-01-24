# Frontend Architecture

## Overview

The frontend application has been refactored to follow a **Feature-based architecture** with clear separation of concerns. This architecture improves maintainability, testability, and makes it easier to add new features.

## Directory Structure

```
src/
├── features/              # Feature modules
│   ├── navigation/        # Navigation and TOC tree
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Feature-specific hooks
│   │   ├── services/      # Business logic
│   │   └── types/         # Feature types
│   ├── content/           # Content viewing
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   └── app/               # Global app settings
│       ├── components/
│       ├── hooks/
│       └── store/
├── shared/                # Shared components and utilities
│   ├── api/               # API client and React Query hooks
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Common hooks
│   ├── lib/               # Utilities and helpers
│   └── types/             # Shared types
└── core/                  # Application core
    ├── router/            # Routing configuration
    ├── store/             # Global Zustand store
    └── config/            # App configuration
```

## Key Principles

1. **Separation of Concerns** - UI, business logic, and data are separated
2. **Single Responsibility** - Each module is responsible for one feature
3. **Dependency Inversion** - Dependencies through interfaces
4. **Minimal Code** - Only necessary code without redundancy

## Architecture Layers

### Features Layer

Feature modules are self-contained and include:
- **components/** - UI components specific to the feature
- **hooks/** - Custom hooks for the feature
- **services/** - Business logic and data manipulation
- **types/** - TypeScript types for the feature

Example: `features/navigation/`
- Handles TOC tree navigation
- Tree expansion logic
- Section navigation

### Shared Layer

Reusable code across features:
- **api/** - API client, React Query hooks, query keys
- **components/** - UI components used in multiple features
- **hooks/** - Common hooks (e.g., useSidebarResize)
- **lib/** - Utility functions (e.g., urlManager)
- **types/** - Shared TypeScript types

### Core Layer

Application foundation:
- **router/** - Typed routes configuration
- **store/** - Global Zustand store with slices
- **config/** - App configuration and constants

## State Management

### Zustand Store

The application uses a single Zustand store with modular slices:

```typescript
// core/store/index.ts
export const useStore = create<RootStore>((set) => ({
  ...createAppSlice(set),
  ...createNavigationSlice(set),
}));
```

**Slices:**
- `app.slice.ts` - App-wide state (locale, sidebar width, active section)
- `navigation.slice.ts` - Navigation state (expanded tree nodes)

**Selectors:**
```typescript
export const selectSidebarWidth = (state: RootStore) => state.sidebarWidth;
export const selectCurrentLocale = (state: RootStore) => state.currentLocale;
```

### React Query

Server state management with typed query keys:

```typescript
// shared/api/query-keys.ts
export const queryKeys = {
  appInfo: ['app-info'] as const,
  toc: {
    global: (locale: string, depth?: number) => [...],
    section: (locale: string, sectionPath: string, depth?: number) => [...],
  },
  content: {
    byPath: (pagePath: string, locale: string) => [...],
  },
};
```

## Path Aliases

TypeScript and Vite are configured with path aliases:

```typescript
{
  "@features/*": ["src/features/*"],
  "@shared/*": ["src/shared/*"],
  "@core/*": ["src/core/*"]
}
```

Usage:
```typescript
import { useStore } from '@core/store';
import { useGlobalToc } from '@shared/api';
import { useTreeNavigation } from '@features/navigation/hooks';
```

## Adding New Features

1. Create feature directory: `src/features/my-feature/`
2. Add subdirectories: `components/`, `hooks/`, `services/`, `types/`
3. Implement feature logic in services
4. Create hooks to connect services with components
5. Build UI components
6. Export public API through `index.ts`

Example:
```typescript
// features/my-feature/services/my.service.ts
export class MyService {
  doSomething() { /* ... */ }
}

// features/my-feature/hooks/useMyFeature.ts
export function useMyFeature() {
  const service = new MyService();
  return { doSomething: service.doSomething };
}

// features/my-feature/index.ts
export * from './hooks/useMyFeature';
```

## Benefits

- ✅ **Extensibility** - New features are added as separate modules
- ✅ **Maintainability** - Clear separation of responsibilities
- ✅ **Testability** - Isolated modules are easy to test
- ✅ **Minimal Code** - Removed duplication and redundancy
- ✅ **Type Safety** - Full TypeScript support with path aliases
- ✅ **Performance** - Optimized re-renders with selectors

## Migration Notes

### Removed
- `contexts/TreeStateContext.tsx` - Replaced with Zustand navigation slice
- `store/useAppStore.ts` - Migrated to `core/store/slices/app.slice.ts`
- Old `api/` directory - Replaced with `shared/api/`
- Old `hooks/` directory - Migrated to feature-specific or shared hooks
- Old `utils/` directory - Migrated to `shared/lib/` or feature services

### Updated
- All components now use path aliases
- State management unified in Zustand
- API calls through typed React Query hooks
- URL management centralized in `urlManager`

## Next Steps

1. Add integration tests for features
2. Implement code splitting with React.lazy
3. Add performance monitoring
4. Create component documentation with Storybook
