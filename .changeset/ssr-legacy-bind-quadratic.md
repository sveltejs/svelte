---
'svelte': patch
---

fix: a component `bind:` no longer copies the whole rendered page on every retry, which made large forms quadratic
