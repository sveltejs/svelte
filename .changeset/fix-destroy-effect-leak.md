---
'svelte': patch
---

fix: clear last scheduled effect reference in `destroy_effect` to prevent detached subtree memory leaks (#18623)
