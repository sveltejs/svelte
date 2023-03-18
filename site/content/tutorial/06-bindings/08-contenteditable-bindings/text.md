---
title: Contenteditable bindings
---

Elements with a `contenteditable="true"` attribute support `textContent` and `innerHTML` bindings:

```svelte
<div
	contenteditable="true"
	bind:innerHTML={html}
></div>
```
