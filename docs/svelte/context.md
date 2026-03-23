# Context
## Type-safe context
Use `createContext` rather than `setContext` and `getContext`, as it provides type safety.

```svelte
import { createContext } from 'svelte';

const Context = createContext();
```