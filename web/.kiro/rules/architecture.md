# Frontend Architecture Rules

## Directory Structure

```
src/
├── features/              # Feature modules (self-contained functionality)
│   ├── {feature-name}/
│   │   ├── components/    # UI components specific to feature
│   │   ├── hooks/         # Feature-specific hooks
│   │   ├── services/      # Business logic and data manipulation
│   │   ├── store/         # Feature-specific Zustand slices (if needed)
│   │   └── types/         # Feature-specific TypeScript types
├── shared/                # Shared code across features
│   ├── api/               # API client, React Query hooks, query keys
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Common hooks
│   ├── lib/               # Utility functions and helpers
│   └── types/             # Shared TypeScript types
└── core/                  # Application core
    ├── router/            # Routing configuration
    ├── store/             # Global Zustand store with slices
    └── config/            # App configuration and constants
```

## Rules

### 1. Feature Organization
- Each feature must be self-contained in `features/{feature-name}/`
- Features should not directly import from other features
- Shared code between features goes to `shared/`
- Feature structure: `components/`, `hooks/`, `services/`, `types/`

### 2. Separation of Concerns
- **Components** - Only UI and presentation logic
- **Hooks** - Connect services with components, manage local state
- **Services** - Business logic, data manipulation, algorithms
- **Types** - TypeScript interfaces and types

### 3. Import Rules
- Use path aliases: `@features/*`, `@shared/*`, `@core/*`
- Components import from hooks, NOT directly from services
- Services are pure functions/classes, no React dependencies
- Hooks can import from services and use React hooks

### 4. State Management
- **Zustand** for client state (global store in `core/store/`)
- **React Query** for server state (hooks in `shared/api/`)
- Local state with `useState` only when needed
- Use selectors for Zustand to optimize re-renders

### 5. API Layer
- All API calls through `shared/api/client.ts`
- React Query hooks in `shared/api/queries.ts`
- Typed query keys in `shared/api/query-keys.ts`
- Never fetch directly in components

### 6. TypeScript
- All files must be `.ts` or `.tsx`
- No `any` types (use `unknown` if needed)
- Export types from feature's `types/` directory
- Shared types in `shared/types/`

### 7. Code Style
- Minimal code - no verbose implementations
- No `console.log` in production code
- Use `useCallback` for event handlers passed as props
- Use `useMemo` for expensive computations
- Add `useRef` to prevent infinite loops in `useEffect`

### 8. File Naming
- Components: `PascalCase.tsx` (e.g., `TreeNode.tsx`)
- Hooks: `use*.ts` (e.g., `useTreeNavigation.ts`)
- Services: `*.service.ts` (e.g., `tree-expansion.service.ts`)
- Types: `*.types.ts` (e.g., `api.types.ts`)
- Utils: `*.ts` (e.g., `url-manager.ts`)

### 9. Barrel Exports
- Each directory should have `index.ts` for exports
- Export only public API, keep internals private
- Example: `features/navigation/hooks/index.ts`

### 10. Dependencies
- Components depend on hooks
- Hooks depend on services and stores
- Services have no React dependencies
- Stores are independent

## Examples

### ✅ Good: Feature Structure
```
features/navigation/
├── components/
│   └── TreeNode.tsx          # UI only
├── hooks/
│   ├── useTreeNavigation.ts  # Connects service + store
│   └── index.ts
├── services/
│   ├── tree-expansion.service.ts  # Pure logic
│   └── tree-utils.service.ts
└── types/
    └── navigation.types.ts
```

### ✅ Good: Component
```typescript
// features/navigation/components/TreeNode.tsx
import { useTreeNavigation } from '../hooks';

export function TreeNode({ page }: Props) {
  const { isExpanded, toggleNode } = useTreeNavigation();
  // Only UI logic here
}
```

### ✅ Good: Hook
```typescript
// features/navigation/hooks/useTreeNavigation.ts
import { useStore } from '@core/store';
import { treeService } from '../services/tree-expansion.service';

export function useTreeNavigation() {
  const expandedNodes = useStore(state => state.expandedNodes);
  // Connect service with store
}
```

### ✅ Good: Service
```typescript
// features/navigation/services/tree-expansion.service.ts
export class TreeExpansionService {
  expandPath(pages: PageDto[], path: string[]) {
    // Pure business logic, no React
  }
}
```

### ❌ Bad: Component with Business Logic
```typescript
// DON'T: Business logic in component
export function TreeNode({ page }: Props) {
  const [expanded, setExpanded] = useState(false);
  
  const expandNode = async () => {
    const children = await fetch('/api/...');  // ❌ Direct API call
    // ❌ Business logic in component
  };
}
```

### ❌ Bad: Service with React
```typescript
// DON'T: React hooks in service
export class TreeService {
  useExpandNode() {  // ❌ Hooks in service
    const [state, setState] = useState();
  }
}
```

## When Adding New Code

1. **New Feature?** → Create `features/{name}/` with structure
2. **Reusable Component?** → Add to `shared/components/`
3. **API Call?** → Add hook to `shared/api/queries.ts`
4. **Business Logic?** → Create service in feature's `services/`
5. **Global State?** → Add slice to `core/store/slices/`
6. **Utility Function?** → Add to `shared/lib/`

## Checklist Before Commit

- [ ] No `console.log` statements
- [ ] Using path aliases (`@features/*`, `@shared/*`, `@core/*`)
- [ ] Components only have UI logic
- [ ] Business logic in services
- [ ] API calls through React Query hooks
- [ ] TypeScript types defined
- [ ] No `any` types
- [ ] Barrel exports (`index.ts`) updated
- [ ] No infinite loops in `useEffect`
- [ ] Event handlers wrapped in `useCallback`
