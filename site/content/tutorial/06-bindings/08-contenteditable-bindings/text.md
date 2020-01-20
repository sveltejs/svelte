---
title: Contenteditable bindings
---

Elements with the `contenteditable` attribute support the following bindings:
- [`innerHTML`](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML)
- [`innerText`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText)
- [`textContent`](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent)

There are slight differences between each of these, read more about them [here](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent#Differences_from_innerText).

```html
<div
	contenteditable="true"
	bind:innerHTML={html}
></div>
```
