---
'svelte': patch
---

Fix `{@attach}` callbacks being silently skipped inside a `<svelte:boundary>` with an async block when an ancestor also contains an async expression. The batch traversal was unconditionally re-running clean `MANAGED_EFFECT` effects, which destroyed the inner attach effect before it could execute.
