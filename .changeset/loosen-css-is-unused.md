---
"svelte": patch
---

Loosen the CSS unused-selector check for  and  so an individual member is no longer warned when a sibling member is used.  /  mean the selector applies if any member matches, so warning a used-sibling's unused member was a false positive. Pruning is unaffected.
