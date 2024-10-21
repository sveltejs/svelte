---
title: $$props
---

`$$props` references all props that are passed to a component, including ones that are not declared with `export`. Using `$$props` will not perform as well as references to a specific prop because changes to any prop will cause Svelte to recheck all usages of `$$props`. But it can be useful in some cases – for example, when you don't know at compile time what props might be passed to a component.

```svelte
<Widget {...$$props} />
```

> [!NOTE]
> In Svelte 5+, this concept is unnecessary as you can use [`let prop = $props()`]($props) instead
