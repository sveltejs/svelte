---
'svelte': patch
---

fix: propagate async `@const` blockers through closure references so template expressions like `{(() => host)()}` correctly wait for the awaited value
