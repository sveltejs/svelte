---
'svelte': patch
---

fix: reset `is_flushing` if `flushSync` is called and there's no scheduled effect
