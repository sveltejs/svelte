---
title: Dimensions
---

Every block-level element has `clientWidth`, `clientHeight`, `offsetWidth` and `offsetHeight` bindings:

```svelte
<div bind:clientWidth={w} bind:clientHeight={h}>
	<span style="font-size: {size}px">{text}</span>
</div>
```

These bindings are readonly — changing the values of `w` and `h` won't have any effect.

> Elements are measured using a technique similar to [this one](http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/). There is some overhead involved, so it's not recommended to use this for large numbers of elements.
>
> `display: inline` elements cannot be measured with this approach; nor can elements that can't contain other elements (such as `<canvas>`). In these cases you will need to measure a wrapper element instead.
