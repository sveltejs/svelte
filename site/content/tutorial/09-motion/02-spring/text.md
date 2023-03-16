---
title: Spring
---

The `spring` function is an alternative to `tweened` that often works better for values that are frequently changing.

In this example we have two stores — one representing the circle's coordinates, and one representing its size. Let's convert them to springs:

```html
<script>
	import { spring } from 'svelte/motion';

	let coords = spring({ x: 50, y: 50 });
	let size = spring(10);
</script>
```

Both springs have default `stiffness` and `damping` values, which control the spring's, well... springiness. We can specify our own initial values:

```js
let coords = spring({ x: 50, y: 50 }, {
	stiffness: 0.1,
	damping: 0.25
});
```

Waggle your mouse around, and try dragging the sliders to get a feel for how they affect the spring's behaviour. Notice that you can adjust the values while the spring is still in motion.

Consult the [API reference](/docs#run-time-svelte-motion-spring) for more information.
