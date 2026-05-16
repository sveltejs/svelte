---
'svelte': patch
---

Avoid unnecessary `$.stringify` calls for server-rendered attribute values when the compiler can prove an expression is a string or a known constant.
