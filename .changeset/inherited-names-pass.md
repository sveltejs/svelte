---
'svelte': patch
---

fix: read a prop named as a member of `Object.prototype`, such as `constructor`, as the parent passed it
