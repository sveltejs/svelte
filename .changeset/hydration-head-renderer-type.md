---
'svelte': patch
---

fix: preserve renderer type when copying during SSR legacy bind: retry, preventing a hydration mismatch with `<svelte:head>`
