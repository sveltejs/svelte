---
'svelte': patch
---

fix: don't let a throwing `$effect` teardown strand the rest of a destroy pass
