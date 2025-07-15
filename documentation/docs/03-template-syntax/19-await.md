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

When an `await` expression depends on a particular piece of state, changes to that state will not be reflected in the UI until the asynchronous work has completed, so that the UI is not left in an inconsistent state. In other words, in an example like [this](/playground/untitled#H4sIAAAAAAAAE42QsWrDQBBEf2VZUkhYRE4gjSwJ0qVMkS6XYk9awcFpJe5Wdoy4fw-ycdykSPt2dpiZFYVGxgrf2PsJTlPwPWTcO-U-xwIH5zli9bminudNtwEsbl-v8_wYj-x1Y5Yi_8W7SZRFI1ZYxy64WVsjRj0rEDTwEJWUs6f8cKP2Tp8vVIxSPEsHwyKdukmA-j6jAmwO63Y1SidyCsIneA_T6CJn2ZBD00Jk_XAjT4tmQwEv-32eH6AsgYK6wXWOPPTs6Xy1CaxLECDYgb3kSUbq8p5aaifzorCt0RiUZbQcDIJ10ldH8gs3K6X2Xzqbro5zu1KCHaw2QQPrtclvwVSXc2sEC1T-Vqw0LJy-ClRy_uSkx2ogHzn9ADZ1CubKAQAA)...

```svelte
<script>
	let a = $state(1);
	let b = $state(2);

	async function add(a, b) {
		await new Promise((f) => setTimeout(f, 500)); // artificial delay
		return a + b;
	}
</script>

<input type="number" bind:value={a}>
<input type="number" bind:value={b}>

<p>{a} + {b} = {await add(a, b)}</p>
```

...if you increment `a`, the contents of the `<p>` will _not_ immediately update to read `2 + 2 = 3` — instead, the text will update when `add(a, b)` resolves.

## Concurrency

TODO

## Error handling

Errors in `await` expressions will bubble to the nearest [error boundary](svelte-boundary).

## Caveats

TODO

## Breaking changes

TODO
