---
'svelte': patch
---

fix: ensure deferred effects are properly revived after async operations (fixes #17304)

When using `async` in SvelteKit with preloading data (via `data-sveltekit-preload-data` or `preloadData()`), `$effect` callbacks were not firing even though values were updating. This was because when forks are committed (which SvelteKit's preload uses), the `revive()` method wasn't ensuring the batch was properly activated before scheduling deferred effects. This fix ensures the batch context is correct when reviving effects.
