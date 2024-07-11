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

```svelte
<!--- copy: false  --->
{#await expression}...{:then name}...{:catch name}...{/await}
```

```svelte
<!--- copy: false  --->
{#await expression}...{:then name}...{/await}
```

```svelte
<!--- copy: false  --->
{#await expression then name}...{/await}
```

```svelte
<!--- copy: false  --->
{#await expression catch name}...{/await}
```

Await blocks allow you to branch on the three possible states of a Promise — pending, fulfilled or rejected.
In SSR mode, only the pending branch will be rendered on the server.
If the provided expression is not a Promise only the fulfilled branch will be rendered, including in SSR mode.

```svelte
{#await promise}
	<!-- promise is pending -->
	<p>waiting for the promise to resolve...</p>
{:then value}
	<!-- promise was fulfilled or not a Promise -->
	<p>The value is {value}</p>
{:catch error}
	<!-- promise was rejected -->
	<p>Something went wrong: {error.message}</p>
{/await}
```

The `catch` block can be omitted if you don't need to render anything when the promise rejects (or no error is possible).

```svelte
{#await promise}
	<!-- promise is pending -->
	<p>waiting for the promise to resolve...</p>
{:then value}
	<!-- promise was fulfilled -->
	<p>The value is {value}</p>
{/await}
```

If you don't care about the pending state, you can also omit the initial block.

```svelte
{#await promise then value}
	<p>The value is {value}</p>
{/await}
```

Similarly, if you only want to show the error state, you can omit the `then` block.

```svelte
{#await promise catch error}
	<p>The error is {error}</p>
{/await}
```

## SvelteKit loaders

Fetching inside your components is great for simple use cases, but it's prone to data loading waterfalls and makes code harder to work with because of the promise handling. SvelteKit solves this problem by providing a opinionated data loading story that is coupled to its router. Learn more about it [in the docs](/docs/kit).
