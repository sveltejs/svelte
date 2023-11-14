---
title: Event handlers
---

Event handlers have been given a facelift in Svelte 5. Whereas in Svelte 4 we use the `on:` directive to attach an event listener to an element, in Svelte 5 they are properties like any other:

```diff
<script>
	let count = $state(0);
</script>

-<button on:click={() => count++}>
+<button onclick={() => count++}>
	clicks: {count}
</button>
```

Since they're just properties, you can use the normal shorthand syntax...

```svelte
<script>
	let count = $state(0);

	function onclick() {
		count++;
	}
</script>

<button {onclick}>
	clicks: {count}
</button>
```

...though when using a named event handler function it's usually better to use a more descriptive name.

Traditional `on:` event handlers will continue to work, but are deprecated in Svelte 5.

## Component events

In Svelte 4, components could emit events by creating a dispatcher with [`createEventDispatcher`](https://svelte.dev/docs/svelte#createeventdispatcher).

This function is deprecated in Svelte 5. Instead, components should accept _callback props_ ([demo](/#H4sIAAAAAAAAE41TS27bMBC9yoBtELu1Pg6gBlAkob1B91UXijSKiVAkIdJ2XEH7rrroBbrq_XqEkBTlD-JFFxLIx_fecIYzA2kpQ0XSbwPhVYckJV-kJCuiD9Ju1A6ZRrNXYtvXFslU3VOpi5KXmnZS9Bq-bjsJbS86uA0juwkn2e2DJdmPoQZFfyDk8F7pSuNinSzNaRad3Hhmpc6Wt8xw8mGxhLyAwblop_-YQzK5atrCwmEF3CfL2T52p-No_w1e8znTrWddMNtaYeRuM7wzxImXG6IzzJSsONSsUiovyWPFmBC8JKD0gaFBVF0xTGGIw3gNH5x6LEnx78-vnyZTozXOQ4pM4TU7ITpH_v33RI5oO7rauBCu6E7kc5FCUU0FT6GlL9j4yjBsdeorUWot5Gmzp43epLCO4xuPbJA-bfQF1AquA3t5h-72sxG-6KBi9MmEq5Fr7Od4lGNw9HmYr0YtJcCdoaoUuOA4ldjmU-rQl29ORfcVn5NxdYQ4vFOXClOhmV5x2lUT28FxmChoRb-v-uZC9fkZD21vWlvBuT6-gQH8e8XhJxgn-C65wO-T-cCW5-xkgkfXwf5lzJB0oqEtxYakut_iuDrOlO3s_x0qOysD-BlYgW9iGO3syF5ItXg7OQ3dHftI2ikizip73Jrn5yB4zWj9nA_edSz8IosmxnW2Dz0WfnHGziITsnib8vfxFf2EUSRSBAAA)):

```svelte
<script>
	import Pump from './Pump.svelte';

	let size = $state(15);
</script>

<Pump
	inflate={() => {
		size += 5;
		if (size > 75) size = 0;
	}}
	deflate={() => {
		if (size > 15) size -= 5;
	}}
/>

{#if size >= 15}
	<span class="balloon" style="scale: {0.01 * size}">
		🎈
	</span>
{:else}
	<span class="boom"> 💥 </span>
{/if}
```

```svelte
<script>
	let { inflate, deflate } = $props();
</script>

<div class="pump">
	<button onclick={inflate}>inflate</button>
	<button onclick={deflate}>deflate</button>
</div>
```

## Bubbling events

Instead of doing `<button on:click>` to 'forward' the event from the element to the component, the component should accept an `onclick` callback prop:

```svelte
<script>
	let { onclick, children } = $props();
</script>

<button {onclick}>
	{@render children()}
</button>
```

Note that this also means you can 'spread' event handlers onto the element along with other props:

```svelte
<script>
	let { children, ...props } = $props();
</script>

<button {...props}>
	{@render children()}
</button>
```

## Event modifiers

In Svelte 4, you can add event modifiers to handlers:

```svelte
<button on:click|once|preventDefault={handler}>...</button>
```

Modifiers are specific to `on:` and as such do not work with modern event handlers. Adding things like `event.preventDefault()` inside the handler itself is preferable, since all the logic lives in one place rather than being split between handler and modifiers.

Since event handlers are just functions, you can create your own wrappers as necessary:

```svelte
<script>
	function once(fn) {
		return function (event) {
			if (fn) fn.call(this, event);
			fn = null;
		};
	}

	function preventDefault(fn) {
		return function (event) {
			event.preventDefault();
			fn.call(this, event);
		};
	}
</script>

<button onclick={once(preventDefault(handler))}>...</button>
```

There are three modifiers — `capture`, `passive` and `nonpassive` — that can't be expressed as wrapper functions, since they need to be applied when the event handler is bound rather than when it runs.

For `capture`, we add the modifier to the event name:

```svelte
<button onclickcapture={...}>...</button>
```

Changing the [`passive`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#using_passive_listeners) option of an event handler, meanwhile, is not something to be done lightly. If you have a use case for it — and you probably don't! - then you will need to use an action to apply the event handler yourself.

## Multiple event handlers

In Svelte 4, this is possible:

```svelte
<button on:click={one} on:click={two}>...</button>
```

This is something of an anti-pattern, since it impedes readability (if there are many attributes, it becomes harder to spot that there are two handlers unless they are right next to each other) and implies that the two handlers are independent, when in fact something like `event.stopImmediatePropagation()` inside `one` would prevent `two` from being called.

Duplicate attributes/properties on elements — which now includes event handlers — are not allowed. Instead, do this:

```svelte
<button
	onclick={(e) => {
		one(e);
		two(e);
	}}
>
	...
</button>
```

## Why the change?

By deprecating `createEventDispatcher` and the `on:` directive in favour of callback props and normal element properties, we:

- reduce Svelte's learning curve
- remove boilerplate, particularly around `createEventDispatcher`
- remove the overhead of creating `CustomEvent` objects for events that may not even have listeners
- add the ability to spread event handlers
- add the ability to know which event handlers were provided to a component
- add the ability to express whether a given event handler is required or optional (props with default values are considered optional, those without are considered required)
- increase type safety (previously, it was effectively impossible for Svelte to guarantee that a component didn't emit a particular event)
