---
title: Textarea inputs
---

The `<textarea>` element behaves similarly to a text input in Svelte — use `bind:value` to create a two-way binding between the `<textarea>` content and the `value` variable:

<!-- prettier-ignore -->
```svelte
<textarea bind:value={value} />
```

In cases like these, where the names match, we can also use a shorthand form:

```svelte
<textarea bind:value />
```

This applies to all bindings, not just textareas.
