---
title: In and out
---

Instead of the `transition` directive, an element can have an `in` or an `out` directive, or both together:

```html
<p in:fly="{{ y: 200, duration: 2000 }}" out:fade>
	Flies in, fades out
</p>
```

In this case, the transitions are *not* reversed.