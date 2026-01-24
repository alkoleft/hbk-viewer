# Component Documentation

## Architecture Overview

The HBK Reader frontend follows a **feature-based architecture** with clear separation of concerns:

- **features/** - Self-contained feature modules
- **shared/** - Reusable components, utilities, and API layer
- **core/** - Application core (routing, store, config)

## Component Categories

### Layout Components

#### AppHeader
Main application header with navigation tabs and language selector.

**Location:** `src/components/layout/AppHeader.tsx`

**Features:**
- Section tabs for navigation
- Language selector (ru/en)
- Responsive design

### Navigation Components

#### Sidebar
Left sidebar containing the table of contents tree.

**Location:** `src/components/sidebar/Sidebar.tsx`

**Features:**
- Resizable width (200-600px)
- Search functionality
- Tree navigation

#### NavigationTree
Renders the hierarchical tree of documentation pages.

**Location:** `src/components/sidebar/NavigationTree.tsx`

**Props:**
- `pages: PageDto[]` - Array of pages to display
- `onPageSelect: (pagePath: string) => void` - Callback when page is selected
- `selectedPage?: string` - Currently selected page path
- `searchQuery?: string` - Search filter query

#### TreeNode
Individual node in the navigation tree with expand/collapse functionality.

**Location:** `src/components/sidebar/TreeNode.tsx`

**Features:**
- Lazy loading of children
- Expand/collapse animation
- Selection highlighting
- Auto-scroll to selected node

### Content Components

#### PageContent
Main content area displaying the documentation page HTML.

**Location:** `src/components/page/PageContent.tsx`

**Features:**
- HTML content rendering
- Full-width toggle
- v8help link handling
- Responsive images and tables

### Shared Components

#### LoadingFallback
Loading indicator for lazy-loaded routes.

**Location:** `src/shared/components/LoadingFallback.tsx`

**Usage:**
```tsx
<Suspense fallback={<LoadingFallback />}>
  <LazyComponent />
</Suspense>
```

#### ErrorAlert
Displays error messages in a styled alert box.

**Location:** `src/shared/components/ErrorAlert.tsx`

**Props:**
- `error: Error | string` - Error to display
- `title?: string` - Alert title (default: "Ошибка")

**Usage:**
```tsx
<ErrorAlert error={new Error('Something went wrong')} />
```

#### ErrorBoundary
Catches React errors and displays fallback UI.

**Location:** `src/components/common/ErrorBoundary.tsx`

**Usage:**
```tsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

## Hooks

### Navigation Hooks

#### useTreeNavigation
Manages tree node expansion state.

**Location:** `src/features/navigation/hooks/useTreeNavigation.ts`

**Returns:**
- `isNodeExpanded: (nodeId: string) => boolean`
- `toggleNode: (nodeId: string) => void`
- `expandNode: (nodeId: string) => void`
- `collapseNode: (nodeId: string) => void`

#### useSectionNavigation
Manages section navigation and TOC loading.

**Location:** `src/features/navigation/hooks/useSectionNavigation.ts`

**Returns:**
- `locale: string` - Current locale
- `section: string` - Current section
- `sectionPages: PageDto[]` - Pages in current section
- `isLoading: boolean`
- `error: Error | null`

### Content Hooks

#### useContentNavigation
Manages page content loading and v8help link handling.

**Location:** `src/features/content/hooks/useContentNavigation.ts`

**Returns:**
- `selectedPagePath: string`
- `pageContent: string`
- `isLoading: boolean`
- `error: Error | null`
- `handleLinkClick: (e: React.MouseEvent) => void`

### Shared Hooks

#### useSidebarResize
Handles sidebar width resizing with mouse drag.

**Location:** `src/shared/hooks/useSidebarResize.ts`

**Returns:**
- `sidebarWidth: number` - Current width in pixels
- `isResizing: boolean` - Whether currently resizing
- `handleResizeStart: (e: React.MouseEvent) => void`

## Services

### Navigation Services

#### TreeExpansionService
Handles tree path expansion and lazy loading.

**Location:** `src/features/navigation/services/tree-expansion.service.ts`

**Methods:**
- `expandPath(pages, pathTitles, locale, onNodeExpanded): Promise<void>`

#### Tree Utils
Utility functions for tree operations.

**Location:** `src/features/navigation/services/tree-utils.service.ts`

**Functions:**
- `createNodeId(page, level): string`
- `findPageByPath(pages, pagePath): PageDto | null`
- `hasPageChildren(page): boolean`
- `shouldLoadPageChildren(page, isSearchResult): boolean`
- `getPageTitle(page): string`

### Content Services

#### V8HelpLinkService
Handles v8help:// protocol links.

**Location:** `src/features/content/services/v8help-link.service.ts`

**Methods:**
- `handleV8HelpLink(href, locale): Promise<void>`

## API Layer

### API Client
Centralized API client for all backend requests.

**Location:** `src/shared/api/client.ts`

**Methods:**
- `getAppInfo(): Promise<AppInfo>`
- `getGlobalToc(locale, depth?): Promise<PageDto[]>`
- `getGlobalTocSection(locale, sectionPath, depth?): Promise<PageDto[]>`
- `getPageContentByPath(pagePath, locale): Promise<string>`
- `resolveV8HelpLink(link, locale): Promise<V8HelpResolveResult>`

### React Query Hooks
Typed React Query hooks for data fetching.

**Location:** `src/shared/api/queries.ts`

**Hooks:**
- `useAppInfo()`
- `useGlobalToc(locale, depth?)`
- `useGlobalTocSection(locale, sectionPath, depth?, enabled?)`
- `usePageContentByPath(pagePath, locale, enabled?)`
- `useResolveV8HelpLink(link, locale, enabled?)`

## State Management

### Zustand Store
Global application state.

**Location:** `src/core/store/`

**Slices:**
- `app.slice.ts` - App-wide state (locale, sidebar width, active section)
- `navigation.slice.ts` - Navigation state (expanded tree nodes)

**Selectors:**
```typescript
const locale = useStore(state => state.currentLocale);
const sidebarWidth = useStore(state => state.sidebarWidth);
const expandedNodes = useStore(state => state.expandedNodes);
```

## Testing

### Test Utilities
Custom render function with all providers.

**Location:** `src/shared/test/test-utils.tsx`

**Usage:**
```typescript
import { render, screen } from '@shared/test/test-utils';

test('renders component', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

### MSW Mocks
Mock Service Worker handlers for API mocking.

**Location:** `src/shared/test/mocks/handlers.ts`

**Usage:**
```typescript
import { server } from '@shared/test/mocks/server';
import { http, HttpResponse } from 'msw';

test('handles API error', async () => {
  server.use(
    http.get('/api/toc/', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );
  // test error handling
});
```

## Best Practices

1. **Component Structure**
   - Keep components small and focused
   - Extract business logic to services
   - Use hooks to connect services with components

2. **State Management**
   - Use React Query for server state
   - Use Zustand for client state
   - Use local state only when needed

3. **Performance**
   - Wrap expensive components in `React.memo`
   - Use `useCallback` for event handlers
   - Use `useMemo` for expensive computations
   - Implement virtualization for long lists

4. **Error Handling**
   - Use ErrorBoundary for component errors
   - Use ErrorAlert for inline errors
   - Provide user-friendly error messages

5. **Testing**
   - Test business logic in services
   - Test hooks with renderHook
   - Test components with user interactions
   - Mock API calls with MSW
