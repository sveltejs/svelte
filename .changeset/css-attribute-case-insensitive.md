---
'svelte': patch
---

fix: treat CSS attribute selectors as case-insensitive for HTML enumerated attributes

CSS attribute selectors for HTML enumerated attributes (like `method`, `type`, `dir`, etc.) should match case-insensitively, matching browser behavior. Previously, `form[method="get"]` would not match `<form method="GET">`, causing the selector to be incorrectly pruned as unused and the scoping class to not be applied.
