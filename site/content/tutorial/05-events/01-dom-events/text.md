---
title: DOM events
---

As we briefly saw in an [earlier chapter](tutorial/reactive-assignments), you can listen to any event on an element with the `on:` directive:

```html
<div on:mousemove={handleMousemove}>
	The mouse position is {m.x} x {m.y}
</div>
```