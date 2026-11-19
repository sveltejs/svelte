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

When an `await` expression depends on a particular piece of state, changes to that state will not be reflected in the UI until the asynchronous work has completed, so that the UI is not left in an inconsistent state. In other words, in an example like this...

<!-- codeblock:start {"title":"Synchronized updates"} -->
```svelte
<!--- file: App.svelte --->
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
<!-- codeblock:end -->

...if you increment `a`, the contents of the `<p>` will _not_ immediately update to read this —

```html
<p>2 + 2 = 3</p>
```

— instead, the text will update to `2 + 2 = 4` when `add(a, b)` resolves.

Updates can overlap — a fast update will be reflected in the UI while an earlier slow update is still ongoing.

## Concurrency

Svelte will do as much asynchronous work as it can in parallel. For example if you have two `await` expressions in your markup...

```svelte
<p>{await one(x)}</p>
<p>{await two(y)}</p>
```

...both functions will run at the same time, as they are independent expressions, even though they are _visually_ sequential.

This also applies to `$derived(await ...)` expressions inside your `<script>`: each one is created as soon as everything it depends on is available, even if other statements come before it. In the following example, `a` and `b` are created at the same time, so that they run in parallel, while `c` is only created once `b` resolves:

```js
/** @param {number} x */
async function one(x) { return x; }
/** @param {number} y */
async function two(y) { return y; }
/** @param {number} z */
async function three(z) { return z; }
let x = $state(1);
let y = $state(2);
// ---cut---
// `a` and `b` are created at the same time,
// even though there is a statement in between...
let a = $derived(await one(x));
let doubled = $derived(a * 2);
let b = $derived(await two(y));
// ...but `c` has to wait for `b`, because it depends on it.
// Once created they will all update independently,
// even if `x` and `y` update simultaneously.
let c = $derived(await three(b + x));
```

This does not apply to other `await` expressions inside your `<script>` or inside async functions — these run like any other asynchronous JavaScript. They don't hold up `$derived(await ...)` expressions that don't depend on them, however:

```js
/** @param {number} x */
async function one(x) { return x; }
/** @param {number} y */
async function two(y) { return y; }
let x = $state(1);
let y = $state(2);
// ---cut---
let a = await one(x);

// `b` does not depend on `a`, so it is created right away,
// and `two(y)` runs in parallel with `one(x)`
let b = $derived(await two(y));

// `c` depends on `a`, so it is only created once `a` has resolved
let c = $derived(await two(a));
```

For this reason, `$derived` expressions must be pure — they must not have side effects, nor rely on side effects of earlier statements that they don't reference. In this example, `getUser()` may run before `connect()` has finished:

```js
// @filename: db.js
export async function connect() {}
export async function getUser() { return { name: 'Bob' }; }

// @filename: index.js
// ---cut---
import { connect, getUser } from './db.js';

await connect();
let user = $derived(await getUser());
```

To make sure that the connection is established first, either pass it to the function that needs it...

```js
// @filename: db.js
export async function connect() { return {}; }
/** @param {{}} connection */
export async function getUser(connection) { return { name: 'Bob' }; }

// @filename: index.js
// ---cut---
import { connect, getUser } from './db.js';

const connection = await connect();
let user = $derived(await getUser(connection));
```

...or, if it only needs to happen once, use a top-level `await` in the module that provides `getUser` (or in a module it imports), so that it has finished before your component is even loaded.

## Indicating loading states

To render placeholder UI, you can wrap content in a `<svelte:boundary>` with a [`pending`](svelte-boundary#Properties-pending) snippet. This will be shown when the boundary is first created, but not for subsequent updates, which are globally coordinated.

After the contents of a boundary have resolved for the first time and have replaced the `pending` snippet, you can detect subsequent async work with [`$effect.pending()`]($effect#$effect.pending). This is what you would use to display a "we're asynchronously validating your input" spinner next to a form field, for example.

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

## Forking

The [`fork(...)`](svelte#fork) API, added in 5.42, makes it possible to run `await` expressions that you _expect_ to happen in the near future. This is mainly intended for frameworks like SvelteKit to implement preloading when (for example) users signal an intent to navigate.

```svelte
<script>
	import { fork } from 'svelte';
	import Menu from './Menu.svelte';

	let open = $state(false);

	/** @type {import('svelte').Fork | null} */
	let pending = null;

	function preload() {
		pending ??= fork(() => {
			open = true;
		});
	}

	function discard() {
		pending?.discard();
		pending = null;
	}
</script>

<button
	onfocusin={preload}
	onfocusout={discard}
	onpointerenter={preload}
	onpointerleave={discard}
	onclick={() => {
		pending?.commit();
		pending = null;

		// in case `pending` didn't exist
		// (if it did, this is a no-op)
		open = true;
	}}
>open menu</button>

{#if open}
	<!-- any async work inside this component will start
	     as soon as the fork is created -->
	<Menu onclose={() => open = false} />
{/if}
```

## Caveats

As an experimental feature, the details of how `await` is handled (and related APIs like `$effect.pending()`) are subject to breaking changes outside of a semver major release, though we intend to keep such changes to a bare minimum.

## Breaking changes

Effects run in a slightly different order when the `experimental.async` option is `true`. Specifically, _block_ effects like `{#if ...}` and `{#each ...}` now run before an `$effect.pre` or `beforeUpdate` in the same component, which means that in [very rare situations](/playground/untitled?#H4sIAAAAAAAAE22R3VLDIBCFX2WLvUhnTHsf0zre-Q7WmfwtFV2BgU1rJ5N3F0jaOuoVcPbw7VkYhK4_URTiGYkMnIyjDjLsFGO3EvdCKkIvipdB8NlGXxSCPt96snbtj0gctab2-J_eGs2oOWBE6VunLO_2es-EDKZ5x5ZhC0vPNWM2gHXGouNzAex6hHH1cPHil_Lsb95YT9VQX6KUAbS2DrNsBdsdDFHe8_XSYjH1SrhELTe3MLpsemajweiWVPuxHSbKNd-8eQTdE0EBf4OOaSg2hwNhhE_ABB_ulJzjj9FULvIcqgm5vnAqUB7wWFMfhuugQWkcAr8hVD-mq8D12kOep24J_IszToOXdveGDsuNnZwbJUNlXsKnhJdhUcTo42s41YpOSneikDV5HL8BktM6yRcCAAA=) it is possible to update a block that should no longer exist, but only if you update state inside an effect, [which you should avoid]($effect#When-not-to-use-$effect).
