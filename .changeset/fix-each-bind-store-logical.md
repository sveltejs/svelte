---
'svelte': patch
---

Fixed store invalidation in `{#each}` blocks when the expression uses logical operators (e.g. `{#each $store.items ?? [] as item}`). Previously, `bind:` on iteration variables would not propagate changes back to the store because the compiler only detected store expressions with simple `Identifier` or `MemberExpression` AST shapes.
