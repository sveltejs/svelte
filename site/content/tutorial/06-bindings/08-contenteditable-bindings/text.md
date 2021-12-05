---
title: Contenteditable bindings
---

Elements with a `contenteditable="true"` attribute support `textContent` and `innerHTML` bindings:

```html
<div
	contenteditable="true"
	bind:innerHTML={html}
></div>
```