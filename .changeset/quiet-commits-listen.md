---
'svelte': patch
---

fix: don't let an effect that calls `flushSync` track what a batch reads while committing
