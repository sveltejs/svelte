---
title: Textarea inputs
---
Similar to the text input in Svelte, a two-way binding will allow the user to update the value variable when information is updated in the textarea in the DOM. Try typing in the textarea, and then use 'bind:value':

```html
<textarea bind:value={value}></textarea>
```

In cases like these, where the names match, we can also use a shorthand form:

```html
<textarea bind:value></textarea>
```

This applies to all bindings, not just textareas.
