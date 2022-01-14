---
title: Component bindings
---

Just as you can bind to properties of DOM elements, you can bind to component props. For example, we can bind to the `value` prop of this `<Keypad>` component as though it were a form element:

```html
<Keypad bind:value={pin} on:submit={handleSubmit}/>
```

Now, when the user interacts with the keypad, the value of `pin` in the parent component is immediately updated.

> Use component bindings sparingly. It can be difficult to track the flow of data around your application if you have too many of them, especially if there is no "single source of truth".
> 
> In this particular case, a better approach would be: the Keypad component could dispatch events for every numerical key, and it could be responsibility of the parent to concatenate the entire pin in a `let pin` variable, making it a single source of truth. This would make the Keypad component more generic and reusable.
