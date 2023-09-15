---
title: 'svelte/animate'
---

The `svelte/animate` module exports one function for use with Svelte [animations](/docs/element-directives#animate-fn).

## `flip`

> EXPORT_SNIPPET: svelte/animate#flip

```svelte
<!--- copy: false --->
animate:flip={params}
```

The `flip` function calculates the start and end position of an element and animates between them, translating the `x` and `y` values. `flip` stands for [First, Last, Invert, Play](https://aerotwist.com/blog/flip-your-animations/).

`flip` accepts the following parameters:

- `delay` (`number`, default 0) — milliseconds before starting
- `duration` (`number` | `function`, default `d => Math.sqrt(d) * 120`) — see below
- `easing` (`function`, default `cubicOut`) — an [easing function](/docs/svelte-easing)

`duration` can be provided as either:

- a `number`, in milliseconds.
- a function, `distance: number => duration: number`, receiving the distance the element will travel in pixels and returning the duration in milliseconds. This allows you to assign a duration that is relative to the distance travelled by each element.

You can see a full example on the [animations tutorial](https://learn.svelte.dev/tutorial/animate).

```svelte
<script>
	import { flip } from 'svelte/animate';
	import { quintOut } from 'svelte/easing';

	let list = [1, 2, 3];
</script>

{#each list as n (n)}
	<div animate:flip={{ delay: 250, duration: 250, easing: quintOut }}>
		{n}
	</div>
{/each}
```

## Types

> TYPES: svelte/animate
