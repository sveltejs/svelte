---
'svelte': patch
---

perf: use Set for visited tracking in sort_const_tags to avoid O(n²) membership checks
