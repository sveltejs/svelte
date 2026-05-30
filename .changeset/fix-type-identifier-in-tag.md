---
'svelte': patch
---

fix: don't mistake expressions starting with `type` (e.g. `{type === 'all' ? a : b}`) for TypeScript `type` declarations in tags
