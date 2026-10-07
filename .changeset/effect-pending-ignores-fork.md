---
'svelte': patch
---

fix: $effect.pending() should not be affected by uncommitted forks

$effect.pending() and boundary pending snippets were incorrectly triggered by async work inside an uncommitted fork. The `increment_pending()` function in the async reactivity module now checks whether the current batch is a fork (`batch.is_fork`). If it is, the boundary's pending count is left untouched — only the batch's own pending count is updated so that `commit` can still await the async work. This makes `$effect.pending()` behave consistently with `$state.eager()`, which is similarly unaffected by uncommitted forks.
