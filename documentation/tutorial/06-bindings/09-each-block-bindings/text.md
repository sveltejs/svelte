---
title: Each block bindings
---

You can even bind to properties inside an `each` block.

```svelte
{#each todos as todo}
	<div class:done={todo.done}>
		<input type="checkbox" bind:checked={todo.done} />

		<input placeholder="What needs to be done?" bind:value={todo.text} />
	</div>
{/each}
```

> Note that interacting with these `<input>` elements will mutate the array. If you prefer to work with immutable data, you should avoid these bindings and use event handlers instead.
