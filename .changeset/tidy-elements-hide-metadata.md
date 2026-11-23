---
'svelte': patch
---

fix: make dev element metadata non-enumerable to avoid traversing component graphs during structural comparisons
