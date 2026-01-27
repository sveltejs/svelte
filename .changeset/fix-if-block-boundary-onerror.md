---
'svelte': patch
---

fix: run boundary `onerror` callbacks in a microtask, in case they result in the boundary's destruction
