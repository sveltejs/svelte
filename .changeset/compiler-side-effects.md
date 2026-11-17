---
'svelte': patch
---

perf: mark the compiler as side-effect free so `parse`-only consumers can treeshake `aria-query` and `axobject-query`
