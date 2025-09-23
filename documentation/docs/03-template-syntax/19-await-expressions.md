---
title: await
---

As of Svelte 5.36, you can use the `await` keyword inside your components in three places where it was previously unavailable:

- at the top level of your component's `<script>`
- inside `$derived(...)` declarations
- inside your markup

This feature is currently experimental, and you must opt in by adding the `experimental.async` option wherever you [configure](/docs/kit/configuration) Svelte, usually `svelte.config.js`:

```js
/// file: svelte.config.js
export default {
	compilerOptions: {
		experimental: {
			async: true
		}
	}
};
```

The experimental flag will be removed in Svelte 6.

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

...if you increment `a`, the contents of the `<p>` will _not_ immediately update to read this —

```html
<p>2 + 2 = 3</p>
```

— instead, the text will update to `2 + 2 = 4` when `add(a, b)` resolves.

Updates can overlap — a fast update will be reflected in the UI while an earlier slow update is still ongoing.

## Concurrency

Svelte will do as much asynchronous work as it can in parallel. For example if you have two `await` expressions in your markup...

```svelte
<p>{await one()}</p>
<p>{await two()}</p>
```

...both functions will run at the same time, as they are independent expressions, even though they are _visually_ sequential.

This does not apply to sequential `await` expressions inside your `<script>` or inside async functions — these run like any other asynchronous JavaScript. An exception is that independent `$derived` expressions will update independently, even though they will run sequentially when they are first created:

```js
async function one() { return 1; }
async function two() { return 2; }
// ---cut---
// these will run sequentially the first time,
// but will update independently
let a = $derived(await one());
let b = $derived(await two());
```

> [!NOTE] If you write code like this, expect Svelte to give you an [`await_waterfall`](runtime-warnings#Client-warnings-await_waterfall) warning

## Indicating loading states

To render placeholder UI, you can wrap content in a `<svelte:boundary>` with a [`pending`](svelte-boundary#Properties-pending) snippet. This will be shown when the boundary is first created, but not for subsequent updates, which are globally coordinated.

After the contents of a boundary have resolved for the first time and replaced the `pending` snippet, you can detect subsequent async work with [`$effect.pending()`]($effect#$effect.pending). This is what you would use display a "we're asynchronously validating your input" spinner next to a form field, for example.

You can also use [`settled()`](svelte#settled) to get a promise that resolves when the current update is complete:

```js
let color = 'red';
let answer = -1;
let updating = false;
// ---cut---
import { tick, settled } from 'svelte';

async function onclick() {
	updating = true;

	// without this, the change to `updating` will be
	// grouped with the other changes, meaning it
	// won't be reflected in the UI
	await tick();

	color = 'octarine';
	answer = 42;

	await settled();

	// any updates affected by `color` or `answer`
	// have now been applied
	updating = false;
}
```

## Error handling

Errors in `await` expressions will bubble to the nearest [error boundary](svelte-boundary).

## Server-side rendering

Svelte supports asynchronous server-side rendering (SSR) with the `render(...)` API. To use it, simply await the return value:

```js
/// file: server.js
import { render } from 'svelte/server';
import App from './App.svelte';

const { head, body } = +++await+++ render(App);
```

> [!NOTE] If you're using a framework like SvelteKit, this is done on your behalf.

If a `<svelte:boundary>` with a `pending` snippet is encountered during SSR, that snippet will be rendered while the rest of the content is ignored. All `await` expressions encountered outside boundaries with `pending` snippets will resolve and render their contents prior to `await render(...)` returning.

> [!NOTE] In the future, we plan to add a streaming implementation that renders the content in the background.

## Caveats

As an experimental feature, the details of how `await` is handled (and related APIs like `$effect.pending()`) are subject to breaking changes outside of a semver major release, though we intend to keep such changes to a bare minimum.

Currently, server-side rendering is synchronous. If a `<svelte:boundary>` with a `pending` snippet is encountered during SSR, only the `pending` snippet will be rendered.

## Breaking changes

Effects run in a slightly different order when the `experimental.async` option is `true`. Specifically, _block_ effects like `{#if ...}` and `{#each ...}` now run before an `$effect.pre` or `beforeUpdate` in the same component, which means that in [very rare situations](/playground/untitled?#H4sIAAAAAAAAE22R3VLDIBCFX2WLvUhnTHsf0zre-Q7WmfwtFV2BgU1rJ5N3F0jaOuoVcPbw7VkYhK4_URTiGYkMnIyjDjLsFGO3EvdCKkIvipdB8NlGXxSCPt96snbtj0gctab2-J_eGs2oOWBE6VunLO_2es-EDKZ5x5ZhC0vPNWM2gHXGouNzAex6hHH1cPHil_Lsb95YT9VQX6KUAbS2DrNsBdsdDFHe8_XSYjH1SrhELTe3MLpsemajweiWVPuxHSbKNd-8eQTdE0EBf4OOaSg2hwNhhE_ABB_ulJzjj9FULvIcqgm5vnAqUB7wWFMfhuugQWkcAr8hVD-mq8D12kOep24J_IszToOXdveGDsuNnZwbJUNlXsKnhJdhUcTo42s41YpOSneikDV5HL8BktM6yRcCAAA=) it is possible to update a block that should no longer exist, but only if you update state inside an effect, [which you should avoid]($effect#When-not-to-use-$effect).
