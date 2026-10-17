---
'svelte': patch
---

fix: warn when reassigning derived state on server — overrides are permanent unlike client where they reset when dependencies change. Document server/client divergence in $derived docs (sveltejs/svelte#18681)
