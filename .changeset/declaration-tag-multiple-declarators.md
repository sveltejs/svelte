---
'svelte': patch
---

fix: correctly transform references to earlier declarators in a declaration tag (e.g. `{let a = $state(0), b = $derived(a * 2)}`)
