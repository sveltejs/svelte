---
'svelte': patch
---

fix: render `defaultValue`/`defaultChecked` as SSR-visible `value`/`checked` on `<input>`, and `defaultValue` as text content on `<textarea>`
