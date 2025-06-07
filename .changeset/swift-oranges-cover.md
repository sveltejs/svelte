---
'svelte': patch
---

Fix components mounted via mount() during onMount() that not properly update when using signals provided as input of the mount() function.
