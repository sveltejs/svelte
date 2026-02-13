<script>
	import { SvelteMap } from 'svelte/reactivity';

	let outside_basic = $state(false);
	let outside_basic_map = new SvelteMap();
	const throw_basic = $derived.by(() => {
		outside_basic_map.set(1, 1);
		return outside_basic_map;
	});

	let inside_basic = $state(false);
	const works_basic = $derived.by(() => {
		let inside = new SvelteMap();
		inside.set(1, 1);
		return inside;
	});

	let outside_has = $state(false);
	let outside_has_map = new SvelteMap([[1, 1]]);
	const throw_has = $derived.by(() => {
		outside_has_map.has(1);
		outside_has_map.set(1, 2);
		return outside_has_map;
	});

	let inside_has = $state(false);
	const works_has = $derived.by(() => {
		let inside = new SvelteMap([[1, 1]]);
		inside.has(1);
		inside.set(1, 1);
		return inside;
	});

	let outside_get = $state(false);
	let outside_get_map = new SvelteMap([[1, 1]]);
	const throw_get = $derived.by(() => {
		outside_get_map.get(1);
		outside_get_map.set(1, 2);
		return outside_get_map;
	});

	let inside_get = $state(false);
	const works_get = $derived.by(() => {
		let inside = new SvelteMap([[1, 1]]);
		inside.get(1);
		inside.set(1, 1);
		return inside;
	});

	let outside_values = $state(false);
	let outside_values_map = new SvelteMap([[1, 1]]);
	const throw_values = $derived.by(() => {
		outside_values_map.values(1);
		outside_values_map.set(1, 2);
		return outside_values_map;
	});

	let inside_values = $state(false);
	const works_values = $derived.by(() => {
		let inside = new SvelteMap([[1, 1]]);
		inside.values();
		inside.set(1, 1);
		return inside;
	});
</script>

<button onclick={() => (outside_basic = true)}>external</button>
{#if outside_basic}
	{throw_basic}
{/if}
<button onclick={() => (inside_basic = true)}>internal</button>
{#if inside_basic}
	{works_basic}
{/if}

<button onclick={() => (outside_has = true)}>external</button>
{#if outside_has}
	{throw_has}
{/if}
<button onclick={() => (inside_has = true)}>internal</button>
{#if inside_has}
	{works_has}
{/if}

<button onclick={() => (outside_get = true)}>external</button>
{#if outside_get}
	{throw_get}
{/if}
<button onclick={() => (inside_get = true)}>internal</button>
{#if inside_get}
	{works_get}
{/if}

<button onclick={() => (outside_values = true)}>external</button>
{#if outside_values}
	{throw_values}
{/if}
<button onclick={() => (inside_values = true)}>internal</button>
{#if inside_values}
	{works_values}
{/if}
