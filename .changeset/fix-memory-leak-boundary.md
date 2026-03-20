---
'svelte': patch
---

fix: null out `effect.b` (boundary reference) in `destroy_effect` to prevent memory leak

When a dynamic component switches (e.g., `<Component />`), old branch effects are destroyed but were still retaining a reference to the `Boundary` instance via the `effect.b` field. This prevented the garbage collector from reclaiming memory for destroyed component subtrees, causing memory to grow without bound when repeatedly changing a mounted component's props.

Fixes #17881
