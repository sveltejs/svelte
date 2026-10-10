---
'svelte': patch
---

fix: avoid retaining deriveds that read `$state.eager()` or `$effect.pending()`
