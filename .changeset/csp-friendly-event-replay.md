---
'svelte': patch
---

fix: avoid inline event handlers for hydration event replay under `csp`

When `render({ csp })` is set, the inline `onload="this.__e=event"` attribute (ref #11642) is replaced with a single capturing listener injected into `<head>`. The script's sha256 is added to `result.hashes.script`. 
Closes #14014.
