---
title: DOM events
---

As we've briefly seen already, you can listen to any event on an element with the `on:` directive:

```svelte
<div on:mousemove={handleMousemove}>
	The mouse position is {m.x} x {m.y}
</div>
```
