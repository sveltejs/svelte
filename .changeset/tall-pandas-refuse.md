---
'svelte': patch
---

fix: remove `<svelte:head>` anchor on teardown instead of leaking one text node in `document.head` per mount
