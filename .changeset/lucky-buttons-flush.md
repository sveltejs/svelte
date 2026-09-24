---
'svelte': patch
---

fix: `flushSync` at the top of a component script no longer crashes or breaks reactivity

Calling `flushSync()` while the effect tree is still being constructed (e.g. at the top of a component's `<script>`) used to flush the in-flight batch mid-construction. The boundary then resolved against a nulled `current_batch` and crashed with `Cannot read properties of null (reading 'transfer_effects')`, and the half-built tree left the enclosing branch's CLEAN flag unbalanced — which made every later `schedule` call bail, silently killing reactivity.

`flushSync` now detects that a branch/root effect's update is in flight and skips the flush (there is nothing user-visible to flush yet; the batch flushes normally once construction settles). The boundary's resolution also tolerates a null batch as defense in depth, transferring deferred effects into a fresh batch instead of crashing.
