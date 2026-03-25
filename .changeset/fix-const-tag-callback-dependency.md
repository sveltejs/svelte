---
'svelte': patch
---

Fix: {@const} inside {#each} now correctly updates when prop-derived value is used only in array callbacks like .find(), .filter(), .some()

Fixes issue #17992 where prop-derived {@const} declarations would become stale in legacy mode when the prop was only referenced inside a callback closure.
