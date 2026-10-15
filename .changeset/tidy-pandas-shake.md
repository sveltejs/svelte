---
'svelte': patch
---

fix: deliver synchronous throws in async expressions to error boundaries instead of crashing with `Cannot read properties of null`
