---
title: Run time
---


### Client-side component API

* `const component = new Component(options)`

---

A client-side component — that is, a component compiled with `generate: 'dom'` (or the `generate` option left unspecified) is a JavaScript class.

```js
import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
		// assuming App.svelte contains something like
		// `export let answer`:
		answer: 42
	}
});
```

The following initialisation options can be provided:

| option | default | description |
| --- | --- | --- |
| `target` | **none** | An `HTMLElement` to render to. This option is required
| `anchor` | `null` | A child of `target` to render the component immediately before
| `props` | `{}` | An object of proeprties to supply to the component
| `hydrate` | `false` | See below
| `intro` | `false` | If `true`, will play transitions on initial render, rather than waiting for subsequent state changes

Existing children of `target` are left where they are.


---

The `hydrate` option instructs Svelte to upgrade existing DOM (usually from server-side rendering) rather than creating new elements. It will only work if the component was compiled with the `hydratable: true` option.

Whereas children of `target` are normally left alone, `hydrate: true` will cause any children to be removed. For that reason, the `anchor` option cannot be used alongside `hydrate: true`.

The existing DOM doesn't need to match the component — Svelte will 'repair' the DOM as it goes.

```js
import App from './App.svelte';

const app = new App({
	target: document.querySelector('#server-rendered-html'),
	hydrate: true
});
```

* `component.$set(props)`

---

Programmatically sets props on an instance. `component.$set({ x: 1 })` is equivalent to `x = 1` inside the component's `<script>` block.

Calling this method schedules an update for the next microtask — the DOM is *not* updated synchronously.

```js
app.$set({ answer: 42 });
```

* `component.$on(event, callback)`

---

Causes the `callback` function to be called whenever the component dispatches an `event`.

```js
app.$on('selected', event => {
	console.log(event.detail.selection);
});
```


* `component.$destroy()`

Removes a component from the DOM and triggers any `onDestroy` handlers.


* `component.prop`
* `component.prop = value`

---

If a component is compiled with `accessors: true`, each instance will have getters and setters corresponding to each of the component's props. Setting a value will cause a *synchronous* update, rather than the default async update caused by `component.$set(...)`.

By default, `accessors` is `false`, unless you're compiling as a custom element.

```js
console.log(app.count);
app.count += 1;
```


### Custom element API

* TODO


### Server-side component API

* `const result = Component.render(...)`

---

Unlike client-side components, server-side components don't have a lifespan after you render them — their whole job is to create some HTML and CSS. For that reason, the API is somewhat different.

A server-side component exposes a `render` method that can be called with optional props. It returns an object with `head`, `html`, and `css` properties, where `head` contains the contents of any `<svelte:head>` elements encountered.

```js
const App = require('./App.svelte');

const { head, html, css } = App.render({
	answer: 42
});
```


### svelte

The `svelte` package exposes [lifecycle functions](tutorial/onmount) and the [context API](tutorial/context-api).

* `onMount(() => void)`
* `onMount(() => () => void)`

---

The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM. It must be called during the component's initialisation (but doesn't need to live *inside* the component; it can be called from an external module).

`onMount` does not run inside a server-side component.

```html
<script>
	import { onMount } from 'svelte';

	onMount(() => {
		console.log('the component has mounted');
	});
</script>
```

---

If a function is returned from `onMount`, it will be called when the component is unmounted.

```html
<script>
	import { onMount } from 'svelte';

	onMount(() => {
		const interval = setInterval(() => {
			console.log('beep');
		}, 1000);

		return () => clearInterval(interval);
	});
</script>
```

* `beforeUpdate(() => void)`

---

Schedules a callback to run immediately before the component is updated after any state change.

> The first time the callback runs will be before the initial `onMount`

```html
<script>
	import { beforeUpdate } from 'svelte';

	beforeUpdate(() => {
		console.log('the component is about to update');
	});
</script>
```

* `afterUpdate(() => void)`

---

Schedules a callback to run immediately after the component has been updated.

```html
<script>
	import { afterUpdate } from 'svelte';

	afterUpdate(() => {
		console.log('the component just updated');
	});
</script>
```

* `onDestroy(() => void)`

---

Schedules a callback to run once the component is unmounted.

Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the only one that runs inside a server-side component.

```html
<script>
	import { onDestroy } from 'svelte';

	onDestroy(() => {
		console.log('the component is being destroyed');
	});
</script>
```

* `promise: Promise = tick()`

---

Returns a promise that resolves once any pending state changes have been applied, or in the next microtask if there are none.

```html
<script>
	import { beforeUpdate, tick } from 'svelte';

	beforeUpdate(async () => {
		console.log('the component is about to update');
		await tick();
		console.log('the component just updated');
	});
</script>
```

* `setContext(key: any, context: any)`

---

Associates an arbitrary `context` object with the current component and the specified `key`. The context is then available to children of the component (including slotted content) with `getContext`.

Like lifecycle functions, this must be called during component initialisation.

```html
<script>
	import { setContext } from 'svelte';

	setContext('answer', 42);
</script>
```

* `context: any = getContext(key: any)`

---

Retrieves the context that belongs to the closest parent component with the specified `key`. Must be called during component initialisation.

```html
<script>
	import { getContext } from 'svelte';

	const answer = getContext('answer');
</script>
```



### svelte/store

TODO

* writable, readable, derive, get

### svelte/motion

TODO

* spring, tweened

### svelte/transition

TODO

* fade, fly, slide, draw
* crossfade...

### svelte/animation

TODO

* TODO this doesn't even exist yet

TODO

### svelte/easing

* TODO could have nice little interactive widgets showing the different functions, maybe

### svelte/register

TODO