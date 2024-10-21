---
title: <svelte:component>
---

```svelte
<svelte:component this={expression} />
```

The `<svelte:component>` element renders a component dynamically, using the component constructor specified as the `this` property. When the property changes, the component is destroyed and recreated.

If `this` is falsy, no component is rendered.

```svelte
<svelte:component this={currentSelection.component} foo={bar} />
```

> [!NOTE]
> In Svelte 5+, this concept is obsolete, as you can just reference `$state` or `$derived` variables containing components
> ```svelte
> <script>
>     let Component = $derived(currentSelection.component);
> </script>
> 
> <Component />
> <!-- or -->
> <currentSelection.component foo={bar} />
> ```
