---
title: The class directive
---

Like any other attribute, you can specify classes with a JavaScript attribute, seen here:

```html
<button
	class="{current === 'foo' ? 'active' : ''}"
	on:click="{() => current = 'foo'}"
>foo</button>
```

This is such a common pattern in UI development that Svelte includes a special directive to simplify it:

```html
<button
	class:active="{current === 'foo'}"
	on:click="{() => current = 'foo'}"
>foo</button>
```

The `active` class is added to the element whenever the value of the expression is truthy, and removed when it's falsy.