---
title: <svelte:options>
---

Lastly, `<svelte:options>` allows you to specify compiler options.

Here, we have a component inside an `<svg>` element. Unless we tell Svelte otherwise, it will compile `Square.svelte` to a module that generates HTML nodes instead of SVG nodes. We can correct that by adding this to the top of `Square.svelte`:

```html
<svelte:options namespace="svg"/>
```

The options that can be set here are:

* `immutable={true}` — you never use mutable data, so the compiler can do simple referential equality checks to determine if values have changed
* `immutable={false}` — the default. Svelte will be more conservative about whether or not mutable objects have changed
* `accessors={true}` — adds getters and setters for the component's props
* `accessors={false}` — the default
* `namespace="..."` — the namespace where this component will be used, most commonly `"svg"`
* `tag="..."` — the name to use when compiling this component as a custom element

Consult the [API reference](docs) for more information on these options.