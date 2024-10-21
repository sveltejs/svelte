---
title: on:
---

```svelte
<!--- copy: false --->
on:eventname={handler}
```

```svelte
<!--- copy: false --->
on:eventname|modifiers={handler}
```

Use the `on:` directive to listen to DOM events.

```svelte
<!--- file: App.svelte --->
<script>
	let count = 0;

	/** @param {MouseEvent} event */
	function handleClick(event) {
		count += 1;
	}
</script>

<button on:click={handleClick}>
	count: {count}
</button>
```

Handlers can be declared inline with no performance penalty. As with attributes, directive values may be quoted for the sake of syntax highlighters.

```svelte
<button on:click={() => (count += 1)}>
	count: {count}
</button>
```

Add _modifiers_ to DOM events with the `|` character.

```svelte
<form on:submit|preventDefault={handleSubmit}>
	<!-- the `submit` event's default is prevented,
	     so the page won't reload -->
</form>
```

The following modifiers are available:

- `preventDefault` — calls `event.preventDefault()` before running the handler
- `stopPropagation` — calls `event.stopPropagation()`, preventing the event reaching the next element
- `stopImmediatePropagation` - calls `event.stopImmediatePropagation()`, preventing other listeners of the same event from being fired.
- `passive` — improves scrolling performance on touch/wheel events (Svelte will add it automatically where it's safe to do so)
- `nonpassive` — explicitly set `passive: false`
- `capture` — fires the handler during the _capture_ phase instead of the _bubbling_ phase
- `once` — remove the handler after the first time it runs
- `self` — only trigger handler if `event.target` is the element itself
- `trusted` — only trigger handler if `event.isTrusted` is `true`. I.e. if the event is triggered by a user action.

Modifiers can be chained together, e.g. `on:click|once|capture={...}`.

If the `on:` directive is used without a value, the component will _forward_ the event, meaning that a consumer of the component can listen for it.

```svelte
<button on:click> The component itself will emit the click event </button>
```

It's possible to have multiple event listeners for the same event:

```svelte
<!--- file: App.svelte --->
<script>
	let counter = 0;
	function increment() {
		counter = counter + 1;
	}

	/** @param {MouseEvent} event */
	function track(event) {
		trackEvent(event);
	}
</script>

<button on:click={increment} on:click={track}>Click me!</button>
```

> [!NOTE]
> In Svelte 5+, use event attributes instead
> ```svelte
> <button onclick={() => alert('clicked')}>click me</button>
> ```

## Component events

Component events created with [`createEventDispatcher`](svelte#createEventDispatcher) create a `CustomEvent`. These events do not bubble. The detail argument corresponds to the `CustomEvent.detail` property and can contain any type of data.

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

> [!NOTE]
> If you're planning on migrating to Svelte 5, use callback props instead. This will make upgrading easier as `createEventDispatcher` is deprecated
> ```svelte
> <script>
> 	export let notify;
> </script>
> 
> <button on:click={() => notify('detail value')}>Fire Event</button>
> ```
