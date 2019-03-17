---
title: Textarea inputs
---

The `<textarea>` element behaves similarly to a text input in Svelte — use `bind:value`:

```html
<textarea bind:value={value}></textarea>
```

In cases like these, where the names match, we can also use a shorthand form:

```html
<textarea bind:value></textarea>
```

This applies to all bindings, not just textareas.