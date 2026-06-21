---
'svelte': patch
---

Fixed a compiler crash that occurred when any sibling element or text node followed a `<select value="...">` element. The `value` attribute guard was missing `select` from its node name check, causing esrap to receive a malformed AST node with a null `object` property.
