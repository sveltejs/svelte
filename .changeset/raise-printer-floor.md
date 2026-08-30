---
"svelte": patch
---

Fixed [#18643](https://github.com/sveltejs/svelte/issues/18643): raised the printer dependency floor so a broken 2.3.3 release cannot be resolved. Server codegen for `@type` JSDoc on `export let` plus `$:` is valid JS again.
