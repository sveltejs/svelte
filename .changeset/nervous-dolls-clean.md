---
'svelte': patch
---

fix: avoid double-calling a derived reference when destructuring `$derived` of another `$derived` during server-side rendering
