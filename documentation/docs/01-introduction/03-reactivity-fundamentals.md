---
title: Reactivity fundamentals
---

Reactivity is at the heart of interactive UIs. When you click a button, you expect some kind of response. It's your job as a developer to make this happen. It's Svelte's job to make your job as intuitive as possible, by providing a good API to express reactive systems.

## Runes

Svelte 5 uses _runes_, a powerful set of primitives for controlling reactivity inside your Svelte components and inside `.svelte.js` and `.svelte.ts` modules.

Runes are function-like symbols that provide instructions to the Svelte compiler. You don't need to import them from anywhere — when you use Svelte, they're part of the language.

The following sections introduce the most important runes for declare state, derived state and side effects at a high level. For more details refer to the later sections on [state](/docs/svelte/runes/state) and [side effects](/docs/svelte/runes/side-effects).

## `$state`

Reactive state is declared with the `$state` rune:

```svelte
<script>
	let count = $state(0);
</script>

<button onclick={() => count++}>
	clicks: {count}
</button>
```

You can also use `$state` in class fields (whether public or private):

```js
// @errors: 7006 2554
class Todo {
	done = $state(false);
	text = $state();

	constructor(text) {
		this.text = text;
	}
}
```

> [!LEGACY]
> In Svelte 4, state was implicitly reactive if the variable was declared at the top level
>
> ```svelte
> <script>
> 	let count = 0;
> </script>
>
> <button on:click={() => count++}>
> 	clicks: {count}
> </button>
> ```

## `$derived`

Derived state is declared with the `$derived` rune:

```svelte
<script>
	let count = $state(0);
	let doubled = $derived(count * 2);
</script>

<button onclick={() => count++}>
	{doubled}
</button>

<p>{count} doubled is {doubled}</p>
```

The expression inside `$derived(...)` should be free of side-effects. Svelte will disallow state changes (e.g. `count++`) inside derived expressions.

As with `$state`, you can mark class fields as `$derived`.

> [!LEGACY]
> In Svelte 4, you could use reactive statements for this.
>
> ```svelte
> <script>
> 	let count = 0;
> 	$: doubled = count * 2;
> </script>
>
> <button on:click={() => count++}>
> 	{doubled}
> </button>
>
> <p>{count} doubled is {doubled}</p>
> ```
>
> This only worked at the top level of a component.

## `$effect`

To run _side-effects_ when the component is mounted to the DOM, and when values change, we can use the `$effect` rune ([demo](/#H4sIAAAAAAAAE31T24rbMBD9lUG7kAQ2sbdlX7xOYNk_aB_rQhRpbAsU2UiTW0P-vbrYubSlYGzmzMzROTPymdVKo2PFjzMzfIusYB99z14YnfoQuD1qQh-7bmdFQEonrOppVZmKNBI49QthCc-OOOH0LZ-9jxnR6c7eUpOnuv6KeT5JFdcqbvbcBcgDz1jXKGg6ncFyBedYR6IzLrAZwiN5vtSxaJA-EzadfJEjKw11C6GR22-BLH8B_wxdByWpvUYtqqal2XB6RVkG1CoHB6U1WJzbnYFDiwb3aGEdDa3Bm1oH12sQLTcNPp7r56m_00mHocSG97_zd7ICUXonA5fwKbPbkE2ZtMJGGVkEdctzQi4QzSwr9prnFYNk5hpmqVuqPQjNnfOJoMF22lUsrq_UfIN6lfSVyvQ7grB3X2mjMZYO3XO9w-U5iLx42qg29md3BP_ni5P4gy9ikTBlHxjLzAtPDlyYZmRdjAbGq7HprEQ7p64v4LU_guu0kvAkhBim3nMplWl8FreQD-CW20aZR0wq12t-KqDWeBywhvexKC3memmDwlHAv9q4Vo2ZK8KtK0CgX7u9J8wXbzdKv-nRnfF_2baTqlYoWUF2h5efl9-n0O6koAMAAA==)):

```svelte
<script>
	let size = $state(50);
	let color = $state('#ff3e00');

	let canvas;

	$effect(() => {
		const context = canvas.getContext('2d');
		context.clearRect(0, 0, canvas.width, canvas.height);

		// this will re-run whenever `color` or `size` change
		context.fillStyle = color;
		context.fillRect(0, 0, size, size);
	});
</script>

<canvas bind:this={canvas} width="100" height="100" />
```

The function passed to `$effect` will run when the component mounts, and will re-run after any changes to the values it reads that were declared with `$state` or `$derived` (including those passed in with `$props`). Re-runs are batched (i.e. changing `color` and `size` in the same moment won't cause two separate runs), and happen after any DOM updates have been applied.

> [!LEGACY]
> In Svelte 4, you could use reactive statements for this.
>
> ```svelte
> <script>
> 	let size = 50;
> 	let color = '#ff3e00';
>
> 	let canvas;
>
> 	$: {
> 		const context = canvas.getContext('2d');
> 		context.clearRect(0, 0, canvas.width, canvas.height);
>
> 		// this will re-run whenever `color` or `size` change
> 		context.fillStyle = color;
> 		context.fillRect(0, 0, size, size);
> 	}
> </script>
>
> <canvas bind:this={canvas} width="100" height="100" />
> ```
>
> This only worked at the top level of a component.
