---
'svelte': patch
---

fix: trim whitespace written as a character reference, like `&#32;`, in client templates as on the server
