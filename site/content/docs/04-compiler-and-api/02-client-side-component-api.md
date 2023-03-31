---
title: 'Client-side component API'
---

## Creating a component

```js
const component = new Component(options);
```

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

| option    | default     | description                                                                                          |
| --------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| `target`  | **none**    | An `HTMLElement` or `ShadowRoot` to render to. This option is required                               |
| `anchor`  | `null`      | A child of `target` to render the component immediately before                                       |
| `props`   | `{}`        | An object of properties to supply to the component                                                   |
| `context` | `new Map()` | A `Map` of root-level context key-value pairs to supply to the component                             |
| `hydrate` | `false`     | See below                                                                                            |
| `intro`   | `false`     | If `true`, will play transitions on initial render, rather than waiting for subsequent state changes |

Existing children of `target` are left where they are.

The `hydrate` option instructs Svelte to upgrade existing DOM (usually from server-side rendering) rather than creating new elements. It will only work if the component was compiled with the [`hydratable: true` option](/docs/svelte-compiler#svelte-compile). Hydration of `<head>` elements only works properly if the server-side rendering code was also compiled with `hydratable: true`, which adds a marker to each element in the `<head>` so that the component knows which elements it's responsible for removing during hydration.

Whereas children of `target` are normally left alone, `hydrate: true` will cause any children to be removed. For that reason, the `anchor` option cannot be used alongside `hydrate: true`.

The existing DOM doesn't need to match the component — Svelte will 'repair' the DOM as it goes.

```js
import App from './App.svelte';

const app = new App({
	target: document.querySelector('#server-rendered-html'),
	hydrate: true
});
```

## `$set`

```js
component.$set(props);
```

Programmatically sets props on an instance. `component.$set({ x: 1 })` is equivalent to `x = 1` inside the component's `<script>` block.

Calling this method schedules an update for the next microtask — the DOM is _not_ updated synchronously.

```js
component.$set({ answer: 42 });
```

## `$on`

```js
component.$on(event, callback);
```

Causes the `callback` function to be called whenever the component dispatches an `event`.

A function is returned that will remove the event listener when called.

```js
const off = app.$on('selected', (event) => {
	console.log(event.detail.selection);
});

off();
```

## `$destroy`

```js
component.$destroy();
```

Removes a component from the DOM and triggers any `onDestroy` handlers.

## Component props

```js
component.prop;
```

```js
component.prop = value;
```

If a component is compiled with `accessors: true`, each instance will have getters and setters corresponding to each of the component's props. Setting a value will cause a _synchronous_ update, rather than the default async update caused by `component.$set(...)`.

By default, `accessors` is `false`, unless you're compiling as a custom element.

```js
console.log(app.count);
app.count += 1;
```
