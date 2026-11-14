---
'svelte': patch
---

fix: keep values computed in a batch's view of the world local to that batch, and don't needlessly re-run deriveds while several batches are pending
