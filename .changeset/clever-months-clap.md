---
'svelte': patch
---

fix: only abort effect flushing if it causes an existing effect to be scheduled
