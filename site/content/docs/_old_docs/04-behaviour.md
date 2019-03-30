---
title: Behaviours
---

As well as scoped styles and a template, components can encapsulate *behaviours*. For that, we add a `<script>` element:

```html
<!-- { title: 'Behaviours' } -->
<script>
	// behaviours go here
</script>

<div>
	<!-- template goes here -->
</div>
```


### Internal state

Often, it makes sense for a component to have internal state that isn't visible to the outside world.

```html
<!-- { title: 'Internal state' } -->
<script>
	let count = 0;
</script>

<p>Count: {count}</p>
<button on:click="{() => count += 1}">+1</button>
```


### External properties

On the other hand, for the component to form part of a system, it needs to expose certain values so that they can be set from outside. These are called *props*, and we use the `export` keyword to differentiate them from internal state:

```html
<!-- { title: 'External properties' } -->
<script>
	export let count = 0;
</script>

<p>Count: {count}</p>
<button on:click="{() => count += 1}">+1</button>
```

> Effectively, we're exporting a *contract* with the outside world. The `export` keyword normally means something different in JavaScript, so you might be surprised to see it used like this. Just roll with it for now!

The `= 0` sets a default value for `count`, if none is provided.

```js
const counter = new Counter({
	target: document.body,
	props: {
		count: 99
	}
});

counter.count; // 99
counter.count += 1; // 100
```

Props declared with `const` or `function` are *read-only* — they cannot be set from outside. This allows you to, for example, attach custom methods to your component:

```js
component.doSomethingFun();
```


### Lifecycle hooks

There are four 'hooks' provided by Svelte for adding control logic — `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`. Import them directly from `svelte`:

```html
<!-- { title: 'Lifecycle hooks' } -->
<script>
	import { onMount, beforeUpdate, afterUpdate, onDestroy } from 'svelte';

	beforeUpdate(() => {
		// this function is called immediately before
		// the component updates to reflect new data
		console.log(`beforeUpdate`);
	});

	afterUpdate(() => {
		// this function is called immediately *after*
		// the component updates to reflect new data.
		// if you need to do anything that assumes the
		// DOM is up-to-date — such as measuring the
		// size of an element — do it here
		console.log(`afterUpdate`);
	});

	onMount(() => {
		// this function is called once, after the
		// `afterUpdate` function (if there is one)
		// runs for the first time
		console.log(`onMount`);

		return () => {
			// this function runs when the
			// component is destroyed
			console.log(`onMount cleanup`);
		};
	});

	onDestroy(() => {
		// this function runs when the
		// component is destroyed
		console.log(`onDestroy`);
	});

	let count = 0;
</script>

<button on:click="{() => count += 1}">
	Trigger an update ({count})
</button>
```

> Lifecycle hooks do *not* run in server-side rendering (SSR) mode, with the exception of `onDestroy`. More on SSR later.
