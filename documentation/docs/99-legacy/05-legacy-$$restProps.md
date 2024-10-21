---
title: $$restProps
---

`$$restProps` contains only the props which are _not_ declared with `export`. It can be used to pass down other unknown attributes to an element in a component. It shares the same performance characteristics compared to specific property access as `$$props`.

```svelte
<input {...$$restProps} />
```

> [!NOTE]
> In Svelte 5+, this concept is unnecessary as you can use [`let { foo, ...rest } = $props()`]($props) instead
