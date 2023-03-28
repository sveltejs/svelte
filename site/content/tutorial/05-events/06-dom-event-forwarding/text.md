---
title: DOM event forwarding
---

Event forwarding works for DOM events too.

We want to get notified of clicks on our `<CustomButton>` — to do that, we just need to forward `click` events on the `<button>` element in `CustomButton.svelte`:

```svelte
<button on:click> Click me </button>
```
