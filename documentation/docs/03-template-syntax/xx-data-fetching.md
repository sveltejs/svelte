---
title: Data fetching
---

Fetching data is a fundamental part of apps interacting with the outside world. Svelte is unopinionated with how you fetch your data. The simplest way would be using the built-in `fetch` method:

```svelte
<script>
	let response = $state();
	fetch('/api/data').then(async (r) => (response = r.json()));
</script>
```

While this works, it makes working with promises somewhat unergonomic. Svelte alleviates this problem using the `#await` block.

## {#await ...}

## SvelteKit loaders

Fetching inside your components is great for simple use cases, but it's prone to data loading waterfalls and makes code harder to work with because of the promise handling. SvelteKit solves this problem by providing a opinionated data loading story that is coupled to its router. Learn more about it [in the docs](../kit).
