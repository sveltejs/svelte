---
title: Run time
---


### Client-side component API

* `const component = new Component(options)`

---

A client-side component — that is, a component compiled with `generate: 'dom'` (or the `generate` option left unspecified) is a JavaScript class.

The following initialisation options can be provided:

* `target` (`HTMLElement`, **required**) — the parent DOM node
* `anchor` (`HTMLElement`, default `null`) — the next sibling DOM node. Must be a child of `target`
* `props` (`Object`, default `{}`) — an object of properties to supply to the component
* `hydrate` (`boolean`, default `false`) — see below
* `intro` (`boolean`, default `false`) — whether to play in transitions on initial render

Existing children of `target` are left where they are.


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

TODO

* `const result = Component.render(...)`


### svelte

TODO

* lifecycle methods, tick, context
* SSR behaviour


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