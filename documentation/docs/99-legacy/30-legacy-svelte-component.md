---
title: <svelte:component>
---

In runes mode, `<MyComponent>` will re-render if the value of `MyComponent` changes. See the [Svelte 5 migration guide](/docs/svelte/v5-migration-guide#svelte:component-is-no-longer-necessary) for an example.

In legacy mode, it won't — we must use `<svelte:component>`, which destroys and recreates the component instance when the value of its `this` expression changes:

```svelte
<svelte:component this={MyComponent} />
```

If `this` is falsy, no component is rendered.
