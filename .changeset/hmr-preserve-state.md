---
'svelte': patch
---

Preserve $state values across HMR component swaps. When a component is hot-replaced, labeled signal values are captured from the old effect tree and restored during the new component's initialization via $.tag(). This matches the state preservation behavior of React Fast Refresh and Vue's rerender().
