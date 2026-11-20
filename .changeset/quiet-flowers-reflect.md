---
'svelte': patch
---

fix: commit the state that hydration ran with, so that updates while hydration is pending don't undo it
