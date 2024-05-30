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

This function is deprecated in Svelte 5. Instead, components should accept _callback props_ - which means you then pass functions as properties to these components ([demo](/#H4sIAAAAAAAACo1US27bMBC9yoBtELu2ZDmAG0CRhPYG3VddyPIwIUKRgjiOkwrcd9VFL5BV75cjFKQo2e5_IQnzeW-GM3zqGRcSDUs_9kxVDbKUvW9btmT01DrDPKAkZEtm9L6rnSczdSdaKkpVkmha3RF82Dct8E43cBmvnBEPsMsbl-QeiQRGfEbI4bWhinC23sxvxsh23xk6hnglDfqoKonvVU1CK-jQIM3m0HtOCmzrzVCDRg4P9j5bqmx1bFZlrjPfteKyIsz7WasP2M0hL85YFzn4QGAWHGbeX8D1Zj41S90-1LHuvcM_kp4QJPNhDNFpCUew8i32rwQfCnjObLsn0gq0qqWo7_Pez8AWCg-wraTUWmWrIcevIzNtpaCWlTF5ybZaNyUrXp6_fc9WLlKUqk9RGrS_SR7oSgaGniTmJTN1JTGFPomTNbzxbduSFcORXp6_fvEkE_FKcOun7PE-zRcIM2i1EW6NKXDxiLswWomcUkiCRbo9Ggexo7sU1klyETx3KG7v6MzFtaLIdea9D4eRCB8pqqS4VSnUqGhapRQKo4nnZmxNuJQIH1CRSUFpNV0g94nDbMajUFep8TB-SJDEV-YcoXUzpldKNNWQ7d1JvDHAdXeout0Z6t09PvGuatDAKT65gB7CMpL4LdjBfbU5819vxoAbz0lkcA9aCJthS9boneACdyx119guJ_E7jfyv-p10ewhqWkJQAFin5LbTrZkdJe5v-1HiXvzn6vz5rs-8hAJ7EJUtgn1y7f8ADN1MwGD_G-gBUWSLaModfnA-kELvvxb-Bl8sbLGY4L_O-5P9ATwVcA54BQAA)):

```svelte
<script>
	import Pump from './Pump.svelte';

	let size = $state(15);
	let burst = $state(false);

	function reset() {
		size = 15;
		burst = false;
	}
</script>

<Pump
	inflate={(power) => {
		size += power;
		if (size > 75) burst = true;
	}}
	deflate={(power) => {
		if (size > 0) size -= power;
	}}
/>

{#if burst}
	<button onclick={reset}>new balloon</button>
	<span class="boom">💥</span>
{:else}
	<span class="balloon" style="scale: {0.01 * size}">
		🎈
	</span>
{/if}
```

```svelte
<script>
	let { inflate, deflate } = $props();
	let power = $state(5);
</script>

<button onclick={() => inflate(power)}>inflate</button>
<button onclick={() => deflate(power)}>deflate</button>
<button onclick={() => power--}>-</button>
Pump power: {power}
<button onclick={() => power++}>+</button>
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
- add the ability to express whether a given event handler is required or optional
- increase type safety (previously, it was effectively impossible for Svelte to guarantee that a component didn't emit a particular event)
