---
'svelte': patch
---

fix: parse declaration tags whose initializer contains a division operator (e.g. `{const ratio = width / height}`)
