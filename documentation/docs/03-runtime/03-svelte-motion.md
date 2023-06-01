---
title: 'svelte/motion'
---

The `svelte/motion` module exports two functions, `tweened` and `spring`, for creating writable stores whose values change over time after `set` and `update`, rather than immediately.

## `tweened`

> EXPORT_SNIPPET: svelte/motion#tweened

Tweened stores update their values over a fixed duration. The following options are available:

- `delay` (`number`, default 0) — milliseconds before starting
- `duration` (`number` | `function`, default 400) — milliseconds the tween lasts
- `easing` (`function`, default `t => t`) — an [easing function](/docs/svelte-easing)
- `interpolate` (`function`) — see below

`store.set` and `store.update` can accept a second `options` argument that will override the options passed in upon instantiation.

Both functions return a Promise that resolves when the tween completes. If the tween is interrupted, the promise will never resolve.

Out of the box, Svelte will interpolate between two numbers, two arrays or two objects (as long as the arrays and objects are the same 'shape', and their 'leaf' properties are also numbers).

```svelte
<script>
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	const size = tweened(1, {
		duration: 300,
		easing: cubicOut
	});

	function handleClick() {
		// this is equivalent to size.update(n => n + 1)
		$size += 1;
	}
</script>

<button on:click={handleClick} style="transform: scale({$size}); transform-origin: 0 0">
	embiggen
</button>
```

If the initial value is `undefined` or `null`, the first value change will take effect immediately. This is useful when you have tweened values that are based on props, and don't want any motion when the component first renders.

```ts
// @filename: ambient.d.ts
declare global {
	var $size: number;
	var big: number;
}

export {};
// @filename: motion.ts
// ---cut---
import { tweened } from 'svelte/motion';
import { cubicOut } from 'svelte/easing';

const size = tweened(undefined, {
	duration: 300,
	easing: cubicOut
});

$: $size = big ? 100 : 10;
```

The `interpolate` option allows you to tween between _any_ arbitrary values. It must be an `(a, b) => t => value` function, where `a` is the starting value, `b` is the target value, `t` is a number between 0 and 1, and `value` is the result. For example, we can use the [d3-interpolate](https://github.com/d3/d3-interpolate) package to smoothly interpolate between two colours.

```svelte
<script>
	import { interpolateLab } from 'd3-interpolate';
	import { tweened } from 'svelte/motion';

	const colors = ['rgb(255, 62, 0)', 'rgb(64, 179, 255)', 'rgb(103, 103, 120)'];

	const color = tweened(colors[0], {
		duration: 800,
		interpolate: interpolateLab
	});
</script>

{#each colors as c}
	<button style="background-color: {c}; color: white; border: none;" on:click={(e) => color.set(c)}>
		{c}
	</button>
{/each}

<h1 style="color: {$color}">{$color}</h1>
```

## `spring`

> EXPORT_SNIPPET: svelte/motion#spring

A `spring` store gradually changes to its target value based on its `stiffness` and `damping` parameters. Whereas `tweened` stores change their values over a fixed duration, `spring` stores change over a duration that is determined by their existing velocity, allowing for more natural-seeming motion in many situations. The following options are available:

- `stiffness` (`number`, default `0.15`) — a value between 0 and 1 where higher means a 'tighter' spring
- `damping` (`number`, default `0.8`) — a value between 0 and 1 where lower means a 'springier' spring
- `precision` (`number`, default `0.01`) — determines the threshold at which the spring is considered to have 'settled', where lower means more precise

All of the options above can be changed while the spring is in motion, and will take immediate effect.

```js
import { spring } from 'svelte/motion';

const size = spring(100);
size.stiffness = 0.3;
size.damping = 0.4;
size.precision = 0.005;
```

As with [`tweened`](/docs/svelte-motion#tweened) stores, `set` and `update` return a Promise that resolves if the spring settles.

Both `set` and `update` can take a second argument — an object with `hard` or `soft` properties. `{ hard: true }` sets the target value immediately; `{ soft: n }` preserves existing momentum for `n` seconds before settling. `{ soft: true }` is equivalent to `{ soft: 0.5 }`.

```js
import { spring } from 'svelte/motion';

const coords = spring({ x: 50, y: 50 });
// updates the value immediately
coords.set({ x: 100, y: 200 }, { hard: true });
// preserves existing momentum for 1s
coords.update(
	(target_coords, coords) => {
		return { x: target_coords.x, y: coords.y };
	},
	{ soft: 1 }
);
```

[See a full example on the spring tutorial.](https://learn.svelte.dev/tutorial/springs)

```svelte
<script>
	import { spring } from 'svelte/motion';

	const coords = spring(
		{ x: 50, y: 50 },
		{
			stiffness: 0.1,
			damping: 0.25
		}
	);
</script>
```

If the initial value is `undefined` or `null`, the first value change will take effect immediately, just as with `tweened` values (see above).

```ts
// @filename: ambient.d.ts
declare global {
	var $size: number;
	var big: number;
}

export {};

// @filename: motion.ts
// ---cut---
import { spring } from 'svelte/motion';

const size = spring();
$: $size = big ? 100 : 10;
```

## Types

> TYPES: svelte/motion
