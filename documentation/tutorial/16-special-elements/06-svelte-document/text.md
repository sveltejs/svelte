---
title: <svelte:document>
---

Similar to `<svelte:window>`, the `<svelte:document>` element allows you to listen for events that fire on `document`. This is useful with events like `selectionchange`, which doesn't fire on `window`.

Add the `selectionchange` handler to the `<svelte:document>` tag:

```svelte
<svelte:document on:selectionchange={handleSelectionChange} />
```

> Avoid `mouseenter` and `mouseleave` handlers on this element, these events are not fired on `document` in all browsers. Use `<svelte:body>` for this instead.
