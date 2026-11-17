---
'svelte': patch
---

perf: mark modules outside `src/internal` as side-effect free so `parse`-only consumers can treeshake `aria-query` and `axobject-query`
