---
'svelte': patch
---

Fixed `bind:` not working in `{#each}` blocks when the expression is a `$derived` that references a store (e.g. `{#each $derived($store) as item}`). The compiler now traces through derived bindings to detect underlying store subscriptions, ensuring proper store invalidation and mutable item tracking.
