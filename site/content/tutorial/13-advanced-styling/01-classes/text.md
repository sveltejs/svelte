---
title: The class directive
---

Like any other attribute, you can specify classes with a JavaScript attribute, seen here:

<!-- prettier-ignore -->
```svelte
<button
	class={current === 'foo' ? 'selected' : ''}
	on:click={() => current = 'foo'}
>foo</button>
```

This is such a common pattern in UI development that Svelte includes a special directive to simplify it:

<!-- prettier-ignore -->
```svelte
<button
	class:selected={current === 'foo'}
	on:click={() => current = 'foo'}
>foo</button>
```

The `selected` class is added to the element whenever the value of the expression is truthy, and removed when it's falsy.
