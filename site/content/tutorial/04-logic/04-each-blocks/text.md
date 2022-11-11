---
title: Each blocks
---

If you need to loop over lists of data, use an `each` block:

```html
<ul>
	{#each cats as cat}
		<li><a target="_blank" href="https://www.youtube.com/watch?v={cat.id}" rel="noreferrer">
			{cat.name}
		</a></li>
	{/each}
</ul>
```

> The expression (`cats`, in this case) can be any array or array-like object (i.e. it has a `length` property). You can loop over generic iterables with `each [...iterable]`.

You can get the current *index* as a second argument, like so:

```html
{#each cats as cat, i}
	<li><a target="_blank" href="https://www.youtube.com/watch?v={cat.id}" rel="noreferrer">
		{i + 1}: {cat.name}
	</a></li>
{/each}
```

If you prefer, you can use destructuring — `each cats as { id, name }` — and replace `cat.id` and `cat.name` with `id` and `name`.
