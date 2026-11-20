---
'svelte': patch
---

fix: allow calling `hydrate` or `mount` through a union of the two, e.g. `(condition ? hydrate : mount)(App, options)`
