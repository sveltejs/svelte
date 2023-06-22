---
title: svelte
---

The `svelte` package exposes [lifecycle functions](https://learn.svelte.dev/tutorial/onmount) and the [context API](https://learn.svelte.dev/tutorial/context-api).

## `onMount`

> EXPORT_SNIPPET: svelte#onMount

The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM. It must be called during the component's initialisation (but doesn't need to live _inside_ the component; it can be called from an external module).

`onMount` does not run inside a [server-side component](/docs/server-side-component-api).

```svelte
<script>
	import { onMount } from 'svelte';

	onMount(() => {
		console.log('the component has mounted');
	});
</script>
```

If a function is returned from `onMount`, it will be called when the component is unmounted.

```svelte
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

> This behaviour will only work when the function passed to `onMount` _synchronously_ returns a value. `async` functions always return a `Promise`, and as such cannot _synchronously_ return a function.

## `beforeUpdate`

> EXPORT_SNIPPET: svelte#beforeUpdate

Schedules a callback to run immediately before the component is updated after any state change.

> The first time the callback runs will be before the initial `onMount`

```svelte
<script>
	import { beforeUpdate } from 'svelte';

	beforeUpdate(() => {
		console.log('the component is about to update');
	});
</script>
```

## `afterUpdate`

> EXPORT_SNIPPET: svelte#afterUpdate

Schedules a callback to run immediately after the component has been updated.

> The first time the callback runs will be after the initial `onMount`

```svelte
<script>
	import { afterUpdate } from 'svelte';

	afterUpdate(() => {
		console.log('the component just updated');
	});
</script>
```

## `onDestroy`

> EXPORT_SNIPPET: svelte#onDestroy

Schedules a callback to run immediately before the component is unmounted.

Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the only one that runs inside a server-side component.

```svelte
<script>
	import { onDestroy } from 'svelte';

	onDestroy(() => {
		console.log('the component is being destroyed');
	});
</script>
```

## `tick`

> EXPORT_SNIPPET: svelte#tick

Returns a promise that resolves once any pending state changes have been applied, or in the next microtask if there are none.

```svelte
<script>
	import { beforeUpdate, tick } from 'svelte';

	beforeUpdate(async () => {
		console.log('the component is about to update');
		await tick();
		console.log('the component just updated');
	});
</script>
```

## `setContext`

> EXPORT_SNIPPET: svelte#setContext

Associates an arbitrary `context` object with the current component and the specified `key` and returns that object. The context is then available to children of the component (including slotted content) with `getContext`.

Like lifecycle functions, this must be called during component initialisation.

```svelte
<script>
	import { setContext } from 'svelte';

	setContext('answer', 42);
</script>
```

> Context is not inherently reactive. If you need reactive values in context then you can pass a store into context, which _will_ be reactive.

## `getContext`

> EXPORT_SNIPPET: svelte#getContext

Retrieves the context that belongs to the closest parent component with the specified `key`. Must be called during component initialisation.

```svelte
<script>
	import { getContext } from 'svelte';

	const answer = getContext('answer');
</script>
```

## `hasContext`

> EXPORT_SNIPPET: svelte#hasContext

Checks whether a given `key` has been set in the context of a parent component. Must be called during component initialisation.

```svelte
<script>
	import { hasContext } from 'svelte';

	if (hasContext('answer')) {
		// do something
	}
</script>
```

## `getAllContexts`

> EXPORT_SNIPPET: svelte#getAllContexts

Retrieves the whole context map that belongs to the closest parent component. Must be called during component initialisation. Useful, for example, if you programmatically create a component and want to pass the existing context to it.

```svelte
<script>
	import { getAllContexts } from 'svelte';

	const contexts = getAllContexts();
</script>
```

## `createEventDispatcher`

> EXPORT_SNIPPET: svelte#createEventDispatcher

Creates an event dispatcher that can be used to dispatch [component events](/docs/component-directives#on-eventname). Event dispatchers are functions that can take two arguments: `name` and `detail`.

Component events created with `createEventDispatcher` create a [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent). These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture). The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail) property and can contain any type of data.

```svelte
<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
</script>

<button on:click={() => dispatch('notify', 'detail value')}>Fire Event</button>
```

Events dispatched from child components can be listened to in their parent. Any data provided when the event was dispatched is available on the `detail` property of the event object.

```svelte
<script>
	function callbackFunction(event) {
		console.log(`Notify fired! Detail: ${event.detail}`);
	}
</script>

<Child on:notify={callbackFunction} />
```

Events can be cancelable by passing a third parameter to the dispatch function. The function returns `false` if the event is cancelled with `event.preventDefault()`, otherwise it returns `true`.

```svelte
<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function notify() {
		const shouldContinue = dispatch('notify', 'detail value', { cancelable: true });
		if (shouldContinue) {
			// no one called preventDefault
		} else {
			// a listener called preventDefault
		}
	}
</script>
```

You can type the event dispatcher to define which events it can receive. This will make your code more type safe both within the component (wrong calls are flagged) and when using the component (types of the events are now narrowed). See [here](typescript#script-lang-ts-events) how to do it.

## Types

> TYPES: svelte
