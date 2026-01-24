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
│   ├── hooks/             # Common hooks (including mobile)
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
- **hooks/** - Common hooks (e.g., useSidebarResize, useIsMobile, useSwipeGesture)
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
- `app.slice.ts` - App-wide state (locale, sidebar width, active section, mobile drawer)
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
import { useIsMobile, useSwipeGesture } from '@shared/hooks';
```

## Mobile Adaptation

The application is fully adapted for mobile devices with a responsive design approach.

### Key Features

1. **Drawer Navigation**
   - Sidebar opens as a drawer on mobile devices (< 900px)
   - Swipe gestures for opening/closing
   - Auto-close on page selection
   - Adaptive width: 100% on small screens (<360px), 85% on medium screens

2. **Responsive Header**
   - Hamburger menu button on mobile
   - Shortened title "HBK Viewer" on mobile
   - Hidden version info on small screens
   - Compact section tabs (40px height on mobile)

3. **Optimized Content**
   - Reduced paddings for mobile
   - Horizontally scrollable tables
   - Hidden full-width button on mobile
   - Responsive font sizes via CSS media queries

### Mobile-Specific Components

**Hooks:**
- `useIsMobile()` - Detects mobile devices using MUI breakpoints
- `useSwipeGesture()` - Handles touch events for swipe gestures

**Store:**
- `isMobileDrawerOpen` - Drawer state for mobile
- `toggleMobileDrawer()` - Toggle drawer visibility

**Components:**
- `Sidebar` - Conditional rendering: Drawer on mobile, Paper on desktop
- `AppHeader` - Hamburger menu button for mobile
- `PageContent` - Responsive paddings and styles

### Breakpoints

- **xs:** 0px - 600px (mobile phones)
- **sm:** 600px - 900px (tablets)
- **md:** 900px+ (desktop)

### Implementation Details

**Drawer Width:**
```typescript
width: { 
  xs: '100%',        // < 600px
  sm: '85%'          // 600px - 900px
}

// Additional media query:
@media (max-width: 360px) {
  width: '100%'      // < 360px (small phones)
}
```

**Swipe Gestures:**
- Swipe right (from left edge) → Open drawer
- Swipe left → Close drawer
- Minimum swipe distance: 50px

**Header Height:**
- Desktop: 64px (toolbar) + 48px (tabs) = 112px
- Mobile: 64px (toolbar) + 40px (tabs) = 104px

### Testing Mobile Features

```bash
# Start dev server
npm run dev

# Open in browser: http://localhost:3000
# F12 → Ctrl+Shift+M (responsive design mode)
# Select device: iPhone, iPad, or set custom resolution
```

**Recommended test resolutions:**
- 320px - iPhone SE (small phones)
- 375px - iPhone X/11/12 (standard phones)
- 768px - iPad (tablets)
- 1024px - iPad Pro / small laptops

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
- ✅ **Mobile Support** - Full responsive design with drawer navigation and swipe gestures

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
- Mobile-first responsive design with drawer navigation

### Added
- `useIsMobile` hook - Mobile device detection
- `useSwipeGesture` hook - Touch gesture handling
- Mobile drawer state in app slice
- Responsive styles and breakpoints
- Mobile-optimized components

## Next Steps

1. Add integration tests for features
2. Implement code splitting with React.lazy
3. Add performance monitoring
4. Create component documentation with Storybook

## Testing

### Test Infrastructure

The application uses **Vitest** with **React Testing Library** for unit and integration tests.

**Configuration:** `vitest.config.ts`

**Test utilities:** `src/shared/test/test-utils.tsx` provides custom render with all providers (QueryClient, Router, Theme)

**API mocking:** MSW (Mock Service Worker) in `src/shared/test/mocks/`

### Running Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Test Structure

```
src/
├── shared/
│   ├── lib/
│   │   ├── url-manager.ts
│   │   └── url-manager.test.ts
│   ├── hooks/
│   │   ├── useSidebarResize.ts
│   │   └── useSidebarResize.test.ts
│   └── api/
│       ├── client.ts
│       └── client.test.ts
├── features/
│   └── navigation/
│       ├── services/
│       │   ├── tree-utils.service.ts
│       │   └── tree-utils.service.test.ts
│       └── hooks/
│           ├── useTreeNavigation.ts
│           └── useTreeNavigation.test.ts
└── components/
    └── sidebar/
        ├── NavigationTree.tsx
        └── NavigationTree.test.tsx
```

### Testing Best Practices

1. **Unit Tests** - Test services and utilities in isolation
2. **Integration Tests** - Test hooks with store and React Query
3. **Component Tests** - Test UI with user interactions
4. **API Mocking** - Use MSW for consistent API mocking
5. **Coverage** - Aim for >75% coverage for critical paths

### Example Test

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@shared/test/test-utils';
import userEvent from '@testing-library/user-event';

describe('MyComponent', () => {
  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

## Performance Optimizations

### Code Splitting

The application uses React.lazy for route-based code splitting:

```typescript
const AppViewPage = lazy(() => import('./pages/AppViewPage'));
```

**Vendor chunks** are configured in `vite.config.ts`:
- `react-vendor` - React core libraries
- `mui-vendor` - Material-UI components
- `query-vendor` - React Query

### Bundle Size

Target metrics:
- Initial bundle: < 100KB gzipped
- Total bundle: < 500KB
- Lazy chunks: < 50KB each

### React Query Configuration

Optimized caching and retry logic:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Component Optimization

- Use `React.memo` for expensive components
- Use `useCallback` for event handlers passed as props
- Use `useMemo` for expensive computations
- Implement virtualization for long lists with `@tanstack/react-virtual`

## Error Handling

### Error Boundary

Global error boundary catches React errors:

```typescript
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### Typed Errors

Custom error classes in `shared/lib/error-handler.ts`:

- `ApiError` - API request failures
- `NetworkError` - Network connectivity issues

### Error Display

- `ErrorBoundary` - Full-page error fallback
- `ErrorAlert` - Inline error messages
- React Query error states - Per-query error handling

## Documentation

- **Architecture:** `ARCHITECTURE.md` (this file)
- **Components:** `docs/components.md` - Detailed component documentation
- **API:** JSDoc comments in source code
- **Testing:** Test examples in `src/shared/test/`

For component-specific documentation, see [docs/components.md](docs/components.md).
