---
"svelte": patch
---

fix: prevent scheduler deadlock when $state is written in getter during flush
