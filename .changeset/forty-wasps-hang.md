---
'svelte': patch
---

fix: don't skip sibling listeners added with `on()` when an earlier one calls `stopPropagation()`
