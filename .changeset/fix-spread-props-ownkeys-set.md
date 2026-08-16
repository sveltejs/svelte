---
'svelte': patch
---

perf: use Set for key deduplication in spread_props ownKeys to avoid O(k²) includes scan
