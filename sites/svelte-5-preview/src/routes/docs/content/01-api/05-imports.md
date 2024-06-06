---
title: Imports
---

As well as runes, Svelte 5 introduces a handful of new things you can import, alongside existing ones like `getContext`, `setContext` and `tick`.

## `svelte`

### `flushSync`

Forces any pending effects (including DOM updates) to be applied immediately, rather than in the future. This is mainly useful in a testing context — you'll rarely need it in application code.

```svelte
<script>
	import { flushSync } from 'svelte';

	let count = $state(0);
	let element;

	function onclick() {
		flushSync(() => (count += 1));

		// without `flushSync`, the DOM would be updated in the future
		console.log(element.textContent === String(count));
	}
</script>

<span bind:this={element}>{count}</span>
<button {onclick}>update</button>
```

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

## `svelte/events`

Where possible, event handlers added with [attributes like `onclick`](/docs/event-handlers) use a technique called _event delegation_. It works by creating a single handler for each event type on the root DOM element, rather than creating a handler for each element, resulting in better performance and memory usage.

Delegated event handlers run after other event handlers. In other words, a handler added programmatically with [`addEventListener`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) will run _before_ a handler added declaratively with `onclick`, regardless of their relative position in the DOM ([demo](/#H4sIAAAAAAAAE41Sy2rDMBD8lUUXJxDiu-sYeugt_YK6h8RaN6LyykgrQzH6965shxJooQc_RhrNzA6aVW8sBlW9zYouA6pKPY-jOij-GjMIE1pGwcFF3-WVOnTejNy01LIZRucZZnD06iIxJOi9G6BYjxVPmZQfiwzaTBkL2ti73R5ODcwLiftIHRtHcLuQtuhlc9tpuSyBbyZAuLloNfhIELBzpO8E-Q_O4tG6j13hIqO_y0BvPOpiv0bhtJ1Y3pLoeNH6ZULiswmMJLZFZ033WRzuAvstdMseOXqCh9SriMfBTfgPnZxg-aYM6_KnS6pFCK6GdJVHPc0C01JyfY0slUnHi-JpfgjwSzUycdgmfOjFEP3RS1qdhJ8dYMDFt1yNmxxU0jRyCwanTW9Qq4p9xPSevgHI3m43QAIAAA==)). It also means that calling `event.stopPropagation()` inside a declarative handler _won't_ prevent the programmatic handler (created inside an action, for example) from running.

To preserve the relative order, use `on` rather than `addEventListener` ([demo](/#H4sIAAAAAAAAE3VRy26DMBD8lZUvECkqdwpI_YB-QdJDgpfGqlkjex2pQv73rnmoStQeMB52dnZmmdVgLAZVn2ZFlxFVrd6mSR0Vf08ZhDtaRsHBRd_nL03ovZm4O9OZzTg5zzCDo3cXiSHB4N0IxdpWvD6RnuoV3pE4rLT8WGTQ5p6xoE20LA_QdjAvJB4i9WxE6nYhbdFLcaucuaqAbyZAuLloNfhIELB3pHeC3IOz-GLdZ1m4yOh3GRiMR10cViucto7l9MjRk9gvxdsRit6a_qs47q1rT8qvpvpdDjXChqshXWdT7SwwLVtrrpElnAguSu38EPCPEOItbF4eEhiifxKkdZLw8wQYcZlbrYO7bFTcdPJbR6fNYFCrmn3E9JF-AJZOg9MRAgAA)):

```js
// @filename: index.ts
const element: Element = null as any;
// ---cut---
import { on } from 'svelte/events';

const off = on(element, 'click', () => {
	console.log('element was clicked');
});

// later, if we need to remove the event listener:
off();
```

`on` also accepts an optional fourth argument which matches the options argument for `addEventListener`.

## `svelte/server`

### `render`

Only available on the server and when compiling with the `server` option. Takes a component and returns an object with `body` and `head` properties on it, which you can use to populate the HTML when server-rendering your app:

```js
// @errors: 2724 2305 2307
import { render } from 'svelte/server';
import App from './App.svelte';

const result = render(App, {
	props: { some: 'property' }
});
```

## `svelte/elements`

Svelte provides built-in [DOM types](https://github.com/sveltejs/svelte/blob/master/packages/svelte/elements.d.ts). A common use case for DOM types is forwarding props to an HTML element. To properly type your props and get full intellisense, your props interface should extend the attributes type for your HTML element:

```svelte
<script lang="ts">
	import { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		username: string;
	}

	let { username, ...rest }: Props = $props();
</script>

<div {...rest}>
	Hi, {username}!
</div>
```

> You can use `ComponentProps<ImportedComponent>`, if you wish to forward props to a Svelte component.

Svelte provides a best-effort of all the HTML DOM types that exist. If an attribute is missing from our [type definitions](https://github.com/sveltejs/svelte/blob/master/packages/svelte/elements.d.ts), you are welcome to open an issue and/or a PR fixing it. For experimental attributes, you can augment the existing types locally by creating a `.d.ts` file:

```ts
import { HTMLButtonAttributes } from 'svelte/elements';

declare module 'svelte/elements' {
	export interface SvelteHTMLElements {
		'custom-button': HTMLButtonAttributes;
	}

	// allows for more granular control over what element to add the typings to
	export interface HTMLButtonAttributes {
		veryexperimentalattribute?: string;
	}
}

export {}; // ensure this is not an ambient module, else types will be overridden instead of augmented
```

The `.d.ts` file must be included in your `tsconfig.json` file. If you are using the standard `"include": ["src/**/*"]`, this just means the file should be placed in the `src` directory.
