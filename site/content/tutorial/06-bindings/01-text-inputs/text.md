---
title: Text inputs
---

As a general rule, data flow in Svelte is *top down* — a parent component can set props on a child component, and a component can set attributes on an element, but not the other way around.

Sometimes it's useful to break that rule. Take the case of the `<input>` element in this component — we *could* add an `on:input` event handler that set the value of `name` to `event.target.value`, but it's a bit... boilerplatey. It gets even worse with other form elements, as we'll see.

Instead, we can use the `bind:value` directive:

```html
<input bind:value={name}>
```

This means that not only will changes to the value of `name` update the input value, but changes to the input value will update `name`.
