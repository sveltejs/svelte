---
title: Imports
---

As well as runes, Svelte 5 introduces a handful of new things you can import, alongside existing ones like `getContext`, `setContext` and `tick`.

## `svelte`

### `mount`

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

### `hydrate`

Like `mount`, but will reuse up any HTML rendered by Svelte's SSR output (from the [`render`](#svelte-server-render) function) inside the target and make it interactive:

```js
// @errors: 2322
import { hydrate } from 'svelte';
import App from './App.svelte';

const app = hydrate(App, {
	target: document.querySelector('#app'),
	props: { some: 'property' }
});
```

### `unmount`

Unmounts a component created with [`mount`](#svelte-mount) or [`hydrate`](#svelte-hydrate):

```js
// @errors: 1109
import { mount, unmount } from 'svelte';
import App from './App.svelte';

const app = mount(App, {...});

// later
unmount(app);
```

### `untrack`

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

## `svelte/reactivity`

Svelte provides reactive `Map`, `Set`, `Date` and `URL` classes. These can be imported from `svelte/reactivity` and used just like their native counterparts. [Demo:](https://svelte-5-preview.vercel.app/#H4sIAAAAAAAAE32QzWrDMBCEX2Wri1uo7bvrBHrvqdBTUogqryuBfhZp5SQYv3slSsmpOc7uN8zsrmI2FpMYDqvw0qEYxCuReBZ8pSrSgpax6BRyVHUyJhUN8f7oj2wchciwwsf7G2wwx-Cg-bX0EaVisxi-Ni-FLbQKPjHkaGEHHs_V9NhoZkpD3-NFOrLYqeB6kqybp-Ia-1uYHx_aFpSW_hsTcADWmLDrOmjbsh-Np8zwZfw0LNJm3K0lqaMYOKhgt_8RHRLX0-8gtdAfUiAdb4XOxlrINElGOOmI8wmkn2AxCmHBmOTdetWw7ct7XZjMbHASA8eM2-f2A-JarmyZAQAA)

```svelte
<script>
	import { URL } from 'svelte/reactivity';

	const url = new URL('https://example.com/path');
</script>

<!-- changes to these... -->
<input bind:value={url.protocol} />
<input bind:value={url.hostname} />
<input bind:value={url.pathname} />

<hr />

<!-- will update `href` and vice versa -->
<input bind:value={url.href} />
```

## `svelte/server`

### `render`

Only available on the server and when compiling with the `server` option. Takes a component and returns an object with `html` and `head` properties on it, which you can use to populate the HTML when server-rendering your app:

```js
// @errors: 2724 2305 2307
import { render } from 'svelte/server';
import App from './App.svelte';

const result = render(App, {
	props: { some: 'property' }
});
```
