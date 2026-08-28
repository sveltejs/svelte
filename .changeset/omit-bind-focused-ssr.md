---
'svelte': patch
---

fix: omit `bind:focused` from SSR output (it has no HTML attribute)
