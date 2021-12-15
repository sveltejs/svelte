---
title: Select bindings
---

We can also use `bind:value` with `<select>` elements. Update line 20:

```html
<select bind:value={selected} on:change="{() => answer = ''}">
```

Note that the `<option>` values are objects rather than strings. Svelte doesn't mind.

> Because we haven't set an initial value of `selected`, the binding will set it to the default value (the first in the list) automatically. Be careful though — until the binding is initialised, `selected` remains undefined, so we can't blindly reference e.g. `selected.id` in the template.
