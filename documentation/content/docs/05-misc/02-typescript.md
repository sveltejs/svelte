---
title: TypeScript
---

You can use TypeScript to type your Svelte components. The Svelte VSCode extension and the [`svelte-check` CLI](https://www.npmjs.com/package/svelte-check) will check your code for errors and provide hints about how to fix them.

> TypeScript usage is part of [svelte-preprocess](https://github.com/sveltejs/svelte-preprocess), having it in your `svelte.config.js` is required. If you're using SvelteKit, then you can also use [`vitePreprocess`](https://kit.svelte.dev/docs/integrations#preprocessors-vitepreprocess).

## `<script lang="ts">`

To add types to your JavaScript inside the `<script>` tag, you can use the `script` tag's `lang` attribute:

```svelte
<script lang="ts">
	let name: string = 'world';

	function greet(name: string) {
		alert(`Hello, ${name}!`);
	}
</script>
```

## Reactive Declarations

You cannot type your reactive declarations with TypeScript in the way you type a variable. For example, the following does not work:

```svelte
<script lang="ts">
	let count = 0;

	$: doubled: number = count * 2; // ❌ Does not work
</script>
```

You cannot add a `: TYPE` after variable declaration's variable. Instead, you can use the `as` or `satisfies` keyword:

```svelte
<script lang="ts">
	let count = 0;

	$: doubled = (count * 2) as number;
	$: doubled = (count * 2) satisfies number;
</script>
```

## Props

Props can be directly typed by using the `export let` syntax:

```svelte
<script lang="ts">
	export let name: string;
</script>
```

These are ultimately just variable declarations, so it just works.

However, sometimes you have a scenario where you want to type a prop that is not directly declared in the component. For example, you may want to pass `$$restProps` to an `<input>` element. This allows you to pass any prop to the `<input>` element from it's parent component.

```svelte
<script lang="ts">
	import Child from './Child.svelte';

	export let value: string;
</script>

<input {value} {...$$restProps} />
```

To type `$$restProps`, we can use `$$Props` type or interface:

```svelte
<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import Child from './Child.svelte';

	export let value: string;

	interface $$Props extends HTMLInputAttributes {
		value: string;
	}
</script>

<input {value} {...$$restProps} />
```

If you define `$$Props`, all possible props need to be part of it. If you use `$$props` or `$$restProps` then that does not widen the type, still only those defined in $$Props are allowed.

## Slots

Slots can be typed using `$$Slots`. This may or may not include the slot props. For example, the following component has two slots, one default and one named:

```svelte
<script lang="ts">
	export let name: string;

	interface $$Slots {
		default: {};
		named: { prop: string };
	}
</script>

<slot {name} />

<slot name="named" prop={value} />
```

## Events

Events can be typed with `createEventDispatcher`:

```svelte
<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{
		click: string;
		type: string;
	}>();

	function handleClick() {
		dispatch('click', { detail: 'hello' });
	}

	function handleType() {
		dispatch('type', { detail: 'world' });
	}
</script>

<button on:click={handleClick} on:keydown={handleType}>Click</button>
```

However, sometimes an event dispatcher may be coming from another file/package. For example:

```svelte
<script>
	import { mixinDispatch } from 'somewhere';

	function handleClick() {
		mixinDispatch.mixinEvent('foo');
	}
</script>

<button on:click={handleClick}>Mixin</button>
```

In this case, svelte can't understand the custom event types. So, you can use `$$Events` to type the event:

```svelte
<script lang="ts">
	import { mixinDispatch } from 'somewhere';

	interface $$Events {
		mixinEvent: CustomEvent<string>;
	}

	function handleClick() {
		mixinDispatch.mixinEvent('foo');
	}
</script>

<button on:click={handleClick}>Mixin</button>
```

## Generics

You want to specify some generic connection between props/slots/events. For example you have a component which has an input prop `item`, and an event called `itemChanged`. You want to use this component for arbitrary kinds of item, but you want to make sure that the types for `item` and `itemChanged` are the same. Generics come in handy then. You can read more about them on the [official TypeScript page](https://www.typescriptlang.org/docs/handbook/generics.html).

You can use new reserved type called `$$Generic`.

```svelte
<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	type T = $$Generic<boolean>; // extends boolean
	type X = $$Generic; // any

	// you can use generics inside the other interfaces
	interface $$Slots {
		default: { aSlot: T };
	}

	export let array1: T[];
	export let item1: T;
	export let array2: X[];
	const dispatch = createEventDispatcher<{ arrayItemClick: X }>();
</script>
```

## Types

> TYPES: svelte
