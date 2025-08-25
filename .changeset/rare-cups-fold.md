---
'svelte': patch
---

fix: Introduced Promise.resolve to ensure that the 'set' operation completes before the 'get' operation Minimizing update delays.
