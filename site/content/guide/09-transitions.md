---
title: Transitions
---


### Transitions

Transitions allow elements to enter and leave the DOM gracefully, rather than suddenly appearing and disappearing.

```html
<!-- { title: 'Transitions' } -->
<script>
	import { fade } from 'svelte/transition.js';
	let visible = false;
</script>

<input type=checkbox bind:checked={visible}> visible

{#if visible}
	<p transition:fade>fades in and out</p>
{/if}
```

Transitions can have parameters — typically `delay` and `duration`, but often others, depending on the transition in question. For example, here's the `fly` transition from the [svelte-transitions](https://github.com/sveltejs/svelte-transitions) package:

```html
<!-- { title: 'Transition with parameters' } -->
<script>
	import { fly } from 'svelte-transitions';
	let visible = false;
</script>

<input type=checkbox bind:checked={visible}> visible

{#if visible}
	<p transition:fly="{{y: 200, duration: 1000}}">flies 200 pixels up, slowly</p>
{/if}
```

An element can have separate `in` and `out` transitions:

```html
<!-- { title: 'Transition in/out' } -->
<script>
	import { fade, fly } from 'svelte-transitions';
	let visible = false;
</script>

<input type=checkbox bind:checked={visible}> visible

{#if visible}
	<p in:fly="{y: 50}" out:fade>flies up, fades out</p>
{/if}
```

Transitions are simple functions that take a `node` and any provided `parameters` and return an object with the following properties:

* `duration` — how long the transition takes in milliseconds
* `delay` — milliseconds before the transition starts
* `easing` — an [easing function](https://github.com/rollup/eases-jsnext)
* `css` — a function that accepts an argument `t` between 0 and 1 and returns the styles that should be applied at that moment
* `tick` — a function that will be called on every frame, with the same `t` argument, while the transition is in progress

Of these, `duration` is required, as is *either* `css` or `tick`. The rest are optional. Here's how the `fade` transition is implemented, for example:

```html
<!-- { title: 'Fade transition' } -->
<script>
	function fade(node, { delay = 0, duration = 400 }) {
		const o = +getComputedStyle(node).opacity;

		return {
			delay,
			duration,
			css: t => `opacity: ${t * o}`
		};
	}

	let visible = false;
</script>

<input type=checkbox bind:checked={visible}> visible

{#if visible}
	<p transition:fade>fades in and out</p>
{/if}
```

> If the `css` option is used, Svelte will create a CSS animation that runs efficiently off the main thread. Therefore if you can achieve an effect using `css` rather than `tick`, you should.