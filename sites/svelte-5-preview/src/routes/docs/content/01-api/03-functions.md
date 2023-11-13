---
title: Functions
---

As well as runes, Svelte 5 will introduce a couple of new functions, in addition to existing functions like `getContext`, `setContext` and `tick`. These are introduced as functions rather than runes because they are used directly and the compiler does not need to touch them to make them function as it does with runes. However, these functions may still use Svelte internals.

## `untrack`

To prevent something from being treated as an `$effect`/`$derived` dependency, use `untrack`:

```svelte
<script>
	import { untrack } from 'svelte';

	let { a, b } = $props();

	$effect(() => {
		// this will run when `a` changes,
		// but not when `b` changes
		console.log(a);
		console.log(untrack(() => b));
	});
</script>
```

## `selector`

`selector` allows you to track the currently selected item in a list in a performance optimized manner that runs in constant time (`O(1)`). With `selector`, you can immediately determine if an item is selected:

```svelte
<script>
	import { selector } from 'svelte';

	let array = $state([1, 2, 3]);
	let selected = selector();
</script>

{#each array as item}
	<button on:click={() => selected.set(item)}>{selected.is(item)}</button>
{/each}

<p>{selected.current}</p>
```
