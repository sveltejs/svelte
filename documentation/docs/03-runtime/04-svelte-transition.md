---
title: 'svelte/transition'
---

The `svelte/transition` module exports seven functions: `fade`, `blur`, `fly`, `slide`, `scale`, `draw` and `crossfade`. They are for use with Svelte [`transitions`](/docs/element-directives#transition-fn).

## `fade`

> EXPORT_SNIPPET: svelte/transition#fade

```svelte
<!--- copy: false --->
transition:fade={params}
```

```svelte
<!--- copy: false --->
in:fade={params}
```

```svelte
<!--- copy: false --->
out:fade={params}
```

Animates the opacity of an element from 0 to the current opacity for `in` transitions and from the current opacity to 0 for `out` transitions.

`fade` accepts the following parameters:

- `delay` (`number`, default 0) — milliseconds before starting
- `duration` (`number`, default 400) — milliseconds the transition lasts
- `easing` (`function`, default `linear`) — an [easing function](/docs/svelte-easing)

You can see the `fade` transition in action in the [transition tutorial](https://learn.svelte.dev/tutorial/transition).

```svelte
<script>
	import { fade } from 'svelte/transition';
</script>

{#if condition}
	<div transition:fade={{ delay: 250, duration: 300 }}>fades in and out</div>
{/if}
```

## `blur`

> EXPORT_SNIPPET: svelte/transition#blur

```svelte
<!--- copy: false --->
transition:blur={params}
```

```svelte
<!--- copy: false --->
in:blur={params}
```

```svelte
<!--- copy: false --->
out:blur={params}
```

Animates a `blur` filter alongside an element's opacity.

`blur` accepts the following parameters:

- `delay` (`number`, default 0) — milliseconds before starting
- `duration` (`number`, default 400) — milliseconds the transition lasts
- `easing` (`function`, default `cubicInOut`) — an [easing function](/docs/svelte-easing)
- `opacity` (`number`, default 0) - the opacity value to animate out to and in from
- `amount` (`number | string`, default 5) - the size of the blur. Supports css units (for example: `"4rem"`). The default unit is `px`

```svelte
<script>
	import { blur } from 'svelte/transition';
</script>

{#if condition}
	<div transition:blur={{ amount: 10 }}>fades in and out</div>
{/if}
```

## `fly`

> EXPORT_SNIPPET: svelte/transition#fly

```svelte
<!--- copy: false --->
transition:fly={params}
```

```svelte
<!--- copy: false --->
in:fly={params}
```

```svelte
<!--- copy: false --->
out:fly={params}
```

Animates the x and y positions and the opacity of an element. `in` transitions animate from the provided values, passed as parameters to the element's default values. `out` transitions animate from the element's default values to the provided values.

`fly` accepts the following parameters:

- `delay` (`number`, default 0) — milliseconds before starting
- `duration` (`number`, default 400) — milliseconds the transition lasts
- `easing` (`function`, default `cubicOut`) — an [easing function](/docs/svelte-easing)
- `x` (`number | string`, default 0) - the x offset to animate out to and in from
- `y` (`number | string`, default 0) - the y offset to animate out to and in from
- `opacity` (`number`, default 0) - the opacity value to animate out to and in from

x and y use `px` by default but support css units, for example `x: '100vw'` or `y: '50%'`.
You can see the `fly` transition in action in the [transition tutorial](https://learn.svelte.dev/tutorial/adding-parameters-to-transitions).

```svelte
<script>
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
</script>

{#if condition}
	<div
		transition:fly={{ delay: 250, duration: 300, x: 100, y: 500, opacity: 0.5, easing: quintOut }}
	>
		flies in and out
	</div>
{/if}
```

## `slide`

> EXPORT_SNIPPET: svelte/transition#slide

```svelte
<!--- copy: false --->
transition:slide={params}
```

```svelte
<!--- copy: false --->
in:slide={params}
```

```svelte
<!--- copy: false --->
out:slide={params}
```

Slides an element in and out.

`slide` accepts the following parameters:

- `delay` (`number`, default 0) — milliseconds before starting
- `duration` (`number`, default 400) — milliseconds the transition lasts
- `easing` (`function`, default `cubicOut`) — an [easing function](/docs/svelte-easing)

* `axis` (`x` | `y`, default `y`) — the axis of motion along which the transition occurs

```svelte
<script>
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
</script>

{#if condition}
	<div transition:slide={{ delay: 250, duration: 300, easing: quintOut, axis: 'x' }}>
		slides in and out horizontally
	</div>
{/if}
```

## `scale`

> EXPORT_SNIPPET: svelte/transition#scale

```svelte
<!--- copy: false --->
transition:scale={params}
```

```svelte
<!--- copy: false --->
in:scale={params}
```

```svelte
<!--- copy: false --->
out:scale={params}
```

Animates the opacity and scale of an element. `in` transitions animate from an element's current (default) values to the provided values, passed as parameters. `out` transitions animate from the provided values to an element's default values.

`scale` accepts the following parameters:

- `delay` (`number`, default 0) — milliseconds before starting
- `duration` (`number`, default 400) — milliseconds the transition lasts
- `easing` (`function`, default `cubicOut`) — an [easing function](/docs/svelte-easing)
- `start` (`number`, default 0) - the scale value to animate out to and in from
- `opacity` (`number`, default 0) - the opacity value to animate out to and in from

```svelte
<script>
	import { scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
</script>

{#if condition}
	<div transition:scale={{ duration: 500, delay: 500, opacity: 0.5, start: 0.5, easing: quintOut }}>
		scales in and out
	</div>
{/if}
```

## `draw`

> EXPORT_SNIPPET: svelte/transition#draw

```svelte
<!--- copy: false --->
transition:draw={params}
```

```svelte
<!--- copy: false --->
in:draw={params}
```

```svelte
<!--- copy: false --->
out:draw={params}
```

Animates the stroke of an SVG element, like a snake in a tube. `in` transitions begin with the path invisible and draw the path to the screen over time. `out` transitions start in a visible state and gradually erase the path. `draw` only works with elements that have a `getTotalLength` method, like `<path>` and `<polyline>`.

`draw` accepts the following parameters:

- `delay` (`number`, default 0) — milliseconds before starting
- `speed` (`number`, default undefined) - the speed of the animation, see below.
- `duration` (`number` | `function`, default 800) — milliseconds the transition lasts
- `easing` (`function`, default `cubicInOut`) — an [easing function](/docs/svelte-easing)

The `speed` parameter is a means of setting the duration of the transition relative to the path's length. It is a modifier that is applied to the length of the path: `duration = length / speed`. A path that is 1000 pixels with a speed of 1 will have a duration of `1000ms`, setting the speed to `0.5` will double that duration and setting it to `2` will halve it.

```svelte
<script>
	import { draw } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
</script>

<svg viewBox="0 0 5 5" xmlns="http://www.w3.org/2000/svg">
	{#if condition}
		<path
			transition:draw={{ duration: 5000, delay: 500, easing: quintOut }}
			d="M2 1 h1 v1 h1 v1 h-1 v1 h-1 v-1 h-1 v-1 h1 z"
			fill="none"
			stroke="cornflowerblue"
			stroke-width="0.1px"
			stroke-linejoin="round"
		/>
	{/if}
</svg>
```

## `crossfade`

> EXPORT_SNIPPET: svelte/transition#crossfade

The `crossfade` function creates a pair of [transitions](/docs/element-directives#transition-fn) called `send` and `receive`. When an element is 'sent', it looks for a corresponding element being 'received', and generates a transition that transforms the element to its counterpart's position and fades it out. When an element is 'received', the reverse happens. If there is no counterpart, the `fallback` transition is used.

`crossfade` accepts the following parameters:

- `delay` (`number`, default 0) — milliseconds before starting
- `duration` (`number` | `function`, default 800) — milliseconds the transition lasts
- `easing` (`function`, default `cubicOut`) — an [easing function](/docs/svelte-easing)
- `fallback` (`function`) — A fallback [transition](/docs/element-directives#transition-fn) to use for send when there is no matching element being received, and for receive when there is no element being sent.

```svelte
<script>
	import { crossfade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	const [send, receive] = crossfade({
		duration: 1500,
		easing: quintOut
	});
</script>

{#if condition}
	<h1 in:send={{ key }} out:receive={{ key }}>BIG ELEM</h1>
{:else}
	<small in:send={{ key }} out:receive={{ key }}>small elem</small>
{/if}
```

## Types

> TYPES: svelte/transition
