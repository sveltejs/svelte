---
title: Spread props
---

If you have an object of properties, you can 'spread' them onto a component instead of specifying each one:

```svelte
<Info {...pkg} />
```

> Conversely, if you need to reference all the props that were passed into a component, including ones that weren't declared with `export`, you can do so by accessing `$$props` directly. It's not generally recommended, as it's difficult for Svelte to optimise, but it's useful in rare cases.
