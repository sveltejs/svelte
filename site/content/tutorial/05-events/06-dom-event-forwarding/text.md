---
title: DOM event forwarding
---

Event forwarding works for DOM events too.

We want to get notified of clicks on our `<FancyButton>` — to do that, we just need to forward `click` events on the `<button>` element in `FancyButton.svelte`:

```html
<button on:click>
	Click me
</button>
```