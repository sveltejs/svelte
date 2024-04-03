---
title: Functions
---

As well as runes, Svelte 5 will introduce a couple of new functions, in addition to existing functions like `getContext`, `setContext` and `tick`. These are introduced as functions rather than runes because they are used directly and the compiler does not need to touch them to make them function as it does with runes. However, these functions may still use Svelte internals.

## `untrack`

To prevent something from being treated as an `$effect`/`$derived` dependency, use `untrack`:

```svelte
<script>
	import { untrack } from 'svelte';

	let { a, b } = $props();

	$effect(() => {
		// this will run when `a` changes,
		// but not when `b` changes
		console.log(a);
		console.log(untrack(() => b));
	});
</script>
```

## `unstate`

To remove reactivity from objects and arrays created with `$state`, use `unstate`:

```svelte
<script>
	import { unstate } from 'svelte';

	let counter = $state({ count: 0 });

	$effect(() => {
		// Will log { count: 0 }
		console.log(unstate(counter));
	});
</script>
```

This is handy when you want to pass some state to an external library or API that doesn't expect a reactive object – such as `structuredClone`.

> Note that `unstate` will return a new object from the input when removing reactivity. If the object passed isn't reactive, it will be returned as is.

## `mount`

Instantiates a component and mounts it to the given target:

```js
// @errors: 2322
import { mount } from 'svelte';
import App from './App.svelte';

const app = mount(App, {
	target: document.querySelector('#app'),
	props: { some: 'property' }
});
```

## `hydrate`

Like `mount`, but will pick up any HTML rendered by Svelte's SSR output (from the `render` function) inside the target and make it interactive:

```js
// @errors: 2322
import { hydrate } from 'svelte';
import App from './App.svelte';

const app = hydrate(App, {
	target: document.querySelector('#app'),
	props: { some: 'property' }
});
```

## `render`

Only available on the server and when compiling with the `server` option. Takes a component and returns an object with `html` and `head` properties on it, which you can use to populate the HTML when server-rendering your app:

```js
// @errors: 2724 2305 2307
import { render } from 'svelte/server';
import App from './App.svelte';

const result = render(App, {
	props: { some: 'property' }
});
```
