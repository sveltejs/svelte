---
'svelte': patch
---

fix: ensure undefined attributes are removed during hydration

Attributes set server-side but undefined on the client should be removed during hydration.
This ensures expected cleanup behavior and resolves a mismatch between SSR and client-side rendering.

Fixes sveltejs/kit#13890
