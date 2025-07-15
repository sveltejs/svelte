---
title: await
---

As of Svelte 5.36, you can use the `await` keyword inside your components in three places where it was previously unavailable:

- at the top level of your component's `<script>`
- inside `$derived(...)` declarations
- inside your markup

This feature is currently experimental, and you must opt in by adding the `experimental.async` option wherever you [configure](https://svelte.dev/docs/kit/configuration) Svelte, usually `svelte.config.js`:

```js
/// file: svelte.config.js
export default {
	compilerOptions: {
		experimenntal: {
			async: true
		}
	}
};
```

The experimental flag will be removed in Svelte 6.

## Boundaries

Currently, you can only use `await` inside a [`<svelte:boundary>`](svelte-boundary) with a `pending` snippet:

```svelte
<svelte:boundary>
	<MyApp />

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
```

This restriction will be lifted once Svelte supports asynchronous server-side rendering.

> In the [playground](/playground), your app is rendered inside a boundary with an empty pending snippet, so that you can use `await` without having to create one.

## Synchronized updates

TODO

## Caveats

TODO

## Breaking changes

TODO
