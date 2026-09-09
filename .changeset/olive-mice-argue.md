---
'svelte': patch
---

fix: throw `set_context_after_init` when `setContext` is called after an `await` during SSR
